import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, Pause, Play, Sparkles, Clock, Star, BookOpen, Users, MapPin, Phone, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const photos = [
  { id: '1', caption: 'Family picnic in the park', date: 'June 2023', emoji: '🌳', category: 'family', bg: 'bg-primary/8' },
  { id: '2', caption: 'Birthday celebration', date: 'March 2023', emoji: '🎂', category: 'celebration', bg: 'bg-secondary/8' },
  { id: '3', caption: 'Garden flowers', date: 'August 2023', emoji: '🌺', category: 'places', bg: 'bg-accent/8' },
  { id: '4', caption: 'Holiday dinner with family', date: 'December 2022', emoji: '🎄', category: 'family', bg: 'bg-destructive/6' },
  { id: '5', caption: 'Grandchildren at the beach', date: 'July 2023', emoji: '🏖️', category: 'family', bg: 'bg-primary/8' },
  { id: '6', caption: 'Morning walk', date: 'September 2023', emoji: '🌅', category: 'places', bg: 'bg-accent/6' },
  { id: '7', caption: 'Phone call with Sarah', date: 'October 2023', emoji: '📞', category: 'calls', bg: 'bg-secondary/8' },
  { id: '8', caption: 'Doctor visit with John', date: 'November 2023', emoji: '🏥', category: 'people', bg: 'bg-muted' },
];

const categories = [
  { id: 'all', label: 'All', icon: <Sparkles className="w-4 h-4" />, count: 8 },
  { id: 'family', label: 'Family', icon: <Users className="w-4 h-4" />, count: 3 },
  { id: 'places', label: 'Places', icon: <MapPin className="w-4 h-4" />, count: 2 },
  { id: 'celebration', label: 'Events', icon: <Star className="w-4 h-4" />, count: 1 },
  { id: 'calls', label: 'Calls', icon: <Phone className="w-4 h-4" />, count: 1 },
  { id: 'people', label: 'People', icon: <BookOpen className="w-4 h-4" />, count: 1 },
];

