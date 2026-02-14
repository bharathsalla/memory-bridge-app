import { useApp } from '@/contexts/AppContext';
import ModeBadge from '@/components/layout/ModeBadge';
import { motion } from 'framer-motion';
import { Pill, Mic, Check, Clock, Footprints, Moon } from 'lucide-react';
import patientAvatar from '@/assets/patient-avatar.jpg';
import { useMedications, useMarkMedicationTaken, useActivities, useVitals } from '@/hooks/useCareData';

export default function TodayScreen() {
  const { mode, patientName, currentMood, toggleCaregiverView } = useApp();
  const { data: medications = [] } = useMedications();
  const { data: activities = [] } = useActivities();
  const { data: vitals = [] } = useVitals();
  const markTaken = useMarkMedicationTaken();

  // Derive stats from vitals
  const stepCount = Number(vitals.find(v => v.type === 'steps')?.value || 0);
  const sleepHours = Number(vitals.find(v => v.type === 'sleep')?.value || 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const markMedicationTaken = (id: string) => markTaken.mutate(id);

  const pendingMeds = medications.filter(m => !m.taken);
  const takenMeds = medications.filter(m => m.taken);

  // Essential mode
  if (mode === 'essential') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 text-center bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 w-full">
          <div>
            <img src={patientAvatar} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover ring-3 ring-primary/20" />
            <h1 className="text-[44px] font-bold text-foreground leading-tight">{greeting()}</h1>
            <p className="text-[24px] text-muted-foreground mt-2">{patientName || 'Friend'}</p>
          </div>
          {pendingMeds.length > 0 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => markMedicationTaken(pendingMeds[0].id)}
              className="w-full py-10 rounded-3xl bg-primary text-primary-foreground flex flex-col items-center justify-center gap-4 ios-card-elevated"
            >
              <Pill className="w-14 h-14" />
              <span className="text-[26px] font-bold">Take Your Medicine</span>
              <span className="text-[20px] opacity-80">{pendingMeds[0].name} {pendingMeds[0].dosage}</span>
            </motion.button>
          ) : (
            <div className="w-full py-10 rounded-3xl ios-card-elevated flex flex-col items-center justify-center gap-3">
              <Check className="w-14 h-14 text-success" />
              <span className="text-[26px] font-semibold text-success">All done for now</span>
            </div>
          )}
          <button className="w-full h-[72px] rounded-2xl bg-destructive text-destructive-foreground text-[24px] font-bold sos-pulse">
            🆘 Emergency Call
          </button>
        </motion.div>
      </div>
    );
  }

  // Simplified mode
  if (mode === 'simplified') {
    return (
      <div className="h-full overflow-y-auto bg-background pb-6">
        <div className="px-6 pt-6 pb-4">
          <div className="ios-card-elevated p-5 flex items-center gap-4">
            <img src={patientAvatar} alt="Profile" className="w-16 h-16 rounded-full object-cover shrink-0 ring-2 ring-primary/20" />
            <div>
              <p className="text-[17px] text-muted-foreground">{greeting()}</p>
              <h1 className="text-[32px] font-bold text-foreground leading-tight">{patientName || 'Friend'}</h1>
            </div>
          </div>
        </div>
        <div className="px-5 space-y-4">
          {pendingMeds.map(med => (
            <motion.button
              key={med.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => markMedicationTaken(med.id)}
              className="w-full ios-card-elevated p-6 flex items-center gap-4 text-left touch-target-xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Pill className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[22px] font-bold text-foreground">{med.name}</div>
                <div className="text-[17px] text-muted-foreground mt-0.5">{med.dosage} · {med.time}</div>
              </div>
              <div className="px-5 py-3 rounded-xl bg-primary text-primary-foreground text-[16px] font-semibold shrink-0">
                Take
              </div>
            </motion.button>
          ))}
          {takenMeds.map(med => (
            <div key={med.id} className="w-full ios-card-elevated p-6 flex items-center gap-4 opacity-60">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center shrink-0">
                <Check className="w-8 h-8 text-success" />
              </div>
              <div className="flex-1">
                <div className="text-[22px] font-bold text-foreground">{med.name}</div>
                <div className="text-[17px] text-muted-foreground">Taken at {med.taken_at}</div>
              </div>
            </div>
          ))}
          <div className="ios-card-elevated p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-[32px]">{currentMood.emoji}</span>
            </div>
            <div>
              <div className="text-[22px] font-bold text-foreground">Feeling {currentMood.label}</div>
              <div className="text-[17px] text-muted-foreground">{currentMood.time}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full mode
  return (
    <div className="h-full relative">
      <div className="h-full overflow-y-auto bg-background pb-20">
        {/* Greeting Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="ios-card-elevated p-4 flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={patientAvatar}
                alt="Profile"
                className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-primary/20"
              />
              <div>
                <p className="text-[14px] text-muted-foreground font-medium">{greeting()}</p>
                <h1 className="text-[24px] font-bold text-foreground leading-tight">{patientName || 'Friend'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <ModeBadge />
              <button
                onClick={toggleCaregiverView}
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center touch-target"
                aria-label="Open caregiver view"
              >
                <span className="text-[16px]">👤</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-5">
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { label: 'Steps', value: stepCount.toLocaleString(), Icon: Footprints, iconColor: 'text-sage', bg: '' },
              { label: 'Mood', value: currentMood.emoji, Icon: null, iconColor: '', bg: '' },
              { label: 'Sleep', value: `${sleepHours}h`, Icon: Moon, iconColor: 'text-lavender', bg: '' },
              { label: 'Meds', value: `${takenMeds.length}/${medications.length}`, Icon: Pill, iconColor: 'text-primary', bg: '' },
            ].map(stat => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="ios-card-elevated rounded-2xl p-3.5 flex flex-col items-center gap-1.5"
              >
                {stat.Icon ? (
                  <stat.Icon className={`w-5 h-5 ${stat.iconColor} mb-0.5`} />
                ) : (
                  <span className="text-[22px] leading-none">{stat.value}</span>
                )}
                {stat.Icon && <span className="text-[17px] font-bold text-foreground">{stat.value}</span>}
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-bold text-foreground">Medications</h2>
            <button className="text-[15px] text-primary font-medium">See All</button>
          </div>
          <div className="space-y-3">
            {medications.map((med, i) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="ios-card-elevated flex items-center gap-3.5 p-4 rounded-2xl"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  med.taken ? 'bg-success/10' : 'bg-primary/10'
                }`}>
                  {med.taken ? <Check className="w-6 h-6 text-success" /> : <Pill className="w-6 h-6 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-semibold text-foreground">{med.name} {med.dosage}</div>
                  <div className="text-[13px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {med.taken ? `Taken at ${med.taken_at}` : med.time}
                  </div>
                </div>
                {!med.taken && (
                  <button
                    onClick={() => markMedicationTaken(med.id)}
                    className="px-5 h-10 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold active:scale-95 transition-transform touch-target"
                  >
                    Take
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="px-5 mt-7">
          <h2 className="text-[18px] font-bold text-foreground mb-3">Today's Activity</h2>
          <div className="ios-card-elevated p-4 rounded-2xl">
            <div className="space-y-1">
              {activities.map((item, i) => (
                <div key={item.id} className="flex items-start gap-3 py-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[15px] ${
                      item.completed ? 'bg-success/10' : 'bg-muted/80'
                    }`}>
                      {item.icon}
                    </div>
                    {i < activities.length - 1 && <div className="w-px h-5 bg-border/40 mt-1" />}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className={`text-[15px] font-medium leading-snug ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.description}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">{item.time}</div>
                  </div>
                  {item.completed && <Check className="w-5 h-5 text-success mt-2 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Voice FAB */}
      <button
        className="absolute bottom-5 right-5 w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform z-30 ios-card-elevated"
        aria-label="Voice input"
      >
        <Mic className="w-6 h-6" />
      </button>
    </div>
  );
}
