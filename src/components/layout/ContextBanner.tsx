import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Home, Brain, BookOpen, Shield, MessageCircle, Heart, Bell } from 'lucide-react';

const screenMeta: Record<string, { Icon: React.ComponentType<any>; label: string }> = {
  today: { Icon: Home, label: 'Home — Today' },
  memories: { Icon: Brain, label: 'Memories' },
  memorylane: { Icon: BookOpen, label: 'Memory Lane' },
  safety: { Icon: Shield, label: 'Safety' },
  care: { Icon: MessageCircle, label: 'Care Circle' },
  wellbeing: { Icon: Heart, label: 'Wellbeing' },
  reminders: { Icon: Bell, label: 'Reminders' },
};

export default function ContextBanner() {
  const { activePatientTab, isCaregiverView, mode } = useApp();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);

  if (isCaregiverView || mode === 'essential') return null;

  const meta = screenMeta[activePatientTab] || { Icon: Home, label: activePatientTab };
  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const MetaIcon = meta.Icon;

  return (
    <motion.div
      key={activePatientTab}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="shrink-0 px-4 py-2 border-t border-border/10 flex items-center justify-center gap-3"
      style={{ background: 'hsl(var(--success) / 0.06)' }}
    >
      <span className="text-[14px] font-semibold text-foreground flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        {timeStr}
      </span>
      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
      <span className="text-[14px] font-semibold text-foreground flex items-center gap-1.5">
        <MetaIcon className="w-3.5 h-3.5 text-muted-foreground" />
        {meta.label}
      </span>
    </motion.div>
  );
}
