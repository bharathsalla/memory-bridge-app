import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import ModeBadge from '@/components/layout/ModeBadge';
import PatientIDCard from '@/components/PatientIDCard';
import { Pill, Check, Clock, Footprints, Moon, User, ChevronRight, Heart, CalendarDays, Coffee, Dumbbell } from 'lucide-react';
import IconBox, { iosColors, getColor } from '@/components/ui/IconBox';
import patientAvatar from '@/assets/patient-avatar.jpg';
import { useMedications, useMarkMedicationTaken, useActivities, useVitals } from '@/hooks/useCareData';
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

          <button onClick={() => setShowIDCard(true)} className="w-full py-4 rounded-2xl bg-card text-foreground text-[22px] font-semibold flex items-center justify-center gap-3">
            <User className="w-7 h-7 text-muted-foreground" />
            View Me
          </button>

          {pendingMeds.length > 0 ? (
            <div className="ios-card p-8 flex flex-col items-center gap-4">
              <Pill className="w-16 h-16 text-muted-foreground" />
              <h2 className="text-[28px] font-bold text-foreground">Take Your Medicine</h2>
              <p className="text-[20px] text-muted-foreground font-medium">{pendingMeds[0].name} {pendingMeds[0].dosage}</p>
              <button onClick={() => markMedicationTaken(pendingMeds[0].id)} className="w-full py-4 rounded-2xl bg-card text-primary text-[20px] font-semibold">
                Mark as Taken
              </button>
            </div>
          ) : (
            <div className="ios-card p-8 flex flex-col items-center gap-3">
              <Check className="w-16 h-16 text-muted-foreground" />
              <span className="text-[28px] font-bold text-foreground">All done for now</span>
            </div>
          )}

          <button className="w-full py-5 rounded-2xl bg-destructive text-destructive-foreground text-[26px] font-bold">
            Emergency Call
          </button>
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
          <button onClick={() => setShowIDCard(true)} className="w-full ios-card flex items-center gap-3 px-4 text-left" style={{ minHeight: 56 }}>
            <User className="w-5 h-5 text-muted-foreground shrink-0" />
            <span className="text-ios-headline text-foreground flex-1">View Me</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
          </button>

          {/* Pending meds grouped */}
          {pendingMeds.length > 0 && (
            <div className="ios-card overflow-hidden divide-y divide-border/30">
              {pendingMeds.map((med) => (
                <div key={med.id} className="flex items-center gap-3 px-4" style={{ minHeight: 60 }}>
                  <Pill className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-ios-headline text-foreground">{med.name}</p>
                    <p className="text-ios-footnote text-muted-foreground">{med.dosage} · {med.time}</p>
                  </div>
                  <button onClick={() => markMedicationTaken(med.id)} className="text-primary text-ios-callout font-semibold shrink-0">
                    Mark as Taken
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Taken meds grouped */}
          {takenMeds.length > 0 && (
            <div className="ios-card overflow-hidden divide-y divide-border/30 opacity-50">
              {takenMeds.map((med) => (
                <div key={med.id} className="flex items-center gap-3 px-4" style={{ minHeight: 56 }}>
                  <Check className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-ios-headline text-foreground line-through">{med.name}</p>
                    <p className="text-ios-footnote text-muted-foreground">Taken at {med.taken_at}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <PatientIDCard open={showIDCard} onClose={() => setShowIDCard(false)} />
      </div>
    );
  }

  // ── Full Mode — Apple Health Style ──
  return (
    <div className="h-full relative">
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6">
        {/* iOS Large Navigation Title */}
        <div className="px-4 pt-4 pb-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-ios-footnote text-muted-foreground font-medium">{dateStr}</p>
            <div className="flex items-center gap-2">
              <ModeBadge />
              <button onClick={toggleCaregiverView} className="w-9 h-9 rounded-full overflow-hidden touch-target" aria-label="Open caregiver view">
                <img src={patientAvatar} alt="Profile" className="w-9 h-9 object-cover rounded-full" />
              </button>
            </div>
          </div>
          <h1 className="text-ios-large-title text-foreground">{greeting()}</h1>
        </div>

        {/* Profile Row — Primary Green */}
        <div className="px-4 mt-3">
          <div className="rounded-2xl overflow-hidden bg-primary">
            <button
              onClick={() => setShowIDCard(true)}
              className="w-full flex items-center gap-3 px-4 text-left touch-target"
              style={{ minHeight: 64 }}
            >
              <img src={patientAvatar} alt="Profile" className="w-12 h-12 object-cover shrink-0 rounded-full ring-2 ring-white/30" />
              <div className="flex-1">
                <p className="text-ios-callout font-semibold text-primary-foreground">{patientName || 'Friend'}</p>
                <p className="text-ios-footnote text-primary-foreground/70">My ID & Emergency Contacts</p>
              </div>
              <ChevronRight className="w-5 h-5 text-primary-foreground/40" />
            </button>
          </div>
        </div>

        {/* Health Summary — 2x2 Card Grid with iOS Colors */}
        <div className="mt-4">
          <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Health Summary</p>
          <div className="mx-4 grid grid-cols-2 gap-2.5">
            {[
              { label: 'Steps', value: stepCount.toLocaleString(), Icon: Footprints, detail: 'Goal: 5,000', color: '#34C759', bgColor: 'rgba(52, 199, 89, 0.12)' },
              { label: 'Sleep', value: `${sleepHours} hrs`, Icon: Moon, detail: 'Last night', color: '#AF52DE', bgColor: 'rgba(175, 82, 222, 0.12)' },
              { label: 'Mood', value: currentMood.label, Icon: Heart, detail: currentMood.time, color: '#FF3B30', bgColor: 'rgba(255, 59, 48, 0.12)' },
              { label: 'Medications', value: `${takenMeds.length}/${medications.length}`, Icon: Pill, detail: `${medProgress}%`, color: '#FF9500', bgColor: 'rgba(255, 149, 0, 0.12)' },
            ].map((stat) => (
              <div key={stat.label} className="ios-card p-3.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.bgColor }}>
                    <stat.Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: stat.color }} />
                  </div>
                  <span className="text-ios-footnote text-muted-foreground">{stat.detail}</span>
                </div>
                <p className="text-[22px] font-bold text-foreground leading-tight">{stat.value}</p>
                <p className="text-ios-footnote text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div className="mt-5">
          <div className="px-5 flex items-center justify-between mb-2">
            <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider">Medications</p>
            <span className="text-ios-footnote text-muted-foreground">{takenMeds.length}/{medications.length} taken</span>
          </div>
          <div className="px-4 mb-2">
            <Progress value={medProgress} className="h-[3px] rounded-full" />
          </div>

          {pendingMeds.length > 0 && (
            <div className="px-4">
              <div className="ios-card overflow-hidden divide-y divide-border/30">
                {pendingMeds.map((med) => (
                  <div key={med.id} className="flex items-center gap-3 px-4" style={{ minHeight: 56 }}>
                    <Pill className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-ios-callout font-medium text-foreground">{med.name}</p>
                      <p className="text-ios-footnote text-muted-foreground">{med.dosage} · {med.time}</p>
                    </div>
                    <button
                      onClick={() => markMedicationTaken(med.id)}
                      className="text-primary text-ios-callout font-semibold shrink-0"
                    >
                      Mark as Taken
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {takenMeds.length > 0 && (
            <div className="px-4 mt-2">
              <div className="ios-card overflow-hidden divide-y divide-border/30">
                {takenMeds.map((med) => (
                  <div key={med.id} className="flex items-center gap-3 px-4" style={{ minHeight: 48 }}>
                    <Check className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-ios-subheadline text-muted-foreground line-through">{med.name} · {med.dosage}</p>
                      <p className="text-ios-caption2 text-muted-foreground">Taken at {med.taken_at}</p>
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
        <div className="mt-5 mb-6">
          <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Today's Activity</p>
          <div className="px-4">
            <div className="ios-card overflow-hidden divide-y divide-border/30">
              {activities.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 px-4" style={{ minHeight: 60 }}>
                  {item.completed ? (
                    <IconBox Icon={Check} color={iosColors.green} />
                  ) : (
                    <IconBox Icon={Clock} color={getColor(idx)} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-ios-callout font-medium text-foreground">{item.description}</p>
                    <p className="text-ios-footnote text-muted-foreground">{item.time}</p>
                  </div>
                  {item.completed && (
                    <span className="text-ios-caption font-semibold text-muted-foreground">Done</span>
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
