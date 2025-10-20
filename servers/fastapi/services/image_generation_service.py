import asyncio
import os
import aiohttp
from google import genai
from google.genai.types import GenerateContentConfig
from openai import AsyncOpenAI
from models.image_prompt import ImagePrompt
from models.sql.image_asset import ImageAsset
from utils.download_helpers import download_file
from utils.get_env import get_pexels_api_key_env
from utils.get_env import get_pixabay_api_key_env
from utils.get_env import get_kandinsky_api_key_env
from utils.image_provider import (
    is_pixels_selected,
    is_pixabay_selected,
    is_gemini_flash_selected,
    is_dalle3_selected,
    is_kandinsky_selected
)
import uuid
from fusionbrain_sdk_python import AsyncFBClient, PipelineType
import base64


class ImageGenerationService:

    def __init__(self, output_directory: str):
        self.output_directory = output_directory
        self.image_gen_func = self.get_image_gen_func()

    def get_image_gen_func(self):
        if is_pixabay_selected():
            return self.get_image_from_pixabay
        elif is_pixels_selected():
            return self.get_image_from_pexels
        elif is_gemini_flash_selected():
            return self.generate_image_google
        elif is_dalle3_selected():
            return self.generate_image_openai
        elif is_kandinsky_selected():
            return self.generate_image_kandinsky
        return None

    def is_stock_provider_selected(self):
        return is_pixels_selected() or is_pixabay_selected()

    async def generate_image(self, prompt: ImagePrompt) -> str | ImageAsset:
        """
        Generates an image based on the provided prompt.
        - If no image generation function is available, returns a placeholder image.
        - If the stock provider is selected, it uses the prompt directly,
        otherwise it uses the full image prompt with theme.
        - Output Directory is used for saving the generated image not the stock provider.
        """
        if not self.image_gen_func:
            print("No image generation function found. Using placeholder image.")
            return "/static/images/placeholder.jpg"

        image_prompt = prompt.get_image_prompt(
            with_theme=not self.is_stock_provider_selected()
        )
        print(f"Request - Generating Image for {image_prompt}")

        try:
            if self.is_stock_provider_selected():
                image_path = await self.image_gen_func(image_prompt)
            else:
                image_path = await self.image_gen_func(
                    image_prompt, self.output_directory
                )
            if image_path:
                if image_path.startswith("http"):
                    return image_path
                elif os.path.exists(image_path):
                    return ImageAsset(
                        path=image_path,
                        is_uploaded=False,
                        extras={
                            "prompt": prompt.prompt,
                            "theme_prompt": prompt.theme_prompt,
                        },
                    )
            raise Exception(f"Image not found at {image_path}")

        except Exception as e:
            print(f"Error generating image: {e}")
            return "/static/images/placeholder.jpg"

    async def generate_image_openai(self, prompt: str, output_directory: str) -> str:
        client = AsyncOpenAI()
        result = await client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            n=1,
            quality="standard",
            size="1024x1024",
        )
        image_url = result.data[0].url
        return await download_file(image_url, output_directory)

    async def generate_image_google(self, prompt: str, output_directory: str) -> str:
        client = genai.Client()
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash-image-preview",
            contents=[prompt],
            config=GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
        )

        for part in response.candidates[0].content.parts:
            if part.text is not None:
                print(part.text)
            elif part.inline_data is not None:
                image_path = os.path.join(output_directory, f"{uuid.uuid4()}.jpg")
                with open(image_path, "wb") as f:
                    f.write(part.inline_data.data)

        return image_path

    async def generate_image_kandinsky(self, prompt: str, output_directory: str) -> str:
        def save_base64_list(base64_list, uuid, out_dir="outputs", fmt="jpg"):
            import os
            os.makedirs(out_dir, exist_ok=True)
            saved_files = []
            for i, b64_str in enumerate(base64_list):
                image_data = base64.b64decode(b64_str)
                path = os.path.join(out_dir, f"image_{uuid}.{fmt}")
                with open(path, "wb") as f:
                    f.write(image_data)
                saved_files.append(path)
            return saved_files

        async_client = AsyncFBClient(x_key=get_kandinsky_api_key_env(), #'AAC7740E40E6623D3F6940F908B25D02'
                                     x_secret='2AEC252182C203D9EC6F6828F5BF50CD')

        pipelines = await async_client.get_pipelines_by_type(PipelineType.TEXT2IMAGE)
        text2image_pipeline = pipelines[0]  # Using the first available pipeline
        print(f"Using pipeline: {text2image_pipeline.name}")

        run_result = await async_client.run_pipeline(
            pipeline_id=text2image_pipeline.id,
            prompt=prompt,
            negative_prompt="blurry, cartoon, painting, low quality",
            style="infografics, realistic"
        )

        uuid = run_result.uuid
        print(f"Task started with UUID: {run_result.uuid}")
        final_status = await async_client.wait_for_completion(
            request_id=run_result.uuid,
            initial_delay=run_result.status_time
        )

        saved_files = ''
        if final_status.status == 'DONE':
            files = final_status.result.files
            saved_files = save_base64_list(files, uuid, out_dir=output_directory)
            # print("Kandinsky saved:", saved_files)
        else:
            print(f"Generation failed with status: {final_status.status}")

        # print('saved_files: ', saved_files)
        return saved_files[0]

    async def get_image_from_pexels(self, prompt: str) -> str:
        async with aiohttp.ClientSession(trust_env=True) as session:
            response = await session.get(
                f"https://api.pexels.com/v1/search?query={prompt}&per_page=1",
                headers={"Authorization": f"{get_pexels_api_key_env()}"},
            )
            data = await response.json()
            image_url = data["photos"][0]["src"]["large"]
            return image_url

    async def get_image_from_pixabay(self, prompt: str) -> str:
        async with aiohttp.ClientSession(trust_env=True) as session:
            response = await session.get(
                f"https://pixabay.com/api/?key={get_pixabay_api_key_env()}&q={prompt}&image_type=photo&per_page=3"
            )
            data = await response.json()
            image_url = data["hits"][0]["largeImageURL"]
            return image_url
