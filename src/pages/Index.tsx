import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { AnimatePresence, motion } from 'framer-motion';
import IPhoneFrame from '@/components/layout/iPhoneFrame';
import NavBar from '@/components/layout/NavBar';
import TabBar from '@/components/layout/TabBar';
import VoiceOverIndicator from '@/components/VoiceOverIndicator';
import OnboardingScreen from '@/screens/OnboardingScreen';
import TodayScreen from '@/screens/TodayScreen';
import MemoriesScreen from '@/screens/MemoriesScreen';
import MemoryLaneScreen from '@/screens/MemoryLaneScreen';
import SafetyScreen from '@/screens/SafetyScreen';
import CareScreen from '@/screens/CareScreen';
import WellbeingScreen from '@/screens/WellbeingScreen';
import CaregiverDashboard from '@/screens/CaregiverDashboard';
import CaregiverMemoryInsights from '@/screens/CaregiverMemoryInsights';
import RemindersScreen from '@/screens/RemindersScreen';
import CaregiverRemindersPanel from '@/components/CaregiverRemindersPanel';

const navTitles: Record<string, string> = {
  today: 'Today',
  reminders: 'Reminders',
  memories: 'Memories',
  memorylane: 'Memory Lane',
  safety: 'Safety',
  care: 'Care Circle',
  wellbeing: 'My Wellbeing',
};

const cgNavTitles: Record<string, string> = {
  dashboard: 'Care Dashboard',
  health: 'Patient Health',
  tasks: 'Care Tasks',
  reports: 'Reports',
  memories: 'Memory Insights',
  settings: 'Settings',
  reminders: 'Reminders',
};

const Index = () => {
  const { onboarded, mode, activePatientTab, activeCaregiverTab, isCaregiverView, toggleCaregiverView, setActivePatientTab, setActiveCaregiverTab } = useApp();
  const [showReminders, setShowReminders] = React.useState(false);

  const appContent = () => {
    if (!onboarded) {
      return <OnboardingScreen />;
    }

    const isEssential = mode === 'essential' && !isCaregiverView;

    return (
      <div className={`h-full flex flex-col bg-background relative overflow-hidden ${mode}`}>
        <VoiceOverIndicator />
        {!isEssential && (
          <NavBar
            title={isCaregiverView ? cgNavTitles[activeCaregiverTab] : navTitles[activePatientTab]}
            showBack={isCaregiverView}
            onBack={toggleCaregiverView}
            showReminderBell={!isCaregiverView}
            onReminderClick={() => setShowReminders(prev => !prev)}
            showCaregiverExtras={isCaregiverView}
            onReportsClick={() => setActiveCaregiverTab('reports')}
            onSettingsClick={() => setActiveCaregiverTab('settings')}
            rightAction={
              isCaregiverView ? (
                <button onClick={toggleCaregiverView} className="text-ios-subheadline text-primary font-semibold">
                  Patient
                </button>
              ) : undefined
            }
          />
        )}

        {/* Reminders slide-down panel */}
        {!isCaregiverView && showReminders && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-0 left-0 right-0 z-40 bg-background border-b border-border shadow-lg rounded-b-2xl max-h-[70%] overflow-y-auto"
          >
            <div className="p-3 flex items-center justify-between border-b border-border/30">
              <h2 className="text-ios-headline font-bold text-foreground">Reminders</h2>
              <button onClick={() => setShowReminders(false)} className="text-primary text-ios-body font-semibold">Done</button>
            </div>
            <RemindersScreen />
          </motion.div>
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
                activeCaregiverTab === 'memories' ? <CaregiverMemoryInsights /> :
                activeCaregiverTab === 'reminders' ? <CaregiverRemindersPanel /> :
                <CaregiverDashboard />
              ) : (
                <>
                  {activePatientTab === 'today' && <TodayScreen />}
                  {activePatientTab === 'memories' && <MemoriesScreen />}
                  {activePatientTab === 'memorylane' && <MemoryLaneScreen />}
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
