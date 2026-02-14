import { useState } from 'react';
import { useApp, AppMode } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { User, Moon, Heart, Shield, HelpCircle, ChevronRight, Bell, Eye, Globe, LogOut } from 'lucide-react';

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '😴', label: 'Tired' },
];

export default function WellbeingScreen() {
  const { patientName, mode, setMode, currentMood, setMood, sleepHours, stepCount, medicationAdherence } = useApp();
  const [showModeSwitch, setShowModeSwitch] = useState(false);

  const modes: { id: AppMode; label: string; desc: string; dotColor: string }[] = [
    { id: 'full', label: 'Full Mode', desc: 'All features, standard interface', dotColor: 'bg-primary' },
    { id: 'simplified', label: 'Simplified Mode', desc: 'Larger buttons, fewer options', dotColor: 'bg-warning' },
    { id: 'essential', label: 'Essential Mode', desc: 'Minimal interface, caregiver-managed', dotColor: 'bg-lavender' },
  ];

  return (
    <div className="h-full overflow-y-auto warm-gradient pb-6">
      <div className="px-5 pt-4 pb-3">
        <h1 className="text-[28px] font-bold text-foreground">My Wellbeing</h1>
      </div>

      {/* Profile Card */}
      <div className="px-5 mt-1">
        <div className="ios-card-elevated p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[19px] font-bold text-foreground">{patientName || 'Friend'}</div>
            <div className="text-[13px] text-muted-foreground">Tap to edit profile</div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </div>
      </div>

      {/* Mood Tracker */}
      <div className="px-5 mt-6">
        <h2 className="text-ios-title3 text-foreground mb-3">How are you feeling?</h2>
        <div className="ios-card-elevated p-4">
          <div className="grid grid-cols-6 gap-1.5">
            {moods.map(m => (
              <motion.button
                key={m.label}
                whileTap={{ scale: 0.85 }}
                onClick={() => setMood({ ...m, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) })}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all touch-target ${
                  currentMood.label === m.label ? 'bg-primary/10 ring-2 ring-primary' : 'active:bg-muted'
                }`}
                aria-label={`Select mood: ${m.label}`}
              >
                <span className="text-[24px]">{m.emoji}</span>
                <span className="text-[11px] text-muted-foreground font-medium">{m.label}</span>
              </motion.button>
            ))}
          </div>
          {currentMood && (
            <div className="mt-3 pt-3 border-t border-border/60 text-center text-[13px] text-muted-foreground">
              Feeling {currentMood.label} {currentMood.emoji} · logged at {currentMood.time}
            </div>
          )}
        </div>
      </div>

      {/* Health Summary */}
      <div className="px-5 mt-6">
        <h2 className="text-ios-title3 text-foreground mb-3">Health Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Sleep', value: `${sleepHours}h`, Icon: Moon, trend: 'Good', trendColor: 'text-success', bg: 'bg-lavender/8' },
            { label: 'Steps', value: stepCount.toLocaleString(), Icon: Heart, trend: 'Normal', trendColor: 'text-primary', bg: 'bg-primary/8' },
            { label: 'Med Adherence', value: `${medicationAdherence}%`, Icon: Shield, trend: 'Excellent', trendColor: 'text-success', bg: 'bg-success/8' },
            { label: 'Mood Trend', value: '😊', Icon: Heart, trend: 'Stable', trendColor: 'text-accent', bg: 'bg-accent/8' },
          ].map(stat => (
            <div key={stat.label} className="ios-card-elevated p-4 flex flex-col gap-2">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-[20px] font-bold text-foreground">{stat.value}</div>
              <div className="text-[12px] text-muted-foreground">{stat.label}</div>
              <div className={`text-[12px] font-semibold ${stat.trendColor}`}>{stat.trend}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="px-5 mt-6">
        <h2 className="text-ios-title3 text-foreground mb-3">Interface Mode</h2>
        <button
          onClick={() => setShowModeSwitch(!showModeSwitch)}
          className="w-full ios-card-elevated p-4 flex items-center justify-between touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-[15px] text-foreground font-medium">Current: {modes.find(m => m.id === mode)?.label}</div>
              <div className="text-[12px] text-muted-foreground">Tap to change interface</div>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${showModeSwitch ? 'rotate-90' : ''}`} />
        </button>
        {showModeSwitch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-2 space-y-2 overflow-hidden"
          >
            {modes.map(m => (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setMode(m.id); setShowModeSwitch(false); }}
                className={`w-full ios-card p-4 flex items-center gap-3 text-left transition-all touch-target ${
                  mode === m.id ? 'ring-2 ring-primary bg-primary/[0.03]' : ''
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full ${m.dotColor}`} />
                <div className="flex-1">
                  <div className="text-[15px] font-medium text-foreground">{m.label}</div>
                  <div className="text-[12px] text-muted-foreground">{m.desc}</div>
                </div>
                {mode === m.id && <span className="text-primary text-[12px] font-semibold">Active</span>}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Settings List */}
      <div className="px-5 mt-6">
        <h2 className="text-ios-title3 text-foreground mb-3">Settings</h2>
        <div className="ios-card-elevated divide-y divide-border/60">
          {[
            { icon: Bell, label: 'Notifications', detail: 'On' },
            { icon: Globe, label: 'Language', detail: 'English' },
            { icon: Shield, label: 'Privacy', detail: '' },
            { icon: HelpCircle, label: 'Help & Support', detail: '' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button key={item.label} className="w-full flex items-center gap-3 p-4 text-left active:bg-muted/30 transition-colors touch-target">
                <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                  <Icon className="w-[18px] h-[18px] text-primary" />
                </div>
                <span className="text-[15px] text-foreground flex-1">{item.label}</span>
                {item.detail && <span className="text-[14px] text-muted-foreground">{item.detail}</span>}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-5 mb-6">
        <button className="w-full ios-card p-4 flex items-center gap-3 text-left text-destructive touch-target">
          <LogOut className="w-5 h-5" />
          <span className="text-[15px] font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
