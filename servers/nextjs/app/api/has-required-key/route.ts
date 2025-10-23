import { NextResponse } from "next/server";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  const userConfigPath = process.env.USER_CONFIG_PATH;

  let openaiKeyFromFile = "";
  let googleKeyFromFile = "";
  let llmFromFile = "";

  if (userConfigPath && fs.existsSync(userConfigPath)) {
    try {
      const raw = fs.readFileSync(userConfigPath, "utf-8");
      const cfg = JSON.parse(raw || "{}");
      openaiKeyFromFile = cfg?.OPENAI_API_KEY || "";
      googleKeyFromFile = cfg?.GOOGLE_API_KEY || "";
      llmFromFile = cfg?.LLM || "";
    } catch {}
  }

  const openaiKeyFromEnv = process.env.OPENAI_API_KEY || "";
  const googleKeyFromEnv = process.env.GOOGLE_API_KEY || "";
  const llmFromEnv = process.env.LLM || "";

  const openaiKey = (openaiKeyFromFile || openaiKeyFromEnv).trim();
  const googleKey = (googleKeyFromFile || googleKeyFromEnv).trim();
  const selectedLLM = (llmFromFile || llmFromEnv).trim();

  // Check if we have a key for the selected LLM or any key at all
  const hasKey = (selectedLLM === 'google' && Boolean(googleKey)) ||
                 (selectedLLM === 'openai' && Boolean(openaiKey)) ||
                 Boolean(openaiKey || googleKey);

  return NextResponse.json({
    hasKey,
    llm: selectedLLM || (openaiKey ? 'openai' : googleKey ? 'google' : '')
  });
} 