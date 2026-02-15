import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import ModeBadge from '@/components/layout/ModeBadge';
import PatientIDCard from '@/components/PatientIDCard';
import { motion } from 'framer-motion';
import { Pill, Mic, Check, Clock, Footprints, Moon, User, ChevronRight } from 'lucide-react';
import patientAvatar from '@/assets/patient-avatar.jpg';
import { useMedications, useMarkMedicationTaken, useActivities, useVitals } from '@/hooks/useCareData';

const medImages: Record<string, string> = {
  'Lisinopril': 'https://cdn-prod.medicalnewstoday.com/content/images/articles/327/327700/lisinopril-tablets.jpg',
  'Metformin': 'https://post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/02/322881_2200-732x549.jpg',
  'Aspirin': 'https://www.drugs.com/images/pills/fio/ABR07221.JPG',
  'Donepezil': 'https://www.drugs.com/images/pills/fio/GMK03970.JPG',
  'Memantine': 'https://www.drugs.com/images/pills/fio/FOR04780.JPG',
};
const defaultMedImg = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop&q=80';

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
      <div className="h-full flex flex-col items-center justify-center px-6 text-center bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 w-full">
          <div>
            <img src={patientAvatar} alt="Profile" className="w-28 h-28 rounded-[2rem] mx-auto mb-4 object-cover ring-4 ring-primary/20" />
            <h1 className="text-[46px] font-extrabold text-foreground leading-none">{greeting()}</h1>
            <p className="text-[26px] text-primary mt-2 font-bold">{patientName || 'Friend'}</p>
          </div>

          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowIDCard(true)}
            className="w-full py-5 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center gap-3">
            <User className="w-8 h-8" />
            <span className="text-[24px] font-extrabold">View Me</span>
          </motion.button>

          {pendingMeds.length > 0 ? (
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => markMedicationTaken(pendingMeds[0].id)}
              className="w-full py-8 rounded-3xl bg-accent text-accent-foreground flex flex-col items-center justify-center gap-3">
              <img src={medImages[pendingMeds[0].name] || defaultMedImg} alt={pendingMeds[0].name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-accent-foreground/20" onError={e => { (e.target as HTMLImageElement).src = defaultMedImg; }} />
              <span className="text-[28px] font-extrabold">Take Your Medicine</span>
              <span className="text-[20px] opacity-90 font-bold">{pendingMeds[0].name} {pendingMeds[0].dosage}</span>
            </motion.button>
          ) : (
            <div className="w-full py-8 rounded-3xl bg-success/10 flex flex-col items-center justify-center gap-3">
              <Check className="w-16 h-16 text-success" />
              <span className="text-[28px] font-extrabold text-success">All done for now</span>
            </div>
          )}

          <button className="w-full h-[72px] rounded-3xl bg-destructive text-destructive-foreground text-[26px] font-extrabold sos-pulse">
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
      <div className="h-full overflow-y-auto bg-background pb-4">
        <div className="px-5 pt-5 pb-3">
          <div className="ios-card-elevated p-5 flex items-center gap-4 rounded-2xl">
            <img src={patientAvatar} alt="Profile" className="w-[68px] h-[68px] rounded-2xl object-cover shrink-0 ring-2 ring-primary/20" />
            <div>
              <p className="text-[17px] text-muted-foreground font-semibold">{greeting()}</p>
              <h1 className="text-[32px] font-extrabold text-foreground leading-none">{patientName || 'Friend'}</h1>
            </div>
          </div>
        </div>

        <div className="px-5 space-y-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowIDCard(true)}
            className="w-full ios-card-elevated p-5 flex items-center gap-4 text-left rounded-2xl bg-primary text-primary-foreground">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/15 flex items-center justify-center shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="text-[22px] font-extrabold">View Me</div>
              <div className="text-[16px] opacity-80 font-medium">My details & contacts</div>
            </div>
            <ChevronRight className="w-6 h-6 opacity-60 shrink-0" />
          </motion.button>

          {pendingMeds.map(med => (
            <motion.button key={med.id} whileTap={{ scale: 0.97 }} onClick={() => markMedicationTaken(med.id)}
              className="w-full ios-card-elevated p-5 flex items-center gap-4 text-left touch-target-xl rounded-2xl">
              <img src={medImages[med.name] || defaultMedImg} alt={med.name}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-border/30" onError={e => { (e.target as HTMLImageElement).src = defaultMedImg; }} />
              <div className="flex-1 min-w-0">
                <div className="text-[22px] font-extrabold text-foreground">{med.name}</div>
                <div className="text-[17px] text-muted-foreground mt-0.5 font-semibold">{med.dosage} · {med.time}</div>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground text-[17px] font-extrabold shrink-0">Take</div>
            </motion.button>
          ))}

          {takenMeds.map(med => (
            <div key={med.id} className="w-full ios-card-elevated p-5 flex items-center gap-4 opacity-50 rounded-2xl">
              <img src={medImages[med.name] || defaultMedImg} alt={med.name}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 grayscale" onError={e => { (e.target as HTMLImageElement).src = defaultMedImg; }} />
              <div className="flex-1">
                <div className="text-[22px] font-bold text-foreground">{med.name}</div>
                <div className="text-[17px] text-muted-foreground font-medium">Taken at {med.taken_at}</div>
              </div>
              <Check className="w-7 h-7 text-success shrink-0" />
            </div>
          ))}

          <div className="ios-card-elevated p-5 flex items-center gap-4 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-[34px]">{currentMood.emoji}</span>
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
        {/* Greeting */}
        <div className="px-5 pt-5 pb-3">
          <div className="ios-card-elevated p-4 flex items-start justify-between rounded-2xl">
            <div className="flex items-center gap-3.5">
              <img src={patientAvatar} alt="Profile" className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-2 ring-primary/20" />
              <div>
                <p className="text-[14px] text-muted-foreground font-bold">{greeting()}</p>
                <h1 className="text-[26px] font-extrabold text-foreground leading-tight">{patientName || 'Friend'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <ModeBadge />
              <button onClick={toggleCaregiverView} className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center touch-target" aria-label="Open caregiver view">
                <span className="text-[16px]">👤</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-5">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Steps', value: stepCount.toLocaleString(), Icon: Footprints, color: 'text-sage', bg: 'bg-sage/10' },
              { label: 'Mood', value: currentMood.emoji, Icon: null, color: '', bg: 'bg-accent/10' },
              { label: 'Sleep', value: `${sleepHours}h`, Icon: Moon, color: 'text-lavender', bg: 'bg-lavender/10' },
              { label: 'Meds', value: `${takenMeds.length}/${medications.length}`, Icon: Pill, color: 'text-primary', bg: 'bg-primary/10' },
            ].map(stat => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="ios-card-elevated rounded-2xl p-3 flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  {stat.Icon ? <stat.Icon className={`w-5 h-5 ${stat.color}`} /> : <span className="text-[20px] leading-none">{stat.value}</span>}
                </div>
                {stat.Icon && <span className="text-[17px] font-extrabold text-foreground">{stat.value}</span>}
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View Me */}
        <div className="px-5 mt-4">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowIDCard(true)}
            className="w-full p-4 flex items-center gap-3.5 rounded-2xl bg-primary text-primary-foreground">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/15 flex items-center justify-center shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-[17px] font-extrabold">View Me</div>
              <div className="text-[13px] opacity-75 font-medium">My ID, contacts & details</div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-60 shrink-0" />
          </motion.button>
        </div>

        {/* Medications */}
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[20px] font-extrabold text-foreground">💊 Medications</h2>
            <button className="text-[14px] text-primary font-bold">See All</button>
          </div>
          <div className="space-y-2.5">
            {medications.map((med, i) => (
              <motion.div key={med.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="ios-card-elevated flex items-center gap-3.5 p-3.5 rounded-2xl">
                <img src={medImages[med.name] || defaultMedImg} alt={med.name}
                  className={`w-14 h-14 rounded-xl object-cover shrink-0 border border-border/30 ${med.taken ? 'grayscale opacity-50' : ''}`}
                  onError={e => { (e.target as HTMLImageElement).src = defaultMedImg; }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-bold text-foreground">{med.name} <span className="text-muted-foreground font-semibold">{med.dosage}</span></div>
                  <div className="text-[13px] text-muted-foreground mt-0.5 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {med.taken ? `Taken at ${med.taken_at}` : med.time}
                  </div>
                </div>
                {med.taken ? (
                  <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
                    <Check className="w-5 h-5 text-success" />
                  </div>
                ) : (
                  <button onClick={() => markMedicationTaken(med.id)}
                    className="px-5 h-11 rounded-xl bg-primary text-primary-foreground text-[15px] font-extrabold active:scale-95 transition-transform touch-target">
                    Take
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="px-5 mt-6 mb-4">
          <h2 className="text-[20px] font-extrabold text-foreground mb-3">📋 Today's Activity</h2>
          <div className="ios-card-elevated p-4 rounded-2xl">
            {activities.map((item, i) => (
              <div key={item.id} className="flex items-start gap-3 py-3">
                <div className="flex flex-col items-center">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[16px] ${item.completed ? 'bg-success/10' : 'bg-muted'}`}>
                    {item.icon}
                  </div>
                  {i < activities.length - 1 && <div className="w-px h-5 bg-border/40 mt-1" />}
                </div>
                <div className="flex-1 pt-1">
                  <div className={`text-[15px] font-semibold leading-snug ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>{item.description}</div>
                  <div className="text-[13px] text-muted-foreground mt-0.5 font-medium">{item.time}</div>
                </div>
                {item.completed && <Check className="w-5 h-5 text-success mt-2 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="absolute bottom-5 right-5 w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform z-30 ios-card-elevated" aria-label="Voice input">
        <Mic className="w-6 h-6" />
      </button>
      <PatientIDCard open={showIDCard} onClose={() => setShowIDCard(false)} />
    </div>
  );
}
