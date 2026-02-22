import { useEffect, useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Share, Signal, Wifi, Battery, Check, ChevronRight } from 'lucide-react';
import { Area, AreaChart, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from 'recharts';

/* ── Timing constants ── */
const T1 = 3000;   // HIGH phase ends
const T2 = 6000;   // Transition ends
const T3 = 7000;   // Resolved state begins

/* ── Phase type ── */
type Phase = 'high' | 'transitioning' | 'resolved';

/* ── Color interpolation ── */
function lerpColor(a: [number, number, number], b: [number, number, number], t: number): string {
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;
}

const RED: [number, number, number] = [255, 59, 48];
const AMBER: [number, number, number] = [255, 159, 10];
const GREEN: [number, number, number] = [52, 199, 89];
const TEAL: [number, number, number] = [0, 199, 190];

function getPhaseColor(elapsed: number): string {
  if (elapsed < T1) return lerpColor(RED, RED, 0);
  if (elapsed < T2) {
    const t = (elapsed - T1) / (T2 - T1);
    if (t < 0.5) return lerpColor(RED, AMBER, t * 2);
    return lerpColor(AMBER, GREEN, (t - 0.5) * 2);
  }
  return lerpColor(GREEN, GREEN, 0);
}

function getPhaseColorTeal(elapsed: number): string {
  if (elapsed < T1) return lerpColor(RED, RED, 0);
  if (elapsed < T2) {
    const t = (elapsed - T1) / (T2 - T1);
    if (t < 0.5) return lerpColor(RED, AMBER, t * 2);
    return lerpColor(AMBER, TEAL, (t - 0.5) * 2);
  }
  return lerpColor(TEAL, TEAL, 0);
}

/* ── Generate graph data based on elapsed ── */
function generateGraphData(elapsed: number) {
  const labels = ['9:50','9:53','9:56','9:59','10:02','10:05','10:08','10:11','10:14','10:17','10:19','10:21'];
  const highValues = [15, 18, 22, 28, 42, 55, 68, 78, 82, 80, 74, 70];
  const lowValues = [15, 18, 22, 28, 42, 55, 50, 40, 30, 24, 20, 18];

  const progress = elapsed < T1 ? 0 : elapsed >= T2 ? 1 : (elapsed - T1) / (T2 - T1);

  return labels.map((time, i) => {
    const high = highValues[i];
    const low = lowValues[i];
    const value = i <= 5 ? high : Math.round(high + (low - high) * progress);
    return { time, value, baseline: 20 };
  });
}

/* ── Number interpolation ── */
function lerpNum(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

/* ── Main page ── */
export default function RiskResolution() {
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<Phase>('high');
  const [showResolved, setShowResolved] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [checkDraw, setCheckDraw] = useState(false);
  const [greenWash, setGreenWash] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const frame = () => {
      const e = Date.now() - start;
      setElapsed(e);
      if (e < T1) setPhase('high');
      else if (e < T3) setPhase('transitioning');
      else setPhase('resolved');
      if (e < 12000) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, []);

  // Trigger resolved animations
  useEffect(() => {
    if (phase === 'resolved' && !showResolved) {
      setShowResolved(true);
      setGreenWash(true);
      setTimeout(() => setGreenWash(false), 1000);
      setTimeout(() => setCheckDraw(true), 200);
      setTimeout(() => setShowDetail(true), 500);
    }
  }, [phase, showResolved]);

  const progress = elapsed < T1 ? 0 : elapsed >= T2 ? 1 : (elapsed - T1) / (T2 - T1);
  const mainColor = getPhaseColor(elapsed);
  const graphColor = getPhaseColorTeal(elapsed);

  // Interpolated values
  const heartRate = lerpNum(98, 72, progress);
  const moveIndex = lerpNum(74, 18, progress);

  // Risk word
  const riskWord = progress < 0.33 ? 'HIGH' : progress < 0.66 ? 'MODERATE' : 'LOW';

  // Risk chip text
  const chipText = progress < 0.33 ? 'Wandering Risk · Active' : progress < 0.66 ? 'Risk Resolving...' : 'Risk Resolved';

  // Graph label
  const graphLabel = progress < 0.33 ? 'Elevated' : progress < 0.66 ? 'Returning to baseline' : 'Normal range';

  const data = useMemo(() => generateGraphData(elapsed), [Math.floor(elapsed / 50)]);

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden" style={{ background: '#F5F5F7' }}>
      <div
        className="relative overflow-hidden flex flex-col w-full h-full sm:w-[402px] sm:h-[874px]"
        style={{
          maxHeight: '100dvh',
          borderRadius: 'var(--frame-radius, 0px)',
          background: '#F2F2F7',
          boxShadow: 'var(--frame-shadow, none)',
        }}
      >
        {/* Side buttons */}
        <SideButtons />

        {/* Screen */}
        <div
          className="absolute overflow-hidden flex flex-col inset-0 sm:inset-[3px]"
          style={{ borderRadius: 'var(--frame-inner-radius, 0px)', backgroundColor: '#F2F2F7' }}
        >
          {/* Green wash overlay */}
          {greenWash && (
            <div
              className="absolute inset-0 z-[100] pointer-events-none"
              style={{
                background: 'rgba(52,199,89,0.06)',
                animation: 'greenWash 1s ease-out forwards',
              }}
            />
          )}

          <style>{`
            @keyframes greenWash { 0%{opacity:1} 100%{opacity:0} }
            @keyframes breathe { 0%,100%{opacity:1} 50%{opacity:.85} }
            @keyframes glowPulse { 0%,100%{box-shadow:0 0 8px rgba(${RED.join(',')},0.1)} 50%{box-shadow:0 0 20px rgba(${RED.join(',')},0.2)} }
            @keyframes sonarResolve { 0%{transform:scale(0);opacity:.4} 100%{transform:scale(3);opacity:0} }
            @keyframes slideUp { 0%{opacity:0;transform:translateY(16px)} 100%{opacity:1;transform:translateY(0)} }
            @keyframes drawCheck { 0%{stroke-dashoffset:20} 100%{stroke-dashoffset:0} }
            @keyframes dotPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(1.3)} }
            @keyframes liveDot { 0%,100%{opacity:1} 50%{opacity:.4} }
          `}</style>

          {/* Status bar */}
          <StatusBar />

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto pb-10" style={{ backgroundColor: '#F2F2F7' }}>
            {/* Nav bar */}
            <NavBar phase={phase} mainColor={mainColor} />

            <div className="px-4">
              {/* Risk card */}
              <RiskCard
                riskWord={riskWord}
                chipText={chipText}
                mainColor={mainColor}
                phase={phase}
                progress={progress}
                showResolved={showResolved}
                showDetail={showDetail}
                checkDraw={checkDraw}
              />

              {/* Movement graph */}
              <GraphCard
                data={data}
                graphColor={graphColor}
                graphLabel={graphLabel}
                mainColor={mainColor}
                phase={phase}
              />

              {/* Vitals row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <VitalCard
                  label="HEART RATE"
                  value={String(heartRate)}
                  unit="BPM"
                  color={heartRate > 85 ? mainColor : graphColor}
                  arrow={progress < 0.8 ? '↑' : '→'}
                  sub={progress < 0.5 ? 'Above baseline' : progress < 0.8 ? 'Decreasing' : 'Within normal range'}
                />
                <VitalCard
                  label="MOVEMENT INDEX"
                  value={String(moveIndex)}
                  unit=""
                  color={moveIndex > 40 ? mainColor : graphColor}
                  arrow={progress < 0.8 ? '↑' : '→'}
                  sub={progress < 0.5 ? 'High activity' : progress < 0.8 ? 'Settling' : 'Within normal range'}
                />
              </div>

              {/* Monitoring status */}
              <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#fff' }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 15, color: 'rgba(60,60,67,0.6)', fontWeight: 500 }}>Monitoring Status</span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="rounded-full"
                      style={{
                        width: 7, height: 7,
                        backgroundColor: mainColor,
                        animation: 'liveDot 1.5s ease-in-out infinite',
                      }}
                    />
                    <span style={{ fontSize: 13, color: mainColor, fontWeight: 600 }}>Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center shrink-0" style={{ paddingBottom: 8, paddingTop: 4, backgroundColor: 'rgba(242,242,247,0.85)' }}>
            <div style={{ width: 134, height: 5, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.15)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function SideButtons() {
  return (
    <>
      <div className="hidden sm:block absolute left-[-2.5px] top-[140px] w-[2.5px] h-[28px] rounded-l-sm" style={{ background: 'linear-gradient(180deg,#C4C4C6,#A8A8AC,#C4C4C6)' }} />
      <div className="hidden sm:block absolute left-[-2.5px] top-[195px] w-[2.5px] h-[52px] rounded-l-sm" style={{ background: 'linear-gradient(180deg,#C4C4C6,#A8A8AC,#C4C4C6)' }} />
      <div className="hidden sm:block absolute left-[-2.5px] top-[257px] w-[2.5px] h-[52px] rounded-l-sm" style={{ background: 'linear-gradient(180deg,#C4C4C6,#A8A8AC,#C4C4C6)' }} />
      <div className="hidden sm:block absolute right-[-2.5px] top-[210px] w-[2.5px] h-[80px] rounded-r-sm" style={{ background: 'linear-gradient(180deg,#C4C4C6,#A8A8AC,#C4C4C6)' }} />
    </>
  );
}

function StatusBar() {
  return (
    <div
      className="relative z-50 flex items-center justify-between px-8 shrink-0"
      style={{ paddingTop: 14, paddingBottom: 6, backgroundColor: 'rgba(242,242,247,0.85)', backdropFilter: 'blur(20px)' }}
    >
      <span className="text-[15px] font-semibold tracking-tight" style={{ width: 54, color: '#000' }}>10:19 PM</span>
      <div className="absolute left-1/2 -translate-x-1/2 bg-black hidden sm:block" style={{ top: 10, width: 126, height: 37, borderRadius: 20 }} />
      <div className="flex items-center gap-[5px]">
        <Signal className="w-4 h-4" strokeWidth={2.5} style={{ color: '#000' }} />
        <Wifi className="w-4 h-4" strokeWidth={2.5} style={{ color: '#000' }} />
        <Battery style={{ width: 25, height: 12, color: '#000' }} strokeWidth={2} />
      </div>
    </div>
  );
}

function NavBar({ phase, mainColor }: { phase: Phase; mainColor: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 mb-2">
      <ArrowLeft size={22} strokeWidth={2.5} style={{ color: '#00C7BE' }} />
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 17, fontWeight: 600, color: '#000', letterSpacing: -0.3 }}>Live Risk Monitor</span>
        <div
          className="rounded-full"
          style={{
            width: 8, height: 8,
            backgroundColor: mainColor,
            animation: 'liveDot 1s ease-in-out infinite',
            transition: 'background-color 0.5s',
          }}
        />
      </div>
      <Share size={20} strokeWidth={2} style={{ color: '#00C7BE' }} />
    </div>
  );
}

function RiskCard({
  riskWord, chipText, mainColor, phase, progress, showResolved, showDetail, checkDraw,
}: {
  riskWord: string; chipText: string; mainColor: string; phase: Phase;
  progress: number; showResolved: boolean; showDetail: boolean; checkDraw: boolean;
}) {
  const bgTint = progress < 0.33
    ? 'rgba(255,59,48,0.06)'
    : progress < 0.66
      ? 'rgba(255,159,10,0.05)'
      : 'rgba(52,199,89,0.05)';

  const borderColor = progress < 0.33
    ? 'rgba(255,59,48,0.25)'
    : progress < 0.66
      ? 'rgba(255,159,10,0.2)'
      : 'rgba(52,199,89,0.2)';

  const glowStyle = phase === 'high'
    ? { animation: 'glowPulse 2s ease-in-out infinite' }
    : phase === 'resolved'
      ? { boxShadow: `0 0 12px rgba(52,199,89,0.12)` }
      : {};

  return (
    <div
      className="rounded-2xl px-5 py-4 mb-4 relative overflow-hidden"
      style={{
        backgroundColor: bgTint,
        border: `1.5px solid ${borderColor}`,
        transition: 'background-color 0.5s, border-color 0.5s',
        ...glowStyle,
      }}
    >
      {/* Sonar resolve pulse */}
      {showResolved && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: '50%', left: '50%',
            width: 60, height: 60,
            marginTop: -30, marginLeft: -30,
            border: '2px solid rgba(52,199,89,0.3)',
            animation: 'sonarResolve 1.2s ease-out forwards',
          }}
        />
      )}

      <div className="flex items-center justify-between mb-1">
        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(60,60,67,0.5)', letterSpacing: 1.2 }}>RISK LEVEL</p>
        <div className="flex items-center gap-1.5">
          <div className="rounded-full" style={{ width: 6, height: 6, backgroundColor: mainColor, animation: 'liveDot 1s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: mainColor, letterSpacing: 0.5 }}>LIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1.5">
        <span
          style={{
            fontSize: 36, fontWeight: 800, color: mainColor, letterSpacing: -1.5,
            transition: 'color 0.4s',
            animation: phase === 'high' ? 'breathe 1.5s ease-in-out infinite' : 'none',
          }}
        >
          {riskWord}
        </span>
      </div>

      <div
        className="inline-flex items-center rounded-full px-2.5 py-0.5 mb-2"
        style={{
          backgroundColor: `${mainColor}15`,
          transition: 'background-color 0.5s',
        }}
      >
        <span style={{ fontSize: 12, color: mainColor, fontWeight: 500, transition: 'color 0.4s' }}>{chipText}</span>
      </div>

      {/* Resolved confirmation rows */}
      {showResolved && (
        <div style={{ animation: 'slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
          <div className="flex items-center gap-2 mt-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8.5L6.5 12L13 4"
                stroke="rgb(52,199,89)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 20,
                  strokeDashoffset: checkDraw ? 0 : 20,
                  transition: 'stroke-dashoffset 0.4s ease-out',
                }}
              />
            </svg>
            <span style={{ fontSize: 13, color: 'rgb(52,199,89)', fontWeight: 500 }}>Risk Resolved · 10:21 PM</span>
          </div>
        </div>
      )}

      {showDetail && (
        <div style={{ animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
          <p style={{ fontSize: 12, color: 'rgba(60,60,67,0.45)', marginTop: 6 }}>
            Nani returned to bedroom · Monitoring continues
          </p>
        </div>
      )}

      <p className="text-right mt-1" style={{ fontSize: 11, color: 'rgba(60,60,67,0.35)' }}>
        {progress >= 1 ? '10:21 PM' : '10:19 PM'}
      </p>
    </div>
  );
}

function GraphCard({
  data, graphColor, graphLabel, mainColor, phase,
}: {
  data: { time: string; value: number; baseline: number }[];
  graphColor: string; graphLabel: string; mainColor: string; phase: Phase;
}) {
  const chipBg = phase === 'high'
    ? 'rgba(255,59,48,0.08)'
    : phase === 'resolved'
      ? 'rgba(0,199,190,0.08)'
      : 'rgba(255,159,10,0.08)';

  return (
    <div className="rounded-2xl px-4 pt-4 pb-2 mb-4" style={{ backgroundColor: '#fff' }}>
      <div className="flex items-center justify-between mb-3">
        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(60,60,67,0.5)', letterSpacing: 1 }}>MOVEMENT ACTIVITY</p>
        <div className="rounded-full px-2 py-0.5" style={{ backgroundColor: chipBg, transition: 'background-color 0.5s' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: mainColor, transition: 'color 0.5s' }}>{graphLabel}</span>
        </div>
      </div>
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="rr-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={graphColor} stopOpacity={0.15} />
                <stop offset="100%" stopColor={graphColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: 'rgba(60,60,67,0.35)' }}
              axisLine={{ stroke: 'rgba(60,60,67,0.08)' }}
              tickLine={false}
              interval={2}
            />
            <YAxis hide domain={[0, 100]} />
            <ReferenceLine
              y={20}
              stroke="rgba(60,60,67,0.1)"
              strokeDasharray="4 4"
              label={{ value: 'Baseline', position: 'insideTopLeft', fontSize: 9, fill: 'rgba(60,60,67,0.3)' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={graphColor}
              strokeWidth={2.5}
              fill="url(#rr-fill)"
              dot={false}
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-1 mb-1">
        <div
          className="rounded-full"
          style={{
            width: 6, height: 6,
            backgroundColor: graphColor,
            animation: 'dotPulse 2s ease-in-out infinite',
          }}
        />
        <span style={{ fontSize: 10, color: 'rgba(60,60,67,0.4)' }}>Live data</span>
      </div>
    </div>
  );
}

function VitalCard({ label, value, unit, color, arrow, sub }: {
  label: string; value: string; unit: string; color: string; arrow: string; sub: string;
}) {
  return (
    <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#fff' }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(60,60,67,0.5)', letterSpacing: 0.8, marginBottom: 6 }}>{label}</p>
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize: 28, fontWeight: 700, color, letterSpacing: -1, transition: 'color 0.4s' }}>{value}</span>
        {unit && <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.4)' }}>{unit}</span>}
        <span style={{ fontSize: 14, color, transition: 'color 0.4s' }}>{arrow}</span>
      </div>
      <p style={{ fontSize: 11, color: 'rgba(60,60,67,0.45)', marginTop: 4 }}>{sub}</p>
    </div>
  );
}
