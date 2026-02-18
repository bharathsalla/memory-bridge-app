import { useVoiceOver } from '@/contexts/VoiceOverContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, X, Pause, Keyboard } from 'lucide-react';

export default function VoiceOverIndicator() {
  const { isVoiceOverActive, isListening, isSpeaking, isOnHold, isWaitingForInput, lastUserSpeech, stopVoiceOver, startVoiceOver } = useVoiceOver();

  // Compact inline activation when voice over is OFF
  if (!isVoiceOverActive) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={startVoiceOver}
        className="absolute bottom-16 right-4 z-50 w-11 h-11 rounded-xl bg-card flex items-center justify-center border border-border/40"
        aria-label="Activate voice over"
      >
        <Mic className="w-5 h-5 text-muted-foreground" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="absolute bottom-14 left-0 right-0 z-50 px-3 pb-1"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="ios-card rounded-2xl p-2.5 flex items-center gap-2.5 border border-border/40"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Status indicator */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isOnHold ? 'bg-muted' :
            isWaitingForInput ? 'bg-muted' :
            isSpeaking ? 'bg-muted' :
            isListening ? 'bg-muted' : 'bg-muted'
          }`}>
            {isOnHold ?
              <Pause className="w-5 h-5 text-muted-foreground" /> :
            isWaitingForInput ?
              <Keyboard className="w-5 h-5 text-muted-foreground animate-pulse" /> :
            isSpeaking ?
              <Volume2 className="w-5 h-5 text-muted-foreground animate-pulse" /> :
            isListening ?
              <Mic className="w-5 h-5 text-primary" /> :
              <MicOff className="w-5 h-5 text-muted-foreground" />
            }
          </div>

          {/* Status text */}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-foreground">
              {isOnHold ? 'On Hold — say "continue"' :
              isWaitingForInput ? 'Speak now...' :
              isSpeaking ? 'Speaking...' :
              isListening ? 'Listening...' : 'Voice Over Active'}
            </div>
            {isWaitingForInput && (
              <div className="text-[11px] text-muted-foreground mt-0.5">Waiting for your answer</div>
            )}
            {isOnHold && (
              <div className="text-[11px] text-muted-foreground mt-0.5">Say "continue" to resume</div>
            )}
            {lastUserSpeech && !isSpeaking && !isOnHold && !isWaitingForInput && (
              <div className="text-[11px] text-muted-foreground truncate mt-0.5">You said: "{lastUserSpeech}"</div>
            )}
            {isSpeaking && !isOnHold && (
              <div className="flex gap-0.5 mt-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [3, 10, 3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                    className="w-0.5 rounded-full bg-muted-foreground"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stop button */}
          <button
            onClick={stopVoiceOver}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 touch-target"
            aria-label="Stop voice over"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
