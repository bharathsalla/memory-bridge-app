import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Share2, Lock, Wifi, Signal, Battery, Clock, CheckCircle2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── types ─── */
type View = 'smarthome' | 'gps' | 'mapfull';
type AlarmState = 'disarmed' | 'arming' | 'armed';
type SlideDir = 'left' | 'right' | 'none';

/* ─── countdown helper ─── */
function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), intervalMs); return () => clearInterval(id); }, [intervalMs]);
  return now;
}

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
  const timerRef = useRef<any>(null);
  const now = useNow();

  const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  /* ─── view transitions ─── */
  const goTo = useCallback((next: View) => {
    if (next === view) return;
    const order: View[] = ['smarthome', 'gps', 'mapfull'];
    const dir = order.indexOf(next) > order.indexOf(view) ? 'left' : 'right';
    setSlideDir(dir);
    setPrevView(view);
    setView(next);
    setTimeout(() => { setSlideDir('none'); setPrevView(null); }, 350);
  }, [view]);

  /* ─── auto-expand map after GPS loads ─── */
  useEffect(() => {
    if (view === 'gps') {
      const t = setTimeout(() => goTo('mapfull'), 3000);
      return () => clearTimeout(t);
    }
  }, [view]);

  /* ─── GPS toast every 30s ─── */
  useEffect(() => {
    if (view !== 'gps' && view !== 'mapfull') return;
    const id = setInterval(() => {
      setLastUpdate('just now');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2500);
    }, 30000);
    return () => clearInterval(id);
  }, [view]);

  /* ─── arm door alarm ─── */
  const handleArm = useCallback(() => {
    if (alarm !== 'disarmed') return;
    setAlarm('arming');
    setTimeout(() => {
      setRipple(true);
      setTimeout(() => setRipple(false), 800);
      setAlarm('armed');
      setArmedTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
      // letter reveal
      let i = 0;
      const iv = setInterval(() => { i++; setLetterReveal(i); if (i >= 5) clearInterval(iv); }, 80);
    }, 1200);
  }, [alarm]);

  const title = view === 'smarthome' ? 'Smart Home' : 'GPS Tracker';

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden" style={{ background: '#000' }}>
      <style>{`
        @keyframes sonarPing { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(3);opacity:0} }
        @keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes armRipple { 0%{transform:scale(0);opacity:.3} 100%{transform:scale(8);opacity:0} }
        @keyframes redGlow { 0%,100%{box-shadow:0 0 8px rgba(255,59,59,.15)} 50%{box-shadow:0 0 20px rgba(255,59,59,.35)} }
        @keyframes liveDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        @keyframes slideInLeft { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes slideOutLeft { from{transform:translateX(0);opacity:1} to{transform:translateX(-100%);opacity:0} }
        @keyframes slideInRight { from{transform:translateX(-100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes slideOutRight { from{transform:translateX(0);opacity:1} to{transform:translateX(100%);opacity:0} }
        @keyframes toastSlide { 0%{transform:translateY(-30px);opacity:0} 15%{transform:translateY(0);opacity:1} 85%{transform:translateY(0);opacity:1} 100%{transform:translateY(-30px);opacity:0} }
        @keyframes ringFillSH { from{stroke-dashoffset:88} to{stroke-dashoffset:8} }
        @keyframes checkScaleSH { from{transform:scale(.5);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes mapExpand { from{transform:scale(.92);opacity:.8} to{transform:scale(1);opacity:1} }
        @keyframes buttonPress { 0%{transform:scale(1)} 50%{transform:scale(.96)} 100%{transform:scale(1)} }
        @keyframes spinDot { 0%,80%,100%{opacity:.3} 40%{opacity:1} }
      `}</style>

      <div className="relative overflow-hidden flex flex-col w-full h-full sm:w-[402px] sm:h-[874px]" style={{ maxHeight: '100dvh', borderRadius: 'var(--frame-radius, 0px)', background: '#0a0f18', boxShadow: 'var(--frame-shadow, none)' }}>
        {/* Side buttons */}
        <div className="hidden sm:block absolute left-[-2.5px] top-[140px] w-[2.5px] h-[28px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />
        <div className="hidden sm:block absolute left-[-2.5px] top-[195px] w-[2.5px] h-[52px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />
        <div className="hidden sm:block absolute left-[-2.5px] top-[257px] w-[2.5px] h-[52px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />
        <div className="hidden sm:block absolute right-[-2.5px] top-[210px] w-[2.5px] h-[80px] rounded-r-sm" style={{ background: 'linear-gradient(180deg, #C4C4C6, #A8A8AC, #C4C4C6)' }} />

        {/* Screen area */}
        <div className="absolute overflow-hidden flex flex-col inset-0 sm:inset-[3px]" style={{ borderRadius: 'var(--frame-inner-radius, 0px)', backgroundColor: '#0a0f18' }}>

          {/* Status bar */}
          <div className="relative z-50 flex items-center justify-between px-8 shrink-0" style={{ paddingTop: 14, paddingBottom: 6, background: 'rgba(10,15,24,.85)', backdropFilter: 'blur(20px)' }}>
            <span style={{ fontFamily: '-apple-system, SF Pro Text, system-ui', fontSize: 15, fontWeight: 600, color: '#fff', width: 54 }}>
              {timeStr.replace(/ /g, '\u00A0')}
            </span>
            <div className="absolute left-1/2 -translate-x-1/2 bg-black hidden sm:block" style={{ top: 10, width: 126, height: 37, borderRadius: 20 }} />
            <div className="flex items-center gap-[5px]">
              <Signal className="w-4 h-4 text-white" strokeWidth={2.5} />
              <Wifi className="w-4 h-4 text-white" strokeWidth={2.5} />
              <Battery className="text-white" style={{ width: 25, height: 12 }} strokeWidth={2} />
            </div>
          </div>

          {/* Nav bar */}
          <div className="flex items-center justify-between px-5 shrink-0" style={{ height: 52, borderBottom: '1px solid #1e2d42' }}>
            <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" style={{ color: '#2dd4bf' }} /></button>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: '-apple-system, SF Pro Display, system-ui', fontSize: 14, fontWeight: 600, color: '#fff' }}>{title}</span>
              {(view === 'gps' || view === 'mapfull') && <div style={{ width: 6, height: 6, borderRadius: 3, background: '#34C759', animation: 'liveDot 2s ease-in-out infinite' }} />}
            </div>
            <button className="p-1"><Share2 className="w-5 h-5" style={{ color: '#2dd4bf' }} /></button>
          </div>

          {/* Tab pills (not in mapfull) */}
          {view !== 'mapfull' && (
            <div className="flex gap-2 px-5 py-3 shrink-0">
              {(['smarthome', 'gps'] as const).map(tab => (
                <button key={tab} onClick={() => goTo(tab)}
                  className="flex-1 py-2 rounded-full text-center transition-all duration-200"
                  style={{
                    fontFamily: '-apple-system, SF Pro Text, system-ui', fontSize: 12, fontWeight: 500,
                    background: view === tab ? 'rgba(45,212,191,.15)' : 'rgba(255,255,255,.05)',
                    color: view === tab ? '#2dd4bf' : '#5a7a9a',
                    border: view === tab ? '1px solid rgba(45,212,191,.3)' : '1px solid transparent'
                  }}>
                  {tab === 'smarthome' ? 'Smart Home' : 'GPS Tracker'}
                </button>
              ))}
            </div>
          )}

          {/* Content area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative" style={{ WebkitOverflowScrolling: 'touch' }}>

            {/* Ripple overlay */}
            {ripple && <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,59,59,.2)', animation: 'armRipple .8s ease-out forwards' }} />
            </div>}

            {/* Toast */}
            {toastVisible && (
              <div className="absolute top-2 left-4 right-4 z-50 flex items-center justify-center" style={{ animation: 'toastSlide 2.5s ease-out forwards' }}>
                <div style={{ background: 'rgba(45,212,191,.12)', border: '1px solid rgba(45,212,191,.25)', borderRadius: 12, padding: '8px 14px', fontFamily: 'monospace', fontSize: 11, color: '#2dd4bf' }}>
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
                padding: '0 20px 100px'
              }}>
                {/* Home Security Card */}
                <div style={{
                  background: '#0e1520', borderRadius: 16, padding: '20px 18px', marginBottom: 14,
                  border: alarm === 'armed' ? '1.5px solid rgba(255,59,59,.3)' : '1px solid #1e2d42',
                  animation: alarm === 'armed' ? 'redGlow 3s infinite' : 'none',
                  boxShadow: '0 0 0 .5px rgba(255,255,255,.03) inset'
                }}>
                  <div style={{ fontFamily: '-apple-system, SF Pro Display, system-ui', fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 2 }}>Home Security</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#5a7a9a', marginBottom: 18 }}>Chennai Apartment · Live monitoring</div>

                  {/* Door Alarm row */}
                  <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: alarm === 'armed' ? 'rgba(255,59,59,.12)' : 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock className="w-4 h-4" style={{ color: alarm === 'armed' ? '#ff3b3b' : '#5a7a9a' }} />
                      </div>
                      <div>
                        <div style={{ fontFamily: '-apple-system, SF Pro Text, system-ui', fontSize: 14, fontWeight: 500, color: '#e0e8f0' }}>Door Alarm</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#5a7a9a' }}>Main entrance</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Toggle */}
                      <div style={{
                        width: 48, height: 28, borderRadius: 14, padding: 2, cursor: 'pointer', transition: 'background .3s',
                        background: alarm === 'armed' ? '#ff3b3b' : '#2a3648'
                      }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 12, background: '#fff', transition: 'transform .3s',
                          transform: alarm === 'armed' ? 'translateX(20px)' : 'translateX(0)',
                          boxShadow: '0 2px 4px rgba(0,0,0,.3)'
                        }} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {alarm === 'armed' && <div style={{ width: 6, height: 6, borderRadius: 3, background: '#ff3b3b', animation: 'dotPulse 2s ease-in-out infinite' }} />}
                        <span style={{
                          fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' as const,
                          color: alarm === 'armed' ? '#ff3b3b' : '#5a7a9a'
                        }}>
                          {alarm === 'armed' ? 'ARMED'.slice(0, letterReveal) : 'DISARMED'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arm button */}
                  <button onClick={handleArm} disabled={alarm !== 'disarmed'}
                    style={{
                      width: '100%', height: 48, borderRadius: 12, border: 'none', cursor: alarm === 'disarmed' ? 'pointer' : 'default',
                      fontFamily: '-apple-system, SF Pro Display, system-ui', fontSize: 14, fontWeight: 600,
                      background: alarm === 'armed' ? 'rgba(255,59,59,.12)' : alarm === 'arming' ? 'rgba(255,59,59,.08)' : 'rgba(45,212,191,.12)',
                      color: alarm === 'armed' ? '#ff3b3b' : alarm === 'arming' ? '#ff6b6b' : '#2dd4bf',
                      transition: 'all .2s', animation: alarm === 'arming' ? 'buttonPress .3s ease-out' : 'none'
                    }}>
                    {alarm === 'disarmed' && 'Arm Door Alarm'}
                    {alarm === 'arming' && (
                      <span className="flex items-center justify-center gap-1">
                        Arming
                        {[0, 1, 2].map(i => (
                          <span key={i} style={{ width: 4, height: 4, borderRadius: 2, background: '#ff6b6b', display: 'inline-block', animation: `spinDot 1.2s ${i * .2}s infinite` }} />
                        ))}
                      </span>
                    )}
                    {alarm === 'armed' && '🔒 Door Alarm Armed'}
                  </button>

                  {/* Armed info row */}
                  {alarm === 'armed' && (
                    <div style={{ marginTop: 12, fontFamily: 'monospace', fontSize: 10, color: '#5a7a9a', animation: 'slideInLeft .4s ease-out' }}>
                      Armed at {armedTime} · Monitoring active
                    </div>
                  )}
                </div>

                {/* Motion Sensors card */}
                <div style={{ background: '#0e1520', borderRadius: 16, padding: '18px', border: '1px solid #1e2d42', boxShadow: '0 0 0 .5px rgba(255,255,255,.03) inset' }}>
                  <div style={{ fontFamily: '-apple-system, SF Pro Display, system-ui', fontSize: 14, fontWeight: 600, color: '#e0e8f0', marginBottom: 14 }}>Motion Sensors</div>
                  {['Living Room', 'Hallway', 'Bedroom'].map(room => (
                    <div key={room} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid rgba(30,45,66,.5)' }}>
                      <div className="flex items-center gap-2.5">
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: '#2dd4bf' }} />
                        <span style={{ fontFamily: '-apple-system, SF Pro Text, system-ui', fontSize: 13, color: '#c8d8e8' }}>{room}</span>
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#2dd4bf' }}>Active</span>
                    </div>
                  ))}
                </div>

                {/* Floating GPS button */}
                <button onClick={() => goTo('gps')} style={{
                  position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(45,212,191,.1)', border: '1px solid rgba(45,212,191,.25)', borderRadius: 24,
                  padding: '10px 22px', fontFamily: '-apple-system, SF Pro Text, system-ui', fontSize: 13, fontWeight: 500, color: '#2dd4bf',
                  cursor: 'pointer', zIndex: 10
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
                padding: '0 20px 40px'
              }}>
                {/* Live status row */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: '#34C759', animation: 'liveDot 2s ease-in-out infinite' }} />
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#2dd4bf' }}>GPS Tracker: LIVE</span>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#5a7a9a' }}>Updates every 30s</span>
                </div>

                {/* Map card */}
                <button onClick={() => goTo('mapfull')} style={{
                  width: '100%', background: '#0e1520', borderRadius: 16, border: '1px solid #1e2d42',
                  height: 280, position: 'relative', overflow: 'hidden', cursor: 'pointer', display: 'block',
                  boxShadow: '0 0 0 .5px rgba(255,255,255,.03) inset'
                }}>
                  <ApartmentMap size="normal" />
                </button>

                {/* Location card */}
                <div style={{ background: '#0e1520', borderRadius: 16, padding: '16px 18px', border: '1px solid #1e2d42', marginTop: 12, boxShadow: '0 0 0 .5px rgba(255,255,255,.03) inset' }}>
                  <div style={{ fontFamily: '-apple-system, SF Pro Display, system-ui', fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Nani's Location</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#5a7a9a', marginBottom: 10 }}>Inside apartment · Chennai · Last updated {lastUpdate}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(52,199,89,.1)', border: '1px solid rgba(52,199,89,.25)', borderRadius: 20, padding: '4px 12px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: '#34C759' }} />
                    <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 600, color: '#34C759', textTransform: 'uppercase' as const, letterSpacing: '.08em' }}>Safe · Indoors</span>
                  </div>
                </div>

                {/* Last updated */}
                <div className="flex items-center gap-2 py-3">
                  <Clock className="w-3.5 h-3.5" style={{ color: '#5a7a9a' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#5a7a9a' }}>Location confirmed {timeStr}</span>
                </div>

                {/* History row */}
                <div className="flex items-center gap-2" style={{ background: '#0e1520', borderRadius: 12, padding: '12px 14px', border: '1px solid #1e2d42' }}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#34C759' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#5a7a9a' }}>No movement detected outside apartment · Past 2 hours</span>
                </div>
              </div>
            )}

            {/* ═══ VIEW: MAP FULL ═══ */}
            {(view === 'mapfull' || prevView === 'mapfull') && (
              <button onClick={() => goTo('gps')} style={{
                animation: view === 'mapfull'
                  ? 'mapExpand .4s cubic-bezier(.2,.8,.3,1) forwards'
                  : 'none',
                display: (prevView === 'mapfull' && view !== 'mapfull') ? 'block' : (view === 'mapfull' ? 'block' : 'none'),
                position: 'absolute', inset: 0, background: '#0a0f18', cursor: 'pointer', border: 'none', width: '100%', zIndex: 20
              }}>
                <ApartmentMap size="full" />
                {/* Bottom pill */}
                <div style={{
                  position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(14,21,32,.9)', border: '1px solid #1e2d42', borderRadius: 20, padding: '8px 18px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: '#34C759' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#e0e8f0' }}>Nani · Inside · Safe</span>
                </div>
                <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', fontFamily: 'monospace', fontSize: 9, color: '#3d5268' }}>
                  Tap anywhere to go back
                </div>
              </button>
            )}
          </div>

          {/* Home indicator */}
          <div className="relative z-50 flex justify-center shrink-0" style={{ paddingBottom: 8, paddingTop: 4, background: 'rgba(10,15,24,.85)' }}>
            <div style={{ width: 134, height: 5, borderRadius: 3, background: 'rgba(255,255,255,.15)' }} />
          </div>

          {/* Noise + vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.35) 100%)', zIndex: 45 }} />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 44, opacity: .03 }}>
            <filter id="noiseGPS"><feTurbulence baseFrequency=".75" /></filter>
            <rect width="100%" height="100%" filter="url(#noiseGPS)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── Apartment Floor Plan SVG Component ─── */
function ApartmentMap({ size }: { size: 'normal' | 'full' }) {
  const scale = size === 'full' ? 1.4 : 1;
  const fontSize = size === 'full' ? 10 : 8;
  const dotSize = size === 'full' ? 18 : 12;

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <svg viewBox="0 0 320 220" style={{ width: `${80 * scale}%`, height: `${70 * scale}%` }}>
        {/* Apartment outline */}
        <rect x="10" y="10" width="300" height="200" rx="4" fill="none" stroke="#1e2d42" strokeWidth="1.5" />
        {/* Room dividers */}
        <line x1="160" y1="10" x2="160" y2="130" stroke="#1e2d42" strokeWidth="1" />
        <line x1="10" y1="130" x2="310" y2="130" stroke="#1e2d42" strokeWidth="1" />
        <line x1="220" y1="130" x2="220" y2="210" stroke="#1e2d42" strokeWidth="1" />
        {/* Door gaps */}
        <line x1="140" y1="130" x2="160" y2="130" stroke="#0e1520" strokeWidth="2" />
        <line x1="160" y1="60" x2="160" y2="80" stroke="#0e1520" strokeWidth="2" />
        {/* Room labels */}
        <text x="80" y="75" textAnchor="middle" fill="#3d5268" fontSize={fontSize} fontFamily="monospace">Living Room</text>
        <text x="235" y="75" textAnchor="middle" fill="#3d5268" fontSize={fontSize} fontFamily="monospace">Bedroom</text>
        <text x="80" y="175" textAnchor="middle" fill="#3d5268" fontSize={fontSize} fontFamily="monospace">Kitchen</text>
        <text x="265" y="175" textAnchor="middle" fill="#3d5268" fontSize={fontSize} fontFamily="monospace">Hallway</text>
        <text x="160" y="175" textAnchor="middle" fill="#3d5268" fontSize={fontSize} fontFamily="monospace">Bathroom</text>

        {/* Nani's dot - in Bedroom */}
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
