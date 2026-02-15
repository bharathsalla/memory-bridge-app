import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';

const screenMeta: Record<string, { emoji: string; label: string }> = {
  today: { emoji: '🏠', label: 'Home' },
  memories: { emoji: '🧠', label: 'Memories' },
  memorylane: { emoji: '📖', label: 'Memory Lane' },
  safety: { emoji: '🛡️', label: 'Safety' },
  care: { emoji: '💬', label: 'Care Circle' },
  wellbeing: { emoji: '💚', label: 'Wellbeing' },
  reminders: { emoji: '🔔', label: 'Reminders' },
};

export default function ContextBanner() {
  const { activePatientTab, isCaregiverView, mode } = useApp();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);

  if (isCaregiverView || mode === 'essential') return null;

  const meta = screenMeta[activePatientTab] || { emoji: '📱', label: activePatientTab };
  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <motion.div
      key={activePatientTab}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="shrink-0 px-4 py-2.5 flex items-center justify-center gap-2.5 bg-primary/8 border-t border-primary/10"
    >
      <span className="text-[15px] font-bold text-primary flex items-center gap-1.5">
        ⏰ {timeStr}
      </span>
      <span className="w-1 h-1 rounded-full bg-primary/30" />
      <span className="text-[15px] font-bold text-primary flex items-center gap-1.5">
        {meta.emoji} {meta.label}
      </span>
    </motion.div>
  );
}
