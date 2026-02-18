import { ReactNode } from 'react';
import { Wifi, Signal, Battery } from 'lucide-react';

interface iPhoneFrameProps {
  children: ReactNode;
}

export default function IPhoneFrame({ children }: iPhoneFrameProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#1a1025] via-[#0d0a14] to-[#160e20]">
      {/* iPhone outer shell */}
      <div className="relative w-[393px] h-[852px] max-h-[100dvh] bg-gradient-to-b from-[#3a2845] to-[#2a1d35] rounded-[55px] shadow-[0_0_0_3px_#4a3558,0_0_0_6px_#1a1020,0_25px_80px_rgba(80,40,120,0.6)] overflow-hidden flex flex-col">
        {/* Side buttons */}
        <div className="absolute left-[-3px] top-[160px] w-[3px] h-[35px] bg-[#4a3558] rounded-l-sm" />
        <div className="absolute left-[-3px] top-[210px] w-[3px] h-[60px] bg-[#4a3558] rounded-l-sm" />
        <div className="absolute left-[-3px] top-[280px] w-[3px] h-[60px] bg-[#4a3558] rounded-l-sm" />
        <div className="absolute right-[-3px] top-[220px] w-[3px] h-[80px] bg-[#4a3558] rounded-r-sm" />

        {/* Screen bezel */}
        <div className="absolute inset-[4px] rounded-[51px] overflow-hidden flex flex-col bg-background">
          {/* iOS Status Bar */}
          <div className="relative z-50 flex items-center justify-between px-8 pt-[14px] pb-[6px] bg-background/80 backdrop-blur-xl">
            <span className="text-[15px] font-semibold text-foreground tracking-tight w-[54px]">
              {timeStr}
            </span>
            <div className="absolute left-1/2 -translate-x-1/2 top-[10px] w-[126px] h-[37px] bg-black rounded-full" />
            <div className="flex items-center gap-[5px]">
              <Signal className="w-[16px] h-[16px] text-foreground" strokeWidth={2.5} />
              <Wifi className="w-[16px] h-[16px] text-foreground" strokeWidth={2.5} />
              <Battery className="w-[25px] h-[12px] text-foreground" strokeWidth={2} />
            </div>
          </div>

          {/* App content */}
          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>

          {/* Home Indicator */}
          <div className="relative z-50 flex justify-center pb-[8px] pt-[4px] bg-background/90 backdrop-blur-sm">
            <div className="w-[134px] h-[5px] rounded-full bg-foreground/15" />
          </div>
        </div>
      </div>
    </div>
  );
}
