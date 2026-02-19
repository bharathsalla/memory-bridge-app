import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Pill } from 'lucide-react';
import { iosColors } from '@/components/ui/IconBox';
import { useApp } from '@/contexts/AppContext';
import { useScheduledReminders, useAcknowledgeReminder } from '@/hooks/useReminders';
import { useMedications, useMarkMedicationTaken } from '@/hooks/useCareData';
import { supabase } from '@/integrations/supabase/client';
import { formatISTTime } from '@/lib/timeUtils';

const PRE_DOSE_MINUTES = 2;
const COUNTDOWN_SECONDS = 120;
const ALERT_REPEAT_INTERVAL = 15000; // 15 seconds

// Haptic vibration helper
function triggerHaptic() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
  } catch {}
}

// Alert sound helper using Web Audio API
function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {}
}

function triggerAlert() {
  playAlertSound();
  triggerHaptic();
}

export default function PatientReminderPopup() {
  const { patientName, isCaregiverView } = useApp();
  const { data: scheduledReminders = [] } = useScheduledReminders();
  const { data: medications = [] } = useMedications();
  const acknowledgeReminder = useAcknowledgeReminder();
  const markMedTaken = useMarkMedicationTaken();

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(Date.now());
  const startTimesRef = useRef<Record<string, number>>({});
  const missedHandledRef = useRef<Set<string>>(new Set());
  const alertIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialAlertFiredRef = useRef<Set<string>>(new Set());

  // Tick every second
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Find active reminder — extend window to doseTime + 2min so missed handler can fire
  const activeReminder = scheduledReminders.find(sr => {
    if (dismissed.has(sr.id)) return false;
    if (sr.status !== 'active' && sr.status !== 'sent') return false;
    const doseTime = new Date(sr.next_due_time).getTime();
    const showTime = doseTime - PRE_DOSE_MINUTES * 60 * 1000;
    return now >= showTime && now <= doseTime + 120000; // keep visible 2min past due for missed handler
  });

  const reminderData = activeReminder?.reminders as any;

  // Record start time
  useEffect(() => {
    if (activeReminder && !startTimesRef.current[activeReminder.id]) {
      startTimesRef.current[activeReminder.id] = Date.now();
    }
  }, [activeReminder?.id]);

  // Fire alert sound + vibration on first appear and every 15s
  useEffect(() => {
    if (!activeReminder || isCaregiverView) {
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
        alertIntervalRef.current = null;
      }
      return;
    }

    // Fire initial alert
    if (!initialAlertFiredRef.current.has(activeReminder.id)) {
      initialAlertFiredRef.current.add(activeReminder.id);
      triggerAlert();
    }

    // Repeat every 15s
    alertIntervalRef.current = setInterval(() => {
      triggerAlert();
    }, ALERT_REPEAT_INTERVAL);

    return () => {
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
        alertIntervalRef.current = null;
      }
    };
  }, [activeReminder?.id, isCaregiverView]);

  // Auto-trigger missed dose when countdown hits zero
  useEffect(() => {
    if (!activeReminder || !reminderData || isCaregiverView) return;
    if (missedHandledRef.current.has(activeReminder.id)) return;

    const doseTime = new Date(activeReminder.next_due_time).getTime();
    if (now > doseTime) {
      missedHandledRef.current.add(activeReminder.id);
      handleMissedDose();
    }
  }, [now, activeReminder?.id]);

  const handleConfirm = useCallback(() => {
    if (!activeReminder || !reminderData) return;
    const startTime = startTimesRef.current[activeReminder.id] || Date.now();

    // Stop alerts
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = null;
    }

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

    // Stop alerts
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = null;
    }

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

    // Format dose time in IST
    const doseTimeStr = formatISTTime(activeReminder.next_due_time);

    // Create missed dose alert for caregiver (real-time via subscription)
    await supabase.from('missed_dose_alerts').insert({
      reminder_id: reminderData.id,
      scheduled_reminder_id: activeReminder.id,
      patient_name: patientName || 'Margaret',
      medication_name: reminderData.message || 'Medication',
      dose_time: doseTimeStr,
    });

    // Update matching medication to show "Not Taken" with instructions
    const matchingMed = medications.find(m =>
      !m.taken && (
        m.name.toLowerCase().includes(reminderData.message?.toLowerCase()?.split(' ')[0] || '') ||
        reminderData.message?.toLowerCase()?.includes(m.name.toLowerCase())
      )
    );
    if (matchingMed) {
      await supabase.from('medications').update({
        instructions: (matchingMed.instructions || '') + ' · MISSED',
      }).eq('id', matchingMed.id);
    }

    // Add to activities with "Not Taken" label
    await supabase.from('activities').insert({
      description: `Missed dose: ${reminderData.message || 'Medication'} — Not Taken at ${doseTimeStr}`,
      time: new Date().toISOString(),
      icon: 'AlertTriangle',
      completed: false,
    });
  }, [activeReminder, reminderData, patientName, medications]);

  if (!activeReminder || !reminderData || isCaregiverView) return null;

  // Calculate countdown
  const doseTime = new Date(activeReminder.next_due_time).getTime();
  const secondsRemaining = Math.max(0, Math.ceil((doseTime - now) / 1000));

  // Timer ring calculations
  const timerSize = 120;
  const strokeWidth = 6;
  const radius = (timerSize - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min((COUNTDOWN_SECONDS - secondsRemaining) / COUNTDOWN_SECONDS, 1);
  const offset = circumference * (1 - progress);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        key={activeReminder.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[100] flex items-center justify-center"
      >
        {/* Blurred dark overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

        {/* iOS-style modal sheet */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative z-10 w-[85%] bg-card shadow-2xl overflow-hidden"
          style={{ borderRadius: 20 }}
        >
          <div className="px-6 pt-8 pb-6 flex flex-col items-center">
            {/* Red pill icon container */}
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center justify-center"
              style={{
                width: 60,
                height: 60,
                borderRadius: 14,
                backgroundColor: iosColors.red,
              }}
            >
              <Pill className="w-7 h-7 text-white" />
            </motion.div>

            {/* Title */}
            <h2 className="text-[20px] font-extrabold text-foreground text-center mt-4 leading-tight">
              Medication Due Soon
            </h2>

            {/* Medication name in teal */}
            <p className="text-[16px] font-semibold text-center mt-1" style={{ color: iosColors.teal }}>
              {reminderData.message}
            </p>

            {/* Circular countdown timer */}
            <div className="mt-6 mb-2">
              <div className="relative" style={{ width: timerSize, height: timerSize }}>
                {/* Background ring */}
                <svg width={timerSize} height={timerSize} className="absolute inset-0 -rotate-90">
                  <circle
                    cx={timerSize / 2}
                    cy={timerSize / 2}
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                  />
                  {/* Animated progress ring — teal draining */}
                  <circle
                    cx={timerSize / 2}
                    cy={timerSize / 2}
                    r={radius}
                    fill="none"
                    stroke={iosColors.teal}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                {/* Center time — bold large, no clock icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[28px] font-extrabold text-foreground leading-none">
                    {formatTime(secondsRemaining)}
                  </span>
                </div>
              </div>
            </div>

            {/* Label */}
            <p className="text-[12px] font-medium text-muted-foreground mb-5">
              Time Remaining
            </p>

            {/* Just Taken button — solid teal */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirm}
              disabled={acknowledgeReminder.isPending}
              className="w-full py-4 font-bold text-[16px] flex items-center justify-center gap-2 text-white disabled:opacity-50"
              style={{ borderRadius: 14, backgroundColor: iosColors.teal }}
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
