import React from "react";

import UploadPage from "./components/UploadPage";
import Header from "@/app/(presentation-generator)/dashboard/components/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Слайдыч | AI-ассистент для генерации презентаций",
  description: "AI-ассистент для генерации презентаций с возможностью добавления шаблонов, поддержкой нескольких моделей (OpenAI, Gemini, Ollama) и экспортом результата в PDF/PPTX формате.",
  alternates: {
    canonical: "https://slidych.ai/create",
  },
  keywords: [
    "presentation generator",
    "AI presentations",
    "data visualization",
    "automatic presentation maker",
    "professional slides",
    "data-driven presentations",
    "document to presentation",
    "presentation automation",
    "smart presentation tool",
    "business presentations",
  ],
  openGraph: {
    title: "Создание презентации | Слайдыч",
    description: "AI-ассистент для генерации презентаций с возможностью добавления шаблонов, поддержкой нескольких моделей (OpenAI, Gemini, Ollama) и экспортом результата в PDF/PPTX формате.",
    type: "website",
    url: "https://slidych.ai/create",
    siteName: "Slidych",
  },
  twitter: {
    card: "summary_large_image",
    title: "Создание презентации | Слайдыч",
    description: "AI-ассистент для генерации презентаций с возможностью добавления шаблонов, поддержкой нескольких моделей (OpenAI, Gemini, Ollama) и экспортом результата в PDF/PPTX формате.",
    site: "@slidych_ai",
    creator: "@slidych_ai",
  },
};

const page = () => {
  return (
    <div className="relative">
      <Header />
      <div className="flex flex-col items-center justify-center  py-8">
        <h1 className="text-3xl font-semibold font-instrument_sans">
          Создание презентации
        </h1>
        {/* <p className='text-sm text-gray-500'>We will generate a presentation for you</p> */}
      </div>

      <UploadPage />
    </div>
  );
};

export default page;
