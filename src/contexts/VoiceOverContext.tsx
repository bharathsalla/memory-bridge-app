import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { useApp } from './AppContext';
import { getScreenMeta, getOnboardingMeta, ScreenReadItem } from '@/services/screenReader';
import { correctName, correctInput, checkRelevance } from '@/services/voiceNLP';

interface VoiceOverContextType {
  isVoiceOverActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isOnHold: boolean;
  isWaitingForInput: boolean;
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
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
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
  const highlightedInputIdRef = useRef<string | null>(null);

  useEffect(() => { isActiveRef.current = isVoiceOverActive; }, [isVoiceOverActive]);
  useEffect(() => { isOnHoldRef.current = isOnHold; }, [isOnHold]);
  useEffect(() => { highlightedInputIdRef.current = highlightedInputId; }, [highlightedInputId]);

  // ── Immediately stop everything ──
  const immediateStop = useCallback(() => {
    window.speechSynthesis.cancel();
    readingQueueRef.current = [];
    isReadingPageRef.current = false;
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { }
    }
  }, []);

  // ── TTS — soft, slow, natural ──
  const speak = useCallback((text: string, priority = false) => {
    if (!isActiveRef.current && !priority) return;
    if (isOnHoldRef.current && !priority) return;

    if (priority) {
      immediateStop();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // Slow, soft, natural voice
    utterance.rate = 0.72;
    utterance.pitch = 0.9;
    utterance.volume = 0.85;

    const voices = window.speechSynthesis.getVoices();
    // Prefer soft female voices
    const preferred =
      voices.find(v => v.name.includes('Samantha')) ||
      voices.find(v => v.name.includes('Karen') && v.lang.startsWith('en')) ||
      voices.find(v => v.name.includes('Moira')) ||
      voices.find(v => v.name.includes('Fiona')) ||
      voices.find(v => v.lang === 'en-GB' && v.localService) ||
      voices.find(v => v.lang.startsWith('en') && v.localService) ||
      voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => { setIsSpeaking(true); isSpeakingRef.current = true; };
    utterance.onend = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      if (!isActiveRef.current || isOnHoldRef.current) return;

      // If waiting for input, start listening immediately — don't continue queue
      if (waitingForInputRef.current) {
        setTimeout(() => startListening(), 300);
        return;
      }

      // Continue reading queue
      if (isReadingPageRef.current && readingQueueRef.current.length > 0) {
        // Small pause between items for natural feel
        setTimeout(() => {
          if (!isActiveRef.current) return;
          const next = readingQueueRef.current.shift()!;
          readItemAloud(next);
        }, 400);
      } else {
        isReadingPageRef.current = false;
        setTimeout(() => startListening(), 300);
      }
    };
    utterance.onerror = () => { isSpeakingRef.current = false; setIsSpeaking(false); };

    window.speechSynthesis.speak(utterance);
  }, []);

  // ── Read a single screen item aloud ──
  const readItemAloud = useCallback((item: ScreenReadItem) => {
    if (!isActiveRef.current) return;

    let text = '';
    switch (item.type) {
      case 'heading':
        text = `${item.label}.`;
        break;
      case 'subheading':
        text = `${item.label}.`;
        break;
      case 'description':
        text = item.label;
        break;
      case 'button':
        text = `There is a button called "${item.label}". ${item.detail || ''}`;
        break;
      case 'input':
        text = `There is an input field for "${item.label}". ${item.detail || ''} Please speak now, and I will fill it in for you.`;
        if (item.inputId) {
          setHighlightedInputId(item.inputId);
          waitingForInputRef.current = true;
          setIsWaitingForInput(true);
        }
        break;
      case 'stat':
        text = `${item.label}. ${item.detail || ''}`;
        break;
      case 'status':
        text = `${item.label}. ${item.detail || ''}`;
        break;
      case 'section':
        text = `${item.label}. ${item.detail || ''}`;
        break;
    }
    speak(text);
  }, [speak]);

  // ── Read entire current page line by line ──
  const readCurrentPage = useCallback(() => {
    if (!isActiveRef.current) return;

    // Stop any current reading first
    immediateStop();

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

    readingQueueRef.current = [...meta.items];
    isReadingPageRef.current = true;

    speak(meta.overview, true);
  }, [appContext, speak, immediateStop]);

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
      // Only restart if active, not speaking, not on hold
      if (isActiveRef.current && !isSpeakingRef.current && !isOnHoldRef.current) {
        setTimeout(() => startListening(), 800);
      }
    };
    recognition.onerror = (e: any) => {
      setIsListening(false);
      if (e.error !== 'no-speech' && e.error !== 'aborted' && isActiveRef.current && !isOnHoldRef.current) {
        setTimeout(() => startListening(), 1500);
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
    // ★ STOP is ALWAYS checked FIRST — highest priority, no matter what state
    if (command.includes('stop') || command.includes('quiet') || command.includes('silence')) {
      immediateStop();
      waitingForInputRef.current = false;
      setIsWaitingForInput(false);
      setHighlightedInputId(null);
      isReadingPageRef.current = false;
      readingQueueRef.current = [];

      speak('Okay, switching to browse mode now. Tap the microphone button whenever you need me again.', true);
      setTimeout(() => stopVoiceOver(), 3000);
      return;
    }

    // ★ HOLD is second priority
    if (command.includes('hold on') || command.includes('wait') || command.includes('pause') || (command.includes('hold') && !command.includes('household'))) {
      immediateStop();
      waitingForInputRef.current = false;
      setIsWaitingForInput(false);
      isReadingPageRef.current = false;
      readingQueueRef.current = [];
      setIsOnHold(true);
      isOnHoldRef.current = true;
      speak('Sure, I will wait. Take your time. Just say "continue" or "go on" whenever you are ready.', true);
      return;
    }

    // Resume from hold
    if (isOnHoldRef.current && (command.includes('continue') || command.includes('go on') || command.includes('resume') || command.includes('carry on') || command.includes('okay'))) {
      setIsOnHold(false);
      isOnHoldRef.current = false;
      speak('Alright, I am back with you. Let me read this page again.', true);
      setTimeout(() => readCurrentPage(), 2000);
      return;
    }

    // If on hold, only listen for resume
    if (isOnHoldRef.current) {
      speak('I am waiting for you. Just say "continue" when you are ready.', true);
      return;
    }

    // ★ INPUT FILLING MODE — if we are waiting for the user to speak a value
    if (waitingForInputRef.current && inputCallbackRef.current) {
      // But first check if they want to skip or try again
      if (command.includes('skip') || command.includes('next')) {
        waitingForInputRef.current = false;
        setIsWaitingForInput(false);
        setHighlightedInputId(null);
        speak('Okay, skipping this field. Moving on.');
        // Continue reading if there is more
        if (isReadingPageRef.current && readingQueueRef.current.length > 0) {
          setTimeout(() => {
            const next = readingQueueRef.current.shift()!;
            readItemAloud(next);
          }, 1000);
        }
        return;
      }

      // Process the spoken input
      waitingForInputRef.current = false;
      setIsWaitingForInput(false);
      const fieldLabel = highlightedInputIdRef.current === 'onboarding-name' ? 'name' : 'text';

      speak('Got it, let me process that for you.');

      let corrected = command;
      try {
        if (fieldLabel === 'name') {
          corrected = await correctName(command);
        } else {
          corrected = await correctInput(command, fieldLabel);
        }
      } catch {
        // Use raw transcript as fallback
        corrected = command.charAt(0).toUpperCase() + command.slice(1);
      }

      inputCallbackRef.current(corrected);
      setHighlightedInputId(null);
      speak(`I have entered "${corrected}". If that looks right, say "continue" or tap the continue button. If you want to try again, say "try again".`, true);
      return;
    }

    // Try again (for input re-entry)
    if (command.includes('try again') || command.includes('redo') || command.includes('again')) {
      if (highlightedInputIdRef.current || onboardingStepRef.current === 'personalize') {
        setHighlightedInputId('onboarding-name');
        waitingForInputRef.current = true;
        setIsWaitingForInput(true);
        speak('Okay, let us try again. Please say your name clearly now.');
        return;
      }
    }

    // Read screen
    if (command.includes('read') || command.includes('where am i') || command.includes('tell me about this')) {
      readCurrentPage();
      return;
    }

    // Navigation
    if (command.includes('today') || command.includes('home')) {
      appContext.setActivePatientTab('today');
      speak('Going to your Today screen now.');
      return;
    }
    if (command.includes('memories') || command.includes('photos') || command.includes('pictures')) {
      appContext.setActivePatientTab('memories');
      speak('Going to your Memories now.');
      return;
    }
    if (command.includes('safety') || command.includes('safe')) {
      appContext.setActivePatientTab('safety');
      speak('Going to Safety now.');
      return;
    }
    if (command.includes('care') || command.includes('family') || command.includes('chat')) {
      appContext.setActivePatientTab('care');
      speak('Going to your Care Circle now.');
      return;
    }
    if (command.includes('wellbeing') || command.includes('profile') || command.includes('settings')) {
      appContext.setActivePatientTab('wellbeing');
      speak('Going to My Wellbeing now.');
      return;
    }

    // Medications
    if (command.includes('take') && (command.includes('medicine') || command.includes('medication') || command.includes('med') || command.includes('pill'))) {
      const pendingMeds = appContext.medications.filter(m => !m.taken);
      if (pendingMeds.length > 0) {
        appContext.markMedicationTaken(pendingMeds[0].id);
        const remaining = pendingMeds.length - 1;
        speak(`Great, I have marked ${pendingMeds[0].name} ${pendingMeds[0].dosage} as taken. ${remaining > 0 ? `You still have ${remaining} more to take.` : 'All your medications are done for now. Well done!'}`);
        appContext.setActivePatientTab('today');
      } else {
        speak('All your medications have been taken already. You are doing great!');
      }
      return;
    }

    // Emergency
    if (command.includes('call') && (command.includes('sarah') || command.includes('sara'))) {
      speak('Calling Sarah Johnson, your caregiver, right now.');
      appContext.setActivePatientTab('safety');
      appContext.triggerSOS();
      return;
    }
    if (command.includes('emergency') || command.includes('sos')) {
      speak('Activating emergency call to Sarah now.');
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
    if (command.includes('happy') || command.includes('good') || command.includes('great') || command.includes('fine')) {
      appContext.setMood({ emoji: '😊', label: 'Happy', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
      speak('Lovely! I have noted that you are feeling happy.');
      return;
    }
    if (command.includes('sad') || command.includes('down') || command.includes('upset') || command.includes('not good')) {
      appContext.setMood({ emoji: '😔', label: 'Sad', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
      speak('I am sorry to hear that, dear. I have noted your mood. Would you like to look at some happy memories, or shall I call Sarah for you?');
      return;
    }
    if (command.includes('tired') || command.includes('sleepy') || command.includes('exhausted')) {
      appContext.setMood({ emoji: '😴', label: 'Tired', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
      speak('I have noted that you are feeling tired. Perhaps it is a good time to rest.');
      return;
    }

    // Continue (general — proceed in flow)
    if (command.includes('continue') || command.includes('next') || command.includes('go on')) {
      // If in reading, skip to end
      if (isReadingPageRef.current) {
        readingQueueRef.current = [];
        isReadingPageRef.current = false;
        speak('Okay, I will stop reading. What would you like to do?');
        return;
      }
      speak('What would you like to do next? You can say "take my medicine", "call Sarah", or go to any screen.');
      return;
    }

    // Help
    if (command.includes('help') || command.includes('options') || command.includes('what can') || command.includes('menu')) {
      speak('Here is what I can help with. Say "take my medicine" to log medication. Say "call Sarah" to reach your caregiver. Say the name of any screen like "memories" or "safety" to go there. Say "read" to hear about this page. Say "hold on" to pause me. Or say "stop" to switch to browse mode.');
      return;
    }

    // ★ Check relevance with NLP for everything else
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
        const alertMsg = `Patient said: "${command}" (off-topic on ${screen}). ${relevance.summary}`;
        setCaretakerMessages(prev => [...prev, alertMsg]);
        console.log('🚨 Caretaker alert:', alertMsg);

        speak(relevance.redirect_message || `Let us focus on what is in front of you. You are on the ${screen} page. ${meta.overview}`);
        return;
      }
    } catch {
      // NLP unavailable
    }

    speak(`I heard you say "${command}", but I am not quite sure what you need. Try saying "help" to hear what I can do for you.`);
  }, [appContext, speak, readCurrentPage, immediateStop]);

  const readScreen = readCurrentPage;

  const setOnboardingStep = useCallback((step: string) => {
    const prevStep = onboardingStepRef.current;
    onboardingStepRef.current = step;
    // Only auto-read if step actually changed and voice is active
    if (isActiveRef.current && !isOnHoldRef.current && step !== prevStep) {
      // Reset input state when changing steps
      waitingForInputRef.current = false;
      setIsWaitingForInput(false);
      setHighlightedInputId(null);
      setTimeout(() => readCurrentPage(), 800);
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
    waitingForInputRef.current = false;
    setIsWaitingForInput(false);
    lastActivityRef.current = Date.now();

    const greeting = (() => {
      const h = new Date().getHours();
      if (h < 12) return 'Good morning';
      if (h < 17) return 'Good afternoon';
      return 'Good evening';
    })();

    const welcome = `${greeting}${appContext.patientName ? ', ' + appContext.patientName : ''}. I am your MemoCare assistant. I will gently guide you through each screen, reading everything aloud. You can say "hold on" to pause me, or "stop" to browse on your own. Let me start.`;

    speak(welcome, true);

    setTimeout(() => readCurrentPage(), 500);
  }, [appContext.patientName, speak, readCurrentPage]);

  // ── Stop voice over ──
  const stopVoiceOver = useCallback(() => {
    immediateStop();
    setIsVoiceOverActive(false);
    isActiveRef.current = false;
    setIsListening(false);
    setIsSpeaking(false);
    setIsOnHold(false);
    isOnHoldRef.current = false;
    setHighlightedInputId(null);
    waitingForInputRef.current = false;
    setIsWaitingForInput(false);
    readingQueueRef.current = [];
    isReadingPageRef.current = false;
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
  }, [immediateStop]);

  // ── Idle detection ──
  useEffect(() => {
    if (!isVoiceOverActive) return;
    idleTimerRef.current = setInterval(() => {
      if (!isActiveRef.current || isOnHoldRef.current || isSpeakingRef.current) return;
      const idle = (Date.now() - lastActivityRef.current) / 1000;
      if (idle > 50) {
        const tab = appContext.activePatientTab;
        const pendingMeds = appContext.medications.filter(m => !m.taken);
        let nudge = `Hey there, are you still with me? `;
        if (pendingMeds.length > 0) {
          nudge += `You have ${pendingMeds.length} medication${pendingMeds.length !== 1 ? 's' : ''} waiting. Would you like to take your medicine, or would you like me to call Sarah?`;
        } else {
          nudge += `You are on the ${tab} screen. Would you like to do something else? Just tell me.`;
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
      waitingForInputRef.current = false;
      setIsWaitingForInput(false);
      setHighlightedInputId(null);
      setTimeout(() => readCurrentPage(), 600);
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
          speak('Hey, it seems like you are tapping a lot. Let me help. What would you like to do? You can say "take my medicine", "call Sarah", or just tell me.');
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
      isWaitingForInput,
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
