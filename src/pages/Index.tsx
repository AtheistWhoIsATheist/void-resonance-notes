import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Copy,
  Database,
  FileUp,
  Loader2,
  MessageSquareText,
  PanelLeft,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { ChatMessage, createDefaultConversation } from '@/lib/chatProvider';
import { NIHILTHEISM_AGENT_SYSTEM_PROMPT } from '@/lib/agentSystemPrompt';
import {
  CorpusImportResponse,
  ImportBatchSummary,
  ProcessedCorpusFile,
  TEXT_CORPUS_ACCEPT,
  createCorpusIntakeBrief,
  prepareCorpusFiles,
} from '@/lib/corpus-intake';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CorpusSummary {
  batchId: string;
  status: string;
  importedCount: number;
  duplicateCount: number;
  reviewCount: number;
  quarantinedCount: number;
  errorCount: number;
  fileTitles: string[];
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
  includeCorpusContext: boolean;
  activeBatchId?: string;
  corpusBrief?: string;
  corpusSummary?: CorpusSummary;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: string;
}

const STORAGE_KEY = 'nihiltheism-chat-conversations-v2';
const LEGACY_STORAGE_KEY = 'nihiltheism-chat-conversations-v1';
const CHAT_MODEL = 'google/gemini-2.5-flash';

const CORPUS_SYNTHESIS_PROMPT = [
  'Analyze the active corpus intake as a Nihiltheism second-brain update.',
  'Identify the strongest source-grounded claims, unresolved tensions, key terms, review risks, and next database actions.',
  'Keep source evidence separate from speculative synthesis.',
].join(' ');

const createConversation = (title = 'New Research Thread'): Conversation => ({
  id: crypto.randomUUID(),
  title,
  updatedAt: new Date().toISOString(),
  messages: createDefaultConversation(),
  includeCorpusContext: true,
});

const getConversationPreview = (conversation: Conversation) => {
  const recent = [...conversation.messages].reverse().find((message) => message.role !== 'system');
  return recent?.content || 'No messages yet';
};

const getSystemPrompt = (conversation: Conversation) =>
  conversation.messages.find((message) => message.role === 'system')?.content || NIHILTHEISM_AGENT_SYSTEM_PROMPT;

const ensureConversationShape = (value: unknown): Conversation | null => {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<Conversation>;
  if (!candidate.id || !Array.isArray(candidate.messages)) return null;

  return {
    id: candidate.id,
    title: candidate.title || 'Untitled Thread',
    updatedAt: candidate.updatedAt || new Date().toISOString(),
    messages: candidate.messages.filter((message): message is ChatMessage =>
      Boolean(
        message &&
          typeof message === 'object' &&
          'id' in message &&
          'role' in message &&
          'content' in message &&
          ['system', 'user', 'assistant'].includes((message as ChatMessage).role),
      ),
    ),
    includeCorpusContext: candidate.includeCorpusContext !== false,
    activeBatchId: candidate.activeBatchId,
    corpusBrief: candidate.corpusBrief,
    corpusSummary: candidate.corpusSummary,
  };
};

