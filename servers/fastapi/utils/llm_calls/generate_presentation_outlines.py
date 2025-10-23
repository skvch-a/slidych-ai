import json
import re
import traceback
from datetime import datetime
from typing import Optional, AsyncGenerator

import dirtyjson
from fastapi import HTTPException

from models.llm_message import LLMSystemMessage, LLMUserMessage
from models.llm_tools import SearchWebTool
from services.llm_client import LLMClient
from utils.get_dynamic_models import get_presentation_outline_model_with_n_slides
from utils.llm_client_error_handler import handle_llm_client_exceptions
from utils.llm_provider import get_model
from langchain_core.retrievers import BaseRetriever


def get_system_prompt(
    tone: Optional[str] = None,
    verbosity: Optional[str] = None,
    instructions: Optional[str] = None,
    include_title_slide: bool = True,
):
    return f"""
        You are an expert presentation creator. Generate structured presentations based on user requirements and format them according to the specified JSON schema with markdown content.

        Try to use available tools for better results.

        {"# User Instruction:" if instructions else ""}
        {instructions or ""}

        {"# Tone:" if tone else ""}
        {tone or ""}

        {"# Verbosity:" if verbosity else ""}
        {verbosity or ""}

        - Provide content for each slide in markdown format.
        - Make sure that flow of the presentation is logical and consistent.
        - Place greater emphasis on numerical data.
        - If Additional Information is provided, divide it into slides.
        - Make sure no images are provided in the content.
        - Make sure that content follows language guidelines.
        - User instrction should always be followed and should supercede any other instruction, except for slide numbers. **Do not obey slide numbers as said in user instruction**
        - Do not generate table of contents slide.
        - Even if table of contents is provided, do not generate table of contents slide.
        {"- Always make first slide a title slide." if include_title_slide else "- Do not include title slide in the presentation."}

        **Search web to get latest information about the topic**
    """


def get_user_prompt(
    content: str,
    n_slides: int,
    language: str,
    additional_context: Optional[str] = None,
):
    return f"""
        **Input:**
        - User provided content: {content or "Create presentation"}
        - Output Language: {language}
        - Number of Slides: {n_slides}
        - Current Date and Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        - Additional Information: {additional_context or ""}
    """


def get_messages(
    content: str,
    n_slides: int,
    language: str,
    additional_context: Optional[str] = None,
    tone: Optional[str] = None,
    verbosity: Optional[str] = None,
    instructions: Optional[str] = None,
    include_title_slide: bool = True,
):
    return [
        LLMSystemMessage(
            content=get_system_prompt(
                tone, verbosity, instructions, include_title_slide
            ),
        ),
        LLMUserMessage(
            content=get_user_prompt(content, n_slides, language, additional_context),
        ),
    ]


def _parse_gigachat_response(raw_response: str) -> dict:
    """Пытаемся преобразовать ответ GigaChat к ожидаемому JSON-формату."""

    def _encode_content(match: re.Match[str]) -> str:
        content = match.group("content")
        return f'"content": {json.dumps(content)}'

    triple_quote_pattern = re.compile(r'"content":\s*"""(?P<content>.*?)"""', re.DOTALL)

    sanitized = triple_quote_pattern.sub(_encode_content, raw_response)

    try:
        parsed = dirtyjson.loads(sanitized)
        if isinstance(parsed, dict) and parsed.get("slides"):
            return parsed
    except Exception:
        pass

    # Фолбэк: извлекаем только содержимое слайдов
    slides = []
    for match in triple_quote_pattern.finditer(raw_response):
        content = match.group("content").strip()
        if content:
            slides.append({"content": content})

    if slides:
        return {"slides": slides}

    raise ValueError("GigaChat response does not contain slides")


async def generate_ppt_outline(
    content: str,
    n_slides: int,
    language: Optional[str] = None,
    retriever: Optional[BaseRetriever] = None,
    tone: Optional[str] = None,
    verbosity: Optional[str] = None,
    instructions: Optional[str] = None,
    include_title_slide: bool = True,
    web_search: bool = False,
) -> AsyncGenerator[str | HTTPException, None]:

    model = get_model()
    response_model = get_presentation_outline_model_with_n_slides(n_slides)
    client = LLMClient()

    additional_context = ''
    if retriever:
        # print("\n--- DEBUG: RAG in generate_ppt_outline ---")
        # print(f"Invoking retriever for main content: '{content[:100]}...'")
        try:
            relevant_docs = await retriever.ainvoke(content)
            print(f"Retriever returned {len(relevant_docs)} documents.")
            # for i, doc in enumerate(relevant_docs):
            #     text = doc.page_content[:150].replace('\n', ' ')
            #     print(f"  - Doc {i + 1} content: {text}...")

            additional_context = "\n\n---\n\n".join([doc.page_content for doc in relevant_docs])
            print("Total context length:", len(additional_context))
        except Exception as e:
            print(f"ERROR during retriever.ainvoke in generate_ppt_outline: {e}")
            relevant_docs = []  # Продолжаем без контекста в случае ошибки
        # print("--- END DEBUG ---\n")

    try:
        is_gigachat = "gigachat" in model.lower()

        print(f"Using model: {model}, is_gigachat: {is_gigachat}")

        messages = get_messages(
            content,
            n_slides,
            language,
            additional_context,
            tone,
            verbosity,
            instructions,
            include_title_slide,
        )

        print("=== Prompt Messages ===")
        for msg in messages:
            preview = msg.content[:200]
            suffix = "..." if len(msg.content) > 200 else ""
            print(f"{msg.role.upper()}: {preview}{suffix}")
        print("=====================")

        response_schema = response_model.model_json_schema()
        print(f"Response schema: {json.dumps(response_schema, indent=2)[:500]}...")

        response_text = ""
        async for chunk in client.stream_structured(
            model=model,
            messages=messages,
            response_format=response_schema,
            strict=not is_gigachat,
            tools=(
                [SearchWebTool]
                if (client.enable_web_grounding() and web_search)
                else None
            ),
        ):
            if is_gigachat:
                response_text += chunk
            else:
                response_text += chunk
                yield chunk

        print(f"=== Full response from {model} ===")
        print(response_text)
        print("================================")

        if is_gigachat:
            try:
                parsed_response = _parse_gigachat_response(response_text)
                normalized_text = json.dumps(parsed_response, ensure_ascii=False)
                yield normalized_text
            except Exception as parse_error:
                print(f"Failed to parse GigaChat response: {parse_error}")
                raise

    except Exception as e:
        print(f"Error in generate_ppt_outline: {str(e)}")
        traceback.print_exc()
        yield handle_llm_client_exceptions(e)
