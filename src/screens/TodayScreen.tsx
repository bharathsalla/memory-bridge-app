import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import ModeBadge from '@/components/layout/ModeBadge';
import PatientIDCard from '@/components/PatientIDCard';
import { motion } from 'framer-motion';
import { Pill, Check, Clock, Footprints, Moon, User, ChevronRight, Heart, Droplets, Activity } from 'lucide-react';
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
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // ── Essential Mode ──
  if (mode === 'essential') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center bg-background relative overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 w-full relative z-10">
          <div>
            <img src={patientAvatar} alt="Profile" className="w-32 h-32 mx-auto mb-5 object-cover ring-4 ring-primary/20 shadow-lg rounded-[28px]" />
            <h1 className="text-[48px] font-extrabold text-foreground leading-none">{greeting()}</h1>
            <p className="text-[28px] text-primary mt-3 font-bold">{patientName || 'Friend'}</p>
          </div>

          <Button onClick={() => setShowIDCard(true)} size="lg" className="w-full h-16 text-[22px] font-bold gap-3 rounded-2xl">
            <User className="w-8 h-8" />
            View Me
          </Button>

          {pendingMeds.length > 0 ? (
            <div className="rounded-2xl border border-primary/20 shadow-lg overflow-hidden bg-card p-8 flex flex-col items-center gap-4">
              <Pill className="w-16 h-16 text-primary" />
              <h2 className="text-[28px] font-extrabold text-foreground">Take Your Medicine</h2>
              <p className="text-[20px] text-muted-foreground font-semibold">{pendingMeds[0].name} {pendingMeds[0].dosage}</p>
              <Button onClick={() => markMedicationTaken(pendingMeds[0].id)} size="lg" className="w-full h-16 text-[20px] font-bold rounded-2xl">
                Mark as Taken
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-success/20 bg-success/5 p-8 flex flex-col items-center gap-3">
              <Check className="w-16 h-16 text-success" />
              <span className="text-[28px] font-extrabold text-success">All done for now</span>
            </div>
          )}

          <Button variant="destructive" size="lg" className="w-full h-[72px] text-[26px] font-extrabold sos-pulse rounded-2xl">
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
      <div className="h-full overflow-y-auto bg-background pb-6 relative">
        <div className="relative z-10">
          <div className="bg-primary px-5 py-6 rounded-b-3xl">
            <div className="flex items-center gap-4">
              <img src={patientAvatar} alt="Profile" className="w-16 h-16 object-cover shrink-0 ring-2 ring-primary-foreground/20 rounded-2xl" />
              <div>
                <p className="text-[16px] text-primary-foreground/80 font-semibold">{greeting()}</p>
                <h1 className="text-[28px] font-bold text-primary-foreground leading-tight">{patientName || 'Friend'}</h1>
              </div>
            </div>
          </div>

          <div className="px-5 mt-5 space-y-4">
            <Button onClick={() => setShowIDCard(true)} size="lg" className="w-full h-16 text-[20px] font-bold gap-3 rounded-2xl">
              <User className="w-7 h-7" />
              View Me
            </Button>

            {pendingMeds.map((med) => (
              <div key={med.id} className="rounded-2xl border border-border shadow-sm bg-card">
                <div className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center shrink-0">
                    <Pill className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[20px] font-bold text-foreground">{med.name}</p>
                    <p className="text-[16px] text-muted-foreground mt-1 font-medium">{med.dosage} · {med.time}</p>
                  </div>
                  <Button onClick={() => markMedicationTaken(med.id)} size="lg" className="h-12 px-6 text-[17px] font-bold shrink-0 rounded-xl">
                    Take
                  </Button>
                </div>
              </div>
            ))}

            {takenMeds.map((med) => (
              <div key={med.id} className="rounded-2xl border border-border opacity-50 bg-card">
                <div className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0">
                    <Pill className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[20px] font-bold text-foreground">{med.name}</p>
                    <p className="text-[16px] text-muted-foreground font-medium">Taken at {med.taken_at}</p>
                  </div>
                  <Check className="w-7 h-7 text-success shrink-0" />
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-border bg-card">
              <div className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center shrink-0">
                  <span className="text-[32px]">{currentMood.emoji}</span>
                </div>
                <div>
                  <p className="text-[20px] font-bold text-foreground">Feeling {currentMood.label}</p>
                  <p className="text-[16px] text-muted-foreground font-medium">{currentMood.time}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <PatientIDCard open={showIDCard} onClose={() => setShowIDCard(false)} />
      </div>
    );
  }

  // ── Full Mode — Premium Redesign ──
  return (
    <div className="h-full relative">
      <div className="h-full overflow-y-auto bg-background pb-6 relative">
        <div className="relative z-10">
          {/* Hero Header */}
          <div className="bg-gradient-to-br from-primary via-primary to-accent px-5 pt-5 pb-8 rounded-b-[28px] relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-foreground/5" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary-foreground/5" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img src={patientAvatar} alt="Profile" className="w-14 h-14 object-cover shrink-0 ring-[3px] ring-primary-foreground/30 shadow-lg rounded-2xl" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-success-foreground" />
                  </div>
                </div>
                <div>
                  <p className="text-[13px] text-primary-foreground/60 font-medium">{greeting()} 👋</p>
                  <h1 className="text-[22px] font-extrabold text-primary-foreground leading-tight">{patientName || 'Friend'}</h1>
                  <p className="text-[12px] text-primary-foreground/50 mt-0.5 font-medium">{dateStr}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ModeBadge />
                <button onClick={toggleCaregiverView} className="w-10 h-10 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center touch-target" aria-label="Open caregiver view">
                  <User className="w-5 h-5 text-primary-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid — 2 columns, generous sizing */}
          <div className="px-5 -mt-5 relative z-20">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Steps Today', value: stepCount.toLocaleString(), Icon: Footprints, color: 'text-primary', bg: 'bg-primary/10', sub: 'Goal: 5,000' },
                { label: 'Mood', value: currentMood.label, Icon: Heart, color: 'text-accent', bg: 'bg-accent/10', emoji: currentMood.emoji },
                { label: 'Sleep', value: `${sleepHours} hrs`, Icon: Moon, color: 'text-secondary', bg: 'bg-secondary/10', sub: 'Last night' },
                { label: 'Medications', value: `${takenMeds.length}/${medications.length}`, Icon: Pill, color: 'text-primary', bg: 'bg-primary/10', sub: `${medProgress}% done` },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        {stat.emoji ? (
                          <span className="text-[20px]">{stat.emoji}</span>
                        ) : (
                          <stat.Icon className={`w-5 h-5 ${stat.color}`} />
                        )}
                      </div>
                      <span className="text-[12px] text-muted-foreground font-semibold uppercase tracking-wide">{stat.label}</span>
                    </div>
                    <p className="text-[22px] font-extrabold text-foreground leading-none">{stat.value}</p>
                    {stat.sub && <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">{stat.sub}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* View Me Card */}
          <div className="px-5 mt-5">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowIDCard(true)}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/60 shadow-sm active:shadow-none transition-all touch-target"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-[16px] font-bold text-foreground">My ID & Emergency Contacts</span>
                <p className="text-[13px] text-muted-foreground mt-0.5">Tap to view your details</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/40" />
            </motion.button>
          </div>

          {/* Medications Section */}
          <div className="px-5 mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[19px] font-extrabold text-foreground">💊 Medications</h2>
              <Badge variant="secondary" className="text-[13px] font-bold bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full">
                {takenMeds.length}/{medications.length}
              </Badge>
            </div>
            <Progress value={medProgress} className="h-2 mb-4 rounded-full" />

            {/* Pending medications — large cards */}
            {pendingMeds.length > 0 && (
              <div className="space-y-3 mb-4">
                {pendingMeds.map((med, i) => (
                  <motion.div key={med.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <div className="bg-card rounded-2xl border-2 border-warning/30 shadow-md overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center shrink-0">
                            <Pill className="w-7 h-7 text-warning" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[18px] font-extrabold text-foreground leading-tight">{med.name}</p>
                              <Badge variant="outline" className="text-[10px] font-bold border-warning/30 text-warning px-1.5 py-0 rounded-md">
                                Pending
                              </Badge>
                            </div>
                            <p className="text-[15px] text-muted-foreground font-semibold mt-1">{med.dosage}</p>
                            <div className="flex items-center gap-1.5 mt-2">
                              <Clock className="w-4 h-4 text-muted-foreground/60" />
                              <span className="text-[14px] text-muted-foreground font-medium">{med.time}</span>
                            </div>
                            {med.instructions && (
                              <p className="text-[13px] text-muted-foreground/60 mt-2 italic leading-relaxed">{med.instructions}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => markMedicationTaken(med.id)}
                          size="lg"
                          className="w-full h-14 rounded-2xl text-[17px] font-bold gap-2 mt-4 shadow-sm"
                        >
                          <Check className="w-6 h-6" />
                          Mark as Taken
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Taken medications */}
            {takenMeds.length > 0 && (
              <div className="space-y-2">
                <p className="text-[12px] text-muted-foreground font-bold uppercase tracking-wider mb-2">✅ Completed</p>
                {takenMeds.map((med) => (
                  <div key={med.id} className="flex items-center gap-3.5 p-4 rounded-2xl bg-success/5 border border-success/15">
                    <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-muted-foreground line-through">{med.name} · {med.dosage}</p>
                      <p className="text-[12px] text-success font-medium mt-0.5">Taken at {med.taken_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {medications.length === 0 && (
              <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-3">
                <Pill className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-[15px] text-muted-foreground font-medium">No medications scheduled</p>
              </div>
            )}
          </div>

          {/* Today's Activity */}
          <div className="px-5 mt-6 mb-8">
            <h2 className="text-[19px] font-extrabold text-foreground mb-4">📋 Today's Activity</h2>
            <div className="space-y-3">
              {activities.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    item.completed
                      ? 'bg-success/5 border-success/15'
                      : 'bg-card border-border/60 shadow-sm'
                  }`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-[22px] ${
                      item.completed
                        ? 'bg-success/15'
                        : 'bg-muted/50'
                    }`}>
                      {item.completed ? <Check className="w-6 h-6 text-success" /> : <span>{item.icon}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[16px] font-bold leading-snug ${
                        item.completed ? 'text-foreground' : 'text-foreground'
                      }`}>
                        {item.description}
                      </p>
                      <p className="text-[13px] text-muted-foreground mt-1 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {item.time}
                      </p>
                    </div>
                    {item.completed && (
                      <Badge variant="secondary" className="text-[11px] font-bold bg-success/15 text-success border-success/20 shrink-0 rounded-full px-2.5">
                        Done
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PatientIDCard open={showIDCard} onClose={() => setShowIDCard(false)} />
    </div>
  );
}
