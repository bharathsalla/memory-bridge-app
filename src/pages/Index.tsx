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
import PatientReminderPopup from '@/components/PatientReminderPopup';
import { Bell, Phone, RotateCcw, X } from 'lucide-react';

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
  const { onboarded, mode, activePatientTab, activeCaregiverTab, isCaregiverView, toggleCaregiverView, setActivePatientTab, setActiveCaregiverTab, isSOSActive, sosTriggeredLocation, patientLocation, voiceReminders } = useApp();
  const [showReminders, setShowReminders] = React.useState(true);
  const [sosNotification, setSOSNotification] = React.useState(false);
  const [reminderAlert, setReminderAlert] = React.useState<{ medication: string; time: string; caregiverName: string } | null>(null);
  const prevSOSRef = useRef(false);
  const prevActiveCountRef = useRef(0);

  // Show mobile notification when SOS is triggered (for caregiver view)
  useEffect(() => {
    if (isSOSActive && !prevSOSRef.current) {
      setSOSNotification(true);
      const timer = setTimeout(() => setSOSNotification(false), 8000);
      return () => clearTimeout(timer);
    }
    prevSOSRef.current = isSOSActive;
  }, [isSOSActive]);

  // Alert caregiver when a new voice reminder becomes active (syncs both views)
  useEffect(() => {
    const activeCount = voiceReminders.filter(r => r.status === 'active').length;
    if (activeCount > prevActiveCountRef.current && isCaregiverView) {
      const newest = voiceReminders.filter(r => r.status === 'active').slice(-1)[0];
      if (newest) {
        setReminderAlert({ medication: newest.medication, time: newest.time, caregiverName: newest.caregiverName });
        const timer = setTimeout(() => setReminderAlert(null), 10000);
        return () => clearTimeout(timer);
      }
    }
    prevActiveCountRef.current = activeCount;
  }, [voiceReminders, isCaregiverView]);

  // Caregiver alert when patient hasn't responded (check every 10s)
  useEffect(() => {
    if (!isCaregiverView) return;
    const interval = setInterval(() => {
      const pending = voiceReminders.find(r => r.status === 'active');
      if (pending) {
        const elapsed = Date.now() - new Date(pending.createdAt).getTime();
        // Alert after 90 seconds of no response
        if (elapsed > 90000) {
          setReminderAlert({
            medication: pending.medication,
            time: pending.time,
            caregiverName: pending.caregiverName,
          });
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isCaregiverView, voiceReminders]);

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

        {/* Caregiver Reminder Alert Banner */}
        <AnimatePresence>
          {reminderAlert && isCaregiverView && (
            <motion.div
              initial={{ opacity: 0, y: -60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -60 }}
              transition={{ type: 'spring', damping: 20 }}
              className="absolute top-0 left-0 right-0 z-[60] bg-warning text-warning-foreground p-3 shadow-2xl"
              onClick={() => {
                setReminderAlert(null);
                setActiveCaregiverTab('reminders');
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning-foreground/20 flex items-center justify-center animate-pulse shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold">⚠ Medication Reminder Pending!</div>
                  <div className="text-[12px] opacity-90">
                    💊 {reminderAlert.medication} at {reminderAlert.time} — Patient hasn't responded
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCaregiverTab('reminders');
                      setReminderAlert(null);
                    }}
                    className="w-8 h-8 rounded-full bg-warning-foreground/20 flex items-center justify-center"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setReminderAlert(null); }}
                    className="w-8 h-8 rounded-full bg-warning-foreground/20 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
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
                  <PatientReminderPopup />
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
