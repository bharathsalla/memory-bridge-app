import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const photos = [
  { id: '1', caption: 'Family picnic in the park', date: 'June 2023', emoji: '🌳', bg: 'bg-sage/8' },
  { id: '2', caption: 'Birthday celebration', date: 'March 2023', emoji: '🎂', bg: 'bg-secondary/8' },
  { id: '3', caption: 'Garden flowers', date: 'August 2023', emoji: '🌺', bg: 'bg-accent/8' },
  { id: '4', caption: 'Holiday dinner with family', date: 'December 2022', emoji: '🎄', bg: 'bg-destructive/6' },
  { id: '5', caption: 'Grandchildren at the beach', date: 'July 2023', emoji: '🏖️', bg: 'bg-primary/8' },
  { id: '6', caption: 'Morning walk', date: 'September 2023', emoji: '🌅', bg: 'bg-accent/6' },
];

export default function MemoriesScreen() {
  const { mode } = useApp();
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isPlaying, setIsPlaying] = useState(mode !== 'full');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['1', '4']));

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentPhoto(p => (p + 1) % photos.length);
    }, mode === 'essential' ? 10000 : 5000);
    return () => clearInterval(interval);
  }, [isPlaying, mode]);

  const toggleFav = (id: string) => {
    setFavorites(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  if (mode === 'essential') {
    return (
      <div className="h-full relative flex items-center justify-center bg-background">
        <AnimatePresence mode="wait">
          <motion.div key={currentPhoto} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            className="absolute inset-5 ios-card-elevated rounded-3xl flex items-center justify-center">
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

  if (mode === 'simplified') {
    return (
      <div className="h-full bg-background flex flex-col">
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={currentPhoto} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }}
              className="absolute inset-6 rounded-3xl ios-card-elevated flex flex-col items-center justify-center p-10">
              <span className="text-[80px] mb-6">{photos[currentPhoto].emoji}</span>
              <p className="text-[26px] font-bold text-foreground text-center leading-snug">{photos[currentPhoto].caption}</p>
              <p className="text-[20px] text-muted-foreground mt-4 font-medium">{photos[currentPhoto].date}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-4 px-6 pb-6 pt-4">
          <button onClick={() => setCurrentPhoto(p => (p - 1 + photos.length) % photos.length)} className="w-16 h-16 rounded-2xl ios-card-elevated flex items-center justify-center active:scale-95 transition-transform touch-target-xl" aria-label="Previous">
            <ChevronLeft className="w-8 h-8 text-foreground" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-18 h-18 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform touch-target-xl" style={{ width: 72, height: 72 }} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-0.5" />}
          </button>
          <button onClick={() => toggleFav(photos[currentPhoto].id)} className="w-16 h-16 rounded-2xl ios-card-elevated flex items-center justify-center active:scale-95 transition-transform touch-target-xl" aria-label="Favorite">
            <Heart className={`w-8 h-8 ${favorites.has(photos[currentPhoto].id) ? 'text-destructive fill-destructive' : 'text-foreground'}`} />
          </button>
          <button onClick={() => setCurrentPhoto(p => (p + 1) % photos.length)} className="w-16 h-16 rounded-2xl ios-card-elevated flex items-center justify-center active:scale-95 transition-transform touch-target-xl" aria-label="Next">
            <ChevronRight className="w-8 h-8 text-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background pb-6">
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-[26px] font-extrabold text-foreground">🧠 Memories</h1>
      </div>
      <div className="px-5 mt-1">
        <div className="flex gap-3 overflow-x-auto pb-4">
          {['All', 'Favorites', 'Family', 'Holidays'].map((album, i) => (
            <button key={album} className={`px-6 h-12 rounded-full shrink-0 text-[16px] font-bold transition-colors touch-target ${
              i === 0 ? 'bg-primary text-primary-foreground' : 'ios-card-elevated text-foreground'
            }`}>{album}</button>
          ))}
        </div>
      </div>
      <div className="px-5">
        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo, i) => (
            <motion.button key={photo.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => { setCurrentPhoto(i); setIsPlaying(true); }}
              className="relative aspect-square rounded-2xl ios-card-elevated flex flex-col items-center justify-center p-5 active:scale-[0.97] transition-transform">
              <span className="text-[56px] mb-3">{photo.emoji}</span>
              <p className="text-[15px] font-bold text-foreground text-center line-clamp-2 leading-snug">{photo.caption}</p>
              <p className="text-[13px] text-muted-foreground mt-1.5 font-medium">{photo.date}</p>
              {favorites.has(photo.id) && <Heart className="absolute top-3.5 right-3.5 w-6 h-6 text-destructive fill-destructive" />}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
