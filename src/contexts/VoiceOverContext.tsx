import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { useApp } from './AppContext';
import { getScreenMeta, getOnboardingMeta, ScreenReadItem } from '@/services/screenReader';
import { correctName, correctInput, checkRelevance } from '@/services/voiceNLP';

interface VoiceOverContextType {
  isVoiceOverActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isOnHold: boolean;
  lastUserSpeech: string;
  highlightedInputId: string | null;
  startVoiceOver: () => void;
  stopVoiceOver: () => void;
  speak: (text: string, priority?: boolean) => void;
  readScreen: () => void;
  readCurrentPage: () => void;
  setOnboardingStep: (step: string) => void;
  setInputCallback: (cb: ((value: string) => void) | null) => void;
  caretakerMessages: string[];
}

const VoiceOverContext = createContext<VoiceOverContextType | undefined>(undefined);

export function VoiceOverProvider({ children }: { children: ReactNode }) {
  const appContext = useApp();
  const [isVoiceOverActive, setIsVoiceOverActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [lastUserSpeech, setLastUserSpeech] = useState('');
  const [highlightedInputId, setHighlightedInputId] = useState<string | null>(null);
  const [caretakerMessages, setCaretakerMessages] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const lastScreenRef = useRef<string>(appContext.activePatientTab);
  const tapCountRef = useRef<{ count: number; timer: ReturnType<typeof setTimeout> | null }>({ count: 0, timer: null });
  const isActiveRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isOnHoldRef = useRef(false);
  const onboardingStepRef = useRef<string>('');
  const inputCallbackRef = useRef<((value: string) => void) | null>(null);
  const waitingForInputRef = useRef(false);
  const readingQueueRef = useRef<ScreenReadItem[]>([]);
  const isReadingPageRef = useRef(false);

  useEffect(() => { isActiveRef.current = isVoiceOverActive; }, [isVoiceOverActive]);
  useEffect(() => { isOnHoldRef.current = isOnHold; }, [isOnHold]);

  // ── TTS ──
  const speak = useCallback((text: string, priority = false) => {
    if (!isActiveRef.current && !priority) return;
    if (isOnHoldRef.current && !priority) return;

    if (priority) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Samantha')) ||
      voices.find(v => v.lang === 'en-GB' && v.localService) ||
      voices.find(v => v.lang.startsWith('en') && v.localService) ||
      voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => { setIsSpeaking(true); isSpeakingRef.current = true; };
    utterance.onend = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      if (isActiveRef.current && !isOnHoldRef.current) {
        // Continue reading queue
        if (isReadingPageRef.current && readingQueueRef.current.length > 0) {
          const next = readingQueueRef.current.shift()!;
          readItemAloud(next);
        } else {
          isReadingPageRef.current = false;
          startListening();
        }
      }
    };
    utterance.onerror = () => { isSpeakingRef.current = false; setIsSpeaking(false); };

    window.speechSynthesis.speak(utterance);
  }, []);

  // ── Read a single screen item aloud ──
  const readItemAloud = useCallback((item: ScreenReadItem) => {
    let text = '';
    switch (item.type) {
      case 'heading':
        text = `Heading: ${item.label}.`;
        break;
      case 'subheading':
        text = `Subheading: ${item.label}.`;
        break;
      case 'description':
        text = item.label;
        break;
      case 'button':
        text = `Button: ${item.label}. ${item.detail || ''}`;
        break;
      case 'input':
        text = `Input field: ${item.label}. ${item.detail || ''}`;
        // Highlight the input and wait for voice input
        if (item.inputId) {
          setHighlightedInputId(item.inputId);
          waitingForInputRef.current = true;
        }
        break;
      case 'stat':
        text = `${item.label}: ${item.detail || ''}`;
        break;
      case 'status':
        text = `${item.label}: ${item.detail || ''}`;
        break;
      case 'section':
        text = `Section: ${item.label}. ${item.detail || ''}`;
        break;
    }
    speak(text);
  }, [speak]);

  // ── Read entire current page line by line ──
  const readCurrentPage = useCallback(() => {
    if (!isActiveRef.current) return;

    let meta;
    if (!appContext.onboarded && onboardingStepRef.current) {
      meta = getOnboardingMeta(onboardingStepRef.current);
    } else {
      meta = getScreenMeta(appContext.activePatientTab, {
        medications: appContext.medications,
        currentMood: appContext.currentMood,
        stepCount: appContext.stepCount,
        sleepHours: appContext.sleepHours,
      });
    }

    if (!meta || !meta.overview) return;

    // Queue items for sequential reading
    readingQueueRef.current = [...meta.items];
    isReadingPageRef.current = true;

    // Start with overview
    speak(meta.overview, true);
  }, [appContext, speak]);

  // ── STT ──
  const startListening = useCallback(() => {
    if (!isActiveRef.current) return;
    if (isSpeakingRef.current) return;
    if (isOnHoldRef.current) return;

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
      if (isActiveRef.current && !isSpeakingRef.current && !isOnHoldRef.current) {
        setTimeout(() => startListening(), 500);
      }
    };
    recognition.onerror = (e: any) => {
      setIsListening(false);
      if (e.error !== 'no-speech' && e.error !== 'aborted' && isActiveRef.current && !isOnHoldRef.current) {
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
    try { recognition.start(); } catch { }
  }, []);

  // ── Handle voice commands ──
  const handleVoiceCommand = useCallback(async (command: string) => {
    // Hold command
    if (command.includes('hold on') || command.includes('wait') || command.includes('pause') || command.includes('hold')) {
      window.speechSynthesis.cancel();
      readingQueueRef.current = [];
      isReadingPageRef.current = false;
      setIsOnHold(true);
      isOnHoldRef.current = true;
      speak('Okay, I will hold. Take your time. Say "continue" or "go on" when you are ready.', true);
      return;
    }

    // Resume from hold
    if (isOnHoldRef.current && (command.includes('continue') || command.includes('go on') || command.includes('resume') || command.includes('carry on'))) {
      setIsOnHold(false);
      isOnHoldRef.current = false;
      speak('Alright, I am back! Let me read this page for you.', true);
      setTimeout(() => readCurrentPage(), 1500);
      return;
    }

    // If on hold, only listen for resume
    if (isOnHoldRef.current) {
      speak('I am on hold right now. Say "continue" when you are ready for me to carry on.', true);
      return;
    }

    // If waiting for input, fill it
    if (waitingForInputRef.current && inputCallbackRef.current) {
      waitingForInputRef.current = false;
      const fieldLabel = highlightedInputId === 'onboarding-name' ? 'name' : 'text';

      speak('Let me process that for you...');

      let corrected = command;
      try {
        if (fieldLabel === 'name') {
          corrected = await correctName(command);
        } else {
          corrected = await correctInput(command, fieldLabel);
        }
      } catch {
        corrected = command;
      }

      inputCallbackRef.current(corrected);
      setHighlightedInputId(null);
      speak(`I have entered: ${corrected}. If that is correct, say "continue". If not, say "try again".`, true);
      return;
    }

    // Stop / browse mode
    if (command.includes('stop') || command.includes('quiet') || command.includes('silence') || command.includes('browse')) {
      speak('Switching to browse mode. You can tap the microphone button to activate me again.', true);
      setTimeout(() => stopVoiceOver(), 2500);
      return;
    }

    // Read screen
    if (command.includes('read') || command.includes('what') || command.includes('where am i') || command.includes('tell me about')) {
      readCurrentPage();
      return;
    }

    // Navigation
    if (command.includes('today') || command.includes('home')) {
      appContext.setActivePatientTab('today');
      speak('Navigating to Today screen.');
      return;
    }
    if (command.includes('memories') || command.includes('photos') || command.includes('pictures')) {
      appContext.setActivePatientTab('memories');
      speak('Navigating to Memories.');
      return;
    }
    if (command.includes('safety') || command.includes('safe')) {
      appContext.setActivePatientTab('safety');
      speak('Navigating to Safety.');
      return;
    }
    if (command.includes('care') || command.includes('family') || command.includes('chat')) {
      appContext.setActivePatientTab('care');
      speak('Navigating to Care Circle.');
      return;
    }
    if (command.includes('wellbeing') || command.includes('me') || command.includes('profile') || command.includes('settings')) {
      appContext.setActivePatientTab('wellbeing');
      speak('Navigating to My Wellbeing.');
      return;
    }

    // Medications
    if (command.includes('take') && (command.includes('medicine') || command.includes('medication') || command.includes('med') || command.includes('pill'))) {
      const pendingMeds = appContext.medications.filter(m => !m.taken);
      if (pendingMeds.length > 0) {
        appContext.markMedicationTaken(pendingMeds[0].id);
        speak(`Done! I have marked ${pendingMeds[0].name} ${pendingMeds[0].dosage} as taken. ${pendingMeds.length > 1 ? `You still have ${pendingMeds.length - 1} more to take.` : 'All medications done!'}`);
        appContext.setActivePatientTab('today');
      } else {
        speak('All your medications have been taken already. Well done!');
      }
      return;
    }

    // Emergency
    if (command.includes('call') && (command.includes('sarah') || command.includes('sara'))) {
      speak('Calling Sarah Johnson, your primary caregiver.');
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
    if (command.includes('cancel') && (command.includes('call') || command.includes('emergency'))) {
      appContext.cancelSOS();
      speak('Emergency call cancelled.');
      return;
    }

    // Mood
    if (command.includes('happy') || command.includes('good') || command.includes('great')) {
      appContext.setMood({ emoji: '😊', label: 'Happy', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
      speak('Glad to hear that! I have logged your mood as happy.');
      return;
    }
    if (command.includes('sad') || command.includes('down') || command.includes('upset')) {
      appContext.setMood({ emoji: '😔', label: 'Sad', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
      speak('I am sorry to hear that. I have logged your mood. Would you like to see some happy memories or call Sarah?');
      return;
    }
    if (command.includes('tired') || command.includes('sleepy')) {
      appContext.setMood({ emoji: '😴', label: 'Tired', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
      speak('I have logged that you are feeling tired. Maybe time to rest.');
      return;
    }

    // Try again (for input)
    if (command.includes('try again') || command.includes('redo')) {
      if (highlightedInputId) {
        waitingForInputRef.current = true;
        speak('Okay, please say it again. I am listening.');
        return;
      }
    }

    // Options
    if (command.includes('options') || command.includes('what can') || command.includes('menu')) {
      speak('You can say: Take my medicine. Call Sarah. Go to Memories, Safety, Care, or Wellbeing. Read the screen. Hold on to pause me. Or say Stop to switch to browse mode.');
      return;
    }

    // Check relevance with NLP for unrecognized commands
    const screen = appContext.onboarded ? appContext.activePatientTab : 'onboarding';
    const meta = appContext.onboarded
      ? getScreenMeta(appContext.activePatientTab, {
          medications: appContext.medications,
          currentMood: appContext.currentMood,
          stepCount: appContext.stepCount,
          sleepHours: appContext.sleepHours,
        })
      : getOnboardingMeta(onboardingStepRef.current);

    try {
      const relevance = await checkRelevance(command, screen, meta.purpose, onboardingStepRef.current || 'browsing');
      if (!relevance.relevant) {
        // Alert caretaker
        const alertMsg = `Patient said something off-topic: "${command}" while on ${screen} screen. Summary: ${relevance.summary}`;
        setCaretakerMessages(prev => [...prev, alertMsg]);
        console.log('🚨 Caretaker alert:', alertMsg);

        speak(relevance.redirect_message || `Hold on, we are on the ${meta.overview ? screen : 'current'} page right now. Let me help you focus. ${meta.overview}`);
        return;
      }
    } catch {
      // NLP failed, fall through to generic response
    }

    speak(`I heard "${command}". I am not sure what you would like. Say "options" to hear what I can do, or "read" to hear about this page.`);
  }, [appContext, speak, readCurrentPage, highlightedInputId]);

  // Alias for backward compat
  const readScreen = readCurrentPage;

  const setOnboardingStep = useCallback((step: string) => {
    onboardingStepRef.current = step;
    if (isActiveRef.current && !isOnHoldRef.current) {
      setTimeout(() => readCurrentPage(), 600);
    }
  }, [readCurrentPage]);

  const setInputCallback = useCallback((cb: ((value: string) => void) | null) => {
    inputCallbackRef.current = cb;
  }, []);

  // ── Start voice over ──
  const startVoiceOver = useCallback(() => {
    setIsVoiceOverActive(true);
    isActiveRef.current = true;
    setIsOnHold(false);
    isOnHoldRef.current = false;
    lastActivityRef.current = Date.now();

    const greeting = (() => {
      const h = new Date().getHours();
      if (h < 12) return 'Good morning';
      if (h < 17) return 'Good afternoon';
      return 'Good evening';
    })();

    let welcome = `${greeting}${appContext.patientName ? ', ' + appContext.patientName : ''}! I am your MemoCare voice assistant. I will read each screen for you, line by line, and help you with everything. Say "hold on" at any time to pause me, or "stop" to switch to browse mode. Let me start reading this page for you.`;

    speak(welcome, true);

    // Start reading the current page after welcome
    setTimeout(() => readCurrentPage(), 500);
  }, [appContext.patientName, speak, readCurrentPage]);

  // ── Stop voice over ──
  const stopVoiceOver = useCallback(() => {
    setIsVoiceOverActive(false);
    isActiveRef.current = false;
    setIsListening(false);
    setIsSpeaking(false);
    setIsOnHold(false);
    isOnHoldRef.current = false;
    setHighlightedInputId(null);
    waitingForInputRef.current = false;
    readingQueueRef.current = [];
    isReadingPageRef.current = false;
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { }
    }
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
  }, []);

  // ── Idle detection ──
  useEffect(() => {
    if (!isVoiceOverActive) return;
    idleTimerRef.current = setInterval(() => {
      if (!isActiveRef.current || isOnHoldRef.current) return;
      const idle = (Date.now() - lastActivityRef.current) / 1000;
      if (idle > 45) {
        const tab = appContext.activePatientTab;
        const pendingMeds = appContext.medications.filter(m => !m.taken);
        let nudge = `Hey, are you still there? You have been on the ${tab} screen for a while. `;
        if (pendingMeds.length > 0) {
          nudge += `You still have ${pendingMeds.length} medication${pendingMeds.length !== 1 ? 's' : ''} to take. Would you like to take your medicine, call Sarah, or say what you need?`;
        } else {
          nudge += 'Would you like to browse your memories, check your safety, or do something else?';
        }
        speak(nudge);
        lastActivityRef.current = Date.now();
      }
    }, 30000);
    return () => { if (idleTimerRef.current) clearInterval(idleTimerRef.current); };
  }, [isVoiceOverActive, appContext, speak]);

  // ── Screen change detection ──
  useEffect(() => {
    if (!isVoiceOverActive) return;
    if (appContext.activePatientTab !== lastScreenRef.current) {
      lastScreenRef.current = appContext.activePatientTab;
      lastActivityRef.current = Date.now();
      setTimeout(() => readCurrentPage(), 500);
    }
  }, [appContext.activePatientTab, isVoiceOverActive, readCurrentPage]);

  // ── Rapid tap detection ──
  useEffect(() => {
    if (!isVoiceOverActive) return;
    const handleClick = () => {
      lastActivityRef.current = Date.now();
      tapCountRef.current.count++;
      if (tapCountRef.current.timer) clearTimeout(tapCountRef.current.timer);
      tapCountRef.current.timer = setTimeout(() => {
        if (tapCountRef.current.count >= 5) {
          speak('Hey, it looks like you are tapping quite a bit. Let me help you. What would you like to do? Say "take my medicine", "call Sarah", or "go to" any screen.');
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

  // Cleanup
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch { } }
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, []);

  return (
    <VoiceOverContext.Provider value={{
      isVoiceOverActive,
      isListening,
      isSpeaking,
      isOnHold,
      lastUserSpeech,
      highlightedInputId,
      startVoiceOver,
      stopVoiceOver,
      speak,
      readScreen,
      readCurrentPage,
      setOnboardingStep,
      setInputCallback,
      caretakerMessages,
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
