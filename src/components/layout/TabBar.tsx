import { useApp, PatientTab, CaregiverTab } from '@/contexts/AppContext';
import { Home, Image, Shield, Users, Heart, LayoutDashboard, ClipboardList, Settings2, BookHeart, Brain } from 'lucide-react';

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

// iOS system blue for active state
const ACTIVE_COLOR = '#007AFF';
const INACTIVE_COLOR = '#8E8E93';

export default function TabBar() {
  const { mode, activePatientTab, activeCaregiverTab, isCaregiverView, setActivePatientTab, setActiveCaregiverTab } = useApp();

  if (mode === 'essential' && !isCaregiverView) return null;

  const renderTab = (
    tab: { id: string; label: string; icon: typeof Home },
    active: boolean,
    onClick: () => void
  ) => {
    const Icon = tab.icon;
    return (
      <button
        key={tab.id}
        onClick={onClick}
        className="flex flex-col items-center gap-0.5 py-1 px-2 touch-target"
        aria-label={tab.label}
        aria-current={active ? 'page' : undefined}
      >
        <Icon
          className="transition-colors"
          style={{
            width: 22,
            height: 22,
            color: active ? ACTIVE_COLOR : INACTIVE_COLOR,
            strokeWidth: active ? 2 : 1.5,
          }}
        />
        <span
          className="transition-colors"
          style={{
            fontSize: 10,
            fontWeight: active ? 600 : 500,
            color: active ? ACTIVE_COLOR : INACTIVE_COLOR,
          }}
        >
          {tab.label}
        </span>
      </button>
    );
  };

  if (isCaregiverView) {
    return (
      <div className="border-t border-border/30 shrink-0" style={{ backgroundColor: 'rgba(242,242,247,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-around px-1 pt-1 pb-1">
          {caregiverTabs.map(tab =>
            renderTab(tab, activeCaregiverTab === tab.id, () => setActiveCaregiverTab(tab.id))
          )}
        </div>
      </div>
    );
  }

  const tabs = mode === 'simplified' ? simplifiedTabs : fullTabs;

  return (
    <div className="border-t border-border/30 shrink-0" style={{ backgroundColor: 'rgba(242,242,247,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="flex items-center justify-around px-2 pt-1 pb-1">
        {tabs.map(tab =>
          renderTab(
            tab,
            activePatientTab === tab.id,
            () => setActivePatientTab(tab.id)
          )
        )}
      </div>
    </div>
  );
}
