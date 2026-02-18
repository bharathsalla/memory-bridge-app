import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Activity, Heart, Moon, Thermometer,
  MapPin, Cloud, Pill, Brain, TrendingUp, ChevronRight, ChevronDown,
  Check, Phone, Clock, Zap, Eye, Wind, Footprints, MessageCircle,
  Smartphone, Watch, Radio, BarChart3, Target, ArrowUp, ArrowDown,
  CheckCircle2, Circle, X, Send, Bot, Wifi, WifiOff, Plus,
  Bluetooth, Signal, Battery, ChevronLeft, Sparkles, Star, Navigation, History, Settings2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

type CrisisTab = 'forecast' | 'plan' | 'coach' | 'devices' | 'gps' | 'weather';

// ─── Dynamic Data Generation ───────────────────────────────────────
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[rand(0, arr.length - 1)]; }

const riskTypes = ['agitation', 'wandering', 'confusion', 'fall'] as const;
const riskLevels = ['high', 'moderate', 'low'] as const;
const timeWindows = [
  'Tomorrow 4-7 PM', 'Tomorrow 8-11 AM', 'Tonight 10 PM-2 AM',
  'Tomorrow 2-5 PM', 'Tomorrow 6-9 PM', 'Tonight 7-10 PM',
  'Tomorrow morning 6-9 AM', 'Tomorrow noon-3 PM',
];

const factorPool = [
  { label: 'Sleep Quality', make: () => ({ detail: `${rand(3,6)} wake-ups (baseline: 1-2)`, severity: 'bad' as const, icon: '😴' }) },
  { label: 'Deep Sleep', make: () => ({ detail: `Only ${rand(12,22)}% deep sleep (usual: 35%)`, severity: 'bad' as const, icon: '🛏️' }) },
  { label: 'HRV Stress', make: () => ({ detail: `HRV ${rand(25,40)}ms (baseline: 55ms)`, severity: 'bad' as const, icon: '💗' }) },
  { label: 'Resting HR', make: () => ({ detail: `${rand(74,85)} bpm (baseline: 68 bpm)`, severity: 'bad' as const, icon: '❤️' }) },
  { label: 'Barometric Drop', make: () => ({ detail: `Dropped ${rand(5,12)}mb in 12 hours`, severity: 'warning' as const, icon: '🌦️' }) },
  { label: 'Pacing Episodes', make: () => ({ detail: `${rand(2,5)} pacing episodes detected`, severity: 'warning' as const, icon: '🚶' }) },
  { label: 'Medication Missed', make: () => ({ detail: `${pick(['Morning','Afternoon','Evening'])} dose ${rand(1,3)}h late`, severity: 'bad' as const, icon: '💊' }) },
  { label: 'Activity Drop', make: () => ({ detail: `${rand(30,55)}% less active than usual`, severity: 'warning' as const, icon: '📉' }) },
  { label: 'SpO2 Dip', make: () => ({ detail: `Blood oxygen ${rand(91,94)}% (usual: 97%)`, severity: 'bad' as const, icon: '🫁' }) },
  { label: 'Temperature', make: () => ({ detail: `Room temp ${rand(28,33)}°C (comfort: 22-25°C)`, severity: 'warning' as const, icon: '🌡️' }) },
];

function generateAlerts() {
  const count = rand(1, 3);
  const usedTypes = new Set<string>();
  const alerts = [];
  for (let i = 0; i < count; i++) {
    let type = pick([...riskTypes]);
    while (usedTypes.has(type)) type = pick([...riskTypes]);
    usedTypes.add(type);
    const level = i === 0 ? pick(['high', 'moderate'] as const) : pick([...riskLevels]);
    const prob = level === 'high' ? rand(75, 95) : level === 'moderate' ? rand(50, 74) : rand(25, 49);
    const shuffled = [...factorPool].sort(() => Math.random() - 0.5);
    const factors = shuffled.slice(0, rand(2, 4)).map(f => ({ label: f.label, ...f.make() }));
    alerts.push({ id: String(i + 1), type, level, probability: prob, timeWindow: pick(timeWindows), factors });
  }
  return alerts;
}

