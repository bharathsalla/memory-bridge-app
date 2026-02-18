import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, MapPin, Phone, AlertTriangle, ChevronLeft, ChevronRight,
  Watch, Smartphone, Search, Plus, Navigation, Clock, Circle,
  Battery, Wifi, Check, X, History, Settings2, Bell
} from 'lucide-react';

type SubPage = 'main' | 'connect-device' | 'location-history' | 'set-safe-area' | 'sos-alerts';

const smartwatchBrands = [
  { name: 'Apple Watch', logo: '⌚', models: ['Series 9', 'SE', 'Ultra 2'] },
  { name: 'Samsung Galaxy Watch', logo: '⌚', models: ['Watch 6', 'Watch 5 Pro'] },
  { name: 'Fitbit', logo: '⌚', models: ['Sense 2', 'Versa 4', 'Charge 6'] },
  { name: 'Garmin', logo: '⌚', models: ['Venu 3', 'Forerunner 265'] },
  { name: 'Amazfit', logo: '⌚', models: ['GTR 4', 'T-Rex Ultra'] },
  { name: 'Huawei Watch', logo: '⌚', models: ['GT 4', 'Watch D2'] },
];

const gpsDeviceBrands = [
  { name: 'Jiobit', logo: '📡', desc: 'Real-time GPS tracker with SIM' },
  { name: 'AngelSense', logo: '📡', desc: 'GPS tracker for special needs' },
  { name: 'Tracki', logo: '📡', desc: 'Mini GPS tracker with SIM' },
  { name: 'Invoxia', logo: '📡', desc: 'GPS tracker, no subscription' },
  { name: 'Tile Pro', logo: '📡', desc: 'Bluetooth + GPS network' },
  { name: 'LandAirSea', logo: '📡', desc: 'Real-time GPS with magnet' },
];

const locationHistory = [
  { time: '9:00 AM', place: 'Home - Lakshmi Nagar', status: 'safe' },
  { time: '10:15 AM', place: 'Morning Walk - Park', status: 'safe' },
  { time: '10:45 AM', place: 'Near Temple', status: 'safe' },
  { time: '11:30 AM', place: 'Back Home', status: 'safe' },
  { time: '2:00 PM', place: 'Left Home', status: 'alert' },
  { time: '2:15 PM', place: 'Near Metro Station', status: 'alert' },
  { time: '2:40 PM', place: 'Returned Home', status: 'safe' },
];

