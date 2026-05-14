# Project Structure

This repository has one deployable web app plus supporting corpus, backend, and documentation layers.

## Root Contract

```text
/
  content/      Source Markdown corpus material.
  docs/         Architecture and operating documentation.
  prisma/       Prisma schema experiments and snapshots.
  public/       Static assets served by Vite.
  scripts/      Local maintenance and benchmark utilities.
  src/          React/Vite application source.
  supabase/     Supabase migrations, Edge Functions, and config.
```

No new top-level project folder should be added unless it represents a durable ownership boundary. Experiments belong under `docs/`, `content/`, or a future explicit `experiments/` directory.

## App Layer

`src/` is the running product.

Current conventions:

- `src/pages/` contains route-level screens.
- `src/components/ui/` contains shared UI primitives.
- `src/components/<feature>/` contains feature-specific components.
- `src/lib/` contains framework logic, markdown export, config, and orchestration helpers.
- `src/integrations/supabase/` contains frontend Supabase client/types.

Target convention:

- move toward `src/features/<feature>/` one feature at a time
- keep `src/shared/` for generic UI, hooks, and utilities
- avoid broad moves that break imports without adding architectural clarity

## Backend Layer

`supabase/` owns backend behavior:

- `functions/ai-chat/` - chat and agent context assembly
- `functions/bulk-import/` - corpus intake and source processing
- `functions/generate-embeddings/` - embedding generation
- `functions/semantic-search/` - vector search
- `functions/maintain-knowledge-graph/` - graph maintenance
- `functions/summarize-collection/` - collection summarization
- `migrations/` - SQL history

## Corpus Layer

`content/` holds philosophical source material. These files are intentionally outside `src/` so research corpus files do not look like app code.

Current corpus zones:

- `content/definitions/source-notes/`
- `content/nihilism/source-notes/`

## Documentation Layer

`docs/` is split by purpose:

- `docs/architecture/` for system design
- `docs/operations/` for migration plans, status notes, and runbooks
- `docs/reference/` for durable reference material

## Guardrail

When adding a file, ask which layer owns it:

- app runtime: `src/`
- backend runtime: `supabase/`
- research corpus: `content/`
- project explanation or process: `docs/`
- schema experiment: `prisma/`
- maintenance or local benchmark utility: `scripts/`
