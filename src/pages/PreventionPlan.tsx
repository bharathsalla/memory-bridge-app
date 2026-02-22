import { useEffect, useState, useRef } from 'react';
import { Wifi, Signal, Battery, ChevronLeft, Share2, AlertTriangle, Clock } from 'lucide-react';

/* ── Countdown Hook ── */
function useCountdown(startSeconds: number) {
  const [seconds, setSeconds] = useState(startSeconds);
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ── Animated Checkmark ── */
function AnimatedCheckmark() {
  return (
    <div className="relative" style={{ width: 28, height: 28 }}>
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ animation: 'checkGlow 3s ease-in-out infinite', boxShadow: '0 0 12px rgba(45,212,191,0.4)' }}
      />
      <svg width={28} height={28} viewBox="0 0 28 28">
        {/* Background ring */}
        <circle cx={14} cy={14} r={12} fill="none" stroke="rgba(45,212,191,0.2)" strokeWidth={1.5} />
        {/* Animating ring */}
        <circle
          cx={14} cy={14} r={12} fill="none"
          stroke="#2dd4bf" strokeWidth={1.5} strokeLinecap="round"
          strokeDasharray={75.4} strokeDashoffset={7.54}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            animation: 'ringFill 1.2s ease-out forwards',
          }}
        />
        {/* Checkmark */}
        <path
          d="M9 14.5L12.5 18L19 11"
          fill="none" stroke="#2dd4bf" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: 'checkScale 0.4s ease-out 0.8s both' }}
        />
      </svg>
    </div>
  );
}

/* ── Empty Circle ── */
function EmptyCircle() {
  return (
    <div
      className="rounded-full"
      style={{ width: 28, height: 28, border: '1.5px solid #1e2d42' }}
    />
  );
}

/* ── Priority Badge ── */
function PriorityBadge({ level }: { level: 'HIGH' | 'MEDIUM' }) {
  const isHigh = level === 'HIGH';
  return (
    <span
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        borderRadius: 20,
        background: isHigh ? 'rgba(255,59,59,0.15)' : 'rgba(245,158,11,0.15)',
        border: `1px solid ${isHigh ? 'rgba(255,59,59,0.4)' : 'rgba(245,158,11,0.4)'}`,
        color: isHigh ? '#ff3b3b' : '#f59e0b',
      }}
    >
      {level}
    </span>
  );
}

/* ── Task Card ── */
interface TaskCardProps {
  priority: 'HIGH' | 'MEDIUM';
  title: string;
  chips?: string[];
  deadline?: string;
  rightText?: string;
  active?: boolean;
  accentColor: string;
}

