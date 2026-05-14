-- File-Brain ingestion system layer
-- Adds durable import manifests, source records, canonical Markdown documents,
-- retrieval chunks, and human review queues beside the existing notes model.

CREATE TABLE IF NOT EXISTS public.ingestion_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_label text,
  import_mode text NOT NULL DEFAULT 'files',
  status text NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'completed', 'completed_with_errors', 'failed')),
  file_count integer NOT NULL DEFAULT 0,
  imported_count integer NOT NULL DEFAULT 0,
  duplicate_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  quarantined_count integer NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
  report_markdown text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.source_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES public.ingestion_batches(id) ON DELETE SET NULL,
  stable_source_id text NOT NULL,
  original_path text,
  original_filename text NOT NULL,
  extension text,
  mime_guess text,
  encoding text NOT NULL DEFAULT 'utf-8',
  size_bytes integer,
  sha256 text NOT NULL,
  normalized_sha256 text,
  imported_at timestamptz NOT NULL DEFAULT now(),
  modified_at_source timestamptz,
  status text NOT NULL DEFAULT 'imported'
    CHECK (status IN ('imported', 'needs_review', 'skipped', 'duplicate', 'error', 'quarantined')),
  error text,
  title_guess text,
  source_preview text,
  frontmatter jsonb NOT NULL DEFAULT '{}'::jsonb,
  headings jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  aliases jsonb NOT NULL DEFAULT '[]'::jsonb,
  wiki_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  markdown_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  canonical_note_id uuid REFERENCES public.notes(id) ON DELETE SET NULL,
  duplicate_of_source_id uuid REFERENCES public.source_files(id) ON DELETE SET NULL,
  review_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.canonical_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_file_id uuid NOT NULL REFERENCES public.source_files(id) ON DELETE CASCADE,
  note_id uuid REFERENCES public.notes(id) ON DELETE SET NULL,
  doc_id text NOT NULL,
  title text NOT NULL,
  canonical_path text NOT NULL,
  markdown text NOT NULL,
  content_type text NOT NULL DEFAULT 'markdown',
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'needs_review', 'archived', 'quarantined')),
  source_hash text NOT NULL,
  normalized_hash text,
  word_count integer NOT NULL DEFAULT 0,
  heading_count integer NOT NULL DEFAULT 0,
  link_count integer NOT NULL DEFAULT 0,
  frontmatter_present boolean NOT NULL DEFAULT false,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, doc_id)
);

CREATE TABLE IF NOT EXISTS public.document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  canonical_document_id uuid NOT NULL REFERENCES public.canonical_documents(id) ON DELETE CASCADE,
  note_id uuid REFERENCES public.notes(id) ON DELETE SET NULL,
  chunk_id text NOT NULL,
  heading_path text[] NOT NULL DEFAULT ARRAY[]::text[],
  ordinal integer NOT NULL DEFAULT 0,
  content text NOT NULL,
  start_offset integer,
  end_offset integer,
  token_estimate integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(canonical_document_id, chunk_id)
);

CREATE TABLE IF NOT EXISTS public.import_review_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES public.ingestion_batches(id) ON DELETE CASCADE,
  source_file_id uuid REFERENCES public.source_files(id) ON DELETE CASCADE,
  canonical_document_id uuid REFERENCES public.canonical_documents(id) ON DELETE CASCADE,
  review_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low', 'medium', 'high')),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'approved', 'rejected', 'resolved')),
  title text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.ingestion_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canonical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_review_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ingestion batches"
  ON public.ingestion_batches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ingestion batches"
  ON public.ingestion_batches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ingestion batches"
  ON public.ingestion_batches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own source files"
  ON public.source_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own source files"
  ON public.source_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own source files"
  ON public.source_files FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own canonical documents"
  ON public.canonical_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own canonical documents"
  ON public.canonical_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own canonical documents"
  ON public.canonical_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own document chunks"
  ON public.document_chunks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own document chunks"
  ON public.document_chunks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own import review items"
  ON public.import_review_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own import review items"
  ON public.import_review_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own import review items"
  ON public.import_review_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ingestion_batches_user_created
  ON public.ingestion_batches(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_source_files_user_hash
  ON public.source_files(user_id, sha256);

CREATE INDEX IF NOT EXISTS idx_source_files_user_normalized_hash
  ON public.source_files(user_id, normalized_sha256);

CREATE INDEX IF NOT EXISTS idx_source_files_batch
  ON public.source_files(batch_id);

CREATE INDEX IF NOT EXISTS idx_canonical_documents_source
  ON public.canonical_documents(source_file_id);

CREATE INDEX IF NOT EXISTS idx_canonical_documents_note
  ON public.canonical_documents(note_id);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document
  ON public.document_chunks(canonical_document_id, ordinal);

CREATE INDEX IF NOT EXISTS idx_import_review_items_batch
  ON public.import_review_items(batch_id, status);

CREATE INDEX IF NOT EXISTS idx_import_review_items_source
  ON public.import_review_items(source_file_id);

CREATE TRIGGER update_ingestion_batches_updated_at
  BEFORE UPDATE ON public.ingestion_batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_source_files_updated_at
  BEFORE UPDATE ON public.source_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_canonical_documents_updated_at
  BEFORE UPDATE ON public.canonical_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_import_review_items_updated_at
  BEFORE UPDATE ON public.import_review_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
