import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export type DialogueMode = "INTERLOCUTOR" | "ANALYST" | "GAP_HUNTER" | "CONTRARIAN";

export class PhilosophicalEngine {
  private model: ChatOpenAI;

  constructor(mode: DialogueMode) {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: mode === "INTERLOCUTOR" ? 0.7 : 0.2,
    });
  }

  async generateResponse(query: string, context: string) {
    const prompt = PromptTemplate.fromTemplate(`
      SYSTEM: You are the Nihiltheism Knowledge Engine. Your tone is calm, analytical, and PhD-level.
      Grounded Context from User Corpus: {context}

      USER QUERY: {query}

      DIRECTIONS:
      1. Ground all claims in the provided context.
      2. Identify any logical tensions.
      3. If the context is insufficient, label the gap.
    `);

    const chain = prompt.pipe(this.model);
    return chain.invoke({ query, context });
  }
}