const actionTemplates = {
  high: [
    { priority: 1, title: 'Contact Doctor', desc: () => `Review ${pick(['morning','afternoon','evening'])} medication timing`, icon: '📞' },
    { priority: 1, title: 'Adjust Medication', desc: () => `Move ${pick(['Donepezil','Memantine','Risperidone'])} ${rand(1,3)}h earlier`, icon: '💊' },
    { priority: 2, title: 'Cancel Group Activity', desc: () => `Too many visitors increases risk by ${rand(40,70)}%`, icon: '🚫' },
    { priority: 2, title: 'Dim Lights Early', desc: () => `Start at ${rand(2,4)}:30 PM — reduces sensory overload`, icon: '💡' },
    { priority: 2, title: 'Play Calming Music', desc: () => `${pick(['Jazz','Classical','Nature sounds','Ambient'])} playlist at ${rand(3,5)} PM`, icon: '🎵' },
    { priority: 3, title: 'Activate Geo-fence', desc: () => `Set ${rand(100,300)}m radius around home`, icon: '📍' },
    { priority: 3, title: 'Charge GPS Tracker', desc: () => `Current: ${rand(30,70)}% — needs 100% for overnight`, icon: '🔋' },
    { priority: 3, title: 'Alert Backup Caregiver', desc: () => `Notify ${pick(['John','Mary','David','Lisa'])} about risk`, icon: '📱' },
  ],
  moderate: [
    { priority: 1, title: 'Monitor Sleep Tonight', desc: () => `Watch for ${rand(2,4)}+ wake-ups as escalation signal`, icon: '😴' },
    { priority: 2, title: 'Keep Routine Strict', desc: () => `Meals, walks, nap at exact scheduled times`, icon: '🕐' },
    { priority: 2, title: 'Prepare Calm Space', desc: () => `Set up quiet room with familiar items`, icon: '🏠' },
    { priority: 3, title: 'Check Device Sync', desc: () => `Ensure wearable is transmitting — last sync ${rand(5,45)} min ago`, icon: '⌚' },
  ],
  low: [
    { priority: 2, title: 'Continue Monitoring', desc: () => `All indicators within normal range`, icon: '✅' },
    { priority: 3, title: 'Log Activities', desc: () => `Record today's mood and engagement`, icon: '📝' },
  ],
};

function generateActions(alerts: ReturnType<typeof generateAlerts>) {
  const highest = alerts[0]?.level || 'low';
  const templates = [...actionTemplates[highest as keyof typeof actionTemplates]];
  if (highest !== 'low' && alerts.length > 1) {
    templates.push(...actionTemplates.moderate.slice(0, 2));
  }
  return templates.map((t, i) => ({
    id: String(i + 1),
    priority: t.priority,
    title: t.title,
    description: t.desc(),
    emoji: t.icon,
    done: i < rand(0, 2),
  }));
}

const patternDescriptions = [
  (p: number) => `This sleep pattern preceded **${rand(6,9)} of ${rand(9,12)}** past episodes. AI confidence: **${p}%**`,
  (p: number) => `HRV + activity combination matched **${rand(5,8)} previous crises**. Model confidence: **${p}%**`,
  (p: number) => `Barometric pressure + medication timing pattern seen in **${rand(4,7)} prior incidents**. Confidence: **${p}%**`,
];

const coachGreetings = [
  "I'm here to help you navigate today's alerts. What's on your mind?",
  "Based on the current forecast, I have some personalized suggestions ready. Ask me anything!",
  "You've been doing great — 3 crises prevented this month! How can I help today?",
];

// ─── Vitals Generation ───────────────────────────────────────
function generateVitals() {
  return [
    { label: 'Heart Rate', value: rand(65, 85), unit: 'bpm', icon: '❤️', baseline: 68, trend: rand(0,1) ? 'up' : 'stable' },
    { label: 'HRV', value: rand(28, 58), unit: 'ms', icon: '💗', baseline: 55, trend: 'down' },
    { label: 'Sleep Score', value: rand(30, 75), unit: '/100', icon: '😴', baseline: 70, trend: rand(0,1) ? 'down' : 'stable' },
    { label: 'Steps', value: rand(800, 4500), unit: '', icon: '🚶', baseline: 3200, trend: rand(0,1) ? 'down' : 'up' },
    { label: 'SpO2', value: rand(93, 99), unit: '%', icon: '🫁', baseline: 97, trend: 'stable' },
    { label: 'Resp Rate', value: rand(14, 22), unit: '/min', icon: '🌬️', baseline: 16, trend: rand(0,1) ? 'up' : 'stable' },
  ];
}

