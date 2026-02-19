import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Pill, UtensilsCrossed, Footprints, Bell, MessageCircle, Volume2 } from 'lucide-react';
import { iosColors } from '@/components/ui/IconBox';
import { useApp } from '@/contexts/AppContext';
import { useScheduledReminders, useAcknowledgeReminder } from '@/hooks/useReminders';
import { useMedications, useMarkMedicationTaken } from '@/hooks/useCareData';
import { supabase } from '@/integrations/supabase/client';
import { formatISTTime } from '@/lib/timeUtils';

const PRE_DOSE_MINUTES = 2;
const COUNTDOWN_SECONDS = 120;
const ALERT_REPEAT_INTERVAL = 15000;

const typeConfig: Record<string, { Icon: typeof Pill; color: string; label: string }> = {
  medication: { Icon: Pill, color: iosColors.red, label: 'Medication Due Soon' },
  meal: { Icon: UtensilsCrossed, color: iosColors.green, label: 'Meal Time Reminder' },
  exercise: { Icon: Footprints, color: iosColors.blue, label: 'Exercise Reminder' },
  check_in: { Icon: MessageCircle, color: iosColors.purple, label: 'Check-In Reminder' },
  custom: { Icon: Bell, color: iosColors.teal, label: 'Reminder' },
};

function triggerHaptic() {
  try { if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 300]); } catch {}
}

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

function triggerAlert() { playAlertSound(); triggerHaptic(); }

