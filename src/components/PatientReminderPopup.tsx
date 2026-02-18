import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Volume2, Bell, AlertTriangle } from 'lucide-react';
import { useApp, VoiceReminder } from '@/contexts/AppContext';

const REPLAY_INTERVAL = 30000; // Replay voice every 30 seconds
const ESCALATION_THRESHOLD = 3; // After 3 replays, mark as escalated

export default function PatientReminderPopup() {
  const { voiceReminders, acknowledgeVoiceReminder, snoozeVoiceReminder, patientName, isCaregiverView } = useApp();
  const [playing, setPlaying] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<VoiceReminder | null>(null);
  const [replayCount, setReplayCount] = useState(0);
  const [timeWaiting, setTimeWaiting] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const replayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Find active reminder
  useEffect(() => {
    const active = voiceReminders.find(r => {
      if (r.status === 'active') return true;
      if (r.status === 'snoozed' && r.snoozedUntil) {
        return new Date(r.snoozedUntil) <= new Date();
      }
      return false;
    });
    if (active?.id !== currentReminder?.id) {
      setReplayCount(0);
      setTimeWaiting(0);
    }
    setCurrentReminder(active || null);
  }, [voiceReminders]);

  // Check snoozed reminders periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const snoozed = voiceReminders.find(r =>
        r.status === 'snoozed' && r.snoozedUntil && new Date(r.snoozedUntil) <= new Date()
      );
      if (snoozed) {
        setCurrentReminder(snoozed);
        setReplayCount(0);
        setTimeWaiting(0);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [voiceReminders]);

  // Auto-play on mount + set up auto-replay loop
  useEffect(() => {
    if (currentReminder && !isCaregiverView) {
      // Initial play after 1s
      const initTimer = setTimeout(() => playAudio(), 1000);

      // Auto-replay loop
      replayTimerRef.current = setInterval(() => {
        if (!playing) {
          setReplayCount(c => c + 1);
          playAudio();
        }
      }, REPLAY_INTERVAL);

      // Waiting time counter
      waitTimerRef.current = setInterval(() => {
        setTimeWaiting(t => t + 1);
      }, 1000);

      return () => {
        clearTimeout(initTimer);
        if (replayTimerRef.current) clearInterval(replayTimerRef.current);
        if (waitTimerRef.current) clearInterval(waitTimerRef.current);
        stopAudio();
      };
    }
  }, [currentReminder?.id, isCaregiverView]);

  const playAudio = useCallback(() => {
    if (!currentReminder?.audioUrl) return;
    stopAudio();
    const audio = new Audio(currentReminder.audioUrl);
    audio.onplay = () => setPlaying(true);
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
    audioRef.current = audio;
    audio.play().catch(() => setPlaying(false));
  }, [currentReminder?.audioUrl]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(false);
  };

  const handleTookIt = () => {
    if (currentReminder) {
      stopAudio();
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
      if (waitTimerRef.current) clearInterval(waitTimerRef.current);
      acknowledgeVoiceReminder(currentReminder.id);
      setCurrentReminder(null);
    }
  };

  const handleSnooze = () => {
    if (currentReminder) {
      stopAudio();
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
      if (waitTimerRef.current) clearInterval(waitTimerRef.current);
      snoozeVoiceReminder(currentReminder.id, 10);
      setCurrentReminder(null);
    }
  };

  const displayName = patientName || 'Raghavan';
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const isEscalated = replayCount >= ESCALATION_THRESHOLD;
  const formatWait = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!currentReminder || isCaregiverView) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[100] flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

        <motion.div
          initial={{ scale: 0.85, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85, y: 40 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative z-10 w-[92%] bg-card rounded-3xl shadow-2xl overflow-hidden max-h-[88%] overflow-y-auto"
        >
          {/* Escalation warning banner */}
          {isEscalated && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className="bg-destructive text-destructive-foreground px-4 py-2.5 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-[12px] font-bold">⚠ No response for {formatWait(timeWaiting)} — Caregiver has been alerted</span>
            </motion.div>
          )}

          {/* Top gradient */}
          <div className="bg-gradient-to-br from-primary/15 via-accent/10 to-background px-5 pt-5 pb-4">
            <div className="flex justify-center mb-2.5">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`w-14 h-14 rounded-full flex items-center justify-center ${isEscalated ? 'bg-destructive/20' : 'bg-primary/15'}`}
              >
                <Bell className={`w-7 h-7 ${isEscalated ? 'text-destructive' : 'text-primary'}`} />
              </motion.div>
            </div>
            <h1 className="text-[22px] font-extrabold text-foreground text-center leading-tight">
              {greeting} {displayName} ☀
            </h1>
            <p className="text-[16px] font-bold text-muted-foreground text-center mt-1">
              🕘 It is {timeStr}
            </p>
          </div>

          <div className="px-5 py-3.5">
            {/* Playing indicator with live waveform */}
            <motion.div
              animate={playing ? { opacity: [0.7, 1, 0.7] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center justify-center gap-2.5 py-2.5 rounded-2xl bg-primary/8 mb-2.5"
            >
              <Volume2 className={`w-5 h-5 text-primary ${playing ? 'animate-pulse' : ''}`} />
              <span className="text-[13px] font-bold text-primary">
                {playing ? '🔊 Playing voice from ' + currentReminder.caregiverName + '...' : 'Voice from ' + currentReminder.caregiverName}
              </span>
            </motion.div>

            {/* Waveform */}
            {playing && (
              <div className="flex items-center justify-center gap-[3px] h-7 mb-2.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-primary"
                    animate={{ height: [5, 10 + Math.random() * 14, 5] }}
                    transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, repeatType: 'reverse', delay: i * 0.04 }}
                  />
                ))}
              </div>
            )}

            {/* Replay counter */}
            <div className="flex items-center justify-center gap-3 mb-2.5">
              <span className="text-[11px] font-bold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
                🔁 Replay #{replayCount + 1}
              </span>
              <span className="text-[11px] font-bold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
                ⏱ Waiting {formatWait(timeWaiting)}
              </span>
            </div>

            {/* Message */}
            <div className="bg-muted/40 rounded-2xl p-3 mb-3">
              <p className="text-[15px] font-bold text-foreground text-center leading-relaxed italic">
                "{currentReminder.patientMessage}"
              </p>
            </div>

            {/* Medication info */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-[20px]">💊</span>
              <span className="text-[15px] font-extrabold text-foreground">{currentReminder.medication}</span>
              <span className="text-[13px] text-muted-foreground">· {currentReminder.time}</span>
            </div>

            {/* BIG Action buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleTookIt}
                className="py-4 rounded-2xl bg-success text-success-foreground font-extrabold text-[16px] flex items-center justify-center gap-2 shadow-lg"
              >
                <Check className="w-5 h-5" />
                ✅ I Took It
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleSnooze}
                className="py-4 rounded-2xl bg-warning text-warning-foreground font-extrabold text-[16px] flex items-center justify-center gap-2 shadow-lg"
              >
                <Clock className="w-5 h-5" />
                ⏰ 10 Min
              </motion.button>
            </div>

            {/* Replay button */}
            <button
              onClick={playAudio}
              className="w-full mt-2 py-2.5 rounded-xl bg-muted text-muted-foreground font-bold text-[12px] flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Replay Voice Message
            </button>

            {/* Persistent notice */}
            <p className="text-[10px] text-muted-foreground/60 text-center mt-2 italic">
              This reminder will keep playing until you take your medicine
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}