const importStatusLine = (batch: ImportBatchSummary | null | undefined, results: ProcessedCorpusFile[]) => {
  const importedCount = batch?.importedCount ?? results.filter((result) => result.status === 'imported' || result.status === 'needs_review').length;
  const duplicateCount = batch?.duplicateCount ?? results.filter((result) => result.status === 'duplicate').length;
  const reviewCount = batch?.reviewCount ?? results.reduce((sum, result) => sum + (result.reviewItems || 0), 0);
  const errorCount = batch?.errorCount ?? results.filter((result) => result.status === 'error').length;
  const quarantinedCount = batch?.quarantinedCount ?? results.filter((result) => result.status === 'quarantined').length;

  return `${importedCount} imported, ${duplicateCount} duplicates, ${reviewCount} review signals, ${quarantinedCount} quarantined, ${errorCount} errors.`;
};

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown[];
        const restored = Array.isArray(parsed)
          ? parsed.map(ensureConversationShape).filter((conversation): conversation is Conversation => Boolean(conversation))
          : [];
        if (restored.length) {
          setConversations(restored);
          setActiveConversationId(restored[0].id);
          return;
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    const initial = createConversation();
    setConversations([initial]);
    setActiveConversationId(initial.id);
  }, []);

  useEffect(() => {
    if (!conversations.length) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const active = conversations.find((conversation) => conversation.id === activeConversationId);

  const updateConversation = (conversationId: string, updater: (current: Conversation) => Conversation) => {
    setConversations((current) =>
      current.map((conversation) => (conversation.id === conversationId ? updater(conversation) : conversation)),
    );
  };

  const createNewConversation = () => {
    const conversation = createConversation('Untitled Thread');
    setConversations((current) => [conversation, ...current]);
    setActiveConversationId(conversation.id);
  };

  const deleteConversation = (conversationId: string) => {
    setConversations((current) => {
      const filtered = current.filter((conversation) => conversation.id !== conversationId);
      if (!filtered.length) {
        const fallback = createConversation();
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
      updatedAt: new Date().toISOString(),
    }));
  };

  const clearActiveConversation = () => {
    if (!active) return;
    updateConversation(active.id, (conversation) => ({
      ...conversation,
      updatedAt: new Date().toISOString(),
      messages: createDefaultConversation(),
      activeBatchId: undefined,
      corpusBrief: undefined,
      corpusSummary: undefined,
    }));
  };

  const onSend = async () => {
    if (!draft.trim() || !active || isSending) return;

    const conversation = active;
    const conversationId = conversation.id;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: draft.trim(),
      createdAt: new Date().toISOString(),
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };

    const outboundMessages = [...conversation.messages, userMessage]
      .filter((message) => message.role !== 'system')
      .map((message) => ({ role: message.role, content: message.content }));

    setDraft('');
    setIsSending(true);

    updateConversation(conversationId, (current) => ({
      ...current,
      title: current.title === 'Untitled Thread' ? userMessage.content.slice(0, 48) : current.title,
      updatedAt: new Date().toISOString(),
      messages: [...current.messages, userMessage, assistantMessage],
    }));

    try {
      const { data, error } = await supabase.functions.invoke<ChatCompletionResponse>('ai-chat', {
        body: {
          messages: outboundMessages,
          model: CHAT_MODEL,
          includeContext: conversation.includeCorpusContext,
          systemPrompt: getSystemPrompt(conversation),
          activeBatchId: conversation.activeBatchId,
          corpusBrief: conversation.corpusBrief,
        },
      });

      if (error) throw error;

      const content =
        data?.choices?.[0]?.message?.content ||
        data?.error ||
        'No response payload received. Check the AI gateway and Supabase function logs.';

      updateConversation(conversationId, (current) => ({
        ...current,
        updatedAt: new Date().toISOString(),
        messages: current.messages.map((message) =>
          message.id === assistantMessage.id ? { ...message, content } : message,
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown chat error';
      updateConversation(conversationId, (current) => ({
        ...current,
        updatedAt: new Date().toISOString(),
        messages: current.messages.map((item) =>
          item.id === assistantMessage.id ? { ...item, content: `Send failed: ${message}` } : item,
        ),
      }));
      toast({ title: 'Chat failed', description: message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const importCorpusFiles = async (files: FileList | null) => {
    if (!files || !files.length || !active || isUploading) return;

    const conversation = active;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const preparedFiles = await prepareCorpusFiles(files, {
        importSource: 'chat-composer',
        onProgress: setUploadProgress,
      });

      setUploadProgress(55);

      const { data, error } = await supabase.functions.invoke<CorpusImportResponse>('bulk-import', {
        body: {
          notes: preparedFiles,
          importMode: 'chat-files',
          sourceLabel: `Chat intake: ${conversation.title}`,
          options: {
            preserveDuplicates: false,
            runAiAnalysis: true,
            generateEmbeddings: true,
            createReviewItems: true,
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const results = data?.notes || [];
      const batch = data?.batch || null;
      const brief = createCorpusIntakeBrief(batch, results, data?.reportMarkdown || '', {
        conversationTitle: conversation.title,
        userInstruction: 'Use this batch as the active corpus context for the next philosophical answer unless the user narrows the scope.',
      });
      const fileTitles = results.slice(0, 6).map((result) => result.title);
      const summary: CorpusSummary = {
        batchId: batch?.id || 'pending',
        status: batch?.status || 'unknown',
        importedCount: batch?.importedCount || 0,
        duplicateCount: batch?.duplicateCount || 0,
        reviewCount: batch?.reviewCount || 0,
        quarantinedCount: batch?.quarantinedCount || 0,
        errorCount: batch?.errorCount || 0,
        fileTitles,
      };

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        createdAt: new Date().toISOString(),
        content: [
          'Corpus intake complete.',
          importStatusLine(batch, results),
          batch?.id ? `Active batch: ${batch.id}` : '',
          'The next answer will use this batch as second-brain context with source/provenance discipline.',
        ]
          .filter(Boolean)
          .join('\n'),
      };

      updateConversation(conversation.id, (current) => ({
        ...current,
        includeCorpusContext: true,
        activeBatchId: batch?.id || current.activeBatchId,
        corpusBrief: brief,
        corpusSummary: summary,
        updatedAt: new Date().toISOString(),
        messages: [...current.messages, assistantMessage],
      }));

      setUploadProgress(100);
      toast({
        title: 'Corpus imported',
        description: importStatusLine(batch, results),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown import error';
      toast({ title: 'Import failed', description: message, variant: 'destructive' });
      updateConversation(conversation.id, (current) => ({
        ...current,
        updatedAt: new Date().toISOString(),
        messages: [
          ...current.messages,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Corpus import failed: ${message}`,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const assistantIsThinking = isSending && active?.messages.some((message) => message.role === 'assistant' && !message.content);
  const corpusSummary = active?.corpusSummary;

  return (
    <div className="h-screen bg-background text-foreground flex">
      {isSidebarOpen && (
        <aside className="w-full max-w-[290px] border-r border-border p-3 sm:p-4 flex flex-col gap-3 bg-card/40">
          <Button onClick={createNewConversation} className="w-full justify-start gap-2" aria-label="Create new conversation">
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
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{conversation.title}</p>
                      {conversation.activeBatchId && <Database className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    </div>
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
          <div className="flex items-center gap-2">
            {active?.includeCorpusContext && (
              <Badge variant="outline" className="hidden sm:inline-flex gap-1">
                <Brain className="h-3 w-3" />
                Corpus
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={clearActiveConversation} disabled={!active}>
              Clear
            </Button>
          </div>
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
                      {message.content ? <p>{message.content}</p> : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Thinking</span>
                        </div>
                      )}
                      {message.content && (
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
                      )}
                    </div>
                  </article>
                ))}
              {assistantIsThinking && <p className="text-xs text-muted-foreground ml-2">Agent is thinking...</p>}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border p-3 sm:p-4">
          <div className="max-w-3xl mx-auto space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={TEXT_CORPUS_ACCEPT}
              onChange={(event) => void importCorpusFiles(event.target.files)}
              className="hidden"
            />

            {(corpusSummary || isUploading) && (
              <div className="rounded-xl border border-border bg-card/70 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {isUploading ? (
                      <Badge variant="secondary" className="gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Importing
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Second brain updated
                      </Badge>
                    )}
                    {corpusSummary && <Badge variant="outline">{corpusSummary.importedCount} imported</Badge>}
                    {corpusSummary && corpusSummary.reviewCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {corpusSummary.reviewCount} review
                      </Badge>
                    )}
                    {corpusSummary?.batchId && <Badge variant="outline" className="max-w-[220px] truncate">{corpusSummary.batchId}</Badge>}
                  </div>
                  {corpusSummary && (
                    <Button variant="ghost" size="sm" onClick={() => setDraft(CORPUS_SYNTHESIS_PROMPT)}>
                      <Sparkles className="h-4 w-4 mr-1" />
                      Densify
                    </Button>
                  )}
                </div>
                {isUploading && <Progress value={uploadProgress} className="mt-2 h-2" />}
              </div>
            )}

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
              placeholder="Present a claim, question, source tension, or corpus problem..."
              className="w-full min-h-[84px] max-h-56 resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Chat message input"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isSending}
                  aria-label="Attach text or Markdown sources"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileUp className="h-4 w-4 mr-1" />}
                  Attach
                </Button>
                <p className="text-xs text-muted-foreground">Enter to send, Shift+Enter for newline</p>
              </div>
              <Button onClick={() => void onSend()} disabled={isSending || !draft.trim()} aria-label="Send message">
                {isSending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                Send
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
