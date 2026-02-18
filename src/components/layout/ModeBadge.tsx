import { useApp } from '@/contexts/AppContext';

export default function ModeBadge() {
  const { mode } = useApp();
  const config = {
    full: { label: 'Full', bg: 'bg-primary/15', text: 'text-primary' },
    simplified: { label: 'Simple', bg: 'bg-warning/15', text: 'text-warning' },
    essential: { label: 'Essential', bg: 'bg-lavender/15', text: 'text-lavender' },
  };
  const c = config[mode];
  return (
    <span className={`${c.bg} ${c.text} text-[10px] font-bold px-2.5 py-1 rounded-full font-display tracking-wide`}>
      {c.label}
    </span>
  );
}
