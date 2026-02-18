import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ChevronLeft, ChevronRight, Pause, Play, Sparkles, Clock,
  Star, Users, MapPin, Brain, Camera, Wand2, UserCheck, ChevronDown,
  Calendar, Sun, RefreshCw, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
    aiInsight: 'You smiled 12 times during this dinner. Your grandchildren were your biggest joy that evening.',
    source: 'Google Photos',
    people: ['Sarah', 'John', 'Emma', 'Liam'],
    mood: '😊',
    recallStrength: 85,
  },
  {
    id: 'ai-2',
    image: gardenMorning,
    title: 'Morning Walk in the Garden',
    subtitle: 'Your daily peaceful routine',
    date: 'Feb 14, 2025',
    location: 'Lakshmi Nagar Park',
    category: 'places',
    aiInsight: 'You visit this garden 5 times a week. The tulips you planted last spring are blooming beautifully.',
    source: 'Phone Gallery',
    people: [],
    mood: '🌸',
    recallStrength: 92,
  },
  {
    id: 'ai-3',
    image: beachGrandkids,
    title: 'Beach Day with Grandchildren',
    subtitle: 'Emma & Liam building sandcastles',
    date: 'Jul 15, 2024',
    location: 'Visakhapatnam Beach',
    category: 'family',
    aiInsight: 'This was Emma\'s first time at the beach. She kept asking you to tell the story about the seashells.',
    source: 'Google Photos',
    people: ['Emma', 'Liam'],
    mood: '🏖️',
    recallStrength: 78,
  },
  {
    id: 'ai-4',
    image: birthdayCelebration,
    title: 'Your 72nd Birthday',
    subtitle: 'Surprise party by the family',
    date: 'Mar 8, 2024',
    location: 'Home, Hyderabad',
    category: 'celebration',
    aiInsight: '23 family members attended. John flew in from Bangalore as a surprise. You were so happy you cried.',
    source: 'Google Photos',
    people: ['Sarah', 'John', 'Dr. Smith', 'Maria'],
    mood: '🎂',
    recallStrength: 88,
  },
  {
    id: 'ai-5',
    image: morningTea,
    title: 'Morning Tea on the Porch',
    subtitle: 'Your favourite quiet moment',
    date: 'Today',
    location: 'Home',
    category: 'daily',
    aiInsight: 'You\'ve had morning tea on the porch every day for 30 years. It\'s your most consistent and calming routine.',
    source: 'Phone Gallery',
    people: [],
    mood: '☕',
    recallStrength: 98,
  },
  {
    id: 'ai-6',
    image: parkPicnic,
    title: 'Family Picnic at the Park',
    subtitle: 'Summer outing with everyone',
    date: 'Jun 2, 2024',
    location: 'KBR National Park',
    category: 'family',
    aiInsight: 'Liam learned to ride a bicycle that day. You held his hand for the first try.',
    source: 'Google Photos',
    people: ['Sarah', 'John', 'Emma', 'Liam'],
    mood: '🌳',
    recallStrength: 82,
  },
];

const categories = [
  { id: 'all', label: 'For You' },
  { id: 'family', label: 'Family' },
  { id: 'places', label: 'Places' },
  { id: 'celebration', label: 'Events' },
  { id: 'daily', label: 'Daily' },
];

