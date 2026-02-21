import { useState, useMemo, useCallback, useEffect } from 'react';
import { useVitals } from '@/hooks/useCareData';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Activity, Heart, Moon,
  MapPin, Cloud, Brain,
  Check, Send, BluetoothOff,
  Cpu, Wind, Target,
  CheckCircle2, Users, Award,
  Home, ArrowUpRight, ArrowDownRight, Minus,
  MessageSquare, ChevronRight, Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend,
  ResponsiveContainer
} from 'recharts';

// ─── Types ───
type CrisisTab = 'dashboard' | 'vitals' | 'forecast' | 'plan' | 'caregiver';

// ─── iOS System Colors (Light) ───
const sys = {
  red: '#FF3B30', orange: '#FF9500', yellow: '#FFCC00', green: '#34C759',
  teal: '#5AC8FA', blue: '#007AFF', indigo: '#5856D6', purple: '#AF52DE',
  gray: '#8E8E93', gray6: '#F2F2F7', separator: '#C6C6C8',
  label: '#000000', secondaryLabel: 'rgba(60,60,67,0.6)', tertiaryLabel: 'rgba(60,60,67,0.45)',
};

// ─── Helpers ───
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[rand(0, arr.length - 1)]; }

// (Data generators removed — now using real DB vitals + AI risk assessment)

const fallbackTasks = [
  { id: '1', task: 'Call Dr. Martinez — review medication timing', priority: 'HIGH' as const },
  { id: '2', task: 'Cancel afternoon group visit', priority: 'HIGH' as const },
  { id: '3', task: 'Dim lights at 3:30 PM', priority: 'HIGH' as const },
  { id: '4', task: 'Play calming playlist at 4 PM', priority: 'MEDIUM' as const },
  { id: '5', task: 'Ensure Sarah is home 4–7 PM', priority: 'HIGH' as const },
  { id: '6', task: 'Charge GPS tracker to 100%', priority: 'MEDIUM' as const },
  { id: '7', task: 'Text backup caregiver John', priority: 'MEDIUM' as const },
];

const careTeam = [
  { name: 'Sarah M.', role: 'Primary Caregiver', status: 'active', color: sys.green, initial: 'S' },
  { name: 'John M.', role: 'Backup Caregiver', status: 'standby', color: sys.orange, initial: 'J' },
  { name: 'Dr. Martinez', role: 'Physician', status: 'available 9–5', color: sys.blue, initial: 'D' },
];

// ─── iOS Section Header ───
const SectionHeader = ({ children }: { children: string }) => (
  <p className="px-8 pt-5 pb-2" style={{
    fontSize: 13, fontWeight: 400, color: sys.secondaryLabel,
    letterSpacing: 0.5, textTransform: 'uppercase',
  }}>{children}</p>
);

// ─── iOS Card ───
const IOSCard = ({ children, className = '', style = {}, onClick }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void;
}) => (
  <div onClick={onClick} className={className} style={{
    background: '#FFFFFF', borderRadius: 12, padding: 16,
    margin: '0 16px 10px 16px', ...style,
  }}>{children}</div>
);

// ─── iOS Icon Container (44×44, 10px radius) ───
const IconContainer = ({ color, children, size = 44, pulse = false }: {
  color: string; children: React.ReactNode; size?: number; pulse?: boolean;
}) => (
  <div className={`shrink-0 flex items-center justify-center ${pulse ? 'animate-pulse' : ''}`} style={{
    width: size, height: size, borderRadius: 10,
    backgroundColor: `${color}22`,
  }}>{children}</div>
);

// ─── iOS Row separator ───
const RowSep = () => <div style={{ height: 0.5, backgroundColor: sys.separator, marginLeft: 56 }} />;

// ─── Trend Icon (SF-style using Lucide) ───
const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <ArrowUpRight style={{ width: 16, height: 16, color: sys.red }} strokeWidth={2} />;
  if (trend === 'down') return <ArrowDownRight style={{ width: 16, height: 16, color: sys.red }} strokeWidth={2} />;
  return <Minus style={{ width: 16, height: 16, color: sys.gray }} strokeWidth={2} />;
};

// ─── Gauge SVG (pure SVG semicircle) ───
const GaugeArc = ({ value, color, size = 120, trackColor }: { value: number; color: string; size?: number; trackColor?: string }) => {
  const cx = size / 2, cy = size / 2 + 10;
  const r = size / 2 - 12;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - value / 100);
  return (
    <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={trackColor || sys.gray6} strokeWidth={10} strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
    </svg>
  );
};

