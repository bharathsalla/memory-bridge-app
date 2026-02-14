import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const photos = [
  { id: '1', url: '', caption: 'Family picnic in the park', date: 'June 2023', gradient: 'from-primary/30 to-sage/30' },
  { id: '2', url: '', caption: 'Birthday celebration', date: 'March 2023', gradient: 'from-secondary/30 to-accent/30' },
  { id: '3', url: '', caption: 'Garden flowers', date: 'August 2023', gradient: 'from-sage/30 to-lavender/30' },
  { id: '4', url: '', caption: 'Holiday dinner with family', date: 'December 2022', gradient: 'from-accent/30 to-primary/30' },
  { id: '5', url: '', caption: 'Grandchildren at the beach', date: 'July 2023', gradient: 'from-lavender/30 to-secondary/30' },
  { id: '6', url: '', caption: 'Morning walk in the neighborhood', date: 'September 2023', gradient: 'from-primary/20 to-accent/20' },
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
      <div className="h-full bg-foreground relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhoto}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className={`absolute inset-0 bg-gradient-to-br ${photos[currentPhoto].gradient} flex items-center justify-center`}
          >
            <div className="text-center px-8">
              <span className="text-8xl mb-6 block">🖼️</span>
              <p className="text-[28px] font-semibold text-foreground">{photos[currentPhoto].caption}</p>
              <p className="text-[20px] text-muted-foreground mt-2">{photos[currentPhoto].date}</p>
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
              className={`absolute inset-4 rounded-3xl bg-gradient-to-br ${photos[currentPhoto].gradient} flex flex-col items-center justify-center p-8`}
            >
              <span className="text-8xl mb-6">🖼️</span>
              <p className="text-[24px] font-semibold text-foreground text-center">{photos[currentPhoto].caption}</p>
              <p className="text-[18px] text-muted-foreground mt-2">{photos[currentPhoto].date}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between px-8 pb-4 pt-4">
          <button
            onClick={() => setCurrentPhoto(p => (p - 1 + photos.length) % photos.length)}
            className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-8 h-8 text-foreground" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </button>
          <button
            onClick={() => toggleFav(photos[currentPhoto].id)}
            className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center active:scale-95 transition-transform"
          >
            <Heart className={`w-8 h-8 ${favorites.has(photos[currentPhoto].id) ? 'text-destructive fill-destructive' : 'text-foreground'}`} />
          </button>
          <button
            onClick={() => setCurrentPhoto(p => (p + 1) % photos.length)}
            className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronRight className="w-8 h-8 text-foreground" />
          </button>
        </div>
      </div>
    );
  }

  // Full mode: grid view
  return (
    <div className="h-full overflow-y-auto bg-surface pb-4">
      <div className="px-5 pt-3 pb-3 bg-background">
        <h1 className="text-ios-title text-foreground">Memories</h1>
      </div>
      {/* Albums */}
      <div className="px-5 mt-3">
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
          {['All', 'Favorites', 'Family', 'Holidays'].map((album, i) => (
            <button
              key={album}
              className={`px-5 h-9 rounded-full shrink-0 text-ios-subheadline font-medium transition-colors ${
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
              transition={{ delay: i * 0.05 }}
              onClick={() => { setCurrentPhoto(i); setIsPlaying(true); }}
              className={`relative aspect-square rounded-2xl bg-gradient-to-br ${photo.gradient} flex flex-col items-center justify-center p-4 active:scale-[0.97] transition-transform`}
            >
              <span className="text-5xl mb-2">🖼️</span>
              <p className="text-ios-footnote font-medium text-foreground text-center line-clamp-2">{photo.caption}</p>
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