// ─── Device Data ───────────────────────────────────────
const deviceCategories = [
  {
    name: 'Wearable Devices',
    subtitle: 'Heart rate, HRV, sleep, steps & more',
    devices: [
      { id: 'apple-watch', name: 'Apple Watch', brand: 'Apple', models: 'Series 4+', icon: '⌚', color: 'from-gray-800 to-gray-900', recommended: true, data: ['Heart rate', 'HRV', 'Sleep', 'Steps', 'SpO2', 'Resp rate'] },
      { id: 'fitbit', name: 'Fitbit', brand: 'Fitbit', models: 'Sense 2, Versa 4, Charge 6', icon: '⌚', color: 'from-teal-500 to-teal-600', popular: true, data: ['Heart rate', 'HRV', 'Sleep stages', 'SpO2', 'Steps'] },
      { id: 'samsung', name: 'Galaxy Watch', brand: 'Samsung', models: 'Watch 4, 5, 6', icon: '⌚', color: 'from-blue-600 to-indigo-700', data: ['Heart rate', 'Stress', 'Sleep', 'SpO2', 'Steps'] },
      { id: 'garmin', name: 'Garmin', brand: 'Garmin', models: 'Venu 3, Forerunner', icon: '⌚', color: 'from-blue-700 to-blue-800', data: ['Heart rate', 'HRV', 'Stress', 'Body Battery', 'Steps'] },
      { id: 'pixel', name: 'Pixel Watch', brand: 'Google', models: 'Pixel Watch, Wear OS 3+', icon: '⌚', color: 'from-green-500 to-green-600', data: ['Heart rate', 'HRV', 'Sleep', 'Steps', 'SpO2'] },
      { id: 'oura', name: 'Oura Ring', brand: 'Oura', models: 'Gen 3', icon: '💍', color: 'from-gray-600 to-gray-700', premium: true, data: ['HRV', 'Sleep', 'Readiness', 'Temperature'] },
    ],
  },
  {
    name: 'GPS Tracking',
    subtitle: 'Location monitoring & geo-fencing',
    devices: [
      { id: 'phone-gps', name: 'Smartphone GPS', brand: 'Built-in', models: 'iPhone / Android', icon: '📱', color: 'from-primary to-accent', recommended: true, data: ['Location', 'Geo-fence', 'Movement patterns'] },
      { id: 'jiobit', name: 'Jiobit', brand: 'Jiobit', models: 'Cellular GPS', icon: '📡', color: 'from-purple-500 to-purple-600', data: ['Cellular GPS', 'Alerts', 'History'] },
      { id: 'angelsense', name: 'AngelSense', brand: 'AngelSense', models: 'Dementia tracker', icon: '👼', color: 'from-pink-500 to-rose-500', data: ['GPS', 'Voice', 'Safe zones'] },
    ],
  },
  {
    name: 'Environmental',
    subtitle: 'Weather & atmospheric data',
    devices: [
      { id: 'weather', name: 'Weather API', brand: 'Auto-collect', models: 'OpenWeatherMap', icon: '🌤️', color: 'from-sky-400 to-blue-500', recommended: true, data: ['Pressure', 'Temperature', 'Humidity'] },
    ],
  },
];

const levelColors = {
  high: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30', dot: 'bg-destructive', gradient: 'from-destructive/15 to-destructive/5' },
  moderate: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30', dot: 'bg-warning', gradient: 'from-warning/15 to-warning/5' },
  low: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30', dot: 'bg-success', gradient: 'from-success/15 to-success/5' },
};

const typeEmoji: Record<string, string> = { agitation: '😤', wandering: '🚶', confusion: '😵', fall: '⚠️' };

