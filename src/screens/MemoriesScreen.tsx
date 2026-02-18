import { useState, useEffect } from 'react';
import SegmentedControl from '@/components/ui/SegmentedControl';
import IconBox, { iosColors } from '@/components/ui/IconBox';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ChevronLeft, ChevronRight, Pause, Play, Clock,
  Users, MapPin, Brain, UserCheck, Plus,
  RefreshCw, Eye } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

// Realistic memory images
import familyDinner from '@/assets/memories/family-dinner.jpg';
import gardenMorning from '@/assets/memories/garden-morning.jpg';
import beachGrandkids from '@/assets/memories/beach-grandkids.jpg';
import birthdayCelebration from '@/assets/memories/birthday-celebration.jpg';
import morningTea from '@/assets/memories/morning-tea.jpg';
import parkPicnic from '@/assets/memories/park-picnic.jpg';

// ── AI-Curated Memory Data ──
const aiCuratedMemories = [
{
  id: 'ai-1',
  image: familyDinner,
  title: 'Family Dinner — Last Christmas',
  subtitle: 'With Sarah, John & grandchildren',
  date: 'Dec 25, 2024',
  location: 'Home, Hyderabad',
  category: 'family',
  aiInsight: 'You smiled 12 times during this dinner.',
  people: ['Sarah', 'John', 'Emma', 'Liam'],
  recallStrength: 85
},
{
  id: 'ai-2',
  image: gardenMorning,
  title: 'Morning Walk in the Garden',
  subtitle: 'Your daily peaceful routine',
  date: 'Feb 14, 2025',
  location: 'Lakshmi Nagar Park',
  category: 'places',
  aiInsight: 'You visit this garden 5 times a week.',
  people: [],
  recallStrength: 92
},
{
  id: 'ai-3',
  image: beachGrandkids,
  title: 'Beach Day with Grandchildren',
  subtitle: 'Emma & Liam building sandcastles',
  date: 'Jul 15, 2024',
  location: 'Visakhapatnam Beach',
  category: 'family',
  aiInsight: "Emma's first time at the beach.",
  people: ['Emma', 'Liam'],
  recallStrength: 78
},
{
  id: 'ai-4',
  image: birthdayCelebration,
  title: 'Your 72nd Birthday',
  subtitle: 'Surprise party by the family',
  date: 'Mar 8, 2024',
  location: 'Home, Hyderabad',
  category: 'celebration',
  aiInsight: '23 family members attended.',
  people: ['Sarah', 'John', 'Dr. Smith', 'Maria'],
  recallStrength: 88
},
{
  id: 'ai-5',
  image: morningTea,
  title: 'Morning Tea on the Porch',
  subtitle: 'Your favourite quiet moment',
  date: 'Today',
  location: 'Home',
  category: 'daily',
  aiInsight: "You've had morning tea every day for 30 years.",
  people: [],
  recallStrength: 98
},
{
  id: 'ai-6',
  image: parkPicnic,
  title: 'Family Picnic at the Park',
  subtitle: 'Summer outing with everyone',
  date: 'Jun 2, 2024',
  location: 'KBR National Park',
  category: 'family',
  aiInsight: 'Liam learned to ride a bicycle that day.',
  people: ['Sarah', 'John', 'Emma', 'Liam'],
  recallStrength: 82
}];


const categories = [
{ id: 'all', label: 'For You' },
{ id: 'family', label: 'Family' },
{ id: 'places', label: 'Places' },
{ id: 'celebration', label: 'Events' },
{ id: 'daily', label: 'Daily' }];


