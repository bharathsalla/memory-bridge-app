import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type AppMode = 'full' | 'simplified' | 'essential';
export type PatientTab = 'today' | 'memories' | 'safety' | 'care' | 'wellbeing';
export type CaregiverTab = 'dashboard' | 'health' | 'tasks' | 'reports' | 'settings';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  instructions: string;
  taken: boolean;
  takenAt?: string;
}

interface ActivityItem {
  id: string;
  time: string;
  description: string;
  icon: string;
  completed: boolean;
}

interface MoodEntry {
  emoji: string;
  label: string;
  time: string;
}

interface AppState {
  mode: AppMode;
  onboarded: boolean;
  patientName: string;
  activePatientTab: PatientTab;
  activeCaregiverTab: CaregiverTab;
  isCaregiverView: boolean;
  medications: Medication[];
  activities: ActivityItem[];
  currentMood: MoodEntry;
  stepCount: number;
  sleepHours: number;
  medicationAdherence: number;
  taskCompletionRate: number;
  isSOSActive: boolean;
  detailScreen: string | null;
}

interface AppContextType extends AppState {
  setMode: (mode: AppMode) => void;
  completeOnboarding: (name: string, mode: AppMode) => void;
  setActivePatientTab: (tab: PatientTab) => void;
  setActiveCaregiverTab: (tab: CaregiverTab) => void;
  toggleCaregiverView: () => void;
  markMedicationTaken: (id: string) => void;
  setMood: (entry: MoodEntry) => void;
  triggerSOS: () => void;
  cancelSOS: () => void;
  navigateToDetail: (screen: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialMedications: Medication[] = [
  { id: '1', name: 'Lisinopril', dosage: '10mg', time: '9:00 AM', instructions: 'Take 1 tablet with water', taken: true, takenAt: '9:03 AM' },
  { id: '2', name: 'Metformin', dosage: '500mg', time: '2:00 PM', instructions: 'Take with food', taken: false },
  { id: '3', name: 'Aspirin', dosage: '81mg', time: '8:00 PM', instructions: 'Take 1 tablet', taken: false },
];

const initialActivities: ActivityItem[] = [
  { id: '1', time: '9:00 AM', description: 'Medication taken — Lisinopril', icon: '💊', completed: true },
  { id: '2', time: '9:30 AM', description: 'Breakfast logged', icon: '🍳', completed: true },
  { id: '3', time: '10:15 AM', description: 'Walk detected — 1,200 steps', icon: '🚶', completed: true },
  { id: '4', time: '12:00 PM', description: 'Lunch reminder sent', icon: '🔔', completed: false },
  { id: '5', time: '2:00 PM', description: 'Medication due — Metformin', icon: '💊', completed: false },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    mode: 'full',
    onboarded: false,
    patientName: '',
    activePatientTab: 'today',
    activeCaregiverTab: 'dashboard',
    isCaregiverView: false,
    medications: initialMedications,
    activities: initialActivities,
    currentMood: { emoji: '😊', label: 'Happy', time: '10:00 AM' },
    stepCount: 2340,
    sleepHours: 7.5,
    medicationAdherence: 95,
    taskCompletionRate: 85,
    isSOSActive: false,
    detailScreen: null,
  });

  const setMode = useCallback((mode: AppMode) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  const completeOnboarding = useCallback((name: string, mode: AppMode) => {
    setState(prev => ({ ...prev, onboarded: true, patientName: name, mode }));
  }, []);

  const setActivePatientTab = useCallback((tab: PatientTab) => {
    setState(prev => ({ ...prev, activePatientTab: tab, detailScreen: null }));
  }, []);

  const setActiveCaregiverTab = useCallback((tab: CaregiverTab) => {
    setState(prev => ({ ...prev, activeCaregiverTab: tab }));
  }, []);

  const toggleCaregiverView = useCallback(() => {
    setState(prev => ({ ...prev, isCaregiverView: !prev.isCaregiverView, detailScreen: null }));
  }, []);

  const markMedicationTaken = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      medications: prev.medications.map(m =>
        m.id === id ? { ...m, taken: true, takenAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) } : m
      ),
    }));
  }, []);

  const setMood = useCallback((entry: MoodEntry) => {
    setState(prev => ({ ...prev, currentMood: entry }));
  }, []);

  const triggerSOS = useCallback(() => {
    setState(prev => ({ ...prev, isSOSActive: true }));
  }, []);

  const cancelSOS = useCallback(() => {
    setState(prev => ({ ...prev, isSOSActive: false }));
  }, []);

  const navigateToDetail = useCallback((screen: string | null) => {
    setState(prev => ({ ...prev, detailScreen: screen }));
  }, []);

  return (
    <AppContext.Provider value={{
      ...state,
      setMode,
      completeOnboarding,
      setActivePatientTab,
      setActiveCaregiverTab,
      toggleCaregiverView,
      markMedicationTaken,
      setMood,
      triggerSOS,
      cancelSOS,
      navigateToDetail,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
