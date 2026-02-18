import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Volume2, Bell } from 'lucide-react';
import { useApp, VoiceReminder } from '@/contexts/AppContext';

export default function PatientReminderPopup() {
  const { voiceReminders, acknowledgeVoiceReminder, snoozeVoiceReminder, patientName } = useApp();
  const [playing, setPlaying] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<VoiceReminder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Auto-play the caregiver's actual voice recording
  useEffect(() => {
    if (currentReminder?.audioUrl) {
      const timer = setTimeout(() => playAudio(), 1000);
      return () => {
        clearTimeout(timer);
        stopAudio();
      };
    }
  }, [currentReminder?.id]);

  const playAudio = () => {
    if (!currentReminder?.audioUrl) return;
    stopAudio();
    const audio = new Audio(currentReminder.audioUrl);
    audio.onplay = () => setPlaying(true);
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
    audioRef.current = audio;
    audio.play().catch(() => setPlaying(false));
  };

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
      acknowledgeVoiceReminder(currentReminder.id);
    }
  };

  const handleSnooze = () => {
    if (currentReminder) {
      stopAudio();
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
        className="absolute inset-0 z-[100] flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ scale: 0.85, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85, y: 40 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative z-10 w-[92%] bg-card rounded-3xl shadow-2xl overflow-hidden max-h-[85%] overflow-y-auto"
        >
          {/* Top gradient */}
          <div className="bg-gradient-to-br from-primary/15 via-accent/10 to-background px-5 pt-6 pb-5">
            <div className="flex justify-center mb-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center"
              >
                <Bell className="w-7 h-7 text-primary" />
              </motion.div>
            </div>
            <h1 className="text-[24px] font-extrabold text-foreground text-center leading-tight">
              {greeting} {displayName} ☀
            </h1>
            <p className="text-[17px] font-bold text-muted-foreground text-center mt-1.5">
              🕘 It is {timeStr}
            </p>
          </div>

          <div className="px-5 py-4">
            {/* Playing indicator */}
            <motion.div
              animate={playing ? { opacity: [0.7, 1, 0.7] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-primary/8 mb-3"
            >
              <Volume2 className={`w-5 h-5 text-primary ${playing ? 'animate-pulse' : ''}`} />
              <span className="text-[14px] font-bold text-primary">
                {playing ? '🔊 Playing voice from ' + currentReminder.caregiverName + '...' : 'Voice message from ' + currentReminder.caregiverName}
              </span>
            </motion.div>

            {/* Audio waveform visualization */}
            {playing && (
              <div className="flex items-center justify-center gap-[3px] h-8 mb-3">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-primary"
                    animate={{ height: [6, 12 + Math.random() * 16, 6] }}
                    transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, repeatType: 'reverse', delay: i * 0.04 }}
                  />
                ))}
              </div>
            )}

            <div className="bg-muted/40 rounded-2xl p-3.5 mb-4">
              <p className="text-[16px] font-bold text-foreground text-center leading-relaxed italic">
                "{currentReminder.patientMessage}"
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-[20px]">💊</span>
              <span className="text-[15px] font-extrabold text-foreground">{currentReminder.medication}</span>
              <span className="text-[13px] text-muted-foreground">· {currentReminder.time}</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleTookIt}
                className="py-4 rounded-2xl bg-success text-success-foreground font-extrabold text-[16px] flex items-center justify-center gap-2 shadow-lg"
              >
                <Check className="w-5 h-5" />
                I Took It
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleSnooze}
                className="py-4 rounded-2xl bg-warning text-warning-foreground font-extrabold text-[16px] flex items-center justify-center gap-2 shadow-lg"
              >
                <Clock className="w-5 h-5" />
                10 Min
              </motion.button>
            </div>

            <button
              onClick={playAudio}
              className="w-full mt-2.5 py-2.5 rounded-xl bg-muted text-muted-foreground font-bold text-[13px] flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Volume2 className="w-4 h-4" />
              Replay Voice Message
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