export default function MemoriesScreen() {
  const { mode } = useApp();
  const [activeSource, setActiveSource] = useState<'ai' | 'caregiver'>('ai');
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['ai-1', 'ai-4']));
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiSyncing, setAiSyncing] = useState(false);

  // Fetch caregiver-shared memories from DB
  const { data: caregiverMemories = [] } = useQuery({
    queryKey: ['shared-memories'],
    queryFn: async () => {
      const { data, error } = await supabase.
      from('memories').
      select('*').
      not('shared_by', 'is', null).
      order('shared_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000
  });

  const filteredMemories = activeCategory === 'all' ?
  aiCuratedMemories :
  aiCuratedMemories.filter((m) => m.category === activeCategory);

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const simulateSync = () => {
    setAiSyncing(true);
    setTimeout(() => setAiSyncing(false), 2500);
  };

  // Slideshow timer
  useEffect(() => {
    if (!isPlaying || !slideshowActive) return;
    const interval = setInterval(() => {
      setSlideshowIndex((p) => (p + 1) % filteredMemories.length);
    }, mode === 'essential' ? 10000 : 5000);
    return () => clearInterval(interval);
  }, [isPlaying, slideshowActive, filteredMemories.length, mode]);

  // ── Essential Mode ──
  if (mode === 'essential') {
    const mem = aiCuratedMemories[slideshowIndex % aiCuratedMemories.length];
    return (
      <div className="h-full relative flex items-center justify-center bg-background">
        <AnimatePresence mode="wait">
          <motion.div key={slideshowIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
          className="absolute inset-4 rounded-2xl overflow-hidden">
            <img src={mem.image} alt={mem.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-[28px] font-bold text-white leading-snug">{mem.title}</p>
              <p className="text-[20px] text-white/70 mt-2 font-medium">{mem.date}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>);

  }

  // ── Simplified Mode ──
  if (mode === 'simplified') {
    const mem = aiCuratedMemories[slideshowIndex % aiCuratedMemories.length];
    return (
      <div className="h-full bg-background flex flex-col relative">
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={slideshowIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="absolute inset-5 rounded-2xl overflow-hidden">
              <img src={mem.image} alt={mem.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <p className="text-[24px] font-bold text-white leading-snug">{mem.title}</p>
                <p className="text-[16px] text-white/70 mt-2 font-medium">{mem.subtitle}</p>
                <p className="text-[14px] text-white/50 mt-1 font-medium">{mem.date}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-4 px-6 pb-6 pt-4 relative z-10">
          <button onClick={() => setSlideshowIndex((p) => (p - 1 + aiCuratedMemories.length) % aiCuratedMemories.length)} className="w-16 h-16 ios-card flex items-center justify-center touch-target-xl" aria-label="Previous">
            <ChevronLeft className="w-8 h-8 text-foreground" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center touch-target-xl" aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
          </button>
          <button onClick={() => toggleFav(mem.id)} className="w-16 h-16 ios-card flex items-center justify-center touch-target-xl" aria-label="Favorite">
            <Heart className={`w-7 h-7 ${favorites.has(mem.id) ? 'text-muted-foreground fill-muted-foreground' : 'text-muted-foreground'}`} />
          </button>
          <button onClick={() => setSlideshowIndex((p) => (p + 1) % aiCuratedMemories.length)} className="w-16 h-16 ios-card flex items-center justify-center touch-target-xl" aria-label="Next">
            <ChevronRight className="w-8 h-8 text-foreground" />
          </button>
        </div>
      </div>);

  }

  // ── Full Mode — Slideshow Overlay ──
  if (slideshowActive) {
    const mem = filteredMemories[slideshowIndex % filteredMemories.length];
    return (
      <div className="h-full bg-black flex flex-col relative overflow-hidden">
        <div className="relative z-10 px-4 pt-4 flex items-center justify-between shrink-0">
          <button onClick={() => setSlideshowActive(false)} className="text-white/80 text-ios-callout font-semibold flex items-center gap-1">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          <span className="text-[12px] font-semibold text-white/60">
            {slideshowIndex + 1}/{filteredMemories.length}
          </span>
        </div>
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={slideshowIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            className="absolute inset-4 rounded-2xl overflow-hidden">
              {mem &&
              <>
                  <img src={mem.image} alt={mem.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-[22px] font-bold text-white leading-snug">{mem.title}</p>
                    <p className="text-[14px] text-white/60 mt-1 font-medium flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> {mem.date} · {mem.location}
                    </p>
                  </div>
                  <button onClick={() => toggleFav(mem.id)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center">
                    <Heart className={`w-5 h-5 ${favorites.has(mem.id) ? 'text-white/70 fill-white/70' : 'text-white/70'}`} />
                  </button>
                </>
              }
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-4 px-6 pb-6 pt-3 relative z-10 shrink-0">
          <button onClick={() => setSlideshowIndex((p) => (p - 1 + filteredMemories.length) % filteredMemories.length)} className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-white/80" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>
          <button onClick={() => setSlideshowIndex((p) => (p + 1) % filteredMemories.length)} className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-white/80" />
          </button>
        </div>
      </div>);

  }

  // ── Full Mode — Main View ──
  return (
    <div className="h-full overflow-y-auto ios-grouped-bg pb-6 relative">
      <div className="relative z-10">
        {/* iOS Large Title with trailing + */}
        <div className="px-4 pt-4 pb-1">
          <div className="flex items-center justify-between">
            <h1 className="text-ios-large-title text-foreground">Memories</h1>
            <div className="flex items-center gap-2">
              <button onClick={simulateSync} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center touch-target">
                <RefreshCw className={`w-4 h-4 text-muted-foreground ${aiSyncing ? 'animate-spin' : ''}`} />
              </button>
              <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center touch-target text-black">
                <Plus className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          <p className="text-ios-subheadline text-muted-foreground mt-1">{aiCuratedMemories.length} memories · AI curated</p>
        </div>

        {/* Source Toggle — iOS segmented control */}
        <div className="mx-4 mt-3">
          <SegmentedControl
            value={activeSource}
            onChange={(v) => setActiveSource(v as 'ai' | 'caregiver')}
            items={[
            { value: 'ai', icon: <Brain className="w-3.5 h-3.5" />, label: 'AI Curated' },
            {
              value: 'caregiver',
              icon: <UserCheck className="w-3.5 h-3.5" />,
              label: 'From Caregiver',
              badge: caregiverMemories.some((m: any) => !m.viewed_by_patient) ?
              <span className="w-2 h-2 rounded-full bg-destructive absolute top-1 right-3" /> :
              undefined
            }]
            } />

        </div>

        {/* AI Syncing Banner */}
        <AnimatePresence>
          {aiSyncing &&
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mx-4 mt-3">
              <div className="ios-card px-4 py-3 flex items-center gap-3">
                <Brain className="w-4 h-4 text-muted-foreground animate-pulse" />
                <div className="flex-1">
                  <p className="text-ios-footnote font-semibold text-foreground">Analyzing your photos...</p>
                  <p className="text-ios-caption2 text-muted-foreground">Scanning Google Photos & Gallery</p>
                </div>
                <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* ── AI Curated View ── */}
        {activeSource === 'ai' &&
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            {/* Slideshow CTA */}
            <div className="px-4 mt-3">
              <div className="ios-card overflow-hidden">
                <button
                onClick={() => {setSlideshowActive(true);setIsPlaying(true);setSlideshowIndex(0);}}
                className="w-full flex items-center gap-3 px-4 text-left touch-target"
                style={{ minHeight: 56 }}>

                  <IconBox Icon={Play} color={iosColors.purple} size={40} iconSize={20} />
                  <div className="flex-1">
                    <p className="text-ios-callout font-medium text-foreground">Play Memory Slideshow</p>
                    <p className="text-ios-footnote text-muted-foreground">{filteredMemories.length} memories</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                </button>
              </div>
            </div>

            {/* Category Segmented Control */}
            <div className="px-4 mt-3">
              <SegmentedControl
              value={activeCategory}
              onChange={setActiveCategory}
              scrollable
              items={categories.map((cat) => ({ value: cat.id, label: cat.label }))} />

            </div>

            {/* AI Memory Pick */}
            <div className="mt-5">
              <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Today's AI Pick</p>
              <div className="mx-4 ios-card overflow-hidden">
                <div className="flex items-center gap-3 px-4" style={{ minHeight: 56 }}>
                  <img src={aiCuratedMemories[4].image} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-ios-callout font-medium text-foreground">{aiCuratedMemories[4].title}</p>
                    <p className="text-ios-footnote text-muted-foreground">{aiCuratedMemories[4].subtitle}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                </div>
              </div>
            </div>

            {/* Memory List — Apple Health grouped style */}
            <div className="mt-5">
              <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">
                {activeCategory === 'all' ? 'Curated For You' : categories.find((c) => c.id === activeCategory)?.label}
              </p>
              <div className="px-4">
                <div className="ios-card overflow-hidden divide-y divide-border/30">
                  {filteredMemories.map((mem) =>
                <button
                  key={mem.id}
                  className="w-full flex items-center gap-3 px-4 text-left touch-target"
                  style={{ minHeight: 64 }}>

                      <img src={mem.image} alt={mem.title} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-ios-callout font-medium text-foreground line-clamp-1">{mem.title}</p>
                        <p className="text-ios-footnote text-muted-foreground mt-0.5">{mem.date} · {mem.location}</p>
                      </div>
                      {favorites.has(mem.id) &&
                  <Heart className="w-4 h-4 text-muted-foreground shrink-0" />
                  }
                      <ChevronRight className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                    </button>
                )}
                </div>
              </div>
            </div>
          </motion.div>
        }

        {/* ── Caregiver Memories View ── */}
        {activeSource === 'caregiver' &&
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="mt-5">
              <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">From Your Care Circle</p>

              {caregiverMemories.length === 0 ?
            <div className="mx-4 ios-card p-10 text-center">
                  <Heart className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-ios-callout font-semibold text-muted-foreground">No memories yet</p>
                  <p className="text-ios-footnote text-muted-foreground/70 mt-1">Your caregivers will share memories here</p>
                </div> :

            <div className="mx-4 ios-card overflow-hidden divide-y divide-border/30">
                  {caregiverMemories.map((mem: any) =>
              <div key={mem.id} className="px-4" style={{ minHeight: 64 }}>
                      <div className="flex items-center gap-3 py-3">
                        {mem.photo_url ?
                  <img src={mem.photo_url} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" /> :

                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
                            <UserCheck className="w-5 h-5 text-muted-foreground" />
                          </div>
                  }
                        <div className="flex-1 min-w-0">
                          <p className="text-ios-callout font-medium text-foreground">{mem.title}</p>
                          <p className="text-ios-footnote text-muted-foreground">
                            {mem.shared_by} · {mem.shared_at ? new Date(mem.shared_at).toLocaleDateString() : ''}
                          </p>
                        </div>
                        {!mem.viewed_by_patient &&
                  <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                  }
                        <ChevronRight className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                      </div>
                    </div>
              )}
                </div>
            }
            </div>
          </motion.div>
        }
      </div>
    </div>);

}