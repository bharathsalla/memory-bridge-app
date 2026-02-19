
-- Table to store missed dose alerts for caregiver dashboard
CREATE TABLE public.missed_dose_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reminder_id UUID REFERENCES public.reminders(id),
  scheduled_reminder_id UUID REFERENCES public.scheduled_reminders(id),
  patient_name TEXT NOT NULL DEFAULT 'Margaret',
  medication_name TEXT NOT NULL,
  dose_time TEXT NOT NULL,
  missed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.missed_dose_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to missed_dose_alerts"
  ON public.missed_dose_alerts
  FOR ALL
  USING (true)
  WITH CHECK (true);
