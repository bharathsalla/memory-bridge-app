import { useState } from 'react';
import { useApp, AppMode } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Moon, Heart, Shield, HelpCircle, ChevronRight, Bell, Eye, Globe, LogOut, Sparkles } from 'lucide-react';
import patientAvatar from '@/assets/patient-avatar.jpg';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
    <div className="h-full overflow-y-auto ios-grouped-bg pb-6 relative">
      <div className="relative z-10">
        {/* Gradient Header — Care-style */}
        <div className="bg-gradient-to-br from-primary via-primary to-accent px-5 pt-5 pb-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-foreground/5" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-[20px] font-extrabold text-primary-foreground leading-tight font-display">My Wellbeing</h1>
              <p className="text-[13px] text-primary-foreground/60 font-medium">Track your health & mood</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="mx-4 mt-4">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <img src={patientAvatar} alt="Profile" className="rounded-2xl object-cover shrink-0 ring-2 ring-secondary/25 shadow-md" style={{ width: 60, height: 60 }} />
              <div className="flex-1 min-w-0">
                <div className="text-[18px] font-extrabold text-foreground font-display">{patientName || 'Friend'}</div>
                <div className="text-[14px] text-muted-foreground font-medium">Tap to edit profile</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </div>

        {/* Mood Tracker */}
        <div className="mx-4 mt-5">
          <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1 font-display">How are you feeling?</p>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-2.5">
                {moods.map(m => (
                  <motion.button key={m.label} whileTap={{ scale: 0.85 }}
                    onClick={() => setMood({ ...m, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) })}
                    className={`flex flex-col items-center gap-2 py-3.5 rounded-2xl transition-all touch-target ${
                      currentMood.label === m.label ? 'bg-primary/10 ring-2 ring-primary' : 'active:bg-muted'
                    }`} aria-label={`Select mood: ${m.label}`}>
                    <span className="text-[30px]">{m.emoji}</span>
                    <span className="text-[13px] text-muted-foreground font-bold">{m.label}</span>
                  </motion.button>
                ))}
              </div>
              {currentMood && (
                <div className="mt-3 pt-3 border-t border-border/40 text-center text-[14px] text-muted-foreground font-medium">
                  Feeling {currentMood.label} {currentMood.emoji} · logged at {currentMood.time}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Health Summary */}
        <div className="mx-4 mt-5">
          <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1 font-display">Health Summary</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Sleep', value: `${sleepHours}h`, Icon: Moon, trend: 'Good', trendColor: 'text-success', bg: 'bg-lavender/10', iconColor: 'text-lavender' },
              { label: 'Steps', value: stepCount.toLocaleString(), Icon: Heart, trend: 'Normal', trendColor: 'text-primary', bg: 'bg-sage/10', iconColor: 'text-sage' },
              { label: 'Med Adherence', value: `${medicationAdherence}%`, Icon: Shield, trend: 'Excellent', trendColor: 'text-success', bg: 'bg-primary/10', iconColor: 'text-primary' },
              { label: 'Mood Trend', value: '😊', Icon: Heart, trend: 'Stable', trendColor: 'text-secondary', bg: 'bg-secondary/10', iconColor: 'text-secondary' },
            ].map(stat => (
              <Card key={stat.label} className="border-border/60 shadow-sm">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div className="text-[22px] font-extrabold text-foreground font-display">{stat.value}</div>
                  <div className="text-[12px] text-muted-foreground font-bold uppercase tracking-wide">{stat.label}</div>
                  <div className={`text-[13px] font-bold ${stat.trendColor}`}>{stat.trend}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="mx-4 mt-5">
          <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1 font-display">Interface Mode</p>
          <Card className="border-border/60 shadow-sm">
            <button onClick={() => setShowModeSwitch(!showModeSwitch)}
              className="w-full p-4 flex items-center justify-between touch-target">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 flex items-center justify-center" style={{ width: 44, height: 44 }}>
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-[15px] text-foreground font-bold">Current: {modes.find(m => m.id === mode)?.label}</div>
                  <div className="text-[13px] text-muted-foreground font-medium">Tap to change interface</div>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${showModeSwitch ? 'rotate-90' : ''}`} />
            </button>
          </Card>
          {showModeSwitch && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-2 space-y-2 overflow-hidden">
              {modes.map(m => (
                <Card key={m.id} className={`border-border/60 shadow-sm ${mode === m.id ? 'ring-2 ring-primary' : ''}`}>
                  <motion.button whileTap={{ scale: 0.98 }}
                    onClick={() => { setMode(m.id); setShowModeSwitch(false); }}
                    className="w-full p-4 flex items-center gap-3 text-left touch-target">
                    <div className={`w-4 h-4 rounded-full ${m.dotColor}`} />
                    <div className="flex-1">
                      <div className="text-[15px] font-bold text-foreground">{m.label}</div>
                      <div className="text-[13px] text-muted-foreground font-medium">{m.desc}</div>
                    </div>
                    {mode === m.id && <Badge className="bg-primary/10 text-primary border-0 text-[12px] font-bold">Active</Badge>}
                  </motion.button>
                </Card>
              ))}
            </motion.div>
          )}
        </div>

        {/* Settings */}
        <div className="mx-4 mt-5">
          <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1 font-display">Settings</p>
          <Card className="border-border/60 shadow-sm overflow-hidden divide-y divide-border/40">
            {[
              { icon: Bell, label: 'Notifications', detail: 'On' },
              { icon: Globe, label: 'Language', detail: 'English' },
              { icon: Shield, label: 'Privacy', detail: '' },
              { icon: HelpCircle, label: 'Help & Support', detail: '' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button key={item.label} className="w-full flex items-center gap-3.5 p-4 text-left active:bg-muted/20 transition-colors touch-target">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[15px] text-foreground flex-1 font-bold">{item.label}</span>
                  {item.detail && <span className="text-[14px] text-muted-foreground font-medium">{item.detail}</span>}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </Card>
        </div>

        <div className="mx-4 mt-5 mb-6">
          <Card className="border-border/60 shadow-sm">
            <button className="w-full p-4 flex items-center gap-3 text-left text-destructive touch-target">
              <LogOut className="w-5 h-5" />
              <span className="text-[15px] font-bold">Sign Out</span>
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
