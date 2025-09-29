import {
  PFCollection,
  PFConstraint,
  PFEnhancementProfile,
  PFPrompt,
  PFRecord,
  PFSettings,
  PipelineStep,
  ScoreBreakdown,
  TraceItem,
} from "./prompt-forge-types";

export const pecOmega: PFEnhancementProfile = {
  id: "pec-omega",
  name: "PEC Ω",
  description: "Philosophical enhancement with iterative densification.",
  pipeline: [
    {
      id: "pp",
      kind: "preprocess",
      systemPrompt: "Normalize and classify domain.",
      temperature: 0,
      maxTokens: 5000,
    },
    {
      id: "exp",
      kind: "expand",
      systemPrompt: "Expand with rigor, define terms, add counterpositions.",
      temperature: 0.4,
      maxTokens: 12000,
    },
    {
      id: "con",
      kind: "constrain",
      systemPrompt: "Enforce constraints; mark NT vs Existentialism.",
      temperature: 0.1,
      maxTokens: 6000,
    },
    {
      id: "cri",
      kind: "critic",
      systemPrompt: "Score with rubric; propose fixes.",
      temperature: 0,
      maxTokens: 2000,
    },
    {
      id: "rev",
      kind: "revise",
      systemPrompt: "Apply fixes without drift.",
      temperature: 0.2,
      maxTokens: 6000,
    },
    {
      id: "fmt",
      kind: "format",
      systemPrompt: "Emit clean Markdown prompt.",
      temperature: 0,
      maxTokens: 4000,
    },
    {
      id: "ver",
      kind: "verify",
      systemPrompt: "Check contradictions, undefined terms.",
      temperature: 0,
      maxTokens: 2000,
    },
  ],
  modelRouter: [
    {
      match: { stepKinds: ["preprocess", "critic", "verify"] },
      model: "gpt-5",
    },
    {
      match: { stepKinds: ["expand", "revise", "format"] },
      model: "gpt-5-thinking",
    },
  ],
  scoring: {
    clarity: 15,
    specificity: 15,
    structure: 10,
    logicalRigor: 15,
    phenomenology: 15,
    innovation: 10,
    NTAlignment: 20,
  },
  constraints: [
    {
      id: "nt-vs-ex",
      description: "Never collapse NT into existentialism.",
      enforcement: "critic",
    },
    {
      id: "define-once",
      description: "Define terms at first use.",
      enforcement: "hard-trim",
    },
    {
      id: "no-consolation",
      description: "No consolation rhetoric.",
      enforcement: "regex-guard",
    },
  ],
};

export const professorNihilLedger: PFEnhancementProfile = {
  id: "prof-nihil-ledger",
  name: "Professor Nihil — Ledger",
  description: "Extract quotes → inference → NT claim. Output JSONL + enhanced prompt.",
  pipeline: [
    {
      id: "xp",
      kind: "expand",
      systemPrompt: "Extract quotes, infer meaning, draft NT claim.",
      temperature: 0.2,
      maxTokens: 12000,
    },
    {
      id: "lg",
      kind: "format",
      systemPrompt: "Emit JSONL {quote,inference,nt_claim,source}. Then enhanced prompt.",
      temperature: 0,
      maxTokens: 6000,
    },
    {
      id: "cr",
      kind: "critic",
      systemPrompt: "Check fidelity, flag over-interpretation.",
      temperature: 0,
      maxTokens: 3000,
    },
  ],
  modelRouter: [
    {
      match: { stepKinds: ["expand", "format"] },
      model: "gpt-5-thinking",
    },
    {
      match: { stepKinds: ["critic"] },
      model: "gpt-5",
    },
  ],
  scoring: {
    clarity: 10,
    specificity: 15,
    structure: 10,
    logicalRigor: 20,
    phenomenology: 15,
    innovation: 10,
    NTAlignment: 20,
  },
  constraints: [],
};

