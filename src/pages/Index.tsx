import { useApp } from '@/contexts/AppContext';
import { AnimatePresence, motion } from 'framer-motion';
import IPhoneFrame from '@/components/layout/iPhoneFrame';
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

  const appContent = () => {
    if (!onboarded) {
      return <OnboardingScreen />;
    }

    const isEssential = mode === 'essential' && !isCaregiverView;

    return (
      <div className={`h-full flex flex-col bg-background relative overflow-hidden ${mode}`}>
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

        <div className="flex-1 overflow-hidden">
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

        <TabBar />
      </div>
    );
  };

  return <IPhoneFrame>{appContent()}</IPhoneFrame>;
};

export default Index;
