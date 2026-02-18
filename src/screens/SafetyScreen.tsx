import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Shield, MapPin, Phone, AlertTriangle, Activity, Check } from 'lucide-react';

export default function SafetyScreen() {
  const { mode, isSOSActive, triggerSOS, cancelSOS, patientLocation } = useApp();
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);

  const handleSOS = () => {
    if (isSOSActive) { cancelSOS(); setSosCountdown(null); return; }
    setSosCountdown(3);
    const interval = setInterval(() => {
      setSosCountdown(prev => {
        if (prev === null || prev <= 1) { clearInterval(interval); triggerSOS(); return null; }
        return prev - 1;
      });
    }, 1000);
  };

  if (mode === 'essential') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 bg-background relative overflow-hidden">
        <div className="absolute inset-0 lavender-shimmer" />
        <div className="text-center mb-14 relative z-10">
          <div className="w-32 h-32 rounded-3xl gradient-success flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-16 h-16 text-success-foreground" />
          </div>
          <h1 className="text-[48px] font-extrabold text-foreground font-display">You're Safe</h1>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSOS}
          className="w-full py-12 bg-destructive text-destructive-foreground rounded-3xl flex flex-col items-center justify-center gap-4 sos-pulse relative z-10 shadow-xl">
          <Phone className="w-14 h-14" />
          <span className="text-[28px] font-extrabold">
            {isSOSActive ? 'Calling...' : sosCountdown !== null ? `Calling in ${sosCountdown}...` : 'Emergency Call'}
          </span>
        </motion.button>
        {(isSOSActive || sosCountdown !== null) && (
          <button onClick={() => { cancelSOS(); setSosCountdown(null); }} className="mt-8 text-[22px] text-muted-foreground touch-target-xxl font-bold relative z-10">Cancel</button>
        )}
      </div>
    );
  }

  if (mode === 'simplified') {
    return (
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6 relative">
        <div className="relative z-10">
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-[34px] font-extrabold text-foreground font-display">🛡️ Safety</h1>
          </div>
          <div className="px-5 space-y-5">
            <div className="ios-card-elevated p-6 flex items-center gap-5">
              <div className="bg-success/10 rounded-2xl flex items-center justify-center shrink-0" style={{ width: 72, height: 72 }}>
                <Shield className="w-10 h-10 text-success" />
              </div>
              <div>
                <div className="text-[24px] font-extrabold text-foreground">You're Safe</div>
                <div className="text-[18px] text-muted-foreground font-medium">Everything looks good</div>
              </div>
            </div>

            <div className="ios-card-elevated overflow-hidden">
              <div className="flex items-center gap-3 p-5 pb-3">
                <MapPin className="w-6 h-6 text-primary" />
                <span className="text-[20px] font-bold text-foreground">Current Location</span>
              </div>
              <div className="px-5 pb-5">
                <div className="rounded-xl overflow-hidden h-40">
                  <iframe title="Location map" src="https://www.openstreetmap.org/export/embed.html?bbox=-0.1278%2C51.5074%2C-0.1178%2C51.5124&layer=mapnik&marker=51.5099%2C-0.1228" className="w-full h-full border-0" />
                </div>
                <div className="flex items-center gap-2.5 mt-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-[18px] font-bold text-foreground">Home</span>
                  <span className="px-4 py-1.5 rounded-lg bg-success/10 text-success text-[16px] font-bold ml-auto">Safe zone</span>
                </div>
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSOS}
              className={`w-full p-8 rounded-2xl flex items-center justify-center gap-4 touch-target-xxl shadow-lg ${isSOSActive ? 'bg-destructive/10 border-2 border-destructive' : 'bg-destructive sos-pulse'}`}>
              <Phone className={`w-10 h-10 ${isSOSActive ? 'text-destructive' : 'text-destructive-foreground'}`} />
              <span className={`text-[22px] font-extrabold ${isSOSActive ? 'text-destructive' : 'text-destructive-foreground'}`}>
                {isSOSActive ? 'Calling Sarah...' : sosCountdown !== null ? `Calling in ${sosCountdown}...` : 'Emergency SOS'}
              </span>
            </motion.button>
            {(isSOSActive || sosCountdown !== null) && (
              <button onClick={() => { cancelSOS(); setSosCountdown(null); }} className="w-full p-5 text-center text-[18px] text-muted-foreground touch-target-xl font-bold">Cancel Emergency</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto ios-grouped-bg pb-6 relative">
      <div className="relative z-10">
        <div className="px-5 pt-5 pb-3">
          <h1 className="text-[15px] font-bold text-muted-foreground uppercase tracking-wider font-display">🛡️ Safety</h1>
        </div>
        <div className="mx-4 space-y-3">
          <div className="bg-card rounded-2xl p-4 flex items-center gap-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <Check className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1">
              <div className="text-[17px] font-bold text-foreground font-display">All Systems Normal</div>
              <div className="text-[13px] text-muted-foreground mt-0.5 font-medium">Last checked 2 min ago</div>
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-success animate-pulse" />
          </div>

          <div className="bg-card rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-3 p-4 pb-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-[16px] font-bold text-foreground font-display">Current Location</span>
            </div>
            <div className="px-4 pb-4">
              <div className="rounded-xl overflow-hidden h-36">
                <iframe title="Location map" src="https://www.openstreetmap.org/export/embed.html?bbox=-0.1278%2C51.5074%2C-0.1178%2C51.5124&layer=mapnik&marker=51.5099%2C-0.1228" className="w-full h-full border-0" />
              </div>
              <div className="flex items-center gap-2.5 mt-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-[15px] font-bold text-foreground font-display">Home</span>
                <span className="px-2.5 py-1 rounded-lg bg-success/8 text-success text-[12px] font-bold ml-auto">Safe zone</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary" />
              <span className="text-[16px] font-bold text-foreground flex-1 font-display">Fall Detection</span>
              <span className="px-3 py-1 rounded-lg bg-success/8 text-success text-[12px] font-bold">Active</span>
            </div>
            <div className="text-[14px] text-muted-foreground mt-2 font-medium">No incidents in the last 30 days</div>
          </div>

          <div className="bg-card rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-3 p-4 pb-3">
              <Phone className="w-5 h-5 text-primary" />
              <span className="text-[16px] font-bold text-foreground font-display">Emergency Contacts</span>
            </div>
            {[
              { name: 'Sarah Johnson', role: 'Primary Caregiver', emoji: '👩' },
              { name: 'John Johnson', role: 'Son', emoji: '👨' },
              { name: 'Dr. Smith', role: 'Doctor', emoji: '👨‍⚕️' },
            ].map(contact => (
              <div key={contact.name} className="flex items-center gap-3.5 px-4 py-3.5 border-t border-border/30">
                <div className="w-11 h-11 rounded-xl bg-muted/40 flex items-center justify-center shrink-0">
                  <span className="text-[20px]">{contact.emoji}</span>
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-foreground">{contact.name}</div>
                  <div className="text-[13px] text-muted-foreground font-medium">{contact.role}</div>
                </div>
                <button className="w-11 h-11 rounded-xl bg-success/8 flex items-center justify-center touch-target" aria-label={`Call ${contact.name}`}>
                  <Phone className="w-5 h-5 text-success" />
                </button>
              </div>
            ))}
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSOS}
            className="w-full p-5 bg-destructive text-destructive-foreground rounded-2xl flex items-center justify-center gap-3 sos-pulse touch-target-xl" style={{ boxShadow: 'var(--shadow-elevated)' }}>
            <AlertTriangle className="w-6 h-6" />
            <span className="text-[17px] font-extrabold font-display">
              {isSOSActive ? 'Calling Sarah...' : sosCountdown !== null ? `Calling in ${sosCountdown}...` : 'Emergency SOS'}
            </span>
          </motion.button>
          {(isSOSActive || sosCountdown !== null) && (
            <button onClick={() => { cancelSOS(); setSosCountdown(null); }} className="w-full text-center text-[15px] text-muted-foreground py-3 touch-target font-bold">Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
}
