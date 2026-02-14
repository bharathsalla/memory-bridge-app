
-- Memories table: stores all patient memory entries
CREATE TABLE public.memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'note',
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  emoji TEXT DEFAULT '📝',
  mood TEXT DEFAULT '😊',
  is_favorite BOOLEAN DEFAULT false,
  cognitive_prompt TEXT,
  cognitive_answer TEXT,
  voice_transcript TEXT,
  engagement_score INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Public access for now (no auth in this app)
CREATE POLICY "Allow full access to memories"
  ON public.memories FOR ALL
  USING (true)
  WITH CHECK (true);

-- Cognitive analysis results table: stores AI-generated insights
CREATE TABLE public.cognitive_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_entries INTEGER DEFAULT 0,
  recalled_count INTEGER DEFAULT 0,
  recall_rate NUMERIC(5,2) DEFAULT 0,
  avg_engagement NUMERIC(5,2) DEFAULT 0,
  mood_distribution JSONB DEFAULT '{}',
  alerts JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  daily_breakdown JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cognitive_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to cognitive_insights"
  ON public.cognitive_insights FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable realtime for memories
ALTER PUBLICATION supabase_realtime ADD TABLE public.memories;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON public.memories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
