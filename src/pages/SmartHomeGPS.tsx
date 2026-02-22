import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Share2, Lock, Clock, CheckCircle2, Wifi, Signal, Battery, Shield, Radio, Navigation, Home, MapPin, ChevronRight, Activity, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SegmentedControl from '@/components/ui/SegmentedControl';
import IconBox from '@/components/ui/IconBox';

type View = 'smarthome' | 'gps' | 'mapfull';
type AlarmState = 'disarmed' | 'arming' | 'armed';
type SlideDir = 'left' | 'right' | 'none';

const SF = '-apple-system, SF Pro Text, SF Pro Display, system-ui, sans-serif';

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

  const tabValue = view === 'smarthome' ? 'smarthome' : 'gps';

  const sensors = [
    { name: 'Living Room', icon: Eye, status: 'Active' },
    { name: 'Hallway', icon: Activity, status: 'Active' },
    { name: 'Bedroom', icon: Radio, status: 'Active' },
  ];

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden" style={{ background: '#000' }}>
      <style>{`
        @keyframes dotPulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes armRipple{0%{transform:scale(0);opacity:.2}100%{transform:scale(8);opacity:0}}
        @keyframes redGlowL{0%,100%{box-shadow:0 0 4px rgba(255,59,48,.06)}50%{box-shadow:0 0 16px rgba(255,59,48,.14)}}
        @keyframes liveDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.65)}}
        @keyframes slideInL{from{transform:translateX(100%);opacity:.6}to{transform:translateX(0);opacity:1}}
        @keyframes slideOutL{from{transform:translateX(0);opacity:1}to{transform:translateX(-100%);opacity:0}}
        @keyframes slideInR{from{transform:translateX(-100%);opacity:.6}to{transform:translateX(0);opacity:1}}
        @keyframes slideOutR{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}
        @keyframes toastDrop{0%{transform:translateY(-20px);opacity:0}12%{transform:translateY(0);opacity:1}88%{transform:translateY(0);opacity:1}100%{transform:translateY(-20px);opacity:0}}
        @keyframes mapGrow{from{transform:scale(.94);opacity:.7}to{transform:scale(1);opacity:1}}
        @keyframes btnPress{0%{transform:scale(1)}50%{transform:scale(.96)}100%{transform:scale(1)}}
        @keyframes spin3{0%,80%,100%{opacity:.25}40%{opacity:1}}
      `}</style>

      <div className="relative overflow-hidden flex flex-col w-full h-full sm:w-[402px] sm:h-[874px]" style={{ maxHeight: '100dvh', borderRadius: 'var(--frame-radius, 0px)', background: '#1C1C1E', boxShadow: 'var(--frame-shadow, none)' }}>
        {/* Side buttons */}
        <div className="hidden sm:block absolute left-[-2.5px] top-[140px] w-[2.5px] h-[28px] rounded-l-sm" style={{ background: 'linear-gradient(180deg,#C4C4C6,#A8A8AC,#C4C4C6)' }} />
        <div className="hidden sm:block absolute left-[-2.5px] top-[195px] w-[2.5px] h-[52px] rounded-l-sm" style={{ background: 'linear-gradient(180deg,#C4C4C6,#A8A8AC,#C4C4C6)' }} />
        <div className="hidden sm:block absolute left-[-2.5px] top-[257px] w-[2.5px] h-[52px] rounded-l-sm" style={{ background: 'linear-gradient(180deg,#C4C4C6,#A8A8AC,#C4C4C6)' }} />
        <div className="hidden sm:block absolute right-[-2.5px] top-[210px] w-[2.5px] h-[80px] rounded-r-sm" style={{ background: 'linear-gradient(180deg,#C4C4C6,#A8A8AC,#C4C4C6)' }} />

        <div className="absolute overflow-hidden flex flex-col inset-0 sm:inset-[3px]" style={{ borderRadius: 'var(--frame-inner-radius, 0px)', backgroundColor: '#F2F2F7' }}>

          {/* iOS Status Bar */}
          <div className="relative z-50 flex items-center justify-between px-8 shrink-0" style={{ paddingTop: 14, paddingBottom: 6, background: 'rgba(242,242,247,.85)', backdropFilter: 'blur(20px)' }}>
            <span style={{ fontFamily: SF, fontSize: 15, fontWeight: 600, color: '#1C1C1E', width: 54 }}>{timeStr.replace(/ /g, '\u00A0')}</span>
            <div className="absolute left-1/2 -translate-x-1/2 bg-black hidden sm:block" style={{ top: 10, width: 126, height: 37, borderRadius: 20 }} />
            <div className="flex items-center gap-[5px]">
              <Signal className="w-4 h-4 text-foreground" strokeWidth={2.5} />
              <Wifi className="w-4 h-4 text-foreground" strokeWidth={2.5} />
              <Battery className="text-foreground" style={{ width: 25, height: 12 }} strokeWidth={2} />
            </div>
          </div>

          {/* Navigation: iOS large title style */}
          <div className="shrink-0" style={{ background: 'rgba(242,242,247,.85)', backdropFilter: 'blur(20px)' }}>
            {/* Top row: back + actions */}
            <div className="flex items-center justify-between px-4" style={{ height: 44 }}>
              <button onClick={() => navigate(-1)} className="flex items-center gap-1 p-1" style={{ color: '#007AFF' }}>
                <ArrowLeft className="w-5 h-5" strokeWidth={2} />
                <span style={{ fontFamily: SF, fontSize: 17, fontWeight: 400 }}>Back</span>
              </button>
              <button className="p-2"><Share2 className="w-5 h-5" style={{ color: '#007AFF' }} strokeWidth={1.8} /></button>
            </div>
            {/* Large title */}
            <div className="px-5 pb-2">
              <div className="flex items-center gap-2">
                <h1 style={{ fontFamily: SF, fontSize: 34, fontWeight: 700, color: '#1C1C1E', letterSpacing: '0.01em', lineHeight: 1.1 }}>
                  {view === 'smarthome' ? 'Smart Home' : 'GPS Tracker'}
                </h1>
                {(view === 'gps' || view === 'mapfull') && (
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: '#34C759', animation: 'liveDot 2s ease-in-out infinite' }} />
                )}
              </div>
            </div>
          </div>

          {/* Segmented Control */}
          {view !== 'mapfull' && (
            <div className="px-4 pt-1 pb-2 shrink-0" style={{ background: '#F2F2F7' }}>
              <SegmentedControl
                items={[
                  { value: 'smarthome', label: 'Smart Home', icon: <Home className="w-4 h-4" /> },
                  { value: 'gps', label: 'GPS Tracker', icon: <Navigation className="w-4 h-4" /> },
                ]}
                value={tabValue}
                onChange={(v) => goTo(v as View)}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative" style={{ WebkitOverflowScrolling: 'touch' }}>

            {/* Ripple */}
            {ripple && (
              <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,59,48,.12)', animation: 'armRipple .8s ease-out forwards' }} />
              </div>
            )}

            {/* Toast */}
            {toastVisible && (
              <div className="absolute top-2 left-4 right-4 z-50 flex justify-center" style={{ animation: 'toastDrop 2.5s ease-out forwards' }}>
                <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 14, padding: '10px 16px', fontFamily: SF, fontSize: 13, color: '#1C1C1E', boxShadow: '0 4px 16px rgba(0,0,0,.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin className="w-4 h-4" style={{ color: '#34C759' }} />
                  Location updated — Nani is inside
                </div>
              </div>
            )}

            {/* ═══ SMART HOME VIEW ═══ */}
            {(view === 'smarthome' || prevView === 'smarthome') && (
              <div style={{
                animation: view === 'smarthome'
                  ? (slideDir === 'right' ? 'slideInR .3s ease-out forwards' : slideDir === 'left' ? 'slideInL .3s ease-out forwards' : 'none')
                  : (slideDir === 'left' ? 'slideOutL .3s ease-out forwards' : 'slideOutR .3s ease-out forwards'),
                display: prevView === 'smarthome' && view !== 'smarthome' ? 'block' : view === 'smarthome' ? 'block' : 'none',
                position: prevView === 'smarthome' ? 'absolute' : 'relative', inset: prevView === 'smarthome' ? 0 : undefined,
                padding: '8px 16px 120px'
              }}>
                {/* Section label */}
                <div style={{ fontFamily: SF, fontSize: 13, fontWeight: 400, color: '#8E8E93', textTransform: 'uppercase' as const, letterSpacing: '.02em', padding: '8px 4px 6px' }}>
                  Security Controls
                </div>

                {/* Home Security grouped card */}
                <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 0.5px 0 rgba(0,0,0,.04)', border: alarm === 'armed' ? '1px solid rgba(255,59,48,.15)' : 'none', animation: alarm === 'armed' ? 'redGlowL 3s infinite' : 'none' }}>
                  {/* Header row */}
                  <div className="flex items-center gap-3" style={{ padding: '14px 16px', borderBottom: '0.5px solid rgba(0,0,0,.06)' }}>
                    <IconBox Icon={Shield} color={alarm === 'armed' ? '#FF3B30' : '#007AFF'} size={40} iconSize={18} />
                    <div className="flex-1">
                      <div style={{ fontFamily: SF, fontSize: 17, fontWeight: 600, color: '#1C1C1E' }}>Home Security</div>
                      <div style={{ fontFamily: SF, fontSize: 13, color: '#8E8E93' }}>Chennai Apartment · Live</div>
                    </div>
                    {alarm === 'armed' && (
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: '#FF3B30', animation: 'dotPulse 2s ease-in-out infinite' }} />
                    )}
                  </div>

                  {/* Door Alarm row */}
                  <div className="flex items-center justify-between" style={{ padding: '14px 16px', borderBottom: '0.5px solid rgba(0,0,0,.06)' }}>
                    <div className="flex items-center gap-3">
                      <IconBox Icon={Lock} color={alarm === 'armed' ? '#FF3B30' : '#FF9500'} size={36} iconSize={16} />
                      <div>
                        <div style={{ fontFamily: SF, fontSize: 17, fontWeight: 400, color: '#1C1C1E' }}>Door Alarm</div>
                        <div style={{ fontFamily: SF, fontSize: 13, color: '#8E8E93' }}>Main entrance</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* iOS toggle */}
                      <div onClick={alarm === 'disarmed' ? handleArm : undefined} style={{
                        width: 51, height: 31, borderRadius: 16, padding: 2, cursor: alarm === 'disarmed' ? 'pointer' : 'default', transition: 'background .3s',
                        background: alarm === 'armed' ? '#FF3B30' : '#E9E9EB'
                      }}>
                        <div style={{
                          width: 27, height: 27, borderRadius: 14, background: '#fff', transition: 'transform .3s ease',
                          transform: alarm === 'armed' ? 'translateX(20px)' : 'translateX(0)',
                          boxShadow: '0 3px 8px rgba(0,0,0,.15), 0 1px 1px rgba(0,0,0,.06)'
                        }} />
                      </div>
                      <span style={{
                        fontFamily: SF, fontSize: 12, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' as const,
                        color: alarm === 'armed' ? '#FF3B30' : '#8E8E93', minWidth: 70, textAlign: 'right' as const
                      }}>
                        {alarm === 'armed' ? 'ARMED'.slice(0, letterReveal) : alarm === 'arming' ? 'Arming...' : 'Disarmed'}
                      </span>
                    </div>
                  </div>

                  {/* Arm button */}
                  <div style={{ padding: '12px 16px' }}>
                    <button onClick={handleArm} disabled={alarm !== 'disarmed'}
                      className="w-full flex items-center justify-center gap-2"
                      style={{
                        height: 50, borderRadius: 12, border: 'none', cursor: alarm === 'disarmed' ? 'pointer' : 'default',
                        fontFamily: SF, fontSize: 17, fontWeight: 600,
                        background: alarm === 'armed' ? 'rgba(255,59,48,.08)' : alarm === 'arming' ? 'rgba(255,59,48,.06)' : '#007AFF',
                        color: alarm === 'armed' ? '#FF3B30' : alarm === 'arming' ? '#FF3B30' : '#fff',
                        transition: 'all .2s', animation: alarm === 'arming' ? 'btnPress .3s ease-out' : 'none'
                      }}>
                      {alarm === 'disarmed' && <><Shield className="w-4 h-4" /> Arm Door Alarm</>}
                      {alarm === 'arming' && (
                        <span className="flex items-center gap-1">
                          Arming
                          {[0, 1, 2].map(i => (
                            <span key={i} style={{ width: 4, height: 4, borderRadius: 2, background: '#FF3B30', display: 'inline-block', animation: `spin3 1.2s ${i * .2}s infinite` }} />
                          ))}
                        </span>
                      )}
                      {alarm === 'armed' && <><Lock className="w-4 h-4" /> Door Alarm Armed</>}
                    </button>
                  </div>

                  {/* Armed confirmation */}
                  {alarm === 'armed' && (
                    <div style={{ padding: '0 16px 14px', fontFamily: SF, fontSize: 13, color: '#8E8E93', animation: 'slideInL .4s ease-out' }}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" style={{ color: '#8E8E93' }} />
                        Armed at {armedTime} · Monitoring active
                      </div>
                    </div>
                  )}
                </div>

                {/* Section label */}
                <div style={{ fontFamily: SF, fontSize: 13, fontWeight: 400, color: '#8E8E93', textTransform: 'uppercase' as const, letterSpacing: '.02em', padding: '20px 4px 6px' }}>
                  Motion Sensors
                </div>

                {/* Motion Sensors grouped card */}
                <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 0.5px 0 rgba(0,0,0,.04)' }}>
                  {sensors.map((sensor, idx) => (
                    <div key={sensor.name} className="flex items-center justify-between" style={{ padding: '14px 16px', borderBottom: idx < sensors.length - 1 ? '0.5px solid rgba(0,0,0,.06)' : 'none' }}>
                      <div className="flex items-center gap-3">
                        <IconBox Icon={sensor.icon} color="#34C759" size={36} iconSize={16} />
                        <div>
                          <div style={{ fontFamily: SF, fontSize: 17, fontWeight: 400, color: '#1C1C1E' }}>{sensor.name}</div>
                          <div className="flex items-center gap-1.5">
                            <div style={{ width: 6, height: 6, borderRadius: 3, background: '#34C759' }} />
                            <span style={{ fontFamily: SF, fontSize: 13, color: '#34C759' }}>{sensor.status}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" style={{ color: '#C7C7CC' }} />
                    </div>
                  ))}
                </div>

                {/* Floating GPS button */}
                <div style={{ position: 'fixed', bottom: 50, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
                  <button onClick={() => goTo('gps')} className="flex items-center gap-2"
                    style={{
                      pointerEvents: 'auto', background: '#007AFF', borderRadius: 24, border: 'none',
                      padding: '12px 24px', fontFamily: SF, fontSize: 15, fontWeight: 600, color: '#fff',
                      cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,122,255,.3)'
                    }}>
                    <Navigation className="w-4 h-4" />
                    View GPS Tracker
                  </button>
                </div>
              </div>
            )}

            {/* ═══ GPS TRACKER VIEW ═══ */}
            {(view === 'gps' || prevView === 'gps') && (
              <div style={{
                animation: view === 'gps'
                  ? (slideDir === 'left' ? 'slideInL .3s ease-out forwards' : slideDir === 'right' ? 'slideInR .3s ease-out forwards' : 'none')
                  : (slideDir === 'left' ? 'slideOutL .3s ease-out forwards' : 'slideOutR .3s ease-out forwards'),
                display: prevView === 'gps' && view !== 'gps' ? 'block' : view === 'gps' ? 'block' : 'none',
                position: prevView === 'gps' ? 'absolute' : 'relative', inset: prevView === 'gps' ? 0 : undefined,
                padding: '8px 16px 40px'
              }}>
                {/* Live status */}
                <div className="flex items-center justify-between" style={{ padding: '6px 4px 10px' }}>
                  <div className="flex items-center gap-2">
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: '#34C759', animation: 'liveDot 2s ease-in-out infinite' }} />
                    <span style={{ fontFamily: SF, fontSize: 13, fontWeight: 500, color: '#34C759' }}>LIVE</span>
                  </div>
                  <span style={{ fontFamily: SF, fontSize: 13, color: '#8E8E93' }}>Updates every 30s</span>
                </div>

                {/* Map card — dark */}
                <button onClick={() => goTo('mapfull')} style={{
                  width: '100%', background: '#1C1C1E', borderRadius: 12, border: 'none',
                  height: 260, position: 'relative', overflow: 'hidden', cursor: 'pointer', display: 'block',
                  boxShadow: '0 2px 8px rgba(0,0,0,.08)'
                }}>
                  <ApartmentMap size="normal" />
                  <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(255,255,255,.12)', borderRadius: 8, padding: '6px 10px', fontFamily: SF, fontSize: 11, color: '#fff', backdropFilter: 'blur(8px)' }}>
                    Tap to expand
                  </div>
                </button>

                {/* Section label */}
                <div style={{ fontFamily: SF, fontSize: 13, fontWeight: 400, color: '#8E8E93', textTransform: 'uppercase' as const, letterSpacing: '.02em', padding: '16px 4px 6px' }}>
                  Location Status
                </div>

                {/* Location grouped card */}
                <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 0.5px 0 rgba(0,0,0,.04)' }}>
                  {/* Name row */}
                  <div className="flex items-center gap-3" style={{ padding: '14px 16px', borderBottom: '0.5px solid rgba(0,0,0,.06)' }}>
                    <IconBox Icon={MapPin} color="#34C759" size={40} iconSize={18} />
                    <div className="flex-1">
                      <div style={{ fontFamily: SF, fontSize: 17, fontWeight: 600, color: '#1C1C1E' }}>Nani's Location</div>
                      <div style={{ fontFamily: SF, fontSize: 13, color: '#8E8E93' }}>Inside apartment · Chennai</div>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(52,199,89,.1)', borderRadius: 20, padding: '4px 10px' }}>
                      <div style={{ width: 6, height: 6, borderRadius: 3, background: '#34C759' }} />
                      <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 600, color: '#34C759' }}>Safe</span>
                    </div>
                  </div>

                  {/* Last updated row */}
                  <div className="flex items-center gap-3" style={{ padding: '14px 16px', borderBottom: '0.5px solid rgba(0,0,0,.06)' }}>
                    <IconBox Icon={Clock} color="#8E8E93" size={36} iconSize={16} />
                    <div className="flex-1">
                      <div style={{ fontFamily: SF, fontSize: 17, fontWeight: 400, color: '#1C1C1E' }}>Last Updated</div>
                      <div style={{ fontFamily: SF, fontSize: 13, color: '#8E8E93' }}>{lastUpdate} · {timeStr}</div>
                    </div>
                  </div>

                  {/* History row */}
                  <div className="flex items-center gap-3" style={{ padding: '14px 16px' }}>
                    <IconBox Icon={CheckCircle2} color="#34C759" size={36} iconSize={16} />
                    <div className="flex-1">
                      <div style={{ fontFamily: SF, fontSize: 17, fontWeight: 400, color: '#1C1C1E' }}>Movement History</div>
                      <div style={{ fontFamily: SF, fontSize: 13, color: '#8E8E93' }}>No outdoor movement · Past 2 hours</div>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: '#C7C7CC' }} />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ MAP FULL VIEW ═══ */}
            {(view === 'mapfull' || prevView === 'mapfull') && (
              <button onClick={() => goTo('gps')} style={{
                animation: view === 'mapfull' ? 'mapGrow .4s cubic-bezier(.2,.8,.3,1) forwards' : 'none',
                display: prevView === 'mapfull' && view !== 'mapfull' ? 'block' : view === 'mapfull' ? 'block' : 'none',
                position: 'absolute', inset: 0, background: '#1C1C1E', cursor: 'pointer', border: 'none', width: '100%', zIndex: 20
              }}>
                <ApartmentMap size="full" />
                {/* Bottom pill */}
                <div style={{
                  position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,.92)', borderRadius: 22, padding: '10px 20px',
                  backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px rgba(0,0,0,.12)'
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: '#34C759' }} />
                  <span style={{ fontFamily: SF, fontSize: 15, fontWeight: 500, color: '#1C1C1E' }}>Nani · Inside · Safe</span>
                </div>
                <div style={{ position: 'absolute', bottom: 38, left: '50%', transform: 'translateX(-50%)', fontFamily: SF, fontSize: 12, color: '#AEAEB2' }}>
                  Tap anywhere to go back
                </div>
              </button>
            )}
          </div>

          {/* Home indicator */}
          <div className="relative z-50 flex justify-center shrink-0" style={{ paddingBottom: 8, paddingTop: 4, background: 'rgba(242,242,247,.85)' }}>
            <div className="bg-foreground/15" style={{ width: 134, height: 5, borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Apartment Floor Plan ─── */
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
        <text x="80" y="75" textAnchor="middle" fill="#8E8E93" fontSize={fontSize} fontFamily="-apple-system, system-ui">Living Room</text>
        <text x="235" y="75" textAnchor="middle" fill="#8E8E93" fontSize={fontSize} fontFamily="-apple-system, system-ui">Bedroom</text>
        <text x="80" y="175" textAnchor="middle" fill="#8E8E93" fontSize={fontSize} fontFamily="-apple-system, system-ui">Kitchen</text>
        <text x="265" y="175" textAnchor="middle" fill="#8E8E93" fontSize={fontSize} fontFamily="-apple-system, system-ui">Hallway</text>
        <text x="160" y="175" textAnchor="middle" fill="#8E8E93" fontSize={fontSize} fontFamily="-apple-system, system-ui">Bathroom</text>
        <circle cx="235" cy="55" r={dotSize * 1.5} fill="none" stroke="#34C759" strokeWidth=".8" opacity=".3">
          <animate attributeName="r" values={`${dotSize};${dotSize * 3};${dotSize * 3}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values=".4;0;0" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="235" cy="55" r={dotSize * 1.5} fill="none" stroke="#34C759" strokeWidth=".5" opacity=".15">
          <animate attributeName="r" values={`${dotSize * 1.5};${dotSize * 4};${dotSize * 4}`} dur="2s" repeatCount="indefinite" begin=".5s" />
          <animate attributeName="opacity" values=".25;0;0" dur="2s" repeatCount="indefinite" begin=".5s" />
        </circle>
        <circle cx="235" cy="55" r={dotSize / 2} fill="#34C759" />
        <text x="248" y={58} fill="#fff" fontSize={size === 'full' ? 11 : 9} fontFamily="-apple-system, system-ui">Nani</text>
      </svg>
    </div>
  );
}
