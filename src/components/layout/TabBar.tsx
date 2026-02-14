import { useApp, PatientTab, CaregiverTab } from '@/contexts/AppContext';
import { Home, Image, Shield, Users, Heart, LayoutDashboard, ClipboardList, BarChart3, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const fullTabs: { id: PatientTab; label: string; icon: typeof Home }[] = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'memories', label: 'Memories', icon: Image },
  { id: 'safety', label: 'Safety', icon: Shield },
  { id: 'care', label: 'Care', icon: Users },
  { id: 'wellbeing', label: 'Me', icon: Heart },
];

const simplifiedTabs: { id: PatientTab; label: string; icon: typeof Home }[] = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'memories', label: 'Memories', icon: Image },
  { id: 'safety', label: 'Safety', icon: Shield },
];

const caregiverTabs: { id: CaregiverTab; label: string; icon: typeof Home }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function TabBar() {
  const { mode, activePatientTab, activeCaregiverTab, isCaregiverView, setActivePatientTab, setActiveCaregiverTab } = useApp();

  if (mode === 'essential' && !isCaregiverView) return null;

  if (isCaregiverView) {
    return (
      <div className="bg-background/95 backdrop-blur-xl border-t border-border shrink-0">
        <div className="flex items-center justify-around px-2 pt-1 pb-1">
          {caregiverTabs.map(tab => {
            const active = activeCaregiverTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCaregiverTab(tab.id)}
                className="flex flex-col items-center gap-0.5 py-1 px-3 touch-target relative"
              >
                {active && (
                  <motion.div
                    layoutId="cg-tab-bg"
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] relative z-10 ${active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {tab.label}
                </span>
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
    <div className="bg-background/95 backdrop-blur-xl border-t border-border shrink-0">
      <div className="flex items-center justify-around px-2 pt-1 pb-1">
        {tabs.map(tab => {
          const active = activePatientTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePatientTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 relative ${isSimplified ? 'touch-target-xl' : 'touch-target'}`}
            >
              {active && (
                <motion.div
                  layoutId="patient-tab-bg"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon className={`relative z-10 ${isSimplified ? 'w-7 h-7' : 'w-5 h-5'} ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`relative z-10 ${isSimplified ? 'text-[13px]' : 'text-[10px]'} ${active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
