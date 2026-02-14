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

  const modes: { id: AppMode; label: string; desc: string; color: string }[] = [
    { id: 'full', label: 'Full Mode', desc: 'All features, standard interface', color: 'bg-primary' },
    { id: 'simplified', label: 'Simplified Mode', desc: 'Larger buttons, fewer options', color: 'bg-warning' },
    { id: 'essential', label: 'Essential Mode', desc: 'Minimal interface, caregiver-managed', color: 'bg-lavender' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-surface pb-4">
      <div className="px-5 pt-3 pb-4 bg-background">
        <h1 className="text-ios-title text-foreground">My Wellbeing</h1>
      </div>

      {/* Profile Card */}
      <div className="px-5 mt-3">
        <div className="ios-card-elevated p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="text-ios-title2 text-foreground">{patientName || 'Friend'}</div>
            <div className="text-ios-subheadline text-muted-foreground">Tap to edit profile</div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
        </div>
      </div>

      {/* Mood Tracker */}
      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">How are you feeling?</h2>
        <div className="ios-card-elevated p-4">
          <div className="grid grid-cols-6 gap-2">
            {moods.map(m => (
              <motion.button
                key={m.label}
                whileTap={{ scale: 0.85 }}
                onClick={() => setMood({ ...m, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) })}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                  currentMood.label === m.label ? 'bg-primary/10 ring-2 ring-primary' : ''
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-ios-caption text-muted-foreground">{m.label}</span>
              </motion.button>
            ))}
          </div>
          {currentMood && (
            <div className="mt-3 pt-3 border-t border-border text-center text-ios-footnote text-muted-foreground">
              Feeling {currentMood.label} {currentMood.emoji} · logged at {currentMood.time}
            </div>
          )}
        </div>
      </div>

      {/* Health Summary */}
      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Health Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Sleep', value: `${sleepHours}h`, icon: Moon, trend: 'Good', trendColor: 'text-success', bg: 'bg-lavender/10' },
            { label: 'Steps', value: stepCount.toLocaleString(), icon: Heart, trend: 'Normal', trendColor: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Med Adherence', value: `${medicationAdherence}%`, icon: Shield, trend: 'Excellent', trendColor: 'text-success', bg: 'bg-success/10' },
            { label: 'Mood Trend', value: '😊', icon: Heart, trend: 'Stable', trendColor: 'text-accent', bg: 'bg-accent/10' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="ios-card-elevated p-4 flex flex-col gap-2">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-ios-title2 text-foreground">{stat.value}</div>
                <div className="text-ios-caption text-muted-foreground">{stat.label}</div>
                <div className={`text-ios-caption font-medium ${stat.trendColor}`}>{stat.trend}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Interface Mode</h2>
        <button
          onClick={() => setShowModeSwitch(!showModeSwitch)}
          className="w-full ios-card-elevated p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-primary" />
            <div>
              <div className="text-ios-body text-foreground font-medium">Current: {modes.find(m => m.id === mode)?.label}</div>
              <div className="text-ios-caption text-muted-foreground">Tap to change interface complexity</div>
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
                className={`w-full ios-card p-4 flex items-center gap-3 text-left transition-all ${
                  mode === m.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${m.color}`} />
                <div className="flex-1">
                  <div className="text-ios-body font-medium text-foreground">{m.label}</div>
                  <div className="text-ios-caption text-muted-foreground">{m.desc}</div>
                </div>
                {mode === m.id && <span className="text-primary text-ios-caption font-semibold">Active</span>}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Settings List */}
      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Settings</h2>
        <div className="ios-card-elevated divide-y divide-border">
          {[
            { icon: Bell, label: 'Notifications', detail: 'On' },
            { icon: Globe, label: 'Language', detail: 'English' },
            { icon: Shield, label: 'Privacy', detail: '' },
            { icon: HelpCircle, label: 'Help & Support', detail: '' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button key={item.label} className="w-full flex items-center gap-3 p-4 text-left active:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-ios-body text-foreground flex-1">{item.label}</span>
                {item.detail && <span className="text-ios-subheadline text-muted-foreground">{item.detail}</span>}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-5 mb-8">
        <button className="w-full ios-card p-4 flex items-center gap-3 text-left text-destructive">
          <LogOut className="w-5 h-5" />
          <span className="text-ios-body font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
