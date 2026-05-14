import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PanelLeft, Plus, Send, Copy, Trash2, Pencil, MessageSquareText } from 'lucide-react';
import { ChatMessage, createDefaultConversation, MockStreamingProvider } from '@/lib/chatProvider';

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'nihiltheism-chat-conversations-v1';

const getConversationPreview = (conversation: Conversation) => {
  const recent = [...conversation.messages].reverse().find((message) => message.role !== 'system');
  return recent?.content || 'No messages yet';
};

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const active = conversations.find((conversation) => conversation.id === activeConversationId);

  const updateConversation = (conversationId: string, updater: (current: Conversation) => Conversation) => {
    setConversations((current) =>
      current.map((conversation) => (conversation.id === conversationId ? updater(conversation) : conversation))
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

  const deleteConversation = (conversationId: string) => {
    setConversations((current) => {
      const filtered = current.filter((conversation) => conversation.id !== conversationId);
      if (!filtered.length) {
        const fallback: Conversation = {
          id: crypto.randomUUID(),
          title: 'New Research Thread',
          updatedAt: new Date().toISOString(),
          messages: createDefaultConversation()
        };
        setActiveConversationId(fallback.id);
        return [fallback];
      }

      if (activeConversationId === conversationId) {
        setActiveConversationId(filtered[0].id);
      }
      return filtered;
    });
  };

  const renameConversation = (conversationId: string) => {
    const current = conversations.find((conversation) => conversation.id === conversationId);
    const nextTitle = window.prompt('Rename conversation', current?.title || '');
    if (!nextTitle?.trim()) return;

    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      title: nextTitle.trim(),
      updatedAt: new Date().toISOString()
    }));
  };

  const clearActiveConversation = () => {
    if (!active) return;
    updateConversation(active.id, (conversation) => ({
      ...conversation,
      updatedAt: new Date().toISOString(),
      messages: createDefaultConversation()
    }));
  };

  const onSend = async () => {
    if (!draft.trim() || !active || isStreaming) return;

    const conversationId = active.id;
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

    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      title: conversation.title === 'Untitled Thread' ? userMessage.content.slice(0, 40) : conversation.title,
      updatedAt: new Date().toISOString(),
      messages: [...conversation.messages, userMessage, assistantMessage]
    }));

    await provider.streamReply([...(active.messages ?? []), userMessage], (chunk) => {
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        updatedAt: new Date().toISOString(),
        messages: conversation.messages.map((message) =>
          message.id === assistantMessage.id ? { ...message, content: `${message.content}${chunk.delta}` } : message
        )
      }));

      if (chunk.done) {
        setIsStreaming(false);
      }
    });
  };

  const assistantIsTyping = isStreaming && active?.messages.some((message) => message.role === 'assistant' && !message.content);

  return (
    <div className="h-screen bg-background text-foreground flex">
      {isSidebarOpen && (
        <aside className="w-full max-w-[290px] border-r border-border p-3 sm:p-4 flex flex-col gap-3 bg-card/40">
          <Button onClick={createConversation} className="w-full justify-start gap-2" aria-label="Create new conversation">
            <Plus className="h-4 w-4" />
            New conversation
          </Button>
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="group rounded-lg border border-border bg-background/80">
                  <button
                    onClick={() => setActiveConversationId(conversation.id)}
                    className={`w-full text-left rounded-t-lg px-3 py-2 transition ${
                      conversation.id === activeConversationId ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    aria-label={`Open conversation ${conversation.title}`}
                  >
                    <p className="text-sm font-medium truncate">{conversation.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">{getConversationPreview(conversation)}</p>
                  </button>
                  <div className="flex items-center justify-end gap-1 px-2 pb-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" onClick={() => renameConversation(conversation.id)} aria-label="Rename conversation">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteConversation(conversation.id)} aria-label="Delete conversation">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen((value) => !value)} aria-label="Toggle sidebar">
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="font-semibold truncate">Nihiltheism Autonomous Research Agent</h1>
              <p className="text-xs text-muted-foreground truncate">{active?.title || 'No active conversation'}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={clearActiveConversation} disabled={!active}>
            Clear
          </Button>
        </header>

        <ScrollArea className="flex-1 px-3 sm:px-5 py-4 sm:py-6">
          {!active?.messages.filter((message) => message.role !== 'system').length ? (
            <div className="max-w-2xl mx-auto text-center text-muted-foreground py-16">
              <MessageSquareText className="h-10 w-10 mx-auto mb-3 opacity-70" />
              <p className="text-sm">Start a thread for anti-reifying analysis and apophatic inquiry.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-5">
              {active?.messages
                .filter((message) => message.role !== 'system')
                .map((message) => (
                  <article key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap border ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground border-primary/20'
                        : 'bg-card text-card-foreground border-border shadow-sm'
                    }`}>
                      <p>{message.content}</p>
                      <div className="mt-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => navigator.clipboard.writeText(message.content)}
                          aria-label="Copy message"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              {assistantIsTyping && <p className="text-xs text-muted-foreground ml-2">Assistant is typing…</p>}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border p-3 sm:p-4">
          <div className="max-w-3xl mx-auto">
            <label htmlFor="chat-composer" className="sr-only">Message composer</label>
            <textarea
              id="chat-composer"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void onSend();
                }
              }}
              placeholder="Present a claim for anti-reifying analysis…"
              className="w-full min-h-[84px] max-h-56 resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Chat message input"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Enter to send • Shift+Enter for newline</p>
              <Button onClick={() => void onSend()} disabled={isStreaming || !draft.trim()} aria-label="Send message">
                <Send className="h-4 w-4 mr-1" /> Send
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
