# Void Resonance Notes

A single-repo workspace for the **Philovoid** web app and related knowledge/AI tooling.

## What this repository actually contains

This repo is currently one deployable React/Vite application plus backend assets:

- **Frontend app** (`src/`): React + TypeScript UI for notes, philosophy tools, and knowledge graph workflows.
- **Supabase backend** (`supabase/`): Edge functions, DB migrations, and local config.
- **Prisma schema** (`prisma/`): Data model snapshots/experiments.
- **Architecture docs** (`docs/`): design notes and project planning.

If it feels like “multiple projects mashed together,” that’s because multiple *feature modules* are living in one app without strong boundaries yet.

## Quick start

```bash
npm install
npm run dev
```

## Current top-level map

- `src/pages/` route-level pages (Notes, Analysis, PhilosophyLab, Nihiltheism, PromptForge, etc.)
- `src/components/` reusable UI and feature components
- `src/lib/` app libraries (AI orchestration, markdown export, config, framework logic)
- `src/integrations/supabase/` Supabase client/types for frontend
- `supabase/functions/` Edge Functions (`ai-chat`, `semantic-search`, `generate-embeddings`, etc.)
- `supabase/migrations/` SQL migration history
- `docs/` architecture and cleanup planning docs

## Cleanup + organization plan

See **`docs/REPO_ORGANIZATION_PLAN.md`** for a concrete plan to:

1. Define clear boundaries between `app`, `docs`, and `experiments`.
2. Consolidate feature modules under a predictable folder layout.
3. Decide what should stay in this repo vs move to separate repos.
4. Reduce dead code and duplicated concepts.

## Notes

- Legacy Lovable boilerplate text has been removed from this README.
- Original architecture spec remains at `docs/PHILOVOID_ARCHITECTURE.md`.
