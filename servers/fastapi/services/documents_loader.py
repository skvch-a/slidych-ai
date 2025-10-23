import mimetypes
from fastapi import HTTPException
import os, asyncio
from typing import List, Tuple
import pdfplumber

from constants.documents import (
    PDF_MIME_TYPES,
    POWERPOINT_TYPES,
    TEXT_MIME_TYPES,
    WORD_TYPES,
)
from services.docling_service import DoclingService


class DocumentsLoader:

    def __init__(self, file_paths: List[str]):
        self._file_paths = file_paths
        self.docling_service = DoclingService()
        self._documents: List[str] = []
        self._images: List[List[str]] = []

    @property
    def documents(self):
        return self._documents

    @property
    def images(self):
        return self._images

    async def load_documents(
        self,
        temp_dir: str,
        load_text: bool = True,
        load_images: bool = False,
    ):
        documents: List[str] = []
        images: List[str] = []

        for file_path in self._file_paths:
            if not os.path.exists(file_path):
                raise HTTPException(
                    status_code=404, detail=f"File {file_path} not found"
                )

            document = ""
            imgs = []

            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type in PDF_MIME_TYPES:
                document, imgs = await self.load_pdf(
                    file_path, load_text, load_images, temp_dir
                )
            elif mime_type in TEXT_MIME_TYPES:
                document = await self.load_text(file_path)
            elif mime_type in POWERPOINT_TYPES:
                document = self.load_powerpoint(file_path)
            elif mime_type in WORD_TYPES:
                document = self.load_msword(file_path)
            else:
                print(f"Warning: Unsupported file type '{mime_type}' for file {file_path}. Skipping.")
                document = ""


            documents.append(document)
            images.append(imgs)

        self._documents = [doc for doc in documents if doc]
        self._images = images

    async def load_pdf(
        self,
        file_path: str,
        load_text: bool,
        load_images: bool,
        temp_dir: str,
    ) -> Tuple[str, List[str]]:
        image_paths = []
        document: str = ""

        if load_text:
            document = await self.get_text_from_pdf_async(file_path)

        if load_images:
            image_paths = await self.get_page_images_from_pdf_async(file_path, temp_dir)

        return document, image_paths

    async def load_text(self, file_path: str) -> str:
        with open(file_path, "r", encoding='utf-8', errors='ignore') as file:
            return await asyncio.to_thread(file.read)

    def load_msword(self, file_path: str) -> str:
        try:
            return self.docling_service.parse_to_markdown(file_path)
        except Exception as e:
            print(f"Failed to process DOCX {file_path} with docling: {e}")
            return ""

    def load_powerpoint(self, file_path: str) -> str:
        try:
            return self.docling_service.parse_to_markdown(file_path)
        except Exception as e:
            print(f"Failed to process PPTX {file_path} with docling: {e}")
            return ""

    @classmethod
    def get_text_from_pdf(cls, file_path: str) -> str:
        """Извлекает весь текст из PDF-файла с помощью pdfplumber."""
        try:
            with pdfplumber.open(file_path) as pdf:
                full_text = []
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        full_text.append(page_text)
                return "\n\n".join(full_text)
        except Exception as e:
            print(f"Could not extract text from PDF {file_path} using pdfplumber. Error: {e}")
            return ""

    @classmethod
    async def get_text_from_pdf_async(cls, file_path: str) -> str:
        """Асинхронная обертка для get_text_from_pdf."""
        return await asyncio.to_thread(cls.get_text_from_pdf, file_path)

    @classmethod
    def get_page_images_from_pdf(cls, file_path: str, temp_dir: str) -> List[str]:
        try:
            with pdfplumber.open(file_path) as pdf:
                images = []
                for page in pdf.pages:
                    img = page.to_image(resolution=150)
                    image_path = os.path.join(temp_dir, f"page_{page.page_number}.png")
                    img.save(image_path)
                    images.append(image_path)
                return images
        except Exception as e:
            print(f"Could not extract images from PDF {file_path}. Error: {e}")
            return []

    @classmethod
    async def get_page_images_from_pdf_async(cls, file_path: str, temp_dir: str):
        return await asyncio.to_thread(
            cls.get_page_images_from_pdf, file_path, temp_dir
        )