import { useEffect, useState, useCallback } from 'react';
import { Wifi, Signal, Battery, ChevronLeft, Share2, AlertTriangle, Clock, Check } from 'lucide-react';

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

/* ── Task type ── */
interface Task {
  id: number;
  priority: 'HIGH' | 'MEDIUM';
  title: string;
  chips?: string[];
  deadline?: string;
  completed: boolean;
  activating: boolean;
}

const initialTasks: Task[] = [
  { id: 1, priority: 'HIGH', title: 'Activate door alarms and GPS tracker', chips: ['🔒 Door Alarm', '📍 GPS Tracker'], deadline: 'By 10:30 PM tonight', completed: false, activating: false },
  { id: 2, priority: 'HIGH', title: 'Remove trip hazards and lock exit routes', deadline: 'Before 11:00 PM', completed: false, activating: false },
  { id: 3, priority: 'MEDIUM', title: 'Schedule 30-min afternoon nap', deadline: 'Tomorrow', completed: false, activating: false },
  { id: 4, priority: 'MEDIUM', title: 'Conduct 5-min guided breathing session', completed: false, activating: false },
];

/* ── Animated Checkmark ── */
function AnimatedCheckmark({ completing }: { completing: boolean }) {
  if (!completing) {
    return (
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: 28, height: 28, border: '1.5px solid rgba(60,60,67,0.2)' }}
      />
    );
  }
  return (
    <div className="relative" style={{ width: 28, height: 28 }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{ animation: 'checkGlowLight 2s ease-in-out infinite' }}
      />
      <svg width={28} height={28} viewBox="0 0 28 28">
        <circle cx={14} cy={14} r={12} fill="none" stroke="rgba(45,212,191,0.15)" strokeWidth={1.5} />
        <circle
          cx={14} cy={14} r={12} fill="none"
          stroke="#2dd4bf" strokeWidth={1.5} strokeLinecap="round"
          strokeDasharray={75.4} strokeDashoffset={0}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', animation: 'ringFillLight 1.2s ease-out forwards' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'checkScaleLight 0.4s ease-out 0.6s both' }}>
        <Check size={14} strokeWidth={2.5} color="#2dd4bf" />
      </div>
    </div>
  );
}

/* ── Completed Checkmark ── */
function CompletedCheckmark() {
  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{ width: 28, height: 28, backgroundColor: 'rgba(45,212,191,0.12)' }}
    >
      <Check size={14} strokeWidth={2.5} color="#2dd4bf" />
    </div>
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
        textTransform: 'uppercase' as const,
        padding: '3px 8px',
        borderRadius: 20,
        background: isHigh ? 'rgba(255,59,48,0.08)' : 'rgba(245,158,11,0.08)',
        border: `1px solid ${isHigh ? 'rgba(255,59,48,0.25)' : 'rgba(245,158,11,0.25)'}`,
        color: isHigh ? '#FF3B30' : '#f59e0b',
      }}
    >
      {level}
    </span>
  );
}

/* ── Task Card ── */
interface TaskCardProps {
  task: Task;
  onTap: (id: number) => void;
}

