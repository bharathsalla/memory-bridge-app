import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Volume2, Bell } from 'lucide-react';
import { useApp, VoiceReminder } from '@/contexts/AppContext';

export default function PatientReminderPopup() {
  const { voiceReminders, acknowledgeVoiceReminder, snoozeVoiceReminder, patientName } = useApp();
  const [speaking, setSpeaking] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<VoiceReminder | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Find an active reminder to show (including snoozed ones whose time has passed)
  useEffect(() => {
    const active = voiceReminders.find(r => {
      if (r.status === 'active') return true;
      if (r.status === 'snoozed' && r.snoozedUntil) {
        return new Date(r.snoozedUntil) <= new Date();
      }
      return false;
    });
    setCurrentReminder(active || null);
  }, [voiceReminders]);

  // Auto-speak the patient message when popup appears
  useEffect(() => {
    if (currentReminder && 'speechSynthesis' in window) {
      const timer = setTimeout(() => {
        speakMessage(currentReminder.patientMessage);
      }, 1000);
      return () => {
        clearTimeout(timer);
        window.speechSynthesis.cancel();
      };
    }
  }, [currentReminder?.id]);

  const speakMessage = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.75;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    // Try to use a female voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen'));
    if (femaleVoice) utterance.voice = femaleVoice;
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleTookIt = () => {
    if (currentReminder) {
      window.speechSynthesis.cancel();
      acknowledgeVoiceReminder(currentReminder.id);
    }
  };

  const handleSnooze = () => {
    if (currentReminder) {
      window.speechSynthesis.cancel();
      snoozeVoiceReminder(currentReminder.id, 10);
    }
  };

  const displayName = patientName || 'Raghavan';
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  if (!currentReminder) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.85, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85, y: 40 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative z-10 w-[92%] max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Top gradient */}
          <div className="bg-gradient-to-br from-primary/15 via-accent/10 to-background px-6 pt-8 pb-6">
            {/* Pulsing bell */}
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center"
              >
                <Bell className="w-8 h-8 text-primary" />
              </motion.div>
            </div>

            {/* Greeting - BIG TEXT */}
            <h1 className="text-[28px] font-extrabold text-foreground text-center leading-tight">
              {greeting} {displayName} ☀
            </h1>
            <p className="text-[20px] font-bold text-muted-foreground text-center mt-2">
              🕘 It is {timeStr}
            </p>
          </div>

          {/* Message section */}
          <div className="px-6 py-5">
            {/* Playing indicator */}
            <motion.div
              animate={speaking ? { opacity: [0.7, 1, 0.7] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-primary/8 mb-4"
            >
              <Volume2 className={`w-5 h-5 text-primary ${speaking ? 'animate-pulse' : ''}`} />
              <span className="text-[15px] font-bold text-primary">
                {speaking ? 'Playing message from ' + currentReminder.caregiverName + '...' : 'Message from ' + currentReminder.caregiverName}
              </span>
            </motion.div>

            {/* The message */}
            <div className="bg-muted/40 rounded-2xl p-4 mb-5">
              <p className="text-[18px] font-bold text-foreground text-center leading-relaxed italic">
                "{currentReminder.patientMessage}"
              </p>
            </div>

            {/* Medication info */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <span className="text-[22px]">💊</span>
              <span className="text-[16px] font-extrabold text-foreground">{currentReminder.medication}</span>
              <span className="text-[14px] text-muted-foreground">· {currentReminder.time}</span>
            </div>

            {/* Action buttons - BIG */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleTookIt}
                className="py-5 rounded-2xl bg-success text-success-foreground font-extrabold text-[18px] flex items-center justify-center gap-2 shadow-lg active:shadow-sm transition-shadow"
              >
                <Check className="w-6 h-6" />
                I Took It
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleSnooze}
                className="py-5 rounded-2xl bg-warning text-warning-foreground font-extrabold text-[18px] flex items-center justify-center gap-2 shadow-lg active:shadow-sm transition-shadow"
              >
                <Clock className="w-6 h-6" />
                10 Min
              </motion.button>
            </div>

            {/* Replay button */}
            <button
              onClick={() => speakMessage(currentReminder.patientMessage)}
              className="w-full mt-3 py-3 rounded-xl bg-muted text-muted-foreground font-bold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Volume2 className="w-4 h-4" />
              Replay Message
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
