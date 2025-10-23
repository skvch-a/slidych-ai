# slidych-ai/servers/fastapi/utils/langchain_integration.py

from langchain_core.language_models.llms import LLM
from langchain_core.callbacks.manager import AsyncCallbackManagerForLLMRun
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain_core.output_parsers import StrOutputParser
from langchain_core.shema import BaseRetriever
from typing import Any, List, Optional
import asyncio

from services.llm_client import LLMClient
from models.llm_message import LLMSystemMessage, LLMUserMessage
from utils.llm_provider import get_model


class CustomLLM(LLM):
    """Кастомная обертка для нашего LLMClient, совместимая с LangChain."""

    @property
    def _llm_type(self) -> str:
        return "custom_slidych_llm"

    async def _acall(
            self,
            prompt: str,
            stop: Optional[List[str]] = None,
            run_manager: Optional[AsyncCallbackManagerForLLMRun] = None,
            **kwargs: Any,
    ) -> str:
        """Асинхронный вызов нашей модели. LangChain использует это для простых LLM."""
        client = LLMClient()
        model = get_model()

        # Это простой вызов, поэтому можно использовать базовые сообщения.
        # Для более сложных сценариев (с чат-историей) понадобится ChatLLM.
        messages = [
            LLMSystemMessage(content="You are a helpful assistant."),
            LLMUserMessage(content=prompt)
        ]

        response = await client.generate(
            model=model,
            messages=messages,
            max_tokens=kwargs.get("max_tokens", 4000)
        )
        return response

    @property
    def _identifying_params(self) -> dict[str, Any]:
        """Возвращает идентификационные параметры LLM."""
        return {"model": get_model(), "provider": LLMClient().llm_provider.value}


# --- RAG Chains ---

# Создаем экземпляр нашего кастомного LLM
slidych_llm = CustomLLM()


def create_rag_chain(retriever: BaseRetriever, system_prompt: str, user_prompt_template: str):
    """
    Создает RAG-цепочку с использованием LangChain Expression Language (LCEL).
    Это современный и гибкий способ построения цепочек.
    """
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", user_prompt_template),
    ])

    def format_docs(docs):
        return "\n\n---\n\n".join(doc.page_content for doc in docs)

    # LCEL-цепочка
    rag_chain = (
            RunnableParallel(
                # "context" будет заполнен результатом retriever'а, "question" - просто пробрасывается дальше
                {"context": retriever | format_docs, "question": RunnablePassthrough()}
            )
            | prompt
            | slidych_llm
            | StrOutputParser()
    )

    return rag_chain