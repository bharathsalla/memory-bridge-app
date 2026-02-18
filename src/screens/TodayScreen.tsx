import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import ModeBadge from '@/components/layout/ModeBadge';
import PatientIDCard from '@/components/PatientIDCard';
import { motion } from 'framer-motion';
import { Pill, Check, Clock, Footprints, Moon, User, ChevronRight, Sun, Activity } from 'lucide-react';
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
            <img src={patientAvatar} alt="Profile" className="w-32 h-32 mx-auto mb-5 object-cover ring-4 ring-primary/20 shadow-lg" />
            <h1 className="text-[48px] font-extrabold text-foreground leading-none">{greeting()}</h1>
            <p className="text-[28px] text-primary mt-3 font-bold">{patientName || 'Friend'}</p>
          </div>

          <Button onClick={() => setShowIDCard(true)} size="lg" className="w-full h-16 text-[22px] font-bold gap-3">
            <User className="w-8 h-8" />
            View Me
          </Button>

          {pendingMeds.length > 0 ? (
            <div className="border border-primary/20 shadow-lg overflow-hidden bg-card p-8 flex flex-col items-center gap-4">
              <Pill className="w-16 h-16 text-primary" />
              <h2 className="text-[28px] font-extrabold text-foreground">Take Your Medicine</h2>
              <p className="text-[20px] text-muted-foreground font-semibold">{pendingMeds[0].name} {pendingMeds[0].dosage}</p>
              <Button onClick={() => markMedicationTaken(pendingMeds[0].id)} size="lg" className="w-full h-16 text-[20px] font-bold">
                Mark as Taken
              </Button>
            </div>
          ) : (
            <div className="border border-success/20 bg-success/5 p-8 flex flex-col items-center gap-3">
              <Check className="w-16 h-16 text-success" />
              <span className="text-[28px] font-extrabold text-success">All done for now</span>
            </div>
          )}

          <Button variant="destructive" size="lg" className="w-full h-[72px] text-[26px] font-extrabold sos-pulse">
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
          <div className="bg-primary px-5 py-6">
            <div className="flex items-center gap-4">
              <img src={patientAvatar} alt="Profile" className="w-16 h-16 object-cover shrink-0 ring-2 ring-primary-foreground/20" />
              <div>
                <p className="text-[16px] text-primary-foreground/80 font-semibold">{greeting()}</p>
                <h1 className="text-[28px] font-bold text-primary-foreground leading-tight">{patientName || 'Friend'}</h1>
              </div>
            </div>
          </div>

          <div className="px-5 mt-5 space-y-4">
            <Button onClick={() => setShowIDCard(true)} size="lg" className="w-full h-16 text-[20px] font-bold gap-3">
              <User className="w-7 h-7" />
              View Me
            </Button>

            {pendingMeds.map((med) => (
              <div key={med.id} className="border border-border shadow-sm bg-card">
                <div className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/8 flex items-center justify-center shrink-0">
                    <Pill className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[20px] font-bold text-foreground">{med.name}</p>
                    <p className="text-[16px] text-muted-foreground mt-1 font-medium">{med.dosage} · {med.time}</p>
                  </div>
                  <Button onClick={() => markMedicationTaken(med.id)} size="lg" className="h-12 px-6 text-[17px] font-bold shrink-0">
                    Take
                  </Button>
                </div>
              </div>
            ))}

            {takenMeds.map((med) => (
              <div key={med.id} className="border border-border opacity-50 bg-card">
                <div className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 bg-muted/50 flex items-center justify-center shrink-0">
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

            <div className="border border-border bg-card">
              <div className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/8 flex items-center justify-center shrink-0">
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

  // ── Full Mode — Redesigned ──
  return (
    <div className="h-full relative">
      <div className="h-full overflow-y-auto bg-background pb-24 relative">
        <div className="relative z-10">
          {/* Compact Header */}
          <div className="bg-primary px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={patientAvatar} alt="Profile" className="w-12 h-12 object-cover shrink-0 ring-2 ring-primary-foreground/20 shadow-md" />
                <div>
                  <p className="text-[13px] text-primary-foreground/70 font-semibold">{greeting()}</p>
                  <h1 className="text-[20px] font-bold text-primary-foreground leading-tight">{patientName || 'Friend'}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ModeBadge />
                <button onClick={toggleCaregiverView} className="w-9 h-9 bg-primary-foreground/15 flex items-center justify-center touch-target" aria-label="Open caregiver view">
                  <User className="w-4.5 h-4.5 text-primary-foreground" />
                </button>
              </div>
            </div>
            {/* Date & Time strip */}
            <div className="flex items-center gap-3 mt-3 text-primary-foreground/60">
              <span className="text-[13px] font-medium">{dateStr}</span>
              <span className="text-[13px] font-bold text-primary-foreground/80">·</span>
              <span className="text-[13px] font-medium">{timeStr}</span>
            </div>
          </div>

          {/* Quick Stats — Compact horizontal strip */}
          <div className="px-4 mt-4">
            <div className="flex gap-2">
              {[
                { label: 'Steps', value: stepCount.toLocaleString(), Icon: Footprints },
                { label: 'Mood', value: currentMood.emoji, Icon: null },
                { label: 'Sleep', value: `${sleepHours}h`, Icon: Moon },
                { label: 'Meds', value: `${takenMeds.length}/${medications.length}`, Icon: Pill },
              ].map((stat) => (
                <div key={stat.label} className="flex-1 bg-card border border-border p-3 flex flex-col items-center gap-1">
                  {stat.Icon ? (
                    <stat.Icon className="w-4 h-4 text-primary" />
                  ) : (
                    <span className="text-[16px] leading-none">{stat.value}</span>
                  )}
                  {stat.Icon && <span className="text-[15px] font-bold text-foreground">{stat.value}</span>}
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* View Me — compact */}
          <div className="px-4 mt-3">
            <button onClick={() => setShowIDCard(true)} className="w-full flex items-center gap-3 p-3 bg-primary/8 border border-primary/15 active:bg-primary/12 transition-colors touch-target">
              <div className="w-9 h-9 bg-primary/15 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[15px] font-bold text-foreground flex-1 text-left">My ID & Emergency Contacts</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
            </button>
          </div>

          {/* Medications — Clean list style */}
          <div className="px-4 mt-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[17px] font-bold text-foreground">Medications</h2>
              <Badge variant="secondary" className="text-[12px] font-semibold bg-primary/10 text-primary border-primary/20 px-2 py-0.5">
                {takenMeds.length}/{medications.length}
              </Badge>
            </div>
            <Progress value={medProgress} className="h-1.5 mb-3" />

            {/* Pending medications */}
            {pendingMeds.length > 0 && (
              <div className="space-y-2 mb-3">
                {pendingMeds.map((med, i) => (
                  <motion.div key={med.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="bg-card border border-border shadow-sm overflow-hidden">
                      <div className="p-3.5 flex items-center gap-3">
                        <div className="w-10 h-10 bg-warning/10 flex items-center justify-center shrink-0">
                          <Pill className="w-5 h-5 text-warning" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-bold text-foreground leading-tight">{med.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[13px] text-muted-foreground font-medium">{med.dosage}</span>
                            <span className="text-[13px] text-muted-foreground/40">·</span>
                            <span className="text-[13px] text-muted-foreground font-medium flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> {med.time}
                            </span>
                          </div>
                          {med.instructions && (
                            <p className="text-[11px] text-muted-foreground/60 mt-1 italic">{med.instructions}</p>
                          )}
                        </div>
                        <Button onClick={() => markMedicationTaken(med.id)} size="sm" className="h-10 px-4 text-[13px] font-bold shrink-0 gap-1">
                          <Check className="w-4 h-4" />
                          Take
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Taken medications — compact */}
            {takenMeds.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Completed</p>
                {takenMeds.map((med) => (
                  <div key={med.id} className="flex items-center gap-3 p-2.5 bg-muted/20 border border-border/40">
                    <div className="w-8 h-8 bg-success/10 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-muted-foreground line-through">{med.name} · {med.dosage}</p>
                      <p className="text-[11px] text-muted-foreground/50 mt-0.5">Taken at {med.taken_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {medications.length === 0 && (
              <div className="border border-border bg-card p-6 flex flex-col items-center gap-2">
                <Pill className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-[14px] text-muted-foreground font-medium">No medications scheduled</p>
              </div>
            )}
          </div>

          {/* Today's Activity — Compact Timeline */}
          <div className="px-4 mt-5 mb-6">
            <h2 className="text-[17px] font-bold text-foreground mb-3">Today's Activity</h2>
            <div className="relative">
              <div className="absolute left-[17px] top-3 bottom-3 w-[2px] bg-border" />
              <div className="space-y-0.5">
                {activities.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <div className="flex items-center gap-3 py-2.5 relative">
                      <div className={`relative z-10 w-9 h-9 flex items-center justify-center shrink-0 text-[16px] border-2 shadow-sm ${
                        item.completed
                          ? 'bg-success/10 border-success/30'
                          : 'bg-card border-border'
                      }`}>
                        {item.completed ? <Check className="w-4 h-4 text-success" /> : <span className="text-[14px]">{item.icon}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[14px] font-semibold leading-snug ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {item.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-medium">{item.time}</p>
                      </div>
                      {item.completed && (
                        <Badge variant="secondary" className="text-[10px] font-bold bg-success/10 text-success border-success/20 shrink-0 px-1.5 py-0">
                          ✓
                        </Badge>
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
