import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';

const screenMeta: Record<string, {emoji: string; label: string;}> = {
  today: { emoji: '🏠', label: 'Home — Today' },
  memories: { emoji: '🧠', label: 'Memories' },
  memorylane: { emoji: '📖', label: 'Memory Lane' },
  safety: { emoji: '🛡️', label: 'Safety' },
  care: { emoji: '💬', label: 'Care Circle' },
  wellbeing: { emoji: '💚', label: 'Wellbeing' },
  reminders: { emoji: '🔔', label: 'Reminders' }
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
      className="shrink-0 px-5 py-3 border-t border-border/10 bg-primary/4 flex items-center justify-center gap-3"
    >
      <span className="text-[18px] font-extrabold text-foreground flex items-center gap-2">
        ⏰ {timeStr}
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
      <span className="text-[18px] font-extrabold text-foreground flex items-center gap-2">
        {meta.emoji} {meta.label}
      </span>
    </motion.div>
  );
}
