import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Smartphone, Wifi, WifiOff, Volume2, BellRing, Clock,
  Shield, Zap, Settings2, ToggleLeft, ToggleRight, Check, X,
  Mic, Speaker, AlertTriangle, Power, RefreshCw, Radio,
  Vibrate, Moon, Sun, ChevronRight, ExternalLink
} from 'lucide-react';
import IconBox, { iosColors } from '@/components/ui/IconBox';

// ─── Push Notification Simulator ───────────────────────────
export function PushNotificationSimulator() {
  const [enabled, setEnabled] = useState(true);
  const [channels, setChannels] = useState([
    { id: 'medication', label: 'Medication Reminders', enabled: true, sound: true, vibrate: true, priority: 'MAX' },
    { id: 'meals', label: 'Meal Reminders', enabled: true, sound: true, vibrate: true, priority: 'HIGH' },
    { id: 'exercise', label: 'Exercise Reminders', enabled: true, sound: false, vibrate: true, priority: 'DEFAULT' },
    { id: 'caregiver', label: 'Caregiver Messages', enabled: true, sound: true, vibrate: true, priority: 'MAX' },
    { id: 'system', label: 'System Alerts', enabled: true, sound: true, vibrate: false, priority: 'HIGH' },
  ]);
  const [pushToken] = useState('ExponentPushToken[xxxxxxxxxxxxxx]');
  const [lastSynced] = useState(new Date());
  const [showPreview, setShowPreview] = useState(false);

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className="ios-card-elevated p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <IconBox Icon={Bell} color={iosColors.red} />
            <div>
              <div className="text-[14px] font-bold text-foreground">Push Notifications</div>
              <div className="text-[11px] text-muted-foreground">
                {enabled ? 'Active — receiving alerts' : 'Disabled'}
              </div>
            </div>
          </div>
          <button onClick={() => setEnabled(!enabled)} className="touch-target">
            {enabled ? (
              <ToggleRight className="w-8 h-8 text-success" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-muted-foreground" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 mb-2">
          <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground font-mono truncate">{pushToken}</span>
          <Check className="w-3.5 h-3.5 text-success ml-auto shrink-0" />
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <RefreshCw className="w-3 h-3" />
          Last synced: {lastSynced.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>

      {/* Notification preview */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="w-full ios-card-elevated p-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform"
      >
        <IconBox Icon={BellRing} color={iosColors.orange} />
        <div className="flex-1 text-left">
          <div className="text-[13px] font-semibold text-foreground">Preview Notification</div>
          <div className="text-[11px] text-muted-foreground">See how alerts appear on device</div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
      </button>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-foreground/90 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
                  <Bell className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="text-[11px] text-background/60 font-medium">MEMOCARE</span>
                <span className="text-[10px] text-background/40 ml-auto">now</span>
              </div>
              <div className="text-[14px] font-bold text-background">Medication Reminder</div>
              <div className="text-[13px] text-background/70 mt-0.5">Time to take Lisinopril 10mg — Take 1 tablet with water</div>
              <div className="flex gap-2 mt-3">
                <div className="flex-1 bg-background/20 rounded-lg py-1.5 text-center text-[12px] font-semibold text-background">
                  Done
                </div>
                <div className="flex-1 bg-background/20 rounded-lg py-1.5 text-center text-[12px] font-semibold text-background">
                  Snooze
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Channels */}
      <div>
        <h3 className="text-[14px] font-bold text-foreground mb-2">Notification Channels</h3>
        <div className="ios-card-elevated divide-y divide-border/40">
          {channels.map(ch => (
            <div key={ch.id} className="flex items-center gap-3 p-3.5">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-foreground">{ch.label}</div>
                <div className="flex items-center gap-2 mt-1">
                  {ch.sound && <Volume2 className="w-3 h-3 text-muted-foreground" />}
                  {ch.vibrate && <Vibrate className="w-3 h-3 text-muted-foreground" />}
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    ch.priority === 'MAX' ? 'bg-destructive/10 text-destructive' :
                    ch.priority === 'HIGH' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>{ch.priority}</span>
                </div>
              </div>
              <button onClick={() => toggleChannel(ch.id)} className="touch-target">
                {ch.enabled ? (
                  <ToggleRight className="w-7 h-7 text-success" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-muted-foreground" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Background Fetch / Auto-Launch Simulator ──────────────
export function BackgroundFetchSimulator() {
  const [bgFetchActive, setBgFetchActive] = useState(true);
  const [lastFetch, setLastFetch] = useState(new Date(Date.now() - 8 * 60 * 1000));
  const [fetchCount] = useState(47);
  const [tasks] = useState([
    { name: 'background-reminder-check', status: 'registered', interval: '15 min', lastRun: '8 min ago', result: 'NewData' },
    { name: 'sync-activity-data', status: 'registered', interval: '30 min', lastRun: '22 min ago', result: 'NewData' },
    { name: 'pattern-analysis', status: 'registered', interval: '6 hrs', lastRun: '2 hrs ago', result: 'NoData' },
  ]);
  const [bootConfig] = useState({ stopOnTerminate: false, startOnBoot: true, minimumInterval: 900 });

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="ios-card-elevated p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <IconBox Icon={Zap} color={iosColors.green} />
            <div>
              <div className="text-[14px] font-bold text-foreground">Background Services</div>
              <div className="text-[11px] text-success font-medium flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                {bgFetchActive ? 'Running' : 'Stopped'}
              </div>
            </div>
          </div>
          <button onClick={() => setBgFetchActive(!bgFetchActive)} className="touch-target">
            <Power className={`w-6 h-6 ${bgFetchActive ? 'text-success' : 'text-muted-foreground'}`} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/50 rounded-xl p-2.5 text-center">
            <div className="text-[16px] font-bold text-foreground">{fetchCount}</div>
            <div className="text-[10px] text-muted-foreground">Fetches today</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-2.5 text-center">
            <div className="text-[16px] font-bold text-foreground">15m</div>
            <div className="text-[10px] text-muted-foreground">Interval</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-2.5 text-center">
            <div className="text-[16px] font-bold text-success">98%</div>
            <div className="text-[10px] text-muted-foreground">Uptime</div>
          </div>
        </div>
      </div>

      {/* Boot config */}
      <div className="ios-card-elevated p-4">
        <h3 className="text-[13px] font-bold text-foreground mb-3">Auto-Launch Configuration</h3>
        <div className="space-y-2.5">
          {[
            { label: 'Start on Boot', value: bootConfig.startOnBoot, icon: Power },
            { label: 'Continue on App Kill', value: !bootConfig.stopOnTerminate, icon: Shield },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-[13px] text-foreground">{item.label}</span>
              </div>
              <ToggleRight className={`w-7 h-7 ${item.value ? 'text-success' : 'text-muted-foreground'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Registered Tasks */}
      <div>
        <h3 className="text-[14px] font-bold text-foreground mb-2">Registered Tasks</h3>
        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.name} className="ios-card-elevated p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-bold text-foreground font-mono">{task.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">{task.status}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Every {task.interval}</span>
                <span>Last: {task.lastRun}</span>
                <span className={`font-medium ${task.result === 'NewData' ? 'text-success' : 'text-muted-foreground'}`}>{task.result}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Alexa Integration Simulator ───────────────────────────
export function AlexaIntegrationSimulator() {
  const [linked, setLinked] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const demoConversation = [
    { speaker: 'user', text: 'Alexa, open MemoCare' },
    { speaker: 'alexa', text: 'Welcome to MemoCare Assistant. You have 3 active reminders.' },
    { speaker: 'user', text: 'What are my reminders?' },
    { speaker: 'alexa', text: '1. Take Lisinopril 10mg. 2. Lunch at 12 PM. 3. Evening walk at 5 PM.' },
    { speaker: 'user', text: 'Mark the first one as done' },
    { speaker: 'alexa', text: 'Okay, marked Lisinopril as complete. I\'ve also sent a notification to your app.' },
  ];

  useEffect(() => {
    if (showDemo && demoStep < demoConversation.length) {
      const timer = setTimeout(() => setDemoStep(prev => prev + 1), 1800);
      return () => clearTimeout(timer);
    }
  }, [showDemo, demoStep]);

  const startDemo = () => {
    setDemoStep(0);
    setShowDemo(true);
  };

  return (
    <div className="space-y-4">
      {/* Link status */}
      <div className="ios-card-elevated p-4">
        <div className="flex items-center gap-3 mb-3">
          <IconBox Icon={Speaker} color={iosColors.teal} size={48} iconSize={24} />
          <div className="flex-1">
            <div className="text-[16px] font-bold text-foreground">Amazon Alexa</div>
            <div className="text-[12px] text-muted-foreground flex items-center gap-1.5">
              {linked ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-success font-medium">Account Linked</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <span>Not Linked</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => setLinked(!linked)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold ${
              linked ? 'bg-destructive/10 text-destructive' : 'bg-primary text-primary-foreground'
            }`}
          >
            {linked ? 'Unlink' : 'Link Account'}
          </button>
        </div>

        {linked && (
          <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">Skill</span>
              <span className="text-foreground font-medium">MemoCare Assistant</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">Device</span>
              <span className="text-foreground font-medium">Living Room Echo</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">Endpoint</span>
              <span className="text-foreground font-mono text-[10px]">/alexa-skill</span>
            </div>
          </div>
        )}
      </div>

      {/* Supported commands */}
      <div className="ios-card-elevated p-4">
        <h3 className="text-[13px] font-bold text-foreground mb-3">Voice Commands</h3>
        <div className="space-y-2">
          {[
            { cmd: '"Alexa, open MemoCare"', desc: 'Launch the skill' },
            { cmd: '"What are my reminders?"', desc: 'List active reminders' },
            { cmd: '"Mark number 1 as done"', desc: 'Complete a reminder' },
            { cmd: '"How am I doing today?"', desc: 'Get daily summary' },
            { cmd: '"Send help"', desc: 'Alert caregivers' },
          ].map(item => (
            <div key={item.cmd} className="flex items-start gap-2.5">
              <Mic className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-[13px] font-semibold text-foreground">{item.cmd}</div>
                <div className="text-[11px] text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Demo */}
      <button
        onClick={startDemo}
        className="w-full ios-card-elevated p-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform"
      >
        <IconBox Icon={Radio} color={iosColors.purple} />
        <div className="flex-1 text-left">
          <div className="text-[13px] font-semibold text-foreground">Play Demo Conversation</div>
          <div className="text-[11px] text-muted-foreground">See Alexa interaction flow</div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
      </button>

      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="ios-card-elevated p-4 space-y-3">
              {demoConversation.slice(0, demoStep).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.speaker === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-2 ${msg.speaker === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.speaker === 'user' ? 'bg-primary/10' : 'bg-[#00CAFF]/10'
                  }`}>
                    {msg.speaker === 'user' ? <Mic className="w-3.5 h-3.5 text-primary" /> : <Speaker className="w-3.5 h-3.5 text-[#00CAFF]" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    msg.speaker === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-lg'
                      : 'bg-muted rounded-bl-lg'
                  }`}>
                    <p className={`text-[13px] ${msg.speaker === 'user' ? '' : 'text-foreground'}`}>{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              {demoStep < demoConversation.length && (
                <div className="flex items-center gap-1.5 justify-center py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Persistent Notification Overlay Simulator ─────────────
export function PersistentNotificationSimulator() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Medication Reminder',
      message: 'Time to take Lisinopril 10mg — Take 1 tablet with water',
      type: 'medication',
      priority: 'critical',
      time: '2 minutes ago',
      persistent: true,
      photoUrl: '',
    },
    {
      id: '2',
      title: 'Lunch Time',
      message: 'Remember to eat lunch. Sarah prepared soup in the fridge.',
      type: 'meal',
      priority: 'high',
      time: '15 minutes ago',
      persistent: true,
      photoUrl: '',
    },
  ]);
  const [showOverlay, setShowOverlay] = useState(false);

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const snooze = (id: string) => {
    const n = notifications.find(x => x.id === id);
    if (n) {
      setNotifications(prev => prev.map(x => x.id === id ? { ...x, time: 'Snoozed 10 min' } : x));
    }
  };

  return (
    <div className="space-y-4">
      <div className="ios-card-elevated p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <IconBox Icon={Shield} color={iosColors.red} />
            <div>
              <div className="text-[14px] font-bold text-foreground">Persistent Alerts</div>
              <div className="text-[11px] text-muted-foreground">
                Cannot be dismissed until acknowledged
              </div>
            </div>
          </div>
          <span className="text-[12px] font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-lg">
            {notifications.length} active
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-warning bg-warning/8 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Notifications stay on screen and repeat every 5 minutes until patient responds</span>
        </div>
      </div>

      {/* Notification cards */}
      <div className="space-y-2.5">
        {notifications.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`ios-card-elevated p-4 border-l-4 ${
              n.priority === 'critical' ? 'border-destructive' : 'border-warning'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-[16px] font-bold text-foreground">{n.title}</div>
              <div className="flex items-center gap-1">
                {n.persistent && <Shield className="w-3.5 h-3.5 text-destructive" />}
                <span className="text-[10px] text-muted-foreground">{n.time}</span>
              </div>
            </div>
            <p className="text-[14px] text-foreground/80 leading-relaxed mb-3">{n.message}</p>
            <div className="flex gap-2">
              <button
                onClick={() => dismiss(n.id)}
                className="flex-1 h-12 rounded-xl bg-success text-success-foreground font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform touch-target"
              >
                <Check className="w-5 h-5" /> Done
              </button>
              <button
                onClick={() => snooze(n.id)}
                className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform touch-target"
              >
                <Clock className="w-5 h-5" /> 10 Min
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full screen overlay preview */}
      <button
        onClick={() => setShowOverlay(true)}
        className="w-full ios-card-elevated p-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform"
      >
        <IconBox Icon={Smartphone} color={iosColors.blue} />
        <div className="flex-1 text-left">
          <div className="text-[13px] font-semibold text-foreground">Preview Lock Screen Alert</div>
          <div className="text-[11px] text-muted-foreground">See how it looks on device</div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
      </button>

      {/* Lock screen overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center px-6"
            onClick={() => setShowOverlay(false)}
          >
            {/* Simulated lock screen */}
            <div className="text-center mb-8">
              <div className="text-[48px] font-thin text-white/90">
                {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
              <div className="text-[14px] text-white/50">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-sm bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="text-[12px] text-white/60 font-medium">MEMOCARE • now</span>
              </div>
              <div className="text-[18px] font-bold text-white">Medication Reminder</div>
              <div className="text-[15px] text-white/70 mt-1 leading-relaxed">
                Time to take Lisinopril 10mg — Take 1 tablet with water
              </div>
              <div className="flex gap-3 mt-4">
                <button className="flex-1 bg-white/20 rounded-2xl py-3 text-[15px] font-bold text-white active:bg-white/30 transition-colors">
                  Done
                </button>
                <button className="flex-1 bg-white/20 rounded-2xl py-3 text-[15px] font-bold text-white active:bg-white/30 transition-colors">
                  Snooze
                </button>
              </div>
            </motion.div>

            <div className="text-[12px] text-white/30 mt-6">Tap anywhere to close preview</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
