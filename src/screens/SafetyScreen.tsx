import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin, Phone, AlertTriangle, Activity, CheckCircle } from 'lucide-react';

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

  // Essential mode
  if (mode === 'essential') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 bg-background">
        <div className="text-center mb-12">
          <Shield className="w-20 h-20 text-success mx-auto mb-4" />
          <h1 className="text-[48px] font-bold text-foreground">You're Safe</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSOS}
          className="w-full h-32 rounded-3xl bg-destructive text-destructive-foreground flex flex-col items-center justify-center gap-2 sos-pulse"
        >
          <Phone className="w-12 h-12" />
          <span className="text-[28px] font-bold">{isSOSActive ? 'Calling...' : sosCountdown !== null ? `Calling in ${sosCountdown}...` : 'Emergency Call'}</span>
        </motion.button>
        {(isSOSActive || sosCountdown !== null) && (
          <button onClick={() => { cancelSOS(); setSosCountdown(null); }} className="mt-6 text-[20px] text-muted-foreground">
            Cancel
          </button>
        )}
      </div>
    );
  }

  // Simplified mode
  if (mode === 'simplified') {
    return (
      <div className="h-full overflow-y-auto bg-surface pb-4">
        <div className="px-5 pt-4 bg-background pb-4">
          <h1 className="text-[40px] font-bold text-foreground">Safety</h1>
        </div>
        <div className="px-5 mt-4 space-y-4">
          <div className="ios-card-elevated p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center">
              <Shield className="w-8 h-8 text-success" />
            </div>
            <div>
              <div className="text-[22px] font-bold text-foreground">You're Safe</div>
              <div className="text-[18px] text-muted-foreground">Everything looks good</div>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSOS}
            className={`w-full p-6 rounded-2xl flex items-center justify-center gap-4 ${
              isSOSActive ? 'bg-destructive/20 border-2 border-destructive' : 'bg-destructive'
            } ${!isSOSActive ? 'sos-pulse' : ''}`}
          >
            <Phone className={`w-8 h-8 ${isSOSActive ? 'text-destructive' : 'text-destructive-foreground'}`} />
            <span className={`text-[22px] font-bold ${isSOSActive ? 'text-destructive' : 'text-destructive-foreground'}`}>
              {isSOSActive ? 'Calling Sarah...' : sosCountdown !== null ? `Calling in ${sosCountdown}...` : 'Emergency SOS'}
            </span>
          </motion.button>
          {(isSOSActive || sosCountdown !== null) && (
            <button onClick={() => { cancelSOS(); setSosCountdown(null); }} className="w-full p-4 text-center text-[18px] text-muted-foreground">
              Cancel Emergency
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full mode
  return (
    <div className="h-full overflow-y-auto bg-surface pb-4">
      <div className="px-5 pt-3 pb-3 bg-background">
        <h1 className="text-ios-title text-foreground">Safety</h1>
      </div>
      <div className="px-5 mt-3 space-y-4">
        {/* Status */}
        <div className="ios-card-elevated p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-success" />
          </div>
          <div className="flex-1">
            <div className="text-ios-headline text-foreground">All Systems Normal</div>
            <div className="text-ios-footnote text-muted-foreground">Last checked 2 min ago</div>
          </div>
          <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
        </div>

        {/* Location */}
        <div className="ios-card-elevated p-4">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-ios-headline text-foreground">Current Location</span>
          </div>
          <div className="h-36 rounded-xl bg-gradient-to-br from-primary/10 to-sage/10 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-1" />
              <span className="text-ios-body text-foreground font-medium">Home</span>
              <span className="block text-ios-caption text-muted-foreground">Safe zone</span>
            </div>
          </div>
        </div>

        {/* Fall Detection */}
        <div className="ios-card-elevated p-4">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-ios-headline text-foreground">Fall Detection</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-success/15 text-success text-ios-caption font-medium">Active</span>
          </div>
          <div className="text-ios-subheadline text-muted-foreground">No incidents in the last 30 days</div>
        </div>

        {/* Emergency Contacts */}
        <div className="ios-card-elevated p-4">
          <div className="flex items-center gap-3 mb-3">
            <Phone className="w-5 h-5 text-primary" />
            <span className="text-ios-headline text-foreground">Emergency Contacts</span>
          </div>
          {[
            { name: 'Sarah Johnson', role: 'Primary Caregiver', emoji: '👩' },
            { name: 'John Johnson', role: 'Son', emoji: '👨' },
            { name: 'Dr. Smith', role: 'Doctor', emoji: '👨‍⚕️' },
          ].map(contact => (
            <div key={contact.name} className="flex items-center gap-3 py-3 border-t border-border first:border-0">
              <span className="text-2xl">{contact.emoji}</span>
              <div className="flex-1">
                <div className="text-ios-body text-foreground">{contact.name}</div>
                <div className="text-ios-caption text-muted-foreground">{contact.role}</div>
              </div>
              <button className="w-9 h-9 rounded-full bg-success/15 flex items-center justify-center">
                <Phone className="w-4 h-4 text-success" />
              </button>
            </div>
          ))}
        </div>

        {/* SOS Button */}
        <AnimatePresence>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSOS}
            className="w-full p-4 rounded-2xl bg-destructive text-destructive-foreground flex items-center justify-center gap-3 sos-pulse"
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="text-ios-headline">
              {isSOSActive ? 'Calling Sarah...' : sosCountdown !== null ? `Calling in ${sosCountdown}...` : 'Emergency SOS'}
            </span>
          </motion.button>
        </AnimatePresence>
        {(isSOSActive || sosCountdown !== null) && (
          <button onClick={() => { cancelSOS(); setSosCountdown(null); }} className="w-full text-center text-ios-body text-muted-foreground py-2">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
