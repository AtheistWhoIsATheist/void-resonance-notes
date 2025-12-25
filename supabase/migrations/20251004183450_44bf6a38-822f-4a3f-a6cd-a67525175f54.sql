-- Create table for storing concept relationships between notes
CREATE TABLE IF NOT EXISTS public.note_concept_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  target_note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_concepts jsonb NOT NULL DEFAULT '[]'::jsonb,
  link_strength numeric NOT NULL DEFAULT 0,
  link_type text NOT NULL DEFAULT 'conceptual',
  ai_generated boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source_note_id, target_note_id)
);

-- Create table for tracking conceptual gaps (lacunae)
CREATE TABLE IF NOT EXISTS public.conceptual_lacunae (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  missing_concept_id text NOT NULL,
  related_concepts jsonb NOT NULL DEFAULT '[]'::jsonb,
  suggested_traditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  priority_score numeric NOT NULL DEFAULT 0,
  notes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, missing_concept_id)
);

-- Create table for cross-tradition bridge suggestions
CREATE TABLE IF NOT EXISTS public.cross_tradition_bridges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tradition_a text NOT NULL,
  tradition_b text NOT NULL,
  bridge_concept text NOT NULL,
  description text,
  supporting_note_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  resonance_score numeric NOT NULL DEFAULT 0,
  ai_generated boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.note_concept_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conceptual_lacunae ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_tradition_bridges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for note_concept_links
CREATE POLICY "Users can view own note links"
  ON public.note_concept_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own note links"
  ON public.note_concept_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own note links"
  ON public.note_concept_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own note links"
  ON public.note_concept_links FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for conceptual_lacunae
CREATE POLICY "Users can view own lacunae"
  ON public.conceptual_lacunae FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lacunae"
  ON public.conceptual_lacunae FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lacunae"
  ON public.conceptual_lacunae FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lacunae"
  ON public.conceptual_lacunae FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for cross_tradition_bridges
CREATE POLICY "Users can view own bridges"
  ON public.cross_tradition_bridges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bridges"
  ON public.cross_tradition_bridges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bridges"
  ON public.cross_tradition_bridges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bridges"
  ON public.cross_tradition_bridges FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_note_links_source ON public.note_concept_links(source_note_id);
CREATE INDEX idx_note_links_target ON public.note_concept_links(target_note_id);
CREATE INDEX idx_note_links_user ON public.note_concept_links(user_id);
CREATE INDEX idx_lacunae_user ON public.conceptual_lacunae(user_id);
CREATE INDEX idx_bridges_user ON public.cross_tradition_bridges(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_note_links_updated_at
  BEFORE UPDATE ON public.note_concept_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lacunae_updated_at
  BEFORE UPDATE ON public.conceptual_lacunae
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bridges_updated_at
  BEFORE UPDATE ON public.cross_tradition_bridges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();