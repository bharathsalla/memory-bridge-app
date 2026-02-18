import { useState, useEffect, useCallback } from 'react';
import { useApp, AppMode } from '@/contexts/AppContext';
import { useVoiceOver } from '@/contexts/VoiceOverContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Hand, Users, Mic, Monitor } from 'lucide-react';

const steps = ['welcome', 'voiceChoice', 'assess', 'personalize', 'complete'] as const;

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const { startVoiceOver, setOnboardingStep, setInputCallback, isVoiceOverActive, highlightedInputId } = useVoiceOver();
  const [step, setStep] = useState<typeof steps[number]>('welcome');
  const [name, setName] = useState('');
  const [selectedMode, setSelectedMode] = useState<AppMode>('full');
  const [voiceSelected, setVoiceSelected] = useState(false);

  useEffect(() => { setOnboardingStep(step); }, [step, setOnboardingStep]);

  useEffect(() => {
    if (step === 'personalize') {
      setInputCallback((value: string) => { setName(value); });
    } else {
      setInputCallback(null);
    }
    return () => setInputCallback(null);
  }, [step, setInputCallback]);

  const next = useCallback(() => {
    setStep((prev) => {
      const i = steps.indexOf(prev);
      return i < steps.length - 1 ? steps[i + 1] : prev;
    });
  }, []);

  const handleVoiceChoice = useCallback(() => {
    setVoiceSelected(true);
    next();
    setTimeout(() => startVoiceOver(), 400);
  }, [startVoiceOver]);

  const finish = (withVoice: boolean = false) => {
    completeOnboarding(name || 'Friend', selectedMode);
    if (withVoice && !isVoiceOverActive) {
      setTimeout(() => startVoiceOver(), 800);
    }
  };

  const modeOptions: {mode: AppMode; title: string; desc: string; icon: typeof Smartphone;}[] = [
    { mode: 'full', title: 'Very comfortable', desc: 'I use apps and phones regularly', icon: Smartphone },
    { mode: 'simplified', title: 'Somewhat comfortable', desc: 'I prefer simple, larger buttons', icon: Hand },
    { mode: 'essential', title: 'I need help', desc: 'A caregiver will set things up for me', icon: Users },
  ];

  const isHighlighted = (id: string) => highlightedInputId === id;

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden relative">
      {/* Decorative bg */}
      <div className="absolute inset-0 warm-glow opacity-60" />
      <div className="absolute bottom-0 right-0 w-64 h-64 rose-glow opacity-40" />

      {/* Progress dots */}
      <div className="flex justify-center gap-2.5 pt-14 pb-6 relative z-10">
        {steps.map((s) => (
          <div key={s} className={`h-[5px] rounded-full transition-all duration-500 ${
            s === step ? 'w-10 gradient-primary' : steps.indexOf(s) < steps.indexOf(step) ? 'w-[5px] bg-primary/40' : 'w-[5px] bg-border'
          }`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col px-7 relative z-10">

          {step === 'welcome' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
                className="w-32 h-32 overflow-hidden mb-8 rounded-3xl shadow-lg ring-4 ring-primary/10">
                <img alt="MemoCare" className="w-full h-full object-cover" src="/lovable-uploads/e870b19c-fc1d-486f-815f-86f58cef95ed.png" />
              </motion.div>
              <h1 className="text-ios-title text-foreground mb-3">Welcome to<br />MemoCare</h1>
              <p className="text-ios-body text-muted-foreground max-w-[280px] leading-relaxed">
                Supporting you every step of the way, with care and kindness.
              </p>
              <div className="mt-auto mb-8 w-full space-y-3">
                <button onClick={next} className="w-full h-14 gradient-primary text-primary-foreground text-[17px] font-bold active:scale-[0.98] transition-transform rounded-2xl shadow-lg">
                  Get Started
                </button>
                <button onClick={() => { setSelectedMode('full'); setStep('personalize'); }} className="w-full h-12 text-primary text-[16px] font-semibold rounded-2xl">
                  I'm a caregiver
                </button>
              </div>
            </div>
          )}

          {step === 'voiceChoice' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', bounce: 0.4 }}
                className="w-24 h-24 gradient-rose rounded-3xl flex items-center justify-center mb-8 shadow-lg">
                <Mic className="w-12 h-12 text-secondary-foreground" />
              </motion.div>
              <h1 className="text-ios-title1 text-foreground mb-3">How would you like to use MemoCare?</h1>
              <p className="text-ios-body text-muted-foreground max-w-[280px] leading-relaxed mb-8">
                Choose your preferred way to interact.
              </p>
              <div className="w-full space-y-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleVoiceChoice}
                  className="w-full ios-card-elevated p-5 flex items-center gap-4 text-left touch-target-xl border-2 border-secondary/30 active:bg-secondary/5 transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <Mic className="w-7 h-7 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[17px] font-bold text-foreground">Voice Care</div>
                    <div className="text-[13px] text-muted-foreground mt-1 leading-snug">I'll guide you with voice. Just speak to navigate and more.</div>
                  </div>
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={next}
                  className="w-full ios-card-elevated p-5 flex items-center gap-4 text-left touch-target-xl active:bg-muted/30 transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Monitor className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[17px] font-bold text-foreground">Browse Mode</div>
                    <div className="text-[13px] text-muted-foreground mt-1 leading-snug">Use the app by tapping and swiping. Enable voice later.</div>
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
                {modeOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button key={opt.mode} onClick={() => { setSelectedMode(opt.mode); setStep('personalize'); }}
                      className={`ios-card-elevated p-5 text-left flex items-center gap-4 active:scale-[0.98] transition-all touch-target ${
                        selectedMode === opt.mode ? 'ring-2 ring-primary bg-primary/[0.03]' : ''
                      }`}>
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
              <div className={`ios-card-elevated overflow-hidden transition-all duration-300 ${
                isHighlighted('onboarding-name') ? 'ring-4 ring-secondary shadow-lg' : ''
              }`}>
                <input id="onboarding-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={isHighlighted('onboarding-name') ? '🎤 Listening for your name...' : 'Your name'}
                  className="w-full h-14 px-5 bg-transparent text-ios-body text-foreground placeholder:text-muted-foreground/60 outline-none rounded-2xl" autoFocus />
              </div>
              {isHighlighted('onboarding-name') && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-center text-[14px] text-secondary font-medium">
                  🎙️ Say your name clearly — I will type it for you
                </motion.div>
              )}
              <div className="mt-auto mb-8">
                <button onClick={() => setStep('complete')} className="w-full h-14 gradient-primary text-primary-foreground text-[17px] font-bold active:scale-[0.98] transition-transform rounded-2xl shadow-lg">
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                className="w-28 h-28 rounded-full gradient-success flex items-center justify-center mb-8 shadow-lg">
                <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3, type: 'spring' }}
                  className="text-success-foreground text-5xl font-bold">✓</motion.div>
              </motion.div>
              <h1 className="text-ios-title1 text-foreground mb-3">You're all set{name ? `, ${name}` : ''}!</h1>
              <p className="text-ios-body text-muted-foreground max-w-[280px]">
                MemoCare is ready to help you every day.
              </p>
              <div className="mt-auto mb-8 w-full space-y-3">
                <button onClick={() => finish(false)} className="w-full h-14 gradient-primary text-primary-foreground text-[17px] font-bold active:scale-[0.98] transition-transform rounded-2xl shadow-lg">
                  Start Browsing
                </button>
                <button onClick={() => finish(true)} className="w-full h-14 border-2 border-secondary text-secondary text-[17px] font-bold active:scale-[0.98] transition-transform rounded-2xl flex items-center justify-center gap-3 bg-transparent">
                  <Mic className="w-5 h-5" />
                  Start with Voice Care
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
