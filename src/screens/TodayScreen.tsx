import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import ModeBadge from '@/components/layout/ModeBadge';
import PatientIDCard from '@/components/PatientIDCard';
import { motion } from 'framer-motion';
import { Pill, Check, Clock, Footprints, Moon, User, ChevronRight } from 'lucide-react';
import patientAvatar from '@/assets/patient-avatar.jpg';
import { useMedications, useMarkMedicationTaken, useActivities, useVitals } from '@/hooks/useCareData';

const medImages: Record<string, string> = {
  'Lisinopril': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop&q=80',
  'Metformin': 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200&h=200&fit=crop&q=80',
  'Aspirin': 'https://images.unsplash.com/photo-1626716493137-b67fe9501e76?w=200&h=200&fit=crop&q=80',
  'Donepezil': 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=200&h=200&fit=crop&q=80',
  'Memantine': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop&q=80'
};
const defaultMedImg = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop&q=80';

export default function TodayScreen() {
  const { mode, patientName, currentMood, toggleCaregiverView } = useApp();
  const { data: medications = [] } = useMedications();
  const { data: activities = [] } = useActivities();
  const { data: vitals = [] } = useVitals();
  const markTaken = useMarkMedicationTaken();
  const [showIDCard, setShowIDCard] = useState(false);

  const stepCount = Number(vitals.find((v) => v.type === 'steps')?.value || 0);
  const sleepHours = Number(vitals.find((v) => v.type === 'sleep')?.value || 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const markMedicationTaken = (id: string) => markTaken.mutate(id);
  const pendingMeds = medications.filter((m) => !m.taken);
  const takenMeds = medications.filter((m) => m.taken);

  // ── Essential Mode ──
  if (mode === 'essential') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 lavender-shimmer" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 w-full relative z-10">
          <div>
            <img src={patientAvatar} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-5 object-cover ring-4 ring-primary/20 shadow-lg" />
            <h1 className="text-[48px] font-extrabold text-foreground leading-none">{greeting()}</h1>
            <p className="text-[28px] text-primary mt-3 font-bold">{patientName || 'Friend'}</p>
          </div>

          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowIDCard(true)}
            className="w-full py-6 gradient-primary text-primary-foreground rounded-2xl flex items-center justify-center gap-4 shadow-lg">
            <User className="w-9 h-9" />
            <span className="text-[26px] font-extrabold">View Me</span>
          </motion.button>

          {pendingMeds.length > 0 ? (
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => markMedicationTaken(pendingMeds[0].id)}
              className="w-full py-10 gradient-rose text-secondary-foreground rounded-3xl flex flex-col items-center justify-center gap-4 shadow-xl">
              <img src={medImages[pendingMeds[0].name] || defaultMedImg} alt={pendingMeds[0].name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-secondary-foreground/20" onError={(e) => {(e.target as HTMLImageElement).src = defaultMedImg;}} />
              <span className="text-[30px] font-extrabold">Take Your Medicine</span>
              <span className="text-[22px] opacity-90 font-bold">{pendingMeds[0].name} {pendingMeds[0].dosage}</span>
            </motion.button>
          ) : (
            <div className="w-full py-10 bg-success/10 rounded-3xl flex flex-col items-center justify-center gap-4">
              <Check className="w-18 h-18 text-success" />
              <span className="text-[30px] font-extrabold text-success">All done for now</span>
            </div>
          )}

          <button className="w-full h-[80px] bg-destructive text-destructive-foreground text-[28px] font-extrabold rounded-2xl sos-pulse">
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
      <div className="h-full overflow-y-auto bg-background pb-6 relative">
        <div className="absolute inset-0 rose-glow" />
        <div className="relative z-10">
          <div className="px-5 pt-5 pb-4">
            <div className="ios-card-elevated p-5 flex items-center gap-5">
              <img src={patientAvatar} alt="Profile" className="w-20 h-20 rounded-2xl object-cover shrink-0 ring-2 ring-primary/20" />
              <div>
                <p className="text-[18px] text-muted-foreground font-semibold">{greeting()}</p>
                <h1 className="text-[34px] font-extrabold text-foreground leading-none">{patientName || 'Friend'}</h1>
              </div>
            </div>
          </div>

          <div className="px-5 space-y-4">
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowIDCard(true)}
              className="w-full p-6 flex items-center gap-5 text-left gradient-primary text-primary-foreground rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-primary-foreground/15 rounded-2xl flex items-center justify-center shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="text-[24px] font-extrabold">View Me</div>
                <div className="text-[17px] opacity-80 font-medium">My details & contacts</div>
              </div>
              <ChevronRight className="w-7 h-7 opacity-60 shrink-0" />
            </motion.button>

            {pendingMeds.map((med) => (
              <motion.button key={med.id} whileTap={{ scale: 0.97 }} onClick={() => markMedicationTaken(med.id)}
                className="w-full ios-card-elevated p-5 flex items-center gap-5 text-left touch-target-xl">
                <img src={medImages[med.name] || defaultMedImg} alt={med.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-border/30" onError={(e) => {(e.target as HTMLImageElement).src = defaultMedImg;}} />
                <div className="flex-1 min-w-0">
                  <div className="text-[22px] font-extrabold text-foreground">{med.name}</div>
                  <div className="text-[18px] text-muted-foreground mt-1 font-semibold">{med.dosage} · {med.time}</div>
                </div>
                <div className="px-6 py-3.5 gradient-primary text-primary-foreground rounded-xl text-[18px] font-extrabold shrink-0">Take</div>
              </motion.button>
            ))}

            {takenMeds.map((med) => (
              <div key={med.id} className="w-full ios-card-elevated p-5 flex items-center gap-5 opacity-50">
                <img src={medImages[med.name] || defaultMedImg} alt={med.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 grayscale" onError={(e) => {(e.target as HTMLImageElement).src = defaultMedImg;}} />
                <div className="flex-1">
                  <div className="text-[22px] font-bold text-foreground">{med.name}</div>
                  <div className="text-[18px] text-muted-foreground font-medium">Taken at {med.taken_at}</div>
                </div>
                <Check className="w-8 h-8 text-success shrink-0" />
              </div>
            ))}

            <div className="ios-card-elevated p-5 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-[38px]">{currentMood.emoji}</span>
              </div>
              <div>
                <div className="text-[22px] font-extrabold text-foreground">Feeling {currentMood.label}</div>
                <div className="text-[18px] text-muted-foreground font-medium">{currentMood.time}</div>
              </div>
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
      <div className="h-full overflow-y-auto bg-background pb-24 relative">
        <div className="absolute inset-0 warm-glow" />
        <div className="relative z-10">
          {/* Greeting */}
          <div className="px-5 pt-5 pb-4">
            <div className="ios-card-elevated p-5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img src={patientAvatar} alt="Profile" className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-2 ring-secondary/25 shadow-md" />
                <div>
                  <p className="text-[16px] text-muted-foreground font-bold">{greeting()}</p>
                  <h1 className="text-[28px] font-extrabold text-foreground leading-tight">{patientName || 'Friend'}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <ModeBadge />
                <button onClick={toggleCaregiverView} className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center touch-target" aria-label="Open caregiver view">
                  <span className="text-[18px]">👤</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Steps', value: stepCount.toLocaleString(), Icon: Footprints, color: 'text-sage', bg: 'bg-sage/10' },
                { label: 'Mood', value: currentMood.emoji, Icon: null, color: '', bg: 'bg-secondary/8' },
                { label: 'Sleep', value: `${sleepHours}h`, Icon: Moon, color: 'text-lavender', bg: 'bg-lavender/10' },
                { label: 'Meds', value: `${takenMeds.length}/${medications.length}`, Icon: Pill, color: 'text-primary', bg: 'bg-primary/10' },
              ].map((stat) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="ios-card-elevated p-4 flex flex-col items-center gap-2 py-5">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                    {stat.Icon ? <stat.Icon className={`w-6 h-6 ${stat.color}`} /> : <span className="text-[24px] leading-none">{stat.value}</span>}
                  </div>
                  {stat.Icon && <span className="text-[20px] font-extrabold text-foreground">{stat.value}</span>}
                  <span className="text-[12px] text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* View Me */}
          <div className="px-5 mt-5">
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowIDCard(true)}
              className="w-full p-5 flex items-center gap-4 gradient-primary text-primary-foreground rounded-2xl shadow-lg">
              <div className="w-14 h-14 bg-primary-foreground/15 rounded-2xl flex items-center justify-center shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[20px] font-extrabold">View Me</div>
                <div className="text-[15px] opacity-75 font-medium">My ID, contacts & details</div>
              </div>
              <ChevronRight className="w-6 h-6 opacity-60 shrink-0" />
            </motion.button>
          </div>

          {/* Medications */}
          <div className="px-5 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[22px] font-extrabold text-foreground">💊 Medications</h2>
              <button className="text-[16px] text-primary font-bold">See All</button>
            </div>
            <div className="space-y-3">
              {medications.map((med, i) => (
                <motion.div key={med.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="ios-card-elevated flex items-center gap-4 p-4">
                  <img src={medImages[med.name] || defaultMedImg} alt={med.name}
                    className={`w-16 h-16 rounded-xl object-cover shrink-0 border border-border/30 ${med.taken ? 'grayscale opacity-50' : ''}`}
                    onError={(e) => {(e.target as HTMLImageElement).src = defaultMedImg;}} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[18px] font-bold text-foreground">{med.name} <span className="text-muted-foreground font-semibold">{med.dosage}</span></div>
                    <div className="text-[15px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4" />
                      {med.taken ? `Taken at ${med.taken_at}` : med.time}
                    </div>
                  </div>
                  {med.taken ? (
                    <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center">
                      <Check className="w-6 h-6 text-success" />
                    </div>
                  ) : (
                    <button onClick={() => markMedicationTaken(med.id)}
                      className="px-6 h-12 gradient-primary text-primary-foreground rounded-xl text-[17px] font-extrabold active:scale-95 transition-transform touch-target">
                      Take
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="px-5 mt-6 mb-6">
            <h2 className="text-[22px] font-extrabold text-foreground mb-4">📋 Today's Activity</h2>
            <div className="ios-card-elevated p-5">
              {activities.map((item, i) => (
                <div key={item.id} className="flex items-start gap-4 py-3.5">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center text-[18px] rounded-xl ${item.completed ? 'bg-success/10' : 'bg-muted'}`} style={{ width: 52, height: 52 }}>
                      {item.icon}
                    </div>
                    {i < activities.length - 1 && <div className="w-px h-5 bg-border/40 mt-1.5" />}
                  </div>
                  <div className="flex-1 pt-1.5">
                    <div className={`text-[17px] font-semibold leading-snug ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>{item.description}</div>
                    <div className="text-[15px] text-muted-foreground mt-1 font-medium">{item.time}</div>
                  </div>
                  {item.completed && <Check className="w-6 h-6 text-success mt-3 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PatientIDCard open={showIDCard} onClose={() => setShowIDCard(false)} />
    </div>
  );
}
