import { ReactNode } from 'react';
import { Wifi, Signal, Battery } from 'lucide-react';

interface iPhoneFrameProps {
  children: ReactNode;
}

export default function IPhoneFrame({ children }: iPhoneFrameProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="h-full w-full flex items-center justify-center bg-black">
      {/* iPhone 15 Pro — exact logical resolution 393×852 */}
      <div
        className="relative overflow-hidden flex flex-col"
        style={{
          width: 393,
          height: 852,
          maxHeight: '100dvh',
          borderRadius: 55,
          background: '#1C1C1E',
          boxShadow: '0 0 0 2px #3A3A3C, 0 0 0 4px #1C1C1E, 0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Side buttons — titanium style */}
        <div className="absolute left-[-2px] top-[155px] w-[2px] h-[32px] rounded-l-sm bg-[#3A3A3C]" />
        <div className="absolute left-[-2px] top-[200px] w-[2px] h-[55px] rounded-l-sm bg-[#3A3A3C]" />
        <div className="absolute left-[-2px] top-[265px] w-[2px] h-[55px] rounded-l-sm bg-[#3A3A3C]" />
        <div className="absolute right-[-2px] top-[210px] w-[2px] h-[76px] rounded-r-sm bg-[#3A3A3C]" />

        {/* Screen area */}
        <div
          className="absolute overflow-hidden flex flex-col"
          style={{
            inset: 3,
            borderRadius: 52,
            backgroundColor: '#F2F2F7',
          }}
        >
          {/* iOS Status Bar */}
          <div
            className="relative z-50 flex items-center justify-between px-8 shrink-0"
            style={{
              paddingTop: 14,
              paddingBottom: 6,
              backgroundColor: 'rgba(242, 242, 247, 0.85)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <span className="text-[15px] font-semibold text-foreground tracking-tight" style={{ width: 54 }}>
              {timeStr}
            </span>
            {/* Dynamic Island */}
            <div
              className="absolute left-1/2 -translate-x-1/2 bg-black"
              style={{
                top: 10,
                width: 126,
                height: 37,
                borderRadius: 20,
              }}
            />
            <div className="flex items-center gap-[5px]">
              <Signal className="w-4 h-4 text-foreground" strokeWidth={2.5} />
              <Wifi className="w-4 h-4 text-foreground" strokeWidth={2.5} />
              <Battery className="text-foreground" style={{ width: 25, height: 12 }} strokeWidth={2} />
            </div>
          </div>

          {/* App content */}
          <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: '#F2F2F7' }}>
            {children}
          </div>

          {/* Home Indicator */}
          <div
            className="relative z-50 flex justify-center shrink-0"
            style={{
              paddingBottom: 8,
              paddingTop: 4,
              backgroundColor: 'rgba(242, 242, 247, 0.85)',
            }}
          >
            <div className="bg-foreground/15" style={{ width: 134, height: 5, borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