export default function CrisisPreventionEngine() {
  const { mode, setMode } = useApp();
  const [activeTab, setActiveTab] = useState<CrisisTab>('forecast');
  const [expandedAlert, setExpandedAlert] = useState<string | null>('1');
  const [chatInput, setChatInput] = useState('');
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);

  // Generate dynamic data on mount (changes per load)
  const alerts = useMemo(() => generateAlerts(), []);
  const vitals = useMemo(() => generateVitals(), []);
  const patternText = useMemo(() => pick(patternDescriptions)(rand(85, 96)), []);

  const [tasks, setTasks] = useState(() => generateActions(alerts));
  const [chatMessages, setChatMessages] = useState(() => [
    { id: '0', sender: 'coach', text: pick(coachGreetings) },
  ]);

  const completedCount = tasks.filter(t => t.done).length;
  const progressPct = Math.round((completedCount / tasks.length) * 100);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const sendCoachMessage = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);
    setChatInput('');

    const topAlert = alerts[0];
    const responses = [
      `Based on the current ${topAlert?.type || 'risk'} alert (${topAlert?.probability || 0}% probability), I'd suggest focusing on the highest-priority action items first. ${topAlert?.level === 'high' ? 'Contact the doctor as a priority — medication adjustments have prevented 70% of similar episodes.' : 'Keep monitoring and maintain routines.'}`,
      `Great question. For ${topAlert?.type || 'this type of'} episodes, research shows that ${pick(['reducing stimulation 2 hours before the predicted window', 'maintaining strict meal times', 'gentle physical activity in the morning', 'familiar music during peak risk hours'])} reduces severity by ${rand(35, 65)}%. You're handling this well! 💙`,
      `I understand your concern. Looking at the data, ${pick(["Robert's HRV pattern suggests building stress", "the sleep disruption is the primary trigger", "the weather change is amplifying other factors"])}. My top recommendation: ${pick(["ensure a calm, dimly-lit environment by 3 PM", "move the afternoon activity to morning when risk is lowest", "have a familiar person present during the high-risk window"])}. You've prevented ${rand(2, 5)} crises this month — amazing work! 💪`,
    ];

    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'coach',
        text: pick(responses),
      }]);
    }, 1200);
  };

  const connectDevice = (deviceId: string) => {
    setConnectingDevice(deviceId);
    setTimeout(() => {
      setConnectedDevices(prev => [...prev, deviceId]);
      setConnectingDevice(null);
    }, 2000);
  };

  const groupedByPriority = [1, 2, 3].map(p => ({
    priority: p,
    label: p === 1 ? '🔥 Medical' : p === 2 ? '🏠 Environment' : '🚨 Safety',
    color: p === 1 ? 'text-destructive' : p === 2 ? 'text-primary' : 'text-warning',
    items: tasks.filter(t => t.priority === p),
  }));

  const alertCount = alerts.length;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center shadow-sm">
            <Shield className="w-5.5 h-5.5 text-destructive" />
          </div>
          <div className="flex-1">
            <h2 className="text-[16px] font-extrabold text-foreground tracking-tight">Crisis Prevention</h2>
            <p className="text-[11px] text-muted-foreground font-semibold">AI monitoring · Updated {rand(1, 15)} min ago</p>
          </div>
          <div className="flex items-center gap-1.5">
            {alertCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground border-0 text-[10px] font-bold px-2 py-0.5 shadow-sm">
                {alertCount} {alertCount === 1 ? 'Alert' : 'Alerts'}
              </Badge>
            )}
          </div>
        </div>

        {/* iOS Segmented Tab Bar */}
        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <div className="flex bg-muted/60 rounded-2xl p-1 gap-1 min-w-max">
            {([
              { id: 'forecast' as CrisisTab, label: 'Forecast', icon: BarChart3 },
              { id: 'gps' as CrisisTab, label: 'GPS', icon: MapPin },
              { id: 'weather' as CrisisTab, label: 'Weather', icon: Cloud },
              { id: 'plan' as CrisisTab, label: 'Plan', icon: Target },
              { id: 'coach' as CrisisTab, label: 'AI Coach', icon: Bot },
              { id: 'devices' as CrisisTab, label: 'Devices', icon: Smartphone },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground/70'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Mode Switcher */}
        <button
          onClick={() => setShowModeSwitcher(!showModeSwitcher)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/40 border border-border/40 mt-1"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            <span className="text-[12px] font-bold text-foreground">Patient View</span>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
            mode === 'full' ? 'bg-primary/10 text-primary' : mode === 'simplified' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
          }`}>
            {mode === 'full' ? 'Independent' : mode === 'simplified' ? 'Guided' : 'Assisted'}
          </span>
        </button>

        <AnimatePresence>
          {showModeSwitcher && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 mt-2">
                {([
                  { key: 'full' as const, label: 'Independent', desc: 'Full features', color: 'border-primary text-primary bg-primary/5' },
                  { key: 'simplified' as const, label: 'Guided', desc: 'Simpler UI', color: 'border-warning text-warning bg-warning/5' },
                  { key: 'essential' as const, label: 'Assisted', desc: 'Minimal', color: 'border-destructive text-destructive bg-destructive/5' },
                ]).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setMode(opt.key); setShowModeSwitcher(false); }}
                    className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                      mode === opt.key ? opt.color : 'border-border/50 text-muted-foreground bg-card'
                    }`}
                  >
                    <div className="text-[13px] font-bold">{opt.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        <AnimatePresence mode="wait">
          {/* ─── FORECAST ─── */}
          {activeTab === 'forecast' && (
            <motion.div key="forecast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 space-y-3">
              {/* Greeting */}
              <Card className="border-0 overflow-hidden shadow-none">
                <div className="bg-gradient-to-br from-primary/8 via-primary/4 to-accent/6 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[12px] font-bold text-primary/80 mb-0.5">🌅 Good Morning, Sarah</p>
                      <p className="text-[18px] font-extrabold text-foreground leading-tight tracking-tight">Crisis Forecast</p>
                      <p className="text-[11px] text-muted-foreground mt-1 font-semibold">48-hour predictive analysis</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-card/80 border border-border/30 shadow-sm">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold text-primary">AI Active</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Risk Alerts */}
              {alerts.map((alert: any) => {
                const colors = levelColors[alert.level as keyof typeof levelColors];
                const isExpanded = expandedAlert === alert.id;
                return (
                  <motion.div key={alert.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className={`border-2 ${colors.border} overflow-hidden shadow-sm`}>
                      <div className={`bg-gradient-to-r ${colors.gradient}`}>
                        <button
                          onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                          className="w-full p-4 flex items-center gap-3 text-left"
                        >
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-[28px]">{typeEmoji[alert.type] || '⚠️'}</span>
                            <div className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge className={`${colors.bg} ${colors.text} border ${colors.border} text-[9px] font-black uppercase px-1.5 py-0 tracking-wider mb-1`}>
                              {alert.level} risk
                            </Badge>
                            <p className="text-[16px] font-extrabold text-foreground capitalize tracking-tight">{alert.type} Risk</p>
                            <p className="text-[12px] text-muted-foreground font-semibold">{alert.timeWindow}</p>
                          </div>
                          {/* Probability Ring */}
                          <div className="relative w-14 h-14 shrink-0">
                            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                              <circle cx="28" cy="28" r="22" fill="none" strokeWidth="5" className="stroke-muted/20" />
                              <circle cx="28" cy="28" r="22" fill="none" strokeWidth="5"
                                strokeDasharray={`${alert.probability * 1.382} 138.2`}
                                className={alert.level === 'high' ? 'stroke-destructive' : alert.level === 'moderate' ? 'stroke-warning' : 'stroke-success'}
                                strokeLinecap="round" />
                            </svg>
                            <span className={`absolute inset-0 flex items-center justify-center text-[14px] font-black ${colors.text}`}>
                              {alert.probability}%
                            </span>
                          </div>
                        </button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-border/50 p-4 space-y-3 bg-card/50">
                              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Contributing Factors</p>
                              {alert.factors.map((f: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
                                  <span className="text-[18px]">{f.icon}</span>
                                  <div className="flex-1">
                                    <p className={`text-[13px] font-bold ${f.severity === 'bad' ? 'text-destructive' : 'text-warning'}`}>{f.label}</p>
                                    <p className="text-[11px] text-muted-foreground font-medium">{f.detail}</p>
                                  </div>
                                  <div className={`w-2 h-2 rounded-full ${f.severity === 'bad' ? 'bg-destructive' : 'bg-warning'}`} />
                                </div>
                              ))}
                              <Button size="sm" className="w-full h-10 rounded-xl text-[13px] font-bold gap-1.5 shadow-sm" onClick={() => setActiveTab('plan')}>
                                <Target className="w-4 h-4" />
                                View Prevention Plan
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}

              {/* Pattern Match */}
              <Card className="border border-border/60 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-[14px] font-extrabold text-foreground">Pattern Match</p>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">
                    {patternText.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={i} className="font-extrabold text-foreground">{part.slice(2, -2)}</strong>
                        : part
                    )}
                  </p>
                  {/* 3-row buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '30-day baseline', color: 'bg-primary/10 text-primary border-primary/20' },
                      { label: 'LightGBM v2.1', color: 'bg-accent/10 text-accent border-accent/20' },
                      { label: 'Trained: 2d ago', color: 'bg-secondary/10 text-secondary border-secondary/20' },
                      { label: `${rand(45, 90)} data points`, color: 'bg-success/10 text-success border-success/20' },
                      { label: `${rand(3, 8)} crisis logs`, color: 'bg-warning/10 text-warning border-warning/20' },
                      { label: 'Auto-updating', color: 'bg-destructive/10 text-destructive border-destructive/20' },
                    ].map(b => (
                      <div key={b.label} className={`${b.color} border rounded-lg px-2 py-1.5 text-center`}>
                        <span className="text-[10px] font-bold">{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Vitals Grid */}
              <p className="text-[13px] font-extrabold text-foreground pt-1 px-0.5">📊 Live Vitals</p>
              <div className="grid grid-cols-3 gap-2">
                {vitals.map((v, idx) => {
                  const isAbove = v.value > v.baseline;
                  const diff = Math.abs(v.value - v.baseline);
                  const critical = diff > v.baseline * 0.2;
                  const rowBg = idx < 3 ? 'bg-gradient-to-br from-card to-muted/20' : 'bg-gradient-to-br from-muted/10 to-card';
                  return (
                    <Card key={v.label} className={`border shadow-sm overflow-hidden ${critical ? 'border-destructive/30' : 'border-border/50'}`}>
                      <CardContent className={`p-3 ${rowBg}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[18px]">{v.icon}</span>
                          {v.trend === 'up' ? <ArrowUp className={`w-3.5 h-3.5 ${critical ? 'text-destructive' : 'text-muted-foreground'}`} /> :
                           v.trend === 'down' ? <ArrowDown className={`w-3.5 h-3.5 ${critical ? 'text-destructive' : 'text-warning'}`} /> :
                           <span className="text-[10px] text-success font-bold">—</span>}
                        </div>
                        <p className="text-[20px] font-black text-foreground leading-none">
                          {v.value.toLocaleString()}
                          <span className="text-[10px] text-muted-foreground ml-0.5 font-semibold">{v.unit}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1.5 truncate">{v.label}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ─── GPS TAB ─── */}
          {activeTab === 'gps' && (
            <motion.div key="gps" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 space-y-3">
              <Card className="border-0 overflow-hidden shadow-none">
                <div className="bg-gradient-to-br from-primary/8 to-accent/6 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-5 h-5 text-primary" />
                    <p className="text-[16px] font-extrabold text-foreground">GPS Tracking</p>
                  </div>
                  <p className="text-[12px] text-muted-foreground font-medium">Real-time location & safe zone monitoring</p>
                </div>
              </Card>

              {/* Live Map */}
              <Card className="border border-border/50 shadow-sm overflow-hidden">
                <div className="rounded-xl overflow-hidden h-44">
                  <iframe
                    title="Patient location map"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=78.45%2C17.37%2C78.52%2C17.41&layer=mapnik&marker=17.385%2C78.4867"
                    className="w-full h-full border-0"
                  />
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                    <span className="text-[13px] font-bold text-foreground">Home — Lakshmi Nagar</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Safe zone: 200m radius · Last updated 2 min ago</p>
                </CardContent>
              </Card>

              {/* Location Timeline */}
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-3">
                  <p className="text-[12px] font-extrabold text-foreground mb-2 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-primary" /> Today's Timeline
                  </p>
                  {[
                    { time: '9:00 AM', place: 'Home', status: 'safe' },
                    { time: '10:15 AM', place: 'Morning Walk — Park', status: 'safe' },
                    { time: '10:45 AM', place: 'Near Temple', status: 'safe' },
                    { time: '11:30 AM', place: 'Back Home', status: 'safe' },
                    { time: '2:00 PM', place: 'Left Home', status: 'alert' },
                    { time: '2:15 PM', place: 'Near Metro Station', status: 'alert' },
                  ].map((entry, i) => (
                    <div key={i} className={`flex items-center gap-3 py-2 ${i % 2 === 0 ? 'bg-muted/20 -mx-3 px-3 rounded-lg' : ''}`}>
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${entry.status === 'safe' ? 'bg-success' : 'bg-destructive'}`} />
                      <span className="text-[12px] font-semibold text-foreground flex-1">{entry.place}</span>
                      <span className="text-[11px] text-muted-foreground">{entry.time}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Safe Zone Config */}
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-3">
                  <p className="text-[12px] font-extrabold text-foreground mb-2">🛡️ Safe Zone Radius</p>
                  <div className="flex gap-2">
                    {[100, 200, 500].map(r => (
                      <button key={r} className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold ${r === 200 ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {r}m
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ─── WEATHER TAB ─── */}
          {activeTab === 'weather' && (
            <motion.div key="weather" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 space-y-3">
              <Card className="border-0 overflow-hidden shadow-none">
                <div className="bg-gradient-to-br from-sky-500/10 to-blue-500/8 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-bold text-primary/80">🌤️ Weather & Atmosphere</p>
                      <p className="text-[18px] font-extrabold text-foreground">Hyderabad</p>
                      <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Environmental factors affecting patient</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[32px] font-black text-foreground leading-none">{rand(28, 34)}°</p>
                      <p className="text-[11px] text-muted-foreground font-semibold">Partly Cloudy</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Atmospheric Readings */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Barometric Pressure', value: `${rand(1008, 1018)} hPa`, icon: '🌡️', alert: true, bg: 'bg-gradient-to-br from-destructive/5 to-card' },
                  { label: 'Humidity', value: `${rand(55, 78)}%`, icon: '💧', alert: false, bg: 'bg-gradient-to-br from-primary/5 to-card' },
                  { label: 'UV Index', value: `${rand(3, 9)}`, icon: '☀️', alert: false, bg: 'bg-gradient-to-br from-warning/5 to-card' },
                  { label: 'Air Quality', value: `${rand(60, 120)} AQI`, icon: '🌬️', alert: rand(0, 1) === 1, bg: 'bg-gradient-to-br from-success/5 to-card' },
                ].map(item => (
                  <Card key={item.label} className={`border shadow-sm ${item.alert ? 'border-destructive/30' : 'border-border/50'}`}>
                    <CardContent className={`p-3 ${item.bg}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[16px]">{item.icon}</span>
                        {item.alert && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                      </div>
                      <p className="text-[18px] font-black text-foreground">{item.value}</p>
                      <p className="text-[10px] text-muted-foreground font-bold mt-1">{item.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pressure Alert */}
              <Card className="border-2 border-warning/30 shadow-sm">
                <CardContent className="p-3 bg-gradient-to-r from-warning/8 to-warning/3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-warning/15 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-4.5 h-4.5 text-warning" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-foreground">Barometric Drop Detected</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        Pressure dropped {rand(5, 12)}mb in 12 hours. This pattern has preceded agitation episodes in {rand(60, 80)}% of past cases.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 5-day Forecast */}
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-3">
                  <p className="text-[12px] font-extrabold text-foreground mb-2">📅 5-Day Outlook</p>
                  {['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                    <div key={day} className={`flex items-center justify-between py-2 ${i % 2 === 0 ? 'bg-muted/20 -mx-3 px-3 rounded-lg' : ''}`}>
                      <span className="text-[12px] font-semibold text-foreground w-16">{day}</span>
                      <span className="text-[14px]">{['🌤️', '🌧️', '☀️', '⛅', '🌦️'][i]}</span>
                      <span className="text-[12px] text-muted-foreground">{rand(26, 35)}°/{rand(20, 26)}°</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${i === 1 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                        {i === 1 ? 'Risk' : 'OK'}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ─── ACTION PLAN ─── */}
          {activeTab === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 space-y-3">
              {/* Progress */}
              <Card className="border-0 overflow-hidden shadow-none">
                <div className="bg-gradient-to-br from-primary/8 to-accent/6 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[16px] font-extrabold text-foreground">Prevention Plan</p>
                      <p className="text-[11px] text-muted-foreground font-semibold">Based on {alerts[0]?.type || 'current'} forecast</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="text-[14px] font-black text-primary">{completedCount}/{tasks.length}</span>
                    </div>
                  </div>
                  <Progress value={progressPct} className="h-2.5 rounded-full" />
                  <p className="text-[11px] text-muted-foreground mt-1.5 font-semibold">
                    {progressPct === 100 ? '🎉 All tasks complete!' : `${progressPct}% complete — keep going!`}
                  </p>
                </div>
              </Card>

              {/* Grouped Tasks */}
              {groupedByPriority.filter(g => g.items.length > 0).map(group => (
                <div key={group.priority}>
                  <div className="flex items-center gap-2 mb-2">
                    <p className={`text-[13px] font-extrabold ${group.color}`}>{group.label}</p>
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="text-[10px] font-bold text-muted-foreground">{group.items.filter(t => t.done).length}/{group.items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((task, i) => (
                      <motion.div key={task.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <Card className={`border shadow-sm transition-all ${task.done ? 'border-success/30 bg-success/5' : 'border-border/50'}`}>
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0">
                                {task.done ? (
                                  <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                                    <Check className="w-3 h-3 text-success-foreground" />
                                  </div>
                                ) : (
                                  <Circle className="w-5 h-5 text-border" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[14px]">{task.emoji}</span>
                                  <p className={`text-[13px] font-bold leading-tight ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                    {task.title}
                                  </p>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug ml-6">{task.description}</p>
                                {task.done && (
                                  <p className="text-[10px] text-success font-bold mt-1 ml-6">✓ Completed</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Ask Coach CTA */}
              <Button variant="outline" className="w-full h-11 rounded-xl text-[13px] font-bold gap-2 border-primary/30 text-primary" onClick={() => setActiveTab('coach')}>
                <Bot className="w-4 h-4" />
                Need help? Ask AI Coach
              </Button>
            </motion.div>
          )}

          {/* ─── AI COACH ─── */}
          {activeTab === 'coach' && (
            <motion.div key="coach" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-3">
                {/* Coach Header */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-primary/8 to-primary/4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[14px] font-extrabold text-foreground">Crisis Coach</p>
                    <p className="text-[11px] text-muted-foreground font-semibold">AI dementia care specialist · Online</p>
                  </div>
                  <div className="ml-auto w-2.5 h-2.5 rounded-full bg-success" />
                </div>

                {/* Alert Context Card */}
                {alerts[0] && (
                  <Card className={`border ${levelColors[alerts[0].level as keyof typeof levelColors]?.border || 'border-border'} shadow-sm`}>
                    <CardContent className="p-3">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Current Context</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[16px]">{typeEmoji[alerts[0].type] || '⚠️'}</span>
                        <div>
                          <p className="text-[12px] font-bold text-foreground capitalize">{alerts[0].level} {alerts[0].type} risk — {alerts[0].probability}%</p>
                          <p className="text-[10px] text-muted-foreground">{alerts[0].timeWindow}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Messages */}
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'coach' && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-auto mb-1">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[82%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-sm'
                        : 'bg-card border border-border/50 rounded-2xl rounded-bl-md shadow-sm'
                    }`}>
                      {msg.text.split('\n').map((line, li) => (
                        <p key={li} className={li > 0 ? 'mt-1.5' : ''}>
                          {line.split(/(\*\*[^*]+\*\*)/).map((part, pi) =>
                            part.startsWith('**') && part.endsWith('**')
                              ? <strong key={pi} className="font-bold">{part.slice(2, -2)}</strong>
                              : part
                          )}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="px-3 pb-3 pt-2 border-t border-border/30 bg-background/80 backdrop-blur-lg">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendCoachMessage()}
                    placeholder="Ask about today's forecast..."
                    className="h-10 rounded-full text-[13px] border-border/50 bg-muted/30 pl-4 font-medium"
                  />
                  <Button size="icon" onClick={sendCoachMessage} className="w-10 h-10 rounded-full shrink-0 shadow-sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── DEVICES ─── */}
          {activeTab === 'devices' && (
            <motion.div key="devices" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 space-y-4">
              {/* Intro */}
              <Card className="border-0 overflow-hidden shadow-none">
                <div className="bg-gradient-to-br from-primary/8 to-accent/6 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <p className="text-[16px] font-extrabold text-foreground">Device Integrations</p>
                  </div>
                  <p className="text-[12px] text-muted-foreground font-medium leading-relaxed">
                    Connect wearables and sensors to enable predictive monitoring. More devices = better predictions.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-success/10 text-success border border-success/20 text-[10px] font-bold">
                      {connectedDevices.length} connected
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">
                      {10 - connectedDevices.length} available
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Device Categories */}
              {deviceCategories.map((cat, ci) => (
                <div key={cat.name}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <p className="text-[13px] font-extrabold text-foreground">{cat.name}</p>
                    <div className="flex-1 h-px bg-border/40" />
                    <p className="text-[10px] text-muted-foreground font-semibold">{cat.subtitle}</p>
                  </div>
                  <div className="space-y-2">
                    {cat.devices.map((device) => {
                      const isConnected = connectedDevices.includes(device.id);
                      const isConnecting = connectingDevice === device.id;
                      return (
                        <motion.div key={device.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                          <Card className={`border shadow-sm transition-all ${isConnected ? 'border-success/30 bg-success/5' : 'border-border/50'}`}>
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${device.color} flex items-center justify-center shrink-0 shadow-sm`}>
                                  <span className="text-[18px]">{device.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-[13px] font-bold text-foreground">{device.name}</p>
                                    {(device as any).recommended && <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black px-1 py-0">★ RECOMMENDED</Badge>}
                                    {(device as any).popular && <Badge className="bg-warning/10 text-warning border-warning/20 text-[8px] font-black px-1 py-0">POPULAR</Badge>}
                                    {(device as any).premium && <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-[8px] font-black px-1 py-0">PREMIUM</Badge>}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground font-semibold">{device.models}</p>
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {device.data.slice(0, 4).map(d => (
                                      <span key={d} className="text-[9px] font-semibold text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">{d}</span>
                                    ))}
                                    {device.data.length > 4 && (
                                      <span className="text-[9px] font-semibold text-primary">+{device.data.length - 4}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  {isConnected ? (
                                    <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-success/10 border border-success/20">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                                      <span className="text-[10px] font-bold text-success">Linked</span>
                                    </div>
                                  ) : isConnecting ? (
                                    <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                                      <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                      <span className="text-[10px] font-bold text-primary">Pairing...</span>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 rounded-lg text-[10px] font-bold px-3 border-primary/30 text-primary"
                                      onClick={() => connectDevice(device.id)}
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Connect
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Setup Guide */}
              <Card className="border border-primary/20 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <p className="text-[13px] font-extrabold text-foreground">Getting Started</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { step: '1', text: 'Connect at least 1 wearable device', done: connectedDevices.some(d => ['apple-watch','fitbit','samsung','garmin','pixel','oura'].includes(d)) },
                      { step: '2', text: 'Enable GPS tracking', done: connectedDevices.includes('phone-gps') },
                      { step: '3', text: 'Weather API auto-connects', done: connectedDevices.includes('weather') },
                      { step: '4', text: '30-day baseline collection begins', done: false },
                    ].map(s => (
                      <div key={s.step} className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                          s.done ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {s.done ? <Check className="w-3.5 h-3.5" /> : s.step}
                        </div>
                        <p className={`text-[12px] font-semibold ${s.done ? 'text-success line-through' : 'text-foreground'}`}>{s.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
