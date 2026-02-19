/**
 * Apple Health-style chart components following iOS HIG.
 * - Smooth curved lines with gradient fill
 * - Rounded top bars (6px radius)
 * - Minimal axis labels in small gray
 * - White card container with 16px padding, 16px radius, subtle shadow
 * - Animate on load
 * - iOS-native tooltip style
 */
import { useState, useEffect, type ReactNode } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  type TooltipProps,
} from 'recharts';

// ─── iOS Chart Color Palette ───────────────────────────────────
export const chartColors = {
  teal: '#2AA6A0',
  orange: '#FF9500',
  red: '#FF3B30',
  blue: '#007AFF',
  purple: '#AF52DE',
  green: '#34C759',
  yellow: '#FFCC00',
  pink: '#FF2D55',
  indigo: '#5856D6',
  gray: 'hsl(var(--muted-foreground))',
  border: 'hsl(var(--border))',
  muted: 'hsl(var(--muted))',
} as const;

// ─── Shared Axis Config ────────────────────────────────────────
const axisTickStyle = { fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 };
const gridStyle = { strokeDasharray: '0', stroke: 'hsl(var(--border) / 0.4)', strokeWidth: 0.5 };

// ─── iOS Tooltip ───────────────────────────────────────────────
function IOSTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card shadow-lg px-3 py-2" style={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
      <p className="text-[11px] font-semibold text-foreground mb-0.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[10px] text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: p.color }} />
          {p.name}: <span className="font-bold text-foreground">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Chart Card Container ──────────────────────────────────────
interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  legend?: ReactNode;
  insight?: ReactNode;
}

export function ChartCard({ title, subtitle, icon, children, legend, insight }: ChartCardProps) {
  return (
    <div className="bg-card p-4" style={{ borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <div>
          <h3 className="text-[15px] font-bold text-foreground leading-tight">{title}</h3>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
      {legend && <div className="flex gap-3 mt-2.5 justify-center flex-wrap">{legend}</div>}
      {insight && <div className="mt-3">{insight}</div>}
    </div>
  );
}

export function ChartLegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
      {label}
    </span>
  );
}

// ─── Apple Health Area Chart ───────────────────────────────────
interface HealthAreaChartProps {
  data: any[];
  dataKey: string;
  xKey?: string;
  color?: string;
  height?: number;
  secondaryDataKey?: string;
  secondaryColor?: string;
  name?: string;
  secondaryName?: string;
}

