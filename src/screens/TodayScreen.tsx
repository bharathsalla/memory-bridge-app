import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import ModeBadge from '@/components/layout/ModeBadge';
import PatientIDCard from '@/components/PatientIDCard';
import { motion } from 'framer-motion';
import { Pill, Check, Clock, Footprints, Moon, User, ChevronRight, Heart, Sparkles } from 'lucide-react';
import patientAvatar from '@/assets/patient-avatar.jpg';
import { useMedications, useMarkMedicationTaken, useActivities, useVitals } from '@/hooks/useCareData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

// Yesterday's memories hook
function useYesterdayMemories() {
  return useQuery({
    queryKey: ['yesterday-memories'],
    queryFn: async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfDay = new Date(yesterday);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(yesterday);
      endOfDay.setHours(23, 59, 59, 999);
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
  });
}

const fallbackMemories = [
  { id: 'f1', title: 'Morning Garden Walk', emoji: '🌸', mood: 'happy', description: 'Saw the roses blooming' },
  { id: 'f2', title: 'Tea with Sarah', emoji: '☕', mood: 'peaceful', description: 'Chamomile tea together' },
  { id: 'f3', title: 'Family Video Call', emoji: '📱', mood: 'joyful', description: 'Spoke with grandchildren' },
  { id: 'f4', title: 'Painting Session', emoji: '🎨', mood: 'creative', description: 'Watercolor flowers' },
];

const memoryCardStyles = [
  'from-rose-100 to-pink-50 border-rose-200/60',
  'from-amber-100 to-yellow-50 border-amber-200/60',
  'from-sky-100 to-blue-50 border-sky-200/60',
  'from-emerald-100 to-green-50 border-emerald-200/60',
  'from-violet-100 to-purple-50 border-violet-200/60',
  'from-orange-100 to-amber-50 border-orange-200/60',
];

