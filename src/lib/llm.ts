export type Prompt = {
  system?: string;
  user: string;
};

// Mock mode returns this sample note (from a different, fictional visit) so you can
// work on the UI without an API key. Set LLM_PROVIDER in .env.local to call a real model.
const MOCK_RESPONSE = `CHIEF COMPLAINT
Itchy rash on both forearms for 5 days. (MOCK RESPONSE)

HISTORY OF PRESENT ILLNESS
Rash started after gardening. No fever. Tried an over-the-counter hydrocortisone cream with little effect.

CURRENT MEDICATIONS
None

ALLERGIES
Not mentioned

VITALS AND EXAM
Red, raised, linear rash on both forearms. No blisters, no signs of infection.

ASSESSMENT
Contact dermatitis, likely plant-related.

PLAN
Betamethasone 0.1% cream twice a day for 7 days. Cetirizine 10 mg once a day at night for itch. Wear gloves when gardening.

FOLLOW-UP
Return in 2 weeks if not improved.

PATIENT SUMMARY
You have a skin reaction, most likely from a plant in your garden. Use the cream twice a day for one week and take the allergy tablet at night to help with the itch. Wear gloves when you garden. Come back in 2 weeks if the rash has not improved.`;

export async function complete(prompt: Prompt): Promise<string> {
  if (process.env.LLM_PROVIDER === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return MOCK_RESPONSE;
  }
  if (process.env.LLM_PROVIDER === "anthropic") return callAnthropic(prompt);
  if (process.env.LLM_PROVIDER === "openai") return callOpenAICompatible(prompt);
  if (process.env.LLM_PROVIDER === "gemini") return callGemini(prompt);
  throw new Error(`Unknown LLM_PROVIDER: ${process.env.LLM_PROVIDER}`);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

async function callGemini(prompt: Prompt): Promise<string> {
  const model = requireEnv("LLM_MODEL");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": requireEnv("GEMINI_API_KEY"),
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt.user }] }],
        ...(prompt.system ? { systemInstruction: { parts: [{ text: prompt.system }] } } : {}),
        generationConfig: { temperature: 0 },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const candidate = data.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== "STOP") {
    throw new Error(`Gemini did not complete the note: ${candidate.finishReason}`);
  }
  const text = (candidate?.content?.parts ?? [])
    .filter((part: { text?: string; thought?: boolean }) => typeof part.text === "string" && !part.thought)
    .map((part: { text: string }) => part.text)
    .join("");
  if (!text.trim()) throw new Error("Gemini returned no note text.");
  return text;
}

async function callAnthropic(prompt: Prompt): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": requireEnv("ANTHROPIC_API_KEY"),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: requireEnv("LLM_MODEL"),
      max_tokens: 2000,
      temperature: 0,
      ...(prompt.system ? { system: prompt.system } : {}),
      messages: [{ role: "user", content: prompt.user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content
    .filter((block: { type: string }) => block.type === "text")
    .map((block: { text: string }) => block.text)
    .join("");
}

async function callOpenAICompatible(prompt: Prompt): Promise<string> {
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const messages = [
    ...(prompt.system ? [{ role: "system", content: prompt.system }] : []),
    { role: "user", content: prompt.user },
  ];
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${requireEnv("OPENAI_API_KEY")}`,
    },
    body: JSON.stringify({ model: requireEnv("LLM_MODEL"), temperature: 0, messages }),
  });
  if (!res.ok) throw new Error(`LLM API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}
