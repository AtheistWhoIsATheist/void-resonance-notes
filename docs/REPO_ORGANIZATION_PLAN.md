# Repo Organization Plan (void-resonance-notes)

This plan is designed to clean up the current monorepo-like sprawl **without breaking the running app first**.

## 1) Diagnose what exists (current state)

From the file layout, the repo is best interpreted as:

- One **React/Vite product app** (`src/`)
- One **Supabase backend surface** (`supabase/`)
- Mixed **R&D/experimental logic** inside app folders (`src/lib`, route pages, and some docs)
- Mixed naming conventions (`nihilism`, `nihiltheism`, `unc-engine`, `prompt-forge`, etc.)

Primary issue is not that there are truly separate apps; it’s that boundaries and naming are inconsistent.

## 2) Target structure (short term, in-place)

Keep a single repo for now, but establish explicit zones:

```text
/
  docs/
    architecture/
    product/
    operations/
  src/
    app/                 # app shell, routes, providers
    features/
      notes/
      analysis/
      knowledge-atlas/
      philosophy-lab/
      nihiltheism/
      prompt-forge/
      unc-engine/
    shared/
      components/
      hooks/
      lib/
      types/
    integrations/
      supabase/
  supabase/
    functions/
    migrations/
    config.toml
  prisma/
```

### Practical mapping from current layout

- `src/pages/*` -> `src/app/routes/*`
- `src/components/<feature>/*` -> `src/features/<feature>/components/*`
- `src/components/ui/*` -> `src/shared/components/ui/*`
- `src/hooks/*` -> split into `src/shared/hooks/*` and feature-specific hooks
- `src/lib/*` -> split into `src/shared/lib/*` and `src/features/*/lib/*`

## 3) Naming cleanup rules

Adopt these rules before moving files:

- Route folders and feature folders use **kebab-case**.
- React components use **PascalCase.tsx**.
- Shared utilities are generic and must not import feature modules.
- Feature-specific terms should be unified (pick either `nihilism` or `nihiltheism` where possible).

## 4) Incremental migration sequence

Do this over small PRs:

1. **Create folders only** (`src/app`, `src/features`, `src/shared`) and move non-runtime docs.
2. Move **UI primitives** (`src/components/ui`) to shared.
3. Migrate one feature at a time (start with least-coupled feature, e.g., `prompt-forge`).
4. Update imports with path aliases in `tsconfig` (`@/app`, `@/features`, `@/shared`).
5. Add lint rule boundaries to prevent cross-feature leakage.
6. Remove/archive dead code after each feature migration.

## 5) Criteria for splitting into multiple repos

Split only when one is true:

- Independent deployment cadence is required.
- Different permission/security boundary is required.
- Distinct teams own components and release separately.

Likely candidates in the future:

- A standalone “knowledge ingestion service” if Supabase functions grow significantly.
- A separate package for shared AI orchestration utilities.

## 6) Guardrails to prevent mess from returning

- Add `CODEOWNERS` by area (`src/features/*`, `supabase/functions/*`, `docs/*`).
- Add architectural linting (import restrictions).
- Require a short “why this folder” section in PR descriptions for new root-level directories.
- Keep all experiments under an explicit `experiments/` directory.

## 7) Suggested immediate next actions

1. Replace placeholder README with a real repo map (done).
2. Create a migration tracking checklist issue/board.
3. Move one vertical slice (`prompt-forge`) to new structure as a proof of approach.
4. Measure build/test before and after each slice move.

---

If you want, the next step can be an actual first migration PR that moves one feature module end-to-end with path aliases and zero behavior changes.
