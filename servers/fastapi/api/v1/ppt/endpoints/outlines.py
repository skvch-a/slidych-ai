import asyncio
import json
import math
import traceback
import uuid
import dirtyjson
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from models.presentation_outline_model import PresentationOutlineModel
from models.sql.presentation import PresentationModel
from models.sse_response import (
    SSECompleteResponse,
    SSEErrorResponse,
    SSEResponse,
    SSEStatusResponse,
)
from services.temp_file_service import TEMP_FILE_SERVICE
from services.database import get_async_session
from services.documents_loader import DocumentsLoader
from utils.llm_calls.generate_presentation_outlines import generate_ppt_outline
from utils.ppt_utils import get_presentation_title_from_outlines
from services.document_processing_service import DOCUMENT_PROCESSING_SERVICE

OUTLINES_ROUTER = APIRouter(prefix="/outlines", tags=["Outlines"])


@OUTLINES_ROUTER.get("/stream/{id}")
async def stream_outlines(
    id: uuid.UUID, sql_session: AsyncSession = Depends(get_async_session)
):
    presentation = await sql_session.get(PresentationModel, id)

    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")

    temp_dir = TEMP_FILE_SERVICE.create_temp_dir()

    async def inner():
        retriever = None
        yield SSEStatusResponse(
            status="Generating presentation outlines..."
        ).to_string()

        additional_context = ""
        if presentation.file_paths:
            yield SSEStatusResponse(status="Processing documents...").to_string()
            documents_loader = DocumentsLoader(file_paths=presentation.file_paths)
            await documents_loader.load_documents(temp_dir)
            documents = documents_loader.documents
            if documents:
                retriever = DOCUMENT_PROCESSING_SERVICE.get_retriever(presentation.id)
                yield SSEStatusResponse(status="Documents processed, generating outlines...").to_string()

        presentation_outlines_text = ""

        n_slides_to_generate = presentation.n_slides
        if presentation.include_table_of_contents:
            needed_toc_count = math.ceil((presentation.n_slides - 1) / 10)
            n_slides_to_generate -= math.ceil(
                (presentation.n_slides - needed_toc_count) / 10
            )

        async for chunk in generate_ppt_outline(
            presentation.content,
            n_slides_to_generate,
            presentation.language,
            retriever,
            presentation.tone,
            presentation.verbosity,
            presentation.instructions,
            presentation.include_title_slide,
            presentation.web_search,
        ):
            # Give control to the event loop
            await asyncio.sleep(0)

            if isinstance(chunk, HTTPException):
                yield SSEErrorResponse(detail=chunk.detail).to_string()
                return

            yield SSEResponse(
                event="response",
                data=json.dumps({"type": "chunk", "chunk": chunk}),
            ).to_string()

            presentation_outlines_text += chunk
            
        # Логируем полный ответ для отладки
        print("=== Full response from AI ===")
        print(presentation_outlines_text)
        print("=============================")

        # Проверяем, что ответ не пустой
        if not presentation_outlines_text.strip():
            raise ValueError("Empty response received from the AI")

        try:
            # Пробуем распарсить как чистый JSON
            try:
                presentation_outlines_json = json.loads(presentation_outlines_text)
                print("Successfully parsed as standard JSON")
            except json.JSONDecodeError as je:
                print("Standard JSON parse failed, trying dirtyjson...")
                # Если не получилось, пробуем dirtyjson
                try:
                    presentation_outlines_json = dict(dirtyjson.loads(presentation_outlines_text))
                    print("Successfully parsed with dirtyjson")
                except Exception as e:
                    # Логируем ошибку для отладки
                    print("=== Failed to parse response as JSON ===")
                    print("Raw response length:", len(presentation_outlines_text))
                    print("First 500 chars:", presentation_outlines_text[:500])
                    print("Error:", str(e))
                    print("=======================================")
                    raise ValueError(f"Failed to parse AI response: {str(e)}")
                    
            if not isinstance(presentation_outlines_json, dict):
                print("Response is not a dictionary:", type(presentation_outlines_json))
                print("Content:", presentation_outlines_json)
                raise ValueError("Expected a dictionary in the response")
                
        except Exception as e:
            traceback.print_exc()
            yield SSEErrorResponse(
                detail=f"Failed to parse presentation outlines. The AI returned malformed data. Please try again. Error: {str(e)}",
            ).to_string()
            return

        try:
            print("=== Attempting to validate with PresentationOutlineModel ===")
            print("JSON structure:", json.dumps(presentation_outlines_json, indent=2, ensure_ascii=False))
            presentation_outlines = PresentationOutlineModel(**presentation_outlines_json)
        except Exception as validation_error:
            print("=== Validation Error ===")
            print("Error:", str(validation_error))
            print("=====================")
            yield SSEErrorResponse(
                detail=f"Failed to validate presentation outlines: {str(validation_error)}",
            ).to_string()
            return

        presentation_outlines.slides = presentation_outlines.slides[
            :n_slides_to_generate
        ]

        presentation.outlines = presentation_outlines.model_dump()
        presentation.title = get_presentation_title_from_outlines(presentation_outlines)

        sql_session.add(presentation)
        await sql_session.commit()

        yield SSECompleteResponse(
            key="presentation", value=presentation.model_dump(mode="json")
        ).to_string()

    return StreamingResponse(inner(), media_type="text/event-stream")
