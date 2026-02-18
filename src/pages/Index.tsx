import React, { useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { AnimatePresence, motion } from 'framer-motion';
import IPhoneFrame from '@/components/layout/iPhoneFrame';
import NavBar from '@/components/layout/NavBar';
import TabBar from '@/components/layout/TabBar';
import ContextBanner from '@/components/layout/ContextBanner';
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
import CaregiverSafetyScreen from '@/screens/CaregiverSafetyScreen';

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
  vitals: 'Crisis Prevention',
  tasks: 'Care Tasks',
  reports: 'Reports',
  memories: 'Memory Insights',
  settings: 'Settings',
  reminders: 'Reminders',
  safety: 'Safety Tracking',
};

const Index = () => {
  const { onboarded, mode, activePatientTab, activeCaregiverTab, isCaregiverView, toggleCaregiverView, setActivePatientTab, setActiveCaregiverTab, isSOSActive, sosTriggeredLocation, patientLocation } = useApp();
  const [showReminders, setShowReminders] = React.useState(true);
  const [sosNotification, setSOSNotification] = React.useState(false);
  const prevSOSRef = useRef(false);

  // Show mobile notification when SOS is triggered (for caregiver view)
  useEffect(() => {
    if (isSOSActive && !prevSOSRef.current) {
      setSOSNotification(true);
      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => setSOSNotification(false), 8000);
      return () => clearTimeout(timer);
    }
    prevSOSRef.current = isSOSActive;
  }, [isSOSActive]);

  // Don't show reminders when switching to caregiver view
  useEffect(() => {
    if (isCaregiverView) {
      setShowReminders(false);
    }
  }, [isCaregiverView]);

  const appContent = () => {
    if (!onboarded) {
      return <OnboardingScreen />;
    }

    return (
      <div className={`h-full flex flex-col bg-background relative overflow-hidden ${mode}`}>
        {/* Mobile SOS Notification Banner */}
        <AnimatePresence>
          {sosNotification && isCaregiverView && (
            <motion.div
              initial={{ opacity: 0, y: -60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -60 }}
              transition={{ type: 'spring', damping: 20 }}
              className="absolute top-0 left-0 right-0 z-[60] bg-destructive text-destructive-foreground p-3 shadow-2xl"
              onClick={() => {
                setSOSNotification(false);
                if (!isCaregiverView) toggleCaregiverView();
                setActiveCaregiverTab('safety');
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive-foreground/20 flex items-center justify-center animate-pulse shrink-0">
                  <span className="text-[20px]">🚨</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold">Emergency SOS Alert!</div>
                  <div className="text-[12px] opacity-90">📍 {sosTriggeredLocation || patientLocation} — Tap to respond</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSOSNotification(false); }}
                  className="text-[12px] font-semibold opacity-80 px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <VoiceOverIndicator />
        {!(mode === 'essential' && !isCaregiverView) && (
          <NavBar
            title={isCaregiverView ? cgNavTitles[activeCaregiverTab] : navTitles[activePatientTab]}
            showBack={isCaregiverView}
            onBack={toggleCaregiverView}
            showReminderBell={!isCaregiverView}
            onReminderClick={() => {
              if (isCaregiverView) {
                setActiveCaregiverTab('reminders');
              } else {
                setShowReminders(prev => !prev);
              }
            }}
            showCaregiverExtras={isCaregiverView}
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
              <button
                onClick={() => setShowReminders(false)}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-[15px] active:scale-95 transition-transform"
              >
                Close
              </button>
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
                activeCaregiverTab === 'safety' ? <CaregiverSafetyScreen /> :
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

        <ContextBanner />
        <TabBar />
      </div>
    );
  };

  return <IPhoneFrame>{appContent()}</IPhoneFrame>;
};

export default Index;
