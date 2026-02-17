import { useVoiceOver } from '@/contexts/VoiceOverContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, X, Pause, Keyboard } from 'lucide-react';

export default function VoiceOverIndicator() {
  const { isVoiceOverActive, isListening, isSpeaking, isOnHold, isWaitingForInput, lastUserSpeech, stopVoiceOver, startVoiceOver } = useVoiceOver();

  // Floating activation button when voice over is OFF — placed at bottom
  if (!isVoiceOverActive) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={startVoiceOver}
        className="absolute bottom-16 left-4 z-50 w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mx-[310px] my-[30px] text-base"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
        aria-label="Activate voice over">

        <Mic className="w-5 h-5" />
      </motion.button>);

  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="absolute bottom-14 left-0 right-0 z-50 px-3 pb-1"
        style={{ pointerEvents: 'none' }}>

        <div
          className={`ios-card-elevated rounded-2xl p-3 flex items-center gap-3 ${
          isOnHold ? 'ring-2 ring-orange-400' : isWaitingForInput ? 'ring-2 ring-secondary' : ''}`
          }
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)', pointerEvents: 'auto' }}>

          {/* Status indicator */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isOnHold ? 'bg-orange-500/15' :
          isWaitingForInput ? 'bg-secondary/15' :
          isSpeaking ? 'bg-primary/15' :
          isListening ? 'bg-success/15' : 'bg-muted'}`
          }>
            {isOnHold ?
            <Pause className="w-5 h-5 text-orange-500" /> :
            isWaitingForInput ?
            <Keyboard className="w-5 h-5 text-secondary animate-pulse" /> :
            isSpeaking ?
            <Volume2 className="w-5 h-5 text-primary animate-pulse" /> :
            isListening ?
            <Mic className="w-5 h-5 text-success listening-pulse" /> :

            <MicOff className="w-5 h-5 text-muted-foreground" />
            }
          </div>

          {/* Status text */}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-foreground">
              {isOnHold ? 'On Hold — say "continue"' :
              isWaitingForInput ? '🎤 Speak now...' :
              isSpeaking ? 'Speaking...' :
              isListening ? 'Listening...' : 'Voice Over Active'}
            </div>
            {isWaitingForInput &&
            <div className="text-[11px] text-secondary mt-0.5">
                I am waiting for your answer
              </div>
            }
            {isOnHold &&
            <div className="text-[11px] text-orange-600 mt-0.5">
                Say "continue" to resume
              </div>
            }
            {lastUserSpeech && !isSpeaking && !isOnHold && !isWaitingForInput &&
            <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                You said: "{lastUserSpeech}"
              </div>
            }
            {isSpeaking && !isOnHold &&
            <div className="flex gap-1 mt-1">
                {[0, 1, 2, 3, 4].map((i) =>
              <motion.div
                key={i}
                animate={{ height: [3, 10, 3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                className="w-1 rounded-full bg-primary" />

              )}
              </div>
            }
          </div>

          {/* Stop button */}
          <button
            onClick={stopVoiceOver}
            className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 touch-target"
            aria-label="Stop voice over">

            <X className="w-4 h-4 text-destructive" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>);

}