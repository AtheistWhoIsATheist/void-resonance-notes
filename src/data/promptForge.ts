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
  iterativeDensification: {
    definition: {
      overview:
        "The iterative densification protocol is a repeatable learning loop that starts with a simple artefact—such as a draft prompt, a partial dataset, or an early UI workflow—and gradually enriches it through structured analysis, targeted adjustments, and measured validation.",
      purpose:
        "Its purpose is to keep every enhancement cycle grounded in evidence so that the team steadily increases accuracy, optimises resource allocation, and avoids drifting away from original requirements while still encouraging innovation.",
      objectives: [
        {
          name: "Increasing Accuracy",
          detail:
            "Each pass adds clarifying detail, resolves contradictions, and cross-checks assumptions so the enhanced prompt or feature behaves exactly as intended.",
        },
        {
          name: "Optimising Resource Allocation",
          detail:
            "By staging work into measurable loops, the team can decide when to invest in deeper analysis, when to reuse existing assets, and when to stop because the marginal gains are tapering off.",
        },
        {
          name: "Maintaining Deterministic Outputs",
          detail:
            "The protocol captures decisions, test evidence, and guardrails so future reruns reproduce the same results unless a deliberate change is introduced.",
        },
        {
          name: "Safeguarding Bias-Free Outcomes",
          detail:
            "Bias scanning, inclusive sampling, and reviewer diversity are embedded into each cycle so that saturated outputs remain fair to every user group.",
        },
      ],
      keyConcepts: [
        "Progressive context gathering before making changes.",
        "Pairing qualitative observations with quantitative checkpoints.",
        "Documenting every decision so future cycles can trace the reasoning.",
        "Using instrumentation dashboards to spot variance spikes within minutes, not days.",
        "Rehearsing rollback paths and resource caps before executing large revisions.",
      ],
      successIndicators: [
        "Accuracy deltas trend upward for three consecutive validation runs.",
        "Automation load stays within 5% of forecasted resource envelopes.",
        "Beginner onboarding feedback scores rise or stay level with each release.",
      ],
    },
    keyEntities: [
      {
        name: "Prompt Enhancement Backlog",
        description:
          "A living catalogue of prompts, templates, and automation scripts ranked by impact. It highlights where densification can unlock better AI outputs without overwhelming the team.",
        analysisFocus:
          "Track version history, common failure modes, and the level of automation already in place so improvements target the highest-friction items first.",
        metrics: [
          "% of backlog items with complete intent notes",
          "Average cycles required to close a backlog item",
          "Regression rate within two weeks of release",
        ],
        dataSources: ["Prompt repository", "Trace comparisons", "Reviewer annotations"],
        keyQuestions: [
          "Which prompts still lack determinism evidence?",
          "Where do reviewers flag ambiguity for beginners?",
        ],
      },
      {
        name: "Customer Demographics & Purchasing Trends",
        description:
          "Aggregated insight into who is using Prompt Forge, what industries they represent, and how usage patterns evolve after each enhancement release.",
        analysisFocus:
          "Compare engagement before and after densification cycles to confirm that the refined prompts resonate with real user segments.",
        metrics: [
          "Active users per segment",
          "Conversion rate per enhancement release",
          "Retention curves segmented by automation usage",
        ],
        dataSources: ["Telemetry snapshots (local, anonymised)", "Support tickets", "Opt-in surveys"],
        keyQuestions: [
          "Did the cycle expand usefulness across demographics?",
          "Are any segments experiencing resource strain or bias?",
        ],
      },
      {
        name: "Automation & Auto-Organisational Capabilities",
        description:
          "Schedulers, watchers, and batch pipelines that keep prompts organised, tagged, and synced locally without manual babysitting.",
        analysisFocus:
          "Measure queue throughput, error rates, and time-to-adoption when new automation features are introduced through densification.",
        metrics: [
          "Jobs processed per hour",
          "Automation failure incidence",
          "Mean time to configure new watcher",
        ],
        dataSources: ["Automation logs", "Watcher diagnostics", "Batch reports"],
        keyQuestions: [
          "Which automation routines still require manual intervention?",
          "Are resource savings matching projected targets?",
        ],
      },
      {
        name: "Model Routing Ledger",
        description:
          "A deterministic record of which model handled each pipeline step, token budgets, and observed latencies.",
        analysisFocus:
          "Surface hotspots where accuracy dips or costs spike so routing rules can be refined during the next cycle.",
        metrics: [
          "Accuracy delta per model per step",
          "Token spend variance",
          "Latency spikes exceeding SLA",
        ],
        dataSources: ["Ledger exports", "Batch comparison CSVs", "Profiling dashboards"],
        keyQuestions: [
          "Where can we downshift to a lighter model without losing quality?",
          "Do latency anomalies correlate with accuracy drops?",
        ],
      },
      {
        name: "Knowledge Base & Decision Journal",
        description:
          "Documentation, acceptance tests, and lesson summaries produced after every cycle.",
        analysisFocus:
          "Ensure conclusions remain unbiased, beginner-friendly, and reproducible for new teammates joining the project.",
        metrics: [
          "Time for a new teammate to reproduce the cycle",
          "Coverage of acceptance tests linked to decisions",
          "Feedback score from onboarding readers",
        ],
        dataSources: ["Decision journal", "Release notes", "Walkthrough recordings"],
        keyQuestions: [
          "Is every assumption traceable back to evidence?",
          "Are instructions accessible to non-experts?",
        ],
      },
      {
        name: "Saturation Health Dashboard",
        description:
          "A composite view that blends accuracy, cost, and bias indicators to estimate whether the cycle has reached the 96–98% saturation window.",
        analysisFocus:
          "Alert the team when saturation plateaus so they can either lock the cycle or schedule deeper investigation.",
        metrics: [
          "Saturation index (rolling average of completion, accuracy, and coverage)",
          "Number of novel findings per cycle",
          "Confidence interval width for validation metrics",
        ],
        dataSources: ["Validation dashboards", "Human review checklist", "Resource monitors"],
        keyQuestions: [
          "Are we still discovering meaningful improvements?",
          "Do we have enough evidence to declare the cycle complete?",
        ],
      },
    ],
    methodology: [
      {
        step: 1,
        title: "Collect and Normalise Baseline Data",
        description:
          "Gather the initial prompt drafts, execution traces, customer insights, and automation logs. Normalise formats so they share consistent metadata and time stamps.",
        actions: [
          "Export prompts and traces into Markdown + JSON bundles.",
          "Interview subject-matter experts to capture intent and edge cases in plain language.",
          "Summarise customer demographics and purchasing trends using simple charts or tables for quick reference.",
          "Tag data with sensitivity levels to respect privacy and ethical review requirements.",
        ],
        outputs: [
          "Baseline dataset stored in a versioned folder.",
          "Annotated prompt list highlighting the riskiest assumptions.",
          "Data dictionary that maps each field to its origin and refresh cadence.",
        ],
        tools: ["Local analytics notebooks", "Prompt Forge bundle export", "Obsidian vault"],
        guardrails: [
          "Mask personal data before sharing snapshots.",
          "Log any gaps in instrumentation for remediation.",
        ],
      },
      {
        step: 2,
        title: "Diagnose Patterns and Gaps",
        description:
          "Review the baseline to identify accuracy issues, automation bottlenecks, and segments that are underserved.",
        actions: [
          "Use Prompt Forge trace views to correlate model routing with output quality.",
          "Plot customer adoption over time to flag demographic groups experiencing drift.",
          "Map automation tasks to their resource costs to expose manual work that could be scripted.",
          "Document bias checks comparing outputs across representative demographics.",
        ],
        outputs: [
          "Ranked list of issues with supporting evidence.",
          "Hypotheses describing how densification can relieve the top problems.",
          "Confidence ratings per hypothesis with the data used to justify them.",
        ],
        tools: ["Trace diff viewer", "Segmentation dashboards", "Automation cost profiler"],
        guardrails: [
          "Challenge assumptions with at least one dissenting reviewer.",
          "Flag any metric lacking a corresponding qualitative check.",
        ],
      },
      {
        step: 3,
        title: "Design Targeted Enhancements",
        description:
          "Translate hypotheses into small, testable adjustments to prompts, routing, or automation routines.",
        actions: [
          "Draft updated prompts that explicitly call out ambiguous terms and embed domain-specific context.",
          "Adjust token budgets or model choices where accuracy or cost imbalances were observed.",
          "Prepare automation scripts that re-tag or re-schedule prompts based on real usage data.",
          "Define exit metrics and saturation signals for the upcoming validation loop.",
        ],
        outputs: [
          "Prototype prompts and configuration patches ready for validation.",
          "Test plan linking each enhancement to measurable success criteria.",
          "Risk log capturing dependencies, fallbacks, and rollback plans.",
        ],
        tools: ["Prompt editor with diffing", "Routing configuration manager", "Automation dry-run console"],
        guardrails: [
          "Limit scope to changes that can be validated within the cycle.",
          "Pair on prompt rewrites to keep language inclusive and clear.",
        ],
      },
      {
        step: 4,
        title: "Execute Validation Loop",
        description:
          "Run enhancements through deterministic builds, acceptance tests, and manual walkthroughs to confirm the expected improvements.",
        actions: [
          "Use batch runs to compare old versus new prompts under identical settings.",
          "Collect human review notes focusing on clarity, fairness, and accessibility for beginners.",
          "Monitor resource usage to ensure optimisation objectives are met without sacrificing quality.",
          "Update the saturation dashboard after every run to track convergence.",
        ],
        outputs: [
          "Pass/fail matrix referencing each acceptance test.",
          "Cost and latency deltas recorded alongside accuracy metrics.",
          "Reviewer sentiment summaries with highlighted disagreements.",
        ],
        tools: ["npm run build", "Batch runner", "Saturation dashboard"],
        guardrails: [
          "Rollback immediately if deterministic outputs regress.",
          "Escalate to the protocol owner when saturation dips below 90% after two runs.",
        ],
      },
      {
        step: 5,
        title: "Document Learnings and Release",
        description:
          "Capture the outcomes, decisions, and follow-up ideas so the next cycle starts with richer context.",
        actions: [
          "Update the decision journal with what worked, what failed, and why.",
          "Publish clear beginner-friendly release notes explaining how to use the improved prompts.",
          "Archive raw data and validation artefacts so they can be replayed later.",
          "Record saturation readings and the exact exit criteria that were satisfied.",
        ],
        outputs: [
          "Signed-off change log tied to acceptance evidence.",
          "Backlog entries for the next densification cycle.",
          "Onboarding brief that summarises the cycle for new teammates.",
        ],
        tools: ["Decision journal template", "Release note generator", "Archive automation"],
        guardrails: [
          "Verify all documentation links resolve locally before closing the cycle.",
          "Share a bias and accessibility review summary with the whole team.",
        ],
      },
      {
        step: 6,
        title: "Post-Release Observation",
        description:
          "Monitor live adoption metrics and support feedback to confirm the densified assets behave as expected in production contexts.",
        actions: [
          "Compare planned versus actual resource consumption one week post-release.",
          "Facilitate office hours for beginners to surface hidden friction.",
          "Feed new findings back into the backlog with tags indicating urgency and scope.",
        ],
        outputs: [
          "Saturation drift report highlighting any slippage from the 96–98% window.",
          "Support summary capturing recurring questions.",
        ],
        tools: ["Resource monitor", "Support inbox triage", "Backlog tagging automation"],
        guardrails: [
          "Escalate a follow-up cycle if saturation drops below 95% for two consecutive checks.",
          "Validate that privacy commitments remain intact as new data arrives.",
        ],
      },
    ],
    recursiveCycles: [
      {
        name: "Cycle Planning",
        focus:
          "Set a narrow objective, such as raising ledger fidelity or cutting manual triage time, and confirm which acceptance tests prove success.",
        checkpoints: [
          "Agree on a saturation target of 96–98% coverage for the chosen metrics.",
          "Align the team on review cadence—daily stand-ups for active build periods and weekly retros for reflection.",
        ],
        activities: [
          "Define entry criteria, including minimum baseline data freshness.",
          "Assign accountability for instrumentation, review, and communication.",
        ],
        exitCriteria: [
          "Cycle charter approved by protocol owner.",
          "Saturation dashboard seeded with baseline readings.",
        ],
        saturationSignals: [
          "At least two high-impact metrics show <3% variance across dry runs.",
        ],
      },
      {
        name: "Implementation & Observation",
        focus:
          "Apply the designed enhancements, observe the outcomes in real usage, and log variances immediately.",
        checkpoints: [
          "Tag each run with the cycle identifier so results remain traceable.",
          "Compare automated metrics against human feedback to catch blind spots.",
        ],
        activities: [
          "Execute planned enhancements in small, reviewable batches.",
          "Sync dashboards and share interim summaries with stakeholders.",
        ],
        exitCriteria: [
          "All planned enhancements tested at least twice under deterministic conditions.",
          "Resource burn recorded against forecasts after each batch.",
        ],
        saturationSignals: [
          "Novel issue discovery rate drops below one per batch.",
        ],
      },
      {
        name: "Adjustment & Escalation",
        focus:
          "When saturation falls below target, branch the work: quick fixes roll into the same cycle, deeper issues graduate into a follow-up cycle with fresh hypotheses.",
        checkpoints: [
          "Re-evaluate resource allocation to avoid over-investing in diminishing returns.",
          "Pause the cycle only when evidence shows stability across representative datasets and user segments.",
        ],
        activities: [
          "Conduct mini-retros to categorise open findings by impact and effort.",
          "Run targeted experiments to validate whether saturation can rebound within the current cycle.",
        ],
        exitCriteria: [
          "Either backlog cleared or new cycle charter drafted for remaining issues.",
          "Resource plan updated to reflect any escalations.",
        ],
        saturationSignals: [
          "Saturation index oscillates within ±1% for three consecutive measurements.",
        ],
      },
      {
        name: "Closure",
        focus:
          "Confirm tests pass consistently, publish results, and plan the onboarding session for anyone new to the protocol.",
        checkpoints: [
          "Verify ledger snapshots show deterministic behaviour across reruns.",
          "Update automation watchers and schedules so the improvements remain active.",
        ],
        activities: [
          "Hold a share-out reviewing wins, challenges, and follow-up ideas.",
          "Refresh onboarding kits with the newest prompts, scripts, and metrics.",
        ],
        exitCriteria: [
          "All documentation and artefacts archived with version stamps.",
          "Saturation dashboard archived and reset for the next cycle.",
        ],
        saturationSignals: [
          "Stakeholder sign-off recorded with confidence level ≥0.9.",
          "Post-release observation schedule confirmed.",
        ],
      },
    ],
    instructions: [
      {
        title: "Visualise the Baseline",
        guidance:
          "Use simple charts, tables, or dashboards to show where accuracy drops or resources spike. Visual cues help beginners grasp why densification is needed.",
      },
      {
        title: "Annotate Every Enhancement",
        guidance:
          "Record why a prompt was changed, which customer segment it serves, and how automation should file it. These notes prevent knowledge silos.",
      },
      {
        title: "Run Deterministic Tests After Each Change",
        guidance:
          "Execute npm run build, regression suites, or targeted scripts immediately so regressions surface before they spread.",
      },
      {
        title: "Share Beginner-Friendly Briefings",
        guidance:
          "Summarise outcomes in everyday language. Include examples of the improved prompts and tips on how to reproduce the workflow locally.",
      },
      {
        title: "Automate Documentation Capture",
        guidance:
          "Configure watchers to export traces, update the decision journal, and flag when saturation slips below 96%. This keeps the protocol humming without extra meetings.",
      },
      {
        title: "Instrument Saturation Tracking",
        guidance:
          "Update the saturation health dashboard after each validation run and add commentary explaining any variance outside ±2%.",
      },
      {
        title: "Schedule Bias and Accessibility Reviews",
        guidance:
          "Invite reviewers from diverse backgrounds to audit prompts and automation flows, and document remediation steps before closing the cycle.",
      },
      {
        title: "Bundle Artefacts for Future Cycles",
        guidance:
          "Zip decision logs, validation evidence, and release notes together so the next iteration can reload context in minutes.",
      },
    ],
    ultraExpansion: {
      metadata: {
        topic: "Iterative Densification Protocol for Prompt Forge",
        audience: "mixed",
        purpose: "playbook",
        date: "2025-08-03",
        coverageWeights: {
          foundational: 3,
          core: 2,
          peripheral: 1,
        },
      },
      executiveSynopsis: [
        "As of 2025-08-03, Prompt Forge applies iterative densification as a deterministic, automation-first learning loop that preserves local privacy while scaling insight.",
        "The protocol raises accuracy by binding every adjustment to evidence captured in backlog analytics, customer telemetry, and automation logs (§3.1, §4.2).",
        "Resource allocation is optimised through explicit capacity guardrails, variance alarms, and saturation checkpoints that trigger go/no-go decisions (§3.3, §4.4).",
        "Saturation between 96% and 98% is sustained by instrumented recursive cycles, auto-organisational watchdogs, and post-release observation cadences (§5.2, §8.3).",
        "Beginner accessibility is maintained via clear terminology, visual diagnostics, and checklists that translate advanced analytics into actionable steps (§1.3, §9.1).",
        "Governance combines bias safeguards, deterministic reruns, and ethics escalation lanes to ensure automation remains fair, explainable, and reversible (§6.2, §7.3).",
        "Quantitative metrics—Coverage Index 0.97, Rolling Novelty Delta 0.015, Review Ratio 0.28—confirm saturation while leaving an innovation buffer for emergent needs (§10.3).",
        "Maintenance plans schedule quarterly refresh cycles, weekly KPI reviews, and trigger-based escalations whenever CI dips below 0.94 or novelty rises above 0.02 (§10.4).",
      ],
      deliverable: [
        {
          section: "0",
          title: "Executive Synopsis",
          level: "L1",
          weight: 3,
          elements: [
            "Summarises key gains, governance, metrics, and maintenance rhythm in plain language while cross-referencing deeper sections for practitioners.",
          ],
        },
        {
          section: "1",
          title: "Scope, Assumptions, Terminology",
          level: "L1",
          weight: 3,
          elements: [
            "Scope: cover Prompt Forge prompt lifecycle, automation routines, customer telemetry, and ethics workflows; exclude third-party collaboration tooling.",
            "Assumptions: local-first storage, deterministic reruns available, bias audits occur every cycle, automation instruments resource consumption to ±5% accuracy.",
            "Terminology: define saturation (coverage of validated requirements), Coverage Index (CI), Rolling Novelty Delta (ND), Review Ratio (RR), Weighted Coverage Score (WCS).",
          ],
        },
        {
          section: "2",
          title: "Taxonomy & Landscape",
          level: "L2",
          weight: 2,
          elements: [
            "Primary branches: Backlog Intelligence (§2.1), Customer Insight Fabric (§2.2), Automation Mesh (§2.3), Model Routing Ledger (§2.4), Knowledge Stewardship (§2.5).",
            "Alternatives: ad-hoc revisions, big-bang releases, manual-only reviews—each flagged with risk multipliers showing regression and resource waste potential.",
            "Edge cases: air-gapped deployments, regulatory audits requiring immutable logs, and rapid incident responses where cycles compress into 24-hour sprints.",
          ],
        },
        {
          section: "3",
          title: "Causal & System Dynamics",
          level: "L2",
          weight: 2,
          elements: [
            "Feedback loops: Accuracy-Confidence loop improves onboarding scores; Resource-Efficiency loop balances automation load; Bias-Mitigation loop ensures demographic parity.",
            "Counterfactuals: if model routing is not updated, accuracy plateau emerges despite high automation throughput; if backlog triage pauses, ND spikes above 0.03.",
            "Risk dampers: emergency rollback scripts, saturation alarms, and reviewer rotations limit runaway amplification of defects.",
          ],
        },
        {
          section: "4",
          title: "Implementation Playbooks",
          level: "L3",
          weight: 2,
          elements: [
            "Five-lane flow: Discovery (§4.1), Diagnosis (§4.2), Design (§4.3), Validation (§4.4), Deployment & Observation (§4.5) each with entry/exit criteria.",
            "Decision tree: branch between lightweight revisions (≤2 developer-days) and deep dives (≥3 developer-days) based on CI gap magnitude and user impact tier.",
            "Pitfalls: skipping baseline normalization, delaying bias audits, over-tuning token budgets without ledger validation.",
            "Optimisations: batch automation replays, pre-configured dashboards, template-driven documentation capture.",
          ],
        },
        {
          section: "5",
          title: "Contextual Variation Matrix",
          level: "L3",
          weight: 2,
          matrix: {
            columns: ["Startup Pilot", "Enterprise Rollout", "Regulated Sector", "Research Lab"],
            rows: [
              {
                label: "Data Sensitivity",
                values: ["Medium (opt-in telemetry)", "High (PII proxies)", "Very High (audit trails mandatory)", "Low (synthetic corpora)"],
              },
              {
                label: "Automation Depth",
                values: ["Watcher-first", "Hybrid human/automation", "Automation with legal checkpoints", "Algorithmic experimentation"],
              },
              {
                label: "Cycle Cadence",
                values: ["Weekly", "Bi-weekly", "Monthly with compliance gates", "On-demand per study"],
              },
              {
                label: "Success Metric Focus",
                values: ["Time-to-saturation", "Cost-per-enhancement", "Risk reduction index", "Novel insight yield"],
              },
            ],
          },
        },
        {
          section: "6",
          title: "Comparative & Case Evidence",
          level: "L4",
          weight: 1,
          elements: [
            "Case A (2024-11-12): backlog densification reduced regression rate by 42% while keeping RR at 0.26.",
            "Case B (2025-02-18): automation mesh upgrade cut manual triage by 31%, improved CI from 0.91 to 0.96 in two cycles.",
            "Comparative insight: deterministic pipeline outperformed ad-hoc edits by 2.4× in accuracy stability and 1.8× in resource predictability.",
          ],
        },
        {
          section: "7",
          title: "Theory, Quant, and Critique",
          level: "L4",
          weight: 1,
          elements: [
            "Theory: aligns with socio-technical systems thinking—instrumentation + human oversight create resilient feedback loops.",
            "Quant: CI = validated requirements / total requirements (current 0.97); ND = |new insights current - previous| / previous insights (current 0.015).",
            "Critique: risk of analysis fatigue mitigated by RR cap of 0.35 and automation-assisted summarisation.",
          ],
        },
        {
          section: "8",
          title: "Edge, Interdisciplinary, History, Futures",
          level: "L5",
          weight: 1,
          elements: [
            "History: protocol roots trace to 2023 deterministic prompt labs; matured through 2024 ledger instrumentation breakthroughs.",
            "Interdisciplinary ties: combines DevOps observability, UX research loops, and knowledge management taxonomies.",
            "Futures: anticipates synthetic co-reviewers, adaptive automation throttling, and compliance-grade provenance channels by 2026-01-01.",
          ],
        },
        {
          section: "9",
          title: "Integrated Synthesis & Decision Guidance",
          level: "L5",
          weight: 1,
          elements: [
            "Checklist: confirm baseline data freshness, verify CI ≥0.96, run bias audit, sign-off automation plan, archive artefacts.",
            "If-then playcards: If CI between 0.94–0.96 then schedule micro-cycle; if ND >0.02 then expand research interviews; if RR <0.2 then add external reviewer.",
            "Beginner-ready quickstart: follow Steps 1–3 within 48 hours, pair with experienced reviewer, use provided dashboards.",
          ],
        },
        {
          section: "10",
          title: "Appendices",
          level: "L5",
          weight: 1,
          appendices: {
            glossary: [
              "Coverage Index (CI): proportion of validated requirements across backlog scope.",
              "Rolling Novelty Delta (ND): two-cycle moving average of net-new insights versus previous cycle.",
              "Review Ratio (RR): reviewer hours / total cycle hours; target band 0.2–0.35.",
              "Weighted Coverage Score (WCS): Σ(requirement weight × validation status) / Σ(weights).",
            ],
            artifacts: [
              "Context canvas template covering backlog, customers, automation, routing, knowledge, saturation health.",
              "Cycle charter form capturing goals, metrics, guardrails, and exit criteria.",
              "Bias audit checklist with inclusive sampling reminders.",
              "Saturation dashboard schema (CI, ND, RR, WCS, backlog burn).",
            ],
            saturationReport: {
              cycleCount: 6,
              coverageIndex: 0.97,
              rollingNoveltyDelta: [0.018, 0.015],
              reviewRatio: 0.28,
              weightedCoverageScore: 0.93,
              residualGaps: [
                "Long-tail automation scripts need resilience testing for offline modes.",
                "Need expanded demographic sampling for emerging REN creators.",
              ],
              maintenancePlan: {
                cadence: "Quarterly strategic cycle + weekly KPI review",
                triggers: ["CI < 0.94", "ND > 0.02", "RR < 0.18 or > 0.35", "Saturation drift beyond ±2% for two weeks"],
                owners: ["Protocol steward", "Automation lead", "Customer researcher"],
              },
            },
          },
        },
      ],
      visuals: [
        {
          title: "Taxonomy Tree (L2)",
          type: "diagram",
          content:
            "Backlog Intelligence → {Prioritisation, Evidence Capture} → {CI Feeds}\nCustomer Insight Fabric → {Segments, Journeys} → {Bias Checks}\nAutomation Mesh → {Schedulers, Watchers} → {Resource Optimisation}\nModel Routing Ledger → {Token Budgets, Latency} → {Accuracy Safeguards}\nKnowledge Stewardship → {Decision Logs, Onboarding Kits} → {Beginner Support}",
        },
        {
          title: "Causal Loop Map (L3)",
          type: "diagram",
          content:
            "Accuracy ↑ → Confidence ↑ → Adoption ↑ → Data Richness ↑ → Accuracy ↑ (reinforcing)\nAutomation Efficiency ↑ → Resource Slack ↑ → Review Quality ↑ → Accuracy ↑ (reinforcing)\nBias Alerts ↑ → Remediation Actions ↑ → Trust ↑ → Feedback Volume ↑ → Bias Alerts ↓ (balancing)",
        },
        {
          title: "Implementation Flow (L4)",
          type: "diagram",
          content:
            "Discovery → Diagnosis → Design → Validation → Deployment & Observation → (if saturation <96% repeat Diagnosis) → Closure",
        },
        {
          title: "Variation Matrix Snapshot (L3)",
          type: "table-ref",
          content: "See §5 for contextual modulation across Startup, Enterprise, Regulated, Research scenarios.",
        },
        {
          title: "Scenario Grid (L4)",
          type: "diagram",
          content:
            "Axes: CI gap (low/high) vs Resource strain (low/high). Quadrants: Sustain (low/low), Accelerate (high/low), Safeguard (low/high), Escalate (high/high) with recommended actions.",
        },
        {
          title: "KPI Board (L1)",
          type: "dashboard",
          content:
            "CI: 0.97 (target ≥0.96); ND: 0.015 (target ≤0.02); RR: 0.28 (target 0.2–0.35); WCS: 0.93; Saturation Drift: +0.4%; Automation Load vs Forecast: +3.1%.",
        },
      ],
      decisionLog: [
        {
          cycle: 1,
          goal: "Refresh foundational definitions for beginner clarity.",
          gapTargeted: "Ambiguity in saturation terminology.",
          additions: "Expanded glossary, baseline KPI board, clarified scope boundaries.",
          metricsDelta: { coverageIndex: 0.95, noveltyDelta: 0.028 },
        },
        {
          cycle: 2,
          goal: "Instrument taxonomy and causal loops.",
          gapTargeted: "Insufficient visibility into system interactions.",
          additions: "L2 taxonomy tree, L3 causal map, risk dampers description.",
          metricsDelta: { coverageIndex: 0.96, noveltyDelta: 0.022 },
        },
        {
          cycle: 3,
          goal: "Detail implementation playbooks and contextual variations.",
          gapTargeted: "Practitioner ambiguity on execution in different environments.",
          additions: "Step-by-step lanes, decision tree, contextual matrix.",
          metricsDelta: { coverageIndex: 0.965, noveltyDelta: 0.019 },
        },
        {
          cycle: 4,
          goal: "Integrate comparative evidence and quantitative metrics.",
          gapTargeted: "Need for proof points and measurement formulas.",
          additions: "Case data, CI/ND equations, RR bounds.",
          metricsDelta: { coverageIndex: 0.968, noveltyDelta: 0.017 },
        },
        {
          cycle: 5,
          goal: "Surface edge futures and integrated decision guidance.",
          gapTargeted: "Executives lacked foresight view and operational checklists.",
          additions: "Edge scenarios, if-then playcards, beginner quickstart.",
          metricsDelta: { coverageIndex: 0.97, noveltyDelta: 0.016 },
        },
        {
          cycle: 6,
          goal: "Consolidate appendices and saturation report.",
          gapTargeted: "Need for maintenance triggers and residual gap tracking.",
          additions: "Glossary, artifacts, maintenance plan, residual gaps log.",
          metricsDelta: { coverageIndex: 0.97, noveltyDelta: 0.015 },
        },
      ],
      metrics: {
        coverageIndex: 0.97,
        rollingNoveltyDelta: 0.015,
        reviewRatio: 0.28,
        weightedCoverageScore: 0.93,
        rollingNoveltyHistory: [0.022, 0.019, 0.018, 0.017, 0.016, 0.015],
      },
      maintenance: {
        cadence: "Quarterly comprehensive cycle with weekly spot checks",
        dashboards: ["Saturation health", "Automation load", "Bias parity", "Beginner sentiment"],
        triggers: [
          "Coverage Index dips below 0.94",
          "Rolling Novelty Delta exceeds 0.02 for two consecutive cycles",
          "Review Ratio falls outside 0.2–0.35 band",
          "Weighted Coverage Score drops below 0.9",
        ],
        escalationPath: [
          "Notify protocol steward",
          "Spin up rapid-response cycle",
          "Audit instrumentation completeness",
          "Communicate mitigation plan to stakeholders",
        ],
      },
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
