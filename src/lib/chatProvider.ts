import { NIHILTHEISM_AGENT_SYSTEM_PROMPT } from './agentSystemPrompt';

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface StreamChunk {
  delta: string;
  done?: boolean;
}

export interface ChatProvider {
  streamReply(messages: ChatMessage[], onChunk: (chunk: StreamChunk) => void): Promise<void>;
}

export class MockStreamingProvider implements ChatProvider {
  async streamReply(messages: ChatMessage[], onChunk: (chunk: StreamChunk) => void): Promise<void> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const content = lastUser?.content?.trim() || 'Continue the inquiry.';
    const reply = [
      'Apophatic framing: we should avoid treating this concept as an ultimate object. ',
      `You asked: "${content}". `,
      'Working hypothesis: it is a useful model under constrained assumptions, not an intrinsic essence. ',
      'Next step: state one observable prediction that could disconfirm this interpretation.'
    ].join('');

    const parts = reply.split(' ');
    for (const part of parts) {
      onChunk({ delta: `${part} ` });
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    onChunk({ delta: '', done: true });
  }
}

export const createDefaultConversation = (): ChatMessage[] => [
  {
    id: crypto.randomUUID(),
    role: 'system',
    content: NIHILTHEISM_AGENT_SYSTEM_PROMPT,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    role: 'assistant',
    content:
      'I am ready. Bring a claim, concept, or dilemma and I will examine it with anti-reification and apophatic guardrails.',
    createdAt: new Date().toISOString()
  }
];
