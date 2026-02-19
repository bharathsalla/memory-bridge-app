-- Enable realtime for missed_dose_alerts and scheduled_reminders
ALTER PUBLICATION supabase_realtime ADD TABLE public.missed_dose_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_reminders;