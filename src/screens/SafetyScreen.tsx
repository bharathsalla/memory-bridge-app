import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Shield, MapPin, Phone, AlertTriangle, Activity, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      <div className="h-full flex flex-col items-center justify-center px-8 ios-grouped-bg relative overflow-hidden">
        <div className="text-center mb-14 relative z-10">
          <div className="w-32 h-32 rounded-full gradient-success flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-16 h-16 text-success-foreground" />
          </div>
          <h1 className="text-ios-large-title text-foreground">You're Safe</h1>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSOS}
          className="w-full py-12 bg-destructive text-destructive-foreground rounded-2xl flex flex-col items-center justify-center gap-4 sos-pulse relative z-10 shadow-xl">
          <Phone className="w-14 h-14" />
          <span className="text-[28px] font-bold">
            {isSOSActive ? 'Calling...' : sosCountdown !== null ? `Calling in ${sosCountdown}...` : 'Emergency Call'}
          </span>
        </motion.button>
        {(isSOSActive || sosCountdown !== null) && (
          <button onClick={() => { cancelSOS(); setSosCountdown(null); }} className="mt-8 text-[22px] text-muted-foreground touch-target-xxl font-semibold relative z-10">Cancel</button>
        )}
      </div>
    );
  }

  if (mode === 'simplified') {
    return (
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6 relative">
        {/* Large title */}
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-ios-large-title text-foreground">Safety</h1>
          <p className="text-ios-subheadline text-muted-foreground mt-1">Everything looks good</p>
        </div>

        <div className="px-4 space-y-3">
          <div className="ios-card p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <Shield className="w-7 h-7 text-success" />
            </div>
            <div>
              <div className="text-ios-title2 text-foreground">You're Safe</div>
              <div className="text-ios-subheadline text-muted-foreground">All systems normal</div>
            </div>
          </div>

          <div className="ios-card overflow-hidden">
            <div className="flex items-center gap-3 p-4 pb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-ios-headline text-foreground">Current Location</span>
            </div>
            <div className="px-4 pb-4">
              <div className="rounded-xl overflow-hidden h-40">
                <iframe title="Location map" src="https://www.openstreetmap.org/export/embed.html?bbox=-0.1278%2C51.5074%2C-0.1178%2C51.5124&layer=mapnik&marker=51.5099%2C-0.1228" className="w-full h-full border-0" />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-ios-callout font-semibold text-foreground">Home</span>
                <Badge className="ml-auto bg-success/10 text-success border-0 text-ios-caption font-semibold">Safe zone</Badge>
              </div>
            </div>
          </div>

          <Button variant="destructive" size="lg" onClick={handleSOS}
            className={`w-full h-[72px] rounded-2xl text-[20px] font-bold gap-3 ${isSOSActive ? 'bg-destructive/10 border-2 border-destructive text-destructive' : 'sos-pulse'}`}>
            <Phone className="w-8 h-8" />
            {isSOSActive ? 'Calling Sarah...' : sosCountdown !== null ? `Calling in ${sosCountdown}...` : 'Emergency SOS'}
          </Button>
          {(isSOSActive || sosCountdown !== null) && (
            <Button variant="ghost" onClick={() => { cancelSOS(); setSosCountdown(null); }} className="w-full h-12 text-ios-callout text-muted-foreground font-semibold">
              Cancel Emergency
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto ios-grouped-bg pb-6 relative">
      {/* iOS Large Title */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-ios-large-title text-foreground">Safety</h1>
        <p className="text-ios-subheadline text-muted-foreground mt-1">All systems normal</p>
      </div>

      <div className="px-4 space-y-3">
        {/* Status Card */}
        <div className="ios-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1">
            <div className="text-ios-callout font-semibold text-foreground">All Systems Normal</div>
            <div className="text-ios-footnote text-muted-foreground mt-0.5">Last checked 2 min ago</div>
          </div>
          <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
        </div>

        {/* Location Card */}
        <div className="ios-card overflow-hidden">
          <div className="flex items-center gap-3 p-4 pb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-ios-headline text-foreground">Current Location</span>
          </div>
          <div className="px-4 pb-4">
            <div className="rounded-xl overflow-hidden h-36">
              <iframe title="Location map" src="https://www.openstreetmap.org/export/embed.html?bbox=-0.1278%2C51.5074%2C-0.1178%2C51.5124&layer=mapnik&marker=51.5099%2C-0.1228" className="w-full h-full border-0" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-ios-subheadline font-semibold text-foreground">Home</span>
              <span className="ml-auto text-ios-caption font-semibold text-success bg-success/8 px-2 py-0.5 rounded-full">Safe zone</span>
            </div>
          </div>
        </div>

        {/* Fall Detection */}
        <div className="ios-card p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-ios-callout font-semibold text-foreground flex-1">Fall Detection</span>
            <span className="text-ios-caption font-semibold text-success bg-success/8 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <div className="text-ios-footnote text-muted-foreground mt-2">No incidents in the last 30 days</div>
        </div>

        {/* Emergency Contacts */}
        <div className="ios-card overflow-hidden">
          <div className="flex items-center gap-3 p-4 pb-2">
            <Phone className="w-5 h-5 text-primary" />
            <span className="text-ios-headline text-foreground">Emergency Contacts</span>
          </div>
          {[
            { name: 'Sarah Johnson', role: 'Primary Caregiver', emoji: '👩' },
            { name: 'John Johnson', role: 'Son', emoji: '👨' },
            { name: 'Dr. Smith', role: 'Doctor', emoji: '👨‍⚕️' },
          ].map(contact => (
            <div key={contact.name} className="flex items-center gap-3 px-4 py-3 border-t border-border/30">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="text-[18px]">{contact.emoji}</span>
              </div>
              <div className="flex-1">
                <div className="text-ios-subheadline font-semibold text-foreground">{contact.name}</div>
                <div className="text-ios-footnote text-muted-foreground">{contact.role}</div>
              </div>
              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-success/8" aria-label={`Call ${contact.name}`}>
                <Phone className="w-4 h-4 text-success" />
              </Button>
            </div>
          ))}
        </div>

        {/* SOS Button */}
        <Button variant="destructive" size="lg" onClick={handleSOS}
          className="w-full h-[52px] rounded-xl text-ios-headline font-bold gap-3 sos-pulse">
          <AlertTriangle className="w-5 h-5" />
          {isSOSActive ? 'Calling Sarah...' : sosCountdown !== null ? `Calling in ${sosCountdown}...` : 'Emergency SOS'}
        </Button>
        {(isSOSActive || sosCountdown !== null) && (
          <Button variant="ghost" onClick={() => { cancelSOS(); setSosCountdown(null); }} className="w-full text-ios-subheadline text-muted-foreground font-semibold">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
