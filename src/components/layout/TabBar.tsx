import { useApp, PatientTab, CaregiverTab } from '@/contexts/AppContext';
import { Home, Image, Shield, Users, Heart, LayoutDashboard, ClipboardList, BarChart3, BookHeart, Brain } from 'lucide-react';
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
      <div className="bg-card/90 backdrop-blur-2xl border-t border-border/10 shrink-0">
        <div className="flex items-center justify-around px-1 pt-2.5 pb-2">
          {caregiverTabs.map(tab => {
            const active = activeCaregiverTab === tab.id;
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveCaregiverTab(tab.id)}
                className="flex flex-col items-center gap-1.5 py-1.5 px-3 touch-target relative" aria-label={tab.label} aria-current={active ? 'page' : undefined}>
                {active && (
                  <motion.div layoutId="cg-tab-bg" className="absolute inset-0 rounded-2xl bg-primary/8" transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
                )}
                <Icon className={`w-6 h-6 relative z-10 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[13px] relative z-10 transition-colors ${active ? 'text-primary font-extrabold' : 'text-muted-foreground font-semibold'}`}>{tab.label}</span>
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
    <div className="bg-card/90 backdrop-blur-2xl border-t border-border/10 shrink-0">
      <div className="flex items-center justify-around px-2 pt-3 pb-2">
        {tabs.map(tab => {
          const active = activePatientTab === tab.id;
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActivePatientTab(tab.id)}
              className={`flex flex-col items-center gap-1.5 py-2 px-3 relative ${isSimplified ? 'touch-target-xl' : 'touch-target'}`}
              aria-label={tab.label} aria-current={active ? 'page' : undefined}>
              {active && (
                <motion.div layoutId="patient-tab-bg" className="absolute inset-0 rounded-2xl bg-primary/8" transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
              )}
              <Icon className={`relative z-10 transition-colors ${isSimplified ? 'w-8 h-8' : 'w-6 h-6'} ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`relative z-10 transition-colors ${isSimplified ? 'text-[15px]' : 'text-[13px]'} ${active ? 'text-primary font-extrabold' : 'text-muted-foreground font-semibold'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
