export type ModelID = "gpt-5-thinking" | "gpt-5" | "claude-opus" | "gemini-2.5" | "local-llm";

export interface PFPrompt {
  id: string;
  title: string;
  raw: string;
  domain?: ("philosophy" | "tech" | "creative" | "research" | "journal314" | "nihiltheism" | "ren" | "code")[];
  metadata: { createdAt: string; updatedAt: string; source?: "paste" | "file" | "web" | "extension" };
  contextLinks?: string[];
}

export interface PipelineStep {
  id: string;
  kind: "preprocess" | "expand" | "constrain" | "critic" | "revise" | "format" | "verify";
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  model?: ModelID;
  hiddenCoT?: boolean;
}

export interface RouterRule {
  match: {
    stepKinds?: PipelineStep["kind"][];
    tokenBudgetMin?: number;
    domainIncludes?: string[];
  };
  model: ModelID;
}

export interface ScoreWeights {
  clarity: number;
  specificity: number;
  structure: number;
  logicalRigor: number;
  phenomenology: number;
  innovation: number;
  NTAlignment: number;
}

export interface PFConstraint {
  id: string;
  description: string;
  enforcement: "critic" | "hard-trim" | "regex-guard";
}

export interface PFEnhancementProfile {
  id: string;
  name: string;
  description: string;
  pipeline: PipelineStep[];
  modelRouter: RouterRule[];
  scoring: ScoreWeights;
  constraints: PFConstraint[];
  styleHints?: Record<string, string>;
}

export interface TraceItem {
  stepId: string;
  model: ModelID;
  input: string;
  output: string;
  tokensIn: number;
  tokensOut: number;
  durationMs: number;
}

export interface ScoreBreakdown {
  clarity: number;
  specificity: number;
  structure: number;
  logicalRigor: number;
  phenomenology: number;
  innovation: number;
  NTAlignment: number;
  total: number;
  notes: string;
}

export interface PFRecord {
  id: string;
  promptId: string;
  profileId: string;
  inputSnapshot: PFPrompt;
  output: string;
  trace: TraceItem[];
  scores: ScoreBreakdown;
  tags: string[];
  version: number;
}

export interface AutoFolderRule {
  anyDomain?: string[];
  allTags?: string[];
  textIncludes?: string[];
  scoreMin?: number;
}

export interface PFCollection {
  id: string;
  name: string;
  description?: string;
  rule?: AutoFolderRule;
  promptIds: string[];
}

export interface PFSettings {
  encryptionEnabled: boolean;
  passphraseSet: boolean;
  apiKeys: Partial<Record<ModelID, string>>;
  sync: {
    drive?: { enabled: boolean; rootFolderId?: string };
    obsidian?: { enabled: boolean; vaultPath?: string };
  };
  keyboard: Record<string, string>;
}
