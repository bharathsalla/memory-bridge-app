import { useState, useEffect, useCallback } from 'react';
import { useApp, AppMode } from '@/contexts/AppContext';
import { useVoiceOver } from '@/contexts/VoiceOverContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Hand, Users, Mic, Monitor, Brain, Heart, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import IconBox, { iosColors } from '@/components/ui/IconBox';
import peopleGrid from '@/assets/onboarding-people-grid.jpg';

const steps = ['welcome', 'voiceChoice', 'assess', 'personalize', 'complete'] as const;

/* ── Animated MemoCare Logo ── */
function MemoCareLogo() {
  return (
    <motion.div
      initial={{ scale: 0.3, opacity: 0, rotateY: -30 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ delay: 0.15, type: 'spring', bounce: 0.35, duration: 1 }}
      className="relative w-40 h-40 mb-12"
    >
      {/* Outer glow ring */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded bg-white/10"
      />
      {/* Glass card */}
      <div className="absolute inset-2 rounded bg-white/15 backdrop-blur-md shadow-2xl border border-white/20 flex items-center justify-center">
        {/* Brain icon */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Brain className="w-16 h-16 text-white drop-shadow-lg" strokeWidth={1.4} />
        </motion.div>
        {/* Sparkle accents */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute top-3 right-4"
        >
          <Sparkles className="w-5 h-5 text-white/70" strokeWidth={1.5} />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 0.7, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-4 left-4"
        >
          <Heart className="w-4 h-4 text-white/60" strokeWidth={1.5} />
        </motion.div>
      </div>
    </motion.div>
  );
}

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
  }, [startVoiceOver, next]);

  const finish = (withVoice: boolean = false) => {
    completeOnboarding(name || 'Friend', selectedMode);
    if (withVoice && !isVoiceOverActive) {
      setTimeout(() => startVoiceOver(), 800);
    }
  };

  const modeOptions: { mode: AppMode; title: string; desc: string; icon: typeof Smartphone }[] = [
    { mode: 'full', title: 'Very comfortable', desc: 'I use apps and phones regularly', icon: Smartphone },
    { mode: 'simplified', title: 'Somewhat comfortable', desc: 'I prefer simple, larger buttons', icon: Hand },
    { mode: 'essential', title: 'I need help', desc: 'A caregiver will set things up for me', icon: Users },
  ];

  const isHighlighted = (id: string) => highlightedInputId === id;

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col relative z-10"
        >
          {/* ── Welcome ── white bg with people grid */}
          {step === 'welcome' && (
            <div className="flex-1 flex flex-col bg-white">
              {/* Progress dots */}
              <div className="flex justify-center gap-2.5 pt-14 pb-4 relative z-20">
                {steps.map((s) => (
                  <div
                    key={s}
                    className={`h-[5px] rounded-full transition-all duration-500 ${
                      s === step ? 'w-10 bg-primary' : steps.indexOf(s) < steps.indexOf(step) ? 'w-[5px] bg-primary/40' : 'w-[5px] bg-border'
                    }`}
                  />
                ))}
              </div>

              {/* People grid image */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', bounce: 0.3, duration: 0.8 }}
                  className="w-[280px] h-[200px] rounded-2xl overflow-hidden mb-8 shadow-lg"
                >
                  <img
                    src={peopleGrid}
                    alt="Diverse patients and caregivers"
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="text-[34px] font-extrabold text-foreground mb-4 leading-[1.1] font-display tracking-tight"
                >
                  Welcome to
                  <br />
                  MemoCare
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-[16px] text-muted-foreground max-w-[280px] leading-relaxed"
                >
                  Supporting you every step of the way, with care and kindness.
                </motion.p>
              </div>

              {/* Bottom actions */}
              <div className="px-7 pb-8 pt-4 relative z-10 space-y-3">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={next}
                  className="w-full h-[58px] bg-primary rounded-2xl shadow-lg flex items-center justify-center gap-3 active:opacity-90 transition-all"
                >
                  <span className="text-[18px] font-bold text-primary-foreground">
                    Get Started
                  </span>
                  <ArrowRight className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
                </motion.button>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  onClick={() => { setSelectedMode('full'); setStep('personalize'); }}
                  className="w-full h-12 text-muted-foreground text-[16px] font-semibold rounded-2xl active:text-foreground transition-colors"
                >
                  I'm a caregiver
                </motion.button>
              </div>
            </div>
          )}

          {/* ── Voice Choice ── */}
          {step === 'voiceChoice' && (
            <div className="flex-1 flex flex-col bg-background">
              {/* Progress dots */}
              <div className="flex justify-center gap-2.5 pt-14 pb-4">
                {steps.map((s) => (
                  <div
                    key={s}
                    className={`h-[5px] rounded-full transition-all duration-500 ${
                      s === step ? 'w-10 gradient-primary' : steps.indexOf(s) < steps.indexOf(step) ? 'w-[5px] bg-primary/40' : 'w-[5px] bg-border'
                    }`}
                  />
                ))}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center px-7">
                <h1 className="text-[28px] font-extrabold text-foreground mb-3 leading-tight font-display">
                  How would you like
                  <br />
                  to use MemoCare?
                </h1>
                <p className="text-[15px] text-muted-foreground max-w-[280px] leading-relaxed mb-10">
                  Choose your preferred way to interact.
                </p>

                <div className="w-full space-y-3">
                  {/* Browse Mode */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={next}
                    className="w-full p-5 flex items-center gap-4 text-left rounded-2xl bg-card shadow-sm active:bg-muted/50 transition-all"
                  >
                    <IconBox Icon={Monitor} color={iosColors.blue} size={48} iconSize={24} />
                    <div className="flex-1">
                      <div className="text-[17px] font-bold text-foreground">Browse Mode</div>
                      <div className="text-[13px] text-muted-foreground mt-0.5 leading-snug">
                        Use the app by tapping and swiping
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                  </motion.button>

                  {/* Voice Care */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleVoiceChoice}
                    className="w-full p-5 flex items-center gap-4 text-left rounded-2xl bg-card shadow-sm active:bg-muted/50 transition-all"
                  >
                    <IconBox Icon={Mic} color={iosColors.orange} size={48} iconSize={24} />
                    <div className="flex-1">
                      <div className="text-[17px] font-bold text-foreground">Voice Care</div>
                      <div className="text-[13px] text-muted-foreground mt-0.5 leading-snug">
                        I'll guide you with voice navigation
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* ── Assess ── */}
          {step === 'assess' && (
            <div className="flex-1 flex flex-col bg-background">
              <div className="flex justify-center gap-2.5 pt-14 pb-4">
                {steps.map((s) => (
                  <div key={s} className={`h-[5px] rounded-full transition-all duration-500 ${
                    s === step ? 'w-10 gradient-primary' : steps.indexOf(s) < steps.indexOf(step) ? 'w-[5px] bg-primary/40' : 'w-[5px] bg-border'
                  }`} />
                ))}
              </div>
              <div className="px-7 pt-6">
                <h1 className="text-[28px] font-extrabold text-foreground mb-2 leading-tight font-display">
                  How comfortable are you with technology?
                </h1>
                <p className="text-[15px] text-muted-foreground mb-8">
                  This helps us set up the best experience for you.
                </p>
                <div className="flex flex-col gap-3">
                  {modeOptions.map((opt) => (
                    <motion.button
                      key={opt.mode}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setSelectedMode(opt.mode); setStep('personalize'); }}
                      className={`p-5 text-left flex items-center gap-4 rounded-2xl bg-card shadow-sm active:bg-muted/50 transition-all ${
                        selectedMode === opt.mode ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <IconBox
                        Icon={opt.icon}
                        color={opt.mode === 'full' ? iosColors.blue : opt.mode === 'simplified' ? iosColors.orange : iosColors.green}
                        size={48}
                        iconSize={24}
                      />
                      <div className="flex-1">
                        <div className="text-[17px] font-bold text-foreground">{opt.title}</div>
                        <div className="text-[13px] text-muted-foreground mt-0.5">{opt.desc}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Personalize ── */}
          {step === 'personalize' && (
            <div className="flex-1 flex flex-col bg-background">
              <div className="flex justify-center gap-2.5 pt-14 pb-4">
                {steps.map((s) => (
                  <div key={s} className={`h-[5px] rounded-full transition-all duration-500 ${
                    s === step ? 'w-10 gradient-primary' : steps.indexOf(s) < steps.indexOf(step) ? 'w-[5px] bg-primary/40' : 'w-[5px] bg-border'
                  }`} />
                ))}
              </div>
              <div className="flex-1 flex flex-col px-7 pt-6">
                <h1 className="text-[28px] font-extrabold text-foreground mb-2 leading-tight font-display">
                  What should we call you?
                </h1>
                <p className="text-[15px] text-muted-foreground mb-8">
                  We'll use this to personalize your experience.
                </p>
                <div
                  className={`rounded-2xl bg-card shadow-sm overflow-hidden transition-all duration-300 ${
                    isHighlighted('onboarding-name') ? 'ring-4 ring-secondary shadow-lg' : ''
                  }`}
                >
                  <input
                    id="onboarding-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isHighlighted('onboarding-name') ? 'Listening for your name...' : 'Your name'}
                    className="w-full h-14 px-5 bg-transparent text-[17px] text-foreground placeholder:text-muted-foreground/60 outline-none"
                    autoFocus
                  />
                </div>
                {isHighlighted('onboarding-name') && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center justify-center gap-2 text-[14px] text-secondary font-medium"
                  >
                    <Mic className="w-4 h-4" /> Say your name clearly — I will type it for you
                  </motion.div>
                )}
                <div className="mt-auto pb-8">
                  <button
                    onClick={() => setStep('complete')}
                    className="w-full h-14 gradient-primary text-primary-foreground text-[17px] font-bold active:scale-[0.98] transition-transform rounded-2xl shadow-lg"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Complete ── */}
          {step === 'complete' && (
            <div className="flex-1 flex flex-col bg-background">
              <div className="flex justify-center gap-2.5 pt-14 pb-4">
                {steps.map((s) => (
                  <div key={s} className={`h-[5px] rounded-full transition-all duration-500 ${
                    s === step ? 'w-10 gradient-primary' : steps.indexOf(s) < steps.indexOf(step) ? 'w-[5px] bg-primary/40' : 'w-[5px] bg-border'
                  }`} />
                ))}
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-center px-7">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="w-28 h-28 rounded-full gradient-success flex items-center justify-center mb-8 shadow-lg"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <CheckCircle className="w-14 h-14 text-success-foreground" strokeWidth={2} />
                  </motion.div>
                </motion.div>
                <h1 className="text-[28px] font-extrabold text-foreground mb-3 leading-tight font-display">
                  You're all set{name ? `, ${name}` : ''}!
                </h1>
                <p className="text-[15px] text-muted-foreground max-w-[280px]">
                  MemoCare is ready to help you every day.
                </p>
                <div className="mt-auto pb-8 w-full space-y-3">
                  <button
                    onClick={() => finish(false)}
                    className="w-full h-14 gradient-primary text-primary-foreground text-[17px] font-bold active:scale-[0.98] transition-transform rounded-2xl shadow-lg"
                  >
                    Start Browsing
                  </button>
                  <button
                    onClick={() => finish(true)}
                    className="w-full h-14 text-secondary text-[17px] font-semibold active:scale-[0.98] transition-transform rounded-2xl flex items-center justify-center gap-3 bg-card shadow-sm"
                  >
                    <Mic className="w-5 h-5" />
                    Start with Voice Care
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