function TaskCard({ task, onTap }: TaskCardProps) {
  const { priority, title, chips, deadline, completed, activating } = task;
  const isHigh = priority === 'HIGH';
  const accentColor = isHigh ? '#FF3B30' : '#f59e0b';
  const isActive = activating && !completed;

  return (
    <div
      onClick={() => !completed && onTap(task.id)}
      style={{
        background: '#fff',
        border: isActive ? '1.5px solid rgba(45,212,191,0.4)' : '1px solid rgba(60,60,67,0.08)',
        borderRadius: 14,
        margin: '0 20px 12px',
        padding: isActive ? '18px 16px' : '16px',
        position: 'relative',
        overflow: 'hidden',
        cursor: completed ? 'default' : 'pointer',
        boxShadow: isActive
          ? '0 2px 16px rgba(45,212,191,0.1)'
          : '0 1px 3px rgba(0,0,0,0.04)',
        opacity: completed ? 0.55 : 1,
        transition: 'all 0.3s ease',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 4,
          backgroundColor: completed ? 'rgba(45,212,191,0.4)' : accentColor,
          borderRadius: '14px 0 0 14px',
          transition: 'background-color 0.3s',
        }}
      />

      {/* Top row */}
      <div className="flex items-center justify-between mb-2" style={{ paddingLeft: 10 }}>
        <PriorityBadge level={priority} />
        {completed ? (
          <CompletedCheckmark />
        ) : (
          <AnimatedCheckmark completing={isActive} />
        )}
      </div>

      {/* Title */}
      <p
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 15,
          fontWeight: completed ? 400 : isActive ? 600 : 500,
          color: completed ? 'rgba(60,60,67,0.4)' : '#000',
          lineHeight: 1.4,
          paddingLeft: 10,
          textDecoration: completed ? 'line-through' : 'none',
          transition: 'all 0.3s',
        }}
      >
        {title}
      </p>

      {/* Chips */}
      {chips && !completed && (
        <div className="flex gap-2 mt-2" style={{ paddingLeft: 10 }}>
          {chips.map((c, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: isActive ? '#2dd4bf' : 'rgba(60,60,67,0.5)',
                background: isActive ? 'rgba(45,212,191,0.06)' : 'rgba(60,60,67,0.04)',
                borderRadius: 8,
                padding: '3px 8px',
                transition: 'all 0.3s',
              }}
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row */}
      {(deadline || !completed) && (
        <div className="flex items-center justify-between mt-3" style={{ paddingLeft: 10 }}>
          {deadline && (
            <div className="flex items-center gap-1">
              <Clock size={10} color={isHigh ? '#FF8C42' : 'rgba(60,60,67,0.35)'} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: isHigh ? '#FF8C42' : 'rgba(60,60,67,0.35)' }}>{deadline}</span>
            </div>
          )}
          {!completed && (
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: isActive ? '#2dd4bf' : 'rgba(60,60,67,0.3)',
                fontStyle: isActive ? 'italic' : 'normal',
                transition: 'all 0.3s',
              }}
            >
              {isActive ? 'Activating...' : 'Tap to complete'}
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
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;
  const allDone = completedCount === tasks.length;

  const handleTap = useCallback((id: number) => {
    // First tap → activating state
    setTasks(prev => prev.map(t =>
      t.id === id && !t.activating && !t.completed
        ? { ...t, activating: true }
        : t
    ));
    // After animation → completed
    setTimeout(() => {
      setTasks(prev => prev.map(t =>
        t.id === id && t.activating ? { ...t, completed: true, activating: false } : t
      ));
    }, 1400);
  }, []);

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden" style={{ background: '#000' }}>
      {/* Keyframes */}
      <style>{`
        @keyframes alertPulseLight {
          0%, 100% { box-shadow: inset 4px 0 0 0 #FF3B30, 0 0 0 0 rgba(255,59,48,0); }
          50% { box-shadow: inset 4px 0 0 0 #FF3B30, 0 0 14px -2px rgba(255,59,48,0.15); }
        }
        @keyframes ringFillLight {
          from { stroke-dashoffset: 75.4; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes checkScaleLight {
          from { opacity: 0; transform: scale(0.4); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes checkGlowLight {
          0%, 100% { box-shadow: 0 0 4px rgba(45,212,191,0.1); }
          50% { box-shadow: 0 0 12px rgba(45,212,191,0.3); }
        }
        @keyframes countdownTick {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
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
          style={{ borderRadius: 'var(--frame-inner-radius, 0px)', backgroundColor: '#F2F2F7' }}
        >
          {/* Status bar */}
          <div
            className="relative z-50 flex items-center justify-between px-8 shrink-0"
            style={{ paddingTop: 14, paddingBottom: 6, height: 44, backgroundColor: 'rgba(242,242,247,0.85)', backdropFilter: 'blur(20px)' }}
          >
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600, color: '#000', width: 54, letterSpacing: -0.3 }}>10:19 PM</span>
            <div className="absolute left-1/2 -translate-x-1/2 bg-black hidden sm:block" style={{ top: 10, width: 126, height: 37, borderRadius: 20 }} />
            <div className="flex items-center gap-[5px]">
              <Signal className="w-4 h-4" strokeWidth={2.5} style={{ color: '#000' }} />
              <Wifi className="w-4 h-4" strokeWidth={2.5} style={{ color: '#000' }} />
              <Battery style={{ width: 25, height: 12, color: '#000' }} strokeWidth={2} />
            </div>
          </div>

          {/* Nav header */}
          <div
            className="relative z-50 flex items-center justify-between px-5 shrink-0"
            style={{ height: 52, borderBottom: '1px solid rgba(60,60,67,0.08)', backgroundColor: 'rgba(242,242,247,0.85)', backdropFilter: 'blur(20px)' }}
          >
            <ChevronLeft size={22} color="#2dd4bf" />
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 600, color: '#000' }}>Prevention Plan</span>
            <Share2 size={18} color="rgba(60,60,67,0.3)" />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto relative z-10" style={{ paddingBottom: 150 }}>
            {/* Alert banner */}
            <div
              className="flex items-center gap-3"
              style={{
                background: 'rgba(255,59,48,0.06)',
                padding: '14px 20px',
                animation: 'alertPulseLight 2s ease-in-out infinite',
              }}
            >
              <AlertTriangle size={16} color="#FF3B30" style={{ flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: '#FF3B30', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.3 }}>
                  Wandering Risk
                </p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(255,59,48,0.6)', marginTop: 2 }}>
                  HIGH · Predicted window: Next 30 minutes
                </p>
              </div>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 20,
                  fontWeight: 500,
                  color: '#FF3B30',
                  flexShrink: 0,
                  animation: 'countdownTick 2s ease-in-out infinite',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {countdown}
              </span>
            </div>

            {/* Section label */}
            <div className="flex items-center justify-between" style={{ padding: '16px 20px 8px' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(60,60,67,0.4)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                PRIORITY ACTIONS
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(60,60,67,0.4)' }}>
                {tasks.length} tasks · {tasks.filter(t => t.priority === 'HIGH').length} critical
              </span>
            </div>

            {/* Task cards */}
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} onTap={handleTap} />
            ))}
          </div>

          {/* Bottom fixed strip */}
          <div
            className="absolute bottom-0 left-0 right-0 z-30"
            style={{
              background: 'linear-gradient(to top, rgba(242,242,247,1) 70%, rgba(242,242,247,0))',
              padding: '20px 20px 36px',
            }}
          >
            <button
              disabled={!allDone}
              style={{
                width: '100%',
                height: 52,
                background: allDone ? 'rgba(45,212,191,0.12)' : 'rgba(60,60,67,0.04)',
                border: `1px solid ${allDone ? 'rgba(45,212,191,0.3)' : 'rgba(60,60,67,0.08)'}`,
                borderRadius: 14,
                fontFamily: "'Sora', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: allDone ? '#2dd4bf' : 'rgba(60,60,67,0.3)',
                cursor: allDone ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
              }}
            >
              Notify Care Team When Complete
            </button>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9,
                color: 'rgba(60,60,67,0.35)',
                textAlign: 'center',
                marginTop: 10,
              }}
            >
              {completedCount} of {tasks.length} tasks completed
            </p>
            {/* Progress bar */}
            <div
              style={{
                width: '100%',
                height: 3,
                backgroundColor: 'rgba(45,212,191,0.08)',
                borderRadius: 2,
                marginTop: 6,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#2dd4bf',
                  borderRadius: 2,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-0 left-0 right-0 z-50 flex justify-center" style={{ paddingBottom: 8, paddingTop: 4 }}>
            <div style={{ width: 134, height: 5, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.15)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
