import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Shield, MapPin, Phone, Check, ChevronRight, User } from 'lucide-react';
import IconBox, { iosColors } from '@/components/ui/IconBox';
import LiveMap from '@/components/ui/LiveMap';

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

  if (mode === 'essential') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 ios-grouped-bg relative overflow-hidden">
        <div className="text-center mb-14 relative z-10">
          <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Shield className="w-16 h-16 text-muted-foreground" />
          </div>
          <h1 className="text-ios-large-title text-foreground">You're Safe</h1>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSOS}
          className="w-full py-12 bg-destructive text-destructive-foreground rounded-2xl flex flex-col items-center justify-center gap-4 relative z-10">
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
        <div className="px-4 pt-4 pb-1">
          <h1 className="text-ios-large-title text-foreground">Safety</h1>
          <p className="text-ios-subheadline text-muted-foreground mt-1">Everything looks good</p>
        </div>

        <div className="px-4 mt-3 space-y-3">
          <div className="ios-card overflow-hidden">
            <div className="flex items-center gap-3 px-4" style={{ minHeight: 56 }}>
              <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <div className="text-ios-callout font-medium text-foreground">You're Safe</div>
                <div className="text-ios-footnote text-muted-foreground">All systems normal</div>
              </div>
              <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            </div>
          </div>

          <div className="ios-card overflow-hidden">
            <div className="flex items-center gap-3 px-4" style={{ minHeight: 44 }}>
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <span className="text-ios-callout font-medium text-foreground">Current Location</span>
            </div>
            <div className="px-4 pb-4">
              <div className="rounded-xl overflow-hidden h-36">
                <LiveMap height={144} />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-ios-subheadline font-semibold text-foreground">Home</span>
                <span className="ml-auto text-ios-caption font-semibold text-muted-foreground">Safe zone</span>
              </div>
            </div>
          </div>

          <button onClick={handleSOS}
            className={`w-full h-[72px] rounded-2xl text-[20px] font-bold flex items-center justify-center gap-3 ${isSOSActive ? 'bg-destructive/10 border-2 border-destructive text-destructive' : 'bg-destructive text-destructive-foreground'}`}>
            <Phone className="w-8 h-8" />
            {isSOSActive ? 'Calling Sarah...' : sosCountdown !== null ? `Calling in ${sosCountdown}...` : 'Emergency SOS'}
          </button>
          {(isSOSActive || sosCountdown !== null) && (
            <button onClick={() => { cancelSOS(); setSosCountdown(null); }} className="w-full h-12 text-ios-callout text-muted-foreground font-semibold">
              Cancel Emergency
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto ios-grouped-bg pb-6 relative">
      <div className="px-4 pt-4 pb-1">
        <h1 className="text-ios-large-title text-foreground">Safety</h1>
        <p className="text-ios-subheadline text-muted-foreground mt-1">All systems normal</p>
      </div>

      <div className="mt-3">
        <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Status</p>
        <div className="mx-4 ios-card overflow-hidden">
          <div className="flex items-center gap-3 px-4" style={{ minHeight: 56 }}>
            <IconBox Icon={Check} color={iosColors.green} />
            <div className="flex-1">
              <div className="text-ios-callout font-medium text-foreground">All Systems Normal</div>
              <div className="text-ios-footnote text-muted-foreground">Last checked 2 min ago</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Location</p>
        <div className="mx-4 ios-card overflow-hidden">
          <div className="px-4 pt-3 pb-4">
            <div className="rounded-xl overflow-hidden h-40">
              <LiveMap height={160} />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <span className="text-ios-subheadline font-semibold text-foreground">Home</span>
              <span className="ml-auto text-ios-caption font-semibold text-muted-foreground">Safe zone</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Emergency Contacts</p>
        <div className="mx-4 ios-card overflow-hidden divide-y divide-border/30">
          {[
            { name: 'Sarah Johnson', role: 'Primary Caregiver' },
            { name: 'John Johnson', role: 'Son' },
            { name: 'Dr. Smith', role: 'Doctor' },
          ].map(contact => (
            <div key={contact.name} className="flex items-center gap-3 px-4" style={{ minHeight: 60 }}>
              <IconBox Icon={User} color={['#007AFF','#34C759','#AF52DE'][['Sarah Johnson','John Johnson','Dr. Smith'].indexOf(contact.name)] || iosColors.blue} />
              <div className="flex-1">
                <div className="text-ios-callout font-medium text-foreground">{contact.name}</div>
                <div className="text-ios-footnote text-muted-foreground">{contact.role}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-5">
        <button onClick={handleSOS}
          className="w-full h-[52px] rounded-xl bg-destructive text-destructive-foreground text-ios-headline font-bold flex items-center justify-center gap-3">
          <Phone className="w-5 h-5" />
          {isSOSActive ? 'Calling Sarah...' : sosCountdown !== null ? `Calling in ${sosCountdown}...` : 'Emergency SOS'}
        </button>
        {(isSOSActive || sosCountdown !== null) && (
          <button onClick={() => { cancelSOS(); setSosCountdown(null); }} className="w-full text-ios-subheadline text-muted-foreground font-semibold mt-2">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