export const promptForgeProfiles: PFEnhancementProfile[] = [
  pecOmega,
  professorNihilLedger,
  {
    id: "deterministic-audit",
    name: "Deterministic Audit",
    description: "Minimal drift auditing with manifest logging and verification sweeps.",
    pipeline: [
      {
        id: "prep",
        kind: "preprocess",
        systemPrompt: "Normalize formatting, trim trailing whitespace.",
        temperature: 0,
        maxTokens: 2000,
      },
      {
        id: "crit",
        kind: "critic",
        systemPrompt: "Run deterministic rubric scoring with manifest cross-checks.",
        temperature: 0,
        maxTokens: 2000,
      },
      {
        id: "ver",
        kind: "verify",
        systemPrompt: "Confirm outputs align with logged manifest values.",
        temperature: 0,
        maxTokens: 1000,
      },
    ],
    modelRouter: [
      {
        match: { stepKinds: ["preprocess", "critic", "verify"] },
        model: "local-llm",
      },
    ],
    scoring: {
      clarity: 25,
      specificity: 10,
      structure: 15,
      logicalRigor: 20,
      phenomenology: 5,
      innovation: 5,
      NTAlignment: 20,
    },
    constraints: [
      {
        id: "manifest-lock",
        description: "Every output must embed manifest hash header.",
        enforcement: "critic",
      },
    ],
    styleHints: {
      tone: "forensic",
    },
  },
];

export const promptForgePrompts: PFPrompt[] = [
  {
    id: "prompt-void-manifesto",
    title: "Void Resonance Manifesto",
    raw: `Outline a manifesto that unites apophatic mysticism with post-human design ethics.
- Stage the argument in three movements: Absence, Echo, Resonance.
- Define how nihiltheism diverges from existentialism without consolation rhetoric.
- Include a deterministic ritual for testing alignment drift.`,
    domain: ["philosophy", "nihiltheism", "creative"],
    metadata: {
      createdAt: "2024-02-18T08:11:00.000Z",
      updatedAt: "2024-03-02T13:45:00.000Z",
      source: "paste",
    },
    contextLinks: [
      "obsidian://open?vault=void&file=ritual-matrix",
      "https://example.com/nt-axioms",
    ],
  },
  {
    id: "prompt-ledger-audit",
    title: "Ledger Audit of Desert Fathers",
    raw: `Extract nihiltheistic insights from the Desert Fathers sayings.
Return JSONL entries with direct quotes, inference, and NT claim alignment.
Flag any statements that collapse into existential consolation.
Score phenomenology vs NT alignment and include critical notes.`,
    domain: ["research", "nihiltheism"],
    metadata: {
      createdAt: "2024-03-10T10:15:00.000Z",
      updatedAt: "2024-03-22T17:30:00.000Z",
      source: "file",
    },
    contextLinks: ["/bundles/desert-fathers.pfbundle.json"],
  },
  {
    id: "prompt-automation",
    title: "Automation Pipeline",
    raw: `Design a watch-folder automation that funnels markdown notes into Prompt Forge.
Detail the manifest logging, template chain selection, and export bundles for Obsidian.
Ensure the pipeline stays deterministic across reruns.`,
    domain: ["tech", "code", "nihiltheism"],
    metadata: {
      createdAt: "2024-04-01T06:05:00.000Z",
      updatedAt: "2024-04-04T20:40:00.000Z",
      source: "extension",
    },
    contextLinks: [
      "watch://void-resonance/inbox",
      "obsidian://open?vault=void&file=automations",
    ],
  },
];

export const promptForgeCollections: PFCollection[] = [
  {
    id: "collection-all",
    name: "All Prompts",
    description: "Every prompt stored locally in IndexedDB.",
    promptIds: promptForgePrompts.map((prompt) => prompt.id),
  },
  {
    id: "collection-nt",
    name: "NT Focus",
    description: "Auto-collect prompts tagged with nihiltheism and scores ≥ 70.",
    rule: {
      anyDomain: ["nihiltheism"],
      scoreMin: 70,
    },
    promptIds: ["prompt-void-manifesto", "prompt-ledger-audit"],
  },
  {
    id: "collection-automation",
    name: "Automation Watch",
    description: "Watch folder triggers and scheduled jobs.",
    rule: {
      textIncludes: ["watch", "schedule"],
    },
    promptIds: ["prompt-automation"],
  },
];

export const promptForgeSettings: PFSettings = {
  encryptionEnabled: true,
  passphraseSet: true,
  apiKeys: {
    "gpt-5": "••••-stored-locally",
    "gpt-5-thinking": "••••-stored-locally",
    "local-llm": "enabled",
  },
  sync: {
    drive: { enabled: true, rootFolderId: "drive://void-resonance" },
    obsidian: { enabled: true, vaultPath: "~/Vaults/VoidResonance" },
  },
  keyboard: {
    enhance: "⌘+E",
    diff: "⌘+D",
    batch: "⌘⇧+B",
    clipboardWatch: "⌘⇧+W",
  },
};