function YesterdayMemories() {
  const { data: dbMemories = [] } = useYesterdayMemories();
  const memories = dbMemories.length > 0 ? dbMemories : fallbackMemories;

  return (
    <div className="px-5 mt-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm">
          <Heart className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-[17px] font-bold text-foreground leading-tight">Yesterday's Memories</h2>
          <p className="text-[12px] text-muted-foreground font-medium">Relive your beautiful moments ✨</p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
        {memories.map((mem, i) => (
          <motion.div
            key={mem.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="snap-start shrink-0"
          >
            <div className={`w-[140px] h-[170px] rounded-2xl bg-gradient-to-br ${memoryCardStyles[i % memoryCardStyles.length]} border-2 p-4 flex flex-col justify-between shadow-sm cursor-pointer active:scale-95 transition-transform`}>
              <span className="text-[36px] leading-none">{mem.emoji}</span>
              <div>
                <p className="text-[14px] font-bold text-foreground leading-tight line-clamp-2">{mem.title}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-1 line-clamp-1">{mem.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const medImages: Record<string, string> = {
  'Lisinopril': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop&q=80',
  'Metformin': 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200&h=200&fit=crop&q=80',
  'Aspirin': 'https://images.unsplash.com/photo-1626716493137-b67fe9501e76?w=200&h=200&fit=crop&q=80',
  'Donepezil': 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=200&h=200&fit=crop&q=80',
  'Memantine': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop&q=80',
  'Amlodipine': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&h=200&fit=crop&q=80',
  'Omeprazole': 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=200&h=200&fit=crop&q=80',
};
const defaultMedImg = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop&q=80';

// Medication color accents for visual differentiation
const medColors: Record<string, string> = {
  'Lisinopril': 'bg-blue-50 border-blue-200',
  'Metformin': 'bg-amber-50 border-amber-200',
  'Aspirin': 'bg-rose-50 border-rose-200',
  'Donepezil': 'bg-violet-50 border-violet-200',
  'Memantine': 'bg-emerald-50 border-emerald-200',
  'Amlodipine': 'bg-cyan-50 border-cyan-200',
  'Omeprazole': 'bg-orange-50 border-orange-200',
};
const defaultMedColor = 'bg-muted/30 border-border';

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
      <div className="h-full flex flex-col items-center justify-center px-6 text-center bg-background relative overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 w-full relative z-10">
          <div>
            <img src={patientAvatar} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-5 object-cover ring-4 ring-primary/20 shadow-lg" />
            <h1 className="text-[48px] font-extrabold text-foreground leading-none">{greeting()}</h1>
            <p className="text-[28px] text-primary mt-3 font-bold">{patientName || 'Friend'}</p>
          </div>

          <Button onClick={() => setShowIDCard(true)} size="lg" className="w-full h-16 rounded-2xl text-[22px] font-bold gap-3">
            <User className="w-8 h-8" />
            View Me
          </Button>

          {pendingMeds.length > 0 ? (
            <Card className="border border-primary/20 shadow-lg overflow-hidden">
              <CardContent className="p-8 flex flex-col items-center gap-4">
                <img src={medImages[pendingMeds[0].name] || defaultMedImg} alt={pendingMeds[0].name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-border" onError={(e) => {(e.target as HTMLImageElement).src = defaultMedImg;}} />
                <h2 className="text-[28px] font-extrabold text-foreground">Take Your Medicine</h2>
                <p className="text-[20px] text-muted-foreground font-semibold">{pendingMeds[0].name} {pendingMeds[0].dosage}</p>
                <Button onClick={() => markMedicationTaken(pendingMeds[0].id)} size="lg" className="w-full h-16 rounded-2xl text-[20px] font-bold">
                  Mark as Taken
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-success/20 bg-success/5">
              <CardContent className="p-8 flex flex-col items-center gap-3">
                <Check className="w-16 h-16 text-success" />
                <span className="text-[28px] font-extrabold text-success">All done for now</span>
              </CardContent>
            </Card>
          )}

          <Button variant="destructive" size="lg" className="w-full h-[72px] rounded-2xl text-[26px] font-extrabold sos-pulse">
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
          {/* Header */}
          <div className="bg-primary px-5 py-6 rounded-b-2xl">
            <div className="flex items-center gap-4">
              <img src={patientAvatar} alt="Profile" className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-2 ring-primary-foreground/20" />
              <div>
                <p className="text-[16px] text-primary-foreground/80 font-semibold">{greeting()}</p>
                <h1 className="text-[28px] font-bold text-primary-foreground leading-tight">{patientName || 'Friend'}</h1>
              </div>
            </div>
          </div>

          <div className="px-5 mt-5 space-y-4">
            <Button onClick={() => setShowIDCard(true)} size="lg" className="w-full h-16 rounded-2xl text-[20px] font-bold gap-3">
              <User className="w-7 h-7" />
              View Me
            </Button>

            {pendingMeds.map((med) => (
              <Card key={med.id} className="border border-border shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <img src={medImages[med.name] || defaultMedImg} alt={med.name}
                    className="w-18 h-18 rounded-2xl object-cover shrink-0 border border-border" style={{ width: 72, height: 72 }}
                    onError={(e) => {(e.target as HTMLImageElement).src = defaultMedImg;}} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[20px] font-bold text-foreground">{med.name}</p>
                    <p className="text-[16px] text-muted-foreground mt-1 font-medium">{med.dosage} · {med.time}</p>
                  </div>
                  <Button onClick={() => markMedicationTaken(med.id)} size="lg" className="h-12 px-6 rounded-xl text-[17px] font-bold shrink-0">
                    Take
                  </Button>
                </CardContent>
              </Card>
            ))}

            {takenMeds.map((med) => (
              <Card key={med.id} className="border border-border opacity-50">
                <CardContent className="p-5 flex items-center gap-4">
                  <img src={medImages[med.name] || defaultMedImg} alt={med.name}
                    className="w-18 h-18 rounded-2xl object-cover shrink-0 grayscale" style={{ width: 72, height: 72 }}
                    onError={(e) => {(e.target as HTMLImageElement).src = defaultMedImg;}} />
                  <div className="flex-1">
                    <p className="text-[20px] font-bold text-foreground">{med.name}</p>
                    <p className="text-[16px] text-muted-foreground font-medium">Taken at {med.taken_at}</p>
                  </div>
                  <Check className="w-7 h-7 text-success shrink-0" />
                </CardContent>
              </Card>
            ))}

            <Card className="border border-border">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center shrink-0">
                  <span className="text-[32px]">{currentMood.emoji}</span>
                </div>
                <div>
                  <p className="text-[20px] font-bold text-foreground">Feeling {currentMood.label}</p>
                  <p className="text-[16px] text-muted-foreground font-medium">{currentMood.time}</p>
                </div>
              </CardContent>
            </Card>
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
        <div className="relative z-10">
          {/* Green header */}
          <div className="bg-primary px-5 py-5 rounded-b-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img src={patientAvatar} alt="Profile" className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-2 ring-primary-foreground/20 shadow-md" />
                <div>
                  <p className="text-[15px] text-primary-foreground/70 font-semibold">{greeting()}</p>
                  <h1 className="text-[24px] font-bold text-primary-foreground leading-tight">{patientName || 'Friend'}</h1>
                  <p className="text-[13px] text-primary-foreground/60 mt-0.5">{dateStr}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <ModeBadge />
                <button onClick={toggleCaregiverView} className="w-10 h-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center touch-target" aria-label="Open caregiver view">
                  <User className="w-5 h-5 text-primary-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="px-5 mt-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Steps', value: stepCount.toLocaleString(), Icon: Footprints, iconColor: 'text-primary' },
                { label: 'Mood', value: currentMood.label, extra: currentMood.emoji, Icon: null, iconColor: '' },
                { label: 'Sleep', value: `${sleepHours}h`, Icon: Moon, iconColor: 'text-primary' },
                { label: 'Meds', value: `${takenMeds.length}/${medications.length}`, Icon: Pill, iconColor: 'text-primary' },
              ].map((stat) => (
                <Card key={stat.label} className="border border-border shadow-sm">
                  <CardContent className="p-4 flex flex-col items-center gap-2 py-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center">
                      {stat.Icon ? <stat.Icon className={`w-6 h-6 ${stat.iconColor}`} /> : <span className="text-[24px] leading-none">{stat.extra}</span>}
                    </div>
                    <span className="text-[20px] font-bold text-foreground">{stat.value}</span>
                    <span className="text-[13px] text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* View Me */}
          <div className="px-5 mt-5">
            <Button onClick={() => setShowIDCard(true)} size="lg" className="w-full h-14 rounded-2xl text-[18px] font-bold gap-3">
              <User className="w-6 h-6" />
              View Me — My ID & Contacts
              <ChevronRight className="w-5 h-5 opacity-60 ml-auto" />
            </Button>
          </div>

          {/* Yesterday's Memories — Google Photos style */}
          <YesterdayMemories />

          {/* Medications — Bigger cards */}
          <div className="px-5 mt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[20px] font-bold text-foreground">Medications</h2>
              <Badge variant="secondary" className="text-[14px] font-semibold bg-primary/10 text-primary border-primary/20 px-3 py-1">
                {takenMeds.length}/{medications.length}
              </Badge>
            </div>
            <Progress value={medProgress} className="h-2.5 mb-4 rounded-full" />

            {pendingMeds.length > 0 && (
              <div className="space-y-4 mb-4">
                {pendingMeds.map((med, i) => (
                  <motion.div key={med.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className={`border-2 shadow-lg overflow-hidden ${medColors[med.name] || defaultMedColor}`}>
                      <CardContent className="p-0">
                        <div className="p-5 flex items-start gap-5">
                          <div className="relative shrink-0">
                            <img src={medImages[med.name] || defaultMedImg} alt={med.name}
                              className="w-[88px] h-[88px] rounded-2xl object-cover shadow-md ring-2 ring-white/60"
                              onError={(e) => {(e.target as HTMLImageElement).src = defaultMedImg;}} />
                            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-warning flex items-center justify-center shadow-md ring-2 ring-white">
                              <Clock className="w-4 h-4 text-warning-foreground" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-[20px] font-extrabold text-foreground leading-tight">{med.name}</p>
                            <p className="text-[16px] text-muted-foreground font-bold mt-1.5">{med.dosage}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-[13px] font-semibold border-muted-foreground/20 text-muted-foreground gap-1 px-2.5 py-0.5">
                                <Clock className="w-3 h-3" /> {med.time}
                              </Badge>
                            </div>
                            {med.instructions && (
                              <p className="text-[14px] text-muted-foreground/70 mt-2 italic leading-snug">{med.instructions}</p>
                            )}
                          </div>
                        </div>
                        <div className="px-5 pb-5">
                          <Button onClick={() => markMedicationTaken(med.id)} size="lg" className="w-full h-14 rounded-2xl text-[18px] font-bold gap-2 shadow-sm">
                            <Check className="w-6 h-6" />
                            Mark as Taken
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {takenMeds.length > 0 && (
              <div className="space-y-2">
                <p className="text-[13px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Completed</p>
                {takenMeds.map((med, i) => (
                  <motion.div key={med.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/50">
                      <img src={medImages[med.name] || defaultMedImg} alt={med.name}
                        className="w-12 h-12 rounded-xl object-cover grayscale opacity-50 shrink-0"
                        onError={(e) => {(e.target as HTMLImageElement).src = defaultMedImg;}} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-muted-foreground line-through">{med.name} · {med.dosage}</p>
                        <p className="text-[13px] text-muted-foreground/60 mt-0.5">Taken at {med.taken_at}</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 text-success" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {medications.length === 0 && (
              <Card className="border border-border">
                <CardContent className="p-8 flex flex-col items-center gap-2">
                  <Pill className="w-10 h-10 text-muted-foreground/30" />
                  <p className="text-[16px] text-muted-foreground font-medium">No medications scheduled</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Today's Activity — Revamped Timeline */}
          <div className="px-5 mt-6 mb-6">
            <h2 className="text-[20px] font-bold text-foreground mb-4">Today's Activity</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[22px] top-4 bottom-4 w-[2px] bg-border" />
              <div className="space-y-1">
                {activities.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <div className="flex items-start gap-4 py-3 relative">
                      <div className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-[20px] border-2 shadow-sm ${
                        item.completed
                          ? 'bg-success/10 border-success/30'
                          : 'bg-card border-border'
                      }`}>
                        {item.completed ? <Check className="w-5 h-5 text-success" /> : <span>{item.icon}</span>}
                      </div>
                      <Card className={`flex-1 border shadow-sm ${item.completed ? 'border-success/20 bg-success/[0.03]' : 'border-border'}`}>
                        <CardContent className="p-3.5">
                          <div className="flex items-center justify-between">
                            <p className={`text-[16px] font-semibold leading-snug ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {item.description}
                            </p>
                            {item.completed && (
                              <Badge variant="secondary" className="text-[11px] font-bold bg-success/10 text-success border-success/20 ml-2 shrink-0">
                                Done
                              </Badge>
                            )}
                          </div>
                          <p className="text-[13px] text-muted-foreground mt-1 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.time}
                          </p>
                        </CardContent>
                      </Card>
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
