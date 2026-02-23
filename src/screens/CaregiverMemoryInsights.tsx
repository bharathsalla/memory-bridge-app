import { useState, useMemo } from 'react';
import { Loader2, RefreshCw, Heart, Activity, Droplets, Thermometer, Weight, Footprints, Moon, Wind, ChevronRight, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import IconBox, { iosColors } from '@/components/ui/IconBox';
import {
  ChartCard, HealthAreaChart, HealthBarChart, HealthLineChart,
  ChartLegendItem, ActivityRing, ChartInsight, chartColors,
} from '@/components/ui/AppleHealthCharts';
import { useVitals } from '@/hooks/useCareData';

// ─── Vital Category Config ─────────────────────────────────────
interface VitalConfig {
  label: string;
  unit: string;
  icon: typeof Heart;
  color: string;
  chartType: 'area' | 'line' | 'bar' | 'ring';
  // Thresholds: [lowDanger, lowSafe, highSafe, highDanger]
  thresholds: [number, number, number, number];
  format?: (v: number) => string;
}

const VITAL_CONFIGS: Record<string, VitalConfig> = {
  heart_rate: {
    label: 'Heart Rate',
    unit: 'bpm',
    icon: Heart,
    color: chartColors.red,
    chartType: 'area',
    thresholds: [50, 60, 100, 120],
  },
  hrv: {
    label: 'Heart Rate Variability',
    unit: 'ms',
    icon: Activity,
    color: chartColors.purple,
    chartType: 'line',
    thresholds: [20, 30, 70, 100],
  },
  spo2: {
    label: 'Blood Oxygen',
    unit: '%',
    icon: Droplets,
    color: chartColors.blue,
    chartType: 'area',
    thresholds: [88, 94, 100, 100],
  },
  blood_pressure: {
    label: 'Blood Pressure',
    unit: 'mmHg',
    icon: Activity,
    color: chartColors.red,
    chartType: 'bar',
    thresholds: [80, 90, 130, 150],
    format: (v) => `${v}`,
  },
  temperature: {
    label: 'Body Temperature',
    unit: '°C',
    icon: Thermometer,
    color: chartColors.orange,
    chartType: 'line',
    thresholds: [35.0, 36.1, 37.2, 38.0],
    format: (v) => v.toFixed(1),
  },
  weight: {
    label: 'Weight',
    unit: 'kg',
    icon: Weight,
    color: chartColors.indigo,
    chartType: 'bar',
    thresholds: [40, 50, 90, 110],
    format: (v) => v.toFixed(1),
  },
  steps: {
    label: 'Steps',
    unit: 'steps',
    icon: Footprints,
    color: chartColors.green,
    chartType: 'bar',
    thresholds: [0, 2000, 10000, 20000],
    format: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`,
  },
  barometric_pressure: {
    label: 'Barometric Pressure',
    unit: 'mb',
    icon: Wind,
    color: chartColors.teal,
    chartType: 'line',
    thresholds: [980, 1000, 1020, 1040],
  },
};

// Sleep types grouped together
const SLEEP_TYPES = ['sleep', 'sleep_deep', 'sleep_light', 'sleep_rem', 'sleep_awake', 'sleep_wakeups'];

const SLEEP_CONFIG: Record<string, { label: string; color: string; thresholds: [number, number, number, number] }> = {
  sleep: { label: 'Total Sleep', color: chartColors.indigo, thresholds: [4, 6, 9, 12] },
  sleep_deep: { label: 'Deep Sleep', color: chartColors.purple, thresholds: [0.3, 0.8, 2.5, 4] },
  sleep_light: { label: 'Light Sleep', color: chartColors.blue, thresholds: [0.5, 1.5, 4, 6] },
  sleep_rem: { label: 'REM Sleep', color: chartColors.teal, thresholds: [0.3, 0.8, 2.5, 4] },
  sleep_awake: { label: 'Awake Time', color: chartColors.orange, thresholds: [0, 0, 1.5, 3] },
  sleep_wakeups: { label: 'Wake-ups', color: chartColors.red, thresholds: [0, 0, 4, 8] },
};

// ─── Risk Stage Helper ─────────────────────────────────────────
type RiskLevel = 'low' | 'moderate' | 'high';

function getRiskLevel(value: number, thresholds: [number, number, number, number]): RiskLevel {
  const [lowDanger, lowSafe, highSafe, highDanger] = thresholds;
  if (value <= lowDanger || value >= highDanger) return 'high';
  if (value <= lowSafe || value >= highSafe) return 'moderate';
  return 'low';
}

const riskColors: Record<RiskLevel, { bg: string; text: string; label: string; dot: string }> = {
  low: { bg: 'bg-success/10', text: 'text-success', label: 'Normal', dot: 'bg-success' },
  moderate: { bg: 'bg-warning/10', text: 'text-warning', label: 'Moderate', dot: 'bg-warning' },
  high: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'High Risk', dot: 'bg-destructive' },
};

// ─── Format time for chart axis ────────────────────────────────
function formatAxisTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Main Component ────────────────────────────────────────────
export default function CaregiverMemoryInsights() {
  const { data: vitals = [], isLoading, refetch, isRefetching } = useVitals();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Group vitals by type
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
    // Sort each group by time ascending for charts
    Object.values(grouped).forEach((arr) => arr.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()));
    return grouped;
  }, [vitals]);

  // Separate regular vitals and sleep vitals
  const regularTypes = useMemo(() => 
    Object.keys(vitalsByType).filter((t) => !SLEEP_TYPES.includes(t) && VITAL_CONFIGS[t]),
    [vitalsByType]
  );
  const sleepTypes = useMemo(() =>
    Object.keys(vitalsByType).filter((t) => SLEEP_TYPES.includes(t)),
    [vitalsByType]
  );

  // Summary metrics for the top cards
  const summaryMetrics = useMemo(() => {
    const metrics: { type: string; label: string; value: string; risk: RiskLevel; icon: typeof Heart; color: string }[] = [];
    regularTypes.forEach((type) => {
      const config = VITAL_CONFIGS[type];
      const readings = vitalsByType[type];
      if (!readings || readings.length === 0 || !config) return;
      const latest = readings[readings.length - 1];
      const risk = getRiskLevel(latest.value, config.thresholds);
      metrics.push({
        type,
        label: config.label,
        value: config.format ? config.format(latest.value) : `${latest.value}`,
        risk,
        icon: config.icon,
        color: config.color,
      });
    });
    return metrics;
  }, [regularTypes, vitalsByType]);

  // Overall health score
  const overallRisk = useMemo(() => {
    const highCount = summaryMetrics.filter((m) => m.risk === 'high').length;
    const modCount = summaryMetrics.filter((m) => m.risk === 'moderate').length;
    if (highCount > 0) return 'high' as RiskLevel;
    if (modCount >= 2) return 'moderate' as RiskLevel;
    return 'low' as RiskLevel;
  }, [summaryMetrics]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center ios-grouped-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-[13px] text-muted-foreground">Loading health vitals...</span>
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
          <p className="text-[13px] text-muted-foreground">Health vitals will appear here once recorded from the patient's devices.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto ios-grouped-bg pb-6">
      {/* iOS Large Title Header */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-ios-large-title text-foreground">Insights</h1>
          <button onClick={() => refetch()} disabled={isRefetching} className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <RefreshCw className={`w-4 h-4 text-primary ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-[15px] text-muted-foreground mt-1">Health vitals & risk analysis</p>
      </div>

      {/* Overall Health Status */}
      <div className="px-6 mt-2">
        <div className={`rounded-2xl p-4 ${riskColors[overallRisk].bg}`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${riskColors[overallRisk].dot}`} />
            <div className="flex-1">
              <div className={`text-[15px] font-bold ${riskColors[overallRisk].text}`}>
                Overall Status: {riskColors[overallRisk].label}
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                {summaryMetrics.length} vitals monitored · {summaryMetrics.filter(m => m.risk === 'high').length} alerts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Stage Legend */}
      <div className="px-6 mt-4">
        <div className="flex items-center gap-4">
          {(['low', 'moderate', 'high'] as RiskLevel[]).map((level) => (
            <div key={level} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${riskColors[level].dot}`} />
              <span className="text-[10px] font-medium text-muted-foreground">{riskColors[level].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Ring Cards */}
      <div className="px-6 mt-4">
        <div className="grid grid-cols-3 gap-2.5">
          {summaryMetrics.slice(0, 6).map((m) => {
            const config = VITAL_CONFIGS[m.type];
            const readings = vitalsByType[m.type];
            const latest = readings[readings.length - 1];
            const pct = Math.min(latest.value / config.thresholds[3], 1) * 100;
            return (
              <div key={m.type} className="ios-card-elevated p-3 flex flex-col items-center">
                <ActivityRing
                  value={Math.round(pct)}
                  max={100}
                  color={riskColors[m.risk].dot === 'bg-success' ? chartColors.green : riskColors[m.risk].dot === 'bg-warning' ? chartColors.orange : riskColors[m.risk].dot === 'bg-destructive' ? chartColors.red : m.color}
                  size={56}
                  strokeWidth={5}
                  label=""
                  unit="%"
                />
                <span className="text-[11px] font-bold text-foreground mt-1.5 text-center leading-tight">{m.value}</span>
                <span className="text-[9px] text-muted-foreground text-center leading-tight">{config.unit}</span>
                <div className={`mt-1 px-1.5 py-0.5 rounded-full ${riskColors[m.risk].bg}`}>
                  <span className={`text-[8px] font-bold ${riskColors[m.risk].text}`}>{riskColors[m.risk].label.toUpperCase()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Vital Charts */}
      {regularTypes.map((type) => {
        const config = VITAL_CONFIGS[type];
        const readings = vitalsByType[type];
        if (!config || !readings || readings.length === 0) return null;

        const latest = readings[readings.length - 1];
        const risk = getRiskLevel(latest.value, config.thresholds);
        const isExpanded = expandedCard === type;
        const chartData = readings.map((r) => ({
          time: formatAxisTime(r.recorded_at),
          value: r.value,
        }));

        // Trend calculation
        const prev = readings.length >= 2 ? readings[readings.length - 2].value : latest.value;
        const trendDir = latest.value > prev ? 'up' : latest.value < prev ? 'down' : 'stable';

        const Icon = config.icon;

        return (
          <div key={type} className="px-6 mt-4">
            <button
              onClick={() => setExpandedCard(isExpanded ? null : type)}
              className="w-full text-left"
            >
              <div className="ios-card-elevated overflow-hidden">
                {/* Header row */}
                <div className="p-4 flex items-center gap-3">
                  <IconBox Icon={Icon} color={config.color} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold text-foreground">{config.label}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[13px] font-semibold text-foreground">
                        {config.format ? config.format(latest.value) : latest.value} {config.unit}
                      </span>
                      {trendDir === 'up' && <TrendingUp className="w-3.5 h-3.5 text-destructive" />}
                      {trendDir === 'down' && <TrendingDown className="w-3.5 h-3.5 text-success" />}
                      {trendDir === 'stable' && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full ${riskColors[risk].bg}`}>
                      <span className={`text-[10px] font-bold ${riskColors[risk].text}`}>{riskColors[risk].label.toUpperCase()}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Risk Stage Bar */}
                <div className="px-4 pb-3">
                  <div className="h-1.5 rounded-full overflow-hidden flex">
                    <div className="flex-1 bg-destructive/20" />
                    <div className="flex-1 bg-warning/20" />
                    <div className="flex-1 bg-success/20" />
                    <div className="flex-1 bg-warning/20" />
                    <div className="flex-1 bg-destructive/20" />
                  </div>
                  {/* Indicator dot */}
                  <div className="relative h-0">
                    {(() => {
                      const [ld, ls, hs, hd] = config.thresholds;
                      const range = hd - ld;
                      const pos = range > 0 ? Math.min(Math.max((latest.value - ld) / range, 0), 1) * 100 : 50;
                      return (
                        <div
                          className={`absolute -top-[5px] w-2.5 h-2.5 rounded-full border-2 border-card ${riskColors[risk].dot}`}
                          style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                        />
                      );
                    })()}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[8px] text-muted-foreground">{config.thresholds[0]}</span>
                    <span className="text-[8px] text-success font-semibold">Safe Range</span>
                    <span className="text-[8px] text-muted-foreground">{config.thresholds[3]}</span>
                  </div>
                </div>

                {/* Expanded Chart */}
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="border-t border-border/30 pt-3">
                      {config.chartType === 'area' && (
                        <HealthAreaChart data={chartData} dataKey="value" xKey="time" color={config.color} name={config.label} height={140} />
                      )}
                      {config.chartType === 'line' && (
                        <HealthLineChart
                          data={chartData}
                          xKey="time"
                          lines={[{ key: 'value', color: config.color, name: config.label }]}
                          height={140}
                        />
                      )}
                      {config.chartType === 'bar' && (
                        <HealthBarChart data={chartData} dataKey="value" xKey="time" color={config.color} name={config.label} height={140} />
                      )}
                      {/* Reading history */}
                      <div className="mt-3 space-y-1">
                        {readings.slice(-5).reverse().map((r, i) => {
                          const rLevel = getRiskLevel(r.value, config.thresholds);
                          return (
                            <div key={i} className="flex items-center gap-2 py-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${riskColors[rLevel].dot}`} />
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
          </div>
        );
      })}

      {/* Sleep Analysis Section */}
      {sleepTypes.length > 0 && (
        <div className="px-6 mt-6">
          <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-3">Sleep Analysis</p>

          {/* Sleep summary rings */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {sleepTypes.filter(t => SLEEP_CONFIG[t]).map((type) => {
              const config = SLEEP_CONFIG[type];
              const readings = vitalsByType[type];
              if (!readings || readings.length === 0) return null;
              const latest = readings[readings.length - 1];
              const risk = getRiskLevel(latest.value, config.thresholds);
              const unit = type === 'sleep_wakeups' ? '' : 'h';
              return (
                <div key={type} className="ios-card-elevated p-2.5 flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${riskColors[risk].dot} mb-1`} />
                  <span className="text-[16px] font-bold text-foreground">{type === 'sleep_wakeups' ? latest.value : latest.value.toFixed(1)}{unit}</span>
                  <span className="text-[9px] text-muted-foreground text-center leading-tight mt-0.5">{config.label}</span>
                </div>
              );
            })}
          </div>

          {/* Sleep bar chart */}
          {(() => {
            const sleepChartData = sleepTypes
              .filter(t => t !== 'sleep_wakeups' && t !== 'sleep' && vitalsByType[t])
              .map((type) => {
                const config = SLEEP_CONFIG[type];
                const readings = vitalsByType[type];
                const latest = readings[readings.length - 1];
                return { name: config.label.replace(' Sleep', ''), value: latest.value, color: config.color };
              });

            if (sleepChartData.length === 0) return null;

            return (
              <ChartCard
                title="Sleep Stages"
                subtitle="Last recorded night"
                icon={<Moon className="w-4 h-4" style={{ color: chartColors.indigo }} />}
                legend={
                  <>
                    {sleepChartData.map(d => (
                      <ChartLegendItem key={d.name} color={d.color} label={d.name} />
                    ))}
                  </>
                }
              >
                <HealthBarChart
                  data={sleepChartData}
                  dataKey="value"
                  xKey="name"
                  color={chartColors.indigo}
                  name="Hours"
                  height={120}
                />
              </ChartCard>
            );
          })()}
        </div>
      )}

      {/* Alerts for high-risk vitals */}
      {summaryMetrics.filter(m => m.risk !== 'low').length > 0 && (
        <div className="px-6 mt-5 mb-4">
          <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-3">Active Alerts</p>
          <div className="ios-card-elevated divide-y divide-border/30">
            {summaryMetrics.filter(m => m.risk !== 'low').map((m) => {
              const config = VITAL_CONFIGS[m.type];
              return (
                <div key={m.type} className="flex items-center gap-3 px-4" style={{ minHeight: 56 }}>
                  <AlertTriangle className={`w-4 h-4 ${riskColors[m.risk].text} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-foreground">{config.label}: {m.value} {config.unit}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {m.risk === 'high' ? 'Outside safe range — immediate attention needed' : 'Approaching threshold — monitor closely'}
                    </div>
                  </div>
                  <div className={`px-1.5 py-0.5 rounded-full ${riskColors[m.risk].bg}`}>
                    <span className={`text-[8px] font-bold ${riskColors[m.risk].text}`}>{m.risk.toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
