import { useState } from 'react';
import { useApp, AppMode } from '@/contexts/AppContext';
import { useVoiceOver } from '@/contexts/VoiceOverContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Smartphone, Hand, Users, Mic, Monitor } from 'lucide-react';

const steps = ['welcome', 'voiceChoice', 'assess', 'personalize', 'complete'] as const;

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const { startVoiceOver } = useVoiceOver();
  const [step, setStep] = useState<typeof steps[number]>('welcome');
  const [name, setName] = useState('');
  const [selectedMode, setSelectedMode] = useState<AppMode>('full');

  const next = () => {
    const i = steps.indexOf(step);
    if (i < steps.length - 1) setStep(steps[i + 1]);
  };

  const finish = (withVoice: boolean = false) => {
    completeOnboarding(name || 'Friend', selectedMode);
    if (withVoice) {
      setTimeout(() => startVoiceOver(), 800);
    }
  };

  const modeOptions: { mode: AppMode; title: string; desc: string; icon: typeof Smartphone }[] = [
    { mode: 'full', title: 'Very comfortable', desc: 'I use apps and phones regularly', icon: Smartphone },
    { mode: 'simplified', title: 'Somewhat comfortable', desc: 'I prefer simple, larger buttons', icon: Hand },
    { mode: 'essential', title: 'I need help', desc: 'A caregiver will set things up for me', icon: Users },
  ];

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-2.5 pt-16 pb-8">
        {steps.map((s) => (
          <div
            key={s}
            className={`h-[6px] rounded-full transition-all duration-500 ${
              s === step ? 'w-10 bg-primary' : steps.indexOf(s) < steps.indexOf(step) ? 'w-[6px] bg-primary/40' : 'w-[6px] bg-border'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col px-7"
        >
          {step === 'welcome' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
                className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-10"
              >
                <Heart className="w-16 h-16 text-primary" fill="currentColor" />
              </motion.div>
              <h1 className="text-ios-title text-foreground mb-4">Welcome to MemoCare</h1>
              <p className="text-ios-body text-muted-foreground max-w-[280px] leading-relaxed">
                Supporting you every step of the way, with care and kindness.
              </p>
              <div className="mt-auto mb-8 w-full space-y-3">
                <button
                  onClick={next}
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-[17px] font-semibold active:scale-[0.98] transition-transform shadow-sm"
                >
                  Get Started
                </button>
                <button
                  onClick={() => { setSelectedMode('full'); setStep('personalize'); }}
                  className="w-full h-12 text-primary text-[16px] font-medium"
                >
                  I'm a caregiver
                </button>
              </div>
            </div>
          )}

          {step === 'voiceChoice' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', bounce: 0.4 }}
                className="w-28 h-28 rounded-[28px] bg-gradient-to-br from-secondary/15 to-secondary/5 flex items-center justify-center mb-8"
              >
                <Mic className="w-14 h-14 text-secondary" />
              </motion.div>
              <h1 className="text-ios-title1 text-foreground mb-3">How would you like to use MemoCare?</h1>
              <p className="text-ios-body text-muted-foreground max-w-[280px] leading-relaxed mb-10">
                Choose your preferred way to interact with the app.
              </p>

              <div className="w-full space-y-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={next}
                  className="w-full ios-card-elevated p-5 flex items-center gap-4 text-left touch-target-xl rounded-2xl ring-2 ring-secondary/30"
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <Mic className="w-7 h-7 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[18px] font-bold text-foreground">Use Voice Over</div>
                    <div className="text-[14px] text-muted-foreground mt-1">I'll guide you with voice. Just speak to navigate, take medicine, and more.</div>
                  </div>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={next}
                  className="w-full ios-card-elevated p-5 flex items-center gap-4 text-left touch-target-xl rounded-2xl"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Monitor className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[18px] font-bold text-foreground">Browse Mode</div>
                    <div className="text-[14px] text-muted-foreground mt-1">Use the app by tapping and swiping. You can enable voice later.</div>
                  </div>
                </motion.button>
              </div>
            </div>
          )}

          {step === 'assess' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-ios-title1 text-foreground mb-2">How comfortable are you with technology?</h1>
              <p className="text-ios-body text-muted-foreground mb-8">This helps us set up the best experience for you.</p>
              <div className="flex flex-col gap-3">
                {modeOptions.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.mode}
                      onClick={() => { setSelectedMode(opt.mode); setStep('personalize'); }}
                      className={`ios-card-elevated p-5 text-left flex items-center gap-4 active:scale-[0.98] transition-all touch-target ${
                        selectedMode === opt.mode ? 'ring-2 ring-primary bg-primary/[0.03]' : ''
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-ios-headline text-foreground">{opt.title}</div>
                        <div className="text-ios-subheadline text-muted-foreground mt-0.5">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'personalize' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-ios-title1 text-foreground mb-2">What should we call you?</h1>
              <p className="text-ios-body text-muted-foreground mb-8">We'll use this to personalize your experience.</p>
              <div className="ios-card-elevated rounded-2xl overflow-hidden">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full h-14 px-5 bg-transparent text-ios-body text-foreground placeholder:text-muted-foreground/60 outline-none"
                  autoFocus
                />
              </div>
              <div className="mt-auto mb-8">
                <button
                  onClick={() => setStep('complete')}
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-[17px] font-semibold active:scale-[0.98] transition-transform shadow-sm"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-28 h-28 rounded-full bg-success/10 flex items-center justify-center mb-8"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-success text-5xl font-bold"
                >
                  ✓
                </motion.div>
              </motion.div>
              <h1 className="text-ios-title1 text-foreground mb-3">You're all set{name ? `, ${name}` : ''}!</h1>
              <p className="text-ios-body text-muted-foreground max-w-[280px]">
                MemoCare is ready to help you every day.
              </p>
              <div className="mt-auto mb-8 w-full space-y-3">
                <button
                  onClick={() => finish(true)}
                  className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground text-[17px] font-semibold active:scale-[0.98] transition-transform shadow-sm flex items-center justify-center gap-3"
                >
                  <Mic className="w-5 h-5" />
                  Start with Voice Over
                </button>
                <button
                  onClick={() => finish(false)}
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-[17px] font-semibold active:scale-[0.98] transition-transform shadow-sm"
                >
                  Start Browsing
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
