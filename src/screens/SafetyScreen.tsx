import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Shield, MapPin, Phone, AlertTriangle, Activity, Check } from 'lucide-react';

export default function SafetyScreen() {
  const { mode, isSOSActive, triggerSOS, cancelSOS } = useApp();
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

  // Essential
  if (mode === 'essential') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 bg-background">
        <div className="text-center mb-14">
          <div className="w-24 h-24 rounded-full bg-success/8 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-12 h-12 text-success" />
          </div>
          <h1 className="text-[44px] font-bold text-foreground">You're Safe</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSOS}
          className="w-full py-10 rounded-3xl bg-destructive text-destructive-foreground flex flex-col items-center justify-center gap-3 sos-pulse"
        >
          <Phone className="w-12 h-12" />
          <span className="text-[26px] font-bold">
            {isSOSActive ? 'Calling...' : sosCountdown !== null ? `Calling in ${sosCountdown}...` : 'Emergency Call'}
          </span>
        </motion.button>
        {(isSOSActive || sosCountdown !== null) && (
          <button onClick={() => { cancelSOS(); setSosCountdown(null); }} className="mt-8 text-[20px] text-muted-foreground touch-target-xxl">Cancel</button>
        )}
      </div>
    );
  }

  // Simplified
  if (mode === 'simplified') {
    return (
      <div className="h-full overflow-y-auto bg-background pb-6">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-[32px] font-bold text-foreground">Safety</h1>
        </div>
        <div className="px-5 space-y-4">
          <div className="ios-card-elevated p-5 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-success/8 flex items-center justify-center shrink-0">
              <Shield className="w-7 h-7 text-success" />
            </div>
            <div>
              <div className="text-[20px] font-bold text-foreground">You're Safe</div>
              <div className="text-[16px] text-muted-foreground">Everything looks good</div>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSOS}
            className={`w-full p-7 rounded-2xl flex items-center justify-center gap-4 touch-target-xxl ${
              isSOSActive ? 'bg-destructive/10 border-2 border-destructive' : 'bg-destructive sos-pulse'
            }`}
          >
            <Phone className={`w-8 h-8 ${isSOSActive ? 'text-destructive' : 'text-destructive-foreground'}`} />
            <span className={`text-[20px] font-bold ${isSOSActive ? 'text-destructive' : 'text-destructive-foreground'}`}>
              {isSOSActive ? 'Calling Sarah...' : sosCountdown !== null ? `Calling in ${sosCountdown}...` : 'Emergency SOS'}
            </span>
          </motion.button>
          {(isSOSActive || sosCountdown !== null) && (
            <button onClick={() => { cancelSOS(); setSosCountdown(null); }} className="w-full p-4 text-center text-[17px] text-muted-foreground touch-target-xl">Cancel Emergency</button>
          )}
        </div>
      </div>
    );
  }

  // Full mode
  return (
    <div className="h-full overflow-y-auto bg-background pb-6">
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-[24px] font-bold text-foreground">Safety</h1>
      </div>
      <div className="px-5 space-y-3.5">
        {/* Status */}
        <div className="bg-success/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-bold text-foreground">All Systems Normal</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">Last checked 2 min ago</div>
          </div>
          <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
        </div>

        {/* Location */}
        <div className="ios-card-elevated p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-[15px] font-bold text-foreground">Current Location</span>
          </div>
          <div className="h-28 rounded-2xl bg-primary/5 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-6 h-6 text-primary mx-auto mb-1" />
              <span className="text-[14px] text-foreground font-semibold">Home</span>
              <span className="block text-[11px] text-success font-semibold mt-0.5">Safe zone</span>
            </div>
          </div>
        </div>

        {/* Fall Detection */}
        <div className="bg-muted/40 rounded-2xl p-4">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-[15px] font-bold text-foreground flex-1">Fall Detection</span>
            <span className="px-2.5 py-1 rounded-full bg-success/10 text-success text-[11px] font-bold">Active</span>
          </div>
          <div className="text-[13px] text-muted-foreground mt-2">No incidents in the last 30 days</div>
        </div>

        {/* Emergency Contacts */}
        <div className="ios-card-elevated overflow-hidden">
          <div className="flex items-center gap-2.5 p-4 pb-2">
            <Phone className="w-4 h-4 text-primary" />
            <span className="text-[15px] font-bold text-foreground">Emergency Contacts</span>
          </div>
          {[
            { name: 'Sarah Johnson', role: 'Primary Caregiver', emoji: '👩' },
            { name: 'John Johnson', role: 'Son', emoji: '👨' },
            { name: 'Dr. Smith', role: 'Doctor', emoji: '👨‍⚕️' },
          ].map(contact => (
            <div key={contact.name} className="flex items-center gap-3 px-4 py-3 border-t border-border/30">
              <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
                <span className="text-[16px]">{contact.emoji}</span>
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-foreground">{contact.name}</div>
                <div className="text-[11px] text-muted-foreground">{contact.role}</div>
              </div>
              <button className="w-10 h-10 rounded-xl bg-success/8 flex items-center justify-center touch-target" aria-label={`Call ${contact.name}`}>
                <Phone className="w-4 h-4 text-success" />
              </button>
            </div>
          ))}
        </div>

        {/* SOS */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSOS}
          className="w-full p-4 rounded-2xl bg-destructive text-destructive-foreground flex items-center justify-center gap-3 sos-pulse touch-target"
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="text-[15px] font-bold">
            {isSOSActive ? 'Calling Sarah...' : sosCountdown !== null ? `Calling in ${sosCountdown}...` : 'Emergency SOS'}
          </span>
        </motion.button>
        {(isSOSActive || sosCountdown !== null) && (
          <button onClick={() => { cancelSOS(); setSosCountdown(null); }} className="w-full text-center text-[14px] text-muted-foreground py-3 touch-target">Cancel</button>
        )}
      </div>
    </div>
  );
}