export default function PatientReminderPopup() {
  const { patientName, isCaregiverView } = useApp();
  const { data: scheduledReminders = [] } = useScheduledReminders();
  const { data: medications = [] } = useMedications();
  const acknowledgeReminder = useAcknowledgeReminder();
  const markMedTaken = useMarkMedicationTaken();

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(Date.now());
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voicePlayed, setVoicePlayed] = useState<Set<string>>(new Set());
  const startTimesRef = useRef<Record<string, number>>({});
  const missedHandledRef = useRef<Set<string>>(new Set());
  const alertIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialAlertFiredRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Find active reminder for ANY type
  const activeReminder = scheduledReminders.find(sr => {
    if (dismissed.has(sr.id)) return false;
    if (sr.status !== 'active' && sr.status !== 'sent') return false;
    const doseTime = new Date(sr.next_due_time).getTime();
    const showTime = doseTime - PRE_DOSE_MINUTES * 60 * 1000;
    return now >= showTime && now <= doseTime + 120000;
  });

  const reminderData = activeReminder?.reminders as any;

  useEffect(() => {
    if (activeReminder && !startTimesRef.current[activeReminder.id]) {
      startTimesRef.current[activeReminder.id] = Date.now();
    }
  }, [activeReminder?.id]);

  // Voice playback: play 3 times spread across the timer (start, middle, end)
  useEffect(() => {
    if (!activeReminder || isCaregiverView) {
      if (alertIntervalRef.current) { clearInterval(alertIntervalRef.current); alertIntervalRef.current = null; }
      return;
    }

    const hasVoice = reminderData?.photo_url && reminderData.photo_url.startsWith('blob:');
    const alreadyPlayedVoice = voicePlayed.has(activeReminder.id);

    if (hasVoice && !alreadyPlayedVoice) {
      setIsPlayingVoice(true);
      setVoicePlayed(prev => new Set(prev).add(activeReminder.id));

      const audio = new Audio(reminderData.photo_url);
      audioRef.current = audio;
      let playCount = 0;
      const maxPlays = 3;

      // Calculate intervals: play at start, ~40s in, ~80s in (spread across 120s timer)
      const intervalGap = 40000; // 40 seconds between plays

      const playOnce = () => {
        playCount++;
        if (playCount >= maxPlays) {
          setIsPlayingVoice(false);
        }
        audio.currentTime = 0;
        audio.play().catch(() => {});
      };

      // Play immediately (1st time)
      audio.play().catch(() => {});
      playCount = 1;

      // Schedule 2nd and 3rd plays
      const timer2 = setTimeout(() => {
        if (audioRef.current) {
          setIsPlayingVoice(true);
          playOnce();
        }
      }, intervalGap);

      const timer3 = setTimeout(() => {
        if (audioRef.current) {
          setIsPlayingVoice(true);
          playOnce();
        }
      }, intervalGap * 2);

      audio.onended = () => {
        setIsPlayingVoice(false);
      };

      // Start alert sounds after first play ends
      audio.addEventListener('ended', () => {
        if (!initialAlertFiredRef.current.has(activeReminder.id)) {
          initialAlertFiredRef.current.add(activeReminder.id);
          triggerAlert();
          alertIntervalRef.current = setInterval(() => triggerAlert(), ALERT_REPEAT_INTERVAL);
        }
      }, { once: true });

      return () => {
        clearTimeout(timer2);
        clearTimeout(timer3);
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        if (alertIntervalRef.current) { clearInterval(alertIntervalRef.current); alertIntervalRef.current = null; }
      };
    }

    // For non-voice reminders: immediate alert sounds
    if (!initialAlertFiredRef.current.has(activeReminder.id)) {
      initialAlertFiredRef.current.add(activeReminder.id);
      triggerAlert();
    }
    alertIntervalRef.current = setInterval(() => triggerAlert(), ALERT_REPEAT_INTERVAL);
    return () => { if (alertIntervalRef.current) { clearInterval(alertIntervalRef.current); alertIntervalRef.current = null; } };
  }, [activeReminder?.id, isCaregiverView]);

  // Auto-trigger missed when countdown hits zero — works for ALL types
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
    if (alertIntervalRef.current) { clearInterval(alertIntervalRef.current); alertIntervalRef.current = null; }
    setDismissed(prev => new Set(prev).add(activeReminder.id));

    acknowledgeReminder.mutate({ scheduledId: activeReminder.id, reminderId: reminderData.id, startTime });

    // Auto-mark medication as taken
    if (reminderData.type === 'medication') {
      const matchingMed = medications.find(m =>
        !m.taken && (
          m.name.toLowerCase().includes(reminderData.message?.toLowerCase()?.split(' ')[0] || '') ||
          reminderData.message?.toLowerCase()?.includes(m.name.toLowerCase())
        )
      );
      if (matchingMed) markMedTaken.mutate(matchingMed.id);
    }
  }, [activeReminder, reminderData, medications]);

  const handleMissedDose = useCallback(async () => {
    if (!activeReminder || !reminderData) return;
    if (alertIntervalRef.current) { clearInterval(alertIntervalRef.current); alertIntervalRef.current = null; }
    setDismissed(prev => new Set(prev).add(activeReminder.id));

    const rType = reminderData.type || 'custom';
    const cfg = typeConfig[rType] || typeConfig.custom;

    await supabase.from('scheduled_reminders')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', activeReminder.id);

    await supabase.from('reminder_logs').insert({
      reminder_id: reminderData.id,
      event_type: 'missed',
      metadata: { reason: 'countdown_expired', type: rType },
    });

    const doseTimeStr = formatISTTime(activeReminder.next_due_time);

    // Create missed alert for caregiver — works for ALL types
    await supabase.from('missed_dose_alerts').insert({
      reminder_id: reminderData.id,
      scheduled_reminder_id: activeReminder.id,
      patient_name: patientName || 'Margaret',
      medication_name: `${cfg.label}: ${reminderData.message}`,
      dose_time: doseTimeStr,
    });

    // Mark medication as missed if applicable
    if (rType === 'medication') {
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
    }

    await supabase.from('activities').insert({
      description: `Missed ${cfg.label}: ${reminderData.message} — Not Completed at ${doseTimeStr}`,
      time: new Date().toISOString(),
      icon: 'AlertTriangle',
      completed: false,
    });
  }, [activeReminder, reminderData, patientName, medications]);

  if (!activeReminder || !reminderData || isCaregiverView) return null;

  const rType = reminderData.type || 'custom';
  const cfg = typeConfig[rType] || typeConfig.custom;
  const IconComp = cfg.Icon;

  const doseTime = new Date(activeReminder.next_due_time).getTime();
  const secondsRemaining = Math.max(0, Math.ceil((doseTime - now) / 1000));

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

  const confirmLabel = rType === 'medication' ? 'Just Taken' 
    : rType === 'meal' ? 'Done Eating'
    : rType === 'exercise' ? 'Completed'
    : 'Done';

  return (
    <AnimatePresence>
      <motion.div
        key={activeReminder.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[100] flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative z-10 w-[85%] bg-card shadow-2xl overflow-hidden"
          style={{ borderRadius: 20 }}
        >
          <div className="px-6 pt-8 pb-6 flex flex-col items-center">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center justify-center"
              style={{ width: 60, height: 60, borderRadius: 14, backgroundColor: cfg.color }}
            >
              <IconComp className="w-7 h-7 text-white" />
            </motion.div>

            <h2 className="text-[20px] font-extrabold text-foreground text-center mt-4 leading-tight">
              {cfg.label}
            </h2>

            <p className="text-[16px] font-semibold text-center mt-1" style={{ color: iosColors.teal }}>
              {reminderData.message}
            </p>

            {/* Voice playback indicator */}
            {isPlayingVoice && (
              <div className="flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-primary/8">
                <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-[13px] font-semibold text-primary">Playing caregiver's voice...</span>
              </div>
            )}

            <div className="mt-6 mb-2">
              <div className="relative" style={{ width: timerSize, height: timerSize }}>
                <svg width={timerSize} height={timerSize} className="absolute inset-0 -rotate-90">
                  <circle cx={timerSize / 2} cy={timerSize / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
                  <circle
                    cx={timerSize / 2} cy={timerSize / 2} r={radius} fill="none"
                    stroke={cfg.color} strokeWidth={strokeWidth} strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[28px] font-extrabold text-foreground leading-none">
                    {formatTime(secondsRemaining)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[12px] font-medium text-muted-foreground mb-5">Time Remaining</p>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirm}
              disabled={acknowledgeReminder.isPending}
              className="w-full py-4 font-bold text-[16px] flex items-center justify-center gap-2 text-white disabled:opacity-50"
              style={{ borderRadius: 14, backgroundColor: iosColors.teal }}
            >
              <Check className="w-5 h-5" />
              {confirmLabel}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
