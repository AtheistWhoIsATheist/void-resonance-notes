-- Phase 2: Enable pgvector extension and add embeddings support

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to notes for semantic search
ALTER TABLE public.notes 
ADD COLUMN embedding vector(384);

-- Create index for vector similarity search
CREATE INDEX ON public.notes 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function to search notes by semantic similarity
CREATE OR REPLACE FUNCTION search_notes_by_embedding(
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    notes.id,
    notes.title,
    notes.content,
    1 - (notes.embedding <=> query_embedding) AS similarity
  FROM notes
  WHERE notes.user_id = filter_user_id
    AND notes.embedding IS NOT NULL
    AND 1 - (notes.embedding <=> query_embedding) > match_threshold
  ORDER BY notes.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Add collection summary cache
ALTER TABLE public.collections
ADD COLUMN ai_summary text,
ADD COLUMN summary_generated_at timestamp with time zone;