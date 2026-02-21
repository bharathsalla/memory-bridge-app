import { useState, useEffect } from 'react';
import { Flashlight, Camera } from 'lucide-react';
import { Wifi, Signal, Battery, Lock } from 'lucide-react';
import { getISTStatusBarTime } from '@/lib/timeUtils';
import memocareLogoSrc from '@/assets/memocare-logo.png';

export default function LockScreenNotifications() {
  const [timeStr, setTimeStr] = useState(getISTStatusBarTime());
  useEffect(() => {
    const interval = setInterval(() => setTimeStr(getISTStatusBarTime()), 30000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayName = dayNames[now.getDay()];
  const monthName = monthNames[now.getMonth()];
  const dateNum = now.getDate();

  // Format time as h:mm (large lock screen clock)
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const clockTime = `${hours > 12 ? hours - 12 : hours || 12}:${minutes}`;

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden" style={{ background: '#F2F2F7' }}>
      <div
        className="relative overflow-hidden flex flex-col w-full h-full sm:w-[402px] sm:h-[874px] bg-black"
        style={{
          maxHeight: '100dvh',
          borderRadius: 'var(--frame-radius, 0px)',
          boxShadow: 'var(--frame-shadow, none)',
        }}
      >
        {/* Side buttons — desktop only */}
        <div className="hidden sm:block absolute left-[-2.5px] top-[140px] w-[2.5px] h-[28px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />
        <div className="hidden sm:block absolute left-[-2.5px] top-[195px] w-[2.5px] h-[52px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />
        <div className="hidden sm:block absolute left-[-2.5px] top-[257px] w-[2.5px] h-[52px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />
        <div className="hidden sm:block absolute right-[-2.5px] top-[210px] w-[2.5px] h-[80px] rounded-r-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />

        {/* Screen area */}
        <div
          className="absolute overflow-hidden flex flex-col inset-0 sm:inset-[3px]"
          style={{
            borderRadius: 'var(--frame-inner-radius, 0px)',
            overflow: 'hidden',
          }}
        >
          {/* Dark wallpaper background */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1321 40%, #111827 100%)' }} />

          {/* Status Bar */}
          <div className="relative z-50 flex items-center justify-between px-8 shrink-0" style={{ paddingTop: 14, paddingBottom: 6 }}>
            <span className="text-[15px] font-semibold text-white tracking-tight" style={{ width: 54 }}>
              {timeStr}
            </span>
            <div
              className="absolute left-1/2 -translate-x-1/2 bg-black hidden sm:block"
              style={{ top: 10, width: 126, height: 37, borderRadius: 20 }}
            />
            <div className="flex items-center gap-[5px]">
              <Signal className="w-4 h-4 text-white" strokeWidth={2.5} />
              <Wifi className="w-4 h-4 text-white" strokeWidth={2.5} />
              <Battery className="text-white" style={{ width: 25, height: 12 }} strokeWidth={2} />
            </div>
          </div>

          {/* Lock icon + Date + Clock */}
          <div className="relative z-10 flex flex-col items-center" style={{ marginTop: 24 }}>
            <Lock className="w-[18px] h-[18px] text-white/70 mb-3" strokeWidth={2} />
            <p className="text-white/70 text-[16px] font-medium tracking-tight">
              {dayName}, {monthName} {dateNum}
            </p>
            <p className="text-white text-[82px] font-thin leading-none tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', marginTop: -4 }}>
              {clockTime}
            </p>
          </div>

          {/* Notifications */}
          <div className="relative z-10 flex flex-col gap-3 px-4" style={{ marginTop: 40 }}>
            {/* Notification 1 — Movement Alert (matching reference) */}
            <NotificationCard
              appName="CALMORA ALERT"
              time="now"
              title="Nani's movement patterns changed at 10:14 PM."
              details={[
                { label: 'WALKING PATTERN', value: '240% above night baseline' },
                { label: 'WANDERING RISK', value: 'HIGH · 78% confidence', isWarning: true },
                { label: 'PREDICTED WINDOW', value: 'Next 30 minutes' },
              ]}
            />

            {/* Notification 2 — Medication Reminder */}
            <NotificationCard
              appName="CALMORA"
              time="2m ago"
              title="💊 Medication reminder for Nani"
              details={[
                { label: 'MEDICATION', value: 'Donepezil 10mg — Evening dose' },
                { label: 'STATUS', value: 'Not yet taken' },
              ]}
            />

            {/* Notification 3 — Memory shared */}
            <NotificationCardSimple
              appName="CALMORA"
              time="15m ago"
              body={'Priya shared a new memory: "Beach day with grandkids" 📸'}
            />
          </div>

          {/* Bottom: Flashlight + Camera + Home Indicator */}
          <div className="relative z-10 mt-auto flex flex-col items-center" style={{ paddingBottom: 8 }}>
            <div className="flex items-center justify-between w-full px-12 mb-6">
              <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
                <Flashlight className="w-5 h-5 text-white" />
              </div>
              <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="bg-white/30" style={{ width: 134, height: 5, borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Notification Components ─── */

function NotificationCard({ appName, time, title, details }: {
  appName: string;
  time: string;
  title: string;
  details: { label: string; value: string; isWarning?: boolean }[];
}) {
  return (
    <div className="rounded-[20px] p-[14px] overflow-hidden" style={{ background: 'rgba(30, 30, 35, 0.82)', backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <img src={memocareLogoSrc} alt="" className="w-[20px] h-[20px] rounded-[5px]" />
          <span className="text-[12px] font-bold tracking-wider" style={{ color: '#E8863A' }}>{appName}</span>
        </div>
        <span className="text-[12px] text-white/40">{time}</span>
      </div>
      {/* Title */}
      <p className="text-[15px] font-semibold text-white leading-snug mb-2">{title}</p>
      {/* Separator */}
      <div className="h-px bg-white/10 mb-2" />
      {/* Details */}
      <div className="flex flex-col gap-1.5">
        {details.map((d, i) => (
          <div key={i}>
            <p className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">{d.label}</p>
            <p className={`text-[14px] font-medium leading-snug ${d.isWarning ? 'text-orange-400' : 'text-white/90'}`}>{d.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationCardSimple({ appName, time, body }: {
  appName: string;
  time: string;
  body: string;
}) {
  return (
    <div className="rounded-[20px] p-[14px] overflow-hidden" style={{ background: 'rgba(30, 30, 35, 0.82)', backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)' }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <img src={memocareLogoSrc} alt="" className="w-[20px] h-[20px] rounded-[5px]" />
          <span className="text-[12px] font-bold tracking-wider" style={{ color: '#E8863A' }}>{appName}</span>
        </div>
        <span className="text-[12px] text-white/40">{time}</span>
      </div>
      <p className="text-[14px] text-white/90 leading-snug">{body}</p>
    </div>
  );
}
