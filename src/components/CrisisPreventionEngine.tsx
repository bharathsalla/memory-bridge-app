import { useState, useMemo } from 'react';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Activity, Heart, Moon, Thermometer,
  MapPin, Cloud, Pill, Brain, TrendingUp, ChevronRight, ChevronDown,
  Check, Phone, Clock, Zap, Eye, Wind, Footprints, MessageCircle,
  Smartphone, Watch, Radio, BarChart3, Target, ArrowUp, ArrowDown,
  CheckCircle2, Circle, X, Send, Bot, Wifi, WifiOff, Plus,
  Bluetooth, Signal, Battery, ChevronLeft, Sparkles, Star, Navigation, History, Settings2,
  BedDouble, Gauge, Waves, Droplets, Sun, CloudRain, CloudSun, CloudDrizzle,
  Ban, Lightbulb, Music, MapPinned, BatteryCharging, SmartphoneNfc,
  Timer, ClipboardCheck, Home, Volume2, CircleDot } from
'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import IconBox, { iosColors, getColor } from '@/components/ui/IconBox';
import type { LucideIcon } from 'lucide-react';

type CrisisTab = 'forecast' | 'plan' | 'coach' | 'devices' | 'gps' | 'weather';

// ─── Dynamic Data Generation ───────────────────────────────────────
function rand(min: number, max: number) {return Math.floor(Math.random() * (max - min + 1)) + min;}
function pick<T>(arr: T[]): T {return arr[rand(0, arr.length - 1)];}

const riskTypes = ['agitation', 'wandering', 'confusion', 'fall'] as const;
const riskLevels = ['high', 'moderate', 'low'] as const;
const timeWindows = [
'Tomorrow 4-7 PM', 'Tomorrow 8-11 AM', 'Tonight 10 PM-2 AM',
'Tomorrow 2-5 PM', 'Tomorrow 6-9 PM', 'Tonight 7-10 PM',
'Tomorrow morning 6-9 AM', 'Tomorrow noon-3 PM'];


const factorPool: {label: string;make: () => {detail: string;severity: 'bad' | 'warning';Icon: LucideIcon;color: string;};}[] = [
{ label: 'Sleep Quality', make: () => ({ detail: `${rand(3, 6)} wake-ups (baseline: 1-2)`, severity: 'bad', Icon: Moon, color: iosColors.purple }) },
{ label: 'Deep Sleep', make: () => ({ detail: `Only ${rand(12, 22)}% deep sleep (usual: 35%)`, severity: 'bad', Icon: BedDouble, color: iosColors.blue }) },
{ label: 'HRV Stress', make: () => ({ detail: `HRV ${rand(25, 40)}ms (baseline: 55ms)`, severity: 'bad', Icon: Heart, color: iosColors.red }) },
{ label: 'Resting HR', make: () => ({ detail: `${rand(74, 85)} bpm (baseline: 68 bpm)`, severity: 'bad', Icon: Activity, color: iosColors.red }) },
{ label: 'Barometric Drop', make: () => ({ detail: `Dropped ${rand(5, 12)}mb in 12 hours`, severity: 'warning', Icon: Cloud, color: iosColors.teal }) },
{ label: 'Pacing Episodes', make: () => ({ detail: `${rand(2, 5)} pacing episodes detected`, severity: 'warning', Icon: Footprints, color: iosColors.orange }) },
{ label: 'Medication Missed', make: () => ({ detail: `${pick(['Morning', 'Afternoon', 'Evening'])} dose ${rand(1, 3)}h late`, severity: 'bad', Icon: Pill, color: iosColors.yellow }) },
{ label: 'Activity Drop', make: () => ({ detail: `${rand(30, 55)}% less active than usual`, severity: 'warning', Icon: TrendingUp, color: iosColors.green }) },
{ label: 'SpO2 Dip', make: () => ({ detail: `Blood oxygen ${rand(91, 94)}% (usual: 97%)`, severity: 'bad', Icon: Wind, color: iosColors.teal }) },
{ label: 'Temperature', make: () => ({ detail: `Room temp ${rand(28, 33)}°C (comfort: 22-25°C)`, severity: 'warning', Icon: Thermometer, color: iosColors.orange }) }];


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
    const factors = shuffled.slice(0, rand(2, 4)).map((f) => ({ label: f.label, ...f.make() }));
    alerts.push({ id: String(i + 1), type, level, probability: prob, timeWindow: pick(timeWindows), factors });
  }
  return alerts;
}

