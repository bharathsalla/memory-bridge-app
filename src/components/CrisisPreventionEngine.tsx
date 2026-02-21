import { useState, useMemo, useCallback, useEffect } from 'react';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Activity, Heart, Moon, Thermometer,
  MapPin, Cloud, Pill, Brain, TrendingUp, TrendingDown, ChevronRight, ChevronDown,
  Check, Phone, Clock, Zap, Eye, Wind, Footprints, MessageCircle,
  Watch, BarChart3, Target, ArrowUp, ArrowDown,
  CheckCircle2, X, Send, Bot, BluetoothOff,
  Cpu, Lightbulb, Music, MapPinned, BatteryCharging, SmartphoneNfc,
  Timer, ClipboardCheck, Home, Award, Users, Layers, ExternalLink,
  Ban, Volume2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import IconBox, { iosColors } from '@/components/ui/IconBox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { LucideIcon } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend,
  ResponsiveContainer
} from 'recharts';

// ─── Types ───
type CrisisTab = 'dashboard' | 'vitals' | 'forecast' | 'plan' | 'caregiver' | 'designspec';

// ─── Helpers ───
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[rand(0, arr.length - 1)]; }

// ─── Chart colors (HSL from design tokens, used as hex for Recharts) ───
const chartHex = {
  red: '#ef4444', orange: '#f59e0b', green: '#22c55e', blue: '#3b82f6',
  purple: '#a855f7', indigo: '#6366f1', teal: '#14b8a6', gray: '#8e8e93',
};

// ─── Data generators ───
function generateDashboardData() {
  const agitationRisk = rand(60, 95);
  const wanderingRisk = rand(35, 75);
  return {
    agitationRisk,
    wanderingRisk,
    agitationLevel: agitationRisk > 75 ? 'high' : agitationRisk > 50 ? 'moderate' : 'low',
    wanderingLevel: wanderingRisk > 75 ? 'high' : wanderingRisk > 50 ? 'moderate' : 'low',
    agitationWindow: pick(['Tomorrow 4–7 PM', 'Tomorrow 2–5 PM', 'Tonight 8–11 PM', 'Tomorrow 6–9 PM']),
    wanderingWindow: pick(['Tonight 10 PM–2 AM', 'Tomorrow 3–6 AM', 'Tonight 11 PM–3 AM', 'Tomorrow 1–4 AM']),
    heartRate: rand(68, 85),
    hrv: rand(28, 45),
    sleepWakeups: rand(2, 6),
    spo2: rand(94, 99),
    pressureChange: rand(-12, -4),
    lastSync: rand(1, 15),
  };
}

function generateHRVData() {
  return [
    { day: 'Mon', value: rand(50, 58) },
    { day: 'Tue', value: rand(46, 54) },
    { day: 'Wed', value: rand(42, 50) },
    { day: 'Thu', value: rand(38, 46) },
    { day: 'Fri', value: rand(32, 42) },
    { day: 'Sat', value: rand(30, 38) },
    { day: 'Now', value: rand(28, 38) },
  ];
}

function generateHRData() {
  return [
    { time: '12AM', value: rand(58, 66) },
    { time: '3AM', value: rand(68, 78) },
    { time: '6AM', value: rand(64, 72) },
    { time: '9AM', value: rand(68, 76) },
    { time: '12PM', value: rand(66, 74) },
    { time: '3PM', value: rand(74, 82) },
    { time: '6PM', value: rand(78, 86) },
    { time: 'Now', value: rand(74, 84) },
  ];
}

function generatePressureData() {
  return [
    { time: '36h', value: rand(1011, 1015) },
    { time: '30h', value: rand(1010, 1014) },
    { time: '24h', value: rand(1008, 1012) },
    { time: '18h', value: rand(1005, 1009) },
    { time: '12h', value: rand(1002, 1006) },
    { time: '6h', value: rand(1001, 1005) },
    { time: 'Now', value: rand(999, 1003) },
  ];
}

function generateForecastFactors() {
  return [
    { label: 'Sleep disruption', weight: rand(82, 96), color: chartHex.red },
    { label: 'Low HRV', weight: rand(78, 92), color: chartHex.red },
    { label: 'Weather pressure drop', weight: rand(62, 78), color: chartHex.orange },
    { label: 'Missed medication', weight: rand(55, 72), color: chartHex.orange },
    { label: 'Unusual movement', weight: rand(42, 60), color: chartHex.blue },
    { label: 'Temperature change', weight: rand(28, 45), color: chartHex.gray },
  ];
}

