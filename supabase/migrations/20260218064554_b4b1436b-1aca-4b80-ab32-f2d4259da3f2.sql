
-- Add shared_by column to memories table for caregiver-shared memories
ALTER TABLE public.memories ADD COLUMN shared_by text DEFAULT NULL;
ALTER TABLE public.memories ADD COLUMN shared_message text DEFAULT NULL;
ALTER TABLE public.memories ADD COLUMN location text DEFAULT NULL;
ALTER TABLE public.memories ADD COLUMN photo_url text DEFAULT NULL;
ALTER TABLE public.memories ADD COLUMN shared_at timestamp with time zone DEFAULT NULL;
ALTER TABLE public.memories ADD COLUMN viewed_by_patient boolean DEFAULT false;
