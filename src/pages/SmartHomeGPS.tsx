import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Share2, Lock, Wifi, Signal, Battery, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── types ─── */
type View = 'smarthome' | 'gps' | 'mapfull';
type AlarmState = 'disarmed' | 'arming' | 'armed';
type SlideDir = 'left' | 'right' | 'none';

export default function SmartHomeGPS() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('smarthome');
  const [prevView, setPrevView] = useState<View | null>(null);
  const [slideDir, setSlideDir] = useState<SlideDir>('none');
  const [alarm, setAlarm] = useState<AlarmState>('disarmed');
  const [armedTime, setArmedTime] = useState('');
  const [ripple, setRipple] = useState(false);
  const [letterReveal, setLetterReveal] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('just now');

  const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const goTo = useCallback((next: View) => {
    if (next === view) return;
    const order: View[] = ['smarthome', 'gps', 'mapfull'];
    const dir = order.indexOf(next) > order.indexOf(view) ? 'left' : 'right';
    setSlideDir(dir);
    setPrevView(view);
    setView(next);
    setTimeout(() => { setSlideDir('none'); setPrevView(null); }, 350);
  }, [view]);

  useEffect(() => {
    if (view === 'gps') {
      const t = setTimeout(() => goTo('mapfull'), 3000);
      return () => clearTimeout(t);
    }
  }, [view]);

  useEffect(() => {
    if (view !== 'gps' && view !== 'mapfull') return;
    const id = setInterval(() => {
      setLastUpdate('just now');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2500);
    }, 30000);
    return () => clearInterval(id);
  }, [view]);

  const handleArm = useCallback(() => {
    if (alarm !== 'disarmed') return;
    setAlarm('arming');
    setTimeout(() => {
      setRipple(true);
      setTimeout(() => setRipple(false), 800);
      setAlarm('armed');
      setArmedTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
      let i = 0;
      const iv = setInterval(() => { i++; setLetterReveal(i); if (i >= 5) clearInterval(iv); }, 80);
    }, 1200);
  }, [alarm]);

  const title = view === 'smarthome' ? 'Smart Home' : 'GPS Tracker';

  /* ─── Light theme colors ─── */
  const C = {
    pageBg: '#F2F2F7',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(0,0,0,.06)',
    text: '#1C1C1E',
    textSecondary: '#8E8E93',
    textTertiary: '#AEAEB2',
    teal: '#00C7BE',
    red: '#FF3B30',
    green: '#34C759',
    amber: '#FF9500',
    navBorder: 'rgba(0,0,0,.08)',
    statusBarBg: 'rgba(242,242,247,.85)',
  };

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden" style={{ background: '#000' }}>
      <style>{`
        @keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes armRipple { 0%{transform:scale(0);opacity:.25} 100%{transform:scale(8);opacity:0} }
        @keyframes redGlowLight { 0%,100%{box-shadow:0 0 6px rgba(255,59,48,.1)} 50%{box-shadow:0 0 18px rgba(255,59,48,.2)} }
        @keyframes liveDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        @keyframes slideInLeft { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes slideOutLeft { from{transform:translateX(0);opacity:1} to{transform:translateX(-100%);opacity:0} }
        @keyframes slideInRight { from{transform:translateX(-100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes slideOutRight { from{transform:translateX(0);opacity:1} to{transform:translateX(100%);opacity:0} }
        @keyframes toastSlide { 0%{transform:translateY(-30px);opacity:0} 15%{transform:translateY(0);opacity:1} 85%{transform:translateY(0);opacity:1} 100%{transform:translateY(-30px);opacity:0} }
        @keyframes mapExpand { from{transform:scale(.92);opacity:.8} to{transform:scale(1);opacity:1} }
        @keyframes buttonPress { 0%{transform:scale(1)} 50%{transform:scale(.96)} 100%{transform:scale(1)} }
        @keyframes spinDot { 0%,80%,100%{opacity:.3} 40%{opacity:1} }
      `}</style>

      <div className="relative overflow-hidden flex flex-col w-full h-full sm:w-[402px] sm:h-[874px]" style={{ maxHeight: '100dvh', borderRadius: 'var(--frame-radius, 0px)', background: '#1C1C1E', boxShadow: 'var(--frame-shadow, none)' }}>
        {/* Side buttons */}
        <div className="hidden sm:block absolute left-[-2.5px] top-[140px] w-[2.5px] h-[28px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />
        <div className="hidden sm:block absolute left-[-2.5px] top-[195px] w-[2.5px] h-[52px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />
        <div className="hidden sm:block absolute left-[-2.5px] top-[257px] w-[2.5px] h-[52px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />
        <div className="hidden sm:block absolute right-[-2.5px] top-[210px] w-[2.5px] h-[80px] rounded-r-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />

        {/* Screen area */}
        <div className="absolute overflow-hidden flex flex-col inset-0 sm:inset-[3px]" style={{ borderRadius: 'var(--frame-inner-radius, 0px)', backgroundColor: C.pageBg }}>

          {/* Status bar */}
          <div className="relative z-50 flex items-center justify-between px-8 shrink-0" style={{ paddingTop: 14, paddingBottom: 6, background: C.statusBarBg, backdropFilter: 'blur(20px)' }}>
            <span style={{ fontFamily: '-apple-system, SF Pro Text, system-ui', fontSize: 15, fontWeight: 600, color: C.text, width: 54 }}>
              {timeStr.replace(/ /g, '\u00A0')}
            </span>
            <div className="absolute left-1/2 -translate-x-1/2 bg-black hidden sm:block" style={{ top: 10, width: 126, height: 37, borderRadius: 20 }} />
            <div className="flex items-center gap-[5px]">
              <Signal className="w-4 h-4" style={{ color: C.text }} strokeWidth={2.5} />
              <Wifi className="w-4 h-4" style={{ color: C.text }} strokeWidth={2.5} />
              <Battery style={{ width: 25, height: 12, color: C.text }} strokeWidth={2} />
            </div>
          </div>

          {/* Nav bar */}
          <div className="flex items-center justify-between px-5 shrink-0" style={{ height: 52, borderBottom: `1px solid ${C.navBorder}`, background: C.cardBg }}>
            <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" style={{ color: C.teal }} /></button>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: '-apple-system, SF Pro Display, system-ui', fontSize: 17, fontWeight: 600, color: C.text }}>{title}</span>
              {(view === 'gps' || view === 'mapfull') && <div style={{ width: 6, height: 6, borderRadius: 3, background: C.green, animation: 'liveDot 2s ease-in-out infinite' }} />}
            </div>
            <button className="p-1"><Share2 className="w-5 h-5" style={{ color: C.teal }} /></button>
          </div>

          {/* Tab pills */}
          {view !== 'mapfull' && (
            <div className="flex gap-2 px-5 py-3 shrink-0" style={{ background: C.pageBg }}>
              {(['smarthome', 'gps'] as const).map(tab => (
                <button key={tab} onClick={() => goTo(tab)}
                  className="flex-1 py-2 rounded-full text-center transition-all duration-200"
                  style={{
                    fontFamily: '-apple-system, SF Pro Text, system-ui', fontSize: 13, fontWeight: 500,
                    background: view === tab ? C.cardBg : 'transparent',
                    color: view === tab ? C.teal : C.textSecondary,
                    border: view === tab ? `1px solid ${C.cardBorder}` : '1px solid transparent',
                    boxShadow: view === tab ? '0 1px 3px rgba(0,0,0,.06)' : 'none'
                  }}>
                  {tab === 'smarthome' ? 'Smart Home' : 'GPS Tracker'}
                </button>
              ))}
            </div>
          )}

          {/* Content area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative" style={{ WebkitOverflowScrolling: 'touch' }}>

            {ripple && <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,59,48,.15)', animation: 'armRipple .8s ease-out forwards' }} />
            </div>}

            {toastVisible && (
              <div className="absolute top-2 left-4 right-4 z-50 flex items-center justify-center" style={{ animation: 'toastSlide 2.5s ease-out forwards' }}>
                <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: '10px 16px', fontFamily: 'monospace', fontSize: 12, color: C.teal, boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}>
                  📍 Location updated — Nani is inside
                </div>
              </div>
            )}

            {/* ═══ VIEW: SMART HOME ═══ */}
            {(view === 'smarthome' || prevView === 'smarthome') && (
              <div style={{
                animation: view === 'smarthome'
                  ? (slideDir === 'right' ? 'slideInRight .35s ease-out forwards' : slideDir === 'left' ? 'slideInLeft .35s ease-out forwards' : 'none')
                  : (slideDir === 'left' ? 'slideOutLeft .35s ease-out forwards' : 'slideOutRight .35s ease-out forwards'),
                display: (prevView === 'smarthome' && view !== 'smarthome') ? 'block' : (view === 'smarthome' ? 'block' : 'none'),
                position: prevView === 'smarthome' ? 'absolute' : 'relative', inset: prevView === 'smarthome' ? 0 : undefined,
                padding: '12px 20px 100px'
              }}>
                {/* Home Security Card */}
                <div style={{
                  background: C.cardBg, borderRadius: 16, padding: '20px 18px', marginBottom: 14,
                  border: alarm === 'armed' ? `1.5px solid rgba(255,59,48,.25)` : `1px solid ${C.cardBorder}`,
                  animation: alarm === 'armed' ? 'redGlowLight 3s infinite' : 'none',
                  boxShadow: '0 1px 4px rgba(0,0,0,.04)'
                }}>
                  <div style={{ fontFamily: '-apple-system, SF Pro Display, system-ui', fontSize: 17, fontWeight: 600, color: C.text, marginBottom: 2 }}>Home Security</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: C.textSecondary, marginBottom: 18 }}>Chennai Apartment · Live monitoring</div>

                  {/* Door Alarm row */}
                  <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: alarm === 'armed' ? 'rgba(255,59,48,.08)' : '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock className="w-[18px] h-[18px]" style={{ color: alarm === 'armed' ? C.red : C.textSecondary }} />
                      </div>
                      <div>
                        <div style={{ fontFamily: '-apple-system, SF Pro Text, system-ui', fontSize: 15, fontWeight: 500, color: C.text }}>Door Alarm</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 11, color: C.textSecondary }}>Main entrance</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: 51, height: 31, borderRadius: 16, padding: 2, cursor: 'pointer', transition: 'background .3s',
                        background: alarm === 'armed' ? C.red : '#E9E9EB'
                      }}>
                        <div style={{
                          width: 27, height: 27, borderRadius: 14, background: '#fff', transition: 'transform .3s',
                          transform: alarm === 'armed' ? 'translateX(20px)' : 'translateX(0)',
                          boxShadow: '0 2px 4px rgba(0,0,0,.15)'
                        }} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {alarm === 'armed' && <div style={{ width: 6, height: 6, borderRadius: 3, background: C.red, animation: 'dotPulse 2s ease-in-out infinite' }} />}
                        <span style={{
                          fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' as const,
                          color: alarm === 'armed' ? C.red : C.textTertiary
                        }}>
                          {alarm === 'armed' ? 'ARMED'.slice(0, letterReveal) : 'DISARMED'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arm button */}
                  <button onClick={handleArm} disabled={alarm !== 'disarmed'}
                    style={{
                      width: '100%', height: 50, borderRadius: 14, border: 'none', cursor: alarm === 'disarmed' ? 'pointer' : 'default',
                      fontFamily: '-apple-system, SF Pro Display, system-ui', fontSize: 15, fontWeight: 600,
                      background: alarm === 'armed' ? 'rgba(255,59,48,.08)' : alarm === 'arming' ? 'rgba(255,59,48,.06)' : 'rgba(0,199,190,.1)',
                      color: alarm === 'armed' ? C.red : alarm === 'arming' ? C.red : C.teal,
                      transition: 'all .2s', animation: alarm === 'arming' ? 'buttonPress .3s ease-out' : 'none'
                    }}>
                    {alarm === 'disarmed' && 'Arm Door Alarm'}
                    {alarm === 'arming' && (
                      <span className="flex items-center justify-center gap-1">
                        Arming
                        {[0, 1, 2].map(i => (
                          <span key={i} style={{ width: 4, height: 4, borderRadius: 2, background: C.red, display: 'inline-block', animation: `spinDot 1.2s ${i * .2}s infinite` }} />
                        ))}
                      </span>
                    )}
                    {alarm === 'armed' && '🔒 Door Alarm Armed'}
                  </button>

                  {alarm === 'armed' && (
                    <div style={{ marginTop: 12, fontFamily: 'monospace', fontSize: 11, color: C.textSecondary, animation: 'slideInLeft .4s ease-out' }}>
                      Armed at {armedTime} · Monitoring active
                    </div>
                  )}
                </div>

                {/* Motion Sensors card */}
                <div style={{ background: C.cardBg, borderRadius: 16, padding: '18px', border: `1px solid ${C.cardBorder}`, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
                  <div style={{ fontFamily: '-apple-system, SF Pro Display, system-ui', fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 14 }}>Motion Sensors</div>
                  {['Living Room', 'Hallway', 'Bedroom'].map((room, idx) => (
                    <div key={room} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: idx < 2 ? '1px solid #F2F2F7' : 'none' }}>
                      <div className="flex items-center gap-2.5">
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: C.teal }} />
                        <span style={{ fontFamily: '-apple-system, SF Pro Text, system-ui', fontSize: 15, color: C.text }}>{room}</span>
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: C.teal, fontWeight: 500 }}>Active</span>
                    </div>
                  ))}
                </div>

                {/* Floating GPS button */}
                <button onClick={() => goTo('gps')} style={{
                  position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
                  background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 24,
                  padding: '12px 24px', fontFamily: '-apple-system, SF Pro Text, system-ui', fontSize: 14, fontWeight: 500, color: C.teal,
                  cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 12px rgba(0,0,0,.08)'
                }}>
                  View GPS Tracker →
                </button>
              </div>
            )}

            {/* ═══ VIEW: GPS TRACKER ═══ */}
            {(view === 'gps' || prevView === 'gps') && (
              <div style={{
                animation: view === 'gps'
                  ? (slideDir === 'left' ? 'slideInLeft .35s ease-out forwards' : slideDir === 'right' ? 'slideInRight .35s ease-out forwards' : 'none')
                  : (slideDir === 'left' ? 'slideOutLeft .35s ease-out forwards' : 'slideOutRight .35s ease-out forwards'),
                display: (prevView === 'gps' && view !== 'gps') ? 'block' : (view === 'gps' ? 'block' : 'none'),
                position: prevView === 'gps' ? 'absolute' : 'relative', inset: prevView === 'gps' ? 0 : undefined,
                padding: '12px 20px 40px'
              }}>
                {/* Live status row */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: C.green, animation: 'liveDot 2s ease-in-out infinite' }} />
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.teal, fontWeight: 500 }}>GPS Tracker: LIVE</span>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: C.textSecondary }}>Updates every 30s</span>
                </div>

                {/* Map card */}
                <button onClick={() => goTo('mapfull')} style={{
                  width: '100%', background: '#1C1C1E', borderRadius: 16, border: `1px solid ${C.cardBorder}`,
                  height: 280, position: 'relative', overflow: 'hidden', cursor: 'pointer', display: 'block',
                  boxShadow: '0 2px 8px rgba(0,0,0,.08)'
                }}>
                  <ApartmentMap size="normal" />
                </button>

                {/* Location card */}
                <div style={{ background: C.cardBg, borderRadius: 16, padding: '16px 18px', border: `1px solid ${C.cardBorder}`, marginTop: 12, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
                  <div style={{ fontFamily: '-apple-system, SF Pro Display, system-ui', fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 4 }}>Nani's Location</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: C.textSecondary, marginBottom: 10 }}>Inside apartment · Chennai · Last updated {lastUpdate}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(52,199,89,.08)', border: '1px solid rgba(52,199,89,.2)', borderRadius: 20, padding: '5px 14px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: C.green }} />
                    <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: C.green, textTransform: 'uppercase' as const, letterSpacing: '.08em' }}>Safe · Indoors</span>
                  </div>
                </div>

                {/* Last updated */}
                <div className="flex items-center gap-2 py-3">
                  <Clock className="w-3.5 h-3.5" style={{ color: C.textSecondary }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: C.textSecondary }}>Location confirmed {timeStr}</span>
                </div>

                {/* History row */}
                <div className="flex items-center gap-2" style={{ background: C.cardBg, borderRadius: 14, padding: '14px 16px', border: `1px solid ${C.cardBorder}`, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: C.green }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.textSecondary }}>No movement detected outside apartment · Past 2 hours</span>
                </div>
              </div>
            )}

            {/* ═══ VIEW: MAP FULL ═══ */}
            {(view === 'mapfull' || prevView === 'mapfull') && (
              <button onClick={() => goTo('gps')} style={{
                animation: view === 'mapfull' ? 'mapExpand .4s cubic-bezier(.2,.8,.3,1) forwards' : 'none',
                display: (prevView === 'mapfull' && view !== 'mapfull') ? 'block' : (view === 'mapfull' ? 'block' : 'none'),
                position: 'absolute', inset: 0, background: '#1C1C1E', cursor: 'pointer', border: 'none', width: '100%', zIndex: 20
              }}>
                <ApartmentMap size="full" />
                <div style={{
                  position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,.92)', border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: '8px 18px',
                  backdropFilter: 'blur(10px)', boxShadow: '0 2px 8px rgba(0,0,0,.1)'
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: C.green }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.text, fontWeight: 500 }}>Nani · Inside · Safe</span>
                </div>
                <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', fontFamily: 'monospace', fontSize: 10, color: C.textTertiary }}>
                  Tap anywhere to go back
                </div>
              </button>
            )}
          </div>

          {/* Home indicator */}
          <div className="relative z-50 flex justify-center shrink-0" style={{ paddingBottom: 8, paddingTop: 4, background: C.statusBarBg }}>
            <div style={{ width: 134, height: 5, borderRadius: 3, background: 'rgba(0,0,0,.15)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Apartment Floor Plan SVG ─── */
function ApartmentMap({ size }: { size: 'normal' | 'full' }) {
  const scale = size === 'full' ? 1.4 : 1;
  const fontSize = size === 'full' ? 10 : 8;
  const dotSize = size === 'full' ? 18 : 12;

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <svg viewBox="0 0 320 220" style={{ width: `${80 * scale}%`, height: `${70 * scale}%` }}>
        <rect x="10" y="10" width="300" height="200" rx="4" fill="none" stroke="#3A3A3C" strokeWidth="1.5" />
        <line x1="160" y1="10" x2="160" y2="130" stroke="#3A3A3C" strokeWidth="1" />
        <line x1="10" y1="130" x2="310" y2="130" stroke="#3A3A3C" strokeWidth="1" />
        <line x1="220" y1="130" x2="220" y2="210" stroke="#3A3A3C" strokeWidth="1" />
        <line x1="140" y1="130" x2="160" y2="130" stroke="#1C1C1E" strokeWidth="2" />
        <line x1="160" y1="60" x2="160" y2="80" stroke="#1C1C1E" strokeWidth="2" />
        <text x="80" y="75" textAnchor="middle" fill="#8E8E93" fontSize={fontSize} fontFamily="monospace">Living Room</text>
        <text x="235" y="75" textAnchor="middle" fill="#8E8E93" fontSize={fontSize} fontFamily="monospace">Bedroom</text>
        <text x="80" y="175" textAnchor="middle" fill="#8E8E93" fontSize={fontSize} fontFamily="monospace">Kitchen</text>
        <text x="265" y="175" textAnchor="middle" fill="#8E8E93" fontSize={fontSize} fontFamily="monospace">Hallway</text>
        <text x="160" y="175" textAnchor="middle" fill="#8E8E93" fontSize={fontSize} fontFamily="monospace">Bathroom</text>
        <circle cx="235" cy="55" r={dotSize * 1.5} fill="none" stroke="#34C759" strokeWidth=".8" opacity=".3">
          <animate attributeName="r" values={`${dotSize};${dotSize * 3};${dotSize * 3}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values=".4;0;0" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="235" cy="55" r={dotSize * 1.5} fill="none" stroke="#34C759" strokeWidth=".5" opacity=".15">
          <animate attributeName="r" values={`${dotSize * 1.5};${dotSize * 4};${dotSize * 4}`} dur="2s" repeatCount="indefinite" begin=".5s" />
          <animate attributeName="opacity" values=".25;0;0" dur="2s" repeatCount="indefinite" begin=".5s" />
        </circle>
        <circle cx="235" cy="55" r={dotSize / 2} fill="#34C759" />
        <text x="248" y={58} fill="#fff" fontSize={size === 'full' ? 11 : 9} fontFamily="monospace">Nani</text>
      </svg>
    </div>
  );
}
