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
  { id: 'all', label: 'For You', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'family', label: 'Family', icon: <Users className="w-4 h-4" /> },
  { id: 'places', label: 'Places', icon: <MapPin className="w-4 h-4" /> },
  { id: 'celebration', label: 'Events', icon: <Star className="w-4 h-4" /> },
  { id: 'daily', label: 'Daily', icon: <Sun className="w-4 h-4" /> },
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
        {/* Gradient Header — standardized like all other pages */}
        <div className="bg-gradient-to-br from-primary via-primary to-accent px-5 pt-5 pb-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-foreground/5" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-[20px] font-extrabold text-primary-foreground leading-tight font-display">Memories</h1>
                <p className="text-[13px] text-primary-foreground/60 font-medium">
                  {aiCuratedMemories.length} memories · AI curated daily
                </p>
              </div>
            </div>
            <button
              onClick={simulateSync}
              className="w-10 h-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center"
            >
              <RefreshCw className={`w-4.5 h-4.5 text-primary-foreground ${aiSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
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
            {/* Slideshow CTA */}
            <div className="px-5 mt-4">
              <button
                onClick={() => { setSlideshowActive(true); setIsPlaying(true); setSlideshowIndex(0); }}
                className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground shadow-lg active:scale-[0.97] transition-transform"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 animate-pulse" />
                <div className="relative flex items-center justify-center gap-3 py-5 px-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                    <Play className="w-7 h-7 ml-0.5" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[18px] font-extrabold leading-tight">Play Memory Slideshow</p>
                    <p className="text-[13px] font-medium text-primary-foreground/70 mt-0.5">{filteredMemories.length} memories · AI curated for you</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary-foreground/50" />
                </div>
              </button>
            </div>

            {/* Category Pills */}
            <div className="px-5 mt-4">
              <div className="flex bg-muted rounded-xl p-1 gap-1 overflow-x-auto scrollbar-hide">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 h-9 shrink-0 rounded-lg text-[12px] font-bold transition-all ${
                      activeCategory === cat.id
                        ? 'bg-card text-primary shadow-sm'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Insight Banner */}
            <div className="px-5 mt-4">
              <div className="bg-gradient-to-r from-accent/10 to-primary/5 rounded-2xl border border-accent/20 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                    <Wand2 className="w-4.5 h-4.5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-foreground">Today's AI Memory Pick</p>
                    <p className="text-[11px] text-muted-foreground font-medium">Based on your patterns & mood</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border/40">
                  <img src={aiCuratedMemories[4].image} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-foreground">{aiCuratedMemories[4].title}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 font-medium">{aiCuratedMemories[4].subtitle}</p>
                  </div>
                  <Heart className={`w-5 h-5 shrink-0 ${favorites.has(aiCuratedMemories[4].id) ? 'text-secondary fill-secondary' : 'text-muted-foreground/30'}`} />
                </div>
              </div>
            </div>

            {/* Memory Grid */}
            <div className="px-5 mt-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[17px] font-extrabold text-foreground">
                  {activeCategory === 'all' ? 'Curated For You' : categories.find(c => c.id === activeCategory)?.label}
                </h2>
                <Badge variant="secondary" className="text-[12px] font-bold bg-muted text-muted-foreground rounded-full px-3">
                  {filteredMemories.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {filteredMemories.map((mem, i) => (
                  <motion.div
                    key={mem.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <button
                      onClick={() => setExpandedMemory(expandedMemory === mem.id ? null : mem.id)}
                      className="w-full bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden active:scale-[0.98] transition-transform text-left"
                    >
                      <div className="flex">
                        <img src={mem.image} alt={mem.title} className="w-28 h-28 object-cover shrink-0" />
                        <div className="flex-1 p-3.5 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[15px] font-bold text-foreground leading-snug line-clamp-2">{mem.title}</p>
                              <p className="text-[12px] text-muted-foreground mt-1 font-medium">{mem.subtitle}</p>
                            </div>
                            {favorites.has(mem.id) && (
                              <Heart className="w-4 h-4 text-secondary fill-secondary shrink-0 mt-0.5" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {mem.date}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {mem.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded AI Insight */}
                      <AnimatePresence>
                        {expandedMemory === mem.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-1 border-t border-border/40">
                              <div className="flex items-start gap-2.5 mt-3">
                                <Brain className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[11px] font-bold text-accent">AI Insight</p>
                                  <p className="text-[13px] text-foreground/80 mt-0.5 leading-relaxed">{mem.aiInsight}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-3 flex-wrap">
                                {mem.people.length > 0 && (
                                  <Badge variant="outline" className="text-[10px] font-semibold rounded-full">
                                    <Users className="w-3 h-3 mr-1" /> {mem.people.join(', ')}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-[10px] font-semibold rounded-full">
                                  <Eye className="w-3 h-3 mr-1" /> {mem.recallStrength}% recall
                                </Badge>
                                <Badge variant="outline" className="text-[10px] font-semibold rounded-full text-muted-foreground">
                                  {mem.source}
                                </Badge>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" variant="outline" className="flex-1 h-9 rounded-xl text-[12px] font-bold" onClick={(e) => { e.stopPropagation(); toggleFav(mem.id); }}>
                                  <Heart className={`w-3.5 h-3.5 mr-1 ${favorites.has(mem.id) ? 'text-secondary fill-secondary' : ''}`} />
                                  {favorites.has(mem.id) ? 'Saved' : 'Save'}
                                </Button>
                                <Button size="sm" className="flex-1 h-9 rounded-xl text-[12px] font-bold" onClick={(e) => { e.stopPropagation(); setSlideshowIndex(i); setSlideshowActive(true); setIsPlaying(false); }}>
                                  <Play className="w-3.5 h-3.5 mr-1" /> View
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Source Info */}
            <div className="px-5 mt-5 mb-4">
              <div className="bg-muted/30 rounded-2xl p-4 border border-border/40">
                <p className="text-[12px] font-bold text-muted-foreground flex items-center gap-2 mb-2">
                  <Brain className="w-3.5 h-3.5" /> How AI Curates Your Memories
                </p>
                <div className="space-y-2">
                  {[
                    { icon: <Camera className="w-3.5 h-3.5" />, text: 'Scans Google Photos & phone gallery daily' },
                    { icon: <MapPin className="w-3.5 h-3.5" />, text: 'Extracts locations, faces & events' },
                    { icon: <Calendar className="w-3.5 h-3.5" />, text: 'Matches memories to dates & seasons' },
                    { icon: <Sparkles className="w-3.5 h-3.5" />, text: 'Predicts which memories boost your mood' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="text-muted-foreground">{item.icon}</span>
                      <p className="text-[12px] text-muted-foreground font-medium">{item.text}</p>
                    </div>
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
