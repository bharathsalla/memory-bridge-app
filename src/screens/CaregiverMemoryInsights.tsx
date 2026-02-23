import { useState, useMemo } from 'react';
import {
  Loader2, Heart, Activity, Droplets, Thermometer, Weight, Footprints,
  Moon, Wind, ChevronDown, TrendingUp, TrendingDown, Minus,
  Gauge, Brain, Eye, Ear, Pill, Flame,
} from 'lucide-react';
import {
  HealthAreaChart, HealthBarChart, HealthLineChart, chartColors,
} from '@/components/ui/AppleHealthCharts';
import { useVitals } from '@/hooks/useCareData';

// ─── Vital Category Config ─────────────────────────────────────
interface VitalConfig {
  label: string;
  unit: string;
  icon: typeof Heart;
  color: string;
  chartType: 'area' | 'line' | 'bar';
  thresholds: [number, number, number, number]; // [lowDanger, lowSafe, highSafe, highDanger]
  format?: (v: number) => string;
}

const VITAL_CONFIGS: Record<string, VitalConfig> = {
  heart_rate: {
    label: 'Heart Rate', unit: 'bpm', icon: Heart, color: chartColors.red,
    chartType: 'area', thresholds: [50, 60, 100, 120],
  },
  hrv: {
    label: 'HRV', unit: 'ms', icon: Activity, color: chartColors.purple,
    chartType: 'line', thresholds: [20, 30, 70, 100],
  },
  spo2: {
    label: 'Blood Oxygen', unit: '%', icon: Droplets, color: chartColors.blue,
    chartType: 'area', thresholds: [88, 94, 100, 100],
  },
  blood_pressure: {
    label: 'Blood Pressure', unit: 'mmHg', icon: Gauge, color: chartColors.red,
    chartType: 'bar', thresholds: [80, 90, 130, 150],
  },
  temperature: {
    label: 'Temperature', unit: '°C', icon: Thermometer, color: chartColors.orange,
    chartType: 'line', thresholds: [35.0, 36.1, 37.2, 38.0],
    format: (v) => v.toFixed(1),
  },
  weight: {
    label: 'Weight', unit: 'kg', icon: Weight, color: chartColors.indigo,
    chartType: 'bar', thresholds: [40, 50, 90, 110],
    format: (v) => v.toFixed(1),
  },
  steps: {
    label: 'Steps', unit: 'steps', icon: Footprints, color: chartColors.green,
    chartType: 'bar', thresholds: [0, 2000, 10000, 20000],
    format: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`,
  },
  respiratory_rate: {
    label: 'Respiratory Rate', unit: 'bpm', icon: Wind, color: chartColors.teal,
    chartType: 'line', thresholds: [8, 12, 20, 30],
  },
  blood_glucose: {
    label: 'Blood Glucose', unit: 'mg/dL', icon: Pill, color: chartColors.yellow,
    chartType: 'area', thresholds: [50, 70, 140, 200],
  },
  calories: {
    label: 'Calories Burned', unit: 'kcal', icon: Flame, color: chartColors.orange,
    chartType: 'bar', thresholds: [0, 200, 600, 1200],
  },
  barometric_pressure: {
    label: 'Barometric', unit: 'mb', icon: Wind, color: chartColors.teal,
    chartType: 'line', thresholds: [980, 1000, 1020, 1040],
  },
};

const SLEEP_TYPES = ['sleep', 'sleep_deep', 'sleep_light', 'sleep_rem', 'sleep_awake', 'sleep_wakeups'];
const SLEEP_CONFIG: Record<string, { label: string; color: string; thresholds: [number, number, number, number] }> = {
  sleep: { label: 'Total Sleep', color: chartColors.indigo, thresholds: [4, 6, 9, 12] },
  sleep_deep: { label: 'Deep', color: chartColors.purple, thresholds: [0.3, 0.8, 2.5, 4] },
  sleep_light: { label: 'Light', color: chartColors.blue, thresholds: [0.5, 1.5, 4, 6] },
  sleep_rem: { label: 'REM', color: chartColors.teal, thresholds: [0.3, 0.8, 2.5, 4] },
  sleep_awake: { label: 'Awake', color: chartColors.orange, thresholds: [0, 0, 1.5, 3] },
  sleep_wakeups: { label: 'Wake-ups', color: chartColors.red, thresholds: [0, 0, 4, 8] },
};

type RiskLevel = 'low' | 'moderate' | 'high';

function getRiskLevel(value: number, thresholds: [number, number, number, number]): RiskLevel {
  const [ld, ls, hs, hd] = thresholds;
  if (value <= ld || value >= hd) return 'high';
  if (value <= ls || value >= hs) return 'moderate';
  return 'low';
}

const riskMeta: Record<RiskLevel, { bg: string; text: string; label: string; dot: string }> = {
  low: { bg: 'bg-success/12', text: 'text-success', label: 'Normal', dot: '#34C759' },
  moderate: { bg: 'bg-warning/12', text: 'text-warning', label: 'Moderate', dot: '#FF9500' },
  high: { bg: 'bg-destructive/12', text: 'text-destructive', label: 'High', dot: '#FF3B30' },
};

function formatAxisTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Main Component ────────────────────────────────────────────
export default function CaregiverMemoryInsights() {
  const { data: vitals = [], isLoading } = useVitals();
  // First two vital types default to expanded
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const vitalsByType = useMemo(() => {
    const grouped: Record<string, { value: number; recorded_at: string; notes: string; unit: string }[]> = {};
    vitals.forEach((v) => {
      if (!grouped[v.type]) grouped[v.type] = [];
      grouped[v.type].push({
        value: parseFloat(v.value) || 0,
        recorded_at: v.recorded_at || v.created_at,
        notes: v.notes || '',
        unit: v.unit || '',
      });
    });
    Object.values(grouped).forEach((arr) =>
      arr.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    );
    return grouped;
  }, [vitals]);

  const regularTypes = useMemo(
    () => Object.keys(vitalsByType).filter((t) => !SLEEP_TYPES.includes(t) && VITAL_CONFIGS[t]),
    [vitalsByType]
  );
  const sleepTypes = useMemo(
    () => Object.keys(vitalsByType).filter((t) => SLEEP_TYPES.includes(t)),
    [vitalsByType]
  );

  // Auto-expand first 2 on initial load
  if (!initialized && regularTypes.length > 0) {
    const initial = new Set(regularTypes.slice(0, 2));
    setExpandedCards(initial);
    setInitialized(true);
  }

  const toggleCard = (type: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center ios-grouped-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-[13px] text-muted-foreground">Loading health vitals…</span>
        </div>
      </div>
    );
  }

  if (vitals.length === 0) {
    return (
      <div className="h-full flex items-center justify-center ios-grouped-bg px-8">
        <div className="text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-[18px] font-bold text-foreground mb-2">No Vitals Data</h2>
          <p className="text-[13px] text-muted-foreground">
            Health vitals will appear here once recorded from the patient's devices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto ios-grouped-bg pb-6">
      {/* ── iOS Large Title ── */}
      <div className="px-6 pt-4 pb-1">
        <h1 className="text-ios-large-title text-foreground">Insights</h1>
        <p className="text-[15px] text-muted-foreground mt-0.5">Health vitals & risk analysis</p>
      </div>

      {/* ── Risk Legend ── */}
      <div className="px-6 mt-3 flex items-center gap-5">
        {(['low', 'moderate', 'high'] as RiskLevel[]).map((level) => (
          <div key={level} className="flex items-center gap-1.5">
            <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: riskMeta[level].dot }} />
            <span className="text-[11px] font-medium text-muted-foreground">{riskMeta[level].label}</span>
          </div>
        ))}
      </div>

      {/* ── Vitals Grid — 2 per row ── */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        {regularTypes.map((type) => {
          const config = VITAL_CONFIGS[type];
          const readings = vitalsByType[type];
          if (!config || !readings || readings.length === 0) return null;

          const latest = readings[readings.length - 1];
          const risk = getRiskLevel(latest.value, config.thresholds);
          const isExpanded = expandedCards.has(type);
          const Icon = config.icon;
          const displayVal = config.format ? config.format(latest.value) : `${latest.value}`;

          // Trend
          const prev = readings.length >= 2 ? readings[readings.length - 2].value : latest.value;
          const trendDir = latest.value > prev ? 'up' : latest.value < prev ? 'down' : 'stable';

          const chartData = readings.map((r) => ({
            time: formatAxisTime(r.recorded_at),
            value: r.value,
          }));

          return (
            <button
              key={type}
              onClick={() => toggleCard(type)}
              className={`col-span-${isExpanded ? '2' : '1'} text-left`}
              style={{ gridColumn: isExpanded ? '1 / -1' : undefined }}
            >
              <div
                className="bg-card rounded-[10px] overflow-hidden"
                style={{ border: '0.5px solid hsl(var(--border))' }}
              >
                {/* ── Card Header ── */}
                <div className="px-3.5 pt-3 pb-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center"
                      style={{ backgroundColor: config.color }}
                    >
                      <Icon className="w-[14px] h-[14px] text-white" style={{ strokeWidth: 2 }} />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex-1">
                      {config.label}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {/* Value + Risk + Trend */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[24px] font-bold text-foreground leading-none">{displayVal}</span>
                    <span className="text-[12px] text-muted-foreground">{config.unit}</span>
                    {trendDir === 'up' && <TrendingUp className="w-3 h-3 text-destructive ml-1" />}
                    {trendDir === 'down' && <TrendingDown className="w-3 h-3 text-success ml-1" />}
                    {trendDir === 'stable' && <Minus className="w-3 h-3 text-muted-foreground ml-1" />}
                  </div>

                  {/* Risk stage bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-[4px] rounded-full overflow-hidden flex">
                      <div className="flex-1" style={{ backgroundColor: '#FF3B30', opacity: 0.2 }} />
                      <div className="flex-1" style={{ backgroundColor: '#FF9500', opacity: 0.2 }} />
                      <div className="flex-[2]" style={{ backgroundColor: '#34C759', opacity: 0.2 }} />
                      <div className="flex-1" style={{ backgroundColor: '#FF9500', opacity: 0.2 }} />
                      <div className="flex-1" style={{ backgroundColor: '#FF3B30', opacity: 0.2 }} />
                    </div>
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: riskMeta[risk].dot }}
                    >
                      {riskMeta[risk].label}
                    </span>
                  </div>
                </div>

                {/* ── Expanded: Chart + History ── */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5">
                    <div className="border-t border-border/40 pt-3">
                      {config.chartType === 'area' && (
                        <HealthAreaChart data={chartData} dataKey="value" xKey="time" color={config.color} name={config.label} height={130} />
                      )}
                      {config.chartType === 'line' && (
                        <HealthLineChart
                          data={chartData} xKey="time"
                          lines={[{ key: 'value', color: config.color, name: config.label }]}
                          height={130}
                        />
                      )}
                      {config.chartType === 'bar' && (
                        <HealthBarChart data={chartData} dataKey="value" xKey="time" color={config.color} name={config.label} height={130} />
                      )}

                      {/* Recent readings */}
                      <div className="mt-2.5 space-y-0">
                        {readings.slice(-4).reverse().map((r, i) => {
                          const rl = getRiskLevel(r.value, config.thresholds);
                          return (
                            <div
                              key={i}
                              className="flex items-center py-1.5"
                              style={i < readings.slice(-4).length - 1 ? { borderBottom: '0.5px solid hsl(var(--border) / 0.4)' } : {}}
                            >
                              <div className="w-[6px] h-[6px] rounded-full mr-2" style={{ backgroundColor: riskMeta[rl].dot }} />
                              <span className="text-[11px] text-muted-foreground flex-1">
                                {new Date(r.recorded_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </span>
                              <span className="text-[11px] font-semibold text-foreground">
                                {config.format ? config.format(r.value) : r.value} {config.unit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Sleep Analysis ── */}
      {sleepTypes.length > 0 && (
        <div className="px-4 mt-5">
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2.5">
            Sleep Analysis
          </p>
          <div className="grid grid-cols-2 gap-3">
            {sleepTypes.filter((t) => SLEEP_CONFIG[t]).map((type) => {
              const cfg = SLEEP_CONFIG[type];
              const readings = vitalsByType[type];
              if (!readings || readings.length === 0) return null;
              const latest = readings[readings.length - 1];
              const risk = getRiskLevel(latest.value, cfg.thresholds);
              const unit = type === 'sleep_wakeups' ? '' : 'h';
              return (
                <div
                  key={type}
                  className="bg-card rounded-[10px] px-3.5 py-3 flex items-center gap-3"
                  style={{ border: '0.5px solid hsl(var(--border))' }}
                >
                  <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: riskMeta[risk].dot }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-muted-foreground block">{cfg.label}</span>
                    <span className="text-[17px] font-bold text-foreground leading-tight">
                      {type === 'sleep_wakeups' ? latest.value : latest.value.toFixed(1)}{unit}
                    </span>
                  </div>
                  <div
                    className="w-[8px] h-[28px] rounded-full"
                    style={{ backgroundColor: cfg.color, opacity: 0.3 }}
                  >
                    <div
                      className="rounded-full"
                      style={{
                        backgroundColor: cfg.color,
                        width: '100%',
                        height: `${Math.min((latest.value / cfg.thresholds[3]) * 100, 100)}%`,
                        marginTop: 'auto',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom spacing */}
      <div className="h-4" />
    </div>
  );
}
