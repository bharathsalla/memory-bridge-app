import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Lock, Lightbulb, Speaker, Shield, ChevronRight, Check, Clock,
  Wifi, Home, Volume2, Power, Search, X, Plus, MapPin,
  Thermometer, Camera, DoorOpen, Lamp, Fan, Music, Radio,
  Plug, BellRing, Eye, Blinds, Droplets, Gauge, Router,
  ArrowLeft, Info, ChevronDown, Smartphone,
} from 'lucide-react';
import IconBox from '@/components/ui/IconBox';
import SegmentedControl from '@/components/ui/SegmentedControl';

/* ── Types ── */
type SubView = 'devices' | 'setup' | 'rooms';
type SetupStep = 'platforms' | 'auth' | 'discover' | 'assign' | 'done';

interface SmartPlatform {
  id: string;
  name: string;
  desc: string;
  Icon: typeof Home;
  color: string;
  devices: string[];
}

interface SmartDevice {
  id: string;
  name: string;
  Icon: typeof Lock;
  color: string;
  room: string;
  status: boolean;
  statusLabel: string;
  offLabel: string;
  platformId: string;
}

interface Room {
  id: string;
  name: string;
  Icon: typeof Home;
  deviceCount: number;
}

/* ── Real Smart Home Platforms ── */
const PLATFORMS: SmartPlatform[] = [
  { id: 'homekit', name: 'Apple HomeKit', desc: 'Native Apple smart home', Icon: Home, color: '#000000', devices: ['HomePod', 'Eve Motion', 'Hue Lights'] },
  { id: 'google', name: 'Google Home', desc: 'Nest & Google devices', Icon: Home, color: '#4285F4', devices: ['Nest Hub', 'Nest Thermostat', 'Chromecast'] },
  { id: 'alexa', name: 'Amazon Alexa', desc: 'Echo & Ring devices', Icon: Speaker, color: '#00CAFF', devices: ['Echo Show', 'Ring Doorbell', 'Echo Dot'] },
  { id: 'smartthings', name: 'Samsung SmartThings', desc: 'Multi-brand hub', Icon: Router, color: '#15BDB2', devices: ['Hub v3', 'Motion Sensor', 'Outlet'] },
  { id: 'philips', name: 'Philips Hue', desc: 'Smart lighting system', Icon: Lightbulb, color: '#FFB800', devices: ['Bridge', 'Bulbs', 'Light Strips'] },
  { id: 'ring', name: 'Ring', desc: 'Doorbells & cameras', Icon: BellRing, color: '#1C96E8', devices: ['Video Doorbell', 'Stick Up Cam', 'Alarm'] },
  { id: 'august', name: 'August / Yale', desc: 'Smart locks', Icon: Lock, color: '#FF5733', devices: ['Smart Lock Pro', 'Keypad', 'Connect Bridge'] },
  { id: 'ecobee', name: 'Ecobee', desc: 'Thermostats & sensors', Icon: Thermometer, color: '#2FB570', devices: ['Smart Thermostat', 'Room Sensor', 'Switch+'] },
  { id: 'arlo', name: 'Arlo', desc: 'Security cameras', Icon: Camera, color: '#48B748', devices: ['Pro 5', 'Essential Indoor', 'Video Doorbell'] },
  { id: 'sonos', name: 'Sonos', desc: 'Whole-home audio', Icon: Music, color: '#000000', devices: ['One', 'Beam', 'Move'] },
  { id: 'tuya', name: 'Tuya / Smart Life', desc: 'Budget smart devices', Icon: Plug, color: '#FF4800', devices: ['Plugs', 'Switches', 'Sensors'] },
  { id: 'matter', name: 'Matter Devices', desc: 'Universal smart home standard', Icon: Wifi, color: '#6E41E2', devices: ['Any Matter-certified device'] },
  { id: 'lutron', name: 'Lutron Caséta', desc: 'Switches & dimmers', Icon: Lamp, color: '#003DA5', devices: ['Smart Bridge', 'Dimmer', 'Pico Remote'] },
  { id: 'wyze', name: 'Wyze', desc: 'Affordable cameras & sensors', Icon: Eye, color: '#FFD200', devices: ['Cam v4', 'Lock Bolt', 'Plug'] },
  { id: 'ikea', name: 'IKEA DIRIGERA', desc: 'Smart home hub & devices', Icon: Blinds, color: '#0058A3', devices: ['Hub', 'TRÅDFRI Bulbs', 'Blinds'] },
  { id: 'tp-link', name: 'TP-Link Kasa', desc: 'Plugs, switches, cameras', Icon: Plug, color: '#4ACBD6', devices: ['Smart Plug', 'Light Switch', 'Cam'] },
];