function generatePredictedVsActual() {
  return ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'].map(w => ({
    week: w,
    predicted: rand(1, 4),
    actual: rand(0, 3),
  }));
}

const initialTasks = [
  { id: '1', task: 'Call Dr. Martinez — review 2 PM medication timing', priority: 'HIGH' as const },
  { id: '2', task: 'Cancel 5 PM group visit', priority: 'HIGH' as const },
  { id: '3', task: 'Dim lights at 3:30 PM', priority: 'HIGH' as const },
  { id: '4', task: 'Play calming playlist at 4 PM', priority: 'MEDIUM' as const },
  { id: '5', task: 'Ensure Sarah is home 4–7 PM', priority: 'HIGH' as const },
  { id: '6', task: 'Charge GPS tracker to 100%', priority: 'MEDIUM' as const },
  { id: '7', task: 'Text backup caregiver John', priority: 'MEDIUM' as const },
];

const careTeam = [
  { name: 'Sarah M.', role: 'Primary Caregiver', status: 'active', color: iosColors.green },
  { name: 'John M.', role: 'Backup Caregiver', status: 'standby', color: iosColors.orange },
  { name: 'Dr. Martinez', role: 'Physician', status: 'available 9–5', color: iosColors.blue },
];

const guidelines = [
  { title: 'Calmora Watch Typography Scale', body: 'SF Pro Display for headings (28pt Bold), SF Pro Text for body (13pt Regular). Never below 10pt. Prefer system type styles for accessibility.' },
  { title: 'Color Palette', body: 'Primary surfaces use system grouped background. System Red for alerts, Orange for caution, Green for safe states, Blue for informational.' },
  { title: 'Lucide Icon Usage', body: 'strokeWidth 1.5 for body, strokeWidth 2 for alerts. Size 16–20px in cards, 24px for tab bar. Always pair with text label.' },
  { title: 'Card Radii & Spacing', body: 'Cards: 8px (iOS standard). Inner elements: 8px. Badges: 20px. Padding: 20px. Row spacing: 10–12px.' },
  { title: 'Alert Hierarchy', body: 'RED: Immediate action (crisis predicted, sensor offline). ORANGE: Caution (moderate risk, stale data). GREEN: All good. Max 1 red alert visible.' },
  { title: 'Watch Removal Pattern', body: 'Immediate banner with pulsing bluetooth icon. Each vital marked Active/Stale/Unknown. Show prediction accuracy drop. Reconnect CTA always visible.' },
  { title: 'Pattern Match UX', body: 'Show individual factor weights separately. Show historical match count. Write plain English explanation. Separate factor bars from confidence score.' },
];

const referenceLinks: { category: string; links: { label: string; url: string }[] }[] = [
  { category: 'Watch Integration', links: [
    { label: 'HealthKit Documentation', url: 'https://developer.apple.com/documentation/healthkit' },
    { label: 'Fitbit Web API', url: 'https://dev.fitbit.com/build/reference/web-api/' },
    { label: 'Google Health Connect', url: 'https://developer.android.com/health-and-fitness/guides/health-connect' },
  ]},
  { category: 'Typography', links: [
    { label: 'SF Pro Font (Apple)', url: 'https://developer.apple.com/fonts/' },
    { label: 'Apple Typography HIG', url: 'https://developer.apple.com/design/human-interface-guidelines/typography' },
  ]},
  { category: 'Charts & Data Viz', links: [
    { label: 'Recharts Library', url: 'https://recharts.org/en-US/' },
    { label: 'Apple Health UI Reference', url: 'https://developer.apple.com/health-fitness/' },
  ]},
  { category: 'Accessibility', links: [
    { label: 'Apple Accessibility HIG', url: 'https://developer.apple.com/design/human-interface-guidelines/accessibility' },
    { label: 'WCAG 2.1 Guidelines', url: 'https://www.w3.org/TR/WCAG21/' },
  ]},
  { category: 'Icons', links: [
    { label: 'Lucide Icons', url: 'https://lucide.dev/icons/' },
    { label: 'SF Symbols', url: 'https://developer.apple.com/sf-symbols/' },
  ]},
];

