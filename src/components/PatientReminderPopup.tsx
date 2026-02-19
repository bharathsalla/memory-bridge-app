import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Pill, AlertTriangle } from 'lucide-react';
import IconBox, { iosColors } from '@/components/ui/IconBox';
import CircularTimer from '@/components/ui/CircularTimer';
import { useApp } from '@/contexts/AppContext';
import { useScheduledReminders, useAcknowledgeReminder } from '@/hooks/useReminders';
import { useMedications, useMarkMedicationTaken } from '@/hooks/useCareData';
import { supabase } from '@/integrations/supabase/client';

const PRE_DOSE_MINUTES = 2; // Show popup 2 min before dose
const COUNTDOWN_SECONDS = 120; // 2 minutes countdown

export default function PatientReminderPopup() {
  const { patientName, isCaregiverView } = useApp();
  const { data: scheduledReminders = [] } = useScheduledReminders();
  const { data: medications = [] } = useMedications();
  const acknowledgeReminder = useAcknowledgeReminder();
  const markMedTaken = useMarkMedicationTaken();

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(Date.now());
  const startTimesRef = useRef<Record<string, number>>({});

  // Tick every second
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Find reminder that should show: within 2-min window before dose time
  const activeReminder = scheduledReminders.find(sr => {
    if (dismissed.has(sr.id)) return false;
    if (sr.status !== 'active' && sr.status !== 'sent') return false;

    const doseTime = new Date(sr.next_due_time).getTime();
    const showTime = doseTime - PRE_DOSE_MINUTES * 60 * 1000;

    // Show if now >= showTime AND now <= doseTime + 5s grace
    return now >= showTime && now <= doseTime + 5000;
  });

  const reminderData = activeReminder?.reminders as any;

  // Record start time
  useEffect(() => {
    if (activeReminder && !startTimesRef.current[activeReminder.id]) {
      startTimesRef.current[activeReminder.id] = Date.now();
    }
  }, [activeReminder?.id]);

  // Auto-dismiss when dose time passes (missed)
  useEffect(() => {
    if (!activeReminder || !reminderData) return;
    const doseTime = new Date(activeReminder.next_due_time).getTime();
    if (now > doseTime + 5000) {
      handleMissedDose();
    }
  }, [now, activeReminder?.id]);

  const handleConfirm = useCallback(() => {
    if (!activeReminder || !reminderData) return;
    const startTime = startTimesRef.current[activeReminder.id] || Date.now();

    setDismissed(prev => new Set(prev).add(activeReminder.id));

    acknowledgeReminder.mutate({
      scheduledId: activeReminder.id,
      reminderId: reminderData.id,
      startTime,
    });

    if (reminderData.type === 'medication') {
      const matchingMed = medications.find(m =>
        !m.taken && (
          m.name.toLowerCase().includes(reminderData.message?.toLowerCase()?.split(' ')[0] || '') ||
          reminderData.message?.toLowerCase()?.includes(m.name.toLowerCase())
        )
      );
      if (matchingMed) {
        markMedTaken.mutate(matchingMed.id);
      }
    }
  }, [activeReminder, reminderData, medications]);

  const handleMissedDose = useCallback(async () => {
    if (!activeReminder || !reminderData) return;

    setDismissed(prev => new Set(prev).add(activeReminder.id));

    // Mark as missed in DB
    await supabase
      .from('scheduled_reminders')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', activeReminder.id);

    // Log missed event
    await supabase.from('reminder_logs').insert({
      reminder_id: reminderData.id,
      event_type: 'missed',
      metadata: { reason: 'countdown_expired' },
    });

    // Create missed dose alert for caregiver
    const doseTimeStr = new Date(activeReminder.next_due_time)
      .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    await supabase.from('missed_dose_alerts').insert({
      reminder_id: reminderData.id,
      scheduled_reminder_id: activeReminder.id,
      patient_name: patientName || 'Margaret',
      medication_name: reminderData.message || 'Medication',
      dose_time: doseTimeStr,
    });

    // Add to activities
    await supabase.from('activities').insert({
      description: `⚠️ Missed dose: ${reminderData.message || 'Medication'} at ${doseTimeStr}`,
      time: new Date().toISOString(),
      icon: '⚠️',
      completed: false,
    });
  }, [activeReminder, reminderData, patientName]);

  if (!activeReminder || !reminderData || isCaregiverView) return null;

  // Calculate countdown: seconds remaining until dose time
  const doseTime = new Date(activeReminder.next_due_time).getTime();
  const secondsRemaining = Math.max(0, Math.ceil((doseTime - now) / 1000));
  const elapsed = COUNTDOWN_SECONDS - secondsRemaining;

  return (
    <AnimatePresence>
      <motion.div
        key={activeReminder.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[100] flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-[85%] bg-card rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-destructive px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
            <span className="text-[13px] font-bold text-destructive-foreground">
              Medication Due Soon
            </span>
          </div>

          <div className="px-5 py-6 flex flex-col items-center gap-4">
            {/* Medication info */}
            <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-3 w-full">
              <IconBox Icon={Pill} color={iosColors.red} size={44} iconSize={20} />
              <span className="text-[15px] font-bold text-foreground flex-1">
                {reminderData.message}
              </span>
            </div>

            {/* Circular countdown */}
            <CircularTimer
              seconds={elapsed}
              total={COUNTDOWN_SECONDS}
              size={100}
              label="Time remaining"
            />

            {/* Single action button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirm}
              disabled={acknowledgeReminder.isPending}
              className="w-full py-4 font-bold text-[16px] flex items-center justify-center gap-2 bg-primary text-primary-foreground disabled:opacity-50 rounded-xl"
            >
              <Check className="w-5 h-5" />
              Just Taken
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
