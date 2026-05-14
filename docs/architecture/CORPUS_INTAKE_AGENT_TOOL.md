# Corpus Intake Agent Tool

Corpus intake is not a standalone file-upload application. It is a tool used by the Nihiltheism agent to turn philosophical source material into structured context.

## Purpose

The tool exists to help the agent:

- clarify unstable philosophical material
- densify fragmentary notes into concepts and questions
- preserve source provenance
- separate source-grounded claims from AI-inferred metadata
- surface duplicates, lacunae, malformed files, and review risks
- produce next actions for notes, knowledge graph work, and conceptual synthesis

## Runtime Flow

1. User attaches files or folders from the Nihiltheism agent workspace.
2. `BulkImport` prepares source text and hashes in the browser.
3. `bulk-import` stores source records, canonical documents, chunks, tags, notes, and review items.
4. `BulkImport` stages a Corpus Intake Brief into the agent prompt.
5. `ai-chat` can include recent ingestion batches, review items, and canonical documents when context is enabled.
6. The agent uses that context to clarify and densify the imported corpus.

## Key Files

- `src/pages/NihiltheismEngine.tsx`
- `src/components/pkm/BulkImport.tsx`
- `supabase/functions/bulk-import/index.ts`
- `supabase/functions/ai-chat/index.ts`
- `supabase/migrations/20260510000000_file_ingestion_system.sql`

## Data Model

The migration adds:

- `ingestion_batches`
- `source_files`
- `canonical_documents`
- `document_chunks`
- `import_review_items`

These tables sit beside the existing app-facing `notes`, `tags`, and `note_tags` tables.

## Design Rule

Do not present corpus intake as a separate destination. It is an instrument in the philosophical workflow: source material enters, audit structures are preserved, and the agent turns the material into a more coherent field of inquiry.
