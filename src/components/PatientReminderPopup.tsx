import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Timer, Bell, AlertTriangle, Pill } from 'lucide-react';
import IconBox, { iosColors } from '@/components/ui/IconBox';
import CircularTimer from '@/components/ui/CircularTimer';
import { useApp } from '@/contexts/AppContext';
import { useScheduledReminders, useAcknowledgeReminder, useSnoozeReminder } from '@/hooks/useReminders';
import { useMedications, useMarkMedicationTaken } from '@/hooks/useCareData';

const SNOOZE_MINUTES = 10;
const SNOOZE_MS = SNOOZE_MINUTES * 60 * 1000;

export default function PatientReminderPopup() {
  const { patientName, isCaregiverView } = useApp();
  const { data: scheduledReminders = [] } = useScheduledReminders();
  const { data: medications = [] } = useMedications();
  const acknowledgeReminder = useAcknowledgeReminder();
  const snoozeReminder = useSnoozeReminder();
  const markMedTaken = useMarkMedicationTaken();

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [startTimes] = useState<Record<string, number>>({});
  const [timeWaiting, setTimeWaiting] = useState(0);
  const waitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Find a reminder that is active AND whose next_due_time has passed
  const activeReminder = scheduledReminders.find(sr => {
    if (dismissed.has(sr.id)) return false;
    if (sr.status !== 'active' && sr.status !== 'sent') return false;
    // KEY FIX: Only show if next_due_time has passed (i.e., snooze expired)
    const dueTime = new Date(sr.next_due_time).getTime();
    if (Date.now() < dueTime) return false;
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

    // Immediately dismiss from UI — DB next_due_time handles re-show after 10 min
    setDismissed(prev => new Set(prev).add(activeReminder.id));

    snoozeReminder.mutate({
      scheduledId: activeReminder.id,
      reminderId: reminderData.id,
      minutes: SNOOZE_MINUTES,
    });
  };

  const displayName = patientName || 'Friend';
  const currentTime = new Date();
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const greeting = currentTime.getHours() < 12 ? 'Good Morning' : currentTime.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const isOverdue = timeWaiting > 120;

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

          {isOverdue && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-[12px] font-bold">No response — Caregiver alerted</span>
            </motion.div>
          )}

          <div className="px-5 pt-4 pb-6">
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

            <h1 className="text-[22px] font-extrabold text-foreground text-center leading-tight">
              {greeting}, {displayName}
            </h1>
            <p className="text-[14px] text-muted-foreground text-center mt-0.5">{timeStr}</p>

            <div className="flex items-center justify-center gap-1.5 mt-4 mb-1">
              <Bell className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Reminder
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

            {/* iOS-style circular timer */}
            <div className="flex justify-center mt-4 mb-4">
              <CircularTimer
                seconds={timeWaiting}
                total={600}
                size={80}
                label="Waiting for response"
              />
            </div>

            {/* Action buttons — Primary solid, Secondary outline */}
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