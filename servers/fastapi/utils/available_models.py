from anthropic import AsyncAnthropic
from openai import AsyncOpenAI
from google import genai


async def list_available_openai_compatible_models(url: str, api_key: str) -> list[str]:
    client = AsyncOpenAI(api_key=api_key, base_url=url)
    models = (await client.models.list()).data
    if models:
        return list(map(lambda x: x.id, models))
    return []


async def list_available_anthropic_models(api_key: str) -> list[str]:
    client = AsyncAnthropic(api_key=api_key)
    return list(map(lambda x: x.id, (await client.models.list(limit=50)).data))


async def list_available_google_models(api_key: str) -> list[str]:
    client = genai.Client(api_key=api_key)
    return list(map(lambda x: x.name, client.models.list(config={"page_size": 50})))


async def list_available_gigachat_models(api_key: str) -> list[str]:
    import httpx
    from utils.gigachat_auth import get_gigachat_access_token_async
    
    access_token = await get_gigachat_access_token_async(api_key)
    if not access_token:
        return []
    
    # Создаем HTTP клиент без проверки SSL
    http_client = httpx.AsyncClient(verify=False)
    
    client = AsyncOpenAI(
        api_key=access_token,
        base_url="https://gigachat.devices.sberbank.ru/api/v1",
        http_client=http_client
    )
    
    try:
        models = (await client.models.list()).data
        if models:
            return list(map(lambda x: x.id, models))
    except Exception as e:
        print(f"Error listing GigaChat models: {e}")
    finally:
        await http_client.aclose()
    
    return []
