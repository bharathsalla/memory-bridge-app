import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Mic, Heart, Calendar, ChevronRight, Clock } from 'lucide-react';

interface MemoryEntry {
  id: string;
  type: 'photo' | 'voice' | 'note';
  title: string;
  description: string;
  emoji: string;
  time: string;
  date: string;
  mood?: string;
  isFavorite: boolean;
}

const sampleMemories: MemoryEntry[] = [
  { id: '1', type: 'photo', title: 'Morning garden walk', description: 'Beautiful roses blooming in the backyard. Sarah helped water the plants.', emoji: '🌹', time: '9:15 AM', date: 'Today', mood: '😊', isFavorite: true },
  { id: '2', type: 'voice', title: 'Called John', description: 'Had a lovely chat with John about his new job. He sounds happy.', emoji: '📞', time: '11:00 AM', date: 'Today', mood: '😊', isFavorite: false },
  { id: '3', type: 'note', title: 'Lunch with Sarah', description: 'Sarah made my favorite soup. We looked at old family photos together.', emoji: '🍲', time: '1:00 PM', date: 'Yesterday', mood: '😊', isFavorite: true },
  { id: '4', type: 'photo', title: 'Grandchildren visited', description: 'Emma and Liam came after school. We played cards and had cookies.', emoji: '🃏', time: '4:30 PM', date: 'Yesterday', mood: '😊', isFavorite: true },
  { id: '5', type: 'voice', title: 'Listened to music', description: 'Played old Frank Sinatra records. Remembered dancing with Harold.', emoji: '🎵', time: '7:00 PM', date: '2 days ago', mood: '😐', isFavorite: false },
  { id: '6', type: 'photo', title: 'Doctor appointment went well', description: 'Dr. Smith said blood pressure is good. Feeling relieved and positive.', emoji: '🏥', time: '10:00 AM', date: '3 days ago', mood: '😊', isFavorite: false },
];

export default function MemoryLaneScreen() {
  const [memories, setMemories] = useState(sampleMemories);
  const [selectedMemory, setSelectedMemory] = useState<MemoryEntry | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const toggleFavorite = (id: string) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m));
  };

  const groupedByDate = memories.reduce<Record<string, MemoryEntry[]>>((acc, m) => {
    if (!acc[m.date]) acc[m.date] = [];
    acc[m.date].push(m);
    return acc;
  }, {});

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Header */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-[22px] font-extrabold text-foreground">Memory Lane</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">Your daily journal & timeline</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-primary bg-primary/8 px-2.5 py-1 rounded-full">
              {memories.length} memories
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-5 pb-20">
        {Object.entries(groupedByDate).map(([date, entries]) => (
          <div key={date} className="mb-5">
            <div className="flex items-center gap-2 mb-2.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-[13px] font-bold text-primary">{date}</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>
            <div className="space-y-2.5 ml-1">
              {entries.map((memory, i) => (
                <motion.button
                  key={memory.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedMemory(memory)}
                  className="w-full flex gap-3 text-left group"
                >
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center pt-1">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${
                      memory.type === 'photo' ? 'bg-primary' : memory.type === 'voice' ? 'bg-secondary' : 'bg-accent'
                    }`} />
                    {i < entries.length - 1 && <div className="w-0.5 flex-1 bg-border/40 mt-1" />}
                  </div>
                  {/* Card */}
                  <div className="flex-1 ios-card-elevated p-3.5 mb-0 active:scale-[0.98] transition-transform">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0">
                        <span className="text-[22px]">{memory.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] font-bold text-foreground">{memory.title}</span>
                          {memory.mood && <span className="text-[14px]">{memory.mood}</span>}
                        </div>
                        <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{memory.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Clock className="w-3 h-3 text-muted-foreground/60" />
                          <span className="text-[11px] text-muted-foreground">{memory.time}</span>
                          {memory.isFavorite && <Heart className="w-3 h-3 text-rose fill-rose ml-auto" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Memory FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setShowAdd(true)}
        className="absolute bottom-5 right-5 w-[52px] h-[52px] rounded-2xl bg-primary text-primary-foreground flex items-center justify-center z-30 shadow-lg active:scale-90 transition-transform"
        aria-label="Add memory"
      >
        <Plus className="w-5 h-5" />
      </motion.button>

      {/* Add Memory Sheet */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-5 pb-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-5" />
              <h3 className="text-[18px] font-bold text-foreground mb-4 text-center">Add a Memory</h3>
              <div className="space-y-2.5">
                {[
                  { icon: Camera, label: 'Take a Photo', desc: 'Capture this moment', color: 'text-primary', bg: 'bg-primary/8' },
                  { icon: Mic, label: 'Record a Voice Note', desc: 'Tell us about your day', color: 'text-secondary', bg: 'bg-secondary/8' },
                  { icon: Heart, label: 'Write a Note', desc: 'Jot down a thought or feeling', color: 'text-rose', bg: 'bg-rose/8' },
                ].map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setShowAdd(false)}
                      className="w-full ios-card-elevated p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${opt.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-6 h-6 ${opt.color}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-[15px] font-bold text-foreground">{opt.label}</div>
                        <div className="text-[12px] text-muted-foreground mt-0.5">{opt.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Detail */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center px-5"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-card rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-border/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-[36px]">{selectedMemory.emoji}</span>
                </div>
                <h3 className="text-[18px] font-bold text-foreground">{selectedMemory.title}</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-[12px] text-muted-foreground">{selectedMemory.date} · {selectedMemory.time}</span>
                  {selectedMemory.mood && <span className="text-[16px]">{selectedMemory.mood}</span>}
                </div>
                <p className="text-[14px] text-muted-foreground mt-4 leading-relaxed">{selectedMemory.description}</p>
              </div>
              <div className="px-5 pb-5 flex gap-2.5">
                <button
                  onClick={() => { toggleFavorite(selectedMemory.id); setSelectedMemory(null); }}
                  className="flex-1 h-11 rounded-2xl bg-rose/10 text-rose text-[14px] font-bold flex items-center justify-center gap-2"
                >
                  <Heart className={`w-4 h-4 ${selectedMemory.isFavorite ? 'fill-rose' : ''}`} />
                  {selectedMemory.isFavorite ? 'Unfavorite' : 'Favorite'}
                </button>
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="flex-1 h-11 rounded-2xl bg-muted/50 text-muted-foreground text-[14px] font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