export const promptForgeAcceptanceTests = [
  "Deterministic re-runs with same settings.",
  "Bundle import/export yields identical outputs.",
  "No team/collaboration UI or APIs present.",
  "Ledger profile emits valid JSONL.",
  "Obsidian export generates .md + .trace.json.",
  "Batch run handles 25 prompts with per-item logs.",
  "Watch Folder detects and processes within 5s.",
  "Scores render (0–100) with NT Alignment included.",
];

export type EnhancementRunResult = Pick<
  PFRecord,
  "output" | "trace" | "scores" | "version" | "tags"
>;

export const deterministicHash = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 1_000_000;
  }
  return hash;
};

const scoreFromHash = (hash: number, offset: number) => {
  return 50 + ((hash >> offset) % 50);
};

export const generateDeterministicScores = (
  prompt: PFPrompt,
  profile: PFEnhancementProfile
): ScoreBreakdown => {
  const hash = deterministicHash(`${prompt.id}:${profile.id}:${prompt.raw.length}`);
  const clarity = scoreFromHash(hash, 1);
  const specificity = scoreFromHash(hash, 3);
  const structure = scoreFromHash(hash, 5);
  const logicalRigor = scoreFromHash(hash, 7);
  const phenomenology = scoreFromHash(hash, 9);
  const innovation = scoreFromHash(hash, 11);
  const NTAlignment = scoreFromHash(hash, 13);
  const total = Math.round(
    (clarity + specificity + structure + logicalRigor + phenomenology + innovation + NTAlignment) /
      7
  );

  return {
    clarity,
    specificity,
    structure,
    logicalRigor,
    phenomenology,
    innovation,
    NTAlignment,
    total,
    notes: "Scores generated via deterministic manifest hash.",
  };
};

const buildTraceItem = (
  step: PipelineStep,
  prompt: PFPrompt,
  profile: PFEnhancementProfile,
  iteration: number
): TraceItem => {
  const basis = `${prompt.id}:${profile.id}:${step.id}:${iteration}`;
  const hash = deterministicHash(basis);
  const tokensIn = 200 + (hash % 120);
  const tokensOut = 180 + (hash % 160);
  return {
    stepId: step.id,
    model:
      profile.modelRouter.find((rule) => rule.match.stepKinds?.includes(step.kind))?.model ||
      profile.modelRouter[0]?.model ||
      "local-llm",
    input: `# Manifest
promptId: ${prompt.id}
profileId: ${profile.id}
step: ${step.kind}
hash: ${hash}`,
    output: `// ${step.kind.toUpperCase()} RESULT
Deterministic hash ${hash} validates manifest integrity.
HiddenCoT: ${step.hiddenCoT ? "enabled" : "disabled"}.`,
    tokensIn,
    tokensOut,
    durationMs: 250 + (hash % 400),
  };
};

export const generateDeterministicRun = (
  prompt: PFPrompt,
  profile: PFEnhancementProfile,
  iteration: number
): EnhancementRunResult => {
  const trace = profile.pipeline.map((step) => buildTraceItem(step, prompt, profile, iteration));
  const scores = generateDeterministicScores(prompt, profile);
  const manifestHash = deterministicHash(
    `${prompt.id}:${profile.id}:${iteration}:${trace.map((item) => item.tokensOut).join("-")}`
  );
  const output = `## Enhanced Prompt — ${profile.name}

- Manifest hash: ${manifestHash}
- Deterministic iteration: ${iteration}
- Constraints enforced: ${profile.constraints.map((c) => c.id).join(", ") || "none"}

${prompt.raw}

---

Ensure reruns with identical settings return the same manifest hash.`;
  const tags = [profile.name, `${scores.total >= 80 ? "High Resonance" : "Stable"}`];
  return {
    output,
    trace,
    scores,
    version: iteration,
    tags,
  };
};

export const promptForgeRecords: PFRecord[] = [];

export const constraintLookup: Record<string, PFConstraint> = Object.fromEntries(
  promptForgeProfiles.flatMap((profile) => profile.constraints.map((constraint) => [constraint.id, constraint]))
);
