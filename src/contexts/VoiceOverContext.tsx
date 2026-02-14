import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { useApp, PatientTab } from './AppContext';
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
  const shouldRestartListeningRef = useRef(true);

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
  }, []);

  // ── Stop recognition separately (don't kill it when we want to listen during speech) ──
  const stopRecognition = useCallback(() => {
    shouldRestartListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // ── TTS — soft, slow, natural ──
  const speak = useCallback((text: string, priority = false) => {
    if (!isActiveRef.current && !priority) return;
    if (isOnHoldRef.current && !priority) return;

    if (priority) {
      immediateStop();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.78;
    utterance.pitch = 0.95;
    utterance.volume = 0.8;

    const voices = window.speechSynthesis.getVoices();
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

      // If waiting for input, start listening immediately
      if (waitingForInputRef.current) {
        setTimeout(() => startListening(), 200);
        return;
      }

      // Continue reading queue
      if (isReadingPageRef.current && readingQueueRef.current.length > 0) {
        setTimeout(() => {
          if (!isActiveRef.current) return;
          const next = readingQueueRef.current.shift()!;
          readItemAloud(next);
        }, 350);
      } else {
        isReadingPageRef.current = false;
        setTimeout(() => startListening(), 200);
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
        text = item.label;
        break;
      case 'subheading':
        text = item.label;
        break;
      case 'description':
        text = item.label;
        break;
      case 'button':
        text = `Button: ${item.label}. ${item.detail || ''}`;
        break;
      case 'input':
        // ★ CRITICAL: Stop reading, highlight input, and wait for user speech
        text = `I need your input. ${item.detail || `Please tell me your ${item.label}.`}`;
        if (item.inputId) {
          setHighlightedInputId(item.inputId);
          highlightedInputIdRef.current = item.inputId;
          waitingForInputRef.current = true;
          setIsWaitingForInput(true);
          // Pause the reading queue — don't continue until input is filled
          isReadingPageRef.current = false;
        }
        break;
      case 'stat':
        text = `${item.label}: ${item.detail || ''}`;
        break;
      case 'status':
        text = `${item.label}: ${item.detail || ''}`;
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

  // ── STT — CONTINUOUS so user can interrupt at any time ──
  const startListening = useCallback(() => {
    if (!isActiveRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Kill any existing recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { }
      recognitionRef.current = null;
    }

    shouldRestartListeningRef.current = true;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-GB';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart unless explicitly stopped
      if (shouldRestartListeningRef.current && isActiveRef.current) {
        setTimeout(() => {
          if (shouldRestartListeningRef.current && isActiveRef.current) {
            startListening();
          }
        }, 300);
      }
    };
    recognition.onerror = (e: any) => {
      if (e.error === 'aborted') return;
      setIsListening(false);
      if (e.error !== 'no-speech' && shouldRestartListeningRef.current && isActiveRef.current) {
        setTimeout(() => startListening(), 1000);
      }
    };
    recognition.onresult = (event: any) => {
      // Get the latest result
      const lastResult = event.results[event.results.length - 1];
      if (!lastResult.isFinal) return;
      const transcript = lastResult[0].transcript.toLowerCase().trim();
      if (!transcript) return;
      setLastUserSpeech(transcript);
      lastActivityRef.current = Date.now();
      handleVoiceCommand(transcript);
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) {
      console.warn('Recognition start failed:', e);
    }
  }, []);

  // ── Natural language intent matching ──
  const matchesIntent = (cmd: string, patterns: string[]): boolean => {
    return patterns.some(p => cmd.includes(p));
  };

  // ── Handle voice commands ──
  const handleVoiceCommand = useCallback(async (command: string) => {
    // ★★★ STOP — absolute highest priority, works even during speech ★★★
    if (matchesIntent(command, ['stop', 'quiet', 'silence', 'shut up', 'be quiet', 'enough', 'mute'])) {
      immediateStop();
      waitingForInputRef.current = false;
      setIsWaitingForInput(false);
      setHighlightedInputId(null);
      highlightedInputIdRef.current = null;
      isReadingPageRef.current = false;
      readingQueueRef.current = [];

      speak('Okay, I will be quiet now. Tap the microphone whenever you need me.', true);
      setTimeout(() => stopVoiceOver(), 4000);
      return;
    }

    // ★ HOLD / WAIT / PAUSE
    if (matchesIntent(command, ['hold on', 'wait', 'pause', 'one moment', 'one second', 'just a moment', 'give me a moment'])) {
      immediateStop();
      waitingForInputRef.current = false;
      setIsWaitingForInput(false);
      isReadingPageRef.current = false;
      setIsOnHold(true);
      isOnHoldRef.current = true;
      speak('Of course, take your time. Just say "continue" when you are ready.', true);
      return;
    }

    // ★ RESUME from hold
    if (isOnHoldRef.current && matchesIntent(command, ['continue', 'go on', 'resume', 'carry on', 'okay', 'i am ready', "i'm ready", 'go ahead'])) {
      setIsOnHold(false);
      isOnHoldRef.current = false;
      speak('Welcome back. Let me read this page for you again.', true);
      setTimeout(() => readCurrentPage(), 2500);
      return;
    }

    // If on hold, only accept resume
    if (isOnHoldRef.current) {
      speak('I am waiting for you. Say "continue" or "go on" when you are ready.', true);
      return;
    }

    // ★★ INPUT FILLING MODE ★★
    if (waitingForInputRef.current && inputCallbackRef.current) {
      // Check if user wants to skip
      if (matchesIntent(command, ['skip', 'next', 'leave it', 'no thanks'])) {
        waitingForInputRef.current = false;
        setIsWaitingForInput(false);
        setHighlightedInputId(null);
        highlightedInputIdRef.current = null;
        speak('Okay, I will skip this for now.');
        // Resume reading remaining items
        if (readingQueueRef.current.length > 0) {
          isReadingPageRef.current = true;
          setTimeout(() => {
            const next = readingQueueRef.current.shift()!;
            readItemAloud(next);
          }, 1200);
        }
        return;
      }

      // Try again
      if (matchesIntent(command, ['try again', 'redo', 'again', 'repeat', 'wrong'])) {
        speak('Let us try again. Please say your answer clearly now.');
        return;
      }

      // ★ Process the spoken input through NLP
      const fieldId = highlightedInputIdRef.current;
      const fieldLabel = fieldId === 'onboarding-name' ? 'name' : 'text';

      speak('Got it, let me process that.');

      let corrected = command;
      try {
        if (fieldLabel === 'name') {
          corrected = await correctName(command);
        } else {
          corrected = await correctInput(command, fieldLabel);
        }
      } catch {
        // Capitalize first letter as fallback
        corrected = command.charAt(0).toUpperCase() + command.slice(1);
      }

      // Fill the input
      inputCallbackRef.current(corrected);

      // Done with input
      waitingForInputRef.current = false;
      setIsWaitingForInput(false);
      setHighlightedInputId(null);
      highlightedInputIdRef.current = null;

      speak(`I have entered "${corrected}". Does that look right? Say "continue" to move on, or "try again" to change it.`, true);
      return;
    }

    // ★ TRY AGAIN for re-entering input
    if (matchesIntent(command, ['try again', 'redo']) && onboardingStepRef.current === 'personalize') {
      setHighlightedInputId('onboarding-name');
      highlightedInputIdRef.current = 'onboarding-name';
      waitingForInputRef.current = true;
      setIsWaitingForInput(true);
      speak('Okay, please say your name clearly now.');
      return;
    }

    // ★ READ / DESCRIBE page
    if (matchesIntent(command, ['read', 'where am i', 'tell me about', 'what is this', 'describe', 'what page', 'what screen'])) {
      readCurrentPage();
      return;
    }

    // ★ NAVIGATION — natural language patterns
    const navPatterns: { patterns: string[]; tab: PatientTab; label: string }[] = [
      { patterns: ['today', 'home', 'main', 'dashboard', 'daily'], tab: 'today', label: 'Today' },
      { patterns: ['memories', 'photos', 'pictures', 'gallery', 'album'], tab: 'memories', label: 'Memories' },
      { patterns: ['safety', 'safe', 'emergency', 'location', 'map'], tab: 'safety', label: 'Safety' },
      { patterns: ['care', 'family', 'chat', 'circle', 'caregiver', 'sarah'], tab: 'care', label: 'Care Circle' },
      { patterns: ['wellbeing', 'well being', 'health', 'profile', 'settings', 'mood', 'how i feel'], tab: 'wellbeing', label: 'Wellbeing' },
    ];

    // Check for "go to X", "show me X", "take me to X", "open X", "navigate to X"
    const isNavCommand = matchesIntent(command, ['go to', 'go', 'show me', 'show', 'take me', 'open', 'navigate', 'switch to', 'check', 'see', 'look at', 'let me see']);

    for (const nav of navPatterns) {
      if (nav.patterns.some(p => command.includes(p))) {
        if (isNavCommand || nav.patterns.some(p => command.includes(p))) {
          appContext.setActivePatientTab(nav.tab);
          speak(`Taking you to ${nav.label} now.`);
          return;
        }
      }
    }

    // ★ MEDICATIONS
    if (matchesIntent(command, ['take', 'medicine', 'medication', 'med', 'pill', 'drug'])) {
      const pendingMeds = appContext.medications.filter(m => !m.taken);
      if (pendingMeds.length > 0) {
        appContext.markMedicationTaken(pendingMeds[0].id);
        const remaining = pendingMeds.length - 1;
        speak(`Done! I have marked ${pendingMeds[0].name} as taken. ${remaining > 0 ? `You still have ${remaining} more.` : 'All medications done. Well done!'}`);
        appContext.setActivePatientTab('today');
      } else {
        speak('All your medications have been taken already. Well done!');
      }
      return;
    }

    // ★ EMERGENCY
    if (matchesIntent(command, ['call sarah', 'call sara', 'call caregiver', 'call help'])) {
      speak('Calling Sarah Johnson now.');
      appContext.setActivePatientTab('safety');
      appContext.triggerSOS();
      return;
    }
    if (matchesIntent(command, ['emergency', 'sos', 'help me'])) {
      speak('Activating emergency call now.');
      appContext.triggerSOS();
      appContext.setActivePatientTab('safety');
      return;
    }
    if (matchesIntent(command, ['cancel call', 'cancel emergency', 'never mind'])) {
      appContext.cancelSOS();
      speak('Emergency call cancelled.');
      return;
    }

    // ★ MOOD
    if (matchesIntent(command, ['happy', 'good', 'great', 'fine', 'wonderful', 'amazing'])) {
      appContext.setMood({ emoji: '😊', label: 'Happy', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
      speak('Lovely! I have noted you are feeling happy.');
      return;
    }
    if (matchesIntent(command, ['sad', 'down', 'upset', 'not good', 'unhappy', 'low'])) {
      appContext.setMood({ emoji: '😔', label: 'Sad', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
      speak('I am sorry to hear that. I have noted your mood. Would you like to see some memories or call Sarah?');
      return;
    }
    if (matchesIntent(command, ['tired', 'sleepy', 'exhausted', 'fatigue'])) {
      appContext.setMood({ emoji: '😴', label: 'Tired', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
      speak('I have noted you are feeling tired. Perhaps some rest would be good.');
      return;
    }

    // ★ CONTINUE / NEXT in flow
    if (matchesIntent(command, ['continue', 'next', 'go on', 'proceed', 'move on', 'yes', 'correct', 'that is right', "that's right"])) {
      if (isReadingPageRef.current) {
        readingQueueRef.current = [];
        isReadingPageRef.current = false;
        speak('What would you like to do?');
        return;
      }
      speak('What would you like to do next? You can say "take my medicine", "call Sarah", or the name of any screen.');
      return;
    }

    // ★ HIGHLIGHT
    if (matchesIntent(command, ['highlight', 'point', 'show me the', 'where is the'])) {
      speak('Let me read this page to you so you can find what you need.');
      readCurrentPage();
      return;
    }

    // ★ HELP
    if (matchesIntent(command, ['help', 'options', 'what can', 'menu', 'commands'])) {
      speak('Here is what I can do. Say "take my medicine" to log medication. "Call Sarah" to reach your caregiver. Say a screen name like "memories" or "safety" to go there. "Read" to hear about this page. "Hold on" to pause. Or "stop" to turn me off.');
      return;
    }

    // ★ Check relevance with NLP for unrecognized commands
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

        speak(relevance.redirect_message || `Let us focus on what we are doing. You are on the ${screen} screen. ${meta.overview}`);
        return;
      }
    } catch {
      // NLP unavailable — fallback
    }

    speak(`I heard "${command}", but I am not sure what you need. Try saying "help" to hear what I can do.`);
  }, [appContext, speak, readCurrentPage, immediateStop]);

  const readScreen = readCurrentPage;

  const setOnboardingStep = useCallback((step: string) => {
    const prevStep = onboardingStepRef.current;
    onboardingStepRef.current = step;
    if (isActiveRef.current && !isOnHoldRef.current && step !== prevStep) {
      waitingForInputRef.current = false;
      setIsWaitingForInput(false);
      setHighlightedInputId(null);
      highlightedInputIdRef.current = null;
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
    waitingForInputRef.current = false;
    setIsWaitingForInput(false);
    lastActivityRef.current = Date.now();

    const greeting = (() => {
      const h = new Date().getHours();
      if (h < 12) return 'Good morning';
      if (h < 17) return 'Good afternoon';
      return 'Good evening';
    })();

    const welcome = `${greeting}${appContext.patientName ? ', ' + appContext.patientName : ''}. I am your MemoCare assistant. I will read each screen for you and listen to your voice. Say "hold on" to pause me, or "stop" anytime to turn me off. Let me start.`;

    speak(welcome, true);

    // Start listening immediately — runs alongside speech so user can interrupt
    setTimeout(() => startListening(), 500);
    setTimeout(() => readCurrentPage(), 500);
  }, [appContext.patientName, speak, readCurrentPage]);

  // ── Stop voice over ──
  const stopVoiceOver = useCallback(() => {
    immediateStop();
    stopRecognition();
    setIsVoiceOverActive(false);
    isActiveRef.current = false;
    setIsListening(false);
    setIsSpeaking(false);
    setIsOnHold(false);
    isOnHoldRef.current = false;
    setHighlightedInputId(null);
    highlightedInputIdRef.current = null;
    waitingForInputRef.current = false;
    setIsWaitingForInput(false);
    readingQueueRef.current = [];
    isReadingPageRef.current = false;
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
  }, [immediateStop, stopRecognition]);

  // ── Idle detection ──
  useEffect(() => {
    if (!isVoiceOverActive) return;
    idleTimerRef.current = setInterval(() => {
      if (!isActiveRef.current || isOnHoldRef.current || isSpeakingRef.current) return;
      const idle = (Date.now() - lastActivityRef.current) / 1000;
      if (idle > 50) {
        const pendingMeds = appContext.medications.filter(m => !m.taken);
        let nudge = `Are you still there? `;
        if (pendingMeds.length > 0) {
          nudge += `You have ${pendingMeds.length} medication${pendingMeds.length !== 1 ? 's' : ''} waiting. Would you like to take them?`;
        } else {
          nudge += `What would you like to do?`;
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
      highlightedInputIdRef.current = null;
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
          speak('It seems like you are tapping a lot. Can I help? Just tell me what you need.');
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
      stopRecognition();
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [stopRecognition]);

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
