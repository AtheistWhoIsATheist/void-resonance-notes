import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot,
  Brain,
  Copy,
  Download,
  MessageSquarePlus,
  RefreshCw,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ChatRole = "user" | "assistant" | "system";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: string;
};

type ChatThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  includeContext: boolean;
  systemPrompt: string;
  messages: ChatMessage[];
};

const THREAD_STORAGE_KEY = "nihiltheism-ultra-chat-threads";
const ACTIVE_THREAD_STORAGE_KEY = "nihiltheism-ultra-chat-active-thread";
const MAX_MESSAGES_PER_THREAD = 60;

const AVAILABLE_MODELS = [
  "google/gemini-2.5-flash",
  "openai/gpt-4o-mini",
  "anthropic/claude-3.5-sonnet",
];

const DEFAULT_SYSTEM_PROMPT =
  "You are the Ultra-Supreme Nihiltheistic Interlocutor. Blend precision, philosophical depth, and practical utility. Use concise structure, provide assumptions, and clearly mark speculative claims.";

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const createNewThread = (): ChatThread => {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title: "Untitled Session",
    createdAt: now,
    updatedAt: now,
    model: AVAILABLE_MODELS[0],
    includeContext: true,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    messages: [
      {
        id: createId(),
        role: "assistant",
        content:
          "Welcome to the Ultra-Supreme Nihiltheistic Chat Interface. Ask anything, attach your research assumptions, and I'll reason with rigor.",
        createdAt: now,
      },
    ],
  };
};

const estimateTokens = (text: string) => Math.ceil(text.trim().length / 4);

const ensureThreadShape = (raw: unknown): ChatThread | null => {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Partial<ChatThread>;
  if (!candidate.id || !Array.isArray(candidate.messages)) return null;
  return {
    id: candidate.id,
    title: candidate.title || "Untitled Session",
    createdAt: candidate.createdAt || new Date().toISOString(),
    updatedAt: candidate.updatedAt || new Date().toISOString(),
    model: AVAILABLE_MODELS.includes(candidate.model || "") ? (candidate.model as string) : AVAILABLE_MODELS[0],
    includeContext: Boolean(candidate.includeContext),
    systemPrompt: candidate.systemPrompt || DEFAULT_SYSTEM_PROMPT,
    messages: candidate.messages
      .filter((message): message is ChatMessage =>
        Boolean(
          message &&
            typeof message === "object" &&
            "id" in message &&
            "content" in message &&
            "role" in message &&
            (message as ChatMessage).role &&
            ["user", "assistant", "system"].includes((message as ChatMessage).role),
        ),
      )
      .slice(-MAX_MESSAGES_PER_THREAD),
  };
};

