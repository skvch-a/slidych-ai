"use client";
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Switch } from "./ui/switch";

interface CustomConfigProps {
  customLlmUrl: string;
  customLlmApiKey: string;
  customModel: string;
  toolCalls: boolean;
  disableThinking: boolean;
  onInputChange: (value: string | boolean, field: string) => void;
}

export default function CustomConfig({
  customLlmUrl,
  customLlmApiKey,
  customModel,
  toolCalls,
  disableThinking,
  onInputChange,
}: CustomConfigProps) {
  const [customModels, setCustomModels] = useState<string[]>([]);
  const [customModelsLoading, setCustomModelsLoading] = useState(false);
  const [customModelsChecked, setCustomModelsChecked] = useState(false);
  const [openModelSelect, setOpenModelSelect] = useState(false);
  const [url, setUrl] = useState(customLlmUrl);
  const [apiKey, setApiKey] = useState(customLlmApiKey);

  useEffect(() => {
    setCustomModels([]);
    setCustomModelsChecked(false);
    onInputChange("", "custom_model");
  }, [url, apiKey]);

  const onUrlChange = (value: string) => {
    setUrl(value);
    onInputChange(value, "custom_llm_url");
  };

  const onApiKeyChange = (value: string) => {
    setApiKey(value);
    onInputChange(value, "custom_llm_api_key");
  };

  const fetchCustomModels = async () => {
    if (!customLlmUrl) return;

    try {
      setCustomModelsLoading(true);
      const response = await fetch("/api/v1/ppt/openai/models/available", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: customLlmUrl,
          api_key: customLlmApiKey,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCustomModels(data);
        setCustomModelsChecked(true);
      } else {
        console.error('Failed to fetch custom models');
        setCustomModels([]);
        setCustomModelsChecked(true);
        toast.error('Failed to fetch custom models');
      }
    } catch (error) {
      console.error('Error fetching custom models:', error);
      toast.error('Error fetching custom models');
      setCustomModels([]);
      setCustomModelsChecked(true);
    } finally {
      setCustomModelsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          OpenAI-совместимый URL
        </label>
        <div className="relative">
          <input
            type="text"
            required
            placeholder="Enter your URL"
            className="w-full px-4 py-2.5 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            value={customLlmUrl}
            onChange={(e) => onUrlChange(e.target.value)}
          />
        </div>
      </div>

      {/* API Key Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          OpenAI-совместимый ключ API
        </label>
        <div className="relative">
          <input
            type="text"
            required
            placeholder="Enter your API Key"
            className="w-full px-4 py-2.5 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            value={customLlmApiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
          />
        </div>
      </div>

      {/* Check for available models button - show when no models checked or no models found */}
      {(!customModelsChecked || (customModelsChecked && customModels.length === 0)) && (
        <div className="mb-4">
          <button
            onClick={fetchCustomModels}
            disabled={customModelsLoading || !customLlmUrl}
            className={`w-full py-2.5 px-4 rounded-lg transition-all duration-200 border-2 ${customModelsLoading || !customLlmUrl
              ? "bg-gray-100 border-gray-300 cursor-not-allowed text-gray-500"
              : "bg-white border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500/20"
              }`}
          >
            {customModelsLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Проверка моделей...
              </div>
            ) : (
              "Проверить наличие моделей"
            )}
          </button>
        </div>
      )}

      {/* Show message if no models found */}
      {customModelsChecked && customModels.length === 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Модели не найдены. Пожалуйста, проверьте, валидный ли Ваш API ключ и имеет ли он доступ к списку моделей.
          </p>
        </div>
      )}

      {/* Model selection dropdown - only show if models are available */}
      {customModelsChecked && customModels.length > 0 && (
        <div className="mb-4">
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Важно:</strong> Будут работать только те модели, которые поддерживают 
              вызовы функций (Tool Calls) или JSON схему ответа
            </p>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Выберите модель
          </label>
          <div className="w-full">
            <Popover
              open={openModelSelect}
              onOpenChange={setOpenModelSelect}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openModelSelect}
                  className="w-full h-12 px-4 py-4 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors hover:border-gray-400 justify-between"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {customModel || "Выберите модель"}
                  </span>
                  <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0"
                align="start"
                style={{ width: "var(--radix-popover-trigger-width)" }}
              >
                <Command>
                  <CommandInput placeholder="Найти модель..." />
                  <CommandList>
                    <CommandEmpty>Модель не найдена</CommandEmpty>
                    <CommandGroup>
                      {customModels.map((model, index) => (
                        <CommandItem
                          key={index}
                          value={model}
                          onSelect={(value) => {
                            onInputChange(value, "custom_model");
                            setOpenModelSelect(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              customModel === model
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {model}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Tool Calls Toggle */}
      <div>
        <div className="flex items-center justify-between mb-4 bg-green-50 p-2 rounded-sm">
          <label className="text-sm font-medium text-gray-700">
            Использовать функцию Tool Calls
          </label>
          <Switch
            checked={toolCalls}
            onCheckedChange={(checked) => onInputChange(checked, "tool_calls")}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
          <span className="block w-1 h-1 rounded-full bg-gray-400"></span>
          Включите, если модель не поддерживает JSON схему для структурированного ответа
        </p>
      </div>
      {/* Disable Thinking Toggle */}
      <div>
        <div className="flex items-center justify-between mb-4 bg-green-50 p-2 rounded-sm">
          <label className="text-sm font-medium text-gray-700">
            Отключить размышления
          </label>
          <Switch
            checked={disableThinking}
            onCheckedChange={(checked) => onInputChange(checked, "disable_thinking")}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
          <span className="block w-1 h-1 rounded-full bg-gray-400"></span>
          Включите, чтобы не использовать режим размышления у модели (thinking mode)
        </p>
      </div>
    </div >
  );
} 