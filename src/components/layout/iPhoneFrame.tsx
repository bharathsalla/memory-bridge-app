import { ReactNode, useEffect, useState } from 'react';
import { Wifi, Signal, Battery } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { getISTStatusBarTime } from '@/lib/timeUtils';

interface iPhoneFrameProps {
  children: ReactNode;
}

export default function IPhoneFrame({ children }: iPhoneFrameProps) {
  const [timeStr, setTimeStr] = useState(getISTStatusBarTime());
  useEffect(() => {
    const interval = setInterval(() => setTimeStr(getISTStatusBarTime()), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden bg-black" style={{ background: '#F2F2F7' }}>
      {/* iPhone 16 Pro — logical resolution 402×874, responsive on mobile */}
      <div
        className="relative overflow-hidden flex flex-col w-full h-full sm:w-[402px] sm:h-[874px] bg-black"
        style={{
          maxHeight: '100dvh',
          borderRadius: 'var(--frame-radius, 0px)',
          background: '#1C1C1E',
          boxShadow: 'var(--frame-shadow, none)'
        }}>

        {/* Side buttons — Natural Titanium style (desktop only) */}
        {/* Silent/Action button */}
        <div className="hidden sm:block absolute left-[-2.5px] top-[140px] w-[2.5px] h-[28px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />
        {/* Volume Up */}
        <div className="hidden sm:block absolute left-[-2.5px] top-[195px] w-[2.5px] h-[52px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />
        {/* Volume Down */}
        <div className="hidden sm:block absolute left-[-2.5px] top-[257px] w-[2.5px] h-[52px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />
        {/* Power/Side button */}
        <div className="hidden sm:block absolute right-[-2.5px] top-[210px] w-[2.5px] h-[80px] rounded-r-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />

        {/* Screen area */}
        <div
          className="absolute overflow-hidden flex flex-col inset-0 sm:inset-[3px]"
          style={{
            borderRadius: 'var(--frame-inner-radius, 0px)',
            backgroundColor: '#F2F2F7',
            overflow: 'hidden'
          }}>

          {/* iOS Status Bar */}
          <div
            className="relative z-50 flex items-center justify-between px-8 shrink-0"
            style={{
              paddingTop: 14,
              paddingBottom: 6,
              backgroundColor: 'rgba(242, 242, 247, 0.85)',
              backdropFilter: 'blur(20px)'
            }}>

            <span className="text-[15px] font-semibold text-foreground tracking-tight" style={{ width: 54 }}>
              {timeStr}
            </span>
            {/* Dynamic Island (desktop only) */}
            <div
              className="absolute left-1/2 -translate-x-1/2 bg-black hidden sm:block"
              style={{
                top: 10,
                width: 126,
                height: 37,
                borderRadius: 20
              }} />

            <div className="flex items-center gap-[5px]">
              <Signal className="w-4 h-4 text-foreground" strokeWidth={2.5} />
              <Wifi className="w-4 h-4 text-foreground" strokeWidth={2.5} />
              <Battery className="text-foreground" style={{ width: 25, height: 12 }} strokeWidth={2} />
            </div>
          </div>

          {/* App content */}
          <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: '#F2F2F7' }}>
            {children}
            {/* Toast containers inside the mobile frame */}
            <Toaster />
            <Sonner position="top-center" toastOptions={{ className: 'max-w-[90%] mx-auto' }} />
          </div>

          {/* Home Indicator */}
          <div
            className="relative z-50 flex justify-center shrink-0"
            style={{
              paddingBottom: 8,
              paddingTop: 4,
              backgroundColor: 'rgba(242, 242, 247, 0.85)'
            }}>

            <div className="bg-foreground/15" style={{ width: 134, height: 5, borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>);

}