export default function MemoriesScreen() {
  const { mode } = useApp();
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isPlaying, setIsPlaying] = useState(mode !== 'full');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['1', '4']));
  const [activeCategory, setActiveCategory] = useState('all');
  const [showSlideshow, setShowSlideshow] = useState(false);

  const filteredPhotos = activeCategory === 'all' ? photos : photos.filter(p => p.category === activeCategory);

  useEffect(() => {
    if (!isPlaying || !showSlideshow) return;
    const interval = setInterval(() => {
      setCurrentPhoto(p => (p + 1) % filteredPhotos.length);
    }, mode === 'essential' ? 10000 : 5000);
    return () => clearInterval(interval);
  }, [isPlaying, mode, showSlideshow, filteredPhotos.length]);

  const toggleFav = (id: string) => {
    setFavorites(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  // ── Essential Mode ──
  if (mode === 'essential') {
    return (
      <div className="h-full relative flex items-center justify-center bg-background">
        <div className="absolute inset-0 lavender-shimmer" />
        <AnimatePresence mode="wait">
          <motion.div key={currentPhoto} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            className="absolute inset-5 ios-card-elevated flex items-center justify-center">
            <div className="text-center px-10">
              <span className="text-[90px] mb-6 block">{photos[currentPhoto].emoji}</span>
              <p className="text-[30px] font-bold text-foreground leading-snug">{photos[currentPhoto].caption}</p>
              <p className="text-[22px] text-muted-foreground mt-4 font-medium">{photos[currentPhoto].date}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── Simplified Mode ──
  if (mode === 'simplified') {
    return (
      <div className="h-full bg-background flex flex-col relative">
        <div className="absolute inset-0 rose-glow" />
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={currentPhoto} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }}
              className="absolute inset-6 ios-card-elevated flex flex-col items-center justify-center p-10">
              <span className="text-[80px] mb-6">{photos[currentPhoto].emoji}</span>
              <p className="text-[26px] font-bold text-foreground text-center leading-snug">{photos[currentPhoto].caption}</p>
              <p className="text-[20px] text-muted-foreground mt-4 font-medium">{photos[currentPhoto].date}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-4 px-6 pb-6 pt-4 relative z-10">
          <button onClick={() => setCurrentPhoto(p => (p - 1 + photos.length) % photos.length)} className="w-16 h-16 ios-card-elevated flex items-center justify-center active:scale-95 transition-transform touch-target-xl" aria-label="Previous">
            <ChevronLeft className="w-8 h-8 text-foreground" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="gradient-primary text-primary-foreground rounded-full flex items-center justify-center active:scale-95 transition-transform touch-target-xl shadow-lg" style={{ width: 72, height: 72 }} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-0.5" />}
          </button>
          <button onClick={() => toggleFav(photos[currentPhoto].id)} className="w-16 h-16 ios-card-elevated flex items-center justify-center active:scale-95 transition-transform touch-target-xl" aria-label="Favorite">
            <Heart className={`w-8 h-8 ${favorites.has(photos[currentPhoto].id) ? 'text-secondary fill-secondary' : 'text-foreground'}`} />
          </button>
          <button onClick={() => setCurrentPhoto(p => (p + 1) % photos.length)} className="w-16 h-16 ios-card-elevated flex items-center justify-center active:scale-95 transition-transform touch-target-xl" aria-label="Next">
            <ChevronRight className="w-8 h-8 text-foreground" />
          </button>
        </div>
      </div>
    );
  }

  // ── Full Mode — Enhanced Memories ──

  // Slideshow overlay
  if (showSlideshow) {
    return (
      <div className="h-full bg-background flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-accent/5" />
        <div className="relative z-10 px-5 pt-5 flex items-center justify-between shrink-0">
          <Button variant="outline" size="sm" onClick={() => setShowSlideshow(false)} className="rounded-xl font-bold">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Badge variant="secondary" className="text-[12px] font-bold bg-primary/10 text-primary rounded-full px-3">
            {currentPhoto + 1}/{filteredPhotos.length}
          </Badge>
        </div>
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhoto}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-6 bg-card rounded-3xl border border-border/60 shadow-xl flex flex-col items-center justify-center p-8"
            >
              <span className="text-[100px] mb-6">{filteredPhotos[currentPhoto]?.emoji}</span>
              <p className="text-[24px] font-extrabold text-foreground text-center leading-snug">{filteredPhotos[currentPhoto]?.caption}</p>
              <p className="text-[16px] text-muted-foreground mt-3 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" /> {filteredPhotos[currentPhoto]?.date}
              </p>
              {filteredPhotos[currentPhoto] && (
                <button
                  onClick={() => toggleFav(filteredPhotos[currentPhoto].id)}
                  className="mt-5 w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Heart className={`w-6 h-6 transition-colors ${favorites.has(filteredPhotos[currentPhoto].id) ? 'text-secondary fill-secondary' : 'text-muted-foreground'}`} />
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-4 px-6 pb-6 pt-3 relative z-10 shrink-0">
          <button onClick={() => setCurrentPhoto(p => (p - 1 + filteredPhotos.length) % filteredPhotos.length)} className="w-14 h-14 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-center active:scale-95 transition-transform">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform shadow-lg">
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
          </button>
          <button onClick={() => setCurrentPhoto(p => (p + 1) % filteredPhotos.length)} className="w-14 h-14 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-center active:scale-95 transition-transform">
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background pb-6 relative">
      <div className="absolute inset-0 warm-glow" />
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary via-primary to-accent px-5 pt-5 pb-6 rounded-b-[28px] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-foreground/5" />
          <h1 className="text-[24px] font-extrabold text-primary-foreground">🧠 Memories</h1>
          <p className="text-[14px] text-primary-foreground/60 font-medium mt-1">{photos.length} memories · {favorites.size} favorites</p>

          {/* Slideshow CTA */}
          <Button
            onClick={() => { setShowSlideshow(true); setIsPlaying(true); setCurrentPhoto(0); }}
            size="lg"
            className="w-full mt-4 h-13 rounded-2xl text-[15px] font-bold gap-2 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 border-0"
          >
            <Play className="w-5 h-5" />
            Play Memory Slideshow
          </Button>
        </div>

        {/* Category Pills */}
        <div className="px-5 mt-5">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 h-11 shrink-0 rounded-xl text-[14px] font-bold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card border border-border/60 text-foreground hover:bg-muted/50'
                }`}
              >
                {cat.icon}
                {cat.label}
                <span className={`text-[11px] font-bold ${activeCategory === cat.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* "This Week" Highlight */}
        <div className="px-5 mt-5">
          <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-2xl border border-accent/20 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-foreground">Memory of the Day</p>
                <p className="text-[12px] text-muted-foreground font-medium">A special moment to revisit</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border/40">
              <span className="text-[48px]">{photos[0].emoji}</span>
              <div className="flex-1">
                <p className="text-[16px] font-bold text-foreground">{photos[0].caption}</p>
                <p className="text-[13px] text-muted-foreground mt-1 font-medium">{photos[0].date}</p>
              </div>
              <Heart className={`w-6 h-6 shrink-0 ${favorites.has(photos[0].id) ? 'text-secondary fill-secondary' : 'text-muted-foreground/30'}`} />
            </div>
          </div>
        </div>

        {/* Memory Grid */}
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-extrabold text-foreground">
              {activeCategory === 'all' ? 'All Memories' : categories.find(c => c.id === activeCategory)?.label}
            </h2>
            <Badge variant="secondary" className="text-[12px] font-bold bg-muted text-muted-foreground rounded-full px-3">
              {filteredPhotos.length}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filteredPhotos.map((photo, i) => (
              <motion.button
                key={photo.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { setCurrentPhoto(i); setShowSlideshow(true); setIsPlaying(false); }}
                className="relative bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden active:scale-[0.97] transition-transform text-left"
              >
                <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10">
                  <span className="text-[52px]">{photo.emoji}</span>
                </div>
                <div className="p-3.5">
                  <p className="text-[14px] font-bold text-foreground line-clamp-2 leading-snug">{photo.caption}</p>
                  <p className="text-[12px] text-muted-foreground mt-1.5 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {photo.date}
                  </p>
                </div>
                {favorites.has(photo.id) && (
                  <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
                    <Heart className="w-4 h-4 text-secondary fill-secondary" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Add Memory CTA */}
        <div className="px-5 mt-6 mb-4">
          <Button variant="outline" size="lg" className="w-full h-14 rounded-2xl text-[15px] font-bold gap-2 border-dashed border-2">
            <Camera className="w-5 h-5" />
            Add New Memory
          </Button>
        </div>
      </div>
    </div>
  );
}
