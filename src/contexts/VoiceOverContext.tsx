import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { useApp } from './AppContext';

interface VoiceOverContextType {
  isVoiceOverActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  lastUserSpeech: string;
  startVoiceOver: () => void;
  stopVoiceOver: () => void;
  speak: (text: string, priority?: boolean) => void;
  readScreen: () => void;
}

const VoiceOverContext = createContext<VoiceOverContextType | undefined>(undefined);

// Screen descriptions for contextual reading
const screenDescriptions: Record<string, { title: string; description: string }> = {
  today: {
    title: 'Today Screen',
    description: 'This is your daily overview. You can see your medications, activities, mood, steps, and sleep. You can tap a medication to mark it as taken.',
  },
  memories: {
    title: 'Memories Screen',
    description: 'Browse your cherished photo memories. You can view a slideshow, favourite photos, and explore albums like Family and Holidays.',
  },
  safety: {
    title: 'Safety Screen',
    description: 'Your safety dashboard. You can see your current location, fall detection status, and emergency contacts. The emergency SOS button is at the bottom to call for help immediately.',
  },
  care: {
    title: 'Care Circle Screen',
    description: 'Stay connected with your care team. You can chat with family, view care tasks, upcoming appointments, and see your care team members.',
  },
  wellbeing: {
    title: 'My Wellbeing Screen',
    description: 'Track your wellbeing. Log how you are feeling, view your health summary including sleep, steps, and medication adherence. You can also change your interface mode and app settings.',
  },
};

