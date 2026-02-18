import { useState } from 'react';
import { useApp, AppMode } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Moon, Heart, Shield, HelpCircle, ChevronRight, Bell, Eye, Globe, LogOut, Footprints, Pill, Smile, Meh, Frown, AlertCircle, Angry, BedDouble } from 'lucide-react';
import IconBox, { iosColors } from '@/components/ui/IconBox';
import patientAvatar from '@/assets/patient-avatar.jpg';

const moods = [
  { icon: Smile, label: 'Happy' },
  { icon: Meh, label: 'Okay' },
  { icon: Frown, label: 'Sad' },
  { icon: AlertCircle, label: 'Anxious' },
  { icon: Angry, label: 'Frustrated' },
  { icon: BedDouble, label: 'Tired' },
];

export default function WellbeingScreen() {
  const { patientName, mode, setMode, currentMood, setMood, sleepHours, stepCount, medicationAdherence } = useApp();
  const [showModeSwitch, setShowModeSwitch] = useState(false);

  const modes: { id: AppMode; label: string; desc: string }[] = [
    { id: 'full', label: 'Full Mode', desc: 'All features, standard interface' },
    { id: 'simplified', label: 'Simplified Mode', desc: 'Larger buttons, fewer options' },
    { id: 'essential', label: 'Essential Mode', desc: 'Minimal interface, caregiver-managed' },
  ];

  return (
    <div className="h-full overflow-y-auto ios-grouped-bg pb-6 relative">
      {/* iOS Large Title */}
      <div className="px-4 pt-4 pb-1">
        <h1 className="text-ios-large-title text-foreground">Wellbeing</h1>
        <p className="text-ios-subheadline text-muted-foreground mt-1">Track your health & mood</p>
      </div>

      {/* Profile */}
      <div className="mt-3">
        <div className="mx-4 ios-card overflow-hidden">
          <div className="flex items-center gap-3 px-4" style={{ minHeight: 60 }}>
            <img src={patientAvatar} alt="Profile" className="rounded-full object-cover shrink-0" style={{ width: 44, height: 44 }} />
            <div className="flex-1 min-w-0">
              <div className="text-ios-callout font-medium text-foreground">{patientName || 'Friend'}</div>
              <div className="text-ios-footnote text-muted-foreground">Tap to edit profile</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/30 shrink-0" />
          </div>
        </div>
      </div>

      {/* Mood Tracker — SF Symbols only, no emoji */}
      <div className="mt-5">
        <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">How are you feeling?</p>
        <div className="mx-4 ios-card p-4">
          <div className="grid grid-cols-3 gap-2">
            {moods.map(m => {
              const Icon = m.icon;
              return (
                <motion.button key={m.label} whileTap={{ scale: 0.9 }}
                  onClick={() => setMood({ emoji: '', label: m.label, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) })}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all touch-target ${
                    currentMood.label === m.label ? 'bg-muted ring-2 ring-primary' : 'active:bg-muted/60'
                  }`} aria-label={`Select mood: ${m.label}`}>
                  <Icon className="w-7 h-7 text-muted-foreground" />
                  <span className="text-ios-caption text-muted-foreground font-medium">{m.label}</span>
                </motion.button>
              );
            })}
          </div>
          {currentMood && (
            <div className="mt-3 pt-3 border-t border-border/30 text-center text-ios-footnote text-muted-foreground">
              Feeling {currentMood.label} · logged at {currentMood.time}
            </div>
          )}
        </div>
      </div>

      {/* Health Summary — 2x2 Card Grid like Apple Fitness */}
      <div className="mt-5">
        <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Health Summary</p>
        <div className="mx-4 grid grid-cols-2 gap-2.5">
          {[
            { label: 'Sleep', value: `${sleepHours}h`, Icon: Moon, detail: 'Last night', color: iosColors.purple },
            { label: 'Steps', value: stepCount.toLocaleString(), Icon: Footprints, detail: 'Today', color: iosColors.green },
            { label: 'Med Adherence', value: `${medicationAdherence}%`, Icon: Pill, detail: 'This week', color: iosColors.orange },
            { label: 'Mood Trend', value: 'Stable', Icon: Heart, detail: 'Last 7 days', color: iosColors.red },
          ].map(stat => (
            <div key={stat.label} className="ios-card p-3.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <IconBox Icon={stat.Icon} color={stat.color} size={32} iconSize={16} />
                <span className="text-ios-footnote text-muted-foreground">{stat.detail}</span>
              </div>
              <p className="text-[22px] font-bold text-foreground leading-tight">{stat.value}</p>
              <p className="text-ios-footnote text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="mt-5">
        <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Interface Mode</p>
        <div className="mx-4 ios-card overflow-hidden">
          <button onClick={() => setShowModeSwitch(!showModeSwitch)}
            className="w-full flex items-center gap-3 px-4 text-left touch-target" style={{ minHeight: 56 }}>
            <IconBox Icon={Eye} color={iosColors.blue} />
            <div className="flex-1">
              <div className="text-ios-callout font-medium text-foreground">Current: {modes.find(m => m.id === mode)?.label}</div>
              <div className="text-ios-footnote text-muted-foreground">Tap to change interface</div>
            </div>
            <ChevronRight className={`w-5 h-5 text-muted-foreground/30 transition-transform ${showModeSwitch ? 'rotate-90' : ''}`} />
          </button>
        </div>
        {showModeSwitch && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mx-4 mt-2 overflow-hidden">
            <div className="ios-card overflow-hidden divide-y divide-border/30">
              {modes.map(m => (
                <motion.button key={m.id} whileTap={{ scale: 0.98 }}
                  onClick={() => { setMode(m.id); setShowModeSwitch(false); }}
                  className="w-full flex items-center gap-3 px-4 text-left touch-target" style={{ minHeight: 56 }}>
                  <div className={`w-4 h-4 rounded-full ${mode === m.id ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                  <div className="flex-1">
                    <div className="text-ios-callout font-medium text-foreground">{m.label}</div>
                    <div className="text-ios-footnote text-muted-foreground">{m.desc}</div>
                  </div>
                  {mode === m.id && <span className="text-ios-caption font-semibold text-primary">Active</span>}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Settings — iOS grouped list */}
      <div className="mt-5">
        <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Settings</p>
        <div className="mx-4 ios-card overflow-hidden divide-y divide-border/30">
          {[
            { icon: Bell, label: 'Notifications', detail: 'On', color: iosColors.red },
            { icon: Globe, label: 'Language', detail: 'English', color: iosColors.blue },
            { icon: Shield, label: 'Privacy', detail: '', color: iosColors.green },
            { icon: HelpCircle, label: 'Help & Support', detail: '', color: iosColors.purple },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button key={item.label} className="w-full flex items-center gap-3 px-4 text-left active:bg-muted/20 transition-colors touch-target" style={{ minHeight: 60 }}>
                <IconBox Icon={Icon} color={item.color} />
                <span className="text-ios-callout font-medium text-foreground flex-1">{item.label}</span>
                {item.detail && <span className="text-ios-footnote text-muted-foreground">{item.detail}</span>}
                <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-4 mt-5 mb-6">
        <div className="ios-card overflow-hidden">
          <button className="w-full flex items-center gap-3 px-4 text-left text-destructive touch-target" style={{ minHeight: 56 }}>
            <IconBox Icon={LogOut} color="#FF3B30" />
            <span className="text-ios-callout font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