const actionTemplates: Record<string, {priority: number;title: string;desc: () => string;Icon: LucideIcon;color: string;}[]> = {
  high: [
  { priority: 1, title: 'Contact Doctor', desc: () => `Review ${pick(['morning', 'afternoon', 'evening'])} medication timing`, Icon: Phone, color: iosColors.red },
  { priority: 1, title: 'Adjust Medication', desc: () => `Move ${pick(['Donepezil', 'Memantine', 'Risperidone'])} ${rand(1, 3)}h earlier`, Icon: Pill, color: iosColors.orange },
  { priority: 2, title: 'Cancel Group Activity', desc: () => `Too many visitors increases risk by ${rand(40, 70)}%`, Icon: Ban, color: iosColors.purple },
  { priority: 2, title: 'Dim Lights Early', desc: () => `Start at ${rand(2, 4)}:30 PM — reduces sensory overload`, Icon: Lightbulb, color: iosColors.yellow },
  { priority: 2, title: 'Play Calming Music', desc: () => `${pick(['Jazz', 'Classical', 'Nature sounds', 'Ambient'])} playlist at ${rand(3, 5)} PM`, Icon: Music, color: iosColors.teal },
  { priority: 3, title: 'Activate Geo-fence', desc: () => `Set ${rand(100, 300)}m radius around home`, Icon: MapPinned, color: iosColors.green },
  { priority: 3, title: 'Charge GPS Tracker', desc: () => `Current: ${rand(30, 70)}% — needs 100% for overnight`, Icon: BatteryCharging, color: iosColors.blue },
  { priority: 3, title: 'Alert Backup Caregiver', desc: () => `Notify ${pick(['John', 'Mary', 'David', 'Lisa'])} about risk`, Icon: SmartphoneNfc, color: iosColors.purple }],

  moderate: [
  { priority: 1, title: 'Monitor Sleep Tonight', desc: () => `Watch for ${rand(2, 4)}+ wake-ups as escalation signal`, Icon: Moon, color: iosColors.purple },
  { priority: 2, title: 'Keep Routine Strict', desc: () => `Meals, walks, nap at exact scheduled times`, Icon: Timer, color: iosColors.orange },
  { priority: 2, title: 'Prepare Calm Space', desc: () => `Set up quiet room with familiar items`, Icon: Home, color: iosColors.teal },
  { priority: 3, title: 'Check Device Sync', desc: () => `Ensure wearable is transmitting — last sync ${rand(5, 45)} min ago`, Icon: Watch, color: iosColors.blue }],

  low: [
  { priority: 2, title: 'Continue Monitoring', desc: () => `All indicators within normal range`, Icon: CheckCircle2, color: iosColors.green },
  { priority: 3, title: 'Log Activities', desc: () => `Record today's mood and engagement`, Icon: ClipboardCheck, color: iosColors.blue }]

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
    Icon: t.Icon,
    iconColor: t.color,
    done: i < rand(0, 2)
  }));
}

const patternDescriptions = [
(p: number) => `This sleep pattern preceded **${rand(6, 9)} of ${rand(9, 12)}** past episodes. AI confidence: **${p}%**`,
(p: number) => `HRV + activity combination matched **${rand(5, 8)} previous crises**. Model confidence: **${p}%**`,
(p: number) => `Barometric pressure + medication timing pattern seen in **${rand(4, 7)} prior incidents**. Confidence: **${p}%**`];


const coachGreetings = [
"I'm here to help you navigate today's alerts. What's on your mind?",
"Based on the current forecast, I have some personalized suggestions ready. Ask me anything!",
"You've been doing great — 3 crises prevented this month! How can I help today?"];


// ─── Vitals Generation ───────────────────────────────────────
function generateVitals() {
  return [
  { label: 'Heart Rate', value: rand(65, 85), unit: 'bpm', Icon: Heart, color: iosColors.red, baseline: 68, trend: rand(0, 1) ? 'up' : 'stable' },
  { label: 'HRV', value: rand(28, 58), unit: 'ms', Icon: Activity, color: iosColors.purple, baseline: 55, trend: 'down' },
  { label: 'Sleep Score', value: rand(30, 75), unit: '/100', Icon: Moon, color: iosColors.blue, baseline: 70, trend: rand(0, 1) ? 'down' : 'stable' },
  { label: 'Steps', value: rand(800, 4500), unit: '', Icon: Footprints, color: iosColors.green, baseline: 3200, trend: rand(0, 1) ? 'down' : 'up' },
  { label: 'SpO2', value: rand(93, 99), unit: '%', Icon: Wind, color: iosColors.teal, baseline: 97, trend: 'stable' },
  { label: 'Resp Rate', value: rand(14, 22), unit: '/min', Icon: Waves, color: iosColors.orange, baseline: 16, trend: rand(0, 1) ? 'up' : 'stable' }];

}

