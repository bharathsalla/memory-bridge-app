import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import ModeBadge from '@/components/layout/ModeBadge';
import PatientIDCard from '@/components/PatientIDCard';
import { motion } from 'framer-motion';
import { Pill, Mic, Check, Clock, Footprints, Moon, User, ChevronRight } from 'lucide-react';
import patientAvatar from '@/assets/patient-avatar.jpg';
import { useMedications, useMarkMedicationTaken, useActivities, useVitals } from '@/hooks/useCareData';

// Medication image mapping — real pill/tablet style icons
const medImages: Record<string, string> = {
  'Lisinopril': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&h=120&fit=crop&q=80',
  'Metformin': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=120&h=120&fit=crop&q=80',
  'Aspirin': 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=120&h=120&fit=crop&q=80',
};
const defaultMedImg = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=120&h=120&fit=crop&q=80';

export default function TodayScreen() {
  const { mode, patientName, currentMood, toggleCaregiverView } = useApp();
  const { data: medications = [] } = useMedications();
  const { data: activities = [] } = useActivities();
  const { data: vitals = [] } = useVitals();
  const markTaken = useMarkMedicationTaken();
  const [showIDCard, setShowIDCard] = useState(false);

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

  // ── Essential Mode ──
  if (mode === 'essential') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 text-center bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 w-full">
          <div>
            <img src={patientAvatar} alt="Profile" className="w-28 h-28 rounded-full mx-auto mb-5 object-cover ring-4 ring-primary/20" />
            <h1 className="text-[48px] font-extrabold text-foreground leading-tight">{greeting()}</h1>
            <p className="text-[28px] text-muted-foreground mt-2 font-semibold">{patientName || 'Friend'}</p>
          </div>

          {/* View Me Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowIDCard(true)}
            className="w-full py-5 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center gap-3 ios-card-elevated"
          >
            <User className="w-7 h-7" />
            <span className="text-[24px] font-extrabold">View Me</span>
          </motion.button>

          {pendingMeds.length > 0 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => markMedicationTaken(pendingMeds[0].id)}
              className="w-full py-10 rounded-3xl bg-accent text-accent-foreground flex flex-col items-center justify-center gap-4 ios-card-elevated"
            >
              <img src={medImages[pendingMeds[0].name] || defaultMedImg} alt={pendingMeds[0].name} className="w-16 h-16 rounded-2xl object-cover" />
              <span className="text-[28px] font-extrabold">Take Your Medicine</span>
              <span className="text-[22px] opacity-80 font-semibold">{pendingMeds[0].name} {pendingMeds[0].dosage}</span>
            </motion.button>
          ) : (
            <div className="w-full py-10 rounded-3xl ios-card-elevated flex flex-col items-center justify-center gap-3">
              <Check className="w-16 h-16 text-success" />
              <span className="text-[28px] font-bold text-success">All done for now</span>
            </div>
          )}
          <button className="w-full h-[76px] rounded-2xl bg-destructive text-destructive-foreground text-[26px] font-extrabold sos-pulse">
            🆘 Emergency Call
          </button>
        </motion.div>
        <PatientIDCard open={showIDCard} onClose={() => setShowIDCard(false)} />
      </div>
    );
  }

  // ── Simplified Mode ──
  if (mode === 'simplified') {
    return (
      <div className="h-full overflow-y-auto bg-background pb-6">
        <div className="px-6 pt-6 pb-4">
          <div className="ios-card-elevated p-5 flex items-center gap-4">
            <img src={patientAvatar} alt="Profile" className="w-18 h-18 rounded-full object-cover shrink-0 ring-3 ring-primary/20" style={{ width: 72, height: 72 }} />
            <div>
              <p className="text-[18px] text-muted-foreground font-medium">{greeting()}</p>
              <h1 className="text-[34px] font-extrabold text-foreground leading-tight">{patientName || 'Friend'}</h1>
            </div>
          </div>
        </div>

        <div className="px-5 space-y-4">
          {/* View Me */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowIDCard(true)}
            className="w-full ios-card-elevated p-5 flex items-center gap-4 text-left touch-target-xl bg-primary/5 border-2 border-primary/20 rounded-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[22px] font-extrabold text-primary">View Me</div>
              <div className="text-[16px] text-muted-foreground mt-0.5">My details & emergency contacts</div>
            </div>
            <ChevronRight className="w-6 h-6 text-primary shrink-0" />
          </motion.button>

          {pendingMeds.map(med => (
            <motion.button
              key={med.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => markMedicationTaken(med.id)}
              className="w-full ios-card-elevated p-6 flex items-center gap-4 text-left touch-target-xl"
            >
              <img src={medImages[med.name] || defaultMedImg} alt={med.name} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[22px] font-extrabold text-foreground">{med.name}</div>
                <div className="text-[17px] text-muted-foreground mt-0.5 font-medium">{med.dosage} · {med.time}</div>
              </div>
              <div className="px-5 py-3 rounded-xl bg-primary text-primary-foreground text-[17px] font-bold shrink-0">
                Take
              </div>
            </motion.button>
          ))}
          {takenMeds.map(med => (
            <div key={med.id} className="w-full ios-card-elevated p-6 flex items-center gap-4 opacity-60">
              <img src={medImages[med.name] || defaultMedImg} alt={med.name} className="w-16 h-16 rounded-2xl object-cover shrink-0 grayscale" />
              <div className="flex-1">
                <div className="text-[22px] font-bold text-foreground">{med.name}</div>
                <div className="text-[17px] text-muted-foreground font-medium">Taken at {med.taken_at}</div>
              </div>
              <Check className="w-7 h-7 text-success shrink-0" />
            </div>
          ))}
          <div className="ios-card-elevated p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-[36px]">{currentMood.emoji}</span>
            </div>
            <div>
              <div className="text-[22px] font-extrabold text-foreground">Feeling {currentMood.label}</div>
              <div className="text-[17px] text-muted-foreground font-medium">{currentMood.time}</div>
            </div>
          </div>
        </div>
        <PatientIDCard open={showIDCard} onClose={() => setShowIDCard(false)} />
      </div>
    );
  }

  // ── Full Mode ──
  return (
    <div className="h-full relative">
      <div className="h-full overflow-y-auto bg-background pb-20">
        {/* Greeting Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="ios-card-elevated p-4 flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <img src={patientAvatar} alt="Profile" className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-primary/20" />
              <div>
                <p className="text-[15px] text-muted-foreground font-semibold">{greeting()}</p>
                <h1 className="text-[26px] font-extrabold text-foreground leading-tight">{patientName || 'Friend'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <ModeBadge />
              <button onClick={toggleCaregiverView} className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center touch-target" aria-label="Open caregiver view">
                <span className="text-[16px]">👤</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-5">
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { label: 'Steps', value: stepCount.toLocaleString(), Icon: Footprints, iconColor: 'text-sage' },
              { label: 'Mood', value: currentMood.emoji, Icon: null, iconColor: '' },
              { label: 'Sleep', value: `${sleepHours}h`, Icon: Moon, iconColor: 'text-lavender' },
              { label: 'Meds', value: `${takenMeds.length}/${medications.length}`, Icon: Pill, iconColor: 'text-primary' },
            ].map(stat => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ios-card-elevated rounded-2xl p-3.5 flex flex-col items-center gap-1.5">
                {stat.Icon ? <stat.Icon className={`w-5 h-5 ${stat.iconColor} mb-0.5`} /> : <span className="text-[24px] leading-none">{stat.value}</span>}
                {stat.Icon && <span className="text-[18px] font-bold text-foreground">{stat.value}</span>}
                <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View Me Button */}
        <div className="px-5 mt-5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowIDCard(true)}
            className="w-full ios-card-elevated p-4 flex items-center gap-3.5 rounded-2xl bg-primary/5 border-2 border-primary/20"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-[17px] font-extrabold text-primary">View Me</div>
              <div className="text-[13px] text-muted-foreground font-medium">My ID, contacts & details</div>
            </div>
            <ChevronRight className="w-5 h-5 text-primary shrink-0" />
          </motion.button>
        </div>

        {/* Medications */}
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[20px] font-extrabold text-foreground">Medications</h2>
            <button className="text-[15px] text-primary font-bold">See All</button>
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
                <img
                  src={medImages[med.name] || defaultMedImg}
                  alt={med.name}
                  className={`w-14 h-14 rounded-xl object-cover shrink-0 ${med.taken ? 'grayscale opacity-60' : ''}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[17px] font-bold text-foreground">{med.name} {med.dosage}</div>
                  <div className="text-[14px] text-muted-foreground mt-0.5 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {med.taken ? `Taken at ${med.taken_at}` : med.time}
                  </div>
                </div>
                {med.taken ? (
                  <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
                    <Check className="w-5 h-5 text-success" />
                  </div>
                ) : (
                  <button
                    onClick={() => markMedicationTaken(med.id)}
                    className="px-5 h-11 rounded-xl bg-primary text-primary-foreground text-[15px] font-bold active:scale-95 transition-transform touch-target"
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
          <h2 className="text-[20px] font-extrabold text-foreground mb-3">Today's Activity</h2>
          <div className="ios-card-elevated p-4 rounded-2xl">
            <div className="space-y-1">
              {activities.map((item, i) => (
                <div key={item.id} className="flex items-start gap-3 py-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[16px] ${item.completed ? 'bg-success/10' : 'bg-muted/80'}`}>
                      {item.icon}
                    </div>
                    {i < activities.length - 1 && <div className="w-px h-5 bg-border/40 mt-1" />}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className={`text-[16px] font-semibold leading-snug ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.description}
                    </div>
                    <div className="text-[13px] text-muted-foreground mt-0.5 font-medium">{item.time}</div>
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

      <PatientIDCard open={showIDCard} onClose={() => setShowIDCard(false)} />
    </div>
  );
}