/* ── Simulated connected devices ── */
const INITIAL_DEVICES: SmartDevice[] = [
  { id: 'd1', name: 'Front Door Lock', Icon: Lock, color: '#FF3B30', room: 'Entrance', status: true, statusLabel: 'Locked', offLabel: 'Unlocked', platformId: 'august' },
  { id: 'd2', name: 'Bedroom Light', Icon: Lightbulb, color: '#FF9500', room: 'Bedroom', status: true, statusLabel: 'On · 30%', offLabel: 'Off', platformId: 'philips' },
  { id: 'd3', name: 'Hallway Night Light', Icon: Lamp, color: '#FFCC00', room: 'Hallway', status: true, statusLabel: 'On', offLabel: 'Off', platformId: 'philips' },
  { id: 'd4', name: 'Smart Speaker', Icon: Volume2, color: '#AF52DE', room: 'Bedroom', status: true, statusLabel: 'Playing', offLabel: 'Idle', platformId: 'sonos' },
  { id: 'd5', name: 'Thermostat', Icon: Thermometer, color: '#34C759', room: 'Living Room', status: true, statusLabel: '24°C', offLabel: 'Off', platformId: 'ecobee' },
  { id: 'd6', name: 'Video Doorbell', Icon: Camera, color: '#007AFF', room: 'Entrance', status: true, statusLabel: 'Online', offLabel: 'Offline', platformId: 'ring' },
];

const ROOMS: Room[] = [
  { id: 'entrance', name: 'Entrance', Icon: DoorOpen, deviceCount: 2 },
  { id: 'bedroom', name: 'Bedroom', Icon: Lamp, deviceCount: 2 },
  { id: 'hallway', name: 'Hallway', Icon: MapPin, deviceCount: 1 },
  { id: 'living', name: 'Living Room', Icon: Home, deviceCount: 1 },
];