function TaskCard({ priority, title, chips, deadline, rightText, active, accentColor }: TaskCardProps) {
  return (
    <div
      style={{
        background: active ? '#0e1a28' : '#0e1520',
        border: active ? '1.5px solid rgba(45,212,191,0.6)' : '1px solid #1e2d42',
        borderRadius: 14,
        margin: '0 20px 12px',
        padding: active ? '18px 16px' : '16px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: active
          ? '0 0 20px rgba(45,212,191,0.12), inset 0 0.5px 0 rgba(255,255,255,0.03)'
          : 'inset 0 0.5px 0 rgba(255,255,255,0.03)',
        animation: active ? 'cardGlow 3s ease-in-out infinite' : undefined,
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 4,
          backgroundColor: accentColor,
          borderRadius: '14px 0 0 14px',
        }}
      />

      {/* Top row */}
      <div className="flex items-center justify-between mb-2.5" style={{ paddingLeft: 8 }}>
        <PriorityBadge level={priority} />
        {active ? <AnimatedCheckmark /> : <EmptyCircle />}
      </div>

      {/* Title */}
      <p
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 15,
          fontWeight: active ? 600 : priority === 'HIGH' ? 500 : 400,
          color: active ? '#fff' : priority === 'HIGH' ? '#c8d8e8' : '#8a9db5',
          lineHeight: 1.4,
          paddingLeft: 8,
        }}
      >
        {title}
      </p>

      {/* Chips */}
      {chips && (
        <div className="flex gap-2 mt-2" style={{ paddingLeft: 8 }}>
          {chips.map((c, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: '#2dd4bf',
                background: 'rgba(45,212,191,0.08)',
                borderRadius: 8,
                padding: '3px 8px',
              }}
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row */}
      {(deadline || rightText) && (
        <div className="flex items-center justify-between mt-3" style={{ paddingLeft: 8 }}>
          {deadline && (
            <div className="flex items-center gap-1">
              <Clock size={10} color="#ff8c42" />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#ff8c42' }}>{deadline}</span>
            </div>
          )}
          {rightText && (
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: active ? '#2dd4bf' : '#3d5268',
                fontStyle: active ? 'italic' : 'normal',
              }}
            >
              {rightText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function PreventionPlan() {
  const countdown = useCountdown(29 * 60 + 47);

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden" style={{ background: '#000' }}>
      {/* Global keyframes */}
      <style>{`
        @keyframes alertPulse {
          0%, 100% { box-shadow: -4px 0 0 0 #ff3b3b, 0 0 0 0 rgba(255,59,59,0); }
          50% { box-shadow: -4px 0 0 0 #ff3b3b, -4px 0 16px 0 rgba(255,59,59,0.35); }
        }
        @keyframes ringFill {
          from { stroke-dashoffset: 75.4; }
          to { stroke-dashoffset: 7.54; }
        }
        @keyframes checkScale {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes checkGlow {
          0%, 100% { box-shadow: 0 0 6px rgba(45,212,191,0.2); }
          50% { box-shadow: 0 0 14px rgba(45,212,191,0.5); }
        }
        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(45,212,191,0.08), inset 0 0.5px 0 rgba(255,255,255,0.03); }
          50% { box-shadow: 0 0 28px rgba(45,212,191,0.18), inset 0 0.5px 0 rgba(255,255,255,0.03); }
        }
        @keyframes countdownPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

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
          style={{ borderRadius: 'var(--frame-inner-radius, 0px)', backgroundColor: '#0a1018' }}
        >
          {/* Vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-40"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)',
            }}
          />
          {/* Noise grain */}
          <div
            className="absolute inset-0 pointer-events-none z-40"
            style={{
              opacity: 0.03,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
            }}
          />

          {/* Status bar */}
          <div
            className="relative z-50 flex items-center justify-between px-8 shrink-0"
            style={{ paddingTop: 14, paddingBottom: 6, height: 44, backgroundColor: 'rgba(10,16,24,0.85)', backdropFilter: 'blur(20px)' }}
          >
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600, color: '#fff', width: 54, letterSpacing: -0.3 }}>10:19 PM</span>
            <div className="absolute left-1/2 -translate-x-1/2 bg-black hidden sm:block" style={{ top: 10, width: 126, height: 37, borderRadius: 20 }} />
            <div className="flex items-center gap-[5px]">
              <Signal className="w-4 h-4" strokeWidth={2.5} style={{ color: '#fff' }} />
              <Wifi className="w-4 h-4" strokeWidth={2.5} style={{ color: '#fff' }} />
              <Battery style={{ width: 25, height: 12, color: '#fff' }} strokeWidth={2} />
            </div>
          </div>

          {/* Nav header */}
          <div
            className="relative z-50 flex items-center justify-between px-5 shrink-0"
            style={{ height: 52, borderBottom: '1px solid #1e2d42', backgroundColor: 'rgba(10,16,24,0.85)', backdropFilter: 'blur(20px)' }}
          >
            <ChevronLeft size={22} color="#2dd4bf" />
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 600, color: '#fff' }}>Prevention Plan</span>
            <Share2 size={18} color="#3d5268" />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto relative z-10" style={{ paddingBottom: 140 }}>
            {/* Alert banner */}
            <div
              className="flex items-center gap-3"
              style={{
                background: 'rgba(255,59,59,0.14)',
                borderLeft: '4px solid #ff3b3b',
                padding: '14px 20px',
                animation: 'alertPulse 2s ease-in-out infinite',
              }}
            >
              <AlertTriangle size={16} color="#ff3b3b" style={{ flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: '#ff3b3b', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.3 }}>
                  Wandering Risk
                </p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(255,59,59,0.75)', marginTop: 2 }}>
                  HIGH · Predicted window: Next 30 minutes
                </p>
              </div>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 20,
                  fontWeight: 500,
                  color: '#ff3b3b',
                  flexShrink: 0,
                  animation: 'countdownPulse 2s ease-in-out infinite',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {countdown}
              </span>
            </div>

            {/* Section label */}
            <div className="flex items-center justify-between" style={{ padding: '16px 20px 8px' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#3d5268', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                PRIORITY ACTIONS
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#3d5268' }}>
                4 tasks · 2 critical
              </span>
            </div>

            {/* Task 1 — Active */}
            <TaskCard
              priority="HIGH"
              title="Activate door alarms and GPS tracker"
              chips={['🔒 Door Alarm', '📍 GPS Tracker']}
              deadline="By 10:30 PM tonight"
              rightText="Activating..."
              active
              accentColor="#2dd4bf"
            />

            {/* Task 2 — Default High */}
            <TaskCard
              priority="HIGH"
              title="Remove trip hazards and lock exit routes"
              deadline="Before 11:00 PM"
              rightText="Tap to complete"
              accentColor="#ff3b3b"
            />

            {/* Task 3 — Medium */}
            <TaskCard
              priority="MEDIUM"
              title="Schedule 30-min afternoon nap"
              deadline="Tomorrow"
              accentColor="#f59e0b"
            />

            {/* Task 4 — Medium */}
            <TaskCard
              priority="MEDIUM"
              title="Conduct 5-min guided breathing session"
              accentColor="#f59e0b"
            />
          </div>

          {/* Bottom fixed strip */}
          <div
            className="absolute bottom-0 left-0 right-0 z-30"
            style={{
              background: 'linear-gradient(to top, #080d14 70%, transparent)',
              padding: '20px 20px 36px',
            }}
          >
            <button
              style={{
                width: '100%',
                height: 52,
                background: 'rgba(45,212,191,0.08)',
                border: '1px solid rgba(45,212,191,0.2)',
                borderRadius: 14,
                fontFamily: "'Sora', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: '#2dd4bf',
                cursor: 'pointer',
                opacity: 0.6,
              }}
            >
              Notify Care Team When Complete
            </button>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9,
                color: '#3d5268',
                textAlign: 'center',
                marginTop: 10,
              }}
            >
              0 of 4 tasks completed
            </p>
            {/* Progress bar */}
            <div
              style={{
                width: '100%',
                height: 3,
                backgroundColor: 'rgba(45,212,191,0.1)',
                borderRadius: 2,
                marginTop: 6,
                overflow: 'hidden',
              }}
            >
              <div style={{ width: '0%', height: '100%', backgroundColor: '#2dd4bf', borderRadius: 2 }} />
            </div>
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-0 left-0 right-0 z-50 flex justify-center" style={{ paddingBottom: 8, paddingTop: 4 }}>
            <div style={{ width: 134, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
