import { useState, useEffect } from 'react';
import { Signal, Wifi, Battery, Share, Moon, Clock, ShieldCheck, Lock, MapPin, Activity, ChevronRight } from 'lucide-react';

const ROWS = [
  { Icon: Moon, label: "Nani's Status", value: 'Safe · In bed', chip: 'SAFE', chipColor: '#34C759', chipBg: 'rgba(52,199,89,0.10)' },
  { Icon: Clock, label: 'Time Confirmed', value: '10:26 PM', chip: null },
  { Icon: ShieldCheck, label: 'Wandering Risk', value: 'Resolved', chip: 'RESOLVED', chipColor: '#34C759', chipBg: 'rgba(52,199,89,0.10)', checkmark: true },
  { Icon: Lock, label: 'Door Alarm', value: 'Active · Main entrance', chip: 'ARMED', chipColor: '#FF3B30', chipBg: 'rgba(255,59,48,0.08)', redDot: true },
  { Icon: MapPin, label: 'GPS Location', value: 'Home · Chennai Apartment', chip: 'CONFIRMED', chipColor: '#34C759', chipBg: 'rgba(52,199,89,0.10)', greenDot: true },
  { Icon: Activity, label: 'Sleep Detected', value: 'Resting normally · Breathing steady', chip: 'RESTING', chipColor: '#8FB89A', chipBg: 'rgba(143,184,154,0.08)' },
];

const ICON_COLORS = ['#34C759', '#007AFF', '#34C759', '#FF9500', '#AF52DE', '#5AC8FA'];

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
          background: '#F2F2F7',
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
            style={{ paddingTop: 14, paddingBottom: 6, backgroundColor: 'rgba(242,242,247,0.85)', backdropFilter: 'blur(20px)' }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3, color: '#000', width: 54 }}>10:26 PM</span>
            <div className="absolute left-1/2 -translate-x-1/2 bg-black hidden sm:block" style={{ top: 10, width: 126, height: 37, borderRadius: 20 }} />
            <div className="flex items-center gap-[5px]">
              <Signal className="w-4 h-4" strokeWidth={2.5} style={{ color: '#000' }} />
              <Wifi className="w-4 h-4" strokeWidth={2.5} style={{ color: '#000' }} />
              <Battery style={{ width: 25, height: 12, color: '#000' }} strokeWidth={2} />
            </div>
          </div>

          {/* Nav bar */}
          <div className="flex items-center justify-between px-4 py-2 mb-1">
            <div style={{ width: 22 }} />
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 17, fontWeight: 600, color: '#000', letterSpacing: -0.3 }}>Nani · Status</span>
              <div className="rounded-full" style={{ width: 8, height: 8, backgroundColor: '#34C759', boxShadow: '0 0 4px rgba(52,199,89,0.3)' }} />
            </div>
            <Share size={20} strokeWidth={2} style={{ color: '#00C7BE' }} />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 pb-10" style={{ backgroundColor: '#F2F2F7' }}>
            {/* Patient nameplate */}
            <div className="mb-3 mt-1">
              <p style={{ fontSize: 28, fontWeight: 700, color: '#000', letterSpacing: -0.8 }}>Nani</p>
              <p style={{ fontSize: 13, color: 'rgba(60,60,67,0.5)', marginTop: 2 }}>Savita Mehta · Chennai Apartment</p>
              <p style={{ fontSize: 11, color: 'rgba(60,60,67,0.3)', marginTop: 4 }}>Last updated 10:26 PM</p>
            </div>

            {/* Status card — grouped list */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#fff' }}>
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
                    {/* IconBox */}
                    <div className="flex items-center justify-center shrink-0" style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: ICON_COLORS[i] }}>
                      <row.Icon size={20} strokeWidth={1.5} className="text-white" />
                    </div>
                    {/* Label + value */}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 15, fontWeight: 500, color: '#000', letterSpacing: -0.2 }}>{row.label}</p>
                      <p style={{ fontSize: 12, color: 'rgba(60,60,67,0.45)', marginTop: 1 }}>{row.value}</p>
                    </div>
                    {/* Right chip or value */}
                    {row.chip ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ backgroundColor: row.chipBg }}>
                          {row.checkmark && (
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.5L5 9L9.5 3.5" stroke={row.chipColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          )}
                          {row.redDot && <div className="rounded-full" style={{ width: 5, height: 5, backgroundColor: row.chipColor }} />}
                          {row.greenDot && <div className="rounded-full" style={{ width: 5, height: 5, backgroundColor: row.chipColor }} />}
                          <span style={{ fontSize: 10, fontWeight: 600, color: row.chipColor, letterSpacing: 0.6 }}>{row.chip}</span>
                        </div>
                        <ChevronRight size={16} strokeWidth={2} style={{ color: 'rgba(60,60,67,0.25)' }} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 shrink-0">
                        <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.45)' }}>{row.value}</span>
                        <ChevronRight size={16} strokeWidth={2} style={{ color: 'rgba(60,60,67,0.25)' }} />
                      </div>
                    )}
                  </div>
                  {/* Divider */}
                  {i < ROWS.length - 1 && (
                    <div style={{ height: 0.5, backgroundColor: 'rgba(60,60,67,0.08)', marginLeft: 64 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Monitoring status card */}
            <div className="rounded-xl px-4 py-3 mt-3" style={{ backgroundColor: '#fff' }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 15, color: 'rgba(60,60,67,0.6)', fontWeight: 500 }}>Monitoring Status</span>
                <div className="flex items-center gap-1.5">
                  <div className="rounded-full" style={{ width: 7, height: 7, backgroundColor: '#34C759' }} />
                  <span style={{ fontSize: 13, color: '#34C759', fontWeight: 600 }}>Active</span>
                </div>
              </div>
            </div>

            {/* Footer text */}
            <p className="text-center mt-5" style={{ fontSize: 11, color: 'rgba(60,60,67,0.25)' }}>
              All systems active · Monitoring continues through the night
            </p>

            {/* Progress bar */}
            <div className="mt-2 mx-8 rounded-full overflow-hidden" style={{ height: 3, backgroundColor: 'rgba(60,60,67,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: 'rgba(52,199,89,0.35)' }} />
            </div>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center shrink-0" style={{ paddingBottom: 8, paddingTop: 4, backgroundColor: 'rgba(242,242,247,0.85)' }}>
            <div style={{ width: 134, height: 5, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.15)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
