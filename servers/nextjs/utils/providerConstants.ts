export interface ModelOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  size: string;
}

export interface ImageProviderOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  requiresApiKey?: boolean;
  apiKeyField?: string;
  apiKeyFieldLabel?: string;
}

export interface LLMProviderOption {
  value: string;
  label: string;
  description?: string;
  model_value?: string;
  model_label?: string;
}

export const IMAGE_PROVIDERS: Record<string, ImageProviderOption> = {
  pexels: {
    value: "pexels",
    label: "Pexels",
    description: "Бесплатная платформа со стоковыми изображениями и видео",
    icon: "/icons/pexels.png",
    requiresApiKey: true,
    apiKeyField: "PEXELS_API_KEY",
    apiKeyFieldLabel: "Pexels API ключ"
  },
  pixabay: {
    value: "pixabay",
    label: "Pixabay",
    description: "Бесплатная платформа для поиска и скачивания изображений, видео и музыки",
    icon: "/icons/pixabay.png",
    requiresApiKey: true,
    apiKeyField: "PIXABAY_API_KEY",
    apiKeyFieldLabel: "Pixabay API ключ"
  },
  "dall-e-3": {
    value: "dall-e-3",
    label: "DALL-E 3",
    description: "Последняя модель OpenAI для генерации изображений",
    icon: "/icons/dall-e.png",
    requiresApiKey: true,
    apiKeyField: "OPENAI_API_KEY",
    apiKeyFieldLabel: "OpenAI API ключ"
  },
  gemini_flash: {
    value: "gemini_flash",
    label: "Gemini Flash",
    description: "Основная модель для генерации изображений от Google",
    icon: "/icons/google.png",
    requiresApiKey: true,
    apiKeyField: "GOOGLE_API_KEY",
    apiKeyFieldLabel: "Google API ключ"
  },
  Kandinsky: {
    value: "Kandinsky",
    label: "Kandinsky",
    description: "Модель для генерации изображений от компании СБЕР",
    icon: "/icons/kandinsky.png",
    requiresApiKey: true,
    apiKeyField: "KANDINSKY_API_KEY",
    apiKeyFieldLabel: "Kandinsky API ключ"
  },
};

export const LLM_PROVIDERS: Record<string, LLMProviderOption> = {
  openai: {
    value: "openai",
    label: "OpenAI",
    description: "OpenAI's latest text generation model",
  },
  google: {
    value: "google",
    label: "Google",
    description: "Google's primary text generation model",
  },
  anthropic: {
    value: "anthropic",
    label: "Anthropic",
    description: "Anthropic's Claude models",
  },
  ollama: {
    value: "ollama",
    label: "Ollama",
    description: "Ollama's primary text generation model",
  },
  custom: {
    value: "custom",
    label: "Custom",
    description: "Custom LLM",
  },
}; 