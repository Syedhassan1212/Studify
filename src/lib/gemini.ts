import { env } from "@/lib/env";

export type GeminiGenerateOptions = {
  system?: string;
  prompt: string;
  temperature?: number;
};

export async function generateGeminiText({
  system,
  prompt,
  temperature = 0.3,
}: GeminiGenerateOptions) {
  if (!env.geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${system ? `${system}\n\n` : ""}${prompt}` }],
          },
        ],
        generationConfig: {
          temperature,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return text.trim();
}

export async function embedGeminiText(input: string) {
  if (!env.geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiEmbeddingModel}:embedContent?key=${env.geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: {
          role: "user",
          parts: [{ text: input }],
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini embedding failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data?.embedding?.values ?? [];
}