export default function CaregiverSafetyScreen() {
  const { isSOSActive, cancelSOS, patientSafe, patientLocation, safeZoneRadius, setSafeZoneRadius, setPatientSafe, sosTriggeredLocation, sosHistory } = useApp();
  const [subPage, setSubPage] = useState<SubPage>('main');
  const [connectedWatch, setConnectedWatch] = useState<string | null>(null);
  const [connectedGPS, setConnectedGPS] = useState<string | null>(null);
  const [deviceSearch, setDeviceSearch] = useState('');
  const [selectedRadius, setSelectedRadius] = useState(safeZoneRadius);
  const [historyDate, setHistoryDate] = useState<'today' | 'yesterday' | 'custom'>('today');

  // SOS Alert triggered from patient side
  const sosAlert = isSOSActive;

  if (subPage === 'connect-device') {
    const filteredWatches = smartwatchBrands.filter(b => b.name.toLowerCase().includes(deviceSearch.toLowerCase()));
    const filteredGPS = gpsDeviceBrands.filter(b => b.name.toLowerCase().includes(deviceSearch.toLowerCase()));

    return (
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3">
          <button onClick={() => setSubPage('main')} className="touch-target"><ChevronLeft className="w-6 h-6 text-primary" /></button>
          <h1 className="text-[20px] font-bold text-foreground">Connect Device</h1>
        </div>

        {/* Search */}
        <div className="px-5 mb-4">
          <div className="ios-card-elevated flex items-center gap-3 px-4 py-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              value={deviceSearch}
              onChange={e => setDeviceSearch(e.target.value)}
              placeholder="Search brands or add custom..."
              className="flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Smartwatch GPS */}
        <div className="px-5">
          <h2 className="text-[16px] font-bold text-foreground mb-3 flex items-center gap-2">
            <Watch className="w-5 h-5 text-primary" /> Smartwatch with GPS
          </h2>
          <div className="space-y-2">
            {filteredWatches.map(brand => (
              <motion.button
                key={brand.name}
                whileTap={{ scale: 0.97 }}
                onClick={() => setConnectedWatch(brand.name)}
                className={`w-full ios-card-elevated p-4 flex items-center gap-3.5 text-left ${connectedWatch === brand.name ? 'ring-2 ring-success' : ''}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center text-[24px] shrink-0">
                  {brand.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-foreground">{brand.name}</div>
                  <div className="text-[12px] text-muted-foreground">{brand.models.join(' · ')}</div>
                </div>
                {connectedWatch === brand.name ? (
                  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-success-foreground" />
                  </div>
                ) : (
                  <Plus className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* GPS Device with SIM */}
        <div className="px-5 mt-6">
          <h2 className="text-[16px] font-bold text-foreground mb-3 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-accent" /> GPS Device with SIM
          </h2>
          <div className="space-y-2">
            {filteredGPS.map(brand => (
              <motion.button
                key={brand.name}
                whileTap={{ scale: 0.97 }}
                onClick={() => setConnectedGPS(brand.name)}
                className={`w-full ios-card-elevated p-4 flex items-center gap-3.5 text-left ${connectedGPS === brand.name ? 'ring-2 ring-success' : ''}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/8 flex items-center justify-center text-[24px] shrink-0">
                  {brand.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-foreground">{brand.name}</div>
                  <div className="text-[12px] text-muted-foreground">{brand.desc}</div>
                </div>
                {connectedGPS === brand.name ? (
                  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-success-foreground" />
                  </div>
                ) : (
                  <Plus className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Add Custom */}
        <div className="px-5 mt-5">
          <button className="w-full ios-card-elevated p-4 flex items-center justify-center gap-2 text-primary font-semibold text-[15px] touch-target">
            <Plus className="w-5 h-5" /> Add Other Device
          </button>
        </div>

        {/* Connect Button */}
        {(connectedWatch || connectedGPS) && (
          <div className="px-5 mt-5">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setSubPage('main')}
              className="w-full py-4 rounded-2xl bg-success text-success-foreground font-bold text-[16px] text-center"
            >
              ✓ Device Connected — Continue
            </motion.button>
          </div>
        )}
      </div>
    );
  }

  if (subPage === 'location-history') {
    return (
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3">
          <button onClick={() => setSubPage('main')} className="touch-target"><ChevronLeft className="w-6 h-6 text-primary" /></button>
          <h1 className="text-[20px] font-bold text-foreground">Location History</h1>
        </div>

        {/* Date Selector */}
        <div className="px-5 mb-4">
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            {(['today', 'yesterday', 'custom'] as const).map(d => (
              <button
                key={d}
                onClick={() => setHistoryDate(d)}
                className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${historyDate === d ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}
              >
                {d === 'today' ? 'Today' : d === 'yesterday' ? 'Yesterday' : 'Custom'}
              </button>
            ))}
          </div>
        </div>

        {/* Map with Path */}
        <div className="px-5 mb-4">
          <div className="ios-card-elevated overflow-hidden">
            <div className="rounded-2xl overflow-hidden h-48">
              <iframe
                title="Location history map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=78.45%2C17.37%2C78.52%2C17.41&layer=mapnik&marker=17.385%2C78.4867"
                className="w-full h-full border-0"
              />
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-[12px] text-muted-foreground">Start</span>
                <div className="w-3 h-3 rounded-full bg-destructive ml-2" />
                <span className="text-[12px] text-muted-foreground">End</span>
              </div>
              <span className="text-[12px] text-muted-foreground">7 locations tracked</span>
            </div>
          </div>
        </div>

        {/* Timeline List */}
        <div className="px-5">
          <h2 className="text-[16px] font-bold text-foreground mb-3">Timeline</h2>
          <div className="ios-card-elevated divide-y divide-border/30">
            {locationHistory.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <div className="flex flex-col items-center mt-0.5">
                  <div className={`w-3 h-3 rounded-full ${entry.status === 'safe' ? 'bg-success' : 'bg-destructive'}`} />
                  {i < locationHistory.length - 1 && <div className="w-px h-8 bg-border/60 mt-1" />}
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-foreground">{entry.place}</div>
                  <div className="text-[12px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {entry.time}
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${entry.status === 'safe' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {entry.status === 'safe' ? 'Safe' : 'Alert'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (subPage === 'set-safe-area') {
    return (
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3">
          <button onClick={() => setSubPage('main')} className="touch-target"><ChevronLeft className="w-6 h-6 text-primary" /></button>
          <h1 className="text-[20px] font-bold text-foreground">Set Safe Area</h1>
        </div>

        {/* Map with draggable circle concept */}
        <div className="px-5 mb-4">
          <div className="ios-card-elevated overflow-hidden">
            <div className="rounded-2xl overflow-hidden h-52 relative">
              <iframe
                title="Set safe area map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=78.47%2C17.375%2C78.50%2C17.395&layer=mapnik&marker=17.385%2C78.4867"
                className="w-full h-full border-0"
              />
              {/* Overlay circle indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`rounded-full border-4 border-success/40 bg-success/10 ${selectedRadius <= 100 ? 'w-20 h-20' : selectedRadius <= 200 ? 'w-32 h-32' : 'w-44 h-44'} transition-all duration-500`} />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-[14px] font-semibold text-foreground">Home - Lakshmi Nagar, Hyderabad</span>
              </div>
              <div className="text-[13px] text-muted-foreground mb-1">Safe Zone Radius</div>
              <div className="flex gap-2 mt-2">
                {[100, 200, 500].map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRadius(r)}
                    className={`flex-1 py-3 rounded-xl text-[14px] font-bold text-center ${selectedRadius === r ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}
                  >
                    {r}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="px-5 mt-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { setSafeZoneRadius(selectedRadius); setSubPage('main'); }}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-[16px]"
          >
            Save Safe Area
          </motion.button>
        </div>

        {/* Info */}
        <div className="px-5 mt-4">
          <div className="ios-card-elevated p-4">
            <h3 className="text-[14px] font-bold text-foreground mb-2">How Geofencing Works</h3>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-success mt-0.5">●</span> GPS tracks patient location every minute</li>
              <li className="flex items-start gap-2"><span className="text-success mt-0.5">●</span> System calculates distance from home</li>
              <li className="flex items-start gap-2"><span className="text-destructive mt-0.5">●</span> If distance {'>'} {selectedRadius}m → Alert triggered</li>
              <li className="flex items-start gap-2"><span className="text-success mt-0.5">●</span> If distance ≤ {selectedRadius}m → Safe</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (subPage === 'sos-alerts') {
    return (
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3">
          <button onClick={() => setSubPage('main')} className="touch-target"><ChevronLeft className="w-6 h-6 text-primary" /></button>
          <h1 className="text-[20px] font-bold text-foreground">SOS Alerts</h1>
        </div>

        {/* Active SOS Alert */}
        <AnimatePresence>
          {sosAlert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-5 mb-4"
            >
              <div className="ios-card-elevated bg-destructive/10 border-2 border-destructive p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-6 h-6 text-destructive-foreground" />
                  </div>
                  <div>
                    <div className="text-[18px] font-bold text-destructive">🚨 SOS Triggered!</div>
                    <div className="text-[13px] text-foreground">Patient needs immediate help</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-foreground" />
                  <span className="text-[14px] text-foreground font-medium">Location: {sosTriggeredLocation || patientLocation}</span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 rounded-xl bg-success text-success-foreground font-bold text-[14px] flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" /> Call Now
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-[14px] flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-5 h-5" /> Navigate
                  </motion.button>
                </div>
                <button onClick={cancelSOS} className="w-full mt-3 py-2 text-center text-[14px] text-muted-foreground font-medium">
                  Dismiss Alert
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SOS History from state */}
        <div className="px-5">
          <h2 className="text-[16px] font-bold text-foreground mb-3">SOS History</h2>
          {sosHistory.length === 0 ? (
            <div className="ios-card-elevated p-6 text-center text-muted-foreground text-[14px]">No SOS alerts recorded</div>
          ) : (
            <div className="ios-card-elevated divide-y divide-border/30">
              {sosHistory.map((sos) => (
                <div key={sos.id} className="flex items-center gap-3 p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sos.resolved ? 'bg-success/10' : 'bg-destructive/10 animate-pulse'}`}>
                    <AlertTriangle className={`w-5 h-5 ${sos.resolved ? 'text-success' : 'text-destructive'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-foreground">{sos.timestamp}</div>
                    <div className="text-[12px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {sos.location}
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold ${sos.resolved ? 'text-success' : 'text-destructive'}`}>
                    {sos.resolved ? 'Resolved' : '⚠ Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="px-5 mt-5">
          <div className="ios-card-elevated p-4">
            <h3 className="text-[14px] font-bold text-foreground mb-2">How SOS Works</h3>
            <div className="space-y-2 text-[13px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center text-[10px] font-bold text-destructive shrink-0">1</span>
                Patient presses Emergency SOS
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center text-[10px] font-bold text-destructive shrink-0">2</span>
                App sends alert with GPS location
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center text-[10px] font-bold text-destructive shrink-0">3</span>
                Push notification to all caregivers
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center text-[10px] font-bold text-destructive shrink-0">4</span>
                Call Now / Navigate options shown
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN page
  return (
    <div className="h-full overflow-y-auto ios-grouped-bg pb-6">
      {/* Gradient Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-accent px-5 pt-5 pb-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-foreground/5" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-[20px] font-extrabold text-primary-foreground leading-tight font-display">Safety Tracking</h1>
            <p className="text-[13px] text-primary-foreground/60 font-medium">Monitor & protect</p>
          </div>
        </div>
      </div>

      {/* Active SOS Banner */}
      <AnimatePresence>
        {sosAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5 mb-4"
          >
            <button onClick={() => setSubPage('sos-alerts')} className="w-full ios-card-elevated bg-destructive/10 border-2 border-destructive p-4 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center animate-pulse shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-[16px] font-bold text-destructive">🚨 SOS Active!</div>
                <div className="text-[13px] text-foreground">Tap to view details</div>
              </div>
              <ChevronRight className="w-5 h-5 text-destructive" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connect Device Section */}
      <div className="px-5 mb-4">
        <button
          onClick={() => setSubPage('connect-device')}
          className="w-full ios-card-elevated p-4 flex items-center gap-3.5 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center shrink-0">
            <Wifi className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-bold text-foreground">Connected Devices</div>
            <div className="text-[12px] text-muted-foreground">
              {connectedWatch || connectedGPS ? `${connectedWatch || ''} ${connectedGPS ? `· ${connectedGPS}` : ''}`.trim() : 'Tap to connect smartwatch or GPS'}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </button>
      </div>

      {/* 1. Safety Status */}
      <div className="px-5 mb-4">
        <div className={`ios-card-elevated p-5 ${patientSafe ? 'bg-success/5' : 'bg-destructive/5'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className={`w-5 h-5 ${patientSafe ? 'text-success' : 'text-destructive'}`} />
            <span className="text-[14px] font-bold text-muted-foreground uppercase tracking-wide">Safety Status</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-5 h-5 rounded-full ${patientSafe ? 'bg-success' : 'bg-destructive'} animate-pulse`} />
            <span className={`text-[22px] font-bold ${patientSafe ? 'text-success' : 'text-destructive'}`}>
              {patientSafe ? 'Safe at Home' : 'Left Safe Area'}
            </span>
          </div>
          {!patientSafe && (
            <div className="flex items-center gap-2 mb-3 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[14px] font-medium">Outside boundary since 4:32 PM</span>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-[14px] text-foreground font-medium">{patientLocation}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-[13px] text-muted-foreground">Last Updated: 2 mins ago</span>
            </div>
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-muted-foreground" />
              <span className="text-[13px] text-muted-foreground">Battery: 78%</span>
            </div>
          </div>

          {/* Toggle for demo */}
          <button
            onClick={() => setPatientSafe(!patientSafe)}
            className="mt-4 w-full py-2 rounded-xl bg-muted text-[12px] font-medium text-muted-foreground text-center"
          >
            ↻ Toggle Status (Demo)
          </button>
        </div>
      </div>

      {/* 2. Live Map View */}
      <div className="px-5 mb-4">
        <div className="ios-card-elevated overflow-hidden">
          <div className="flex items-center gap-3 p-4 pb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-[16px] font-bold text-foreground">Live Map</span>
          </div>
          <div className="px-4 pb-4">
            <div className="rounded-2xl overflow-hidden h-44 relative">
              <iframe
                title="Live location map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=78.47%2C17.375%2C78.50%2C17.395&layer=mapnik&marker=17.385%2C78.4867"
                className="w-full h-full border-0"
              />
              {/* Safe zone circle overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`rounded-full border-4 ${patientSafe ? 'border-success/40 bg-success/10' : 'border-destructive/40 bg-destructive/10'} w-28 h-28 transition-colors duration-500`} />
                <div className="absolute w-3 h-3 rounded-full bg-primary shadow-lg" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-primary" /> Patient</span>
                <span className="flex items-center gap-1"><div className={`w-2.5 h-2.5 rounded-full ${patientSafe ? 'bg-success' : 'bg-destructive'}`} /> Safe Zone</span>
                <span className="flex items-center gap-1">🏠 Home</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action Buttons */}
      <div className="px-5 space-y-2.5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setSubPage('location-history')}
          className="w-full ios-card-elevated p-4 flex items-center gap-3.5 text-left touch-target"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-semibold text-foreground">📍 View Location History</div>
            <div className="text-[12px] text-muted-foreground">Track movement patterns</div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setSubPage('set-safe-area')}
          className="w-full ios-card-elevated p-4 flex items-center gap-3.5 text-left touch-target"
        >
          <div className="w-11 h-11 rounded-xl bg-success/8 flex items-center justify-center shrink-0">
            <Settings2 className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-semibold text-foreground">🛠 Set / Edit Safe Area</div>
            <div className="text-[12px] text-muted-foreground">Current radius: {safeZoneRadius}m</div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setSubPage('sos-alerts')}
          className={`w-full ios-card-elevated p-4 flex items-center gap-3.5 text-left touch-target ${sosAlert ? 'ring-2 ring-destructive' : ''}`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${sosAlert ? 'bg-destructive animate-pulse' : 'bg-destructive/8'}`}>
            <AlertTriangle className={`w-5 h-5 ${sosAlert ? 'text-destructive-foreground' : 'text-destructive'}`} />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-semibold text-foreground">🆘 SOS Alerts</div>
            <div className="text-[12px] text-muted-foreground">{sosAlert ? 'Active alert!' : 'No active alerts'}</div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      </div>
    </div>
  );
}
