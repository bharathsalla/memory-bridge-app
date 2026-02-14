import { useState } from 'react';
import { useApp, AppMode } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronRight } from 'lucide-react';

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

  const modeOptions: { mode: AppMode; title: string; desc: string; emoji: string }[] = [
    { mode: 'full', title: 'Very comfortable', desc: 'I use apps and phones regularly', emoji: '📱' },
    { mode: 'simplified', title: 'Somewhat comfortable', desc: 'I prefer simple, larger buttons', emoji: '👆' },
    { mode: 'essential', title: 'I need help', desc: 'A caregiver will set things up for me', emoji: '🤝' },
  ];

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-16 pb-8">
        {steps.map((s, i) => (
          <div key={s} className={`h-2 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-primary' : 'w-2 bg-border'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col px-6"
        >
          {step === 'welcome' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
                className="w-28 h-28 rounded-[28px] bg-primary/10 flex items-center justify-center mb-8"
              >
                <Heart className="w-14 h-14 text-primary" fill="currentColor" />
              </motion.div>
              <h1 className="text-ios-title text-foreground mb-3">Welcome to MemoCare</h1>
              <p className="text-ios-body text-muted-foreground max-w-[280px]">
                Supporting you every step of the way
              </p>
              <div className="mt-auto mb-8 w-full">
                <button onClick={next} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground text-ios-headline active:scale-[0.98] transition-transform">
                  Get Started
                </button>
                <button onClick={() => { setSelectedMode('full'); setStep('personalize'); }}
                  className="w-full mt-3 text-primary text-ios-body">
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
                {modeOptions.map(opt => (
                  <button
                    key={opt.mode}
                    onClick={() => { setSelectedMode(opt.mode); next(); }}
                    className={`ios-card-elevated p-5 text-left flex items-center gap-4 active:scale-[0.98] transition-all ${
                      selectedMode === opt.mode ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <div className="flex-1">
                      <div className="text-ios-headline text-foreground">{opt.title}</div>
                      <div className="text-ios-subheadline text-muted-foreground mt-0.5">{opt.desc}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'personalize' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-ios-title1 text-foreground mb-2">What should we call you?</h1>
              <p className="text-ios-body text-muted-foreground mb-8">We'll use this to personalize your experience.</p>
              <div className="ios-card-elevated p-1">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full h-12 px-4 bg-transparent text-ios-body text-foreground placeholder:text-muted-foreground outline-none"
                  autoFocus
                />
              </div>
              <div className="mt-auto mb-8">
                <button onClick={next} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground text-ios-headline active:scale-[0.98] transition-transform">
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
                className="w-24 h-24 rounded-full bg-success/15 flex items-center justify-center mb-6"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-5xl"
                >
                  ✓
                </motion.span>
              </motion.div>
              <h1 className="text-ios-title1 text-foreground mb-2">You're all set{name ? `, ${name}` : ''}!</h1>
              <p className="text-ios-body text-muted-foreground max-w-[280px]">
                MemoCare is ready to help you every day.
              </p>
              <div className="mt-auto mb-8 w-full">
                <button onClick={finish} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground text-ios-headline active:scale-[0.98] transition-transform">
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
