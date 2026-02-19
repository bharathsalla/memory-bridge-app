import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface CircularTimerProps {
  /** Elapsed seconds */
  seconds: number;
  /** Total duration for the ring (default 600 = 10 min) */
  total?: number;
  /** Size in px */
  size?: number;
  /** Label below the timer */
  label?: string;
}

export default function CircularTimer({ seconds, total = 600, size = 80, label }: CircularTimerProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(seconds / total, 1);
  const offset = circumference * (1 - progress);

  // Color based on remaining time
  const remaining = total - seconds;
  const ringColor =
    remaining <= 10 ? 'hsl(0, 84%, 60%)' :    // red
    remaining <= 30 ? 'hsl(36, 100%, 50%)' :   // orange
    'hsl(174, 72%, 56%)';                       // teal

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
          />
        </svg>
        {/* Center time */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[16px] font-bold text-foreground leading-none">{formatTime(seconds)}</span>
          <Timer className="w-3 h-3 text-muted-foreground mt-0.5" />
        </div>
      </div>
      {label && (
        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      )}
    </div>
  );
}