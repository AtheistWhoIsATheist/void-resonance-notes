export const promptForgeSpec = {
  product: {
    name: "Prompt Forge",
    mode: "single-user",
    principles: [
      "Local-first with optional sync",
      "Deterministic, reproducible enhancement pipelines",
      "Automation-first UX (batch, chains, schedules, watchers)",
      "No collaboration features anywhere in UI/API",
    ],
  },
  models: {
    supported: [
      "gpt-5-thinking",
      "gpt-5",
      "claude-opus",
      "gemini-2.5",
      "local-llm",
    ],
    routingDefaults: {
      preprocess: "gpt-5",
      critic: "gpt-5",
      verify: "gpt-5",
      expand: "gpt-5-thinking",
      revise: "gpt-5-thinking",
      format: "gpt-5-thinking",
    },
  },
  dataModel: {
    types: {
      PFPrompt: {
        id: "uuid",
        title: "string",
        raw: "string",
        domain: [
          "philosophy",
          "tech",
          "creative",
          "research",
          "journal314",
          "nihiltheism",
          "ren",
          "code",
        ],
        metadata: {
          createdAt: "iso8601",
          updatedAt: "iso8601",
          source: ["paste", "file", "web", "extension"],
        },
        contextLinks: ["string"],
      },
      PFEnhancementProfile: {
        id: "string",
        name: "string",
        description: "string",
        pipeline: [{ "$ref": "PipelineStep" }],
        modelRouter: [{ "$ref": "RouterRule" }],
        scoring: { "$ref": "ScoreWeights" },
        constraints: [{ "$ref": "PFConstraint" }],
        styleHints: {
          "$type": "record<string,string>",
          optional: true,
        },
      },
      PipelineStep: {
        id: "string",
        kind: [
          "preprocess",
          "expand",
          "constrain",
          "critic",
          "revise",
          "format",
          "verify",
        ],
        systemPrompt: "string",
        temperature: "number",
        maxTokens: "number",
        model: { "$ref": "ModelID", optional: true },
        hiddenCoT: { "$type": "boolean", optional: true },
      },
      RouterRule: {
        match: {
          stepKinds: ["PipelineStep.kind"],
          tokenBudgetMin: "number",
          domainIncludes: ["string"],
        },
        model: { "$ref": "ModelID" },
      },
      ModelID: [
        "gpt-5-thinking",
        "gpt-5",
        "claude-opus",
        "gemini-2.5",
        "local-llm",
      ],
      ScoreWeights: {
        clarity: "number",
        specificity: "number",
        structure: "number",
        logicalRigor: "number",
        phenomenology: "number",
        innovation: "number",
        NTAlignment: "number",
      },
      PFConstraint: {
        id: "string",
        description: "string",
        enforcement: ["critic", "hard-trim", "regex-guard"],
      },
      PFRecord: {
        id: "uuid",
        promptId: "uuid",
        profileId: "string",
        inputSnapshot: { "$ref": "PFPrompt" },
        output: "string",
        trace: [{ "$ref": "TraceItem" }],
        scores: { "$ref": "ScoreBreakdown" },
        tags: ["string"],
        version: "number",
      },
      TraceItem: {
        stepId: "string",
        model: { "$ref": "ModelID" },
        input: "string",
        output: "string",
        tokensIn: "number",
        tokensOut: "number",
        durationMs: "number",
      },
      PFCollection: {
        id: "uuid",
        name: "string",
        description: "string?",
        rule: { "$ref": "AutoFolderRule" },
        promptIds: ["uuid"],
      },
      AutoFolderRule: {
        anyDomain: ["string"],
        allTags: ["string"],
        textIncludes: ["string"],
        scoreMin: "number",
      },
      PFSettings: {
        encryptionEnabled: "boolean",
        passphraseSet: "boolean",
        apiKeys: {
          "$type": "record<ModelID,string>",
          partial: true,
        },
        sync: {
          drive: {
            enabled: "boolean",
            rootFolderId: "string?",
          },
          obsidian: {
            enabled: "boolean",
            vaultPath: "string?",
          },
        },
        keyboard: { "$type": "record<string,string>" },
      },
    },
  },
  preloadedProfiles: [
    {
      id: "pec-omega",
      name: "PEC Ω",
      description: "Philosophical enhancement with iterative densification.",
      pipeline: [
        {
          id: "pp",
          kind: "preprocess",
          systemPrompt: "Normalize and classify domain.",
          temperature: 0.0,
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
          temperature: 0.0,
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
          temperature: 0.0,
          maxTokens: 4000,
        },
        {
          id: "ver",
          kind: "verify",
          systemPrompt: "Check contradictions, undefined terms.",
          temperature: 0.0,
          maxTokens: 2000,
        },
      ],
      modelRouter: [
        {
          match: {
            stepKinds: ["preprocess", "critic", "verify"],
          },
          model: "gpt-5",
        },
        {
          match: {
            stepKinds: ["expand", "revise", "format"],
          },
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
    },
    {
      id: "prof-nihil-ledger",
      name: "Professor Nihil — Ledger",
      description: "Extract quotes → inference → NT claim. Output JSONL + enhanced prompt.",
      pipeline: [
        {
          id: "xp",
          kind: "expand",
          systemPrompt:
            "Treat input as quote corpus. Extract verbatim quotes; for each, infer meaning; draft NT-claim succinctly.",
          temperature: 0.2,
          maxTokens: 12000,
        },
        {
          id: "lg",
          kind: "format",
          systemPrompt:
            "Emit JSONL lines with keys: quote, inference, nt_claim, source?. Then produce a concise Enhanced Prompt that leverages these claims.",
          temperature: 0.0,
          maxTokens: 6000,
        },
        {
          id: "cr",
          kind: "critic",
          systemPrompt: "Check each line for fidelity and over-interpretation; flag mismatches.",
          temperature: 0.0,
          maxTokens: 3000,
        },
      ],
      modelRouter: [
        {
          match: {
            stepKinds: ["expand", "format"],
          },
          model: "gpt-5-thinking",
        },
        {
          match: {
            stepKinds: ["critic"],
          },
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
    },
  ],
  ui: {
    layout: ["sidebar", "main", "output"],
    sidebar: {
      collections: ["All", "Recent", "Journal314", "REN", "Research", "Code", "Drafts"],
      filters: ["domain", "score", "tags", "recency"],
      watchers: true,
    },
    mainPanel: {
      editor: "markdown",
      controls: [
        "Enhance",
        "ProfileChooser",
        "ReRun",
        "Batch",
        "Schedule",
        "Copy",
        "Export",
        "Diff",
        "SaveAsTemplate",
      ],
      contextDrawer: ["attachFiles", "links", "domainSelect"],
      liveWarnings: ["undefinedTerms", "existentialistDrift", "passiveVoice"],
    },
    outputPanel: {
      tabs: ["Enhanced", "Diff", "Trace", "Scores", "Ledger", "JSON"],
      quickCopy: ["Output", "System", "User", "JSON", "Ledger"],
      rerunPerStep: true,
    },
    shortcuts: {
      Enhance: "CmdOrCtrl+E",
      Diff: "CmdOrCtrl+D",
      Batch: "CmdOrCtrl+Shift+B",
      ClipboardWatchToggle: "CmdOrCtrl+Shift+W",
      ReRunStep: "CmdOrCtrl+Shift+R",
      QuickPalette: "CmdOrCtrl+K",
      CopyOutput: "CmdOrCtrl+C",
    },
  },
  automation: {
    batch: true,
    templateChains: true,
    scheduledJobs: true,
    watchFolders: true,
    smartCollections: true,
  },
  importExport: {
    formats: ["markdown", ".pfbundle.json", "trace.json", "zip-collection"],
    obsidian: {
      mdWithFrontmatter: true,
      companionTraceJson: true,
    },
    driveSync: {
      enabled: false,
      hashDedup: true,
    },
  },
  security: {
    localEncryption: {
      algorithm: "AES-GCM",
      passphraseOptional: true,
    },
    telemetry: "none-by-default",
    redaction: {
      maskEmail: true,
      maskKeys: true,
      maskPaths: true,
    },
  },
  acceptanceTests: [
    "Deterministic re-run with same settings",
    "Bundle export/import reproducible",
    "No collaboration UI/API present",
    "Ledger JSONL valid for Professor Nihil profile",
    "Obsidian export produces .md + .trace.json",
    "Batch runs handle at least 25 prompts with per-item logs",
    "Watch Folder detects & processes within 5s",
    "Scores render 0–100 with NTAlignment present",
  ],
  defaults: {
    domains: ["philosophy", "journal314", "nihiltheism", "ren", "research", "code"],
    autoTags: ["Void", "Nothingness", "Abyssal", "Paradox", "Ledger-Ready"],
    constraintsLibrary: [
      {
        id: "NT-vs-Existentialism",
        description: "Never collapse NT into existentialism; explicitly mark the distinction.",
        enforcement: "critic",
      },
      {
        id: "Define-once",
        description:
          "Define technical terms at first use; avoid re-defining unless scope changes.",
        enforcement: "hard-trim",
      },
      {
        id: "No-Consolation",
        description: "Forbid therapeutic padding; keep apophatic rigor.",
        enforcement: "regex-guard",
      },
    ],
  },
} as const;

export type PromptForgeSpec = typeof promptForgeSpec;