// ─── Device Data ───────────────────────────────────────
const deviceCategories = [
{
  name: 'Wearable Devices',
  subtitle: 'Heart rate, HRV, sleep, steps & more',
  devices: [
  { id: 'apple-watch', name: 'Apple Watch', brand: 'Apple', models: 'Series 4+', Icon: Watch, color: iosColors.blue, recommended: true, data: ['Heart rate', 'HRV', 'Sleep', 'Steps', 'SpO2', 'Resp rate'] },
  { id: 'fitbit', name: 'Fitbit', brand: 'Fitbit', models: 'Sense 2, Versa 4, Charge 6', Icon: Watch, color: iosColors.teal, popular: true, data: ['Heart rate', 'HRV', 'Sleep stages', 'SpO2', 'Steps'] },
  { id: 'samsung', name: 'Galaxy Watch', brand: 'Samsung', models: 'Watch 4, 5, 6', Icon: Watch, color: iosColors.blue, data: ['Heart rate', 'Stress', 'Sleep', 'SpO2', 'Steps'] },
  { id: 'garmin', name: 'Garmin', brand: 'Garmin', models: 'Venu 3, Forerunner', Icon: Watch, color: iosColors.blue, data: ['Heart rate', 'HRV', 'Stress', 'Body Battery', 'Steps'] },
  { id: 'pixel', name: 'Pixel Watch', brand: 'Google', models: 'Pixel Watch, Wear OS 3+', Icon: Watch, color: iosColors.green, data: ['Heart rate', 'HRV', 'Sleep', 'Steps', 'SpO2'] },
  { id: 'oura', name: 'Oura Ring', brand: 'Oura', models: 'Gen 3', Icon: CircleDot, color: iosColors.purple, premium: true, data: ['HRV', 'Sleep', 'Readiness', 'Temperature'] }]

},
{
  name: 'GPS Tracking',
  subtitle: 'Location monitoring & geo-fencing',
  devices: [
  { id: 'phone-gps', name: 'Smartphone GPS', brand: 'Built-in', models: 'iPhone / Android', Icon: Smartphone, color: iosColors.green, recommended: true, data: ['Location', 'Geo-fence', 'Movement patterns'] },
  { id: 'jiobit', name: 'Jiobit', brand: 'Jiobit', models: 'Cellular GPS', Icon: Radio, color: iosColors.purple, data: ['Cellular GPS', 'Alerts', 'History'] },
  { id: 'angelsense', name: 'AngelSense', brand: 'AngelSense', models: 'Dementia tracker', Icon: Shield, color: iosColors.red, data: ['GPS', 'Voice', 'Safe zones'] }]

},
{
  name: 'Environmental',
  subtitle: 'Weather & atmospheric data',
  devices: [
  { id: 'weather', name: 'Weather API', brand: 'Auto-collect', models: 'OpenWeatherMap', Icon: Cloud, color: iosColors.teal, recommended: true, data: ['Pressure', 'Temperature', 'Humidity'] }]

}];


const levelColors = {
  high: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30', dot: 'bg-destructive', gradient: 'from-destructive/15 to-destructive/5' },
  moderate: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30', dot: 'bg-warning', gradient: 'from-warning/15 to-warning/5' },
  low: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30', dot: 'bg-success', gradient: 'from-success/15 to-success/5' }
};

const typeIcons: Record<string, {Icon: LucideIcon;color: string;}> = {
  agitation: { Icon: Zap, color: iosColors.red },
  wandering: { Icon: Footprints, color: iosColors.orange },
  confusion: { Icon: Brain, color: iosColors.purple },
  fall: { Icon: AlertTriangle, color: iosColors.yellow }
};

