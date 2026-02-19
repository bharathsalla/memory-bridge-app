import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

// ── Types ──
export interface DbMedication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  instructions: string;
  taken: boolean;
  taken_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbActivity {
  id: string;
  time: string;
  description: string;
  icon: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbVital {
  id: string;
  type: string;
  value: string;
  unit: string;
  recorded_at: string;
  notes: string;
  created_at: string;
}

// ── Medications ──
export function useMedications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('time', { ascending: true });
      if (error) throw error;
      return data as DbMedication[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('medications-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medications' }, () => {
        queryClient.invalidateQueries({ queryKey: ['medications'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}

export function useAddMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (med: Omit<DbMedication, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('medications').insert(med).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medications'] }),
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbMedication> & { id: string }) => {
      const { data, error } = await supabase.from('medications').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medications'] }),
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('medications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medications'] }),
  });
}

export function useMarkMedicationTaken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const takenAt = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      
      // Get the medication details first
      const { data: med } = await supabase
        .from('medications')
        .select('name, dosage')
        .eq('id', id)
        .single();

      // Mark medication as taken
      const { error } = await supabase
        .from('medications')
        .update({ taken: true, taken_at: takenAt })
        .eq('id', id);
      if (error) throw error;

      // Also add to activities so it shows in Today's Activity (patient + caregiver)
      if (med) {
        await supabase.from('activities').insert({
          description: `${med.name} ${med.dosage} — Taken`,
          time: takenAt,
          icon: '💊',
          completed: true,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

// ── Activities ──
export function useActivities() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('time', { ascending: true });
      if (error) throw error;
      return data as DbActivity[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('activities-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
        queryClient.invalidateQueries({ queryKey: ['activities'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}

export function useAddActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (act: Omit<DbActivity, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('activities').insert(act).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbActivity> & { id: string }) => {
      const { data, error } = await supabase.from('activities').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
  });
}

// ── Vitals ──
export function useVitals() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['vitals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .order('recorded_at', { ascending: false });
      if (error) throw error;
      return data as DbVital[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('vitals-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vitals' }, () => {
        queryClient.invalidateQueries({ queryKey: ['vitals'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}

export function useAddVital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vital: Omit<DbVital, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('vitals').insert(vital).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vitals'] }),
  });
}

export function useDeleteVital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vitals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vitals'] }),
  });
}