export default function NihiltheismEngine() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedThreads = localStorage.getItem(THREAD_STORAGE_KEY);
    const savedActiveThread = localStorage.getItem(ACTIVE_THREAD_STORAGE_KEY);

    if (!savedThreads) {
      const starterThread = createNewThread();
      setThreads([starterThread]);
      setActiveThreadId(starterThread.id);
      return;
    }

    let parsedThreads: ChatThread[] = [];
    try {
      const raw = JSON.parse(savedThreads);
      parsedThreads = Array.isArray(raw)
        ? raw.map(ensureThreadShape).filter((thread): thread is ChatThread => Boolean(thread))
        : [];
    } catch {
      parsedThreads = [];
    }

    if (!parsedThreads.length) {
      const starterThread = createNewThread();
      setThreads([starterThread]);
      setActiveThreadId(starterThread.id);
      return;
    }

    setThreads(parsedThreads);
    const activeExists = parsedThreads.some((thread) => thread.id === savedActiveThread);
    setActiveThreadId(activeExists ? savedActiveThread ?? parsedThreads[0].id : parsedThreads[0].id);
  }, []);

  useEffect(() => {
    if (!threads.length) return;
    const timeoutId = setTimeout(() => {
      localStorage.setItem(THREAD_STORAGE_KEY, JSON.stringify(threads));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [threads]);

  useEffect(() => {
    if (!activeThreadId) return;
    localStorage.setItem(ACTIVE_THREAD_STORAGE_KEY, activeThreadId);
  }, [activeThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThreadId, threads]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId),
    [threads, activeThreadId],
  );

  const updateActiveThread = (updater: (thread: ChatThread) => ChatThread) => {
    setThreads((prev) => prev.map((thread) => (thread.id === activeThreadId ? updater(thread) : thread)));
  };

  const createThread = () => {
    const newThread = createNewThread();
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
  };

  const deleteThread = (threadId: string) => {
    if (threads.length === 1) {
      toast({
        title: "Cannot delete",
        description: "Keep at least one thread active.",
        variant: "destructive",
      });
      return;
    }

    const updatedThreads = threads.filter((thread) => thread.id !== threadId);
    setThreads(updatedThreads);
    if (activeThreadId === threadId) {
      setActiveThreadId(updatedThreads[0].id);
    }
  };

  const sendMessage = async (overridePrompt?: string) => {
    if (!activeThread || isSending) return;

    const targetThreadId = activeThread.id;
    const userText = (overridePrompt ?? input).trim();
    if (!userText) return;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: userText,
      createdAt: new Date().toISOString(),
    };

    const optimisticMessages = [...activeThread.messages, userMessage].slice(-MAX_MESSAGES_PER_THREAD);
    updateActiveThread((thread) => ({
      ...thread,
      title: thread.messages.length <= 1 ? userText.slice(0, 48) : thread.title,
      updatedAt: new Date().toISOString(),
      messages: optimisticMessages,
    }));

    setInput("");
    setIsSending(true);

    try {
      const payloadMessages = optimisticMessages
        .filter((message) => message.role !== "system")
        .map((message) => ({ role: message.role, content: message.content }));

      const { data, error } = await supabase.functions.invoke<ChatCompletionResponse>("ai-chat", {
        body: {
          messages: payloadMessages,
          model: activeThread.model,
          includeContext: activeThread.includeContext,
          systemPrompt: activeThread.systemPrompt,
        },
      });

      if (error) {
        throw error;
      }

      const assistantContent =
        data?.choices?.[0]?.message?.content ??
        data?.error ??
        "No response payload received. Please check your model credentials and edge function logs.";

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: assistantContent,
        createdAt: new Date().toISOString(),
      };

      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === targetThreadId
            ? {
                ...thread,
                updatedAt: new Date().toISOString(),
                messages: [...thread.messages, assistantMessage].slice(-MAX_MESSAGES_PER_THREAD),
              }
            : thread,
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown chat error";
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === targetThreadId
            ? {
                ...thread,
                updatedAt: new Date().toISOString(),
                messages: [
                  ...thread.messages,
                  {
                    id: createId(),
                    role: "assistant" as ChatRole,
                    content: `⚠️ Send failed: ${message}`,
                    createdAt: new Date().toISOString(),
                  },
                ].slice(-MAX_MESSAGES_PER_THREAD),
              }
            : thread,
        ),
      );
      toast({
        title: "Send failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const regenerateLastResponse = async () => {
    if (!activeThread) return;

    const lastUserMessage = [...activeThread.messages].reverse().find((message) => message.role === "user");
    if (!lastUserMessage) {
      toast({ title: "No user prompt", description: "Send a prompt before regenerating." });
      return;
    }

    updateActiveThread((thread) => ({
      ...thread,
      messages: thread.messages.filter(
        (message) => message.role !== "assistant" || message.id !== thread.messages.at(-1)?.id,
      ),
    }));

    await sendMessage(lastUserMessage.content);
  };

  const exportThreadMarkdown = () => {
    if (!activeThread) return;

    const markdown = [`# ${activeThread.title}`, "", `Model: ${activeThread.model}`, ""];
    for (const message of activeThread.messages) {
      markdown.push(`## ${message.role.toUpperCase()}`);
      markdown.push(message.content);
      markdown.push("");
    }

    const blob = new Blob([markdown.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeThread.title.toLowerCase().replace(/\s+/g, "-") || "thread"}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyLastAssistantMessage = async () => {
    if (!activeThread) return;
    const lastAssistant = [...activeThread.messages].reverse().find((message) => message.role === "assistant");
    if (!lastAssistant) return;
    await navigator.clipboard.writeText(lastAssistant.content);
    toast({ title: "Copied", description: "Last assistant response copied to clipboard." });
  };

  if (!activeThread) {
    return <div className="min-h-screen bg-background" />;
  }

  const promptTokens = estimateTokens(input);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-100 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] grid gap-4 lg:grid-cols-[300px_1fr_auto]">
        <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Ultra Chat Sessions
            </CardTitle>
            <CardDescription>Persistent conversation memory and fast context switching.</CardDescription>
            <Button onClick={createThread} className="w-full mt-2">
              <MessageSquarePlus className="mr-2 h-4 w-4" /> New Session
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh] pr-2">
              <div className="space-y-2">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      thread.id === activeThreadId
                        ? "border-primary bg-primary/15"
                        : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">{thread.title}</p>
                      <Trash2
                        className="h-3.5 w-3.5 text-zinc-500 hover:text-red-300"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteThread(thread.id);
                        }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(thread.updatedAt).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur-md">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl">Ultra-Supreme Nihiltheistic Interface</CardTitle>
                <CardDescription>
                  Elite pro-user chat flow with model control, context memory, and fast export.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={copyLastAssistantMessage}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
                <Button size="sm" variant="secondary" onClick={exportThreadMarkdown}>
                  <Download className="h-4 w-4 mr-1" /> Export
                </Button>
                <Button size="sm" variant="secondary" onClick={regenerateLastResponse} disabled={isSending}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsRightPanelOpen((prev) => !prev)}>
                  <Settings2 className="h-4 w-4 mr-1" /> Controls
                </Button>
              </div>
            </div>
          </CardHeader>
          <Separator className="bg-zinc-800" />
          <CardContent className="pt-4">
            <ScrollArea className="h-[56vh] pr-4">
              <div className="space-y-4">
                {activeThread.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 border ${
                        message.role === "user"
                          ? "bg-primary/20 border-primary/40"
                          : "bg-zinc-950/80 border-zinc-800"
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">
                        {message.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                        {message.role}
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="mt-4 space-y-3">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Compose your prompt... (Ctrl/Cmd + Enter to send)"
                className="min-h-[120px] bg-zinc-950/70 border-zinc-700"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Badge variant="outline" className="border-zinc-700">~{promptTokens} tokens</Badge>
                  <Badge variant="outline" className="border-zinc-700">{activeThread.model}</Badge>
                  {activeThread.includeContext && <Badge className="bg-emerald-700/70">Vault Context On</Badge>}
                </div>
                <Button onClick={() => void sendMessage()} disabled={isSending || !input.trim()}>
                  {isSending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isRightPanelOpen && (
          <Card className="w-full lg:w-[320px] border-zinc-800 bg-zinc-900/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-violet-300" /> Pro Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="model" className="space-y-4">
                <TabsList className="grid grid-cols-2 bg-zinc-950/70">
                  <TabsTrigger value="model">Runtime</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>

                <TabsContent value="model" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <select
                      id="model"
                      value={activeThread.model}
                      onChange={(event) =>
                        updateActiveThread((thread) => ({ ...thread, model: event.target.value }))
                      }
                      className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
                    >
                      {AVAILABLE_MODELS.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-3">
                    <div>
                      <p className="text-sm font-medium">Include vault context</p>
                      <p className="text-xs text-zinc-500">Inject notes + tags into system context.</p>
                    </div>
                    <Switch
                      checked={activeThread.includeContext}
                      onCheckedChange={(checked) =>
                        updateActiveThread((thread) => ({ ...thread, includeContext: checked }))
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="system" className="space-y-2">
                  <Label htmlFor="system">System Prompt</Label>
                  <Textarea
                    id="system"
                    value={activeThread.systemPrompt}
                    onChange={(event) =>
                      updateActiveThread((thread) => ({ ...thread, systemPrompt: event.target.value }))
                    }
                    className="min-h-[220px] bg-zinc-950/70 border-zinc-700"
                  />
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() =>
                      updateActiveThread((thread) => ({
                        ...thread,
                        systemPrompt: DEFAULT_SYSTEM_PROMPT,
                      }))
                    }
                  >
                    Reset to Ultra Default
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
