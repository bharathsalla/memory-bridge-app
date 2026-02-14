import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const photos = [
  { id: '1', caption: 'Family picnic in the park', date: 'June 2023', emoji: '🌳', gradient: 'from-sage/20 to-primary/10' },
  { id: '2', caption: 'Birthday celebration', date: 'March 2023', emoji: '🎂', gradient: 'from-secondary/15 to-accent/10' },
  { id: '3', caption: 'Garden flowers', date: 'August 2023', emoji: '🌺', gradient: 'from-accent/15 to-sage/10' },
  { id: '4', caption: 'Holiday dinner with family', date: 'December 2022', emoji: '🎄', gradient: 'from-destructive/10 to-accent/10' },
  { id: '5', caption: 'Grandchildren at the beach', date: 'July 2023', emoji: '🏖️', gradient: 'from-primary/15 to-lavender/10' },
  { id: '6', caption: 'Morning walk', date: 'September 2023', emoji: '🌅', gradient: 'from-accent/15 to-primary/10' },
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
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Essential: passive display
  if (mode === 'essential') {
    return (
      <div className="h-full relative flex items-center justify-center bg-background">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhoto}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className={`absolute inset-0 bg-gradient-to-br ${photos[currentPhoto].gradient} flex items-center justify-center`}
          >
            <div className="text-center px-10">
              <span className="text-[80px] mb-6 block">{photos[currentPhoto].emoji}</span>
              <p className="text-[26px] font-semibold text-foreground leading-snug">{photos[currentPhoto].caption}</p>
              <p className="text-[18px] text-muted-foreground mt-3">{photos[currentPhoto].date}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Simplified: slideshow with large controls
  if (mode === 'simplified') {
    return (
      <div className="h-full bg-background flex flex-col">
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhoto}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-5 rounded-3xl bg-gradient-to-br ${photos[currentPhoto].gradient} flex flex-col items-center justify-center p-8`}
            >
              <span className="text-[72px] mb-6">{photos[currentPhoto].emoji}</span>
              <p className="text-[22px] font-semibold text-foreground text-center leading-snug">{photos[currentPhoto].caption}</p>
              <p className="text-[17px] text-muted-foreground mt-3">{photos[currentPhoto].date}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-4 px-6 pb-5 pt-3">
          <button
            onClick={() => setCurrentPhoto(p => (p - 1 + photos.length) % photos.length)}
            className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center active:scale-95 transition-transform touch-target-xl"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-7 h-7 text-foreground" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform touch-target-xl"
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
          </button>
          <button
            onClick={() => toggleFav(photos[currentPhoto].id)}
            className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center active:scale-95 transition-transform touch-target-xl"
            aria-label="Toggle favorite"
          >
            <Heart className={`w-7 h-7 ${favorites.has(photos[currentPhoto].id) ? 'text-destructive fill-destructive' : 'text-foreground'}`} />
          </button>
          <button
            onClick={() => setCurrentPhoto(p => (p + 1) % photos.length)}
            className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center active:scale-95 transition-transform touch-target-xl"
            aria-label="Next photo"
          >
            <ChevronRight className="w-7 h-7 text-foreground" />
          </button>
        </div>
      </div>
    );
  }

  // Full mode: grid view
  return (
    <div className="h-full overflow-y-auto warm-gradient pb-6">
      <div className="px-5 pt-4 pb-3">
        <h1 className="text-[28px] font-bold text-foreground">Memories</h1>
      </div>
      {/* Albums */}
      <div className="px-5 mt-1">
        <div className="flex gap-2 overflow-x-auto pb-3">
          {['All', 'Favorites', 'Family', 'Holidays'].map((album, i) => (
            <button
              key={album}
              className={`px-5 h-9 rounded-full shrink-0 text-[14px] font-medium transition-colors touch-target ${
                i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
              }`}
            >
              {album}
            </button>
          ))}
        </div>
      </div>
      {/* Photo Grid */}
      <div className="px-5 mt-1">
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo, i) => (
            <motion.button
              key={photo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => { setCurrentPhoto(i); setIsPlaying(true); }}
              className={`relative aspect-square rounded-2xl bg-gradient-to-br ${photo.gradient} flex flex-col items-center justify-center p-4 active:scale-[0.97] transition-transform`}
            >
              <span className="text-[44px] mb-2">{photo.emoji}</span>
              <p className="text-[12px] font-medium text-foreground text-center line-clamp-2 leading-snug">{photo.caption}</p>
              {favorites.has(photo.id) && (
                <Heart className="absolute top-3 right-3 w-5 h-5 text-destructive fill-destructive" />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
