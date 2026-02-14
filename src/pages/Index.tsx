import { useApp } from '@/contexts/AppContext';
import { AnimatePresence, motion } from 'framer-motion';
import NavBar from '@/components/layout/NavBar';
import TabBar from '@/components/layout/TabBar';
import OnboardingScreen from '@/screens/OnboardingScreen';
import TodayScreen from '@/screens/TodayScreen';
import MemoriesScreen from '@/screens/MemoriesScreen';
import SafetyScreen from '@/screens/SafetyScreen';
import CareScreen from '@/screens/CareScreen';
import WellbeingScreen from '@/screens/WellbeingScreen';
import CaregiverDashboard from '@/screens/CaregiverDashboard';

const navTitles: Record<string, string> = {
  today: 'Today',
  memories: 'Memories',
  safety: 'Safety',
  care: 'Care Circle',
  wellbeing: 'My Wellbeing',
};

const cgNavTitles: Record<string, string> = {
  dashboard: 'Care Dashboard',
  health: 'Patient Health',
  tasks: 'Care Tasks',
  reports: 'Reports',
  settings: 'Settings',
};

const Index = () => {
  const { onboarded, mode, activePatientTab, activeCaregiverTab, isCaregiverView, toggleCaregiverView } = useApp();

  if (!onboarded) {
    return (
      <div className="h-full max-w-[430px] mx-auto bg-background relative overflow-hidden shadow-2xl">
        <OnboardingScreen />
      </div>
    );
  }

  const isEssential = mode === 'essential' && !isCaregiverView;

  return (
    <div className={`h-full max-w-[430px] mx-auto bg-background relative overflow-hidden shadow-2xl ${mode}`}>
      {/* Nav Bar */}
      {!isEssential && (
        <NavBar
          title={isCaregiverView ? cgNavTitles[activeCaregiverTab] : navTitles[activePatientTab]}
          showBack={isCaregiverView}
          onBack={toggleCaregiverView}
          rightAction={
            isCaregiverView ? (
              <button onClick={toggleCaregiverView} className="text-ios-subheadline text-primary">
                Patient
              </button>
            ) : undefined
          }
        />
      )}

      {/* Main Content */}
      <div className={`h-full ${!isEssential ? 'pt-0' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={isCaregiverView ? `cg-${activeCaregiverTab}` : `pt-${activePatientTab}-${mode}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {isCaregiverView ? (
              <CaregiverDashboard />
            ) : (
              <>
                {activePatientTab === 'today' && <TodayScreen />}
                {activePatientTab === 'memories' && <MemoriesScreen />}
                {activePatientTab === 'safety' && <SafetyScreen />}
                {activePatientTab === 'care' && <CareScreen />}
                {activePatientTab === 'wellbeing' && <WellbeingScreen />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tab Bar */}
      <TabBar />
    </div>
  );
};

export default Index;
