import { useApp } from '@/contexts/AppContext';
import ModeBadge from '@/components/layout/ModeBadge';
import { motion } from 'framer-motion';
import { Bell, Sun, Pill, ChevronRight, Mic } from 'lucide-react';

export default function TodayScreen() {
  const { mode, patientName, medications, activities, currentMood, stepCount, markMedicationTaken, navigateToDetail, toggleCaregiverView } = useApp();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const pendingMeds = medications.filter(m => !m.taken);
  const takenMeds = medications.filter(m => m.taken);

  // Essential mode
  if (mode === 'essential') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 text-center bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <h1 className="text-[48px] font-bold text-foreground leading-tight">{greeting()}</h1>
          {pendingMeds.length > 0 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => markMedicationTaken(pendingMeds[0].id)}
              className="w-full h-40 rounded-3xl bg-primary text-primary-foreground flex flex-col items-center justify-center gap-3 shadow-lg"
            >
              <Pill className="w-16 h-16" />
              <span className="text-[24px] font-bold">Take Your Medicine</span>
              <span className="text-[18px] opacity-80">{pendingMeds[0].name} {pendingMeds[0].dosage}</span>
            </motion.button>
          ) : (
            <div className="w-full h-40 rounded-3xl bg-success/15 flex flex-col items-center justify-center gap-3">
              <span className="text-6xl">✓</span>
              <span className="text-[24px] font-semibold text-success">All done for now</span>
            </div>
          )}
          <button className="w-full h-20 rounded-2xl bg-destructive text-destructive-foreground text-[24px] font-bold sos-pulse">
            🆘 Emergency Call
          </button>
        </motion.div>
      </div>
    );
  }

  // Simplified mode
  if (mode === 'simplified') {
    return (
      <div className="h-full overflow-y-auto bg-surface pb-32">
        <div className="px-5 pt-4 pb-4 bg-background">
          <h1 className="text-[40px] font-bold text-foreground leading-tight">{greeting()}</h1>
          <p className="text-[20px] text-muted-foreground mt-1">{patientName || 'Friend'}</p>
        </div>
        <div className="px-5 space-y-4 mt-4">
          {pendingMeds.map(med => (
            <motion.button
              key={med.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => markMedicationTaken(med.id)}
              className="w-full ios-card-elevated p-6 flex items-center gap-5 text-left"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Pill className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-[22px] font-bold text-foreground">{med.name}</div>
                <div className="text-[18px] text-muted-foreground">{med.dosage} · {med.time}</div>
              </div>
              <div className="text-primary text-[18px] font-semibold">Take</div>
            </motion.button>
          ))}
          {takenMeds.map(med => (
            <div key={med.id} className="w-full ios-card p-6 flex items-center gap-5 opacity-60">
              <div className="w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center shrink-0">
                <span className="text-3xl">✓</span>
              </div>
              <div className="flex-1">
                <div className="text-[22px] font-bold text-foreground">{med.name}</div>
                <div className="text-[18px] text-muted-foreground">Taken at {med.takenAt}</div>
              </div>
            </div>
          ))}
          <div className="w-full ios-card-elevated p-6 flex items-center gap-5 text-left">
            <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center shrink-0">
              <span className="text-3xl">{currentMood.emoji}</span>
            </div>
            <div>
              <div className="text-[22px] font-bold text-foreground">Feeling {currentMood.label}</div>
              <div className="text-[18px] text-muted-foreground">{currentMood.time}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full mode
  return (
    <div className="h-full overflow-y-auto bg-surface pb-24">
      {/* Header */}
      <div className="px-5 pt-3 pb-4 bg-background">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-ios-subheadline text-muted-foreground">{greeting()}</p>
            <h1 className="text-ios-title text-foreground">{patientName || 'Friend'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ModeBadge />
            <button
              onClick={toggleCaregiverView}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <span className="text-lg">👤</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-5 mt-2">
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {[
            { label: 'Steps', value: stepCount.toLocaleString(), icon: '🚶', color: 'bg-sage/15 text-sage' },
            { label: 'Mood', value: currentMood.emoji, icon: '', color: 'bg-accent/15 text-accent' },
            { label: 'Sleep', value: '7.5h', icon: '😴', color: 'bg-lavender/15 text-lavender' },
            { label: 'Meds', value: `${takenMeds.length}/${medications.length}`, icon: '💊', color: 'bg-primary/10 text-primary' },
          ].map(stat => (
            <div key={stat.label} className="ios-card-elevated min-w-[100px] p-3 flex flex-col items-center gap-1">
              <span className="text-xl">{stat.icon || stat.value}</span>
              <span className="text-ios-headline text-foreground">{stat.icon ? stat.value : ''}</span>
              <span className="text-ios-caption text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Medications */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-ios-title3 text-foreground">Medications</h2>
          <button className="text-ios-subheadline text-primary">See All</button>
        </div>
        <div className="ios-card-elevated divide-y divide-border">
          {medications.map(med => (
            <motion.div key={med.id} className="flex items-center gap-3 p-4" layout>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${med.taken ? 'bg-success/15' : 'bg-primary/10'}`}>
                {med.taken ? <span className="text-success text-lg">✓</span> : <Pill className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-ios-body font-semibold text-foreground">{med.name} {med.dosage}</div>
                <div className="text-ios-footnote text-muted-foreground">{med.taken ? `Taken at ${med.takenAt}` : med.time}</div>
              </div>
              {!med.taken && (
                <button
                  onClick={() => markMedicationTaken(med.id)}
                  className="px-4 h-9 rounded-full bg-primary text-primary-foreground text-ios-footnote font-semibold active:scale-95 transition-transform"
                >
                  Take
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Today's Activity</h2>
        <div className="ios-card-elevated p-4">
          {activities.map((item, i) => (
            <div key={item.id} className="flex items-start gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${item.completed ? 'bg-success/15' : 'bg-muted'}`}>
                  {item.icon}
                </div>
                {i < activities.length - 1 && <div className="w-px h-8 bg-border mt-1" />}
              </div>
              <div className="flex-1 pt-1">
                <div className={`text-ios-subheadline ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>{item.description}</div>
                <div className="text-ios-caption text-muted-foreground">{item.time}</div>
              </div>
              {item.completed && <span className="text-success text-xs mt-1">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Voice Input FAB */}
      <button className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-90 transition-transform z-30">
        <Mic className="w-6 h-6" />
      </button>
    </div>
  );
}