export default function CrisisPreventionEngine() {
  const { mode, setMode } = useApp();
  const [activeTab, setActiveTab] = useState<CrisisTab>('forecast');
  const [expandedAlert, setExpandedAlert] = useState<string | null>('1');
  const [chatInput, setChatInput] = useState('');
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);

  const alerts = useMemo(() => generateAlerts(), []);
  const vitals = useMemo(() => generateVitals(), []);
  const patternText = useMemo(() => pick(patternDescriptions)(rand(85, 96)), []);

  const [tasks, setTasks] = useState(() => generateActions(alerts));
  const [chatMessages, setChatMessages] = useState(() => [
  { id: '0', sender: 'coach', text: pick(coachGreetings) }]
  );

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPct = Math.round(completedCount / tasks.length * 100);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };

  const sendCoachMessage = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);
    setChatInput('');

    const topAlert = alerts[0];
    const responses = [
    `Based on the current ${topAlert?.type || 'risk'} alert (${topAlert?.probability || 0}% probability), I'd suggest focusing on the highest-priority action items first. ${topAlert?.level === 'high' ? 'Contact the doctor as a priority — medication adjustments have prevented 70% of similar episodes.' : 'Keep monitoring and maintain routines.'}`,
    `Great question. For ${topAlert?.type || 'this type of'} episodes, research shows that ${pick(['reducing stimulation 2 hours before the predicted window', 'maintaining strict meal times', 'gentle physical activity in the morning', 'familiar music during peak risk hours'])} reduces severity by ${rand(35, 65)}%. You're handling this well!`,
    `I understand your concern. Looking at the data, ${pick(["Robert's HRV pattern suggests building stress", "the sleep disruption is the primary trigger", "the weather change is amplifying other factors"])}. My top recommendation: ${pick(["ensure a calm, dimly-lit environment by 3 PM", "move the afternoon activity to morning when risk is lowest", "have a familiar person present during the high-risk window"])}. You've prevented ${rand(2, 5)} crises this month — amazing work!`];


    setTimeout(() => {
      setChatMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'coach',
        text: pick(responses)
      }]);
    }, 1200);
  };

  const connectDevice = (deviceId: string) => {
    setConnectingDevice(deviceId);
    setTimeout(() => {
      setConnectedDevices((prev) => [...prev, deviceId]);
      setConnectingDevice(null);
    }, 2000);
  };

  const priorityLabels: Record<number, {label: string;Icon: LucideIcon;color: string;}> = {
    1: { label: 'Medical', Icon: Phone, color: iosColors.red },
    2: { label: 'Environment', Icon: Home, color: iosColors.green },
    3: { label: 'Safety', Icon: AlertTriangle, color: iosColors.orange }
  };

  const groupedByPriority = [1, 2, 3].map((p) => ({
    priority: p,
    label: priorityLabels[p].label,
    Icon: priorityLabels[p].Icon,
    iconColor: priorityLabels[p].color,
    color: p === 1 ? 'text-destructive' : p === 2 ? 'text-primary' : 'text-warning',
    items: tasks.filter((t) => t.priority === p)
  }));

  const alertCount = alerts.length;

  // Weather icons for 5-day
  const weatherDayIcons: LucideIcon[] = [Sun, CloudRain, Sun, CloudSun, CloudDrizzle];

  return (
    <div className="h-full flex flex-col ios-grouped-bg">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <IconBox Icon={Shield} color={iosColors.red} />
          <div className="flex-1">
            <h2 className="text-[16px] font-extrabold text-foreground tracking-tight">Crisis Prevention</h2>
            <p className="text-[11px] text-muted-foreground font-semibold">AI monitoring · Updated {rand(1, 15)} min ago</p>
          </div>
          <div className="flex items-center gap-1.5">
            {alertCount > 0 &&
            <Badge className="bg-destructive text-destructive-foreground border-0 text-[10px] font-bold px-2 py-0.5 shadow-sm">
                {alertCount} {alertCount === 1 ? 'Alert' : 'Alerts'}
              </Badge>
            }
          </div>
        </div>

        {/* iOS Segmented Tab Bar */}
        <div className="pb-1">
          <SegmentedControl
            value={activeTab}
            onChange={(v) => setActiveTab(v as CrisisTab)}
            scrollable
            items={[
            { value: 'forecast', icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Forecast' },
            { value: 'gps', icon: <MapPin className="w-3.5 h-3.5" />, label: 'GPS' },
            { value: 'weather', icon: <Cloud className="w-3.5 h-3.5" />, label: 'Weather' },
            { value: 'plan', icon: <Target className="w-3.5 h-3.5" />, label: 'Plan' },
            { value: 'coach', icon: <Bot className="w-3.5 h-3.5" />, label: 'AI Coach' },
            { value: 'devices', icon: <Smartphone className="w-3.5 h-3.5" />, label: 'Devices' }]
            } />

        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        <AnimatePresence mode="wait">
          {/* ─── FORECAST ─── */}
          {activeTab === 'forecast' &&
          <motion.div key="forecast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 space-y-3">
              {/* Greeting */}
              <Card className="border-0 overflow-hidden shadow-none">
                <div className="bg-muted/30 p-4">
                  













                </div>
              </Card>

              {/* Risk Alerts */}
              {alerts.map((alert: any) => {
              const colors = levelColors[alert.level as keyof typeof levelColors];
              const isExpanded = expandedAlert === alert.id;
              const typeIcon = typeIcons[alert.type] || typeIcons.fall;
              return (
                <motion.div key={alert.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className={`border-2 ${colors.border} overflow-hidden shadow-sm`}>
                      <div className={`bg-muted/20`}>
                        <button
                        onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                        className="w-full p-4 flex items-center gap-3 text-left">

                          <div className="flex flex-col items-center gap-1.5">
                            <IconBox Icon={typeIcon.Icon} color={typeIcon.color} size={36} iconSize={18} />
                            <div className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge className={`${colors.bg} ${colors.text} border ${colors.border} text-[9px] font-black uppercase px-1.5 py-0 tracking-wider mb-1`}>
                              {alert.level} risk
                            </Badge>
                            <p className="text-[16px] font-extrabold text-foreground capitalize tracking-tight">{alert.type} Risk</p>
                            <p className="text-[12px] text-muted-foreground font-semibold">{alert.timeWindow}</p>
                          </div>
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
                        {isExpanded &&
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">

                            <div className="border-t border-border/50 p-4 space-y-3 bg-card/50">
                              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Contributing Factors</p>
                              {alert.factors.map((f: any, i: number) =>
                          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
                                  <IconBox Icon={f.Icon} color={f.color} size={36} iconSize={18} />
                                  <div className="flex-1">
                                    <p className={`text-[13px] font-bold ${f.severity === 'bad' ? 'text-destructive' : 'text-warning'}`}>{f.label}</p>
                                    <p className="text-[11px] text-muted-foreground font-medium">{f.detail}</p>
                                  </div>
                                  <div className={`w-2 h-2 rounded-full ${f.severity === 'bad' ? 'bg-destructive' : 'bg-warning'}`} />
                                </div>
                          )}
                              <Button size="sm" className="w-full h-10 rounded-xl text-[13px] font-bold gap-1.5 shadow-sm" onClick={() => setActiveTab('plan')}>
                                <Target className="w-4 h-4" />
                                View Prevention Plan
                              </Button>
                            </div>
                          </motion.div>
                      }
                      </AnimatePresence>
                    </Card>
                  </motion.div>);

            })}

              {/* Pattern Match */}
              <Card className="border border-border/60 shadow-sm overflow-hidden">
                <div className="bg-muted/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconBox Icon={Brain} color={iosColors.purple} size={32} iconSize={16} />
                    <p className="text-[14px] font-extrabold text-foreground">Pattern Match</p>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">
                    {patternText.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                  part.startsWith('**') && part.endsWith('**') ?
                  <strong key={i} className="font-extrabold text-foreground">{part.slice(2, -2)}</strong> :
                  part
                  )}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                  { label: '30-day baseline', color: 'bg-primary/10 text-primary border-primary/20' },
                  { label: 'LightGBM v2.1', color: 'bg-accent/10 text-accent border-accent/20' },
                  { label: 'Trained: 2d ago', color: 'bg-secondary/10 text-secondary border-secondary/20' },
                  { label: `${rand(45, 90)} data points`, color: 'bg-success/10 text-success border-success/20' },
                  { label: `${rand(3, 8)} crisis logs`, color: 'bg-warning/10 text-warning border-warning/20' },
                  { label: 'Auto-updating', color: 'bg-destructive/10 text-destructive border-destructive/20' }].
                  map((b) =>
                  <div key={b.label} className={`${b.color} border rounded-lg px-2 py-1.5 text-center`}>
                        <span className="text-[10px] font-bold">{b.label}</span>
                      </div>
                  )}
                  </div>
                </div>
              </Card>

              {/* Vitals Grid */}
              <div className="flex items-center gap-2 pt-1 px-0.5">
                <IconBox Icon={BarChart3} color={iosColors.blue} size={28} iconSize={14} />
                <p className="text-[13px] font-extrabold text-foreground">Live Vitals</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {vitals.map((v) => {
                const diff = Math.abs(v.value - v.baseline);
                const critical = diff > v.baseline * 0.2;
                return (
                  <Card key={v.label} className={`border shadow-sm overflow-hidden ${critical ? 'border-destructive/30' : 'border-border/50'}`}>
                      <CardContent className="p-3 bg-card">
                        <div className="flex items-center justify-between mb-1.5">
                          <IconBox Icon={v.Icon} color={v.color} size={28} iconSize={14} />
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
                    </Card>);

              })}
              </div>
            </motion.div>
          }

          {/* ─── GPS TAB ─── */}
          {activeTab === 'gps' &&
          <motion.div key="gps" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 space-y-3">
              <Card className="border-0 overflow-hidden shadow-none">
                <div className="bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-5 h-5 text-primary" />
                    <p className="text-[16px] font-extrabold text-foreground">GPS Tracking</p>
                  </div>
                  <p className="text-[12px] text-muted-foreground font-medium">Real-time location & safe zone monitoring</p>
                </div>
              </Card>

              <Card className="border border-border/50 shadow-sm overflow-hidden">
                <div className="rounded-xl overflow-hidden h-44">
                  <iframe
                  title="Patient location map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=78.45%2C17.37%2C78.52%2C17.41&layer=mapnik&marker=17.385%2C78.4867"
                  className="w-full h-full border-0" />

                </div>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                    <span className="text-[13px] font-bold text-foreground">Home — Lakshmi Nagar</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Safe zone: 200m radius · Last updated 2 min ago</p>
                </CardContent>
              </Card>

              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <IconBox Icon={History} color={iosColors.blue} size={28} iconSize={14} />
                    <p className="text-[12px] font-extrabold text-foreground">Today's Timeline</p>
                  </div>
                  {[
                { time: '9:00 AM', place: 'Home', status: 'safe' },
                { time: '10:15 AM', place: 'Morning Walk — Park', status: 'safe' },
                { time: '10:45 AM', place: 'Near Temple', status: 'safe' },
                { time: '11:30 AM', place: 'Back Home', status: 'safe' },
                { time: '2:00 PM', place: 'Left Home', status: 'alert' },
                { time: '2:15 PM', place: 'Near Metro Station', status: 'alert' }].
                map((entry, i) =>
                <div key={i} className={`flex items-center gap-3 py-2 ${i % 2 === 0 ? 'bg-muted/20 -mx-3 px-3 rounded-lg' : ''}`}>
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${entry.status === 'safe' ? 'bg-success' : 'bg-destructive'}`} />
                      <span className="text-[12px] font-semibold text-foreground flex-1">{entry.place}</span>
                      <span className="text-[11px] text-muted-foreground">{entry.time}</span>
                    </div>
                )}
                </CardContent>
              </Card>

              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <IconBox Icon={Shield} color={iosColors.teal} size={28} iconSize={14} />
                    <p className="text-[12px] font-extrabold text-foreground">Safe Zone Radius</p>
                  </div>
                  <div className="flex gap-2">
                    {[100, 200, 500].map((r) =>
                  <button key={r} className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold ${r === 200 ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {r}m
                      </button>
                  )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          }

          {/* ─── WEATHER TAB ─── */}
          {activeTab === 'weather' &&
          <motion.div key="weather" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 space-y-3">
              <Card className="border-0 overflow-hidden shadow-none">
                <div className="bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <IconBox Icon={CloudSun} color={iosColors.teal} size={28} iconSize={14} />
                        <p className="text-[12px] font-bold text-primary/80">Weather & Atmosphere</p>
                      </div>
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
              { label: 'Barometric Pressure', value: `${rand(1008, 1018)} hPa`, Icon: Gauge, color: iosColors.red, alert: true },
              { label: 'Humidity', value: `${rand(55, 78)}%`, Icon: Droplets, color: iosColors.blue, alert: false },
              { label: 'UV Index', value: `${rand(3, 9)}`, Icon: Sun, color: iosColors.orange, alert: false },
              { label: 'Air Quality', value: `${rand(60, 120)} AQI`, Icon: Wind, color: iosColors.green, alert: rand(0, 1) === 1 }].
              map((item) =>
              <Card key={item.label} className={`border shadow-sm ${item.alert ? 'border-destructive/30' : 'border-border/50'}`}>
                    <CardContent className="p-3 bg-card">
                      <div className="flex items-center justify-between mb-1">
                        <IconBox Icon={item.Icon} color={item.color} size={28} iconSize={14} />
                        {item.alert && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                      </div>
                      <p className="text-[18px] font-black text-foreground">{item.value}</p>
                      <p className="text-[10px] text-muted-foreground font-bold mt-1">{item.label}</p>
                    </CardContent>
                  </Card>
              )}
              </div>

              {/* Pressure Alert */}
              <Card className="border-2 border-warning/30 shadow-sm">
                <CardContent className="p-3 bg-warning/5">
                  <div className="flex items-start gap-3">
                    <IconBox Icon={AlertTriangle} color={iosColors.orange} size={36} iconSize={18} />
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
                  <div className="flex items-center gap-2 mb-2">
                    <IconBox Icon={Clock} color={iosColors.blue} size={28} iconSize={14} />
                    <p className="text-[12px] font-extrabold text-foreground">5-Day Outlook</p>
                  </div>
                  {['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri'].map((day, i) => {
                  const DayIcon = weatherDayIcons[i];
                  return (
                    <div key={day} className={`flex items-center justify-between py-2 ${i % 2 === 0 ? 'bg-muted/20 -mx-3 px-3 rounded-lg' : ''}`}>
                        <span className="text-[12px] font-semibold text-foreground w-16">{day}</span>
                        <DayIcon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-[12px] text-muted-foreground">{rand(26, 35)}°/{rand(20, 26)}°</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${i === 1 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                          {i === 1 ? 'Risk' : 'OK'}
                        </span>
                      </div>);

                })}
                </CardContent>
              </Card>
            </motion.div>
          }

          {/* ─── ACTION PLAN ─── */}
          {activeTab === 'plan' &&
          <motion.div key="plan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 space-y-3">
              <Card className="border-0 overflow-hidden shadow-none">
                <div className="bg-muted/30 p-4">
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
                    {progressPct === 100 ? 'All tasks complete!' : `${progressPct}% complete — keep going!`}
                  </p>
                </div>
              </Card>

              {groupedByPriority.filter((g) => g.items.length > 0).map((group) =>
            <div key={group.priority}>
                  <div className="flex items-center gap-2 mb-2">
                    <IconBox Icon={group.Icon} color={group.iconColor} size={24} iconSize={12} />
                    <p className={`text-[13px] font-extrabold ${group.color}`}>{group.label}</p>
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="text-[10px] font-bold text-muted-foreground">{group.items.filter((t) => t.done).length}/{group.items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((task, i) =>
                <motion.div key={task.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <Card className={`border shadow-sm transition-all ${task.done ? 'border-success/30 bg-success/5' : 'border-border/50'}`}>
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0">
                                {task.done ?
                          <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                                    <Check className="w-3 h-3 text-success-foreground" />
                                  </div> :

                          <Circle className="w-5 h-5 text-border" />
                          }
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <IconBox Icon={task.Icon} color={task.iconColor} size={24} iconSize={12} />
                                  <p className={`text-[13px] font-bold leading-tight ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                    {task.title}
                                  </p>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug ml-8">{task.description}</p>
                                {task.done &&
                          <div className="flex items-center gap-1 mt-1 ml-8">
                                    <Check className="w-3 h-3 text-success" />
                                    <p className="text-[10px] text-success font-bold">Completed</p>
                                  </div>
                          }
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                )}
                  </div>
                </div>
            )}

              <Button variant="outline" className="w-full h-11 rounded-xl text-[13px] font-bold gap-2 border-primary/30 text-primary" onClick={() => setActiveTab('coach')}>
                <Bot className="w-4 h-4" />
                Need help? Ask AI Coach
              </Button>
            </motion.div>
          }

          {/* ─── AI COACH ─── */}
          {activeTab === 'coach' &&
          <motion.div key="coach" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30">
                  <IconBox Icon={Bot} color={iosColors.blue} />
                  <div>
                    <p className="text-[14px] font-extrabold text-foreground">Crisis Coach</p>
                    <p className="text-[11px] text-muted-foreground font-semibold">AI dementia care specialist · Online</p>
                  </div>
                  <div className="ml-auto w-2.5 h-2.5 rounded-full bg-success" />
                </div>

                {alerts[0] &&
              <Card className={`border ${levelColors[alerts[0].level as keyof typeof levelColors]?.border || 'border-border'} shadow-sm`}>
                    <CardContent className="p-3">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Current Context</p>
                      <div className="flex items-center gap-2">
                        <IconBox Icon={(typeIcons[alerts[0].type] || typeIcons.fall).Icon} color={(typeIcons[alerts[0].type] || typeIcons.fall).color} size={32} iconSize={16} />
                        <div>
                          <p className="text-[12px] font-bold text-foreground capitalize">{alerts[0].level} {alerts[0].type} risk — {alerts[0].probability}%</p>
                          <p className="text-[10px] text-muted-foreground">{alerts[0].timeWindow}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              }

                {chatMessages.map((msg, i) =>
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>

                    {msg.sender === 'coach' &&
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-auto mb-1">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                }
                    <div className={`max-w-[82%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                msg.sender === 'user' ?
                'bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-sm' :
                'bg-card border border-border/50 rounded-2xl rounded-bl-md shadow-sm'}`
                }>
                      {msg.text.split('\n').map((line, li) =>
                  <p key={li} className={li > 0 ? 'mt-1.5' : ''}>
                          {line.split(/(\*\*[^*]+\*\*)/).map((part, pi) =>
                    part.startsWith('**') && part.endsWith('**') ?
                    <strong key={pi} className="font-bold">{part.slice(2, -2)}</strong> :
                    part
                    )}
                        </p>
                  )}
                    </div>
                  </motion.div>
              )}
              </div>

              <div className="px-3 pb-3 pt-2 border-t border-border/30 bg-background/80 backdrop-blur-lg">
                <div className="flex gap-2">
                  <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendCoachMessage()}
                  placeholder="Ask about today's forecast..."
                  className="h-10 rounded-full text-[13px] border-border/50 bg-muted/30 pl-4 font-medium" />

                  <Button size="icon" onClick={sendCoachMessage} className="w-10 h-10 rounded-full shrink-0 shadow-sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          }

          {/* ─── DEVICES ─── */}
          {activeTab === 'devices' &&
          <motion.div key="devices" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 space-y-4">
              <Card className="border-0 overflow-hidden shadow-none">
                <div className="bg-muted/30 p-4">
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

              {deviceCategories.map((cat) =>
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
                                <IconBox Icon={device.Icon} color={device.color} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-[13px] font-bold text-foreground">{device.name}</p>
                                    {(device as any).recommended && <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black px-1 py-0">RECOMMENDED</Badge>}
                                    {(device as any).popular && <Badge className="bg-warning/10 text-warning border-warning/20 text-[8px] font-black px-1 py-0">POPULAR</Badge>}
                                    {(device as any).premium && <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-[8px] font-black px-1 py-0">PREMIUM</Badge>}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground font-semibold">{device.models}</p>
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {device.data.slice(0, 4).map((d) =>
                                <span key={d} className="text-[9px] font-semibold text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">{d}</span>
                                )}
                                    {device.data.length > 4 &&
                                <span className="text-[9px] font-semibold text-primary">+{device.data.length - 4}</span>
                                }
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  {isConnected ?
                              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-success/10 border border-success/20">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                                      <span className="text-[10px] font-bold text-success">Linked</span>
                                    </div> :
                              isConnecting ?
                              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                                      <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                      <span className="text-[10px] font-bold text-primary">Pairing...</span>
                                    </div> :

                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-lg text-[10px] font-bold px-3 border-primary/30 text-primary"
                                onClick={() => connectDevice(device.id)}>

                                      <Plus className="w-3 h-3 mr-1" />
                                      Connect
                                    </Button>
                              }
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>);

                })}
                  </div>
                </div>
            )}

              <Card className="border border-primary/20 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <p className="text-[13px] font-extrabold text-foreground">Getting Started</p>
                  </div>
                  <div className="space-y-2">
                    {[
                  { step: '1', text: 'Connect at least 1 wearable device', done: connectedDevices.some((d) => ['apple-watch', 'fitbit', 'samsung', 'garmin', 'pixel', 'oura'].includes(d)) },
                  { step: '2', text: 'Enable GPS tracking', done: connectedDevices.includes('phone-gps') },
                  { step: '3', text: 'Weather data auto-connects', done: connectedDevices.includes('weather') || true }].
                  map((item) =>
                  <div key={item.step} className={`flex items-center gap-3 p-2.5 rounded-xl ${item.done ? 'bg-success/5' : 'bg-muted/30'}`}>
                        {item.done ?
                    <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-success-foreground" />
                          </div> :

                    <div className="w-5 h-5 rounded-full border-2 border-border shrink-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-muted-foreground">{item.step}</span>
                          </div>
                    }
                        <span className={`text-[12px] font-semibold ${item.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{item.text}</span>
                      </div>
                  )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}