import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Area, AreaChart } from 'recharts';

/* ── helpers ── */
function useBlinkingDot(interval = 1000) {
  const [on, setOn] = useState(true);
  useEffect(() => { const id = setInterval(() => setOn(v => !v), interval); return () => clearInterval(id); }, [interval]);
  return on;
}

function generateMovementData() {
  const points: { time: string; value: number; baseline: number; forecast?: number }[] = [];
  const labels = [
    '9:19','9:25','9:31','9:37','9:43','9:49','9:55','10:01','10:07','10:13','10:19',
    '10:25','10:31','10:37','10:43','10:49'
  ];
  const values = [12, 14, 11, 13, 15, 18, 42, 68, 82, 74, 70, 0, 0, 0, 0, 0];
  const forecasts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 70, 62, 55, 50, 46, 42];
  labels.forEach((t, i) => {
    points.push({
      time: t,
      value: i <= 10 ? values[i] : 0,
      baseline: 20,
      forecast: i >= 10 ? forecasts[i] : undefined,
    });
  });
  return points;
}

/* ── main page ── */
export default function CrisisLive() {
  const dotOn = useBlinkingDot(800);
  const data = useMemo(generateMovementData, []);

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden" style={{ background: '#F2F2F7' }}>
      <div
        className="relative overflow-hidden flex flex-col w-full h-full sm:w-[402px] sm:h-[874px]"
        style={{
          maxHeight: '100dvh',
          borderRadius: 'var(--frame-radius, 0px)',
          background: '#1C1C1E',
          boxShadow: 'var(--frame-shadow, none)',
        }}
      >
        {/* Side buttons */}
        <div className="hidden sm:block absolute left-[-2.5px] top-[140px] w-[2.5px] h-[28px] rounded-l-sm" style={{ background: 'linear-gradient(180deg,#C4C4C6,#A8A8AC,#C4C4C6)' }} />
        <div className="hidden sm:block absolute left-[-2.5px] top-[195px] w-[2.5px] h-[52px] rounded-l-sm" style={{ background: 'linear-gradient(180deg,#C4C4C6,#A8A8AC,#C4C4C6)' }} />
        <div className="hidden sm:block absolute left-[-2.5px] top-[257px] w-[2.5px] h-[52px] rounded-l-sm" style={{ background: 'linear-gradient(180deg,#C4C4C6,#A8A8AC,#C4C4C6)' }} />
        <div className="hidden sm:block absolute right-[-2.5px] top-[210px] w-[2.5px] h-[80px] rounded-r-sm" style={{ background: 'linear-gradient(180deg,#C4C4C6,#A8A8AC,#C4C4C6)' }} />

        {/* Screen */}
        <div
          className="absolute overflow-hidden flex flex-col inset-0 sm:inset-[3px]"
          style={{ borderRadius: 'var(--frame-inner-radius, 0px)', backgroundColor: '#000' }}
        >
          {/* Status bar */}
          <StatusBar dotOn={dotOn} />

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 pb-10" style={{ backgroundColor: '#000' }}>
            {/* App header */}
            <div className="flex items-center justify-between mt-1 mb-4">
              <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: -0.4 }}>Calmora</span>
              <div className="flex items-center gap-1.5">
                <div
                  className="rounded-full"
                  style={{
                    width: 7, height: 7,
                    backgroundColor: dotOn ? '#FF3B30' : 'rgba(255,59,48,0.3)',
                    transition: 'background-color 0.3s',
                    boxShadow: dotOn ? '0 0 6px #FF3B30' : 'none',
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#FF3B30', letterSpacing: 0.5 }}>LIVE</span>
              </div>
            </div>

            {/* Patient card */}
            <div className="rounded-2xl px-4 py-3 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>Nani</span>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Savita Mehta · Home</p>
            </div>

            {/* Risk card */}
            <RiskCard dotOn={dotOn} />

            {/* Movement graph */}
            <div className="rounded-2xl px-4 pt-4 pb-2 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 12 }}>MOVEMENT ACTIVITY</p>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="moveGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#30D5C8" />
                        <stop offset="55%" stopColor="#30D5C8" />
                        <stop offset="75%" stopColor="#FF3B30" />
                        <stop offset="100%" stopColor="#FF3B30" />
                      </linearGradient>
                      <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF3B30" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#FF3B30" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                      tickLine={false}
                      interval={2}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <ReferenceLine y={20} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" label={{ value: 'Baseline', position: 'insideTopLeft', fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} />
                    {/* NOW marker */}
                    <ReferenceLine x="10:19" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" label={{ value: 'NOW', position: 'top', fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} />
                    <Area type="monotone" dataKey="value" stroke="url(#moveGrad)" strokeWidth={2.5} fill="url(#areaFill)" dot={false} />
                    <Line type="monotone" dataKey="forecast" stroke="#FFD60A" strokeWidth={2} strokeDasharray="6 4" dot={false} connectNulls={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-end gap-1 mt-1 mb-1">
                <div style={{ width: 16, height: 0, borderTop: '2px dashed #FFD60A' }} />
                <span style={{ fontSize: 10, color: '#FFD60A', opacity: 0.8 }}>30 min forecast</span>
              </div>
            </div>

            {/* Vitals row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <VitalCard label="HEART RATE" value="98" unit="BPM" color="#FF9F0A" arrow="↑" sub="Elevated from baseline" />
              <VitalCard label="MOVEMENT INDEX" value="74" unit="" color="#FF3B30" arrow="↑" sub="Above normal range" />
            </div>

            {/* Prevention plan row */}
            <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Prevention Plan</span>
              <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.25)' }}>→</span>
            </div>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center shrink-0" style={{ paddingBottom: 8, paddingTop: 4 }}>
            <div style={{ width: 134, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── sub-components ── */

function StatusBar({ dotOn }: { dotOn: boolean }) {
  return (
    <div className="relative z-50 flex items-center justify-between px-8 shrink-0" style={{ paddingTop: 14, paddingBottom: 6 }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', width: 54 }}>10:19 PM</span>
      <div className="absolute left-1/2 -translate-x-1/2 bg-black hidden sm:block" style={{ top: 10, width: 126, height: 37, borderRadius: 20 }} />
      <div className="flex items-center gap-[5px]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/></svg>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r="1"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="20" height="10" rx="2"/><line x1="23" y1="4.5" x2="23" y2="7.5"/></svg>
      </div>
    </div>
  );
}

function RiskCard({ dotOn }: { dotOn: boolean }) {
  return (
    <div
      className="rounded-2xl px-5 py-4 mb-4 relative overflow-hidden"
      style={{
        backgroundColor: 'rgba(255,59,48,0.12)',
        border: '1.5px solid rgba(255,59,48,0.5)',
        animation: 'riskPulse 2.5s ease-in-out infinite',
      }}
    >
      <style>{`
        @keyframes riskPulse {
          0%, 100% { box-shadow: 0 0 0px rgba(255,59,48,0), border-color: rgba(255,59,48,0.4); }
          50% { box-shadow: 0 0 20px rgba(255,59,48,0.25); border-color: rgba(255,59,48,0.8); }
        }
      `}</style>
      <div className="flex items-center justify-between mb-1">
        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.2 }}>RISK LEVEL</p>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>10:19 PM</span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span style={{ fontSize: 32, fontWeight: 800, color: '#FF3B30', letterSpacing: -1 }}>HIGH</span>
        <div
          className="rounded-full mt-1"
          style={{
            width: 8, height: 8,
            backgroundColor: dotOn ? '#FF3B30' : 'rgba(255,59,48,0.3)',
            transition: 'background-color 0.3s',
            boxShadow: dotOn ? '0 0 8px #FF3B30' : 'none',
          }}
        />
      </div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Escalating · Act within 30 min</p>
    </div>
  );
}

function VitalCard({ label, value, unit, color, arrow, sub }: { label: string; value: string; unit: string; color: string; arrow: string; sub: string }) {
  return (
    <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.8, marginBottom: 6 }}>{label}</p>
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize: 28, fontWeight: 700, color, letterSpacing: -1 }}>{value}</span>
        {unit && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{unit}</span>}
        <span style={{ fontSize: 14, color }}>{arrow}</span>
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{arrow} {sub}</p>
    </div>
  );
}
