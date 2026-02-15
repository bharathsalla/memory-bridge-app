import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useReminders() {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useScheduledReminders() {
  return useQuery({
    queryKey: ['scheduled_reminders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_reminders')
        .select('*, reminders(id, title, message, type, photo_url, priority, persistent)')
        .in('status', ['active', 'sent'])
        .order('next_due_time', { ascending: true });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useReminderLogs() {
  return useQuery({
    queryKey: ['reminder_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminder_logs')
        .select('*, reminders(title, type)')
        .order('timestamp', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useLearnedPatterns() {
  return useQuery({
    queryKey: ['learned_patterns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learned_patterns')
        .select('*')
        .order('success_rate', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reminder: {
      type: string;
      title: string;
      message: string;
      priority?: string;
      photo_url?: string;
      schedule?: any;
    }) => {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          type: reminder.type as any,
          title: reminder.title,
          message: reminder.message,
          priority: (reminder.priority || 'high') as any,
          photo_url: reminder.photo_url,
          schedule: reminder.schedule || { type: 'daily', times: ['08:00'], days_of_week: [1,2,3,4,5,6,7] },
          active: true,
          persistent: true,
        })
        .select()
        .single();
      if (error) throw error;

      // Create scheduled entry
      const nextTime = new Date();
      const times = reminder.schedule?.times || ['08:00'];
      if (times[0]) {
        const [h, m] = times[0].split(':').map(Number);
        nextTime.setHours(h, m, 0, 0);
        if (nextTime <= new Date()) nextTime.setDate(nextTime.getDate() + 1);
      }

      await supabase.from('scheduled_reminders').insert({
        reminder_id: data.id,
        next_due_time: nextTime.toISOString(),
        status: 'active',
      });

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      qc.invalidateQueries({ queryKey: ['scheduled_reminders'] });
    },
  });
}

export function useAcknowledgeReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ scheduledId, reminderId, startTime }: { scheduledId: string; reminderId: string; startTime: number }) => {
      const responseTime = Math.floor((Date.now() - startTime) / 1000);

      await supabase
        .from('scheduled_reminders')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', scheduledId);

      await supabase.from('reminder_completions').insert({
        reminder_id: reminderId,
        method: 'acknowledged',
        response_time_seconds: responseTime,
        triggered_by: 'patient',
      });

      await supabase.from('reminder_logs').insert({
        reminder_id: reminderId,
        event_type: 'completed',
        metadata: { response_time: responseTime },
      });

      await supabase.from('user_activities').insert({
        activity_type: 'reminder_completed',
        hour_of_day: new Date().getHours(),
        day_of_week: new Date().getDay() + 1,
        metadata: { reminder_id: reminderId, response_time: responseTime },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scheduled_reminders'] });
      qc.invalidateQueries({ queryKey: ['reminder_logs'] });
    },
  });
}

export function useSnoozeReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ scheduledId, reminderId, minutes = 10 }: { scheduledId: string; reminderId: string; minutes?: number }) => {
      const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);

      await supabase
        .from('scheduled_reminders')
        .update({
          status: 'active',
          next_due_time: snoozeUntil.toISOString(),
        })
        .eq('id', scheduledId);

      await supabase.from('reminder_logs').insert({
        reminder_id: reminderId,
        event_type: 'snoozed',
        metadata: { snooze_minutes: minutes },
      });

      await supabase.from('user_activities').insert({
        activity_type: 'reminder_snoozed',
        hour_of_day: new Date().getHours(),
        day_of_week: new Date().getDay() + 1,
        metadata: { reminder_id: reminderId, snooze_minutes: minutes },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scheduled_reminders'] });
      qc.invalidateQueries({ queryKey: ['reminder_logs'] });
    },
  });
}

export function useSendCaregiverReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { type: string; message: string; photoUrl?: string; caregiverName: string }) => {
      const { data, error } = await supabase.functions.invoke('send-caregiver-reminder', {
        body: payload,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scheduled_reminders'] });
      qc.invalidateQueries({ queryKey: ['reminder_logs'] });
    },
  });
}

export function useAnalyzePatterns() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-user-patterns');
      if (error) throw error;
      return data;
    },
  });
}
