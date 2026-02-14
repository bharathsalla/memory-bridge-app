import { useVoiceOver } from '@/contexts/VoiceOverContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, X } from 'lucide-react';

export default function VoiceOverIndicator() {
  const { isVoiceOverActive, isListening, isSpeaking, lastUserSpeech, stopVoiceOver, startVoiceOver } = useVoiceOver();

  // Floating activation button when voice over is OFF
  if (!isVoiceOverActive) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={startVoiceOver}
        className="absolute top-2 right-2 z-50 w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
        aria-label="Activate voice over"
      >
        <Mic className="w-5 h-5" />
      </motion.button>
    );
  }

  // Active voice over indicator
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        className="absolute top-0 left-0 right-0 z-50 px-3 pt-1 pb-2"
      >
        <div className="ios-card-elevated rounded-2xl p-3 flex items-center gap-3" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
          {/* Status indicator */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isSpeaking ? 'bg-secondary/15' : isListening ? 'bg-success/15' : 'bg-muted'
          }`}>
            {isSpeaking ? (
              <Volume2 className="w-5 h-5 text-secondary animate-pulse" />
            ) : isListening ? (
              <Mic className="w-5 h-5 text-success listening-pulse" />
            ) : (
              <MicOff className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Status text */}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-foreground">
              {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Voice Over Active'}
            </div>
            {lastUserSpeech && !isSpeaking && (
              <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                You said: "{lastUserSpeech}"
              </div>
            )}
            {isSpeaking && (
              <div className="flex gap-1 mt-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: [3, 12, 3] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 rounded-full bg-secondary"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stop button */}
          <button
            onClick={stopVoiceOver}
            className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 touch-target"
            aria-label="Stop voice over"
          >
            <X className="w-4 h-4 text-destructive" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
