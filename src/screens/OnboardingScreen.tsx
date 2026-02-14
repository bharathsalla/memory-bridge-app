import { useState } from 'react';
import { useApp, AppMode } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Smartphone, Hand, Users } from 'lucide-react';

const steps = ['welcome', 'assess', 'personalize', 'complete'] as const;

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState<typeof steps[number]>('welcome');
  const [name, setName] = useState('');
  const [selectedMode, setSelectedMode] = useState<AppMode>('full');

  const next = () => {
    const i = steps.indexOf(step);
    if (i < steps.length - 1) setStep(steps[i + 1]);
  };

  const finish = () => {
    completeOnboarding(name || 'Friend', selectedMode);
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
                      onClick={() => { setSelectedMode(opt.mode); next(); }}
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
                  onClick={next}
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
              <div className="mt-auto mb-8 w-full">
                <button
                  onClick={finish}
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-[17px] font-semibold active:scale-[0.98] transition-transform shadow-sm"
                >
                  Start Using MemoCare
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