// ─── Custom Recharts Tooltip ───
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md">
      <p className="text-[11px] font-semibold text-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[11px] text-muted-foreground">
          {p.name}: <span className="font-bold" style={{ color: p.color }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ───
export default function CrisisPreventionEngine() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<CrisisTab>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const [sensorConnected, setSensorConnected] = useState(true);
  const [tasksDone, setTasksDone] = useState<Set<string>>(new Set());
  const [crisisType, setCrisisType] = useState<string | null>(null);
  const [severity, setSeverity] = useState([5]);
  const [crisisLogged, setCrisisLogged] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: 'user' | 'coach'; text: string }[]>([
    { id: '0', sender: 'coach', text: "I'm here to help you navigate today's alerts. What's on your mind?" },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Refresh data on tab switch
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as CrisisTab);
    setRefreshKey(k => k + 1);
  }, []);

  // Dynamic data — regenerates on refreshKey
  const dashboard = useMemo(() => generateDashboardData(), [refreshKey]);
  const hrvData = useMemo(() => generateHRVData(), [refreshKey]);
  const hrData = useMemo(() => generateHRData(), [refreshKey]);
  const pressureData = useMemo(() => generatePressureData(), [refreshKey]);
  const forecastFactors = useMemo(() => generateForecastFactors(), [refreshKey]);
  const predictedVsActual = useMemo(() => generatePredictedVsActual(), [refreshKey]);
  const sleepData = useMemo(() => ({
    deep: (rand(5, 12) / 10).toFixed(1),
    rem: (rand(8, 16) / 10).toFixed(1),
    light: (rand(18, 30) / 10).toFixed(1),
    awake: (rand(10, 20) / 10).toFixed(1),
  }), [refreshKey]);

  const totalSleep = useMemo(() =>
    (parseFloat(sleepData.deep) + parseFloat(sleepData.rem) + parseFloat(sleepData.light) + parseFloat(sleepData.awake)).toFixed(1),
    [sleepData]);

  const deepPct = useMemo(() =>
    Math.round((parseFloat(sleepData.deep) / parseFloat(totalSleep)) * 100),
    [sleepData, totalSleep]);

  const patternMatchCount = useMemo(() => rand(6, 9), [refreshKey]);
  const patternMatchTotal = useMemo(() => rand(9, 12), [refreshKey]);
  const patternLeadTime = useMemo(() => rand(28, 42), [refreshKey]);

  const completedCount = tasksDone.size;
  const allComplete = completedCount === initialTasks.length;
  const progressPct = Math.round((completedCount / initialTasks.length) * 100);

  const toggleTask = (id: string) => {
    setTasksDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const resetTasks = () => setTasksDone(new Set());

  // AI Coach
  const sendCoachMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userText = chatInput;
    setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const context = `Agitation risk: ${dashboard.agitationRisk}% (${dashboard.agitationLevel}), window: ${dashboard.agitationWindow}. Wandering risk: ${dashboard.wanderingRisk}% (${dashboard.wanderingLevel}). HR: ${dashboard.heartRate}bpm, HRV: ${dashboard.hrv}ms, Sleep wake-ups: ${dashboard.sleepWakeups}, SpO2: ${dashboard.spo2}%.`;
      
      const { data, error } = await supabase.functions.invoke('crisis-coach', {
        body: { message: userText, context },
      });

      const reply = error
        ? "I'm having trouble connecting right now. Try again in a moment."
        : data?.reply || "Could you rephrase that? I want to give you the best advice.";

      setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'coach', text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), sender: 'coach',
        text: "I'm having trouble connecting. In the meantime, focus on the highest-priority items in your Action Plan.",
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const logCrisis = () => {
    if (!crisisType) return;
    setCrisisLogged(true);
  };

  const resetCrisisLog = () => {
    setCrisisType(null);
    setSeverity([5]);
    setCrisisLogged(false);
  };

  // Radial gauge data for Recharts
  const agitationGauge = [{ value: dashboard.agitationRisk, fill: dashboard.agitationLevel === 'high' ? chartHex.red : chartHex.orange }];
  const wanderingGauge = [{ value: dashboard.wanderingRisk, fill: dashboard.wanderingLevel === 'high' ? chartHex.red : chartHex.orange }];

  const levelStyle = (level: string) => ({
    bg: level === 'high' ? 'bg-destructive/10' : level === 'moderate' ? 'bg-warning/10' : 'bg-success/10',
    text: level === 'high' ? 'text-destructive' : level === 'moderate' ? 'text-warning' : 'text-success',
    border: level === 'high' ? 'border-destructive/30' : level === 'moderate' ? 'border-warning/30' : 'border-success/30',
  });

  return (
    <div className="h-full flex flex-col ios-grouped-bg">
      {/* Header */}
      <div className="pt-4 pb-2 px-5">
        <div className="flex items-center gap-3 mb-3">
          <IconBox Icon={Shield} color={iosColors.red} />
          <div className="flex-1">
            <h2 className="text-[16px] font-extrabold text-foreground tracking-tight">CrisisGuard</h2>
            <p className="text-[11px] text-muted-foreground font-semibold">AI monitoring · Updated {dashboard.lastSync} min ago</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-bold px-2 py-0.5">
            Robert M.
          </Badge>
        </div>

        <SegmentedControl
          value={activeTab}
          onChange={handleTabChange}
          scrollable
          items={[
            { value: 'dashboard', icon: <Home className="w-3.5 h-3.5" />, label: 'Dashboard' },
            { value: 'vitals', icon: <Activity className="w-3.5 h-3.5" />, label: 'Vitals' },
            { value: 'forecast', icon: <Target className="w-3.5 h-3.5" />, label: 'Forecast' },
            { value: 'plan', icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Plan' },
            { value: 'caregiver', icon: <Users className="w-3.5 h-3.5" />, label: 'Caregiver' },
            { value: 'designspec', icon: <Layers className="w-3.5 h-3.5" />, label: 'Spec' },
          ]}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6 pt-3">
        <AnimatePresence mode="wait">

          {/* ═══ DASHBOARD ═══ */}
          {activeTab === 'dashboard' && (
            <motion.div key={`dash-${refreshKey}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3 px-5">

              {/* Sensor Removal Banner */}
              <AnimatePresence>
                {!sensorConnected && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="border-2 border-warning/40 rounded-xl p-4 bg-warning/5 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center animate-pulse shrink-0">
                        <BluetoothOff className="w-5 h-5 text-warning" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-bold text-warning">Watch Disconnected — Vitals Unavailable</p>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          Robert's watch lost connection at 2:14 PM. Heart rate, HRV & SpO₂ monitoring paused. <strong className="text-foreground">Caregiver Sarah has been notified.</strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Heart Rate: Unknown', status: 'bad' },
                        { label: 'HRV: Unknown', status: 'bad' },
                        { label: 'SpO₂: Stale (98%)', status: 'warn' },
                        { label: 'Sleep: Paused', status: 'warn' },
                        { label: 'GPS: Active', status: 'ok' },
                        { label: 'Weather: Active', status: 'ok' },
                      ].map(s => (
                        <span key={s.label} className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          s.status === 'bad' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          s.status === 'warn' ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-success/10 text-success border-success/20'
                        }`}>{s.label}</span>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Crisis prediction accuracy reduced from <strong className="text-foreground">{dashboard.agitationRisk}%</strong> → <strong className="text-destructive">42%</strong> without wearable data.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 h-9 rounded-xl text-[12px] font-bold bg-warning text-white hover:bg-warning/90"
                        onClick={() => { setSensorConnected(true); toast({ title: 'Watch Reconnected', description: 'All vitals restored.' }); }}>
                        Reconnect
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 h-9 rounded-xl text-[12px] font-semibold"
                        onClick={() => setSensorConnected(true)}>
                        Dismiss
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Morning Greeting */}
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-[20px] font-extrabold text-foreground">Good morning, Sarah</h3>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Robert's forecast is ready
                  </p>
                </CardContent>
              </Card>

              {/* Risk Gauges — 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Agitation Risk', value: dashboard.agitationRisk, level: dashboard.agitationLevel, window: dashboard.agitationWindow, data: agitationGauge },
                  { label: 'Wandering Risk', value: dashboard.wanderingRisk, level: dashboard.wanderingLevel, window: dashboard.wanderingWindow, data: wanderingGauge },
                ].map(g => {
                  const ls = levelStyle(g.level);
                  return (
                    <Card key={g.label} className={`border-2 ${ls.border} shadow-sm overflow-hidden`}>
                      <CardContent className="p-3 flex flex-col items-center">
                        <Badge className={`${ls.bg} ${ls.text} border-0 text-[9px] font-black uppercase mb-2`}>
                          {g.level} risk
                        </Badge>
                        <div className="w-full h-[90px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="90%" innerRadius="60%" outerRadius="100%"
                              startAngle={180} endAngle={0} data={g.data} barSize={10}>
                              <RadialBar background={{ fill: 'hsl(var(--muted))' }} dataKey="value" cornerRadius={5} />
                            </RadialBarChart>
                          </ResponsiveContainer>
                        </div>
                        <p className={`text-[24px] font-black ${ls.text} -mt-4`}>{g.value}%</p>
                        <p className="text-[11px] font-bold text-foreground mt-1">{g.label.split(' ')[0]}</p>
                        <p className="text-[10px] text-muted-foreground">{g.window}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Live Vitals Strip */}
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-extrabold text-foreground">Live Vitals</p>
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <p className="text-[10px] text-muted-foreground font-semibold">Syncing · {dashboard.lastSync} min ago</p>
                  </div>
                  {[
                    { Icon: Heart, color: iosColors.red, label: 'Heart Rate', value: `${dashboard.heartRate} bpm`, sub: 'Usual: 68 bpm', trend: dashboard.heartRate > 72 ? 'up' : 'stable' },
                    { Icon: Activity, color: iosColors.purple, label: 'HRV', value: `${dashboard.hrv} ms`, sub: 'Baseline: 55 ms', trend: 'down' },
                    { Icon: Moon, color: iosColors.blue, label: "Last Night's Sleep", value: `${dashboard.sleepWakeups} wake-ups`, sub: 'Usual: 1–2', trend: 'down' },
                    { Icon: Wind, color: iosColors.teal, label: 'SpO₂', value: `${dashboard.spo2}%`, sub: 'Normal range', trend: 'stable' },
                    { Icon: MapPin, color: iosColors.green, label: 'Location', value: 'Home', sub: 'Geo-fence active', trend: 'stable' },
                    { Icon: Cloud, color: iosColors.blue, label: 'Pressure Change', value: `${dashboard.pressureChange} mb / 12h`, sub: 'Triggers 40% of pts', trend: 'down' },
                  ].map(v => (
                    <div key={v.label} className="flex items-center gap-3 py-1.5">
                      <IconBox Icon={v.Icon} color={v.color} size={32} iconSize={16} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-foreground">{v.label}</p>
                        <p className="text-[10px] text-muted-foreground">{v.sub}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-foreground">{v.value}</span>
                        {v.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-destructive" />}
                        {v.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                        {v.trend === 'stable' && <span className="text-[10px] text-success font-bold">—</span>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Alert Strip */}
              <Card className="border-2 border-destructive/30 shadow-sm">
                <CardContent className="p-4 bg-destructive/5">
                  <div className="flex items-start gap-3">
                    <IconBox Icon={AlertTriangle} color={iosColors.red} size={36} iconSize={18} />
                    <div>
                      <p className="text-[13px] font-bold text-destructive">3 Risk Signals Active</p>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        Poor sleep + Low HRV + Pressure drop → matches {patternMatchCount}/{patternMatchTotal} past crisis signatures. See Forecast tab.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Simulate Disconnect */}
              <button
                onClick={() => { setSensorConnected(false); toast({ title: 'Watch Disconnected', description: 'Simulating sensor removal.' }); }}
                className="w-full border-2 border-dashed border-border rounded-xl py-3 text-center text-[12px] font-semibold text-muted-foreground hover:border-warning/50 hover:text-warning transition-colors">
                Simulate Calmora Watch Removal Alert
              </button>
            </motion.div>
          )}

          {/* ═══ VITALS ═══ */}
          {activeTab === 'vitals' && (
            <motion.div key={`vitals-${refreshKey}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 px-5">

              {/* HRV 7-Day Trend */}
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconBox Icon={Activity} color={iosColors.purple} size={28} iconSize={14} />
                    <p className="text-[14px] font-extrabold text-foreground">HRV 7-Day Trend</p>
                  </div>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hrvData}>
                        <defs>
                          <linearGradient id="hrvGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={chartHex.purple} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={chartHex.purple} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} unit=" ms" domain={[20, 60]} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={55} stroke={chartHex.green} strokeDasharray="5 5" label={{ value: 'Baseline', fill: chartHex.green, fontSize: 10 }} />
                        <Area type="monotone" dataKey="value" stroke={chartHex.purple} strokeWidth={2.5} fill="url(#hrvGrad)" dot={{ r: 3, fill: chartHex.purple }} name="HRV" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    HRV has dropped <strong className="text-destructive">36%</strong> below Robert's personal baseline over 6 days — strongest crisis predictor.
                  </p>
                </CardContent>
              </Card>

              {/* Heart Rate Today */}
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconBox Icon={Heart} color={iosColors.red} size={28} iconSize={14} />
                    <p className="text-[14px] font-extrabold text-foreground">Heart Rate Today</p>
                  </div>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={hrData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} unit=" bpm" domain={[55, 95]} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={68} stroke={chartHex.green} strokeDasharray="5 5" label={{ value: 'Resting baseline', fill: chartHex.green, fontSize: 10 }} />
                        <Line type="monotone" dataKey="value" stroke={chartHex.red} strokeWidth={2.5} dot={{ r: 3 }} name="HR" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Sleep Architecture */}
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconBox Icon={Moon} color={iosColors.blue} size={28} iconSize={14} />
                    <p className="text-[14px] font-extrabold text-foreground">Sleep Architecture</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { stage: 'Deep', hours: sleepData.deep, color: chartHex.indigo, bg: 'bg-accent/10' },
                      { stage: 'REM', hours: sleepData.rem, color: chartHex.purple, bg: 'bg-purple-500/10' },
                      { stage: 'Light', hours: sleepData.light, color: chartHex.blue, bg: 'bg-blue-500/10' },
                      { stage: 'Awake', hours: sleepData.awake, color: chartHex.gray, bg: 'bg-muted' },
                    ].map(s => (
                      <div key={s.stage} className={`${s.bg} rounded-xl p-3 text-center`}>
                        <p className="text-[22px] font-black" style={{ color: s.color }}>{s.hours}h</p>
                        <p className="text-[11px] font-bold text-muted-foreground mt-1">{s.stage}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                    Total: {totalSleep}h. Deep sleep <strong className="text-destructive">{deepPct}%</strong> vs baseline 35%. {dashboard.sleepWakeups} full awakenings detected.
                  </p>
                </CardContent>
              </Card>

              {/* Barometric Pressure */}
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IconBox Icon={Cloud} color={iosColors.teal} size={28} iconSize={14} />
                    <p className="text-[14px] font-extrabold text-foreground">Barometric Pressure 36h</p>
                  </div>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={pressureData}>
                        <defs>
                          <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={chartHex.blue} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={chartHex.blue} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} unit=" mb" domain={[998, 1016]} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={1005} stroke={chartHex.orange} strokeDasharray="5 5" label={{ value: 'Agitation threshold', fill: chartHex.orange, fontSize: 10 }} />
                        <Area type="monotone" dataKey="value" stroke={chartHex.blue} strokeWidth={2.5} fill="url(#pressGrad)" name="Pressure" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    Pressure below 1005 mb correlates with agitation in 40% of dementia patients. Robert is now at {pressureData[pressureData.length - 1].value} mb.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ═══ FORECAST ═══ */}
          {activeTab === 'forecast' && (
            <motion.div key={`fc-${refreshKey}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3 px-5">

              {/* Header */}
              <Card className="border-0 shadow-none">
                <CardContent className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-[16px] font-extrabold text-foreground">48-Hour Forecast</p>
                  <p className="text-[11px] text-muted-foreground font-semibold mt-1">Model last ran: Today 8:00 AM · Next: 2:00 PM</p>
                </CardContent>
              </Card>

              {/* Why This Alert — Explainability */}
              <Card className="border-2 border-destructive/20 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <p className="text-[13px] font-extrabold text-destructive uppercase tracking-wider">Why This Alert?</p>
                  {[
                    { label: 'Sleep Quality: Poor', Icon: Moon, color: iosColors.blue,
                      detail: `${dashboard.sleepWakeups} wake-ups last night (baseline: 1–2). Only ${deepPct}% deep sleep (usual: 35%). This alone precedes 70% of Robert's agitation episodes.` },
                    { label: 'HRV: Critically Low', Icon: Activity, color: iosColors.purple,
                      detail: `HRV at ${dashboard.hrv} ms vs Robert's personal baseline of 55 ms — a ${Math.round((1 - dashboard.hrv / 55) * 100)}% deviation. Sustained 6-day decline indicates accumulated physiological stress.` },
                    { label: `Pressure Drop: ${dashboard.pressureChange} mb in 12h`, Icon: Cloud, color: iosColors.teal,
                      detail: `Rapid barometric drop. Robert has agitated within 24h of this pattern in ${rand(5, 7)} of ${rand(7, 9)} prior occurrences.` },
                    { label: `Pattern Match: ${dashboard.agitationRisk}% confident`, Icon: Cpu, color: iosColors.green,
                      detail: `This exact triad (poor sleep + low HRV + pressure drop) matches ${patternMatchCount} of Robert's last ${patternMatchTotal} crisis signatures.` },
                  ].map(f => (
                    <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                      <IconBox Icon={f.Icon} color={f.color} size={32} iconSize={16} />
                      <div className="flex-1">
                        <p className="text-[13px] font-bold text-foreground">{f.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{f.detail}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Pattern Match Engine */}
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <IconBox Icon={Cpu} color={iosColors.green} size={28} iconSize={14} />
                    <p className="text-[14px] font-extrabold text-foreground">Pattern Match Engine</p>
                    <Badge className="bg-success/10 text-success border-0 text-[9px] font-bold">Live</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    The AI compares Robert's <strong className="text-foreground">last 48-hour biometric signature</strong> against his personal crisis history (90-day rolling window). This is NOT generic dementia data — it is learned from Robert's own patterns.
                  </p>

                  {/* Factor Weight Bars */}
                  <div className="space-y-2.5">
                    {forecastFactors.map(f => (
                      <div key={f.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-foreground">{f.label}</span>
                          <span className="text-[11px] font-bold" style={{ color: f.color }}>{f.weight}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${f.weight}%`, backgroundColor: f.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pattern Insight */}
                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                    <p className="text-[11px] text-foreground leading-relaxed">
                      This sleep disruption + HRV drop pattern has preceded <strong>{patternMatchCount} of Robert's last {patternMatchTotal} agitation episodes</strong>. Average lead time: <strong>{patternLeadTime} hours</strong>. Model confidence is elevated because today's barometric pressure drop matches {rand(5, 7)} prior crises exactly.
                    </p>
                  </div>

                  {/* Predicted vs Actual Chart */}
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Crisis: Predicted vs Actual (7 weeks)</p>
                    <div className="h-[130px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={predictedVsActual} barSize={10}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Bar dataKey="predicted" fill={chartHex.orange} radius={[4, 4, 0, 0]} name="Predicted" />
                          <Bar dataKey="actual" fill={chartHex.red} radius={[4, 4, 0, 0]} name="Actual" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ═══ ACTION PLAN ═══ */}
          {activeTab === 'plan' && (
            <motion.div key={`plan-${refreshKey}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3 px-5">

              {/* Progress */}
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[14px] font-extrabold text-foreground">Progress: {completedCount} of {initialTasks.length} tasks done</p>
                    <span className="text-[13px] font-bold text-primary">{progressPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${chartHex.indigo}, ${chartHex.green})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </CardContent>
              </Card>

              {allComplete ? (
                <Card className="border-2 border-success/30 shadow-sm">
                  <CardContent className="p-6 text-center space-y-3">
                    <Award className="w-12 h-12 text-success mx-auto" />
                    <p className="text-[18px] font-extrabold text-foreground">All tasks complete!</p>
                    <p className="text-[13px] text-muted-foreground">You've done everything possible to prevent today's crisis. You're amazing.</p>
                    <Button onClick={resetTasks} variant="outline" className="rounded-xl text-[12px] font-bold">
                      Reset Tasks
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-border/50 shadow-sm">
                  <CardContent className="p-3 space-y-1">
                    {initialTasks.map(t => {
                      const done = tasksDone.has(t.id);
                      return (
                        <button key={t.id} onClick={() => toggleTask(t.id)}
                          className="w-full flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-muted/30 transition-colors text-left">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            done ? 'bg-success' : t.priority === 'HIGH' ? 'border-2 border-destructive' : 'border-2 border-warning'
                          }`}>
                            {done && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                          </div>
                          <span className={`text-[13px] flex-1 ${done ? 'line-through text-muted-foreground' : 'font-medium text-foreground'}`}>
                            {t.task}
                          </span>
                          {!done && (
                            <Badge className={`text-[9px] font-bold border-0 ${
                              t.priority === 'HIGH' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                            }`}>{t.priority}</Badge>
                          )}
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* ═══ CAREGIVER ═══ */}
          {activeTab === 'caregiver' && (
            <motion.div key="caregiver" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3 px-5">

              {/* Care Team */}
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-[14px] font-extrabold text-foreground mb-3">Care Team</p>
                  <div className="space-y-3">
                    {careTeam.map(p => (
                      <div key={p.name} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold text-white" style={{ backgroundColor: p.color }}>
                          {p.name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-foreground">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.role}</p>
                        </div>
                        <Badge className="text-[9px] font-bold border-0" style={{ backgroundColor: `${p.color}20`, color: p.color }}>
                          {p.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Crisis Log */}
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-[14px] font-extrabold text-foreground">Log a Crisis Event</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Each log trains the AI to predict future events more accurately.</p>
                  </div>

                  {crisisLogged ? (
                    <div className="text-center py-4 space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
                      <p className="text-[14px] font-bold text-foreground">Crisis logged — AI model updated</p>
                      <p className="text-[12px] text-muted-foreground capitalize">{crisisType} · Severity {severity[0]}/10</p>
                      <Button onClick={resetCrisisLog} variant="outline" size="sm" className="rounded-xl text-[11px] font-bold mt-2">
                        Log another
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        {['Agitation', 'Wandering', 'Aggression'].map(type => (
                          <button key={type} onClick={() => setCrisisType(type)}
                            className={`py-3 rounded-xl text-[12px] font-bold text-center border-2 transition-colors ${
                              crisisType === type
                                ? 'border-destructive bg-destructive/10 text-destructive'
                                : 'border-border text-muted-foreground hover:border-border'
                            }`}>{type}</button>
                        ))}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-foreground mb-2">Severity: {severity[0]}/10</p>
                        <Slider value={severity} onValueChange={setSeverity} min={1} max={10} step={1} />
                      </div>
                      <Button onClick={logCrisis} disabled={!crisisType}
                        className={`w-full h-11 rounded-xl text-[13px] font-bold ${crisisType ? 'bg-destructive text-white hover:bg-destructive/90' : ''}`}>
                        Log Crisis Event
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* AI Coach Chat */}
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <IconBox Icon={Bot} color={iosColors.purple} size={28} iconSize={14} />
                    <p className="text-[14px] font-extrabold text-foreground">AI Crisis Coach</p>
                  </div>

                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {chatMessages.map(m => (
                      <div key={m.id} className={`p-3 rounded-xl text-[12px] leading-relaxed ${
                        m.sender === 'coach'
                          ? 'bg-accent/10 text-foreground border border-accent/20'
                          : 'bg-primary/10 text-foreground ml-6'
                      }`}>
                        {m.sender === 'coach' && <span className="text-[10px] font-bold text-accent block mb-1">AI Coach</span>}
                        {m.text}
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                        <span className="text-[10px] font-bold text-accent block mb-1">AI Coach</span>
                        <span className="text-[12px] text-muted-foreground animate-pulse">Thinking...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input value={chatInput} onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendCoachMessage()}
                      placeholder="Ask about today's forecast..."
                      className="text-[12px] h-10 rounded-xl" />
                    <Button onClick={sendCoachMessage} disabled={chatLoading || !chatInput.trim()}
                      size="sm" className="h-10 w-10 rounded-xl shrink-0 p-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ═══ DESIGN SPEC ═══ */}
          {activeTab === 'designspec' && (
            <motion.div key="spec" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3 px-5">

              {/* Guidelines */}
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Design Guidelines</p>
              {guidelines.map((g, i) => (
                <Card key={i} className="border border-border/50 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[13px] font-bold text-primary mb-1">{g.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{g.body}</p>
                  </CardContent>
                </Card>
              ))}

              {/* Reference Links */}
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest pt-2">Reference Links</p>
              {referenceLinks.map(cat => (
                <div key={cat.category}>
                  <p className="text-[12px] font-bold text-foreground mb-1.5">{cat.category}</p>
                  <div className="space-y-1.5 mb-3">
                    {cat.links.map(link => (
                      <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                        <span className="text-[12px] font-medium text-primary flex-1">{link.label}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
