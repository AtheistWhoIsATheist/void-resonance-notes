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

1. User attaches `.txt`, `.text`, `.md`, or `.markdown` files from the root chatbot composer.
2. `src/lib/corpus-intake.ts` prepares source text, normalizes line endings, hashes content, and builds the Corpus Intake Brief.
3. `bulk-import` stores source records, canonical documents, chunks, tags, notes, Nihiltheism analysis metadata, and review items.
4. The active conversation stores the latest ingestion batch ID and corpus brief.
5. `ai-chat` receives the active batch ID, retrieves relevant document chunks, and injects provenance-aware corpus context into the model prompt.
6. The agent uses that context to clarify, densify, and unravel the imported corpus as a living second brain.

The older `BulkImport` card remains available for PKM/agent workspaces, but the root chatbot composer is now the primary seamless intake surface.

## Key Files

- `src/pages/NihiltheismEngine.tsx`
- `src/pages/Index.tsx`
- `src/components/pkm/BulkImport.tsx`
- `src/lib/corpus-intake.ts`
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
