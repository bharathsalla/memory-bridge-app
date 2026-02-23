import { useState, useEffect, useCallback } from 'react';
import {
  Lock, Lightbulb, Speaker, Shield, ChevronRight, Check, Clock,
  Wifi, Home, AlertTriangle, Zap, Volume2, Settings2, Power,
} from 'lucide-react';
import IconBox from '@/components/ui/IconBox';

type SmartView = 'status' | 'setup' | 'activation' | 'prevention';
type Platform = 'google' | 'alexa' | 'smartthings';
type DeviceSlot = 'frontDoor' | 'bedroomLight' | 'hallwayLight' | 'smartSpeaker';

interface DeviceRow {
  slot: DeviceSlot;
  label: string;
  Icon: typeof Lock;
  color: string;
  action: string;
  statusLabel: string;
}

const DEVICES: DeviceRow[] = [
  { slot: 'frontDoor', label: 'Front Door', Icon: Lock, color: '#FF3B30', action: 'LOCK NOW', statusLabel: 'LOCKED' },
  { slot: 'bedroomLight', label: 'Bedroom Light', Icon: Lightbulb, color: '#FF9500', action: 'DIM TO 30%', statusLabel: 'DIMMED 30%' },
  { slot: 'hallwayLight', label: 'Hallway Night Light', Icon: Lightbulb, color: '#FFCC00', action: 'TURN ON', statusLabel: 'ON' },
  { slot: 'smartSpeaker', label: 'Smart Speaker', Icon: Volume2, color: '#AF52DE', action: 'PLAY CALM AUDIO', statusLabel: 'PLAYING' },
];

const PLATFORMS: { id: Platform; name: string; sub: string; recommended?: boolean }[] = [
  { id: 'google', name: 'Google Home', sub: 'Works with Nest, Google devices' },
  { id: 'alexa', name: 'Amazon Alexa', sub: 'Works with Echo, Ring, smart plugs' },
  { id: 'smartthings', name: 'SmartThings', sub: 'Works with most smart home brands', recommended: true },
];

const SF = '-apple-system, SF Pro Text, SF Pro Display, system-ui, sans-serif';

/* ── Animated Ring Checkmark ── */
function RingCheck({ active, done }: { active: boolean; done: boolean }) {
  if (done) {
    return (
      <div className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(52,199,89,0.12)' }}>
        <Check size={14} strokeWidth={2.5} color="#34C759" />
      </div>
    );
  }
  if (active) {
    return (
      <div className="relative" style={{ width: 28, height: 28 }}>
        <svg width={28} height={28} viewBox="0 0 28 28">
          <circle cx={14} cy={14} r={12} fill="none" stroke="rgba(52,199,89,0.15)" strokeWidth={1.5} />
          <circle cx={14} cy={14} r={12} fill="none" stroke="#34C759" strokeWidth={1.5} strokeLinecap="round"
            strokeDasharray={75.4} strokeDashoffset={0}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', animation: 'shRingFill 1s ease-out forwards' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'shCheckScale 0.3s ease-out 0.5s both' }}>
          <Check size={14} strokeWidth={2.5} color="#34C759" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 14, border: '1.5px solid rgba(60,60,67,0.15)' }} />
  );
}

