import uuid

import chromadb
from langchain_core.documents.base import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.retrievers import BaseRetriever
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .db_clients import chroma_client


class DocumentProcessingService:
    """
    Сервис для обработки и индексации документов с использованием LangChain и ChromaDB.
    Отвечает за весь RAG-пайплайн: чанкинг, эмбеддинги, хранение и извлечение.
    """

    def __init__(self, collection_prefix: str = "docs"):
        """
        Инициализирует сервис.
        - `collection_prefix`: Префикс для имен коллекций в ChromaDB, чтобы отделить
          коллекции документов от других (например, от иконок).
        """
        # Подключаемся к локальной, персистентной ChromaDB. Файлы будут храниться в папке `chroma`.
        self.client = chroma_client

        # Инициализируем модель для создания эмбеддингов.
        # 'sentence-transformers/all-MiniLM-L6-v2' - это популярная и легковесная модель,
        # которая хорошо работает для семантического поиска. Она будет скачана и закеширована в 'chroma/models'.
        self.embedding_function = HuggingFaceEmbeddings(
            model_name='sentence-transformers/all-MiniLM-L6-v2',
            cache_folder='chroma/models'
        )

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,  # Максимальный размер одного чанка в символах.
            chunk_overlap=200,  # Количество символов, которыми соседние чанки будут пересекаться.
            # Это помогает сохранить контекст на стыках.
            length_function=len
        )
        self.collection_prefix = collection_prefix

    def get_collection_name(self, presentation_id: uuid.UUID) -> str:
        """
        Генерирует уникальное, изолированное имя коллекции для каждой сессии генерации презентации.
        Это гарантирует, что документы из разных сессий не будут смешиваться.
        """
        return f"{self.collection_prefix}-{str(presentation_id)}"

    def create_vectorstore(self, presentation_id: uuid.UUID, documents_text: list[str]) -> Chroma | None:
        """
        Основной метод для индексации документов.
        Принимает ID презентации и список текстов документов.
        Создает (или перезаписывает) векторное хранилище.
        """
        collection_name = self.get_collection_name(presentation_id)

        # Преобразуем сырые текстовые строки в объекты `Document` - стандартный формат LangChain.
        docs = [Document(page_content=text) for text in documents_text]

        if not docs:
            return None

        # Разбиваем `Document` объекты на более мелкие чанки.
        all_splits = self.text_splitter.split_documents(docs)

        if not all_splits:
            return None

        # Главная магия LangChain. Эта одна команда выполняет все шаги:
        # 1. Если коллекция `collection_name` существует, она удаляется.
        # 2. Создается новая пустая коллекция.
        # 3. Для каждого чанка из `all_splits` вычисляется эмбеддинг с помощью `self.embedding_function`.
        # 4. Пары (текст чанка + его эмбеддинг) сохраняются в ChromaDB в указанную коллекцию.
        vectorstore = Chroma.from_documents(
            documents=all_splits,
            embedding=self.embedding_function,
            client=self.client,
            collection_name=collection_name,
        )
        return vectorstore

    def get_retriever(self, presentation_id: uuid.UUID) -> BaseRetriever | None:
        """
        Получает "извлекатель" (retriever) для уже проиндексированных документов.
        Retriever - это объект, который умеет выполнять семантический поиск.
        """
        collection_name = self.get_collection_name(presentation_id)

        # Проверяем, существует ли вообще такая коллекция.
        # Это нужно на случай, если документы не были загружены, но код пытается получить retriever.
        if not any(c.name == collection_name for c in self.client.list_collections()):
            return None

        # Создаем объект `Chroma`, который "смотрит" на уже существующую коллекцию.
        vectorstore = Chroma(
            client=self.client,
            collection_name=collection_name,
            embedding_function=self.embedding_function,
        )

        return vectorstore.as_retriever(search_kwargs={"k": 5})

    def cleanup(self, presentation_id: uuid.UUID):
        """
        Очищает (удаляет) коллекцию, связанную с сессией презентации.
        Это важно вызывать в конце, чтобы не накапливать мусорные данные.
        """
        collection_name = self.get_collection_name(presentation_id)
        try:
            self.client.delete_collection(name=collection_name)
        except ValueError:
            # Ошибки не будет, если коллекции и так не было. Просто игнорируем.
            pass


# Создаем единственный экземпляр (синглтон) этого сервиса,
# который будет использоваться во всем приложении.
DOCUMENT_PROCESSING_SERVICE = DocumentProcessingService()