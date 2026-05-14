# Repo Organization Plan

This plan keeps `void-resonance-notes` as one deployable app while making the boundaries obvious enough that future work does not sprawl.

## Current Interpretation

The repo contains:

- one React/Vite product app in `src/`
- one Supabase backend surface in `supabase/`
- one source corpus in `content/`
- architecture and operating documentation in `docs/`
- schema experiments in `prisma/`

The main organizational risk is not that the repo has multiple apps. The risk is that runtime code, research corpus material, and planning documents become visually indistinguishable.

## Current Root Structure

```text
/
  content/
    definitions/
    nihilism/
  docs/
    architecture/
    operations/
    reference/
  prisma/
  public/
  src/
  supabase/
```

## Source Code Target Structure

The next source-code migration should be incremental:

```text
src/
  app/
    routes/
    providers/
  features/
    notes/
    analysis/
    knowledge-atlas/
    philosophy-lab/
    nihiltheism-agent/
    prompt-forge/
    unc-engine/
  shared/
    components/
    hooks/
    lib/
    types/
  integrations/
    supabase/
```

## Migration Sequence

1. Keep the top-level boundaries stable: `content`, `docs`, `src`, `supabase`.
2. Move one app feature at a time into `src/features/`.
3. Move UI primitives only after import aliases are prepared.
4. Add path aliases for `@/features`, `@/shared`, and `@/app`.
5. Add lint rules to prevent shared code from importing feature code.
6. Validate with build and lint after each vertical slice.

## Naming Rules

- Root directories use lowercase nouns.
- Feature directories use kebab-case.
- React components use PascalCase.
- Research corpus files may preserve historical filenames.
- Docs should be grouped by purpose: architecture, operations, reference.

## Guardrails

- Do not add new root directories casually.
- Do not move corpus material into `src/`.
- Do not make corpus intake a standalone app; it belongs to the Nihiltheism agent workflow.
- Do not delete historical source notes during cleanup.
- Prefer index files and metadata over flattening the research corpus.

## Next Good PR

Move one low-risk feature into `src/features/` with import aliases and no behavior change. `prompt-forge` is the best candidate because it is relatively self-contained.