export default function SmartHomeScreen() {
  const [subView, setSubView] = useState<SubView>('devices');
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<string>>(new Set(['august', 'philips', 'sonos', 'ecobee', 'ring']));
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Setup flow
  const [setupStep, setSetupStep] = useState<SetupStep>('platforms');
  const [setupPlatform, setSetupPlatform] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [discoveredDevices, setDiscoveredDevices] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [discovering, setDiscovering] = useState(false);

  // Stagger entrance
  const [visibleRows, setVisibleRows] = useState(0);
  useEffect(() => {
    if (subView === 'devices') {
      setVisibleRows(0);
      let i = 0;
      const iv = setInterval(() => { i++; setVisibleRows(i); if (i >= devices.length) clearInterval(iv); }, 80);
      return () => clearInterval(iv);
    }
  }, [subView, devices.length]);

  // Filter platforms by search
  const filteredPlatforms = useMemo(() => {
    if (!searchQuery.trim()) return PLATFORMS;
    const q = searchQuery.toLowerCase();
    return PLATFORMS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.devices.some(d => d.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const toggleDevice = (id: string) => {
    setDevices(prev => prev.map(d =>
      d.id === id ? { ...d, status: !d.status } : d
    ));
  };

  const startSetup = (platformId: string) => {
    setSetupPlatform(platformId);
    setSetupStep('auth');
    setShowAuthModal(true);
  };

  const handleAuth = () => {
    setShowAuthModal(false);
    setSetupStep('discover');
    setDiscovering(true);
    setAuthProgress(0);

    // Simulate device discovery
    const platform = PLATFORMS.find(p => p.id === setupPlatform);
    const mockDevices = platform?.devices || ['Device 1', 'Device 2'];
    let prog = 0;
    const iv = setInterval(() => {
      prog += 25;
      setAuthProgress(prog);
      if (prog >= 100) {
        clearInterval(iv);
        setDiscovering(false);
        setDiscoveredDevices(mockDevices);
        setSetupStep('assign');
      }
    }, 600);
  };

  const completeSetup = () => {
    if (setupPlatform) {
      setConnectedPlatforms(prev => new Set(prev).add(setupPlatform));
    }
    setSetupStep('done');
    setTimeout(() => {
      setSetupStep('platforms');
      setSubView('devices');
      setSetupPlatform(null);
    }, 2000);
  };

  return (
    <div className="h-full overflow-y-auto bg-background" style={{ WebkitOverflowScrolling: 'touch' }}>
      <style>{`
        @keyframes shSpring { 0% { transform:translateY(20px); opacity:0 } 100% { transform:translateY(0); opacity:1 } }
        @keyframes shDiscover { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
      `}</style>

      {/* ── Auth Modal ── */}
      {showAuthModal && (
        <div className="absolute inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <div className="w-full bg-card" style={{
            borderRadius: '20px 20px 0 0', padding: '24px 20px 36px',
            animation: 'shSpring .35s ease-out',
          }}>
            <div className="flex items-center gap-3 mb-4">
              <IconBox Icon={Shield} color="#007AFF" size={44} iconSize={20} />
              <div>
                <p className="text-[17px] font-semibold text-foreground">Authenticate</p>
                <p className="text-[13px] text-muted-foreground">
                  Sign in to {PLATFORMS.find(p => p.id === setupPlatform)?.name}
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-xl p-4 mb-5">
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                You'll be redirected to securely sign in with your smart home account. Calmora will receive permission to view and control assigned devices only.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Shield size={12} className="text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground">End-to-end encrypted · OAuth 2.0</p>
              </div>
            </div>

            <button onClick={handleAuth} className="w-full h-[50px] rounded-xl bg-primary text-primary-foreground text-[17px] font-semibold">
              Continue to Sign In
            </button>
            <button onClick={() => { setShowAuthModal(false); setSetupStep('platforms'); }} className="w-full h-[44px] rounded-xl mt-2 border border-border text-[15px] text-muted-foreground font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="px-4 pt-2 pb-32">

        {/* ── Large Title ── */}
        <h1 className="text-ios-large-title text-foreground mb-1">Smart Home</h1>
        <p className="text-[15px] text-muted-foreground mb-4">
          {connectedPlatforms.size} platform{connectedPlatforms.size !== 1 ? 's' : ''} connected · {devices.length} devices
        </p>

        {/* ── Segmented Control ── */}
        <div className="mb-4">
          <SegmentedControl
            items={[
              { value: 'devices', label: 'Devices' },
              { value: 'rooms', label: 'Rooms' },
              { value: 'setup', label: 'Setup' },
            ]}
            value={subView}
            onChange={(v) => setSubView(v as SubView)}
          />
        </div>

        {/* ═══ DEVICES VIEW ═══ */}
        {subView === 'devices' && (
          <>
            {/* Quick status summary */}
            <div className="flex gap-2 mb-4">
              {[
                { label: 'Active', value: devices.filter(d => d.status).length.toString(), color: '#34C759' },
                { label: 'Rooms', value: ROOMS.length.toString(), color: '#007AFF' },
                { label: 'Alerts', value: '0', color: '#FF9500' },
              ].map(s => (
                <div key={s.label} className="flex-1 bg-card rounded-xl p-3" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <p className="text-[24px] font-bold text-foreground" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Section header */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] text-muted-foreground uppercase tracking-wide px-1">All Devices</p>
              <button onClick={() => setSubView('setup')} className="flex items-center gap-1 text-[13px] text-primary font-semibold">
                <Plus size={14} />
                Add
              </button>
            </div>

            {/* Device list */}
            <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
              {devices.map((d, i) => (
                <div key={d.id}>
                  <div className="flex items-center gap-3 px-4" style={{
                    minHeight: 68,
                    opacity: visibleRows > i ? 1 : 0,
                    transform: visibleRows > i ? 'translateY(0)' : 'translateY(6px)',
                    transition: 'opacity .35s ease-out, transform .35s ease-out',
                  }}>
                    <IconBox Icon={d.Icon} color={d.color} size={40} iconSize={18} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-foreground">{d.name}</p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">{d.room} · {d.status ? d.statusLabel : d.offLabel}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5" style={{
                        color: d.status ? '#34C759' : '#8E8E93',
                        backgroundColor: d.status ? 'rgba(52,199,89,0.08)' : 'rgba(60,60,67,0.04)',
                      }}>
                        {d.status ? d.statusLabel : 'OFF'}
                      </span>
                      {/* iOS toggle */}
                      <div onClick={() => toggleDevice(d.id)}
                        className="shrink-0 cursor-pointer"
                        style={{
                          width: 51, height: 31, borderRadius: 16, padding: 2,
                          transition: 'background .3s',
                          background: d.status ? '#34C759' : 'rgba(120,120,128,0.16)',
                        }}>
                        <div style={{
                          width: 27, height: 27, borderRadius: 14, background: '#fff',
                          transition: 'transform .3s ease',
                          transform: d.status ? 'translateX(20px)' : 'translateX(0)',
                          boxShadow: '0 3px 8px rgba(0,0,0,.15), 0 1px 1px rgba(0,0,0,.06)',
                        }} />
                      </div>
                    </div>
                  </div>
                  {i < devices.length - 1 && (
                    <div className="ml-16" style={{ height: 0.5, backgroundColor: 'rgba(60,60,67,0.08)' }} />
                  )}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground text-center mt-3 opacity-60">
              All changes sync in under 2 seconds
            </p>
          </>
        )}

        {/* ═══ ROOMS VIEW ═══ */}
        {subView === 'rooms' && (
          <>
            <p className="text-[13px] text-muted-foreground uppercase tracking-wide px-1 mb-2">Rooms</p>
            <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
              {ROOMS.map((room, i) => {
                const roomDevices = devices.filter(d => d.room === room.name);
                const activeCount = roomDevices.filter(d => d.status).length;
                return (
                  <div key={room.id}>
                    <div className="flex items-center gap-3 px-4" style={{ minHeight: 72 }}>
                      <IconBox Icon={room.Icon} color="#007AFF" size={40} iconSize={18} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[17px] font-semibold text-foreground">{room.name}</p>
                        <p className="text-[13px] text-muted-foreground mt-0.5">
                          {roomDevices.length} device{roomDevices.length !== 1 ? 's' : ''} · {activeCount} active
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground opacity-40" />
                    </div>
                    {i < ROOMS.length - 1 && (
                      <div className="ml-16" style={{ height: 0.5, backgroundColor: 'rgba(60,60,67,0.08)' }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Room devices breakdown */}
            {ROOMS.map(room => {
              const roomDevices = devices.filter(d => d.room === room.name);
              if (roomDevices.length === 0) return null;
              return (
                <div key={room.id} className="mt-5">
                  <p className="text-[13px] text-muted-foreground uppercase tracking-wide px-1 mb-2">{room.name}</p>
                  <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                    {roomDevices.map((d, i) => (
                      <div key={d.id}>
                        <div className="flex items-center gap-3 px-4" style={{ minHeight: 64 }}>
                          <IconBox Icon={d.Icon} color={d.color} size={36} iconSize={16} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-medium text-foreground">{d.name}</p>
                            <p className="text-[12px] text-muted-foreground mt-0.5">{d.status ? d.statusLabel : d.offLabel}</p>
                          </div>
                          <div onClick={() => toggleDevice(d.id)} className="shrink-0 cursor-pointer"
                            style={{
                              width: 51, height: 31, borderRadius: 16, padding: 2,
                              transition: 'background .3s',
                              background: d.status ? '#34C759' : 'rgba(120,120,128,0.16)',
                            }}>
                            <div style={{
                              width: 27, height: 27, borderRadius: 14, background: '#fff',
                              transition: 'transform .3s ease',
                              transform: d.status ? 'translateX(20px)' : 'translateX(0)',
                              boxShadow: '0 3px 8px rgba(0,0,0,.15), 0 1px 1px rgba(0,0,0,.06)',
                            }} />
                          </div>
                        </div>
                        {i < roomDevices.length - 1 && (
                          <div className="ml-14" style={{ height: 0.5, backgroundColor: 'rgba(60,60,67,0.08)' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ═══ SETUP VIEW ═══ */}
        {subView === 'setup' && (
          <>
            {/* Setup: back from sub-steps */}
            {setupStep !== 'platforms' && setupStep !== 'done' && (
              <button onClick={() => setSetupStep('platforms')} className="flex items-center gap-1 text-primary text-[15px] font-medium mb-3">
                <ArrowLeft size={16} />
                Back to Platforms
              </button>
            )}

            {/* ── STEP: Platform List ── */}
            {setupStep === 'platforms' && (
              <>
                {/* Info card */}
                <div className="bg-card rounded-xl p-4 mb-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <IconBox Icon={Home} color="#007AFF" size={40} iconSize={18} />
                    <p className="text-[17px] font-semibold text-foreground">Connect a Platform</p>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Link your smart home platform to enable automated device control when Calmora detects a risk. One-time setup per platform.
                  </p>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search platforms, brands, devices..."
                    className="w-full h-[36px] rounded-lg bg-muted pl-9 pr-8 text-[15px] text-foreground placeholder:text-muted-foreground border-none outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X size={14} className="text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* Results count */}
                <p className="text-[13px] text-muted-foreground uppercase tracking-wide px-1 mb-2">
                  {filteredPlatforms.length} Platform{filteredPlatforms.length !== 1 ? 's' : ''} Available
                </p>

                {/* Platform list */}
                <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                  {filteredPlatforms.map((p, i) => {
                    const isConnected = connectedPlatforms.has(p.id);
                    return (
                      <div key={p.id}>
                        <div className="flex items-center gap-3 px-4" style={{ minHeight: 68 }}>
                          <IconBox Icon={p.Icon} color={p.color} size={40} iconSize={18} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-semibold text-foreground">{p.name}</p>
                            <p className="text-[12px] text-muted-foreground mt-0.5">{p.desc}</p>
                          </div>
                          {isConnected ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#34C759' }} />
                              <span className="text-[13px] font-semibold" style={{ color: '#34C759' }}>Connected</span>
                            </div>
                          ) : (
                            <button onClick={() => startSetup(p.id)} className="flex items-center gap-1 text-[13px] font-semibold text-primary">
                              Connect
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                        {i < filteredPlatforms.length - 1 && (
                          <div className="ml-16" style={{ height: 0.5, backgroundColor: 'rgba(60,60,67,0.08)' }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {filteredPlatforms.length === 0 && (
                  <div className="text-center py-8">
                    <Search size={32} className="text-muted-foreground opacity-30 mx-auto mb-2" />
                    <p className="text-[15px] text-muted-foreground">No platforms match "{searchQuery}"</p>
                    <p className="text-[12px] text-muted-foreground opacity-60 mt-1">Try a different search term</p>
                  </div>
                )}

                {/* Security footer */}
                <div className="flex items-center gap-2 justify-center mt-4">
                  <Shield size={12} className="text-muted-foreground opacity-40" />
                  <p className="text-[11px] text-muted-foreground opacity-50">
                    Encrypted connections · OAuth 2.0 · Credentials never stored
                  </p>
                </div>
              </>
            )}

            {/* ── STEP: Discovering Devices ── */}
            {setupStep === 'discover' && (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Wifi size={24} className="text-primary" style={{ animation: discovering ? 'shDiscover 2s linear infinite' : 'none' }} />
                </div>
                <p className="text-[20px] font-semibold text-foreground mb-1">
                  {discovering ? 'Discovering Devices' : 'Devices Found'}
                </p>
                <p className="text-[13px] text-muted-foreground mb-6">
                  {discovering
                    ? `Scanning ${PLATFORMS.find(p => p.id === setupPlatform)?.name}...`
                    : `${discoveredDevices.length} devices ready to configure`
                  }
                </p>

                {/* Progress bar */}
                <div className="w-48 h-1 rounded-full bg-muted mx-auto overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${authProgress}%` }} />
                </div>

                {!discovering && discoveredDevices.length > 0 && (
                  <div className="mt-8 text-left">
                    <p className="text-[13px] text-muted-foreground uppercase tracking-wide px-1 mb-2">Discovered</p>
                    <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                      {discoveredDevices.map((d, i) => (
                        <div key={d}>
                          <div className="flex items-center gap-3 px-4" style={{ minHeight: 52 }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#34C759' }} />
                            <p className="text-[15px] text-foreground flex-1">{d}</p>
                            <Check size={16} className="text-primary" />
                          </div>
                          {i < discoveredDevices.length - 1 && (
                            <div className="ml-8" style={{ height: 0.5, backgroundColor: 'rgba(60,60,67,0.08)' }} />
                          )}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setSetupStep('assign')}
                      className="w-full h-[50px] rounded-xl bg-primary text-primary-foreground text-[17px] font-semibold mt-4">
                      Assign to Rooms
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP: Room Assignment ── */}
            {setupStep === 'assign' && (
              <>
                <p className="text-[20px] font-semibold text-foreground mb-1">Assign Devices</p>
                <p className="text-[13px] text-muted-foreground mb-4">
                  Tell Calmora where each device is located so it can automate the right actions.
                </p>

                <div className="bg-card rounded-xl overflow-hidden mb-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                  {discoveredDevices.map((d, i) => (
                    <div key={d}>
                      <div className="flex items-center gap-3 px-4" style={{ minHeight: 64 }}>
                        <IconBox Icon={Smartphone} color="#007AFF" size={36} iconSize={16} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-medium text-foreground">{d}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5">
                            {selectedRoom || 'Tap to assign room'}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground opacity-40" />
                      </div>
                      {i < discoveredDevices.length - 1 && (
                        <div className="ml-14" style={{ height: 0.5, backgroundColor: 'rgba(60,60,67,0.08)' }} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Room selection */}
                <p className="text-[13px] text-muted-foreground uppercase tracking-wide px-1 mb-2">Available Rooms</p>
                <div className="bg-card rounded-xl overflow-hidden mb-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                  {ROOMS.map((room, i) => (
                    <div key={room.id}>
                      <button onClick={() => setSelectedRoom(room.name)} className="flex items-center gap-3 px-4 w-full text-left" style={{ minHeight: 52 }}>
                        <IconBox Icon={room.Icon} color="#5AC8FA" size={32} iconSize={14} />
                        <p className="text-[15px] text-foreground flex-1">{room.name}</p>
                        {selectedRoom === room.name && <Check size={16} className="text-primary" />}
                      </button>
                      {i < ROOMS.length - 1 && (
                        <div className="ml-12" style={{ height: 0.5, backgroundColor: 'rgba(60,60,67,0.08)' }} />
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={completeSetup}
                  className="w-full h-[50px] rounded-xl bg-primary text-primary-foreground text-[17px] font-semibold">
                  Complete Setup
                </button>
              </>
            )}

            {/* ── STEP: Done ── */}
            {setupStep === 'done' && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(52,199,89,0.1)' }}>
                  <Check size={36} strokeWidth={2} style={{ color: '#34C759' }} />
                </div>
                <p className="text-[22px] font-bold text-foreground mb-1">Setup Complete</p>
                <p className="text-[15px] text-muted-foreground">
                  {PLATFORMS.find(p => p.id === setupPlatform)?.name} is now connected
                </p>
                <p className="text-[12px] text-muted-foreground mt-2 opacity-60">Redirecting to devices...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
