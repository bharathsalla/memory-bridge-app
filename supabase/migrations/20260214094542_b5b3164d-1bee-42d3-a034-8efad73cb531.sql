
-- Medications table
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  time TEXT NOT NULL,
  instructions TEXT DEFAULT '',
  taken BOOLEAN DEFAULT false,
  taken_at TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '📋',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vitals table
CREATE TABLE public.vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'blood_pressure', 'heart_rate', 'weight', 'sleep', 'steps', 'temperature'
  value TEXT NOT NULL,
  unit TEXT DEFAULT '',
  recorded_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

-- For demo/prototype: allow full access (no auth required)
-- In production, these should be scoped to user_id
CREATE POLICY "Allow full access to medications" ON public.medications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to vitals" ON public.vitals FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for patient dashboard live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.medications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vitals;