export function VoiceOverProvider({ children }: { children: ReactNode }) {
  const appContext = useApp();
  const [isVoiceOverActive, setIsVoiceOverActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastUserSpeech, setLastUserSpeech] = useState('');

  const recognitionRef = useRef<any>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const lastScreenRef = useRef<string>(appContext.activePatientTab);
  const tapCountRef = useRef<{ count: number; timer: ReturnType<typeof setTimeout> | null }>({ count: 0, timer: null });
  const speakQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);
  const isActiveRef = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    isActiveRef.current = isVoiceOverActive;
  }, [isVoiceOverActive]);

  const speak = useCallback((text: string, priority = false) => {
    if (!isActiveRef.current && !priority) return;

    // Cancel current speech if priority
    if (priority) {
      window.speechSynthesis.cancel();
      speakQueueRef.current = [];
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a natural UK English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Samantha')) ||
      voices.find(v => v.lang === 'en-GB' && v.localService) ||
      voices.find(v => v.lang.startsWith('en') && v.localService) ||
      voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
    };
    utterance.onend = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      // Process next in queue
      if (speakQueueRef.current.length > 0) {
        const next = speakQueueRef.current.shift()!;
        speak(next);
      } else if (isActiveRef.current) {
        // Resume listening after speaking
        startListening();
      }
    };
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const startListening = useCallback(() => {
    if (!isActiveRef.current) return;
    if (isSpeakingRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { }
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-GB';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart listening if voice over is still active
      if (isActiveRef.current && !isSpeakingRef.current) {
        setTimeout(() => startListening(), 500);
      }
    };
    recognition.onerror = (e: any) => {
      setIsListening(false);
      if (e.error !== 'no-speech' && e.error !== 'aborted' && isActiveRef.current) {
        setTimeout(() => startListening(), 1000);
      }
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      setLastUserSpeech(transcript);
      lastActivityRef.current = Date.now();
      handleVoiceCommand(transcript);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch { }
  }, []);

  const handleVoiceCommand = useCallback((command: string) => {
    // Stop voice over
    if (command.includes('stop') || command.includes('quiet') || command.includes('silence') || command.includes('browse')) {
      speak('Switching to browse mode. Say \\\"hey memo\\\" to activate me again.', true);
      setTimeout(() => stopVoiceOver(), 2000);
      return;
    }

    // Navigation commands
    if (command.includes('today') || command.includes('home')) {
      appContext.setActivePatientTab('today');
      speak('Navigating to Today screen.');
      return;
    }
    if (command.includes('memories') || command.includes('photos') || command.includes('pictures')) {
      appContext.setActivePatientTab('memories');
      speak('Navigating to Memories. Browse your cherished photos and albums.');
      return;
    }
    if (command.includes('safety') || command.includes('safe')) {
      appContext.setActivePatientTab('safety');
      speak('Navigating to Safety. You can see your location and emergency contacts here.');
      return;
    }
    if (command.includes('care') || command.includes('family') || command.includes('chat')) {
      appContext.setActivePatientTab('care');
      speak('Navigating to Care Circle. Chat with your family and view care tasks.');
      return;
    }
    if (command.includes('wellbeing') || command.includes('me') || command.includes('profile') || command.includes('settings')) {
      appContext.setActivePatientTab('wellbeing');
      speak('Navigating to My Wellbeing. View your health and change settings.');
      return;
    }

    // Medication commands
    if (command.includes('take') && (command.includes('medicine') || command.includes('medication') || command.includes('med') || command.includes('pill'))) {
      const pendingMeds = appContext.medications.filter(m => !m.taken);
      if (pendingMeds.length > 0) {
        appContext.markMedicationTaken(pendingMeds[0].id);
        speak(`Done! I've marked ${pendingMeds[0].name} ${pendingMeds[0].dosage} as taken. ${pendingMeds.length > 1 ? `You still have ${pendingMeds.length - 1} more to take.` : 'All medications are done for now!'}`);
        appContext.setActivePatientTab('today');
      } else {
        speak('All your medications have been taken already. Well done!');
      }
      return;
    }

    // Call Sarah / emergency
    if (command.includes('call') && (command.includes('sarah') || command.includes('sara'))) {
      speak('Calling Sarah Johnson, your primary caregiver. Please hold.');
      appContext.setActivePatientTab('safety');
      appContext.triggerSOS();
      return;
    }
    if (command.includes('emergency') || command.includes('help') || command.includes('sos')) {
      speak('Activating emergency SOS. Calling your caregiver Sarah now.');
      appContext.triggerSOS();
      appContext.setActivePatientTab('safety');
      return;
    }
    if (command.includes('cancel') && (command.includes('call') || command.includes('emergency') || command.includes('sos'))) {
      appContext.cancelSOS();
      speak('Emergency call cancelled.');
      return;
    }

    // Mood
    if (command.includes('happy') || command.includes('good') || command.includes('great')) {
      appContext.setMood({ emoji: '😊', label: 'Happy', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
      speak('Glad to hear you are feeling happy! I\'ve logged your mood.');
      return;
    }
    if (command.includes('sad') || command.includes('down') || command.includes('upset')) {
      appContext.setMood({ emoji: '😔', label: 'Sad', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
      speak('I\'m sorry to hear that. I\'ve logged your mood. Would you like to chat with Sarah or see some happy memories?');
      return;
    }
    if (command.includes('tired') || command.includes('sleepy')) {
      appContext.setMood({ emoji: '😴', label: 'Tired', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
      speak('I\'ve logged that you\'re feeling tired. Maybe it\'s a good time to rest.');
      return;
    }

    // Read screen
    if (command.includes('read') || command.includes('what') || command.includes('where am i') || command.includes('tell me')) {
      readScreen();
      return;
    }

    // What can I do
    if (command.includes('options') || command.includes('what can') || command.includes('menu')) {
      speak('Here are things you can say: Take my medicine. Call Sarah. Go to Memories. Go to Safety. How am I feeling. Read the screen. Or say Stop to switch to browse mode.');
      return;
    }

    // Didn't understand
    speak(`I heard \\\"${command}\\\". I'm not sure what you'd like to do. You can say: Take my medicine, Call Sarah, Go to Memories, Go to Safety, or say Options to hear all commands.`);
  }, [appContext]);

  const readScreen = useCallback(() => {
    const tab = appContext.activePatientTab;
    const info = screenDescriptions[tab];
    if (!info) return;

    const pendingMeds = appContext.medications.filter(m => !m.taken);
    let extra = '';

    if (tab === 'today') {
      if (pendingMeds.length > 0) {
        extra = ` You have ${pendingMeds.length} medication${pendingMeds.length > 1 ? 's' : ''} to take: ${pendingMeds.map(m => `${m.name} ${m.dosage} at ${m.time}`).join(', ')}. Say \\\"take my medicine\\\" to mark the next one as taken.`;
      } else {
        extra = ' All medications have been taken. Well done!';
      }
      extra += ` Your mood is ${appContext.currentMood.label}. You've walked ${appContext.stepCount.toLocaleString()} steps and slept ${appContext.sleepHours} hours.`;
    }

    if (tab === 'safety') {
      extra = ` Your current location is Home, which is a safe zone. Fall detection is active with no incidents in the last 30 days. You have 3 emergency contacts: Sarah Johnson, John Johnson, and Doctor Smith.`;
    }

    speak(`You are on the ${info.title}. ${info.description}${extra}`);
  }, [appContext, speak]);

  const startVoiceOver = useCallback(() => {
    setIsVoiceOverActive(true);
    isActiveRef.current = true;
    lastActivityRef.current = Date.now();

    // Welcome message
    const pendingMeds = appContext.medications.filter(m => !m.taken);
    const greeting = (() => {
      const h = new Date().getHours();
      if (h < 12) return 'Good morning';
      if (h < 17) return 'Good afternoon';
      return 'Good evening';
    })();

    let welcome = `${greeting}${appContext.patientName ? ', ' + appContext.patientName : ''}! I'm your MemoCare voice assistant. I'll help you navigate and stay on track.`;

    if (pendingMeds.length > 0) {
      welcome += ` You have ${pendingMeds.length} medication${pendingMeds.length > 1 ? 's' : ''} to take. Would you like to take your medicine, call Sarah, or explore your app?`;
    } else {
      welcome += ' All your medications are taken. Would you like to see your memories, check safety, or explore your app?';
    }

    welcome += ' Say \\\"stop\\\" at any time to switch to browse mode.';

    speak(welcome, true);
  }, [appContext, speak]);

  const stopVoiceOver = useCallback(() => {
    setIsVoiceOverActive(false);
    isActiveRef.current = false;
    setIsListening(false);
    setIsSpeaking(false);
    window.speechSynthesis.cancel();
    speakQueueRef.current = [];
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { }
    }
    if (idleTimerRef.current) {
      clearInterval(idleTimerRef.current);
    }
  }, []);

  // Idle detection - every 30 seconds check if user has been inactive
  useEffect(() => {
    if (!isVoiceOverActive) return;

    idleTimerRef.current = setInterval(() => {
      if (!isActiveRef.current) return;
      const idleSeconds = (Date.now() - lastActivityRef.current) / 1000;

      if (idleSeconds > 45) {
        const tab = appContext.activePatientTab;
        const info = screenDescriptions[tab];
        const pendingMeds = appContext.medications.filter(m => !m.taken);

        let nudge = `Hey, are you still there? You've been on the ${info?.title || 'current screen'} for a while. `;

        if (pendingMeds.length > 0) {
          nudge += `You still have ${pendingMeds.length} medication${pendingMeds.length > 1 ? 's' : ''} to take. Would you like to take your medicine, call Sarah, or say what you need?`;
        } else {
          nudge += 'Would you like to browse your memories, check your safety status, or do something else? Just tell me.';
        }

        speak(nudge);
        lastActivityRef.current = Date.now();
      }
    }, 30000);

    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [isVoiceOverActive, appContext, speak]);

  // Screen change detection - read new screen when tab changes
  useEffect(() => {
    if (!isVoiceOverActive) return;
    if (appContext.activePatientTab !== lastScreenRef.current) {
      lastScreenRef.current = appContext.activePatientTab;
      lastActivityRef.current = Date.now();
      // Read the new screen
      setTimeout(() => readScreen(), 500);
    }
  }, [appContext.activePatientTab, isVoiceOverActive, readScreen]);

  // Detect rapid tapping (click events)
  useEffect(() => {
    if (!isVoiceOverActive) return;

    const handleClick = () => {
      lastActivityRef.current = Date.now();
      tapCountRef.current.count++;

      if (tapCountRef.current.timer) clearTimeout(tapCountRef.current.timer);

      tapCountRef.current.timer = setTimeout(() => {
        if (tapCountRef.current.count >= 5) {
          speak('Hey, it looks like you\'re tapping quite a bit. Let me help you. What would you like to do? You can say \\\"take my medicine\\\", \\\"call Sarah\\\", or \\\"go to\\\" any screen.');
        }
        tapCountRef.current.count = 0;
      }, 3000);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isVoiceOverActive, speak]);

  // Load voices
  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { }
      }
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, []);

  return (
    <VoiceOverContext.Provider value={{
      isVoiceOverActive,
      isListening,
      isSpeaking,
      lastUserSpeech,
      startVoiceOver,
      stopVoiceOver,
      speak,
      readScreen,
    }}>
      {children}
    </VoiceOverContext.Provider>
  );
}

export function useVoiceOver() {
  const context = useContext(VoiceOverContext);
  if (!context) throw new Error('useVoiceOver must be used within VoiceOverProvider');
  return context;
}
