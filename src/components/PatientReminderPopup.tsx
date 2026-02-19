import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Bell, AlertTriangle, Pill } from 'lucide-react';
import IconBox, { iosColors } from '@/components/ui/IconBox';
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

  const activeReminder = scheduledReminders.find(sr => {
    if (dismissed.has(sr.id)) return false;
    if (sr.status !== 'active' && sr.status !== 'sent') return false;
    const snoozeEnd = snoozedUntil[sr.id];
    if (snoozeEnd && Date.now() < snoozeEnd) return false;
    return true;
  });

  const reminderData = activeReminder?.reminders as any;

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

    // Dismiss immediately so popup closes
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
  };

  const handleSnooze = () => {
    if (!activeReminder || !reminderData) return;

    // Dismiss immediately, will reappear after snooze period
    setSnoozedUntil(prev => ({ ...prev, [activeReminder.id]: Date.now() + 10 * 60 * 1000 }));

    snoozeReminder.mutate({
      scheduledId: activeReminder.id,
      reminderId: reminderData.id,
      minutes: 10,
    });
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
        key={activeReminder.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[100] flex items-end justify-center"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* iOS bottom sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full bg-card shadow-2xl overflow-hidden"
          style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-9 h-1 rounded-full bg-muted-foreground/20" />
          </div>

          {/* Overdue warning */}
          {isOverdue && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-[12px] font-bold">No response for {formatWait(timeWaiting)} — Caregiver alerted</span>
            </motion.div>
          )}

          <div className="px-5 pt-4 pb-6">
            {/* Icon */}
            <div className="flex justify-center mb-3">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <IconBox
                  Icon={reminderData.type === 'medication' ? Pill : Bell}
                  color={isOverdue ? iosColors.red : iosColors.teal}
                  size={60}
                  iconSize={28}
                />
              </motion.div>
            </div>

            {/* Greeting */}
            <h1 className="text-[22px] font-extrabold text-foreground text-center leading-tight">
              {greeting}, {displayName}
            </h1>
            <p className="text-[14px] text-muted-foreground text-center mt-0.5">{timeStr}</p>

            {/* Sender label */}
            <div className="flex items-center justify-center gap-1.5 mt-4 mb-1">
              <Bell className="w-3.5 h-3.5" style={{ color: iosColors.teal }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: iosColors.teal }}>
                Reminder
              </span>
            </div>
            {reminderData.created_by && (
              <p className="text-[15px] font-bold text-foreground text-center">
                From {reminderData.created_by}
              </p>
            )}

            {/* Medication card */}
            <div className="bg-muted/50 rounded-xl p-3.5 mt-3 flex items-center gap-3">
              <IconBox Icon={Pill} color={iosColors.orange} size={44} iconSize={20} />
              <span className="text-[15px] font-bold text-foreground flex-1">{reminderData.message}</span>
            </div>

            {/* Photo */}
            {reminderData.photo_url && (
              <img
                src={reminderData.photo_url}
                alt=""
                className="w-full h-28 object-cover mt-3"
                style={{ borderRadius: 10 }}
              />
            )}

            {/* Timer badge */}
            <div className="flex items-center justify-center mt-4 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Waiting {formatWait(timeWaiting)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirm}
                disabled={acknowledgeReminder.isPending}
                className="py-3.5 font-bold text-[15px] flex items-center justify-center gap-2 text-white disabled:opacity-50"
                style={{ backgroundColor: iosColors.teal, borderRadius: 14 }}
              >
                <Check className="w-5 h-5" />
                Done
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSnooze}
                disabled={snoozeReminder.isPending}
                className="py-3.5 font-bold text-[15px] flex items-center justify-center gap-2 text-white disabled:opacity-50"
                style={{ backgroundColor: iosColors.orange, borderRadius: 14 }}
              >
                <Clock className="w-5 h-5" />
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
