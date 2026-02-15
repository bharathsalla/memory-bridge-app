import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

const screenMeta: Record<string, { emoji: string; label: string }> = {
  today: { emoji: '🏠', label: 'Home — Today' },
  memories: { emoji: '🧠', label: 'Memories' },
  memorylane: { emoji: '📖', label: 'Memory Lane' },
  safety: { emoji: '🛡️', label: 'Safety' },
  care: { emoji: '💬', label: 'Care Circle' },
  wellbeing: { emoji: '💚', label: 'My Wellbeing' },
  reminders: { emoji: '🔔', label: 'Reminders' },
};

export default function ContextBanner() {
  const { activePatientTab, isCaregiverView, mode } = useApp();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);

  // Only show for patient view
  if (isCaregiverView) return null;
  // Hide in essential mode (no tab bar shown)
  if (mode === 'essential') return null;

  const meta = screenMeta[activePatientTab] || { emoji: '📱', label: activePatientTab };
  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div
      className="shrink-0 px-4 py-2 flex items-center justify-center gap-3 border-t border-warning/20"
      style={{ backgroundColor: 'hsl(48, 96%, 89%)' }}
    >
      <span className="text-[18px] font-bold tracking-tight" style={{ color: 'hsl(30, 50%, 20%)' }}>
        ⏰ {timeStr}
      </span>
      <span style={{ color: 'hsl(30, 30%, 40%)' }} className="text-[16px]">|</span>
      <span className="text-[18px] font-bold" style={{ color: 'hsl(30, 50%, 20%)' }}>
        {meta.emoji} You are: {meta.label}
      </span>
    </div>
  );
}
