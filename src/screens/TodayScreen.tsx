import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import ModeBadge from '@/components/layout/ModeBadge';
import PatientIDCard from '@/components/PatientIDCard';
import { motion } from 'framer-motion';
import { Pill, Check, Clock, Footprints, Moon, User, ChevronRight, Heart, Activity } from 'lucide-react';
import patientAvatar from '@/assets/patient-avatar.jpg';
import { useMedications, useMarkMedicationTaken, useActivities, useVitals } from '@/hooks/useCareData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
  const medProgress = medications.length ? Math.round((takenMeds.length / medications.length) * 100) : 0;
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // ── Essential Mode ──
  if (mode === 'essential') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center ios-grouped-bg relative overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 w-full relative z-10">
          <div>
            <img src={patientAvatar} alt="Profile" className="w-32 h-32 mx-auto mb-5 object-cover ring-4 ring-primary/20 shadow-lg rounded-[28px]" />
            <h1 className="text-ios-large-title text-foreground">{greeting()}</h1>
            <p className="text-[28px] text-primary mt-3 font-bold">{patientName || 'Friend'}</p>
          </div>

          <Button onClick={() => setShowIDCard(true)} size="lg" className="w-full h-16 text-[22px] font-bold gap-3 rounded-2xl">
            <User className="w-8 h-8" />
            View Me
          </Button>

          {pendingMeds.length > 0 ? (
            <div className="ios-card p-8 flex flex-col items-center gap-4">
              <Pill className="w-16 h-16 text-primary" />
              <h2 className="text-[28px] font-bold text-foreground">Take Your Medicine</h2>
              <p className="text-[20px] text-muted-foreground font-medium">{pendingMeds[0].name} {pendingMeds[0].dosage}</p>
              <Button onClick={() => markMedicationTaken(pendingMeds[0].id)} size="lg" className="w-full h-16 text-[20px] font-bold rounded-2xl">
                Mark as Taken
              </Button>
            </div>
          ) : (
            <div className="ios-card p-8 flex flex-col items-center gap-3">
              <Check className="w-16 h-16 text-success" />
              <span className="text-[28px] font-bold text-success">All done for now</span>
            </div>
          )}

          <Button variant="destructive" size="lg" className="w-full h-[72px] text-[26px] font-bold sos-pulse rounded-2xl">
            Emergency Call
          </Button>
        </motion.div>
        <PatientIDCard open={showIDCard} onClose={() => setShowIDCard(false)} />
      </div>
    );
  }

  // ── Simplified Mode ──
  if (mode === 'simplified') {
    return (
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6 relative">
        <div className="relative z-10">
          {/* Large title header */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-3 mb-3">
              <img src={patientAvatar} alt="Profile" className="w-14 h-14 object-cover shrink-0 rounded-2xl" />
              <div>
                <p className="text-ios-subheadline text-muted-foreground font-medium">{greeting()}</p>
                <h1 className="text-ios-title1 text-foreground">{patientName || 'Friend'}</h1>
              </div>
            </div>
          </div>

          <div className="px-4 space-y-3">
            <Button onClick={() => setShowIDCard(true)} size="lg" className="w-full h-14 text-[18px] font-semibold gap-3 rounded-xl">
              <User className="w-6 h-6" />
              View Me
            </Button>

            {pendingMeds.map((med) => (
              <div key={med.id} className="ios-card">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                    <Pill className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ios-headline text-foreground">{med.name}</p>
                    <p className="text-ios-subheadline text-muted-foreground mt-0.5">{med.dosage} · {med.time}</p>
                  </div>
                  <Button onClick={() => markMedicationTaken(med.id)} className="h-11 px-5 text-[15px] font-semibold shrink-0 rounded-xl">
                    Take
                  </Button>
                </div>
              </div>
            ))}

            {takenMeds.map((med) => (
              <div key={med.id} className="ios-card opacity-50">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                    <Check className="w-6 h-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-ios-headline text-foreground">{med.name}</p>
                    <p className="text-ios-footnote text-muted-foreground">Taken at {med.taken_at}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <PatientIDCard open={showIDCard} onClose={() => setShowIDCard(false)} />
      </div>
    );
  }

  // ── Full Mode — Apple Health Style ──
  return (
    <div className="h-full relative">
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6 relative">
        <div className="relative z-10">
          {/* Large Navigation Title — Apple HIG */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-ios-footnote text-muted-foreground font-medium">{dateStr}</p>
              <div className="flex items-center gap-2">
                <ModeBadge />
                <button onClick={toggleCaregiverView} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center touch-target" aria-label="Open caregiver view">
                  <User className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <img src={patientAvatar} alt="Profile" className="w-12 h-12 object-cover shrink-0 rounded-full ring-2 ring-primary/15" />
              <div>
                <h1 className="text-ios-large-title text-foreground">{greeting()}</h1>
              </div>
            </div>
          </div>

          {/* Health Summary — Apple Health card grid */}
          <div className="px-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Steps', value: stepCount.toLocaleString(), Icon: Footprints, color: 'text-primary', bg: 'bg-primary/8', sub: 'Goal: 5,000' },
                { label: 'Mood', value: currentMood.label, Icon: Heart, color: 'text-accent', bg: 'bg-accent/8', emoji: currentMood.emoji },
                { label: 'Sleep', value: `${sleepHours} hrs`, Icon: Moon, color: 'text-secondary', bg: 'bg-secondary/8', sub: 'Last night' },
                { label: 'Meds', value: `${takenMeds.length}/${medications.length}`, Icon: Pill, color: 'text-primary', bg: 'bg-primary/8', sub: `${medProgress}% done` },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="ios-card p-4"
                >
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                    {stat.emoji ? (
                      <span className="text-[16px]">{stat.emoji}</span>
                    ) : (
                      <stat.Icon className={`w-4 h-4 ${stat.color}`} />
                    )}
                  </div>
                  <p className="text-ios-caption text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                  <p className="text-[22px] font-bold text-foreground leading-none mt-1">{stat.value}</p>
                  {stat.sub && <p className="text-ios-caption2 text-muted-foreground mt-1">{stat.sub}</p>}
                </motion.div>
              ))}
            </div>
          </div>

          {/* My ID Card */}
          <div className="px-4 mt-4">
            <button
              onClick={() => setShowIDCard(true)}
              className="w-full ios-card p-4 flex items-center gap-3 text-left active:bg-muted/30 transition-colors touch-target"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-ios-callout font-semibold text-foreground">My ID & Emergency Contacts</p>
                <p className="text-ios-footnote text-muted-foreground">Tap to view</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
            </button>
          </div>

          {/* Medications — Apple Health list style */}
          <div className="mt-6">
            <div className="px-4 flex items-center justify-between mb-2">
              <h2 className="text-ios-title3 text-foreground">Medications</h2>
              <span className="text-ios-footnote text-muted-foreground font-medium">{takenMeds.length}/{medications.length} taken</span>
            </div>
            <div className="px-4 mb-3">
              <Progress value={medProgress} className="h-1.5 rounded-full" />
            </div>

            {pendingMeds.length > 0 && (
              <div className="px-4 space-y-2 mb-3">
                {pendingMeds.map((med, i) => (
                  <motion.div key={med.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <div className="ios-card">
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                            <Pill className="w-5 h-5 text-warning" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-ios-callout font-semibold text-foreground">{med.name}</p>
                            <p className="text-ios-footnote text-muted-foreground mt-0.5">{med.dosage}</p>
                          </div>
                          <p className="text-ios-caption text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {med.time}
                          </p>
                        </div>
                        {med.instructions && (
                          <p className="text-ios-caption text-muted-foreground/60">{med.instructions}</p>
                        )}
                        <Button
                          onClick={() => markMedicationTaken(med.id)}
                          className="w-full h-11 rounded-xl text-[15px] font-semibold gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Mark as Taken
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {takenMeds.length > 0 && (
              <div className="px-4">
                <div className="ios-card overflow-hidden divide-y divide-border/40">
                  {takenMeds.map((med) => (
                    <div key={med.id} className="flex items-center gap-3 p-3">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ios-subheadline text-muted-foreground line-through">{med.name} · {med.dosage}</p>
                        <p className="text-ios-caption2 text-success mt-0.5">Taken at {med.taken_at}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {medications.length === 0 && (
              <div className="px-4">
                <div className="ios-card p-8 flex flex-col items-center gap-3">
                  <Pill className="w-10 h-10 text-muted-foreground/20" />
                  <p className="text-ios-subheadline text-muted-foreground">No medications scheduled</p>
                </div>
              </div>
            )}
          </div>

          {/* Today's Activity */}
          <div className="mt-6 mb-8">
            <div className="px-4 mb-2">
              <h2 className="text-ios-title3 text-foreground">Today's Activity</h2>
            </div>
            <div className="px-4">
              <div className="ios-card overflow-hidden divide-y divide-border/40">
                {activities.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <div className="flex items-center gap-3 p-3.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[18px] ${
                        item.completed ? 'bg-success/10' : 'bg-muted/40'
                      }`}>
                        {item.completed ? <Check className="w-4 h-4 text-success" /> : <span>{item.icon}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ios-subheadline font-medium text-foreground">{item.description}</p>
                        <p className="text-ios-caption2 text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.time}
                        </p>
                      </div>
                      {item.completed && (
                        <span className="text-ios-caption2 font-medium text-success bg-success/8 px-2 py-0.5 rounded-full">Done</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PatientIDCard open={showIDCard} onClose={() => setShowIDCard(false)} />
    </div>
  );
}
