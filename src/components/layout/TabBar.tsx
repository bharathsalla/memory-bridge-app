import { useApp, PatientTab, CaregiverTab } from '@/contexts/AppContext';
import { Home, Image, Shield, Users, Heart, LayoutDashboard, ClipboardList, BarChart3, Settings, BookHeart, Brain, Bell } from 'lucide-react';
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
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'memories', label: 'Memories', icon: Brain },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export default function TabBar() {
  const { mode, activePatientTab, activeCaregiverTab, isCaregiverView, setActivePatientTab, setActiveCaregiverTab } = useApp();

  if (mode === 'essential' && !isCaregiverView) return null;

  if (isCaregiverView) {
    return (
      <div className="bg-card/95 backdrop-blur-md border-t border-border/20 shrink-0">
        <div className="flex items-center justify-around px-1 pt-2 pb-1.5">
          {caregiverTabs.map(tab => {
            const active = activeCaregiverTab === tab.id;
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveCaregiverTab(tab.id)}
                className="flex flex-col items-center gap-1 py-1 px-2 touch-target relative" aria-label={tab.label} aria-current={active ? 'page' : undefined}>
                {active && (
                  <motion.div layoutId="cg-tab-bg" className="absolute inset-0 rounded-xl bg-primary/8" transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
                )}
                <Icon className={`w-[22px] h-[22px] relative z-10 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[11px] relative z-10 transition-colors ${active ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const tabs = mode === 'simplified' ? simplifiedTabs : fullTabs;
  const isSimplified = mode === 'simplified';

  return (
    <div className="bg-card/95 backdrop-blur-md border-t border-border/20 shrink-0">
      <div className="flex items-center justify-around px-2 pt-2 pb-1.5">
        {tabs.map(tab => {
          const active = activePatientTab === tab.id;
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActivePatientTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 relative ${isSimplified ? 'touch-target-xl' : 'touch-target'}`}
              aria-label={tab.label} aria-current={active ? 'page' : undefined}>
              {active && (
                <motion.div layoutId="patient-tab-bg" className="absolute inset-0 rounded-xl bg-primary/8" transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
              )}
              <Icon className={`relative z-10 transition-colors ${isSimplified ? 'w-7 h-7' : 'w-[22px] h-[22px]'} ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`relative z-10 transition-colors ${isSimplified ? 'text-[13px]' : 'text-[11px]'} ${active ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
