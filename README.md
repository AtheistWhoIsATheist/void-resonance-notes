# Void Resonance Notes

Void Resonance Notes is a single deployable React/Vite application for Nihiltheism research, notes, philosophical analysis, corpus intake, and knowledge-graph experimentation.

The repo has explicit zones:

- `src/` - the running web app.
- `supabase/` - database migrations, Edge Functions, and Supabase config.
- `content/` - source Markdown corpus material used by the app and research process.
- `docs/` - architecture, operating notes, and project reference.
- `prisma/` - schema snapshots and data-model experiments.
- `scripts/` - local maintenance and benchmark utilities.

## Quick Start

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run build
npm run lint
```

## Architecture Map

Read these first:

- `docs/PROJECT_STRUCTURE.md` - the current folder contract.
- `docs/INDEX.md` - documentation index.
- `docs/architecture/PHILOVOID_ARCHITECTURE.md` - long-form architecture specification.
- `docs/architecture/CORPUS_INTAKE_AGENT_TOOL.md` - how file/corpus ingestion belongs to the agent workflow.
- `docs/operations/REPO_ORGANIZATION_PLAN.md` - incremental organization plan.

## Product Surfaces

- Notes and PKM: `src/pages/Notes.tsx`, `src/components/pkm/`
- Nihiltheism agent: `src/pages/NihiltheismEngine.tsx`
- Philosophy Lab: `src/pages/PhilosophyLab.tsx`, `src/components/philosophy-lab/`
- Knowledge Atlas: `src/pages/KnowledgeAtlas.tsx`, `src/components/knowledge-atlas/`
- UNC Engine: `src/pages/UncEngine.tsx`, `src/components/unc-engine/`
- Prompt Forge: `src/pages/PromptForge.tsx`, `src/data/promptForge.ts`
- Obsidian AI Philosopher: `plugins/philovoid/`

## Corpus Intake

The file-ingestion capability is not a standalone app. It is an agent tool:

1. Source files are imported through the corpus intake tool in the Nihiltheism agent workspace.
2. Supabase records source files, hashes, canonical documents, chunks, review items, and batch reports.
3. The agent receives a Corpus Intake Brief so it can clarify, densify, and unravel philosophical chaos from the imported material.

## Content Corpus

The Markdown source corpus lives under:

- `content/definitions/source-notes/`
- `content/nihilism/source-notes/`

These files are research material, not runtime source code.
