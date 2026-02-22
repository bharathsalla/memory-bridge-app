import { useState, useEffect } from 'react';
import { Signal, Wifi, Battery, Share, Moon, Clock, ShieldCheck, Lock, MapPin, Activity } from 'lucide-react';

const ROWS = [
  { Icon: Moon, label: "Nani's Status", value: 'Safe · In bed', chip: 'SAFE', chipColor: '#34C759', chipBg: 'rgba(52,199,89,0.12)' },
  { Icon: Clock, label: 'Time Confirmed', value: '10:26 PM', chip: null },
  { Icon: ShieldCheck, label: 'Wandering Risk', value: 'Resolved', chip: 'RESOLVED', chipColor: '#34C759', chipBg: 'rgba(52,199,89,0.12)', checkmark: true },
  { Icon: Lock, label: 'Door Alarm', value: 'Active · Main entrance', chip: 'ARMED', chipColor: '#C44', chipBg: 'rgba(180,60,60,0.12)', redDot: true },
  { Icon: MapPin, label: 'GPS Location', value: 'Home · Chennai Apartment', chip: 'CONFIRMED', chipColor: '#34C759', chipBg: 'rgba(52,199,89,0.12)', greenDot: true },
  { Icon: Activity, label: 'Sleep Detected', value: 'Resting normally · Breathing steady', chip: 'RESTING', chipColor: '#8FB89A', chipBg: 'rgba(143,184,154,0.10)' },
];

export default function FinalStatus() {
  const [visibleRows, setVisibleRows] = useState(0);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setVisibleRows(i);
      if (i >= ROWS.length) clearInterval(iv);
    }, 150);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden" style={{ background: '#000' }}>
      <div
        className="relative overflow-hidden flex flex-col w-full h-full sm:w-[402px] sm:h-[874px]"
        style={{
          maxHeight: '100dvh',
          borderRadius: 'var(--frame-radius, 0px)',
          background: '#0B0E1A',
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
          style={{
            borderRadius: 'var(--frame-inner-radius, 0px)',
            background: 'linear-gradient(180deg, #0F1328 0%, #0B0E1A 30%, #0A0D18 100%)',
          }}
        >
          {/* Warm gold bleed top corners */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 60% 30% at 20% 0%, rgba(200,170,100,0.04) 0%, transparent 70%), radial-gradient(ellipse 60% 30% at 80% 0%, rgba(200,170,100,0.04) 0%, transparent 70%)',
          }} />
          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 50%, rgba(6,4,2,0.4) 100%)',
          }} />
          {/* Noise grain */}
          <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '128px' }} />

          {/* Status bar */}
          <div className="relative z-50 flex items-center justify-between px-8 shrink-0" style={{ paddingTop: 14, paddingBottom: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3, color: 'rgba(255,255,255,0.9)', width: 54 }}>10:26 PM</span>
            <div className="absolute left-1/2 -translate-x-1/2 bg-black hidden sm:block" style={{ top: 10, width: 126, height: 37, borderRadius: 20 }} />
            <div className="flex items-center gap-[5px]">
              <Signal className="w-4 h-4" strokeWidth={2.5} style={{ color: 'rgba(255,255,255,0.9)' }} />
              <Wifi className="w-4 h-4" strokeWidth={2.5} style={{ color: 'rgba(255,255,255,0.9)' }} />
              <Battery style={{ width: 25, height: 12, color: 'rgba(255,255,255,0.9)' }} strokeWidth={2} />
            </div>
          </div>

          {/* Nav bar */}
          <div className="flex items-center justify-between px-4 py-2 mb-1">
            <div style={{ width: 22 }} />
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.3 }}>Nani · Status</span>
              <div className="rounded-full" style={{ width: 8, height: 8, backgroundColor: '#34C759', boxShadow: '0 0 6px rgba(52,199,89,0.4)' }} />
            </div>
            <Share size={20} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 pb-10">
            {/* Patient nameplate */}
            <div className="mb-4 mt-2">
              <p style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,248,240,0.95)', letterSpacing: -0.8 }}>Nani</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: '"DM Mono", monospace', marginTop: 2 }}>Savita Mehta · Chennai Apartment</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: '"DM Mono", monospace', marginTop: 4 }}>Last updated 10:26 PM</p>
            </div>

            {/* Divider */}
            <div style={{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />

            {/* Status card */}
            <div className="rounded-2xl overflow-hidden relative" style={{
              backgroundColor: 'rgba(16,20,40,0.9)',
              border: '0.5px solid rgba(255,255,255,0.06)',
            }}>
              {/* Top edge warm highlight */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(210,180,120,0.12), transparent)' }} />

              {ROWS.map((row, i) => (
                <div key={i}>
                  <div
                    className="flex items-center gap-3 px-4"
                    style={{
                      minHeight: 68,
                      opacity: visibleRows > i ? 1 : 0,
                      transform: visibleRows > i ? 'translateY(0)' : 'translateY(8px)',
                      transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                    }}
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center shrink-0" style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <row.Icon size={18} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.4)' }} />
                    </div>
                    {/* Label + value */}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.85)', letterSpacing: -0.2 }}>{row.label}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: '"DM Mono", monospace', marginTop: 1 }}>{row.value}</p>
                    </div>
                    {/* Right chip or value */}
                    {row.chip ? (
                      <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 shrink-0" style={{ backgroundColor: row.chipBg }}>
                        {row.checkmark && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.5L5 9L9.5 3.5" stroke={row.chipColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                        {row.redDot && <div className="rounded-full" style={{ width: 5, height: 5, backgroundColor: row.chipColor }} />}
                        {row.greenDot && <div className="rounded-full" style={{ width: 5, height: 5, backgroundColor: row.chipColor }} />}
                        <span style={{ fontSize: 10, fontWeight: 600, color: row.chipColor, fontFamily: '"DM Mono", monospace', letterSpacing: 0.8 }}>{row.chip}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: '"DM Mono", monospace' }}>{row.value}</span>
                    )}
                  </div>
                  {/* Divider between rows */}
                  {i < ROWS.length - 1 && (
                    <div style={{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.04)', marginLeft: 56 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Footer text */}
            <p className="text-center mt-6" style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', fontFamily: '"DM Mono", monospace' }}>
              All systems active · Monitoring continues through the night
            </p>

            {/* Completed progress line */}
            <div className="mt-3 mx-8 rounded-full overflow-hidden" style={{ height: 2, backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: 'rgba(52,199,89,0.3)' }} />
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