export function HealthAreaChart({
  data, dataKey, xKey = 'day', color = chartColors.teal, height = 160,
  secondaryDataKey, secondaryColor = chartColors.blue, name, secondaryName,
}: HealthAreaChartProps) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 100); return () => clearTimeout(t); }, []);
  const gradId = `grad-${dataKey}-${Math.random().toString(36).slice(2, 6)}`;
  const gradId2 = `grad-${secondaryDataKey}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div style={{ opacity: animate ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            {secondaryDataKey && (
              <linearGradient id={gradId2} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={secondaryColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={secondaryColor} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis dataKey={xKey} tick={axisTickStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={35} />
          <Tooltip content={<IOSTooltip />} />
          <Area
            type="natural"
            dataKey={dataKey}
            name={name || dataKey}
            stroke={color}
            fill={`url(#${gradId})`}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
            animationDuration={1200}
            animationBegin={200}
          />
          {secondaryDataKey && (
            <Area
              type="natural"
              dataKey={secondaryDataKey}
              name={secondaryName || secondaryDataKey}
              stroke={secondaryColor}
              fill={`url(#${gradId2})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: secondaryColor, stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1200}
              animationBegin={400}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Apple Health Bar Chart ────────────────────────────────────
interface HealthBarChartProps {
  data: any[];
  dataKey: string;
  xKey?: string;
  color?: string;
  height?: number;
  secondaryDataKey?: string;
  secondaryColor?: string;
  name?: string;
  secondaryName?: string;
  stacked?: boolean;
  stackId?: string;
}

export function HealthBarChart({
  data, dataKey, xKey = 'day', color = chartColors.teal, height = 140,
  secondaryDataKey, secondaryColor = chartColors.gray, name, secondaryName,
  stacked, stackId,
}: HealthBarChartProps) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div style={{ opacity: animate ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barGap={4}>
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis dataKey={xKey} tick={axisTickStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={35} />
          <Tooltip content={<IOSTooltip />} />
          {secondaryDataKey && (
            <Bar
              dataKey={secondaryDataKey}
              name={secondaryName || secondaryDataKey}
              fill={secondaryColor}
              radius={[6, 6, 0, 0]}
              opacity={0.25}
              stackId={stacked ? (stackId || 'stack') : undefined}
              animationDuration={800}
              animationBegin={200}
            />
          )}
          <Bar
            dataKey={dataKey}
            name={name || dataKey}
            fill={color}
            radius={[6, 6, 0, 0]}
            stackId={stacked ? (stackId || 'stack') : undefined}
            animationDuration={800}
            animationBegin={400}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Stacked Bar Chart (Voice Patterns etc.) ───────────────────
interface HealthStackedBarChartProps {
  data: any[];
  keys: { key: string; color: string; name: string }[];
  xKey?: string;
  height?: number;
}

export function HealthStackedBarChart({ data, keys, xKey = 'day', height = 150 }: HealthStackedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={20}>
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis dataKey={xKey} tick={axisTickStyle} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={axisTickStyle} axisLine={false} tickLine={false} width={35} />
        <Tooltip content={<IOSTooltip />} />
        {keys.map((k, i) => (
          <Bar
            key={k.key}
            dataKey={k.key}
            name={k.name}
            stackId="a"
            fill={k.color}
            radius={i === keys.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
            animationDuration={800}
            animationBegin={200 + i * 200}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Apple Health Line Chart ───────────────────────────────────
interface HealthLineChartProps {
  data: any[];
  lines: { key: string; color: string; name: string }[];
  xKey?: string;
  height?: number;
}

export function HealthLineChart({ data, lines, xKey = 'time', height = 160 }: HealthLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis dataKey={xKey} tick={axisTickStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={35} />
        <Tooltip content={<IOSTooltip />} />
        {lines.map((l, i) => (
          <Line
            key={l.key}
            type="natural"
            dataKey={l.key}
            name={l.name}
            stroke={l.color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: l.color, stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: l.color, stroke: '#fff', strokeWidth: 2 }}
            animationDuration={1200}
            animationBegin={200 + i * 200}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Apple Health Radar Chart ──────────────────────────────────
interface HealthRadarChartProps {
  data: any[];
  dataKey: string;
  secondaryDataKey?: string;
  metricKey?: string;
  color?: string;
  secondaryColor?: string;
  height?: number;
  name?: string;
  secondaryName?: string;
}

export function HealthRadarChart({
  data, dataKey, secondaryDataKey, metricKey = 'metric',
  color = chartColors.teal, secondaryColor = chartColors.gray,
  height = 200, name, secondaryName,
}: HealthRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border) / 0.5)" />
        <PolarAngleAxis dataKey={metricKey} tick={{ ...axisTickStyle, fontSize: 9 }} />
        {secondaryDataKey && (
          <Radar
            name={secondaryName || secondaryDataKey}
            dataKey={secondaryDataKey}
            stroke={secondaryColor}
            fill={secondaryColor}
            fillOpacity={0.08}
            strokeDasharray="4 4"
          />
        )}
        <Radar
          name={name || dataKey}
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip content={<IOSTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── Apple Health Donut Chart ──────────────────────────────────
interface HealthDonutChartProps {
  data: { name: string; value: number; color: string }[];
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export function HealthDonutChart({ data, size = 120, innerRadius = 30, outerRadius = 55 }: HealthDonutChartProps) {
  return (
    <ResponsiveContainer width={size} height={size}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={3}
          dataKey="value"
          animationDuration={1000}
          animationBegin={200}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<IOSTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── iOS Activity Ring (Circular Progress) ─────────────────────
interface ActivityRingProps {
  value: number;
  max: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
  unit?: string;
}

export function ActivityRing({ value, max, color = chartColors.teal, size = 80, strokeWidth = 6, label, unit }: ActivityRingProps) {
  const [progress, setProgress] = useState(0);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  useEffect(() => {
    const t = setTimeout(() => setProgress(pct), 200);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[18px] font-bold text-foreground leading-none">{value}{unit}</span>
        </div>
      </div>
      {label && <span className="text-[10px] font-medium text-muted-foreground">{label}</span>}
    </div>
  );
}

// ─── Chart Insight Box ─────────────────────────────────────────
interface ChartInsightProps {
  icon: ReactNode;
  text: string;
  variant?: 'warning' | 'destructive' | 'info' | 'success';
}

export function ChartInsight({ icon, text, variant = 'info' }: ChartInsightProps) {
  const bgMap = {
    warning: 'bg-warning/8',
    destructive: 'bg-destructive/8',
    info: 'bg-primary/8',
    success: 'bg-success/8',
  };
  return (
    <div className={`p-2.5 rounded-xl ${bgMap[variant]} flex items-start gap-2`}>
      <span className="shrink-0 mt-0.5">{icon}</span>
      <span className="text-[11px] text-foreground leading-relaxed">{text}</span>
    </div>
  );
}
