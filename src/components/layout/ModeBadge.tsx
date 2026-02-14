import { useApp } from '@/contexts/AppContext';

export default function ModeBadge() {
  const { mode } = useApp();
  const config = {
    full: { label: 'Full', color: 'bg-blue-500' },
    simplified: { label: 'Simple', color: 'bg-warning' },
    essential: { label: 'Essential', color: 'bg-lavender' },
  };
  const c = config[mode];
  return (
    <span className={`${c.color} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full`}>
      {c.label}
    </span>
  );
}