export default function SmartHomeScreen() {
  const [view, setView] = useState<SmartView>('status');
  const [connected, setConnected] = useState<Platform | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingPlatform, setPendingPlatform] = useState<Platform | null>(null);
  const [assignments, setAssignments] = useState<Record<DeviceSlot, string>>({
    frontDoor: '', bedroomLight: '', hallwayLight: '', smartSpeaker: '',
  });
  const [expandedSlot, setExpandedSlot] = useState<DeviceSlot | null>(null);
  const [setupSaved, setSetupSaved] = useState(false);

  // Activation state
  const [activatingIdx, setActivatingIdx] = useState(-1);
  const [completedDevices, setCompletedDevices] = useState<boolean[]>([false, false, false, false]);
  const [allComplete, setAllComplete] = useState(false);
  const [activating, setActivating] = useState(false);

  // Status toggles
  const [toggles, setToggles] = useState([true, true, true, true]);

  // Stagger entrance for status rows
  const [visibleRows, setVisibleRows] = useState(0);
  useEffect(() => {
    if (view === 'status') {
      setVisibleRows(0);
      let i = 0;
      const iv = setInterval(() => { i++; setVisibleRows(i); if (i >= 4) clearInterval(iv); }, 120);
      return () => clearInterval(iv);
    }
  }, [view]);

  const handleConnect = (p: Platform) => {
    setPendingPlatform(p);
    setShowModal(true);
  };

  const confirmConnect = () => {
    if (pendingPlatform) setConnected(pendingPlatform);
    setShowModal(false);
    setPendingPlatform(null);
  };

  const handleActivateAll = useCallback(() => {
    setActivating(true);
    setActivatingIdx(0);
    setCompletedDevices([false, false, false, false]);
    setAllComplete(false);

    DEVICES.forEach((_, i) => {
      setTimeout(() => {
        setActivatingIdx(i);
        setTimeout(() => {
          setCompletedDevices(prev => { const n = [...prev]; n[i] = true; return n; });
        }, 800);
      }, i * 600);
    });

    setTimeout(() => {
      setAllComplete(true);
      setActivating(false);
    }, DEVICES.length * 600 + 1000);
  }, []);

  const timeStr = '10:19 PM';

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: '#F2F2F7', WebkitOverflowScrolling: 'touch' }}>
      <style>{`
        @keyframes shRingFill { from { stroke-dashoffset: 75.4 } to { stroke-dashoffset: 0 } }
        @keyframes shCheckScale { from { opacity:0; transform:scale(.4) } to { opacity:1; transform:scale(1) } }
        @keyframes shConfirmGlow { 0%,100% { box-shadow: 0 0 8px rgba(52,199,89,.15) } 50% { box-shadow: 0 0 20px rgba(52,199,89,.3) } }
        @keyframes shDotPulse { 0%,100% { opacity:1 } 50% { opacity:.5 } }
        @keyframes shSpring { 0% { transform:translateY(20px); opacity:0 } 100% { transform:translateY(0); opacity:1 } }
      `}</style>

      {/* ═══ Modal overlay ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <div style={{
            width: '100%', maxWidth: 390, background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '24px 20px 36px', animation: 'shSpring .35s ease-out',
          }}>
            <div className="flex items-center gap-3 mb-4">
              <IconBox Icon={Shield} color="#007AFF" size={44} iconSize={20} />
              <div>
                <p style={{ fontFamily: SF, fontSize: 17, fontWeight: 600, color: '#1C1C1E' }}>Authenticate</p>
                <p style={{ fontFamily: SF, fontSize: 13, color: '#8E8E93' }}>
                  Connect to your smart home account
                </p>
              </div>
            </div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#8E8E93', lineHeight: 1.5, marginBottom: 20 }}>
              You will be redirected to authenticate with your smart home account. This gives Calmora permission to control devices you assign.
            </p>
            <button onClick={confirmConnect} className="w-full" style={{
              height: 50, borderRadius: 12, background: '#007AFF', border: 'none',
              fontFamily: SF, fontSize: 17, fontWeight: 600, color: '#fff', cursor: 'pointer',
            }}>
              Continue
            </button>
            <button onClick={() => setShowModal(false)} className="w-full mt-2" style={{
              height: 44, borderRadius: 12, background: 'transparent', border: '1px solid rgba(60,60,67,0.12)',
              fontFamily: SF, fontSize: 15, fontWeight: 500, color: '#8E8E93', cursor: 'pointer',
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ═══ ACTIVATION COMPLETE OVERLAY ═══ */}
      {allComplete && view === 'prevention' && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center" style={{ backgroundColor: 'rgba(242,242,247,0.97)', animation: 'shSpring .4s ease-out' }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(52,199,89,0.1)', animation: 'shConfirmGlow 2s ease-in-out 1' }}
            className="flex items-center justify-center mb-4">
            <Check size={36} strokeWidth={2} color="#34C759" />
          </div>
          <p style={{ fontFamily: SF, fontSize: 20, fontWeight: 600, color: '#1C1C1E' }}>All Actions Complete</p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#8E8E93', marginTop: 6 }}>
            Nani's home is secured · {timeStr}
          </p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#C7C7CC', marginTop: 4 }}>
            Door locked · Lights calmed · Audio playing
          </p>
          <button onClick={() => { setView('status'); setAllComplete(false); }} className="mt-8" style={{
            height: 50, paddingLeft: 28, paddingRight: 28, borderRadius: 12,
            border: '1px solid rgba(0,122,255,0.3)', background: 'transparent',
            fontFamily: SF, fontSize: 15, fontWeight: 600, color: '#007AFF', cursor: 'pointer',
          }}>
            Return to Smart Home
          </button>
        </div>
      )}

      <div style={{ padding: '8px 16px 120px' }}>
        {/* ─── View Switcher ─── */}
        <div className="flex gap-2 mb-3">
          {[
            { id: 'status' as SmartView, label: 'Status' },
            { id: 'setup' as SmartView, label: 'Setup' },
            { id: 'prevention' as SmartView, label: 'Actions' },
          ].map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              style={{
                flex: 1, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: SF, fontSize: 13, fontWeight: view === t.id ? 600 : 400,
                background: view === t.id ? '#fff' : 'transparent',
                color: view === t.id ? '#1C1C1E' : '#8E8E93',
                boxShadow: view === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════ STATUS VIEW ═══════════ */}
        {view === 'status' && (
          <>
            {/* Section label */}
            <div style={{ fontFamily: SF, fontSize: 13, color: '#8E8E93', textTransform: 'uppercase' as const, letterSpacing: '.02em', padding: '8px 4px 6px' }}>
              Device Status
            </div>

            {/* Connected platform chip */}
            {connected && (
              <div className="flex items-center gap-2 mb-3 px-1">
                <div style={{ width: 8, height: 8, borderRadius: 4, background: '#34C759' }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#34C759' }}>
                  Connected · {PLATFORMS.find(p => p.id === connected)?.name}
                </span>
              </div>
            )}

            {/* Status card */}
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
              {DEVICES.map((d, i) => (
                <div key={d.slot}>
                  <div className="flex items-center gap-3 px-4" style={{
                    minHeight: 68,
                    opacity: visibleRows > i ? 1 : 0,
                    transform: visibleRows > i ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'opacity .4s ease-out, transform .4s ease-out',
                  }}>
                    <IconBox Icon={d.Icon} color={d.color} size={40} iconSize={18} />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 500, color: '#1C1C1E' }}>{d.label}</p>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#8E8E93', marginTop: 1 }}>
                        {toggles[i] ? d.statusLabel : 'Off'} · Since {timeStr}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{
                        fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 600, letterSpacing: '.04em',
                        textTransform: 'uppercase' as const,
                        color: toggles[i] ? '#34C759' : '#8E8E93',
                        background: toggles[i] ? 'rgba(52,199,89,0.08)' : 'rgba(60,60,67,0.04)',
                        borderRadius: 20, padding: '3px 8px',
                      }}>
                        {toggles[i] ? d.statusLabel : 'OFF'}
                      </span>
                      {/* iOS toggle */}
                      <div onClick={() => setToggles(prev => { const n = [...prev]; n[i] = !n[i]; return n; })}
                        style={{
                          width: 51, height: 31, borderRadius: 16, padding: 2, cursor: 'pointer',
                          transition: 'background .3s',
                          background: toggles[i] ? '#34C759' : '#E9E9EB',
                        }}>
                        <div style={{
                          width: 27, height: 27, borderRadius: 14, background: '#fff',
                          transition: 'transform .3s ease',
                          transform: toggles[i] ? 'translateX(20px)' : 'translateX(0)',
                          boxShadow: '0 3px 8px rgba(0,0,0,.15), 0 1px 1px rgba(0,0,0,.06)',
                        }} />
                      </div>
                    </div>
                  </div>
                  {i < DEVICES.length - 1 && (
                    <div style={{ height: 0.5, backgroundColor: 'rgba(60,60,67,0.08)', marginLeft: 64 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Bottom note */}
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#C7C7CC', textAlign: 'center', marginTop: 14 }}>
              All changes sync to Nani's home in under 2 seconds
            </p>
          </>
        )}

        {/* ═══════════ SETUP VIEW ═══════════ */}
        {view === 'setup' && (
          <>
            {/* Explanation card */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 12 }}>
              <div className="flex items-center gap-3 mb-3">
                <IconBox Icon={Home} color="#007AFF" size={44} iconSize={20} />
                <p style={{ fontFamily: SF, fontSize: 17, fontWeight: 600, color: '#1C1C1E' }}>Smart Home Setup</p>
              </div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#8E8E93', lineHeight: 1.6 }}>
                Connect Calmora to your loved one's smart home. When a wandering or agitation risk is detected, Calmora can automatically suggest — and with one tap activate — protective actions in the home.
              </p>
            </div>

            {/* Section label */}
            <div style={{ fontFamily: SF, fontSize: 13, color: '#8E8E93', textTransform: 'uppercase' as const, letterSpacing: '.02em', padding: '4px 4px 6px' }}>
              Connect Platform
            </div>

            {/* Platform buttons */}
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
              {PLATFORMS.map((p, i) => (
                <div key={p.id}>
                  <div className="flex items-center gap-3 px-4" style={{ minHeight: 68 }}>
                    <IconBox
                      Icon={p.id === 'google' ? Home : p.id === 'alexa' ? Speaker : Zap}
                      color={p.id === 'google' ? '#4285F4' : p.id === 'alexa' ? '#00CAFF' : '#15BDB2'}
                      size={40} iconSize={18}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 600, color: '#1C1C1E' }}>{p.name}</p>
                        {p.recommended && (
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 600, color: '#FF9500', background: 'rgba(255,149,0,0.08)', borderRadius: 20, padding: '2px 6px', letterSpacing: '.04em' }}>
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#8E8E93', marginTop: 1 }}>{p.sub}</p>
                    </div>
                    {connected === p.id ? (
                      <div className="flex items-center gap-1.5">
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: '#34C759' }} />
                        <span style={{ fontFamily: SF, fontSize: 13, fontWeight: 600, color: '#34C759' }}>Connected</span>
                      </div>
                    ) : (
                      <button onClick={() => handleConnect(p.id)} style={{
                        fontFamily: SF, fontSize: 13, fontWeight: 600, color: '#007AFF',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                      }}>
                        Connect →
                      </button>
                    )}
                  </div>
                  {i < PLATFORMS.length - 1 && (
                    <div style={{ height: 0.5, backgroundColor: 'rgba(60,60,67,0.08)', marginLeft: 64 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Security note */}
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#C7C7CC', textAlign: 'center', marginTop: 10 }}>
              Your connection is encrypted. Calmora never stores your smart home credentials.
            </p>

            {/* Device assignment — only if connected */}
            {connected && (
              <>
                <div style={{ fontFamily: SF, fontSize: 13, color: '#8E8E93', textTransform: 'uppercase' as const, letterSpacing: '.02em', padding: '20px 4px 6px' }}>
                  Assign Devices
                </div>
                <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
                  {DEVICES.map((d, i) => (
                    <div key={d.slot}>
                      <div className="flex items-center gap-3 px-4" style={{ minHeight: 60, cursor: 'pointer' }}
                        onClick={() => setExpandedSlot(expandedSlot === d.slot ? null : d.slot)}>
                        <IconBox Icon={d.Icon} color={d.color} size={36} iconSize={16} />
                        <div className="flex-1 min-w-0">
                          <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 400, color: '#1C1C1E' }}>{d.label}</p>
                          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: assignments[d.slot] ? '#34C759' : '#C7C7CC' }}>
                            {assignments[d.slot] || 'Not assigned'}
                          </p>
                        </div>
                        <ChevronRight size={16} style={{ color: '#C7C7CC', transform: expandedSlot === d.slot ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .2s' }} />
                      </div>
                      {/* Dropdown */}
                      {expandedSlot === d.slot && (
                        <div style={{ padding: '0 16px 8px 60px' }}>
                          {['Living Room Device', 'Bedroom Device', 'Hallway Device'].map(dev => (
                            <div key={dev} onClick={() => { setAssignments(prev => ({ ...prev, [d.slot]: dev })); setExpandedSlot(null); }}
                              className="flex items-center gap-2" style={{
                                padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                                background: assignments[d.slot] === dev ? 'rgba(0,122,255,0.06)' : 'transparent',
                              }}>
                              <span style={{ fontFamily: SF, fontSize: 14, color: '#1C1C1E' }}>{dev}</span>
                              {assignments[d.slot] === dev && <Check size={14} color="#007AFF" />}
                            </div>
                          ))}
                        </div>
                      )}
                      {i < DEVICES.length - 1 && (
                        <div style={{ height: 0.5, backgroundColor: 'rgba(60,60,67,0.08)', marginLeft: 60 }} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Save button */}
                <button onClick={() => setSetupSaved(true)} className="w-full mt-4" style={{
                  height: 50, borderRadius: 12, border: 'none', cursor: 'pointer',
                  fontFamily: SF, fontSize: 17, fontWeight: 600,
                  background: setupSaved ? 'rgba(52,199,89,0.08)' : '#007AFF',
                  color: setupSaved ? '#34C759' : '#fff',
                }}>
                  {setupSaved ? '✓ Device Setup Saved' : 'Save Device Setup'}
                </button>
              </>
            )}

            {/* Info chip */}
            <div style={{ background: 'rgba(0,122,255,0.04)', borderRadius: 10, padding: '10px 12px', marginTop: 16 }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#8E8E93', lineHeight: 1.5 }}>
                Requires Google Home, Alexa, or SmartThings account with compatible devices installed at patient's location. One-time setup. Works automatically after.
              </p>
            </div>
          </>
        )}

        {/* ═══════════ PREVENTION ACTIONS VIEW ═══════════ */}
        {view === 'prevention' && !allComplete && (
          <>
            {/* Alert banner */}
            <div className="flex items-center gap-3" style={{
              background: 'rgba(255,59,48,0.06)', padding: '12px 14px', borderRadius: 12, marginBottom: 12,
              borderLeft: '4px solid #FF3B30',
            }}>
              <AlertTriangle size={16} color="#FF3B30" style={{ flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 700, color: '#FF3B30', textTransform: 'uppercase' as const, letterSpacing: '.06em' }}>
                  Wandering Risk · HIGH
                </p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(255,59,48,0.5)', marginTop: 1 }}>
                  Predicted window: Next 30 minutes
                </p>
              </div>
            </div>

            {/* Section label */}
            <div className="flex items-center gap-2" style={{ padding: '4px 4px 6px' }}>
              <Home size={12} color="#8E8E93" />
              <span style={{ fontFamily: SF, fontSize: 13, color: '#8E8E93', textTransform: 'uppercase' as const, letterSpacing: '.02em' }}>
                Smart Home Actions
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#C7C7CC', marginLeft: 'auto' }}>
                Recommended by Calmora AI
              </span>
            </div>

            {/* Action card */}
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
              {DEVICES.map((d, i) => (
                <div key={d.slot}>
                  <div className="flex items-center gap-3 px-4" style={{ minHeight: 64 }}>
                    <IconBox Icon={d.Icon} color={d.color} size={40} iconSize={18} />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 500, color: '#1C1C1E' }}>{d.label}</p>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#8E8E93', marginTop: 1 }}>{d.action}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RingCheck active={activatingIdx === i && !completedDevices[i]} done={completedDevices[i]} />
                      <span style={{
                        fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 600, letterSpacing: '.04em',
                        textTransform: 'uppercase' as const,
                        color: completedDevices[i] ? '#34C759' : '#FF9500',
                        background: completedDevices[i] ? 'rgba(52,199,89,0.08)' : 'rgba(255,149,0,0.08)',
                        borderRadius: 20, padding: '3px 8px',
                      }}>
                        {completedDevices[i] ? d.statusLabel : 'PENDING'}
                      </span>
                    </div>
                  </div>
                  {i < DEVICES.length - 1 && (
                    <div style={{ height: 0.5, backgroundColor: 'rgba(60,60,67,0.08)', marginLeft: 64 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Activate All button */}
            <button onClick={handleActivateAll} disabled={activating}
              className="w-full" style={{
                height: 56, borderRadius: 14, border: 'none', cursor: activating ? 'default' : 'pointer',
                fontFamily: SF, fontSize: 17, fontWeight: 700,
                background: activating ? 'rgba(0,122,255,0.06)' : '#007AFF',
                color: activating ? '#007AFF' : '#fff',
                transition: 'all .2s',
              }}>
              {activating ? 'Activating...' : 'Activate All Smart Home Actions'}
            </button>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#C7C7CC', textAlign: 'center', marginTop: 8 }}>
              4 actions · Estimated activation: 3 seconds
            </p>
          </>
        )}
      </div>
    </div>
  );
}
