import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Bell, AlertTriangle, Pill } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useScheduledReminders, useAcknowledgeReminder, useSnoozeReminder } from '@/hooks/useReminders';
import { useMedications, useMarkMedicationTaken } from '@/hooks/useCareData';

export default function PatientReminderPopup() {
  const { patientName, isCaregiverView } = useApp();
  const { data: scheduledReminders = [] } = useScheduledReminders();
  const { data: medications = [] } = useMedications();
  const acknowledgeReminder = useAcknowledgeReminder();
  const snoozeReminder = useSnoozeReminder();
  const markMedTaken = useMarkMedicationTaken();

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [snoozedUntil, setSnoozedUntil] = useState<Record<string, number>>({});
  const [startTimes] = useState<Record<string, number>>({});
  const [timeWaiting, setTimeWaiting] = useState(0);
  const waitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Find the first active scheduled reminder that hasn't been dismissed/snoozed
  const activeReminder = scheduledReminders.find(sr => {
    if (dismissed.has(sr.id)) return false;
    if (sr.status !== 'active' && sr.status !== 'sent') return false;
    // Check if snoozed
    const snoozeEnd = snoozedUntil[sr.id];
    if (snoozeEnd && Date.now() < snoozeEnd) return false;
    return true;
  });

  const reminderData = activeReminder?.reminders as any;

  // Track waiting time
  useEffect(() => {
    if (activeReminder && !isCaregiverView) {
      if (!startTimes[activeReminder.id]) {
        startTimes[activeReminder.id] = Date.now();
      }
      setTimeWaiting(0);
      waitTimerRef.current = setInterval(() => {
        setTimeWaiting(t => t + 1);
      }, 1000);
      return () => {
        if (waitTimerRef.current) clearInterval(waitTimerRef.current);
      };
    }
  }, [activeReminder?.id, isCaregiverView]);

  const handleConfirm = () => {
    if (!activeReminder || !reminderData) return;
    const startTime = startTimes[activeReminder.id] || Date.now();
    
    acknowledgeReminder.mutate({
      scheduledId: activeReminder.id,
      reminderId: reminderData.id,
      startTime,
    });

    // Also mark matching medication as taken
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

    setDismissed(prev => new Set(prev).add(activeReminder.id));
  };

  const handleSnooze = () => {
    if (!activeReminder || !reminderData) return;
    snoozeReminder.mutate({
      scheduledId: activeReminder.id,
      reminderId: reminderData.id,
      minutes: 10,
    });
    setSnoozedUntil(prev => ({ ...prev, [activeReminder.id]: Date.now() + 10 * 60 * 1000 }));
  };

  const displayName = patientName || 'Friend';
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const isOverdue = timeWaiting > 120;
  const formatWait = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!activeReminder || !reminderData || isCaregiverView) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[100] flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

        <motion.div
          initial={{ scale: 0.85, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85, y: 40 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative z-10 w-[92%] bg-card rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Overdue warning */}
          {isOverdue && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className="bg-destructive text-destructive-foreground px-4 py-2.5 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-[12px] font-bold">⚠ No response for {formatWait(timeWaiting)} — Caregiver alerted</span>
            </motion.div>
          )}

          {/* Header */}
          <div className="bg-gradient-to-br from-primary/15 via-accent/10 to-background px-5 pt-5 pb-4">
            <div className="flex justify-center mb-2.5">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`w-14 h-14 rounded-full flex items-center justify-center ${isOverdue ? 'bg-destructive/20' : 'bg-primary/15'}`}
              >
                {reminderData.type === 'medication'
                  ? <Pill className={`w-7 h-7 ${isOverdue ? 'text-destructive' : 'text-primary'}`} />
                  : <Bell className={`w-7 h-7 ${isOverdue ? 'text-destructive' : 'text-primary'}`} />
                }
              </motion.div>
            </div>
            <h1 className="text-[22px] font-extrabold text-foreground text-center leading-tight">
              {greeting}, {displayName} ☀️
            </h1>
            <p className="text-[15px] font-semibold text-muted-foreground text-center mt-1">
              🕘 {timeStr}
            </p>
          </div>

          <div className="px-5 py-4">
            {/* Reminder title */}
            <div className="text-center mb-3">
              <p className="text-ios-footnote font-semibold text-primary uppercase tracking-wider mb-1">
                {reminderData.created_by ? `From ${reminderData.created_by}` : 'Reminder'}
              </p>
              <p className="text-[17px] font-bold text-foreground leading-snug">
                {reminderData.title}
              </p>
            </div>

            {/* Message card */}
            <div className="bg-muted/40 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-[24px]">💊</span>
                <span className="text-[16px] font-extrabold text-foreground">{reminderData.message}</span>
              </div>
              {reminderData.photo_url && (
                <img src={reminderData.photo_url} alt="" className="w-full h-24 object-cover rounded-xl mt-2" />
              )}
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-[11px] font-bold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
                ⏱ Waiting {formatWait(timeWaiting)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleConfirm}
                disabled={acknowledgeReminder.isPending}
                className="py-4 rounded-2xl bg-success text-success-foreground font-extrabold text-[16px] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                ✅ Done
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleSnooze}
                disabled={snoozeReminder.isPending}
                className="py-4 rounded-2xl bg-warning text-warning-foreground font-extrabold text-[16px] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Clock className="w-5 h-5" />
                ⏰ 10 Min
              </motion.button>
            </div>

            <p className="text-[10px] text-muted-foreground/60 text-center mt-3 italic">
              This reminder stays until you confirm or snooze
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
