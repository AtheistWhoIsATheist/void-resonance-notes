import { useMemo, useState } from "react";
import {
  deterministicHash,
  generateDeterministicRun,
 codex/define-loveable-core-tenets-and-data-model
  densificationCycles,
  densificationSlices,
 main
  pecOmega,
  professorNihilLedger,
  promptForgeAcceptanceTests,
  promptForgeCollections,
  promptForgeProfiles,
  promptForgePrompts,
  promptForgeSettings,
} from "@/lib/prompt-forge-data";
import {
  PFEnhancementProfile,
  PFPrompt,
  PFRecord,
} from "@/lib/prompt-forge-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  ArrowRightLeft,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  ClipboardCopy,
  Database,
  Diff,
  Download,
  FileCode,
  FileJson,
  FileText,
  Flame,
  FolderCog,
  History,
  Hourglass,
  Layers,
  ListChecks,
  LockKeyhole,
  PlayCircle,
  RefreshCw,
  Repeat2,
  ShieldCheck,
  Shuffle,
  Sigma,
  Sparkles,
  Upload,
  Watch,
} from "lucide-react";

const profilesById = Object.fromEntries(
  promptForgeProfiles.map((profile) => [profile.id, profile])
);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const PromptForge = () => {
  const [search, setSearch] = useState("");
 codex/define-loveable-core-tenets-and-data-model
  const [domainFilter, setDomainFilter] = useState<string | "all">("all");
  const [domainFilter, setDomainFilter] = useState<"all" | "code" | "creative" | "journal314" | "nihiltheism" | "philosophy" | "ren" | "research" | "tech">("all");
 main
  const [minScore, setMinScore] = useState(0);
  const [selectedCollection, setSelectedCollection] = useState(promptForgeCollections[0].id);
  const [selectedPromptId, setSelectedPromptId] = useState(promptForgePrompts[0]?.id ?? "");
  const [selectedProfileId, setSelectedProfileId] = useState(promptForgeProfiles[0]?.id ?? "");
  const [records, setRecords] = useState<Record<string, PFRecord>>({});
  const [activeTab, setActiveTab] = useState("enhanced");
  const [clipboardStatus, setClipboardStatus] = useState<string>("");
  const [watchFolderEnabled, setWatchFolderEnabled] = useState(true);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [templateChainEnabled, setTemplateChainEnabled] = useState(true);

  const selectedPrompt = useMemo<PFPrompt | undefined>(
    () => promptForgePrompts.find((prompt) => prompt.id === selectedPromptId),
    [selectedPromptId]
  );

  const selectedProfile = useMemo<PFEnhancementProfile | undefined>(
    () => profilesById[selectedProfileId],
    [selectedProfileId]
  );

  const filteredPrompts = useMemo(() => {
    const collection = promptForgeCollections.find((item) => item.id === selectedCollection);
    const allowedPromptIds = new Set(collection?.promptIds ?? []);
    return promptForgePrompts.filter((prompt) => {
      if (collection && !allowedPromptIds.has(prompt.id)) {
        return false;
      }
      if (domainFilter !== "all" && !prompt.domain?.includes(domainFilter)) {
        return false;
      }
      if (search && !prompt.title.toLowerCase().includes(search.toLowerCase()) && !prompt.raw.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (minScore > 0) {
        const record = records[prompt.id];
        if (!record || record.scores.total < minScore) {
          return false;
        }
      }
      return true;
    });
  }, [domainFilter, minScore, search, selectedCollection, records]);

  const activeRecord = selectedPrompt ? records[selectedPrompt.id] : undefined;

  const handleEnhance = () => {
    if (!selectedPrompt || !selectedProfile) return;
    const iteration = (activeRecord?.version ?? 0) + 1;
    const run = generateDeterministicRun(selectedPrompt, selectedProfile, iteration);
    const record: PFRecord = {
      id: `${selectedPrompt.id}-${selectedProfile.id}-${iteration}`,
      promptId: selectedPrompt.id,
      profileId: selectedProfile.id,
      inputSnapshot: selectedPrompt,
      output: run.output,
      trace: run.trace,
      scores: run.scores,
      tags: run.tags,
      version: run.version,
    };
    setRecords((previous) => ({ ...previous, [selectedPrompt.id]: record }));
    setActiveTab("enhanced");
  };

  const handleCopy = async (payload: string, label: string) => {
    try {
      await navigator.clipboard.writeText(payload);
      setClipboardStatus(`${label} copied.`);
      setTimeout(() => setClipboardStatus(""), 2000);
    } catch (error) {
      setClipboardStatus("Clipboard unavailable");
    }
  };

  const deterministicManifestId = selectedPrompt && selectedProfile
    ? deterministicHash(`${selectedPrompt.id}:${selectedProfile.id}`)
    : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-cyan-400" />
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Prompt Forge — LOVEABLE Edition</h1>
              <p className="text-xs text-slate-400">Local-first deterministic enhancement laboratory. Single user. No collaborators.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1"><LockKeyhole className="h-3.5 w-3.5" /> AES-GCM local vault</div>
            <div className="flex items-center gap-1"><Database className="h-3.5 w-3.5" /> IndexedDB snapshot</div>
            <div className="flex items-center gap-1"><History className="h-3.5 w-3.5" /> Manifest #{deterministicManifestId}</div>
          </div>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="mx-auto flex max-w-7xl border-x border-slate-900">
        <ResizablePanel defaultSize={22} className="border-r border-slate-900 bg-slate-950/80">
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="space-y-6 p-6">
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Collections</h2>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300" aria-label="Create collection">
                    <FolderCog className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {promptForgeCollections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => setSelectedCollection(collection.id)}
                      className={cn(
                        "w-full rounded-md border border-slate-900 bg-slate-950/70 p-3 text-left transition",
                        selectedCollection === collection.id && "border-cyan-500/50 bg-cyan-500/10"
                      )}
                    >
                      <div className="flex items-center justify-between text-sm font-medium text-slate-100">
                        <span>{collection.name}</span>
                        <Badge variant="secondary" className="bg-slate-800 text-xs text-slate-200">
                          {collection.promptIds.length}
                        </Badge>
                      </div>
                      {collection.description && (
                        <p className="mt-1 text-xs text-slate-400">{collection.description}</p>
                      )}
                      {collection.rule && (
                        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-cyan-400">
                          Smart rule active
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Filters</h2>
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search prompts"
                  className="h-8 bg-slate-900 text-xs"
                />
                <Select value={domainFilter} onValueChange={(value) => setDomainFilter(value as typeof domainFilter)}>
                  <SelectTrigger className="h-8 bg-slate-900 text-xs">
                    <SelectValue placeholder="Domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All domains</SelectItem>
                    <SelectItem value="philosophy">Philosophy</SelectItem>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="nihiltheism">Nihiltheism</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={10}
                    value={minScore}
                    onChange={(event) => setMinScore(Number(event.target.value))}
                    className="w-full"
                  />
                  <span className="w-16 text-right text-[11px] uppercase tracking-wide text-slate-400">≥ {minScore} score</span>
                </label>
                <div className="rounded-md border border-slate-900 bg-slate-950/60 p-3 text-[11px] text-slate-400">
                  <p>Single user mode enforced. Collaboration APIs removed.</p>
                  <p className="mt-2 flex items-center gap-1 font-semibold text-cyan-400">
                    <ShieldCheck className="h-3 w-3" /> Local-first guarantee
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Prompts</h2>
                <div className="space-y-2">
                  {filteredPrompts.map((prompt) => {
                    const isActive = prompt.id === selectedPromptId;
                    const record = records[prompt.id];
                    return (
                      <button
                        key={prompt.id}
                        onClick={() => setSelectedPromptId(prompt.id)}
                        className={cn(
                          "w-full rounded-md border border-slate-900 bg-slate-950/70 p-3 text-left transition",
                          isActive && "border-cyan-500/50 bg-cyan-500/10"
                        )}
                      >
                        <div className="flex items-center justify-between text-sm font-medium text-slate-100">
                          <span>{prompt.title}</span>
                          {record ? (
                            <Badge className="bg-emerald-500/20 text-[10px] text-emerald-300">
                              {record.scores.total}
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-800 text-[10px] text-slate-300">Draft</Badge>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{prompt.raw}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {prompt.domain?.map((domain) => (
                            <Badge key={domain} variant="outline" className="border-slate-800 bg-slate-900 text-[10px] text-slate-300">
                              {domain}
                            </Badge>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle className="bg-slate-900" />

        <ResizablePanel defaultSize={42} className="border-r border-slate-900 bg-slate-950/60">
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="space-y-6 p-6">
              <section>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-100">Input Editor</h2>
                    <p className="text-xs text-slate-400">Markdown prompt captured locally. IndexedDB first, with exportable bundles.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1"><PlayCircle className="h-3 w-3" /> Cmd/Ctrl+E</div>
                    <div className="flex items-center gap-1"><Diff className="h-3 w-3" /> Cmd/Ctrl+D</div>
                    <div className="flex items-center gap-1"><Shuffle className="h-3 w-3" /> Cmd/Ctrl+Shift+B</div>
                    <div className="flex items-center gap-1"><Watch className="h-3 w-3" /> Cmd/Ctrl+Shift+W</div>
                  </div>
                </div>

                <Card className="mt-4 border-slate-900 bg-slate-950/80">
                  <CardHeader className="flex flex-col gap-3 border-b border-slate-900/60 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                        <SelectTrigger className="w-56 bg-slate-900 text-xs">
                          <SelectValue placeholder="Select profile" />
                        </SelectTrigger>
                        <SelectContent>
                          {promptForgeProfiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" className="bg-cyan-500/80 text-slate-950 hover:bg-cyan-400" onClick={handleEnhance}>
                        <Sparkles className="mr-2 h-4 w-4" /> Enhance
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-800 bg-transparent text-slate-300" onClick={handleEnhance}>
                        <Repeat2 className="mr-2 h-4 w-4" /> Re-run
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-800 bg-transparent text-slate-300">
                        <Shuffle className="mr-2 h-4 w-4" /> Batch
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-800 bg-transparent text-slate-300">
                        <CalendarClock className="mr-2 h-4 w-4" /> Schedule
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-800 bg-transparent text-slate-300" onClick={() => selectedPrompt && handleCopy(selectedPrompt.raw, "Raw prompt")}>
                        <ClipboardCopy className="mr-2 h-4 w-4" /> Copy
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-800 bg-transparent text-slate-300">
                        <ArrowRightLeft className="mr-2 h-4 w-4" /> Diff
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-800 bg-transparent text-slate-300">
                        <Download className="mr-2 h-4 w-4" /> Export
                      </Button>
                    </div>
                    {selectedProfile && (
                      <p className="text-xs text-slate-400">{selectedProfile.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <Textarea
                      value={selectedPrompt?.raw ?? ""}
                      onChange={() => undefined}
                      readOnly
                      className="min-h-[220px] resize-none border-slate-900 bg-slate-950 text-sm"
                    />
                    {selectedPrompt && (
                      <div className="grid gap-4 rounded-md border border-slate-900/70 bg-slate-950/90 p-4 text-xs text-slate-300 md:grid-cols-2">
                        <div>
                          <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Metadata</h3>
                          <p>Created: {formatDate(selectedPrompt.metadata.createdAt)}</p>
                          <p>Updated: {formatDate(selectedPrompt.metadata.updatedAt)}</p>
                          <p>Source: {selectedPrompt.metadata.source}</p>
                        </div>
                        <div>
                          <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Context Links</h3>
                          <ul className="space-y-1">
                            {selectedPrompt.contextLinks?.map((link) => (
                              <li key={link} className="flex items-center gap-2 break-all text-slate-300">
                                <LinkIcon className="h-3 w-3 text-cyan-400" />
                                {link}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    <div className="grid gap-3 rounded-md border border-slate-900/70 bg-slate-950/90 p-4 text-xs text-slate-300 lg:grid-cols-3">
                      <label className="flex items-start gap-3">
                        <Checkbox checked={watchFolderEnabled} onCheckedChange={(value) => setWatchFolderEnabled(Boolean(value))} />
                        <span>
                          <span className="flex items-center gap-2 font-medium text-slate-100"><Watch className="h-3.5 w-3.5 text-cyan-400" /> Watch Folders</span>
                          <span className="mt-1 block text-slate-400">Drop file → auto-enhance → export bundle within 5 seconds.</span>
                        </span>
                      </label>
                      <label className="flex items-start gap-3">
                        <Checkbox checked={templateChainEnabled} onCheckedChange={(value) => setTemplateChainEnabled(Boolean(value))} />
                        <span>
                          <span className="flex items-center gap-2 font-medium text-slate-100"><Layers className="h-3.5 w-3.5 text-cyan-400" /> Template Chains</span>
                          <span className="mt-1 block text-slate-400">Link multiple profiles for sequential deterministic runs.</span>
                        </span>
                      </label>
                      <label className="flex items-start gap-3">
                        <Checkbox checked={scheduleEnabled} onCheckedChange={(value) => setScheduleEnabled(Boolean(value))} />
                        <span>
                          <span className="flex items-center gap-2 font-medium text-slate-100"><CalendarClock className="h-3.5 w-3.5 text-cyan-400" /> Scheduled Jobs</span>
                          <span className="mt-1 block text-slate-400">Cron-like automation ensures nightly export to Obsidian vault.</span>
                        </span>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section>
                <Card className="border-slate-900 bg-slate-950/80">
                  <CardHeader className="border-b border-slate-900/60 pb-4">
                    <CardTitle className="flex items-center gap-2 text-sm text-slate-100">
                      <ListChecks className="h-4 w-4 text-cyan-400" /> Acceptance Tests
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 pt-4 text-xs text-slate-300">
                    {promptForgeAcceptanceTests.map((test) => (
                      <div key={test} className="flex items-start gap-3 rounded-md border border-slate-900/70 bg-slate-950/90 p-3">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                        <span>{test}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle className="bg-slate-900" />

        <ResizablePanel defaultSize={36} className="bg-slate-950/80">
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="space-y-6 p-6">
              <section>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-100">Outputs</h2>
                  <div className="text-xs text-cyan-400">Deterministic manifest locked</div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                  <TabsList className="flex flex-wrap gap-1 bg-slate-900/70 p-1">
                    <TabsTrigger value="enhanced" className="text-xs">Enhanced</TabsTrigger>
                    <TabsTrigger value="diff" className="text-xs">Diff</TabsTrigger>
                    <TabsTrigger value="trace" className="text-xs">Trace</TabsTrigger>
                    <TabsTrigger value="scores" className="text-xs">Scores</TabsTrigger>
                    <TabsTrigger value="ledger" className="text-xs">Ledger</TabsTrigger>
                    <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
                  </TabsList>

                  <TabsContent value="enhanced" className="mt-4">
                    <Card className="border-slate-900 bg-slate-950/90">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-900/60 pb-4">
                        <CardTitle className="text-sm text-slate-100">Enhanced Prompt</CardTitle>
                        <Button size="sm" variant="outline" className="border-slate-800 text-xs text-slate-300" onClick={() => activeRecord && handleCopy(activeRecord.output, "Enhanced prompt")}>
                          <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Markdown
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-4 text-sm leading-relaxed text-slate-200">
                        <pre className="whitespace-pre-wrap font-mono text-[13px] leading-snug">
                          {activeRecord?.output ?? "Run Enhance to generate deterministic output."}
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="diff" className="mt-4">
                    <Card className="border-slate-900 bg-slate-950/90">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-900/60 pb-4">
                        <CardTitle className="text-sm text-slate-100">Diff</CardTitle>
                        <Button size="sm" variant="outline" className="border-slate-800 text-xs text-slate-300" onClick={() => selectedPrompt && activeRecord && handleCopy(`${selectedPrompt.raw}\n---\n${activeRecord.output}`, "Diff payload")}>
                          <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Diff Bundle
                        </Button>
                      </CardHeader>
                      <CardContent className="grid gap-4 pt-4 text-xs text-slate-300">
                        <div className="rounded-md border border-rose-900/60 bg-rose-950/30 p-3">
                          <p className="font-semibold text-rose-200">Original</p>
                          <pre className="mt-2 whitespace-pre-wrap font-mono text-[12px] leading-snug text-rose-100">
                            {selectedPrompt?.raw ?? "Select a prompt."}
                          </pre>
                        </div>
                        <div className="rounded-md border border-emerald-900/60 bg-emerald-950/30 p-3">
                          <p className="font-semibold text-emerald-200">Enhanced</p>
                          <pre className="mt-2 whitespace-pre-wrap font-mono text-[12px] leading-snug text-emerald-100">
                            {activeRecord?.output ?? "Awaiting enhancement."}
                          </pre>
                        </div>
                        <div className="rounded-md border border-cyan-900/60 bg-cyan-950/30 p-3">
                          <p className="font-semibold text-cyan-200">Deterministic Guarantee</p>
                          <p className="mt-1 text-cyan-100">Manifest hash {activeRecord ? deterministicHash(activeRecord.output).toString() : "—"} ensures reproducible reruns.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="trace" className="mt-4">
                    <Card className="border-slate-900 bg-slate-950/90">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-900/60 pb-4">
                        <CardTitle className="text-sm text-slate-100">Trace</CardTitle>
                        <Button size="sm" variant="outline" className="border-slate-800 text-xs text-slate-300" onClick={() => activeRecord && handleCopy(JSON.stringify(activeRecord.trace, null, 2), "Trace JSON") }>
                          <FileJson className="mr-2 h-4 w-4" /> Copy JSON
                        </Button>
                      </CardHeader>
                      <CardContent className="grid gap-4 pt-4 text-xs text-slate-300">
                        {activeRecord?.trace.map((step) => (
                          <div key={step.stepId} className="rounded-md border border-slate-900/60 bg-slate-950 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-wide text-slate-400">
                              <span>{step.stepId}</span>
                              <span className="flex items-center gap-2 text-slate-300">
                                <BrainCircuit className="h-3 w-3 text-cyan-400" /> {step.model}
                              </span>
                              <span className="flex items-center gap-1 text-slate-400"><Activity className="h-3 w-3" /> {step.durationMs}ms</span>
                              <span className="flex items-center gap-1 text-slate-400"><Sigma className="h-3 w-3" /> in:{step.tokensIn} / out:{step.tokensOut}</span>
                              <Button size="sm" variant="outline" className="h-7 border-slate-800 bg-transparent text-[11px] text-slate-300" onClick={() => handleCopy(step.output, `${step.stepId} output`)}>
                                <RefreshCw className="mr-1 h-3 w-3" /> Re-run step
                              </Button>
                            </div>
                            <div className="mt-2 grid gap-2 md:grid-cols-2">
                              <div className="rounded-md border border-slate-900 bg-slate-950/80 p-3">
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Input</p>
                                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-snug">
                                  {step.input}
                                </pre>
                              </div>
                              <div className="rounded-md border border-slate-900 bg-slate-950/80 p-3">
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Output</p>
                                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-snug">
                                  {step.output}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                        {!activeRecord && (
                          <div className="rounded-md border border-slate-900/60 bg-slate-950 p-6 text-center text-slate-500">
                            Trigger an enhancement to see manifest trace entries.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="scores" className="mt-4">
                    <Card className="border-slate-900 bg-slate-950/90">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-900/60 pb-4">
                        <CardTitle className="text-sm text-slate-100">Scores</CardTitle>
                        <Button size="sm" variant="outline" className="border-slate-800 text-xs text-slate-300" onClick={() => activeRecord && handleCopy(JSON.stringify(activeRecord.scores, null, 2), "Score JSON") }>
                          <FileCode className="mr-2 h-4 w-4" /> Copy JSON
                        </Button>
                      </CardHeader>
                      <CardContent className="grid gap-4 pt-4 text-xs text-slate-300">
                        {activeRecord ? (
                          <div className="space-y-3">
                            {Object.entries(activeRecord.scores).map(([key, value]) => (
                              key === "notes" || key === "total" ? null : (
                                <div key={key}>
                                  <div className="flex items-center justify-between">
                                    <span className="uppercase tracking-wide text-[11px] text-slate-400">{key}</span>
                                    <span className="text-slate-200">{value}</span>
                                  </div>
                                  <Progress value={value} className="mt-1 h-2 bg-slate-900" />
                                </div>
                              )
                            ))}
                            <div className="rounded-md border border-slate-900/70 bg-slate-950/80 p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total</p>
                              <p className="mt-1 text-2xl font-bold text-cyan-400">{activeRecord.scores.total}</p>
                              <p className="mt-2 text-slate-400">{activeRecord.scores.notes}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-md border border-slate-900/60 bg-slate-950 p-6 text-center text-slate-500">
                            Run enhancement to generate deterministic scoring rubric.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="ledger" className="mt-4">
                    <Card className="border-slate-900 bg-slate-950/90">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-900/60 pb-4">
                        <CardTitle className="text-sm text-slate-100">Ledger Output</CardTitle>
                        <Button size="sm" variant="outline" className="border-slate-800 text-xs text-slate-300" onClick={() => activeRecord && handleCopy(`# JSONL\n${JSON.stringify({ quote: "deterministic", inference: "manifest", nt_claim: "stable", source: selectedPrompt?.title }, null, 2)}`, "Ledger JSONL") }>
                          <FileText className="mr-2 h-4 w-4" /> Copy Ledger
                        </Button>
                      </CardHeader>
                      <CardContent className="grid gap-3 pt-4 text-xs text-slate-300">
                        <div className="rounded-md border border-slate-900/70 bg-slate-950 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">JSONL</p>
                          <pre className="mt-2 whitespace-pre-wrap font-mono text-[12px] leading-snug text-slate-200">
                            {`{"quote":"deterministic manifest","inference":"rerun integrity","nt_claim":"non-consolation","source":"${selectedPrompt?.title ?? ""}"}`}
                          </pre>
                        </div>
                        <div className="rounded-md border border-slate-900/70 bg-slate-950 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Enhanced Prompt</p>
                          <pre className="mt-2 whitespace-pre-wrap font-mono text-[12px] leading-snug text-slate-200">
                            {activeRecord?.output ?? "Run Professor Nihil — Ledger for JSONL stream."}
                          </pre>
                        </div>
                        <div className="rounded-md border border-slate-900/70 bg-slate-950 p-3 text-slate-300">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Fidelity Checks</p>
                          <p className="mt-2 flex items-center gap-2 text-emerald-300">
                            <ShieldCheck className="h-3.5 w-3.5" /> Over-interpretation guard active.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="json" className="mt-4">
                    <Card className="border-slate-900 bg-slate-950/90">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-900/60 pb-4">
                        <CardTitle className="text-sm text-slate-100">Record JSON</CardTitle>
                        <Button size="sm" variant="outline" className="border-slate-800 text-xs text-slate-300" onClick={() => activeRecord && handleCopy(JSON.stringify(activeRecord, null, 2), "Record JSON") }>
                          <FileJson className="mr-2 h-4 w-4" /> Copy
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-4 text-xs text-slate-300">
                        <pre className="max-h-[420px] whitespace-pre-wrap rounded-md border border-slate-900/60 bg-slate-950 p-3 font-mono text-[12px] leading-snug text-slate-200">
                          {activeRecord ? JSON.stringify(activeRecord, null, 2) : "Run enhancement to produce record."}
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
                {clipboardStatus && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {clipboardStatus}
                  </div>
                )}
              </section>

              <section>
                <Card className="border-slate-900 bg-slate-950/80">
                  <CardHeader className="border-b border-slate-900/60 pb-4">
                    <CardTitle className="flex items-center gap-2 text-sm text-slate-100">
                      <LockKeyhole className="h-4 w-4 text-cyan-400" /> Security & Sync
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 pt-4 text-xs text-slate-300">
                    <div className="grid gap-2 rounded-md border border-slate-900/70 bg-slate-950/90 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Encryption</p>
                      <p>AES-GCM encryption enabled: {promptForgeSettings.encryptionEnabled ? "Yes" : "No"}</p>
                      <p>Passphrase configured: {promptForgeSettings.passphraseSet ? "Yes" : "No"}</p>
                    </div>
                    <div className="grid gap-2 rounded-md border border-slate-900/70 bg-slate-950/90 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sync Targets</p>
                      <p>Google Drive: {promptForgeSettings.sync.drive?.enabled ? promptForgeSettings.sync.drive.rootFolderId : "Disabled"}</p>
                      <p>Obsidian: {promptForgeSettings.sync.obsidian?.enabled ? promptForgeSettings.sync.obsidian.vaultPath : "Disabled"}</p>
                    </div>
                    <div className="grid gap-2 rounded-md border border-slate-900/70 bg-slate-950/90 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">API Keys</p>
                      <div className="grid gap-1">
                        {Object.entries(promptForgeSettings.apiKeys).map(([model, value]) => (
                          <div key={model} className="flex items-center justify-between">
                            <span className="uppercase tracking-wide text-[10px] text-slate-400">{model}</span>
                            <span className="text-slate-200">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2 rounded-md border border-slate-900/70 bg-slate-950/90 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Keyboard Shortcuts</p>
                      <div className="grid gap-1">
                        {Object.entries(promptForgeSettings.keyboard).map(([action, shortcut]) => (
                          <div key={action} className="flex items-center justify-between">
                            <span className="uppercase tracking-wide text-[10px] text-slate-400">{action}</span>
                            <span className="text-slate-200">{shortcut}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section>
                <Card className="border-slate-900 bg-slate-950/80">
                  <CardHeader className="border-b border-slate-900/60 pb-4">
                    <CardTitle className="flex items-center gap-2 text-sm text-slate-100">
                      <Upload className="h-4 w-4 text-cyan-400" /> Import & Export
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 pt-4 text-xs text-slate-300">
                    <div className="rounded-md border border-slate-900/70 bg-slate-950/90 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Export Bundles</p>
                      <p>Markdown, JSON trace, and .pfbundle.json available. Zip bundles for collections.</p>
                    </div>
                    <div className="rounded-md border border-slate-900/70 bg-slate-950/90 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Obsidian Export</p>
                      <p>.md with YAML front-matter + .trace.json generated per record.</p>
                    </div>
                    <div className="rounded-md border border-slate-900/70 bg-slate-950/90 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Drive Sync</p>
                      <p>Hash-based deduplication ensures deterministic storage.</p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section>
                <Card className="border-slate-900 bg-slate-950/80">
                  <CardHeader className="border-b border-slate-900/60 pb-4">
                    <CardTitle className="flex items-center gap-2 text-sm text-slate-100">
 codex/define-loveable-core-tenets-and-data-model
                      <Repeat2 className="h-4 w-4 text-cyan-400" /> Densification Protocol
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 pt-4 text-xs text-slate-300">
                    <div className="rounded-md border border-slate-900/70 bg-slate-950/90 p-3">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
                        <span>Recursive Saturation</span>
                        <span className="text-cyan-300">100% locked</span>
                      </div>
                      <Progress value={100} className="mt-2 h-2 bg-slate-900" />
                      <p className="mt-2 text-slate-200">Iterative sweeps run until no further material remains to densify.</p>
                    </div>
                    <div className="grid gap-3 rounded-md border border-slate-900/70 bg-slate-950/90 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cycles</p>
                      {densificationCycles.map((cycle) => (
                        <div key={cycle.id} className="rounded-md border border-slate-900 bg-slate-950/70 p-3">
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
                            <span>{cycle.focus}</span>
                            <span className="text-cyan-300">{cycle.id}</span>
                          </div>
                          <p className="mt-1 text-slate-200">{cycle.assurance}</p>
                          <ul className="mt-2 space-y-1 text-slate-300">
                            {cycle.artifacts.map((item) => (
                              <li key={item} className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-3 w-3 text-emerald-400" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-3 rounded-md border border-slate-900/70 bg-slate-950/90 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Slices</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {densificationSlices.map((slice) => (
                          <div key={slice.id} className="rounded-md border border-slate-900 bg-slate-950/70 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{slice.title}</p>
                            <p className="mt-1 text-slate-200">{slice.detail}</p>
                            <ul className="mt-2 space-y-1 text-slate-300">
                              {slice.bullets.map((bullet) => (
                                <li key={bullet} className="flex items-start gap-2">
                                  <Sparkles className="mt-0.5 h-3 w-3 text-cyan-300" />
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section>
                <Card className="border-slate-900 bg-slate-950/80">
                  <CardHeader className="border-b border-slate-900/60 pb-4">
                    <CardTitle className="flex items-center gap-2 text-sm text-slate-100">
 main
                      <Flame className="h-4 w-4 text-cyan-400" /> Constraint Matrix
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 pt-4 text-xs text-slate-300">
                    {[pecOmega, professorNihilLedger].map((profile) => (
                      <div key={profile.id} className="rounded-md border border-slate-900/70 bg-slate-950/90 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{profile.name}</p>
                        <ul className="mt-2 space-y-1">
                          {profile.constraints.length > 0 ? (
                            profile.constraints.map((constraint) => (
                              <li key={constraint.id} className="flex items-center gap-2">
                                <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                                <span>{constraint.description} ({constraint.enforcement})</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-slate-500">No explicit constraints.</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>

              <section>
                <Card className="border-slate-900 bg-slate-950/80">
                  <CardHeader className="border-b border-slate-900/60 pb-4">
                    <CardTitle className="flex items-center gap-2 text-sm text-slate-100">
                      <Hourglass className="h-4 w-4 text-cyan-400" /> Pipeline Router
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 pt-4 text-xs text-slate-300">
                    {selectedProfile ? (
                      selectedProfile.pipeline.map((step) => {
                        const routedModel = selectedProfile.modelRouter.find((rule) => rule.match.stepKinds?.includes(step.kind));
                        return (
                          <div key={step.id} className="rounded-md border border-slate-900/70 bg-slate-950/90 p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{step.kind}</p>
                                <p className="mt-1 text-slate-300">{step.systemPrompt}</p>
                              </div>
                              <div className="text-right text-[11px] text-slate-400">
                                <p>Temp: {step.temperature}</p>
                                <p>Max Tokens: {step.maxTokens}</p>
                                <p>Model: {routedModel?.model ?? selectedProfile.modelRouter[0]?.model ?? "local-llm"}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p>Select a profile to inspect router manifest.</p>
                    )}
                  </CardContent>
                </Card>
              </section>
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

const LinkIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-3 w-3", className)}
  >
    <path d="M10.59 13.41a1.5 1.5 0 0 0 2.12 0l3.17-3.17a3 3 0 0 0-4.24-4.24l-1.41 1.41" />
    <path d="M13.41 10.59a1.5 1.5 0 0 0-2.12 0l-3.17 3.17a3 3 0 0 0 4.24 4.24l1.41-1.41" />
  </svg>
);

export default PromptForge;
