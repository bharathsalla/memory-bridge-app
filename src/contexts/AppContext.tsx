import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type AppMode = 'full' | 'simplified' | 'essential';
export type PatientTab = 'today' | 'memories' | 'memorylane' | 'safety' | 'care' | 'wellbeing' | 'reminders';
export type CaregiverTab = 'dashboard' | 'vitals' | 'tasks' | 'reports' | 'memories' | 'settings' | 'reminders' | 'safety';

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

interface SOSHistoryEntry {
  id: string;
  timestamp: string;
  location: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface VoiceReminder {
  id: string;
  medication: string;
  time: string;
  frequency: string;
  trigger: string;
  patientMessage: string;
  caregiverName: string;
  transcript: string;
  createdAt: string;
  status: 'active' | 'taken' | 'snoozed' | 'missed';
  snoozedUntil?: string;
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
  sosTriggeredLocation: string | null;
  detailScreen: string | null;
  patientSafe: boolean;
  patientLocation: string;
  safeZoneRadius: number;
  sosHistory: SOSHistoryEntry[];
  voiceReminders: VoiceReminder[];
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
  setPatientSafe: (safe: boolean) => void;
  setPatientLocation: (loc: string) => void;
  setSafeZoneRadius: (r: number) => void;
  sosHistory: SOSHistoryEntry[];
  addVoiceReminder: (reminder: Omit<VoiceReminder, 'id' | 'createdAt' | 'status'>) => void;
  acknowledgeVoiceReminder: (id: string) => void;
  snoozeVoiceReminder: (id: string, minutes: number) => void;
  voiceReminders: VoiceReminder[];
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
    sosTriggeredLocation: null,
    detailScreen: null,
    patientSafe: true,
    patientLocation: 'Lakshmi Nagar, Hyderabad',
    safeZoneRadius: 200,
    sosHistory: [
      { id: 'hist-1', timestamp: 'Feb 12, 3:45 PM', location: 'Near Park', resolved: true, resolvedAt: 'Feb 12, 3:52 PM' },
      { id: 'hist-2', timestamp: 'Feb 8, 11:20 AM', location: 'Home', resolved: true, resolvedAt: 'Feb 8, 11:25 AM' },
      { id: 'hist-3', timestamp: 'Jan 28, 2:10 PM', location: 'Market Area', resolved: true, resolvedAt: 'Jan 28, 2:30 PM' },
    ],
    voiceReminders: [],
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
    setState(prev => ({
      ...prev,
      isSOSActive: true,
      sosTriggeredLocation: prev.patientLocation,
      sosHistory: [
        {
          id: `sos-${Date.now()}`,
          timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
          location: prev.patientLocation,
          resolved: false,
        },
        ...prev.sosHistory,
      ],
    }));
  }, []);

  const setPatientSafe = useCallback((safe: boolean) => {
    setState(prev => ({ ...prev, patientSafe: safe }));
  }, []);

  const setPatientLocation = useCallback((loc: string) => {
    setState(prev => ({ ...prev, patientLocation: loc }));
  }, []);

  const setSafeZoneRadius = useCallback((r: number) => {
    setState(prev => ({ ...prev, safeZoneRadius: r }));
  }, []);

  const cancelSOS = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSOSActive: false,
      sosTriggeredLocation: null,
      sosHistory: prev.sosHistory.map((s, i) =>
        i === 0 && !s.resolved
          ? { ...s, resolved: true, resolvedAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) }
          : s
      ),
    }));
  }, []);

  const navigateToDetail = useCallback((screen: string | null) => {
    setState(prev => ({ ...prev, detailScreen: screen }));
  }, []);

  const addVoiceReminder = useCallback((reminder: Omit<VoiceReminder, 'id' | 'createdAt' | 'status'>) => {
    setState(prev => ({
      ...prev,
      voiceReminders: [
        ...prev.voiceReminders,
        {
          ...reminder,
          id: `vr-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'active' as const,
        },
      ],
    }));
  }, []);

  const acknowledgeVoiceReminder = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      voiceReminders: prev.voiceReminders.map(r =>
        r.id === id ? { ...r, status: 'taken' as const } : r
      ),
    }));
  }, []);

  const snoozeVoiceReminder = useCallback((id: string, minutes: number) => {
    const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setState(prev => ({
      ...prev,
      voiceReminders: prev.voiceReminders.map(r =>
        r.id === id ? { ...r, status: 'snoozed' as const, snoozedUntil } : r
      ),
    }));
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
      setPatientSafe,
      setPatientLocation,
      setSafeZoneRadius,
      addVoiceReminder,
      acknowledgeVoiceReminder,
      snoozeVoiceReminder,
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
