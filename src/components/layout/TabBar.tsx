import { useApp, PatientTab, CaregiverTab } from '@/contexts/AppContext';
import { Home, Image, Shield, Users, Heart, LayoutDashboard, ClipboardList, Settings2, BookHeart, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const fullTabs: { id: PatientTab; label: string; icon: typeof Home }[] = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'memories', label: 'Memories', icon: Image },
  { id: 'memorylane', label: 'Timeline', icon: BookHeart },
  { id: 'safety', label: 'Safety', icon: Shield },
  { id: 'care', label: 'Care', icon: Users },
];

const simplifiedTabs: { id: PatientTab; label: string; icon: typeof Home }[] = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'memories', label: 'Memories', icon: Image },
  { id: 'safety', label: 'Safety', icon: Shield },
];

const caregiverTabs: { id: CaregiverTab; label: string; icon: typeof Home }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vitals', label: 'Vitals', icon: Heart },
  { id: 'memories', label: 'Insights', icon: Brain },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

export default function TabBar() {
  const { mode, activePatientTab, activeCaregiverTab, isCaregiverView, setActivePatientTab, setActiveCaregiverTab } = useApp();

  if (mode === 'essential' && !isCaregiverView) return null;

  const renderTab = (
    tab: { id: string; label: string; icon: typeof Home },
    active: boolean,
    onClick: () => void,
    layoutId: string
  ) => {
    const Icon = tab.icon;
    return (
      <button
        key={tab.id}
        onClick={onClick}
        className="flex flex-col items-center gap-0.5 py-1 px-2 relative touch-target"
        aria-label={tab.label}
        aria-current={active ? 'page' : undefined}
      >
        {active && (
          <motion.div
            layoutId={layoutId}
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-primary"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        )}
        <Icon
          className={`w-[22px] h-[22px] transition-colors ${active ? 'text-primary' : 'text-muted-foreground/50'}`}
          strokeWidth={active ? 2.2 : 1.6}
        />
        <span
          className={`text-[10px] transition-colors ${
            active ? 'text-primary font-semibold' : 'text-muted-foreground/50 font-medium'
          }`}
        >
          {tab.label}
        </span>
      </button>
    );
  };

  if (isCaregiverView) {
    return (
      <div className="ios-blur border-t border-border/30 shrink-0">
        <div className="flex items-center justify-around px-1 pt-1 pb-1">
          {caregiverTabs.map(tab =>
            renderTab(tab, activeCaregiverTab === tab.id, () => setActiveCaregiverTab(tab.id), 'cg-indicator')
          )}
        </div>
      </div>
    );
  }

  const tabs = mode === 'simplified' ? simplifiedTabs : fullTabs;
  const isSimplified = mode === 'simplified';

  return (
    <div className="ios-blur border-t border-border/30 shrink-0">
      <div className="flex items-center justify-around px-2 pt-1 pb-1">
        {tabs.map(tab =>
          renderTab(
            tab,
            activePatientTab === tab.id,
            () => setActivePatientTab(tab.id),
            'patient-indicator'
          )
        )}
      </div>
    </div>
  );
}