export default function MemoriesScreen() {
  const { mode } = useApp();
  const [activeSource, setActiveSource] = useState<'ai' | 'caregiver'>('ai');
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['ai-1', 'ai-4']));
  const [expandedMemory, setExpandedMemory] = useState<string | null>(null);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiSyncing, setAiSyncing] = useState(false);

  // Fetch caregiver-shared memories from DB
  const queryClient = useQueryClient();
  const { data: caregiverMemories = [] } = useQuery({
    queryKey: ['shared-memories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .not('shared_by', 'is', null)
        .order('shared_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // poll every 5s for live sync
  });

  const filteredMemories = activeCategory === 'all'
    ? aiCuratedMemories
    : aiCuratedMemories.filter(m => m.category === activeCategory);

  const toggleFav = (id: string) => {
    setFavorites(prev => {
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
      setSlideshowIndex(p => (p + 1) % filteredMemories.length);
    }, mode === 'essential' ? 10000 : 5000);
    return () => clearInterval(interval);
  }, [isPlaying, slideshowActive, filteredMemories.length, mode]);

  // ── Essential Mode ──
  if (mode === 'essential') {
    const mem = aiCuratedMemories[slideshowIndex % aiCuratedMemories.length];
    return (
      <div className="h-full relative flex items-center justify-center bg-background">
        <div className="absolute inset-0 lavender-shimmer" />
        <AnimatePresence mode="wait">
          <motion.div key={slideshowIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            className="absolute inset-4 rounded-3xl overflow-hidden shadow-xl">
            <img src={mem.image} alt={mem.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-[28px] font-extrabold text-white leading-snug font-display">{mem.title}</p>
              <p className="text-[20px] text-white/70 mt-2 font-medium">{mem.date}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── Simplified Mode ──
  if (mode === 'simplified') {
    const mem = aiCuratedMemories[slideshowIndex % aiCuratedMemories.length];
    return (
      <div className="h-full bg-background flex flex-col relative">
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={slideshowIndex} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }}
              className="absolute inset-5 rounded-3xl overflow-hidden shadow-xl">
              <img src={mem.image} alt={mem.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <p className="text-[24px] font-extrabold text-white leading-snug font-display">{mem.title}</p>
                <p className="text-[16px] text-white/70 mt-2 font-medium">{mem.subtitle}</p>
                <p className="text-[14px] text-white/50 mt-1 font-medium">{mem.date}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-4 px-6 pb-6 pt-4 relative z-10">
          <button onClick={() => setSlideshowIndex(p => (p - 1 + aiCuratedMemories.length) % aiCuratedMemories.length)} className="w-16 h-16 ios-card-elevated flex items-center justify-center active:scale-95 transition-transform touch-target-xl" aria-label="Previous">
            <ChevronLeft className="w-8 h-8 text-foreground" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="gradient-primary text-primary-foreground rounded-full flex items-center justify-center active:scale-95 transition-transform touch-target-xl shadow-lg" style={{ width: 72, height: 72 }} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-0.5" />}
          </button>
          <button onClick={() => toggleFav(mem.id)} className="w-16 h-16 ios-card-elevated flex items-center justify-center active:scale-95 transition-transform touch-target-xl" aria-label="Favorite">
            <Heart className={`w-8 h-8 ${favorites.has(mem.id) ? 'text-secondary fill-secondary' : 'text-foreground'}`} />
          </button>
          <button onClick={() => setSlideshowIndex(p => (p + 1) % aiCuratedMemories.length)} className="w-16 h-16 ios-card-elevated flex items-center justify-center active:scale-95 transition-transform touch-target-xl" aria-label="Next">
            <ChevronRight className="w-8 h-8 text-foreground" />
          </button>
        </div>
      </div>
    );
  }

  // ── Full Mode — Slideshow Overlay ──
  if (slideshowActive) {
    const mem = filteredMemories[slideshowIndex % filteredMemories.length];
    return (
      <div className="h-full bg-black flex flex-col relative overflow-hidden">
        <div className="relative z-10 px-4 pt-4 flex items-center justify-between shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setSlideshowActive(false)} className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl font-bold">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Badge className="text-[12px] font-bold bg-white/15 text-white/80 rounded-full px-3 border-0">
            {slideshowIndex + 1}/{filteredMemories.length}
          </Badge>
        </div>
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={slideshowIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.6 }}
              className="absolute inset-4 rounded-3xl overflow-hidden">
              {mem && (
                <>
                  <img src={mem.image} alt={mem.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-[22px] font-extrabold text-white leading-snug font-display">{mem.title}</p>
                    <p className="text-[14px] text-white/60 mt-1 font-medium flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> {mem.date} · {mem.location}
                    </p>
                    {mem.aiInsight && (
                      <div className="mt-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3">
                        <p className="text-[12px] text-white/50 font-bold flex items-center gap-1.5 mb-1">
                          <Brain className="w-3.5 h-3.5" /> AI Memory Insight
                        </p>
                        <p className="text-[13px] text-white/80 leading-relaxed">{mem.aiInsight}</p>
                      </div>
                    )}
                  </div>
                  <button onClick={() => toggleFav(mem.id)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <Heart className={`w-5 h-5 ${favorites.has(mem.id) ? 'text-secondary fill-secondary' : 'text-white/70'}`} />
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-4 px-6 pb-6 pt-3 relative z-10 shrink-0">
          <button onClick={() => setSlideshowIndex(p => (p - 1 + filteredMemories.length) % filteredMemories.length)} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5 text-white/80" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform shadow-lg">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>
          <button onClick={() => setSlideshowIndex(p => (p + 1) % filteredMemories.length)} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform">
            <ChevronRight className="w-5 h-5 text-white/80" />
          </button>
        </div>
      </div>
    );
  }

  // ── Full Mode — Main View ──
  return (
    <div className="h-full overflow-y-auto ios-grouped-bg pb-6 relative">
      <div className="relative z-10">
        {/* iOS Large Title */}
        <div className="px-4 pt-4 pb-1">
          <div className="flex items-center justify-between">
            <h1 className="text-ios-large-title text-foreground">Memories</h1>
            <button
              onClick={simulateSync}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center touch-target"
            >
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${aiSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-ios-subheadline text-muted-foreground mt-1">{aiCuratedMemories.length} memories · AI curated</p>
        </div>

        {/* Source Toggle — below header */}
        <div className="mx-4 mt-3">
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveSource('ai')}
              className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-[14px] font-bold transition-all ${
                activeSource === 'ai'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              <Brain className="w-4 h-4" /> AI Curated
            </button>
            <button
              onClick={() => setActiveSource('caregiver')}
              className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-[14px] font-bold transition-all relative ${
                activeSource === 'caregiver'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              <UserCheck className="w-4 h-4" /> From Caregiver
              {caregiverMemories.some((m: any) => !m.viewed_by_patient) && (
                <span className="w-2 h-2 rounded-full bg-secondary absolute top-1.5 right-4" />
              )}
            </button>
          </div>
        </div>

        {/* AI Syncing Banner */}
        <AnimatePresence>
          {aiSyncing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-5 mt-3"
            >
              <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-accent animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-foreground">AI is analyzing your photos...</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Scanning Google Photos & Gallery</p>
                </div>
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── AI Curated View ── */}
        {activeSource === 'ai' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* Slideshow CTA — Apple Health style row */}
            <div className="px-4 mt-4">
              <div className="ios-card overflow-hidden">
              <button
                onClick={() => { setSlideshowActive(true); setIsPlaying(true); setSlideshowIndex(0); }}
                className="w-full flex items-center gap-3 px-4 text-left touch-target"
                style={{ minHeight: 56 }}
              >
                <Play className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-ios-callout font-medium text-foreground">Play Memory Slideshow</p>
                  <p className="text-ios-footnote text-muted-foreground">{filteredMemories.length} memories · AI curated</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
              </button>
              </div>
            </div>

            {/* Category Segmented Control */}
            <div className="px-4 mt-4">
              <div className="ios-card p-1 flex gap-0.5 overflow-x-auto">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 h-8 shrink-0 rounded-lg text-[12px] font-semibold transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Memory Pick */}
            <div className="mt-6">
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
            <div className="mt-6">
              <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">
                {activeCategory === 'all' ? 'Curated For You' : categories.find(c => c.id === activeCategory)?.label}
              </p>
              <div className="px-4">
                <div className="ios-card overflow-hidden divide-y divide-border/30">
                {filteredMemories.map((mem) => (
                    <button
                      key={mem.id}
                      onClick={() => setExpandedMemory(expandedMemory === mem.id ? null : mem.id)}
                      className="w-full flex items-center gap-3 p-4 text-left touch-target"
                    >
                      <img src={mem.image} alt={mem.title} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-ios-callout font-semibold text-foreground line-clamp-1">{mem.title}</p>
                        <p className="text-ios-footnote text-muted-foreground mt-0.5">{mem.date} · {mem.location}</p>
                      </div>
                      {favorites.has(mem.id) && (
                        <Heart className="w-4 h-4 text-destructive fill-destructive shrink-0" />
                      )}
                      <ChevronRight className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                    </button>

                ))}
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* ── Caregiver Memories View ── */}
        {activeSource === 'caregiver' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="px-5 mt-5">
              <h2 className="text-[17px] font-extrabold text-foreground mb-1">From Your Care Circle</h2>
              <p className="text-[13px] text-muted-foreground font-medium mb-4">Memories shared by your family & caregivers</p>

              {caregiverMemories.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-[16px] font-bold text-muted-foreground">No memories yet</p>
                  <p className="text-[13px] text-muted-foreground/70 mt-1">Your caregivers will share memories here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {caregiverMemories.map((mem: any, i: number) => (
                    <motion.div key={mem.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                        {mem.photo_url && (
                          <img src={mem.photo_url} alt={mem.title} className="w-full h-44 object-cover" />
                        )}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserCheck className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-[13px] font-bold text-primary">{mem.shared_by}</span>
                            <span className="text-[11px] text-muted-foreground font-medium ml-auto">
                              {mem.shared_at ? new Date(mem.shared_at).toLocaleDateString() : ''}
                            </span>
                            {!mem.viewed_by_patient && (
                              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                            )}
                          </div>
                          <p className="text-[16px] font-bold text-foreground">{mem.title}</p>
                          {mem.shared_message && (
                            <p className="text-[14px] text-foreground/70 mt-1.5 leading-relaxed">{mem.shared_message}</p>
                          )}
                          {mem.location && (
                            <p className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {mem.location}
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="flex-1 h-9 rounded-xl text-[12px] font-bold">
                              <Heart className="w-3.5 h-3.5 mr-1" /> Love it
                            </Button>
                            <Button size="sm" className="flex-1 h-9 rounded-xl text-[12px] font-bold">
                              <Eye className="w-3.5 h-3.5 mr-1" /> View Full
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
