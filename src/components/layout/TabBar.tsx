import { useApp, PatientTab, CaregiverTab } from '@/contexts/AppContext';
import { Home, Image, Shield, Users, Heart, LayoutDashboard, ClipboardList, Settings, BookHeart, Brain } from 'lucide-react';

const fullTabs: { id: PatientTab; label: string; icon: typeof Home }[] = [
  { id: 'today', label: 'Summary', icon: Home },
  { id: 'memories', label: 'Memories', icon: Image },
  { id: 'memorylane', label: 'Timeline', icon: BookHeart },
  { id: 'safety', label: 'Safety', icon: Shield },
  { id: 'care', label: 'Care', icon: Users },
];

const simplifiedTabs: { id: PatientTab; label: string; icon: typeof Home }[] = [
  { id: 'today', label: 'Summary', icon: Home },
  { id: 'memories', label: 'Memories', icon: Image },
  { id: 'safety', label: 'Safety', icon: Shield },
];

const caregiverTabs: { id: CaregiverTab; label: string; icon: typeof Home }[] = [
  { id: 'dashboard', label: 'Summary', icon: LayoutDashboard },
  { id: 'vitals', label: 'Vitals', icon: Heart },
  { id: 'memories', label: 'Insights', icon: Brain },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// iOS system blue
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
        className="flex flex-col items-center justify-center gap-[2px] flex-1 py-1.5 touch-target"
        aria-label={tab.label}
        aria-current={active ? 'page' : undefined}
      >
        <Icon
          className="transition-colors"
          style={{
            width: 24,
            height: 24,
            color: active ? ACTIVE_COLOR : INACTIVE_COLOR,
            strokeWidth: active ? 2.2 : 1.5,
            fill: active ? ACTIVE_COLOR : 'none',
            fillOpacity: active ? 0.15 : 0,
          }}
        />
        <span
          className="transition-colors leading-none"
          style={{
            fontSize: 10,
            fontWeight: active ? 600 : 400,
            color: active ? ACTIVE_COLOR : INACTIVE_COLOR,
            letterSpacing: '-0.01em',
          }}
        >
          {tab.label}
        </span>
      </button>
    );
  };

  if (isCaregiverView) {
    return (
      <div
        className="border-t border-border/30 shrink-0"
        style={{ backgroundColor: 'rgba(249,249,249,0.94)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)' }}
      >
        <div className="flex items-stretch justify-around">
          {caregiverTabs.map(tab =>
            renderTab(tab, activeCaregiverTab === tab.id, () => setActiveCaregiverTab(tab.id))
          )}
        </div>
      </div>
    );
  }

  const tabs = mode === 'simplified' ? simplifiedTabs : fullTabs;

  return (
    <div
      className="border-t border-border/30 shrink-0"
      style={{ backgroundColor: 'rgba(249,249,249,0.94)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)' }}
    >
      <div className="flex items-stretch justify-around">
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
