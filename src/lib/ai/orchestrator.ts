export type DialogueMode = "INTERLOCUTOR" | "ANALYST" | "GAP_HUNTER" | "CONTRARIAN";

const SYSTEM_PROMPT = `You are the Nihiltheism Knowledge Engine. Your tone is calm, analytical, and PhD-level.
DIRECTIONS:
1. Ground all claims in the provided context.
2. Identify any logical tensions.
3. If the context is insufficient, label the gap.`;

export class PhilosophicalEngine {
  private temperature: number;

  constructor(mode: DialogueMode) {
    this.temperature = mode === "INTERLOCUTOR" ? 0.7 : 0.2;
  }

  async generateResponse(query: string, context: string) {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Grounded Context from User Corpus:\n${context}\n\nUSER QUERY: ${query}` },
        ],
        temperature: this.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content ?? "" };
  }
}