// ─── Custom Tooltip (iOS compliant, 4.5:1 contrast) ───
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#FFFFFF', border: `1px solid ${sys.separator}`, borderRadius: 10, padding: '8px 12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: sys.label }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: 11, color: sys.secondaryLabel }}>
          {p.name}: <span style={{ fontWeight: 700, color: p.color }}>{p.value}</span>
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
  const [aiTasks, setAiTasks] = useState<{ id: string; task: string; priority: 'HIGH' | 'MEDIUM' }[]>(fallbackTasks);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [crisisType, setCrisisType] = useState<string | null>(null);
  const [severity, setSeverity] = useState(5);
  const [crisisLogged, setCrisisLogged] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: 'user' | 'coach'; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [coachInitialized, setCoachInitialized] = useState(false);
  const [forecastData, setForecastData] = useState<any>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState(false);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as CrisisTab);
    setRefreshKey(k => k + 1);
  }, []);

  // ── Fetch real vitals from DB ──
  const { data: dbVitals = [] } = useVitals();

  // Extract latest values from real vitals
  const realVitals = useMemo(() => {
    const latest = (type: string) => {
      const sorted = dbVitals.filter(v => v.type === type).sort((a, b) => 
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );
      return sorted[0]?.value || null;
    };
    const hrvHistory = dbVitals.filter(v => v.type === 'hrv').sort((a, b) => 
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    );
    const hrHistory = dbVitals.filter(v => v.type === 'heart_rate').sort((a, b) => 
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    );
    const pressureHistory = dbVitals.filter(v => v.type === 'barometric_pressure').sort((a, b) => 
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    );

    const heartRate = Number(latest('heart_rate')) || 72;
    const hrv = Number(latest('hrv')) || 38;
    const spo2 = Number(latest('spo2')) || 96;
    const sleepWakeups = Number(latest('sleep_wakeups')) || 2;
    const deepSleep = Number(latest('sleep_deep')) || 1.5;
    const remSleep = Number(latest('sleep_rem')) || 1.5;
    const lightSleep = Number(latest('sleep_light')) || 3.0;
    const awakeSleep = Number(latest('sleep_awake')) || 0.5;
    const latestPressure = Number(latest('barometric_pressure')) || 1010;
    const oldestPressure = pressureHistory.length > 1 ? Number(pressureHistory[pressureHistory.length - 1].value) : latestPressure + 8;
    const pressureChange = latestPressure - oldestPressure;

    // Find most recent sync time
    const allRecent = dbVitals.filter(v => v.recorded_at).sort((a, b) => 
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    );
    const lastSyncMs = allRecent[0] ? Date.now() - new Date(allRecent[0].recorded_at).getTime() : 0;
    const lastSync = Math.max(1, Math.round(lastSyncMs / 60000));

    return {
      heartRate, hrv, spo2, sleepWakeups, pressureChange, lastSync,
      deepSleep, remSleep, lightSleep, awakeSleep, latestPressure,
      hrvHistory, hrHistory, pressureHistory,
    };
  }, [dbVitals]);

  // ── AI Risk Assessment ──
  const [riskData, setRiskData] = useState<any>(null);
  const [riskLoading, setRiskLoading] = useState(false);

  useEffect(() => {
    if (dbVitals.length === 0) return;
    const fetchRisk = async () => {
      setRiskLoading(true);
      try {
        const context = `REAL VITALS FROM WEARABLE:\n- Heart Rate: ${realVitals.heartRate} bpm\n- HRV: ${realVitals.hrv} ms (baseline: 55 ms)\n- SpO2: ${realVitals.spo2}%\n- Sleep wake-ups last night: ${realVitals.sleepWakeups}\n- Deep sleep: ${realVitals.deepSleep}h, REM: ${realVitals.remSleep}h, Light: ${realVitals.lightSleep}h, Awake: ${realVitals.awakeSleep}h\n- Barometric pressure: ${realVitals.latestPressure} mb (change: ${realVitals.pressureChange} mb over ${realVitals.pressureHistory.length > 1 ? '36h' : '12h'})\n- Last sync: ${realVitals.lastSync} min ago`;
        const { data, error } = await supabase.functions.invoke('crisis-coach', {
          body: { message: 'Assess crisis risk from real vitals', context, mode: 'risk-assessment' },
        });
        if (!error && data?.risk) {
          setRiskData(data.risk);
        }
      } catch (e) {
        console.error('Risk assessment failed:', e);
      } finally {
        setRiskLoading(false);
      }
    };
    fetchRisk();
  }, [dbVitals.length, refreshKey]);

  // Combined dashboard: AI risk + real vitals
  const dashboard = useMemo(() => ({
    agitationRisk: riskData?.agitationRisk ?? (realVitals.hrv < 40 ? 82 : realVitals.hrv < 50 ? 62 : 35),
    wanderingRisk: riskData?.wanderingRisk ?? (realVitals.sleepWakeups > 3 ? 65 : 40),
    agitationLevel: riskData?.agitationLevel ?? (realVitals.hrv < 40 ? 'high' : realVitals.hrv < 50 ? 'moderate' : 'low'),
    wanderingLevel: riskData?.wanderingLevel ?? (realVitals.sleepWakeups > 3 ? 'moderate' : 'low'),
    agitationWindow: riskData?.agitationWindow ?? 'Tomorrow 4–7 PM',
    wanderingWindow: riskData?.wanderingWindow ?? 'Tonight 10 PM–2 AM',
    heartRate: realVitals.heartRate,
    hrv: realVitals.hrv,
    sleepWakeups: realVitals.sleepWakeups,
    spo2: realVitals.spo2,
    pressureChange: realVitals.pressureChange,
    lastSync: realVitals.lastSync,
  }), [riskData, realVitals]);

  // Chart data from real vitals
  const hrvData = useMemo(() => {
    const hist = realVitals.hrvHistory;
    if (hist.length === 0) return [{ day: 'Now', value: realVitals.hrv }];
    return hist.slice(0, 7).reverse().map((v, i) => ({
      day: i === hist.length - 1 ? 'Now' : `${Math.round((Date.now() - new Date(v.recorded_at).getTime()) / 3600000)}h ago`,
      value: Number(v.value),
    }));
  }, [realVitals]);

  const hrData = useMemo(() => {
    const hist = realVitals.hrHistory;
    if (hist.length === 0) return [{ time: 'Now', value: realVitals.heartRate }];
    return hist.slice(0, 8).reverse().map((v, i) => ({
      time: i === hist.length - 1 ? 'Now' : `${Math.round((Date.now() - new Date(v.recorded_at).getTime()) / 3600000)}h ago`,
      value: Number(v.value),
    }));
  }, [realVitals]);

  const pressureData = useMemo(() => {
    const hist = realVitals.pressureHistory;
    if (hist.length === 0) return [{ time: 'Now', value: realVitals.latestPressure }];
    return hist.slice(0, 7).reverse().map((v, i) => ({
      time: i === hist.length - 1 ? 'Now' : `${Math.round((Date.now() - new Date(v.recorded_at).getTime()) / 3600000)}h`,
      value: Number(v.value),
    }));
  }, [realVitals]);

  const sleepData = useMemo(() => ({
    deep: String(realVitals.deepSleep), rem: String(realVitals.remSleep),
    light: String(realVitals.lightSleep), awake: String(realVitals.awakeSleep),
  }), [realVitals]);
  const totalSleep = useMemo(() =>
    (realVitals.deepSleep + realVitals.remSleep + realVitals.lightSleep + realVitals.awakeSleep).toFixed(1),
    [realVitals]);
  const deepPct = useMemo(() => Math.round((realVitals.deepSleep / parseFloat(totalSleep)) * 100), [realVitals, totalSleep]);

  const completedCount = tasksDone.size;
  const allComplete = aiTasks.length > 0 && completedCount === aiTasks.length;
  const progressPct = aiTasks.length > 0 ? Math.round((completedCount / aiTasks.length) * 100) : 0;

  // AI action plan
  useEffect(() => {
    const fetchActionPlan = async () => {
      setTasksLoading(true); setTasksDone(new Set());
      try {
        const context = `REAL VITALS: HR ${realVitals.heartRate}bpm, HRV ${realVitals.hrv}ms (baseline 55ms), SpO2 ${realVitals.spo2}%, Sleep wake-ups ${realVitals.sleepWakeups}, Deep sleep ${realVitals.deepSleep}h, Pressure ${realVitals.latestPressure}mb (change ${realVitals.pressureChange}mb). AI Risk: Agitation ${dashboard.agitationRisk}% (${dashboard.agitationLevel}, window: ${dashboard.agitationWindow}), Wandering ${dashboard.wanderingRisk}% (${dashboard.wanderingLevel}, window: ${dashboard.wanderingWindow}).`;
        const { data, error } = await supabase.functions.invoke('crisis-coach', {
          body: { message: 'Generate prevention plan', context, mode: 'action-plan' },
        });
        if (!error && data?.tasks?.length) {
          setAiTasks(data.tasks.map((t: any, i: number) => ({
            id: String(i + 1), task: t.task || t.title || `Task ${i + 1}`,
            priority: (t.priority === 'HIGH' ? 'HIGH' : 'MEDIUM') as 'HIGH' | 'MEDIUM',
          })));
        } else setAiTasks(fallbackTasks);
      } catch { setAiTasks(fallbackTasks); }
      finally { setTasksLoading(false); }
    };
    fetchActionPlan();
  }, [refreshKey, dashboard.agitationRisk, dashboard.wanderingRisk]);

  // AI Forecast data
  useEffect(() => {
    if (activeTab !== 'forecast') return;
    const fetchForecast = async () => {
      setForecastLoading(true); setForecastError(false);
      try {
        const context = `REAL VITALS FROM WEARABLE:\n- Heart Rate: ${realVitals.heartRate} bpm\n- HRV: ${realVitals.hrv} ms (baseline: 55 ms)\n- SpO2: ${realVitals.spo2}%\n- Sleep wake-ups: ${realVitals.sleepWakeups}\n- Deep sleep: ${realVitals.deepSleep}h, REM: ${realVitals.remSleep}h, Light: ${realVitals.lightSleep}h, Awake: ${realVitals.awakeSleep}h\n- Barometric pressure: ${realVitals.latestPressure} mb (change: ${realVitals.pressureChange} mb)\n- AI Risk Assessment: Agitation ${dashboard.agitationRisk}% (${dashboard.agitationLevel}), Wandering ${dashboard.wanderingRisk}% (${dashboard.wanderingLevel})\n- Predicted windows: Agitation ${dashboard.agitationWindow}, Wandering ${dashboard.wanderingWindow}`;
        const { data, error } = await supabase.functions.invoke('crisis-coach', {
          body: { message: 'Generate 48-hour crisis forecast analysis', context, mode: 'forecast' },
        });
        if (!error && data?.forecast) {
          setForecastData(data.forecast);
        } else {
          setForecastError(true);
        }
      } catch {
        setForecastError(true);
      } finally {
        setForecastLoading(false);
      }
    };
    fetchForecast();
  }, [activeTab, refreshKey]);

  const toggleTask = (id: string) => {
    setTasksDone(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // Initialize AI Coach with today's prevention context
  useEffect(() => {
    if (activeTab === 'caregiver' && !coachInitialized) {
      setCoachInitialized(true);
      const summary = `Based on REAL vitals: HR ${realVitals.heartRate}bpm, HRV ${realVitals.hrv}ms (baseline 55ms), SpO2 ${realVitals.spo2}%, ${realVitals.sleepWakeups} sleep wake-ups, Deep sleep ${realVitals.deepSleep}h, Pressure ${realVitals.latestPressure}mb (${realVitals.pressureChange}mb change). AI Risk: Agitation ${dashboard.agitationRisk}% (${dashboard.agitationWindow}), Wandering ${dashboard.wanderingRisk}% (${dashboard.wanderingWindow}).`;
      setChatMessages([
        { id: '0', sender: 'coach', text: `Hi Sarah! Here's your crisis briefing:\n\n${summary}\n\nI can help you with today's prevention plan, de-escalation strategies, or answer any questions about Robert's condition.` },
      ]);
    }
  }, [activeTab, coachInitialized, dashboard]);

  const coachPrompts = [
    "What should I do during tomorrow's high-risk window?",
    "How can I de-escalate if Robert becomes agitated?",
    "Summarize today's prevention plan",
    "What do the HRV numbers mean for Robert?",
  ];

  const sendCoachMessage = async (overrideText?: string) => {
    const text = overrideText || chatInput.trim();
    if (!text || chatLoading) return;
    setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text }]);
    setChatInput(''); setChatLoading(true);
    try {
      const context = `Agitation risk: ${dashboard.agitationRisk}%, Wandering: ${dashboard.wanderingRisk}%, HR: ${dashboard.heartRate}bpm, HRV: ${dashboard.hrv}ms, Sleep: ${dashboard.sleepWakeups} wake-ups. Action plan tasks: ${aiTasks.map(t => t.task).join('; ')}`;
      const { data, error } = await supabase.functions.invoke('crisis-coach', { body: { message: text, context } });
      const reply = error ? "I'm having trouble connecting. Try again." : data?.reply || "Could you rephrase that?";
      setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'coach', text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'coach', text: "Connection issue. Focus on your Action Plan items." }]);
    } finally { setChatLoading(false); }
  };

  const [crisisLogging, setCrisisLogging] = useState(false);
  const logCrisis = async () => {
    if (!crisisType || crisisLogging) return;
    setCrisisLogging(true);
    try {
      await supabase.from('activities').insert({
        description: `Crisis logged: ${crisisType} — Severity ${severity}/10`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        completed: true,
        icon: 'alert',
      });
      setCrisisLogged(true);
      toast({ title: 'Crisis event logged', description: `${crisisType} · Severity ${severity}/10 — AI model will update.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to log crisis event. Please try again.', variant: 'destructive' });
    } finally { setCrisisLogging(false); }
  };
  const resetCrisisLog = () => { setCrisisType(null); setSeverity(5); setCrisisLogged(false); };

  const riskColor = (level: string) => level === 'high' ? sys.red : level === 'moderate' ? sys.orange : sys.green;

  // Factor bar color by weight
  const factorBarColor = (w: number) => w > 80 ? sys.red : w > 60 ? sys.orange : w < 50 ? sys.gray : sys.blue;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: sys.gray6 }}>
      {/* ── Tab Control (iOS segmented, inside page) ── */}
      <div style={{ padding: '4px 16px 0' }}>
        <SegmentedControl
          value={activeTab}
          onChange={handleTabChange}
          scrollable
          items={[
            { value: 'dashboard', label: 'Dashboard' },
            { value: 'vitals', label: 'Vitals' },
            { value: 'forecast', label: 'Forecast' },
            { value: 'plan', label: 'Plan' },
            { value: 'caregiver', label: 'Caregiver' },
          ]}
        />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto pb-6">
        <AnimatePresence mode="wait">

          {/* ═══════ DASHBOARD ═══════ */}
          {activeTab === 'dashboard' && (
            <motion.div key={`dash-${refreshKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Sensor Removal Banner (Fix #12: no dashed border, proper iOS banner) */}
              <AnimatePresence>
                {!sensorConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: -60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -60 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                      margin: '8px 16px', padding: 16, borderRadius: 12,
                      background: `${sys.orange}1A`, border: `1px solid ${sys.orange}66`,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)', position: 'relative', zIndex: 30,
                    }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <IconContainer color={sys.orange} pulse>
                        <BluetoothOff style={{ width: 22, height: 22, color: sys.orange }} strokeWidth={2} />
                      </IconContainer>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 17, fontWeight: 600, color: sys.orange }}>Calmora Watch Disconnected</p>
                        <p style={{ fontSize: 13, color: sys.secondaryLabel, marginTop: 4, lineHeight: 1.5 }}>
                          Vitals unavailable since 2:14 PM. Last data: 2:11 PM. Sarah has been notified.
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button onClick={() => { setSensorConnected(true); toast({ title: '✓ Calmora Watch Reconnected' }); }}
                          style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: `${sys.orange}22`, color: sys.orange, border: 'none', cursor: 'pointer', minHeight: 32 }}>
                          Reconnect
                        </button>
                        <button onClick={() => setSensorConnected(true)}
                          style={{ fontSize: 13, color: sys.gray, background: 'none', border: 'none', cursor: 'pointer', minHeight: 44 }}>
                          Dismiss
                        </button>
                      </div>
                    </div>

                    {/* Sensor Status Grid (2 cols) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                     {[
                        { label: 'HR: Unknown', color: sys.red },
                        { label: 'HRV: Unknown', color: sys.red },
                        { label: 'SpO₂: Stale (2:11 PM)', color: sys.orange },
                        { label: 'Sleep: Paused', color: sys.orange },
                        { label: 'GPS: Active', color: sys.green },
                        { label: 'Weather: Active', color: sys.green },
                      ].map(s => (
                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: s.color, fontWeight: 500 }}>{s.label}</span>
                        </div>
                      ))}
                    </div>

                    <p style={{ fontSize: 13, color: sys.secondaryLabel, marginTop: 12, lineHeight: 1.5 }}>
                      Prediction accuracy: <strong style={{ color: sys.label }}>{dashboard.agitationRisk}%</strong> → <strong style={{ color: sys.red }}>42%</strong> without wearable.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <SectionHeader>Crisis Forecast</SectionHeader>

              {/* Risk Gauges — Apple Health Category style cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '0 16px 10px' }}>
                {[
                  { label: 'Agitation', value: dashboard.agitationRisk, level: dashboard.agitationLevel, window: dashboard.agitationWindow, bg: '#F28B54' },
                  { label: 'Wandering', value: dashboard.wanderingRisk, level: dashboard.wanderingLevel, window: dashboard.wanderingWindow, bg: '#6C6EC5' },
                ].map(g => (
                  <div key={g.label} onClick={() => handleTabChange('forecast')}
                    style={{
                      background: g.bg, borderRadius: 14, padding: 16, cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 44,
                    }}>
                    <GaugeArc value={g.value} color="#FFFFFF" size={100} trackColor="rgba(255,255,255,0.2)" />
                    <p style={{ fontSize: 34, fontWeight: 800, color: '#FFFFFF', marginTop: -6, fontVariantNumeric: 'tabular-nums' }}>
                      {g.value}<span style={{ fontSize: 16, fontWeight: 600 }}>%</span>
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>{g.label}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2, textAlign: 'center' }}>{g.window}</p>
                  </div>
                ))}
              </div>

              <SectionHeader>Live Vitals</SectionHeader>

              {/* Live Vitals Card (Fix #8-10: consistent icons, SF-style trend arrows, aligned values) */}
              <IOSCard>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 17, fontWeight: 600, color: sys.label }}>Live Vitals</span>
                  <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sys.green }} />
                  <span style={{ fontSize: 12, color: sys.green }}>Syncing · {dashboard.lastSync} min ago</span>
                </div>
                {[
                  { Icon: Heart, color: sys.red, label: 'Heart Rate', sub: 'Usual: 68 bpm', value: `${dashboard.heartRate} bpm`, trend: dashboard.heartRate > 72 ? 'up' as const : 'stable' as const },
                  { Icon: Activity, color: sys.purple, label: 'HRV', sub: 'Baseline: 55 ms', value: `${dashboard.hrv} ms`, trend: 'down' as const },
                  { Icon: Moon, color: sys.indigo, label: "Last Night's Sleep", sub: 'Usual: 1–2', value: `${dashboard.sleepWakeups} wake-ups`, trend: 'down' as const },
                  { Icon: Wind, color: sys.teal, label: 'SpO₂', sub: 'Normal range', value: `${dashboard.spo2}%`, trend: 'stable' as const },
                  { Icon: MapPin, color: sys.green, label: 'Location', sub: 'Geo-fence active', value: 'Home', trend: 'stable' as const },
                  { Icon: Cloud, color: sys.blue, label: 'Pressure Change', sub: 'Triggers 40% of pts', value: `${dashboard.pressureChange} mb/12h`, trend: 'down' as const },
                ].map((v, i, arr) => (
                  <div key={v.label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44, padding: '0 0' }}>
                      <IconContainer color={v.color}>
                        <v.Icon style={{ width: 22, height: 22, color: v.color }} strokeWidth={1.5} />
                      </IconContainer>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 17, fontWeight: 600, color: sys.label }}>{v.label}</p>
                        <p style={{ fontSize: 15, color: sys.secondaryLabel }}>{v.sub}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 17, fontWeight: 600, color: sys.label, fontVariantNumeric: 'tabular-nums' }}>{v.value}</span>
                        <TrendIcon trend={v.trend} />
                      </div>
                    </div>
                    {i < arr.length - 1 && <RowSep />}
                  </div>
                ))}
              </IOSCard>

              <SectionHeader>Alerts</SectionHeader>

              {/* Alert Strip (Fix #11: tinted bg, no red border, add CTA button) */}
              <IOSCard style={{ backgroundColor: `${sys.red}14` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <IconContainer color={sys.red}>
                    <AlertTriangle style={{ width: 22, height: 22, color: sys.red }} strokeWidth={2} />
                  </IconContainer>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 17, fontWeight: 600, color: sys.red }}>3 Risk Signals Active</p>
                    <p style={{ fontSize: 15, color: sys.secondaryLabel, marginTop: 4, lineHeight: 1.5 }}>
                      Poor sleep + Low HRV + Pressure drop → {riskData?.riskSummary || `HRV at ${dashboard.hrv}ms, ${dashboard.sleepWakeups} wake-ups detected.`}
                    </p>
                    <button onClick={() => handleTabChange('forecast')}
                      style={{ fontSize: 17, color: sys.blue, background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, minHeight: 44, padding: 0 }}>
                      View Forecast →
                    </button>
                  </div>
                </div>
              </IOSCard>

              {/* Watch Status Card (Fix #12: tinted gray button, not dashed) */}
              <IOSCard>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44 }}>
                  <IconContainer color={sys.blue}>
                    <Activity style={{ width: 22, height: 22, color: sys.blue }} strokeWidth={1.5} />
                  </IconContainer>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 17, fontWeight: 600, color: sys.label }}>Calmora Watch</p>
                    <p style={{ fontSize: 15, color: sys.secondaryLabel }}>Battery 84% · Last sync {dashboard.lastSync}m ago</p>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: 20, backgroundColor: `${sys.green}22` }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: sys.green }}>Connected</span>
                  </div>
                </div>
                <button onClick={() => { setSensorConnected(false); toast({ title: 'Watch Disconnected', description: 'Simulating sensor removal.' }); }}
                  style={{
                    width: '100%', marginTop: 12, height: 44, borderRadius: 10,
                    backgroundColor: `${sys.gray}15`, color: sys.gray, fontSize: 15, fontWeight: 500,
                    border: 'none', cursor: 'pointer',
                  }}>
                  Simulate Disconnection
                </button>
              </IOSCard>
            </motion.div>
          )}

          {/* ═══════ VITALS ═══════ */}
          {activeTab === 'vitals' && (
            <motion.div key={`vitals-${refreshKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SectionHeader>Biometric Trends</SectionHeader>

              {/* HRV (Fix #15,17: right-edge label, 16pt spacing) */}
              <IOSCard>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <IconContainer color={sys.purple} size={36}>
                    <Activity style={{ width: 20, height: 20, color: sys.purple }} strokeWidth={1.5} />
                  </IconContainer>
                  <span style={{ fontSize: 22, fontWeight: 400, color: sys.label }}>HRV 7-Day Trend</span>
                </div>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hrvData}>
                      <defs>
                        <linearGradient id="hrvG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={sys.purple} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={sys.purple} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={sys.separator} horizontal vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: sys.secondaryLabel }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: sys.secondaryLabel }} axisLine={false} tickLine={false} unit=" ms" domain={[20, 60]} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={55} stroke={sys.green} strokeDasharray="5 5"
                        label={{ value: 'Baseline', position: 'right', fill: sys.green, fontSize: 12 }} />
                      <Area type="monotone" dataKey="value" stroke={sys.purple} strokeWidth={2} fill="url(#hrvG)" dot={{ r: 4, fill: sys.purple }} name="HRV" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p style={{ fontSize: 13, color: sys.secondaryLabel, marginTop: 8, lineHeight: 1.6 }}>
                  HRV dropped <strong style={{ color: sys.red, fontWeight: 600 }}>36%</strong> below Robert's personal baseline over 6 days — strongest crisis predictor.
                </p>
              </IOSCard>

              {/* Heart Rate (Fix #16: right-edge label) */}
              <IOSCard>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <IconContainer color={sys.red} size={36}>
                    <Heart style={{ width: 20, height: 20, color: sys.red }} strokeWidth={1.5} />
                  </IconContainer>
                  <span style={{ fontSize: 22, fontWeight: 400, color: sys.label }}>Heart Rate Today</span>
                </div>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hrData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={sys.separator} horizontal vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: sys.secondaryLabel }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: sys.secondaryLabel }} axisLine={false} tickLine={false} unit=" bpm" domain={[55, 95]} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={68} stroke={sys.green} strokeDasharray="5 5"
                        label={{ value: 'Resting baseline', position: 'right', fill: sys.green, fontSize: 12 }} />
                      <Line type="monotone" dataKey="value" stroke={sys.red} strokeWidth={2.5} dot={{ r: 3 }} name="HR" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </IOSCard>

              {/* Sleep Architecture (Fix #18: fully visible) */}
              <IOSCard>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <IconContainer color={sys.indigo} size={36}>
                    <Moon style={{ width: 20, height: 20, color: sys.indigo }} strokeWidth={1.5} />
                  </IconContainer>
                  <span style={{ fontSize: 22, fontWeight: 400, color: sys.label }}>Sleep Architecture</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { stage: 'Deep', hours: sleepData.deep, color: sys.indigo },
                    { stage: 'REM', hours: sleepData.rem, color: sys.purple },
                    { stage: 'Light', hours: sleepData.light, color: sys.blue },
                    { stage: 'Awake', hours: sleepData.awake, color: sys.gray },
                  ].map(s => (
                    <div key={s.stage} style={{
                      backgroundColor: `${s.color}14`, borderRadius: 10, padding: 12, textAlign: 'center',
                    }}>
                      <p style={{ fontSize: 28, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.hours}h</p>
                      <p style={{ fontSize: 12, color: sys.secondaryLabel, marginTop: 4 }}>{s.stage}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: sys.secondaryLabel, marginTop: 12, lineHeight: 1.6 }}>
                  Total: {totalSleep}h · Deep sleep <strong style={{ color: sys.red }}>{deepPct}%</strong> vs baseline 35% · {dashboard.sleepWakeups} awakenings detected by Calmora accelerometer.
                </p>
              </IOSCard>

              {/* Barometric Pressure */}
              <IOSCard>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <IconContainer color={sys.blue} size={36}>
                    <Cloud style={{ width: 20, height: 20, color: sys.blue }} strokeWidth={1.5} />
                  </IconContainer>
                  <span style={{ fontSize: 22, fontWeight: 400, color: sys.label }}>Barometric Pressure</span>
                </div>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pressureData}>
                      <defs>
                        <linearGradient id="pressG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={sys.blue} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={sys.blue} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={sys.separator} horizontal vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: sys.secondaryLabel }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: sys.secondaryLabel }} axisLine={false} tickLine={false} unit=" mb" domain={[998, 1016]} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={1005} stroke={sys.orange} strokeDasharray="5 5"
                        label={{ value: 'Agitation threshold', position: 'right', fill: sys.orange, fontSize: 12 }} />
                      <Area type="monotone" dataKey="value" stroke={sys.blue} strokeWidth={2.5} fill="url(#pressG)" name="Pressure" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p style={{ fontSize: 13, color: sys.secondaryLabel, marginTop: 8, lineHeight: 1.6 }}>
                  Below 1005 mb correlates with agitation in 40% of dementia patients. Robert is now at {pressureData[pressureData.length - 1].value} mb.
                </p>
              </IOSCard>
            </motion.div>
          )}

          {/* ═══════ FORECAST ═══════ */}
          {activeTab === 'forecast' && (
            <motion.div key={`fc-${refreshKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Header */}
              <div style={{ padding: '16px 16px 0' }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: sys.label }}>48-Hour Forecast</p>
                <p style={{ fontSize: 15, color: sys.secondaryLabel, marginTop: 4 }}>
                  {forecastData?.model_last_ran ? `Model last ran: ${forecastData.model_last_ran}` : 'Loading forecast model...'}{forecastData?.next_run ? ` · Next: ${forecastData.next_run}` : ''}
                </p>
              </div>

              {forecastLoading ? (
                <IOSCard style={{ textAlign: 'center', padding: 32 }}>
                  <Brain style={{ width: 40, height: 40, color: sys.indigo, margin: '0 auto 12px' }} className="animate-pulse" />
                  <p style={{ fontSize: 17, fontWeight: 600, color: sys.label }}>Analyzing Crisis Patterns...</p>
                  <p style={{ fontSize: 13, color: sys.secondaryLabel, marginTop: 4 }}>AI is correlating biometrics, sleep, and environmental data</p>
                </IOSCard>
              ) : forecastError ? (
                <IOSCard style={{ textAlign: 'center', padding: 32 }}>
                  <AlertTriangle style={{ width: 40, height: 40, color: sys.orange, margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 17, fontWeight: 600, color: sys.label }}>Forecast Unavailable</p>
                  <p style={{ fontSize: 13, color: sys.secondaryLabel, marginTop: 4 }}>Could not generate forecast. Using latest vitals snapshot.</p>
                  <button onClick={() => setRefreshKey(k => k + 1)}
                    style={{ fontSize: 17, color: sys.blue, background: 'none', border: 'none', cursor: 'pointer', marginTop: 12, minHeight: 44 }}>
                    Retry Analysis
                  </button>
                </IOSCard>
              ) : forecastData ? (
                <>
                  {/* Summary banner */}
                  {forecastData.summary && (
                    <IOSCard style={{ backgroundColor: `${sys.red}14` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <IconContainer color={sys.red}>
                          <Shield style={{ width: 22, height: 22, color: sys.red }} strokeWidth={2} />
                        </IconContainer>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 17, fontWeight: 600, color: sys.red }}>{forecastData.summary}</p>
                          <p style={{ fontSize: 13, color: sys.secondaryLabel, marginTop: 2 }}>
                            Confidence: {forecastData.confidence_pct || dashboard.agitationRisk}%
                          </p>
                        </div>
                      </div>
                    </IOSCard>
                  )}

                  <SectionHeader>Why This Alert?</SectionHeader>

                  <IOSCard style={{ border: `1px solid ${sys.red}4D` }}>
                    {(forecastData.alert_factors || []).map((f: any, i: number, arr: any[]) => {
                      const iconMap: Record<string, typeof Moon> = { sleep: Moon, hrv: Activity, pressure: Cloud, pattern: Cpu };
                      const colorMap: Record<string, string> = { indigo: sys.indigo, purple: sys.purple, blue: sys.blue, green: sys.green };
                      const FIcon = iconMap[f.icon] || Brain;
                      const fColor = colorMap[f.color] || sys.blue;
                      return (
                        <div key={i}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0' }}>
                            <IconContainer color={fColor}>
                              <FIcon style={{ width: 22, height: 22, color: fColor }} strokeWidth={1.5} />
                            </IconContainer>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 17, fontWeight: 600, color: sys.label }}>{f.label}</p>
                              <p style={{ fontSize: 15, color: sys.secondaryLabel, marginTop: 4, lineHeight: 1.5 }}>{f.detail}</p>
                            </div>
                          </div>
                          {i < arr.length - 1 && <RowSep />}
                        </div>
                      );
                    })}
                  </IOSCard>

                  <SectionHeader>Pattern Match Engine</SectionHeader>

                  <IOSCard>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <IconContainer color={sys.green} size={36}>
                        <Cpu style={{ width: 20, height: 20, color: sys.green }} strokeWidth={1.5} />
                      </IconContainer>
                      <span style={{ fontSize: 22, fontWeight: 400, color: sys.label, flex: 1 }}>Pattern Match Engine</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sys.green }} />
                        <span style={{ fontSize: 12, color: sys.green }}>Live</span>
                      </div>
                    </div>

                    <p style={{ fontSize: 17, color: sys.secondaryLabel, lineHeight: 1.6, marginBottom: 16 }}>
                      The AI compares Robert's <strong style={{ color: sys.label }}>last 48-hour biometric signature</strong> against his personal crisis history (90-day rolling window). This is Robert's own data — not generic dementia statistics.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {(forecastData.pattern_factors || []).map((f: any, i: number, arr: any[]) => {
                        const barColor = factorBarColor(f.weight);
                        return (
                          <div key={f.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 15, color: sys.label }}>{f.label}</span>
                              <span style={{ fontSize: 15, fontWeight: 600, color: barColor }}>{f.weight}%</span>
                            </div>
                            <div role="progressbar" aria-label={`${f.label}: ${f.weight} percent`}
                              aria-valuenow={f.weight} aria-valuemin={0} aria-valuemax={100}
                              style={{ height: 6, borderRadius: 3, backgroundColor: `rgba(120,120,128,0.12)`, overflow: 'hidden' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${f.weight}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                style={{ height: '100%', borderRadius: 3, backgroundColor: barColor }} />
                            </div>
                            {i < arr.length - 1 && <div style={{ height: 0.5, backgroundColor: sys.separator, marginTop: 12 }} />}
                          </div>
                        );
                      })}
                    </div>

                    {forecastData.pattern_insight && (
                      <div style={{
                        marginTop: 16, backgroundColor: sys.gray6, borderRadius: 8,
                        borderLeft: `4px solid ${sys.indigo}`, padding: '12px 12px 12px 16px',
                      }}>
                        <p style={{ fontSize: 13, color: sys.label, lineHeight: 1.6 }}>
                          {forecastData.pattern_insight} Matched <strong>{forecastData.match_count || 0} of {forecastData.match_total || 0}</strong> past signatures. Average lead time: <strong>{forecastData.lead_time_hours || 0} hours</strong>.
                        </p>
                      </div>
                    )}
                  </IOSCard>

                  <SectionHeader>Crisis History</SectionHeader>

                  <IOSCard>
                    <p style={{ fontSize: 11, fontWeight: 400, color: sys.secondaryLabel, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
                      Crisis: Predicted vs Actual (7 weeks)
                    </p>
                    <div style={{ height: 140 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={forecastData.predicted_vs_actual || []} barSize={8}>
                          <CartesianGrid strokeDasharray="3 3" stroke={sys.separator} horizontal vertical={false} />
                          <XAxis dataKey="week" tick={{ fontSize: 11, fill: sys.secondaryLabel }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: sys.secondaryLabel }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="predicted" fill={sys.orange} radius={[3, 3, 0, 0]} name="Predicted" />
                          <Bar dataKey="actual" fill={sys.red} radius={[3, 3, 0, 0]} name="Actual" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </IOSCard>
                </>
              ) : null}
            </motion.div>
          )}

          {/* ═══════ PLAN ═══════ */}
          {activeTab === 'plan' && (
            <motion.div key={`plan-${refreshKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              <div style={{ padding: '16px 16px 0' }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: sys.label }}>Prevention Plan</p>
                <p style={{ fontSize: 15, color: sys.secondaryLabel, marginTop: 4 }}>For {dashboard.agitationWindow} high-risk window</p>
              </div>

              <SectionHeader>Progress</SectionHeader>

              {/* Progress Card (Fix #28: 6px bar) */}
              <IOSCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 17, fontWeight: 600, color: sys.label }}>Progress: {completedCount} of {aiTasks.length} tasks done</span>
                  <span style={{ fontSize: 17, fontWeight: 600, color: progressPct > 0 ? sys.green : sys.gray }}>{progressPct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, backgroundColor: `rgba(120,120,128,0.12)`, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${sys.indigo}, ${sys.green})` }} />
                </div>
              </IOSCard>

              <SectionHeader>Prevention Tasks</SectionHeader>

              {allComplete ? (
                <IOSCard style={{ textAlign: 'center', padding: 32 }}>
                  <Star style={{ width: 40, height: 40, color: sys.yellow, margin: '0 auto 12px', fill: sys.yellow }} />
                  <p style={{ fontSize: 22, fontWeight: 400, color: sys.label }}>Well done!</p>
                  <p style={{ fontSize: 17, color: sys.secondaryLabel, marginTop: 8 }}>All tasks complete. You've done everything possible to reduce today's risk.</p>
                  <button onClick={() => setTasksDone(new Set())}
                    style={{ fontSize: 17, color: sys.blue, background: 'none', border: 'none', cursor: 'pointer', marginTop: 16, minHeight: 44 }}>
                    Log another event
                  </button>
                </IOSCard>
              ) : tasksLoading ? (
                <IOSCard style={{ textAlign: 'center', padding: 32 }}>
                  <Brain style={{ width: 40, height: 40, color: sys.indigo, margin: '0 auto 12px' }} className="animate-pulse" />
                  <p style={{ fontSize: 17, fontWeight: 600, color: sys.label }}>Generating AI Prevention Plan...</p>
                  <p style={{ fontSize: 13, color: sys.secondaryLabel, marginTop: 4 }}>Analyzing forecast data</p>
                </IOSCard>
              ) : (
                <IOSCard style={{ padding: 0 }}>
                  {aiTasks.map((t, i) => {
                    const done = tasksDone.has(t.id);
                    return (
                      <div key={t.id}>
                        {/* Fix #29: 44×44 touch target, Fix #32: dynamic row height */}
                        <button onClick={() => toggleTask(t.id)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                            padding: '0 16px', minHeight: 44, background: 'none', border: 'none',
                            cursor: 'pointer', textAlign: 'left',
                          }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            ...(done
                              ? { backgroundColor: sys.green }
                              : { border: `2px solid ${t.priority === 'HIGH' ? sys.red : sys.orange}` })
                          }}>
                            {done && <Check style={{ width: 16, height: 16, color: '#FFFFFF' }} strokeWidth={3} />}
                          </div>
                          <span style={{
                            flex: 1, fontSize: 15, color: done ? sys.secondaryLabel : sys.label,
                            textDecoration: done ? 'line-through' : 'none', padding: '10px 0',
                          }}>{t.task}</span>
                          {!done && (
                            <span style={{
                              padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                              backgroundColor: t.priority === 'HIGH' ? sys.red : sys.orange,
                              color: '#FFFFFF',
                            }}>{t.priority}</span>
                          )}
                        </button>
                        {i < aiTasks.length - 1 && <RowSep />}
                      </div>
                    );
                  })}
                </IOSCard>
              )}
            </motion.div>
          )}

          {/* ═══════ CAREGIVER ═══════ */}
          {activeTab === 'caregiver' && (
            <motion.div key="caregiver" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              <SectionHeader>Care Team</SectionHeader>

              <IOSCard style={{ padding: 0 }}>
                {careTeam.map((p, i) => (
                  <div key={p.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', minHeight: 44 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 20, flexShrink: 0,
                        backgroundColor: `${p.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 17, fontWeight: 600, color: p.color }}>{p.initial}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 17, fontWeight: 600, color: sys.label }}>{p.name}</p>
                        <p style={{ fontSize: 15, color: sys.secondaryLabel }}>{p.role}</p>
                      </div>
                      <div style={{ padding: '4px 10px', borderRadius: 20, backgroundColor: `${p.color}22` }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.status}</span>
                      </div>
                    </div>
                    {i < careTeam.length - 1 && <RowSep />}
                  </div>
                ))}
              </IOSCard>

              <SectionHeader>AI Crisis Coach</SectionHeader>

              <IOSCard>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <IconContainer color={sys.purple} size={36}>
                    <Brain style={{ width: 20, height: 20, color: sys.purple }} strokeWidth={1.5} />
                  </IconContainer>
                  <span style={{ fontSize: 20, fontWeight: 600, color: sys.label }}>AI Crisis Coach</span>
                </div>

                {/* Chat messages */}
                <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chatMessages.map(m => (
                    <div key={m.id} style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}>
                      <span style={{
                        fontSize: 12, color: m.sender === 'coach' ? sys.indigo : sys.secondaryLabel,
                        marginBottom: 2,
                      }}>
                        {m.sender === 'coach' ? 'AI Coach' : 'Sarah'}
                      </span>
                      <div style={{
                        padding: '12px 14px', maxWidth: '85%',
                        borderRadius: 18, whiteSpace: 'pre-line',
                        ...(m.sender === 'user'
                          ? { backgroundColor: sys.blue, color: '#FFFFFF', borderTopRightRadius: 4 }
                          : { backgroundColor: sys.gray6, color: sys.label, borderTopLeftRadius: 4 }),
                        fontSize: 15, lineHeight: 1.5,
                      }}>{m.text}</div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 12, color: sys.indigo, marginBottom: 2 }}>AI Coach</span>
                      <div style={{ padding: '12px 14px', borderRadius: 18, borderTopLeftRadius: 4, backgroundColor: sys.gray6, fontSize: 15, color: sys.secondaryLabel }}>
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>

                {/* Predefined quick prompts */}
                {chatMessages.length <= 1 && !chatLoading && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {coachPrompts.map((prompt, i) => (
                      <button key={i} onClick={() => sendCoachMessage(prompt)}
                        style={{
                          padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                          backgroundColor: `${sys.blue}12`, color: sys.blue,
                          border: `1px solid ${sys.blue}30`, cursor: 'pointer',
                          textAlign: 'left', lineHeight: 1.3,
                        }}>{prompt}</button>
                    ))}
                  </div>
                )}

                {/* Custom input */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendCoachMessage()}
                    placeholder="Ask about today's forecast..."
                    style={{
                      flex: 1, height: 40, borderRadius: 20, padding: '0 14px',
                      backgroundColor: sys.gray6, border: 'none', outline: 'none',
                      fontSize: 15, color: sys.label,
                    }} />
                  <button onClick={() => sendCoachMessage()} disabled={chatLoading || !chatInput.trim()}
                    style={{
                      width: 32, height: 32, borderRadius: 16, flexShrink: 0,
                      backgroundColor: sys.blue, border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: chatLoading || !chatInput.trim() ? 0.4 : 1,
                      marginTop: 4,
                    }}>
                    <ArrowUpRight style={{ width: 16, height: 16, color: '#FFFFFF', transform: 'rotate(-45deg)' }} />
                  </button>
                </div>
              </IOSCard>

              <SectionHeader>Log a Crisis Event</SectionHeader>

              <IOSCard>
                <p style={{ fontSize: 13, color: sys.secondaryLabel, marginBottom: 12 }}>
                  Each log trains the AI to predict future events more accurately.
                </p>

                {crisisLogged ? (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <CheckCircle2 style={{ width: 40, height: 40, color: sys.green, margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 17, fontWeight: 600, color: sys.green }}>Crisis logged — AI model updated</p>
                    <p style={{ fontSize: 15, color: sys.secondaryLabel, marginTop: 4, textTransform: 'capitalize' }}>{crisisType} · Severity {severity}/10</p>
                    <button onClick={resetCrisisLog}
                      style={{ fontSize: 17, color: sys.blue, background: 'none', border: 'none', cursor: 'pointer', marginTop: 12, minHeight: 44 }}>
                      Log another event
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ backgroundColor: sys.gray6, borderRadius: 8, padding: 2, display: 'flex', marginBottom: 16 }}>
                      {['Agitation', 'Wandering', 'Aggression'].map(type => (
                        <button key={type} onClick={() => setCrisisType(type)}
                          style={{
                            flex: 1, height: 32, borderRadius: 6, fontSize: 13, fontWeight: 600,
                            border: 'none', cursor: 'pointer',
                            backgroundColor: crisisType === type ? '#FFFFFF' : 'transparent',
                            color: crisisType === type ? sys.label : sys.secondaryLabel,
                            boxShadow: crisisType === type ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                            transition: 'all 0.15s',
                          }}>{type}</button>
                      ))}
                    </div>

                    <p style={{ fontSize: 17, fontWeight: 600, color: sys.label, marginBottom: 8 }}>
                      Severity: {severity}/10
                    </p>
                    <input type="range" min={1} max={10} value={severity}
                      onChange={e => setSeverity(Number(e.target.value))}
                      style={{ width: '100%', accentColor: sys.blue, minHeight: 44 }}
                      aria-label={`Severity: ${severity} out of 10`} />

                    <button onClick={logCrisis} disabled={!crisisType || crisisLogging}
                      style={{
                        width: '100%', height: 50, borderRadius: 12, marginTop: 16,
                        fontSize: 17, fontWeight: 600, border: 'none', cursor: crisisType ? 'pointer' : 'default',
                        backgroundColor: crisisType ? sys.red : sys.gray6,
                        color: crisisType ? '#FFFFFF' : sys.gray,
                        opacity: crisisType ? 1 : 0.4,
                        transition: 'all 0.2s',
                      }}>
                      {crisisLogging ? 'Logging...' : 'Log Crisis Event'}
                    </button>
                  </>
                )}
              </IOSCard>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
