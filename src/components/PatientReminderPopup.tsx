import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Timer, Bell, AlertTriangle, Pill } from 'lucide-react';
import IconBox, { iosColors } from '@/components/ui/IconBox';
import CircularTimer from '@/components/ui/CircularTimer';
import { useApp } from '@/contexts/AppContext';
import { useScheduledReminders, useAcknowledgeReminder, useSnoozeReminder } from '@/hooks/useReminders';
import { useMedications, useMarkMedicationTaken } from '@/hooks/useCareData';
import { supabase } from '@/integrations/supabase/client';

const PRE_DOSE_MINUTES = 10; // Show popup 10 min before dose
const SNOOZE_HIDE_MINUTES = 9; // Hide for 9 min after snooze
const FINAL_WARNING_SECONDS = 60; // 1 minute final countdown

type PopupPhase = 'initial' | 'final_warning' | 'dismissed';

export default function PatientReminderPopup() {
  const { patientName, isCaregiverView } = useApp();
  const { data: scheduledReminders = [] } = useScheduledReminders();
  const { data: medications = [] } = useMedications();
  const acknowledgeReminder = useAcknowledgeReminder();
  const snoozeReminder = useSnoozeReminder();
  const markMedTaken = useMarkMedicationTaken();

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<PopupPhase>('initial');
  const [snoozedUntil, setSnoozedUntil] = useState<Record<string, number>>({});
  const [finalCountdown, setFinalCountdown] = useState(FINAL_WARNING_SECONDS);
  const [now, setNow] = useState(Date.now());
  const startTimesRef = useRef<Record<string, number>>({});

  // Tick every second to check timing
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Find reminder that should show based on dose time logic:
  // Show popup exactly 10 min before dose_time (next_due_time)
  const activeReminder = scheduledReminders.find(sr => {
    if (dismissed.has(sr.id)) return false;
    if (sr.status !== 'active' && sr.status !== 'sent') return false;

    // Check if snoozed
    const snoozeEnd = snoozedUntil[sr.id];
    if (snoozeEnd && now < snoozeEnd) return false;

    const doseTime = new Date(sr.next_due_time).getTime();
    const showTime = doseTime - PRE_DOSE_MINUTES * 60 * 1000;

    // Show if we're within the 10-min window before dose time
    // i.e., now >= showTime AND now <= doseTime + 1 min grace
    return now >= showTime && now <= doseTime + 60 * 1000;
  });

  const reminderData = activeReminder?.reminders as any;

  // Track phase transitions
  useEffect(() => {
    if (!activeReminder) {
      setPhase('initial');
      setFinalCountdown(FINAL_WARNING_SECONDS);
      return;
    }

    // If was snoozed and snooze just expired, switch to final_warning
    const snoozeEnd = snoozedUntil[activeReminder.id];
    if (snoozeEnd && now >= snoozeEnd) {
      setPhase('final_warning');
      setFinalCountdown(FINAL_WARNING_SECONDS);
    }
  }, [activeReminder?.id, now, snoozedUntil]);

  // Final warning countdown
  useEffect(() => {
    if (phase !== 'final_warning' || !activeReminder) return;

    if (finalCountdown <= 0) {
      // Time's up — mark as missed and dismiss
      handleMissedDose();
      return;
    }

    const timer = setTimeout(() => {
      setFinalCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [phase, finalCountdown, activeReminder?.id]);

  // Record start time
  useEffect(() => {
    if (activeReminder && !startTimesRef.current[activeReminder.id]) {
      startTimesRef.current[activeReminder.id] = Date.now();
    }
  }, [activeReminder?.id]);

  const handleConfirm = useCallback(() => {
    if (!activeReminder || !reminderData) return;
    const startTime = startTimesRef.current[activeReminder.id] || Date.now();

    setDismissed(prev => new Set(prev).add(activeReminder.id));
    setPhase('dismissed');

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

  const handleSnooze = useCallback(() => {
    if (!activeReminder || !reminderData) return;

    // Hide for 9 minutes, then show final warning for 1 minute
    const snoozeEnd = Date.now() + SNOOZE_HIDE_MINUTES * 60 * 1000;
    setSnoozedUntil(prev => ({ ...prev, [activeReminder.id]: snoozeEnd }));
    setPhase('initial');

    snoozeReminder.mutate({
      scheduledId: activeReminder.id,
      reminderId: reminderData.id,
      minutes: SNOOZE_HIDE_MINUTES,
    });
  }, [activeReminder, reminderData]);

  const handleMissedDose = useCallback(async () => {
    if (!activeReminder || !reminderData) return;

    setDismissed(prev => new Set(prev).add(activeReminder.id));
    setPhase('dismissed');

    // Mark as missed in DB
    await supabase
      .from('scheduled_reminders')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', activeReminder.id);

    // Log missed event
    await supabase.from('reminder_logs').insert({
      reminder_id: reminderData.id,
      event_type: 'missed',
      metadata: { reason: 'no_response_after_final_warning' },
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

  const displayName = patientName || 'Friend';
  const currentTime = new Date();
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const greeting = currentTime.getHours() < 12 ? 'Good Morning' : currentTime.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  if (!activeReminder || !reminderData || isCaregiverView) return null;

  // Calculate time until dose
  const doseTime = new Date(activeReminder.next_due_time).getTime();
  const minutesUntilDose = Math.max(0, Math.ceil((doseTime - now) / 60000));

  // ── FINAL WARNING PHASE ──
  if (phase === 'final_warning') {
    return (
      <AnimatePresence>
        <motion.div
          key={`final-${activeReminder.id}`}
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
            {/* Urgent header */}
            <div className="bg-destructive px-4 py-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
              <span className="text-[13px] font-bold text-destructive-foreground">
                You are missing your dose in 1 minute!
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

              {/* Circular countdown — 1 minute */}
              <CircularTimer
                seconds={FINAL_WARNING_SECONDS - finalCountdown}
                total={FINAL_WARNING_SECONDS}
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

  // ── INITIAL PHASE — 10 min before dose ──
  return (
    <AnimatePresence>
      <motion.div
        key={activeReminder.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[100] flex items-end justify-center"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full bg-card shadow-2xl overflow-hidden"
          style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-9 h-1 rounded-full bg-muted-foreground/20" />
          </div>

          <div className="px-5 pt-4 pb-6">
            <div className="flex justify-center mb-3">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <IconBox
                  Icon={reminderData.type === 'medication' ? Pill : Bell}
                  color={iosColors.teal}
                  size={60}
                  iconSize={28}
                />
              </motion.div>
            </div>

            <h1 className="text-[22px] font-extrabold text-foreground text-center leading-tight">
              {greeting}, {displayName}
            </h1>
            <p className="text-[14px] text-muted-foreground text-center mt-0.5">{timeStr}</p>

            <div className="flex items-center justify-center gap-1.5 mt-4 mb-1">
              <Bell className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Upcoming Dose in {minutesUntilDose} min
              </span>
            </div>
            {reminderData.created_by && (
              <p className="text-[15px] font-bold text-foreground text-center">
                From {reminderData.created_by}
              </p>
            )}

            <div className="bg-muted/50 rounded-xl p-3.5 mt-3 flex items-center gap-3">
              <IconBox Icon={Pill} color={iosColors.orange} size={44} iconSize={20} />
              <span className="text-[15px] font-bold text-foreground flex-1">{reminderData.message}</span>
            </div>

            {reminderData.photo_url && (
              <img
                src={reminderData.photo_url}
                alt=""
                className="w-full h-28 object-cover mt-3"
                style={{ borderRadius: 10 }}
              />
            )}

            {/* iOS-style circular timer — counting down to dose time */}
            <div className="flex justify-center mt-4 mb-4">
              <CircularTimer
                seconds={PRE_DOSE_MINUTES * 60 - Math.max(0, Math.floor((doseTime - now) / 1000))}
                total={PRE_DOSE_MINUTES * 60}
                size={80}
                label="Until dose time"
              />
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirm}
                disabled={acknowledgeReminder.isPending}
                className="py-3.5 font-bold text-[15px] flex items-center justify-center gap-2 bg-primary text-primary-foreground disabled:opacity-50"
                style={{ borderRadius: 14 }}
              >
                <Check className="w-5 h-5" />
                Done
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSnooze}
                disabled={snoozeReminder.isPending}
                className="py-3.5 font-bold text-[15px] flex items-center justify-center gap-2 border-2 border-primary text-primary bg-transparent disabled:opacity-50"
                style={{ borderRadius: 14 }}
              >
                <Timer className="w-5 h-5" />
                10 Min
              </motion.button>
            </div>

            <p className="text-[10px] text-muted-foreground/50 text-center mt-3">
              This reminder stays until you confirm or snooze
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
