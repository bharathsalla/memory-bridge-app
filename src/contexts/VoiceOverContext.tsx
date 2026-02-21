import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { useApp, PatientTab } from './AppContext';
import { getScreenMeta, getOnboardingMeta, ScreenReadItem } from '@/services/screenReader';
import { correctName, correctInput } from '@/services/voiceNLP';

const ASSISTANT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-assistant`;
const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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
  const appContextRef = useRef(appContext);
  const processingCommandRef = useRef(false);

  useEffect(() => { appContextRef.current = appContext; }, [appContext]);
  useEffect(() => { isActiveRef.current = isVoiceOverActive; }, [isVoiceOverActive]);
  useEffect(() => { isOnHoldRef.current = isOnHold; }, [isOnHold]);
  useEffect(() => { highlightedInputIdRef.current = highlightedInputId; }, [highlightedInputId]);

  // ── Cancel all speech immediately ──
  const immediateStop = useCallback(() => {
    window.speechSynthesis.cancel();
    readingQueueRef.current = [];
    isReadingPageRef.current = false;
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  // ── Stop recognition ──
  const stopRecognition = useCallback(() => {
    shouldRestartListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // ── TTS — soft, slow, companion-like ──
  const speak = useCallback((text: string, priority = false) => {
    if (!isActiveRef.current && !priority) return;
    if (isOnHoldRef.current && !priority) return;

    if (priority) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.75;
    utterance.pitch = 0.92;
    utterance.volume = 0.75;

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

      if (waitingForInputRef.current) {
        ensureListening();
        return;
      }

      // Continue reading queue
      if (isReadingPageRef.current && readingQueueRef.current.length > 0) {
        setTimeout(() => {
          if (!isActiveRef.current) return;
          const next = readingQueueRef.current.shift()!;
          processReadItem(next);
        }, 300);
      } else {
        isReadingPageRef.current = false;
        ensureListening();
      }
    };
    utterance.onerror = () => { isSpeakingRef.current = false; setIsSpeaking(false); };

    window.speechSynthesis.speak(utterance);
  }, []);

  const ensureListening = useCallback(() => {
    if (!isActiveRef.current) return;
    if (recognitionRef.current) return;
    startListening();
  }, []);

  // ── Process a screen read item ──
  const processReadItem = useCallback((item: ScreenReadItem) => {
    if (!isActiveRef.current) return;

    let text = '';
    switch (item.type) {
      case 'heading':
      case 'subheading':
      case 'description':
        text = item.label;
        break;
      case 'button':
        text = `Button: ${item.label}. ${item.detail || ''}`;
        break;
      case 'input':
        // STOP reading, highlight input, wait for spoken answer
        text = `I need your help here. ${item.detail || `Please tell me your ${item.label}.`}`;
        if (item.inputId) {
          setHighlightedInputId(item.inputId);
          highlightedInputIdRef.current = item.inputId;
          waitingForInputRef.current = true;
          setIsWaitingForInput(true);
          isReadingPageRef.current = false; // STOP queue
        }
        break;
      case 'stat':
      case 'status':
        text = `${item.label}: ${item.detail || ''}`;
        break;
      case 'section':
        text = `${item.label}. ${item.detail || ''}`;
        break;
    }
    speak(text);
  }, [speak]);

  // ── Read current page line by line ──
  const readCurrentPage = useCallback(() => {
    if (!isActiveRef.current) return;
    immediateStop();

    const ctx = appContextRef.current;
    let meta;
    if (!ctx.onboarded && onboardingStepRef.current) {
      meta = getOnboardingMeta(onboardingStepRef.current);
    } else {
      meta = getScreenMeta(ctx.activePatientTab, {
        medications: ctx.medications,
        currentMood: ctx.currentMood,
        stepCount: ctx.stepCount,
        sleepHours: ctx.sleepHours,
      });
    }

    if (!meta || !meta.overview) return;

    readingQueueRef.current = [...meta.items];
    isReadingPageRef.current = true;
    speak(meta.overview, true);
  }, [speak, immediateStop]);

  // ── Build screen context string for AI ──
  const buildScreenContext = useCallback(() => {
    const ctx = appContextRef.current;
    if (!ctx.onboarded) {
      const meta = getOnboardingMeta(onboardingStepRef.current);
      return `Onboarding step: ${onboardingStepRef.current}. ${meta.overview} ${meta.purpose}`;
    }
    const meta = getScreenMeta(ctx.activePatientTab, {
      medications: ctx.medications,
      currentMood: ctx.currentMood,
      stepCount: ctx.stepCount,
      sleepHours: ctx.sleepHours,
    });
    const medInfo = ctx.medications.map(m => `${m.name} ${m.dosage} at ${m.time} (${m.taken ? 'taken' : 'not taken'})`).join('; ');
    const actInfo = ctx.activities.map(a => `${a.time}: ${a.description} (${a.completed ? 'done' : 'pending'})`).join('; ');
    return `${meta.overview} ${meta.purpose} Medications: ${medInfo || 'none'}. Activities: ${actInfo || 'none'}. Mood: ${ctx.currentMood.label}. Steps: ${ctx.stepCount}. Sleep: ${ctx.sleepHours}h.`;
  }, []);

  // ── Call AI assistant for unknown/complex commands ──
  const callAIAssistant = useCallback(async (command: string): Promise<{ reply: string; action: string | null; isRelevant?: boolean }> => {
    try {
      const ctx = appContextRef.current;
      const resp = await fetch(ASSISTANT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          command,
          screen: ctx.onboarded ? ctx.activePatientTab : 'onboarding',
          screenContext: buildScreenContext(),
          patientName: ctx.patientName,
          onboardingStep: onboardingStepRef.current,
        }),
      });
      if (!resp.ok) return { reply: 'I did not catch that. Could you say it again?', action: null };
      return await resp.json();
    } catch {
      return { reply: 'I am having trouble hearing you. Please try again.', action: null };
    }
  }, [buildScreenContext]);

  // ── Execute an AI-suggested action ──
  const executeAction = useCallback((action: string | null) => {
    if (!action) return;
    const ctx = appContextRef.current;

    const navMap: Record<string, PatientTab> = {
      nav_today: 'today',
      nav_memories: 'memories',
      nav_safety: 'safety',
      nav_care: 'care',
      nav_wellbeing: 'wellbeing',
    };

    if (navMap[action]) {
      ctx.setActivePatientTab(navMap[action]);
      return;
    }

    switch (action) {
      case 'take_med': {
        const pending = ctx.medications.filter(m => !m.taken);
        if (pending.length > 0) ctx.markMedicationTaken(pending[0].id);
        break;
      }
      case 'sos':
        ctx.triggerSOS();
        ctx.setActivePatientTab('safety');
        break;
      case 'cancel_sos':
        ctx.cancelSOS();
        break;
      case 'read_page':
        setTimeout(() => readCurrentPage(), 500);
        break;
      case 'mood_happy':
        ctx.setMood({ emoji: '', label: 'Happy', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
        break;
      case 'mood_sad':
        ctx.setMood({ emoji: '', label: 'Sad', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
        break;
      case 'mood_tired':
        ctx.setMood({ emoji: '', label: 'Tired', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
        break;
      case 'mood_anxious':
        ctx.setMood({ emoji: '', label: 'Anxious', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
        break;
      case 'mood_calm':
        ctx.setMood({ emoji: '', label: 'Calm', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
        break;
    }
  }, [readCurrentPage]);

  // ── Intent matcher ──
  const matchesIntent = (cmd: string, patterns: string[]): boolean => {
    return patterns.some(p => cmd.includes(p));
  };

  // ── Handle voice commands — interrupt-first ──
  const handleVoiceCommand = useCallback(async (command: string) => {
    if (processingCommandRef.current) return;
    processingCommandRef.current = true;
    const ctx = appContextRef.current;

    try {
      // ★★★ STOP — highest priority ★★★
      if (matchesIntent(command, ['stop', 'quiet', 'silence', 'shut up', 'be quiet', 'enough', 'mute'])) {
        immediateStop();
        waitingForInputRef.current = false;
        setIsWaitingForInput(false);
        setHighlightedInputId(null);
        highlightedInputIdRef.current = null;

        const utterance = new SpeechSynthesisUtterance('Okay, I will be quiet. Tap the microphone when you need me.');
        utterance.rate = 0.75; utterance.pitch = 0.92; utterance.volume = 0.7;
        const voices = window.speechSynthesis.getVoices();
        const v = voices.find(v => v.name.includes('Samantha')) || voices.find(v => v.lang.startsWith('en'));
        if (v) utterance.voice = v;
        utterance.onend = () => stopVoiceOverFull();
        window.speechSynthesis.speak(utterance);
        return;
      }

      // ★ HOLD / PAUSE
      if (matchesIntent(command, ['hold on', 'wait', 'pause', 'one moment', 'one second', 'just a moment'])) {
        immediateStop();
        waitingForInputRef.current = false;
        setIsWaitingForInput(false);
        isReadingPageRef.current = false;
        setIsOnHold(true);
        isOnHoldRef.current = true;
        speak('Take your time. Say "continue" when you are ready.', true);
        return;
      }

      // ★ RESUME from hold
      if (isOnHoldRef.current && matchesIntent(command, ['continue', 'go on', 'resume', 'carry on', 'okay', 'i am ready', "i'm ready", 'go ahead'])) {
        setIsOnHold(false);
        isOnHoldRef.current = false;
        speak('Welcome back! Let me read this page for you.', true);
        setTimeout(() => readCurrentPage(), 2000);
        return;
      }

      if (isOnHoldRef.current) {
        speak('I am waiting. Say "continue" when you are ready.', true);
        return;
      }

      // ★★ INPUT MODE — capture spoken answer ★★
      if (waitingForInputRef.current && inputCallbackRef.current) {
        if (matchesIntent(command, ['skip', 'next', 'leave it', 'no thanks'])) {
          waitingForInputRef.current = false;
          setIsWaitingForInput(false);
          setHighlightedInputId(null);
          highlightedInputIdRef.current = null;
          speak('Okay, skipping this.');
          if (readingQueueRef.current.length > 0) {
            isReadingPageRef.current = true;
            setTimeout(() => {
              const next = readingQueueRef.current.shift()!;
              processReadItem(next);
            }, 1500);
          }
          return;
        }

        if (matchesIntent(command, ['try again', 'redo', 'again', 'repeat', 'wrong'])) {
          speak('Okay, please say it again clearly.');
          return;
        }

        // Process the spoken input
        const fieldId = highlightedInputIdRef.current;
        const fieldLabel = fieldId === 'onboarding-name' ? 'name' : 'text';

        speak('Let me write that down.');

        let corrected = command;
        try {
          if (fieldLabel === 'name') {
            corrected = await correctName(command);
          } else {
            corrected = await correctInput(command, fieldLabel);
          }
        } catch {
          corrected = command.charAt(0).toUpperCase() + command.slice(1);
        }

        inputCallbackRef.current(corrected);
        waitingForInputRef.current = false;
        setIsWaitingForInput(false);
        setHighlightedInputId(null);
        highlightedInputIdRef.current = null;

        speak(`I wrote "${corrected}". Is that right? Say "continue" to go on, or "try again" to change it.`, true);
        return;
      }

      // ★ TRY AGAIN for name re-entry
      if (matchesIntent(command, ['try again', 'redo']) && onboardingStepRef.current === 'personalize') {
        setHighlightedInputId('onboarding-name');
        highlightedInputIdRef.current = 'onboarding-name';
        waitingForInputRef.current = true;
        setIsWaitingForInput(true);
        speak('Okay, please say your name now.');
        return;
      }

      // ★ YES / CONTINUE in onboarding — fast local handling
      if (matchesIntent(command, ['continue', 'next', 'go on', 'proceed', 'yes', 'correct', "that's right", 'that is right', 'move on'])) {
        if (isReadingPageRef.current) {
          readingQueueRef.current = [];
          isReadingPageRef.current = false;
          speak('What would you like to do?');
          return;
        }
        // During onboarding, "yes/continue" advances
        if (!ctx.onboarded && onboardingStepRef.current) {
          speak('Moving on.');
          return;
        }
        speak('What would you like to do? You can say a screen name, "take my medicine", or "help".');
        return;
      }

      // ★ NO — fast local handling
      if (matchesIntent(command, ['no', 'nope', 'not that', 'wrong'])) {
        if (isReadingPageRef.current) {
          immediateStop();
          readingQueueRef.current = [];
          isReadingPageRef.current = false;
        }
        speak('Okay, no problem. What would you like instead?');
        return;
      }

      // ★ READ page
      if (matchesIntent(command, ['read', 'where am i', 'tell me about', 'what is this', 'describe', 'what page', 'what screen'])) {
        readCurrentPage();
        return;
      }

      // ★ HELP
      if (matchesIntent(command, ['help', 'options', 'what can', 'menu', 'commands'])) {
        speak('I can do many things. Say "go to today" or "go to safety" to navigate. "Take my medicine" to log medication. "Call Sarah" for emergencies. "Tell me my activities" for your daily plan. "Read" to hear about this page. "Hold on" to pause me. Or "stop" to turn me off.');
        return;
      }

      // ★ QUICK NAVIGATION — local pattern match for speed
      const navPatterns: { patterns: string[]; tab: PatientTab; label: string }[] = [
        { patterns: ['today', 'home', 'main', 'dashboard', 'daily'], tab: 'today', label: 'Today' },
        { patterns: ['memories', 'photos', 'pictures', 'gallery', 'album'], tab: 'memories', label: 'Memories' },
        { patterns: ['safety', 'safe', 'emergency', 'location', 'map'], tab: 'safety', label: 'Safety' },
        { patterns: ['care', 'family', 'chat', 'circle', 'caregiver', 'sarah'], tab: 'care', label: 'Care Circle' },
        { patterns: ['wellbeing', 'well being', 'health', 'profile', 'settings', 'mood', 'how i feel'], tab: 'wellbeing', label: 'Wellbeing' },
      ];

      for (const nav of navPatterns) {
        if (nav.patterns.some(p => command.includes(p))) {
          ctx.setActivePatientTab(nav.tab);
          speak(`Taking you to ${nav.label}.`);
          return;
        }
      }

      // ★ QUICK MEDICATION — local
      if (matchesIntent(command, ['take', 'medicine', 'medication', 'med', 'pill', 'drug'])) {
        const pendingMeds = ctx.medications.filter(m => !m.taken);
        if (pendingMeds.length > 0) {
          ctx.markMedicationTaken(pendingMeds[0].id);
          const remaining = pendingMeds.length - 1;
          speak(`Done! I marked ${pendingMeds[0].name} as taken. ${remaining > 0 ? `You still have ${remaining} left.` : 'All done for today!'}`);
          ctx.setActivePatientTab('today');
        } else {
          speak('You have already taken all your medications. Well done!');
        }
        return;
      }

      // ★ EMERGENCY — local
      if (matchesIntent(command, ['call sarah', 'call sara', 'call caregiver', 'call help', 'emergency', 'sos', 'help me'])) {
        speak('Calling Sarah now.');
        ctx.triggerSOS();
        ctx.setActivePatientTab('safety');
        return;
      }
      if (matchesIntent(command, ['cancel call', 'cancel emergency', 'never mind'])) {
        ctx.cancelSOS();
        speak('Emergency cancelled.');
        return;
      }

      // ★★ ANYTHING ELSE → route to AI assistant for smart response ★★
      immediateStop(); // Stop narration while we think
      speak('Let me think about that.');

      const aiResult = await callAIAssistant(command);
      immediateStop(); // Cancel "let me think"
      speak(aiResult.reply, true);
      executeAction(aiResult.action);

      if (aiResult.isRelevant === false) {
        const alertMsg = `Patient said: "${command}" (off-topic on ${ctx.onboarded ? ctx.activePatientTab : 'onboarding'}). AI: ${aiResult.reply}`;
        setCaretakerMessages(prev => [...prev, alertMsg]);
      }
    } finally {
      processingCommandRef.current = false;
    }
  }, [speak, readCurrentPage, immediateStop, processReadItem, callAIAssistant, executeAction]);

  // ── STT — continuous with INTERIM RESULTS for instant interruption ──
  const startListening = useCallback(() => {
    if (!isActiveRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { }
      recognitionRef.current = null;
    }

    shouldRestartListeningRef.current = true;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; // ★ KEY: detect speech early to interrupt TTS
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (shouldRestartListeningRef.current && isActiveRef.current) {
        setTimeout(() => {
          if (shouldRestartListeningRef.current && isActiveRef.current) startListening();
        }, 200);
      }
    };
    recognition.onerror = (e: any) => {
      if (e.error === 'aborted') return;
      setIsListening(false);
      recognitionRef.current = null;
      if (shouldRestartListeningRef.current && isActiveRef.current) {
        setTimeout(() => startListening(), e.error === 'no-speech' ? 300 : 500);
      }
    };
    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      
      // ★★ INTERIM RESULT — user started speaking → IMMEDIATELY stop TTS ★★
      if (!lastResult.isFinal) {
        if (isSpeakingRef.current && !waitingForInputRef.current) {
          // User is trying to interrupt — stop narration immediately
          immediateStop();
        }
        return;
      }

      // ★ FINAL RESULT — process the command
      const transcript = lastResult[0].transcript.toLowerCase().trim();
      if (!transcript) return;
      
      // Always stop current speech when user finishes talking
      immediateStop();
      
      setLastUserSpeech(transcript);
      lastActivityRef.current = Date.now();
      handleVoiceCommand(transcript);
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) {
      console.warn('Recognition start failed:', e);
      recognitionRef.current = null;
    }
  }, [immediateStop, handleVoiceCommand]);

  const readScreen = readCurrentPage;

  const setOnboardingStep = useCallback((step: string) => {
    const prevStep = onboardingStepRef.current;
    onboardingStepRef.current = step;
    if (isActiveRef.current && !isOnHoldRef.current && step !== prevStep) {
      waitingForInputRef.current = false;
      setIsWaitingForInput(false);
      setHighlightedInputId(null);
      highlightedInputIdRef.current = null;
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
    setTimeout(() => startListening(), 300);
  }, [startListening]);

  // Welcome + read page on activation
  useEffect(() => {
    if (!isVoiceOverActive) return;
    const timer = setTimeout(() => {
      if (!isActiveRef.current) return;
      const h = new Date().getHours();
      const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
      const name = appContextRef.current.patientName;
      speak(`${greeting}${name ? ', ' + name : ''}. I am your MemoCare companion. I will read each screen for you and listen to what you say. You can interrupt me anytime by speaking. Say "hold on" to pause, or "stop" to turn me off. Let me tell you about this page.`, true);
      setTimeout(() => readCurrentPage(), 500);
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoiceOverActive]);

  // ── Full stop ──
  const stopVoiceOverFull = useCallback(() => {
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

  const stopVoiceOver = stopVoiceOverFull;

  // ── Idle detection ──
  useEffect(() => {
    if (!isVoiceOverActive) return;
    idleTimerRef.current = setInterval(() => {
      if (!isActiveRef.current || isOnHoldRef.current || isSpeakingRef.current) return;
      const idle = (Date.now() - lastActivityRef.current) / 1000;
      if (idle > 45) {
        const ctx = appContextRef.current;
        const pendingMeds = ctx.medications.filter(m => !m.taken);
        let nudge = 'Are you still there? ';
        if (pendingMeds.length > 0) {
          nudge += `You have ${pendingMeds.length} medication${pendingMeds.length !== 1 ? 's' : ''} waiting.`;
        } else {
          nudge += 'What would you like to do?';
        }
        speak(nudge);
        lastActivityRef.current = Date.now();
      }
    }, 25000);
    return () => { if (idleTimerRef.current) clearInterval(idleTimerRef.current); };
  }, [isVoiceOverActive, speak]);

  // ── Tab change detection — auto-read new page ──
  useEffect(() => {
    if (!isVoiceOverActive) return;
    if (appContext.activePatientTab !== lastScreenRef.current) {
      lastScreenRef.current = appContext.activePatientTab;
      lastActivityRef.current = Date.now();
      waitingForInputRef.current = false;
      setIsWaitingForInput(false);
      setHighlightedInputId(null);
      highlightedInputIdRef.current = null;
      setTimeout(() => readCurrentPage(), 800);
    }
  }, [appContext.activePatientTab, isVoiceOverActive, readCurrentPage]);

  // ── Rapid tap detection ──
  useEffect(() => {
    if (!isVoiceOverActive) return;
    let tapCount = 0;
    let tapTimer: ReturnType<typeof setTimeout> | null = null;
    const handleClick = () => {
      // ★ When user taps, pause current narration to let them interact
      if (isSpeakingRef.current && isReadingPageRef.current) {
        immediateStop();
      }
      lastActivityRef.current = Date.now();
      tapCount++;
      if (tapTimer) clearTimeout(tapTimer);
      tapTimer = setTimeout(() => {
        if (tapCount >= 5) {
          speak('It seems like you need help. Just tell me what you need.');
        }
        tapCount = 0;
      }, 3000);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isVoiceOverActive, speak, immediateStop]);

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
