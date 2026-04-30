import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { PanelLeft, Plus, Send } from 'lucide-react';
import { ChatMessage, createDefaultConversation, MockStreamingProvider } from '@/lib/chatProvider';

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'nihiltheism-chat-conversations-v1';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [draft, setDraft] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const provider = useMemo(() => new MockStreamingProvider(), []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Conversation[];
      setConversations(parsed);
      setActiveConversationId(parsed[0]?.id ?? '');
      return;
    }

    const initial: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Research Thread',
      updatedAt: new Date().toISOString(),
      messages: createDefaultConversation()
    };
    setConversations([initial]);
    setActiveConversationId(initial.id);
  }, []);

  useEffect(() => {
    if (conversations.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  const active = conversations.find((conversation) => conversation.id === activeConversationId);

  const updateActive = (updater: (current: Conversation) => Conversation) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversationId ? updater(conversation) : conversation
      )
    );
  };

  const createConversation = () => {
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'Untitled Thread',
      updatedAt: new Date().toISOString(),
      messages: createDefaultConversation()
    };
    setConversations((current) => [conversation, ...current]);
    setActiveConversationId(conversation.id);
  };

  const onSend = async () => {
    if (!draft.trim() || !active || isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: draft.trim(),
      createdAt: new Date().toISOString()
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString()
    };

    setDraft('');
    setIsStreaming(true);

    updateActive((current) => ({
      ...current,
      title: current.title === 'Untitled Thread' ? userMessage.content.slice(0, 36) : current.title,
      updatedAt: new Date().toISOString(),
      messages: [...current.messages, userMessage, assistantMessage]
    }));

    await provider.streamReply([...(active.messages ?? []), userMessage], (chunk) => {
      updateActive((current) => ({
        ...current,
        updatedAt: new Date().toISOString(),
        messages: current.messages.map((message) =>
          message.id === assistantMessage.id
            ? { ...message, content: `${message.content}${chunk.delta}` }
            : message
        )
      }));

      if (chunk.done) {
        setIsStreaming(false);
      }
    });
  };

  return (
    <div className="h-screen bg-background text-foreground flex">
      {isSidebarOpen && (
        <aside className="w-72 border-r border-border p-3 flex flex-col gap-3">
          <Button onClick={createConversation} className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            New conversation
          </Button>
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={`w-full text-left rounded-md px-3 py-2 text-sm border transition ${
                    conversation.id === activeConversationId
                      ? 'bg-accent border-accent-foreground/20'
                      : 'bg-card border-border hover:bg-accent/40'
                  }`}
                >
                  {conversation.title}
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>
      )}

      <main className="flex-1 flex flex-col">
        <header className="border-b border-border px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen((value) => !value)}>
            <PanelLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold">Nihiltheism Autonomous Research Agent</h1>
          </div>
        </header>

        <ScrollArea className="flex-1 px-4 py-5">
          <div className="max-w-3xl mx-auto space-y-4">
            {active?.messages
              .filter((message) => message.role !== 'system')
              .map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-card border border-border mr-12'
                  }`}
                >
                  {message.content}
                </div>
              ))}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void onSend();
                }
              }}
              placeholder="Present a claim for anti-reifying analysis..."
            />
            <Button onClick={() => void onSend()} disabled={isStreaming || !draft.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
