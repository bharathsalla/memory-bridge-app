import { ReactNode } from 'react';
import { Wifi, Signal, Battery } from 'lucide-react';

interface iPhoneFrameProps {
  children: ReactNode;
}

export default function IPhoneFrame({ children }: iPhoneFrameProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="h-full w-full flex items-center justify-center bg-primary-foreground">
      {/* iPhone 14/15 Pro outer shell — exact logical resolution 393×852 */}
      <div className="relative rounded-[55px] overflow-hidden flex flex-col"
        style={{
          width: 393,
          height: 852,
          maxHeight: '100dvh',
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          boxShadow: '0 0 0 3px #2a2a4a, 0 0 0 6px #0d0d1a, 0 30px 90px rgba(15, 52, 96, 0.5), inset 0 1px 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Side buttons — titanium finish */}
        <div className="absolute left-[-3px] top-[160px] w-[3px] h-[35px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #3a3a5a, #2a2a4a)' }} />
        <div className="absolute left-[-3px] top-[210px] w-[3px] h-[60px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #3a3a5a, #2a2a4a)' }} />
        <div className="absolute left-[-3px] top-[280px] w-[3px] h-[60px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #3a3a5a, #2a2a4a)' }} />
        <div className="absolute right-[-3px] top-[220px] w-[3px] h-[80px] rounded-r-sm" style={{ background: 'linear-gradient(180deg, #3a3a5a, #2a2a4a)' }} />

        {/* Screen bezel */}
        <div className="absolute inset-[4px] rounded-[51px] overflow-hidden flex flex-col bg-background">
          {/* iOS Status Bar */}
          <div className="relative z-50 flex items-center justify-between px-8 pt-[14px] pb-[6px] bg-background/80 backdrop-blur-xl">
            <span className="text-[15px] font-semibold text-foreground tracking-tight w-[54px] font-display">
              {timeStr}
            </span>
            {/* Dynamic Island */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[10px] w-[126px] h-[37px] bg-black rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)]" />
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
          <div className="relative z-50 flex justify-center pb-[8px] pt-[4px] bg-background">
            <div className="w-[134px] h-[5px] rounded-full bg-foreground/12" />
          </div>
        </div>
      </div>
    </div>
  );
}
