
-- Caregivers relationship table
CREATE TABLE public.user_caregivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL DEFAULT '',
  caregiver_name TEXT NOT NULL DEFAULT '',
  relationship TEXT,
  can_trigger_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders table
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('medication', 'meal', 'exercise', 'custom', 'check_in', 'proactive_learned')) NOT NULL DEFAULT 'custom',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  photo_url TEXT,
  schedule JSONB NOT NULL DEFAULT '{"type": "daily", "times": ["08:00"], "days_of_week": [1,2,3,4,5,6,7]}'::jsonb,
  persistent BOOLEAN DEFAULT true,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'high',
  active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled reminders (tracking next due time)
CREATE TABLE public.scheduled_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID REFERENCES public.reminders(id) ON DELETE CASCADE,
  next_due_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('active', 'sent', 'completed', 'missed', 'snoozed')) DEFAULT 'active',
  last_sent_at TIMESTAMP WITH TIME ZONE,
  send_count INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity tracking (for ML pattern learning)
CREATE TABLE public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  hour_of_day INTEGER,
  day_of_week INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminder completion history
CREATE TABLE public.reminder_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID REFERENCES public.reminders(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  method TEXT CHECK (method IN ('acknowledged', 'snoozed', 'auto_completed', 'caregiver_confirmed')),
  response_time_seconds INTEGER,
  triggered_by TEXT
);

-- Reminder logs (for caregiver dashboard)
CREATE TABLE public.reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID REFERENCES public.reminders(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('sent', 'completed', 'snoozed', 'missed', 'caregiver_triggered')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  triggered_by_name TEXT,
  metadata JSONB
);

-- ML Pattern predictions
CREATE TABLE public.learned_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type TEXT,
  hour INTEGER CHECK (hour >= 0 AND hour <= 23),
  day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7),
  confidence_score DECIMAL(3,2),
  success_rate DECIMAL(3,2),
  recommended_actions TEXT[],
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scheduled_reminders_next_due ON public.scheduled_reminders(next_due_time) WHERE status = 'active';
CREATE INDEX idx_user_activities_time ON public.user_activities(timestamp DESC);
CREATE INDEX idx_user_activities_hour_dow ON public.user_activities(hour_of_day, day_of_week);
CREATE INDEX idx_reminders_active ON public.reminders(id) WHERE active = true;
CREATE INDEX idx_reminder_logs_time ON public.reminder_logs(timestamp DESC);

-- Enable RLS on all tables
ALTER TABLE public.user_caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learned_patterns ENABLE ROW LEVEL SECURITY;

-- Permissive policies (consistent with existing app - no auth)
CREATE POLICY "Allow full access to user_caregivers" ON public.user_caregivers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to reminders" ON public.reminders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to scheduled_reminders" ON public.scheduled_reminders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to user_activities" ON public.user_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to reminder_completions" ON public.reminder_completions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to reminder_logs" ON public.reminder_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to learned_patterns" ON public.learned_patterns FOR ALL USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON public.reminders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for reminder photos
INSERT INTO storage.buckets (id, name, public) VALUES ('reminder-photos', 'reminder-photos', true);

CREATE POLICY "Allow all uploads to reminder-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reminder-photos');
CREATE POLICY "Allow public reads from reminder-photos" ON storage.objects FOR SELECT USING (bucket_id = 'reminder-photos');
CREATE POLICY "Allow deletes from reminder-photos" ON storage.objects FOR DELETE USING (bucket_id = 'reminder-photos');
