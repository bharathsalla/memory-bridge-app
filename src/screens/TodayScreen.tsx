import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import ModeBadge from '@/components/layout/ModeBadge';
import PatientIDCard from '@/components/PatientIDCard';
import { Pill, Check, Clock, Footprints, Moon, User, ChevronRight, Heart } from 'lucide-react';
import patientAvatar from '@/assets/patient-avatar.jpg';
import { useMedications, useMarkMedicationTaken, useActivities, useVitals } from '@/hooks/useCareData';
import { Button } from '@/components/ui/button';
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
        <div className="space-y-6 w-full">
          <div>
            <img src={patientAvatar} alt="Profile" className="w-28 h-28 mx-auto mb-5 object-cover rounded-full" />
            <h1 className="text-ios-large-title text-foreground">{greeting()}</h1>
            <p className="text-[28px] text-foreground mt-3 font-bold">{patientName || 'Friend'}</p>
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
        </div>
        <PatientIDCard open={showIDCard} onClose={() => setShowIDCard(false)} />
      </div>
    );
  }

  // ── Simplified Mode ──
  if (mode === 'simplified') {
    return (
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6 relative">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <img src={patientAvatar} alt="Profile" className="w-14 h-14 object-cover shrink-0 rounded-full" />
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
        <PatientIDCard open={showIDCard} onClose={() => setShowIDCard(false)} />
      </div>
    );
  }

  // ── Full Mode — Apple Health Style ──
  return (
    <div className="h-full relative">
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6">
        {/* Large Navigation Title */}
        <div className="px-4 pt-14 pb-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-ios-footnote text-muted-foreground font-medium">{dateStr}</p>
            <div className="flex items-center gap-2">
              <ModeBadge />
              <button onClick={toggleCaregiverView} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center touch-target" aria-label="Open caregiver view">
                <User className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          <h1 className="text-ios-large-title text-foreground">{greeting()}</h1>
        </div>

        {/* Profile Row */}
        <div className="px-4 mt-4">
          <button
            onClick={() => setShowIDCard(true)}
            className="w-full ios-card p-4 flex items-center gap-3 text-left touch-target"
          >
            <img src={patientAvatar} alt="Profile" className="w-11 h-11 object-cover shrink-0 rounded-full" />
            <div className="flex-1">
              <p className="text-ios-headline text-foreground">{patientName || 'Friend'}</p>
              <p className="text-ios-footnote text-muted-foreground">My ID & Emergency Contacts</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
          </button>
        </div>

        {/* Health Summary — Apple Health grouped list */}
        <div className="mt-6">
          <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Health Summary</p>
          <div className="mx-4 ios-card overflow-hidden divide-y divide-border/30">
            {[
              { label: 'Steps', value: stepCount.toLocaleString(), Icon: Footprints, detail: 'Goal: 5,000' },
              { label: 'Sleep', value: `${sleepHours} hrs`, Icon: Moon, detail: 'Last night' },
              { label: 'Mood', value: currentMood.label, Icon: Heart, emoji: currentMood.emoji },
              { label: 'Medications', value: `${takenMeds.length}/${medications.length}`, Icon: Pill, detail: `${medProgress}% complete` },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                  {stat.emoji ? (
                    <span className="text-[18px]">{stat.emoji}</span>
                  ) : (
                    <stat.Icon className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-ios-callout font-medium text-foreground">{stat.label}</p>
                  {stat.detail && <p className="text-ios-footnote text-muted-foreground">{stat.detail}</p>}
                </div>
                <p className="text-ios-headline text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div className="mt-6">
          <div className="px-5 flex items-center justify-between mb-2">
            <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider">Medications</p>
            <span className="text-ios-footnote text-muted-foreground">{takenMeds.length}/{medications.length} taken</span>
          </div>
          <div className="px-4 mb-2">
            <Progress value={medProgress} className="h-1.5 rounded-full" />
          </div>

          {pendingMeds.length > 0 && (
            <div className="px-4 space-y-2 mb-3">
              {pendingMeds.map((med) => (
                <div key={med.id} className="ios-card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-ios-callout font-semibold text-foreground">{med.name}</p>
                      <p className="text-ios-footnote text-muted-foreground mt-0.5">{med.dosage} · {med.time}</p>
                    </div>
                  </div>
                  {med.instructions && (
                    <p className="text-ios-caption text-muted-foreground/60 mb-3">{med.instructions}</p>
                  )}
                  <Button
                    onClick={() => markMedicationTaken(med.id)}
                    className="w-full h-11 rounded-xl text-[15px] font-semibold gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Mark as Taken
                  </Button>
                </div>
              ))}
            </div>
          )}

          {takenMeds.length > 0 && (
            <div className="px-4">
              <div className="ios-card overflow-hidden divide-y divide-border/30">
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
          <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Today's Activity</p>
          <div className="px-4">
            <div className="ios-card overflow-hidden divide-y divide-border/30">
              {activities.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[18px] ${
                    item.completed ? 'bg-success/10' : 'bg-muted/40'
                  }`}>
                    {item.completed ? <Check className="w-4 h-4 text-success" /> : <span>{item.icon}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ios-callout font-medium text-foreground">{item.description}</p>
                    <p className="text-ios-footnote text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.time}
                    </p>
                  </div>
                  {item.completed && (
                    <span className="text-ios-caption font-semibold text-success">Done</span>
                  )}
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
