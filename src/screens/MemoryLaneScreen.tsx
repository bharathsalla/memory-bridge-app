import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Mic, Heart, Calendar, Clock, Sparkles, MessageCircle, ChevronRight, X, Send, BookOpen } from 'lucide-react';

export interface MemoryEntry {
  id: string;
  type: 'photo' | 'voice' | 'note';
  title: string;
  description: string;
  emoji: string;
  time: string;
  date: string;
  mood?: string;
  isFavorite: boolean;
  cognitivePrompt?: string;
  cognitiveAnswer?: string;
  voiceTranscript?: string;
  engagementScore?: number; // 0-100 based on interaction depth
}

const sampleMemories: MemoryEntry[] = [
  { id: '1', type: 'photo', title: 'Morning garden walk', description: 'Beautiful roses blooming in the backyard. Sarah helped water the plants.', emoji: '🌹', time: '9:15 AM', date: 'Today', mood: '😊', isFavorite: true, cognitivePrompt: 'Who helped you water the plants?', cognitiveAnswer: 'Sarah', engagementScore: 92 },
  { id: '2', type: 'voice', title: 'Called John', description: 'Had a lovely chat with John about his new job. He sounds happy.', emoji: '📞', time: '11:00 AM', date: 'Today', mood: '😊', isFavorite: false, voiceTranscript: 'John called me today, he got a promotion at his company...', cognitivePrompt: 'What good news did John share?', engagementScore: 78 },
  { id: '3', type: 'note', title: 'Lunch with Sarah', description: 'Sarah made my favorite soup. We looked at old family photos together.', emoji: '🍲', time: '1:00 PM', date: 'Yesterday', mood: '😊', isFavorite: true, cognitivePrompt: 'What did Sarah cook for you?', cognitiveAnswer: 'My favorite soup', engagementScore: 85 },
  { id: '4', type: 'photo', title: 'Grandchildren visited', description: 'Emma and Liam came after school. We played cards and had cookies.', emoji: '🃏', time: '4:30 PM', date: 'Yesterday', mood: '😊', isFavorite: true, cognitivePrompt: 'What are the names of your grandchildren?', cognitiveAnswer: 'Emma and Liam', engagementScore: 95 },
  { id: '5', type: 'voice', title: 'Listened to music', description: 'Played old Frank Sinatra records. Remembered dancing with Harold.', emoji: '🎵', time: '7:00 PM', date: '2 days ago', mood: '😌', isFavorite: false, voiceTranscript: 'I was listening to Fly Me to the Moon, it reminded me of Harold...', cognitivePrompt: 'Who did you dance with?', engagementScore: 70 },
  { id: '6', type: 'photo', title: 'Doctor appointment went well', description: 'Dr. Smith said blood pressure is good. Feeling relieved and positive.', emoji: '🏥', time: '10:00 AM', date: '3 days ago', mood: '😊', isFavorite: false, cognitivePrompt: 'What did the doctor say about your health?', cognitiveAnswer: 'Blood pressure is good', engagementScore: 65 },
];

const moodOptions = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
];

export default function MemoryLaneScreen() {
  const [memories, setMemories] = useState(sampleMemories);
  const [selectedMemory, setSelectedMemory] = useState<MemoryEntry | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showCognitivePrompt, setShowCognitivePrompt] = useState(false);
  const [cognitiveInput, setCognitiveInput] = useState('');
  const [addStep, setAddStep] = useState<'type' | 'content' | 'mood'>('type');
  const [newMemory, setNewMemory] = useState({ type: '' as string, title: '', description: '', mood: '' });

  const toggleFavorite = useCallback((id: string) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m));
  }, []);

  const answerCognitivePrompt = useCallback(() => {
    if (!selectedMemory || !cognitiveInput.trim()) return;
    setMemories(prev => prev.map(m =>
      m.id === selectedMemory.id ? { ...m, cognitiveAnswer: cognitiveInput, engagementScore: Math.min((m.engagementScore || 60) + 15, 100) } : m
    ));
    setSelectedMemory(prev => prev ? { ...prev, cognitiveAnswer: cognitiveInput } : null);
    setCognitiveInput('');
    setShowCognitivePrompt(false);
  }, [selectedMemory, cognitiveInput]);

  const addNewMemory = useCallback(() => {
    const entry: MemoryEntry = {
      id: Date.now().toString(),
      type: (newMemory.type || 'note') as 'photo' | 'voice' | 'note',
      title: newMemory.title || 'New memory',
      description: newMemory.description || '',
      emoji: newMemory.type === 'photo' ? '📸' : newMemory.type === 'voice' ? '🎙️' : '📝',
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      date: 'Today',
      mood: newMemory.mood || '😊',
      isFavorite: false,
      engagementScore: 50,
      cognitivePrompt: 'What made this moment special?',
    };
    setMemories(prev => [entry, ...prev]);
    setShowAdd(false);
    setAddStep('type');
    setNewMemory({ type: '', title: '', description: '', mood: '' });
  }, [newMemory]);

  const groupedByDate = memories.reduce<Record<string, MemoryEntry[]>>((acc, m) => {
    if (!acc[m.date]) acc[m.date] = [];
    acc[m.date].push(m);
    return acc;
  }, {});

  const todayCount = memories.filter(m => m.date === 'Today').length;
  const favCount = memories.filter(m => m.isFavorite).length;
  const avgEngagement = Math.round(memories.reduce((s, m) => s + (m.engagementScore || 0), 0) / memories.length);

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Header with Stats */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-[22px] font-extrabold text-foreground">Memory Lane</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">Your daily journal & cognitive exercise</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-[11px] font-semibold text-accent">{avgEngagement}% engaged</span>
          </div>
        </div>
        {/* Quick stats */}
        <div className="flex gap-2">
          {[
            { label: 'Today', value: todayCount, icon: '📅' },
            { label: 'Favorites', value: favCount, icon: '❤️' },
            { label: 'Total', value: memories.length, icon: '📚' },
          ].map(s => (
            <div key={s.label} className="flex-1 ios-card p-2 flex items-center gap-2">
              <span className="text-[14px]">{s.icon}</span>
              <div>
                <div className="text-[14px] font-bold text-foreground">{s.value}</div>
                <div className="text-[9px] text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {Object.entries(groupedByDate).map(([date, entries]) => (
          <div key={date} className="mb-5">
            <div className="flex items-center gap-2 mb-2.5 sticky top-0 bg-background/95 backdrop-blur-sm py-1 z-10">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-[13px] font-bold text-primary">{date}</span>
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-[10px] text-muted-foreground">{entries.length} entries</span>
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
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-1">
                    <div className={`w-3 h-3 rounded-full shrink-0 ring-2 ring-background ${
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
                          {memory.cognitiveAnswer && (
                            <span className="text-[9px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-full ml-auto flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Recalled
                            </span>
                          )}
                          {!memory.cognitiveAnswer && memory.cognitivePrompt && (
                            <span className="text-[9px] font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full ml-auto">
                              💭 Recall prompt
                            </span>
                          )}
                          {memory.isFavorite && <Heart className="w-3 h-3 text-destructive fill-destructive" />}
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
        onClick={() => { setShowAdd(true); setAddStep('type'); }}
        className="absolute bottom-5 right-5 w-[52px] h-[52px] rounded-2xl bg-primary text-primary-foreground flex items-center justify-center z-30 shadow-lg active:scale-90 transition-transform"
        aria-label="Add memory"
      >
        <Plus className="w-5 h-5" />
      </motion.button>

      {/* Add Memory Sheet - Multi-step */}
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
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />

              {addStep === 'type' && (
                <>
                  <h3 className="text-[18px] font-bold text-foreground mb-1 text-center">Add a Memory</h3>
                  <p className="text-[12px] text-muted-foreground text-center mb-4">What would you like to capture?</p>
                  <div className="space-y-2.5">
                    {[
                      { type: 'photo', icon: Camera, label: 'Take a Photo', desc: 'Capture this moment visually', color: 'text-primary', bg: 'bg-primary/8' },
                      { type: 'voice', icon: Mic, label: 'Voice Note', desc: 'Tell us about your day', color: 'text-secondary', bg: 'bg-secondary/8' },
                      { type: 'note', icon: BookOpen, label: 'Write a Note', desc: 'Jot down a thought or feeling', color: 'text-accent', bg: 'bg-accent/8' },
                    ].map(opt => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => { setNewMemory(prev => ({ ...prev, type: opt.type })); setAddStep('content'); }}
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
                </>
              )}

              {addStep === 'content' && (
                <>
                  <h3 className="text-[18px] font-bold text-foreground mb-4 text-center">What happened?</h3>
                  <input
                    type="text"
                    placeholder="Give it a title (e.g., Walk in the park)"
                    value={newMemory.title}
                    onChange={e => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full h-12 rounded-2xl bg-muted/50 px-4 text-[14px] text-foreground placeholder:text-muted-foreground mb-3 outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <textarea
                    placeholder="Describe this memory... Who was there? What did you feel?"
                    value={newMemory.description}
                    onChange={e => setNewMemory(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full rounded-2xl bg-muted/50 p-4 text-[14px] text-foreground placeholder:text-muted-foreground mb-4 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <div className="flex gap-2.5">
                    <button onClick={() => setAddStep('type')} className="flex-1 h-11 rounded-2xl bg-muted/50 text-muted-foreground text-[14px] font-bold">Back</button>
                    <button
                      onClick={() => setAddStep('mood')}
                      disabled={!newMemory.title.trim()}
                      className="flex-1 h-11 rounded-2xl bg-primary text-primary-foreground text-[14px] font-bold disabled:opacity-40"
                    >Next</button>
                  </div>
                </>
              )}

              {addStep === 'mood' && (
                <>
                  <h3 className="text-[18px] font-bold text-foreground mb-2 text-center">How did this make you feel?</h3>
                  <p className="text-[12px] text-muted-foreground text-center mb-5">This helps us understand your emotional journey</p>
                  <div className="flex justify-center gap-3 mb-6">
                    {moodOptions.map(m => (
                      <button
                        key={m.emoji}
                        onClick={() => setNewMemory(prev => ({ ...prev, mood: m.emoji }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
                          newMemory.mood === m.emoji ? 'bg-primary/10 ring-2 ring-primary scale-110' : 'bg-muted/30'
                        }`}
                      >
                        <span className="text-[28px]">{m.emoji}</span>
                        <span className="text-[10px] font-medium text-muted-foreground">{m.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2.5">
                    <button onClick={() => setAddStep('content')} className="flex-1 h-11 rounded-2xl bg-muted/50 text-muted-foreground text-[14px] font-bold">Back</button>
                    <button onClick={addNewMemory} className="flex-1 h-11 rounded-2xl bg-primary text-primary-foreground text-[14px] font-bold">
                      Save Memory ✨
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Detail with Cognitive Prompt */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="bg-card rounded-t-3xl w-full overflow-hidden shadow-2xl border-t border-border/20"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <div className="flex justify-end p-3 pb-0">
                <button onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="px-6 pb-2 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <span className="text-[36px]">{selectedMemory.emoji}</span>
                </div>
                <h3 className="text-[18px] font-bold text-foreground">{selectedMemory.title}</h3>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <span className="text-[12px] text-muted-foreground">{selectedMemory.date} · {selectedMemory.time}</span>
                  {selectedMemory.mood && <span className="text-[16px]">{selectedMemory.mood}</span>}
                </div>
                <p className="text-[14px] text-muted-foreground mt-3 leading-relaxed">{selectedMemory.description}</p>

                {/* Voice transcript */}
                {selectedMemory.voiceTranscript && (
                  <div className="mt-3 p-3 rounded-2xl bg-secondary/8 text-left">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Mic className="w-3 h-3 text-secondary" />
                      <span className="text-[10px] font-semibold text-secondary">Voice Transcript</span>
                    </div>
                    <p className="text-[12px] text-foreground/80 italic leading-relaxed">"{selectedMemory.voiceTranscript}"</p>
                  </div>
                )}

                {/* Cognitive Recall Section */}
                {selectedMemory.cognitivePrompt && (
                  <div className="mt-3 p-3 rounded-2xl bg-accent/8">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[11px] font-bold text-accent">Memory Recall Exercise</span>
                    </div>
                    <p className="text-[13px] font-medium text-foreground">{selectedMemory.cognitivePrompt}</p>
                    {selectedMemory.cognitiveAnswer ? (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] text-success font-semibold bg-success/10 px-2 py-1 rounded-full">✓ {selectedMemory.cognitiveAnswer}</span>
                      </div>
                    ) : (
                      <>
                        {!showCognitivePrompt ? (
                          <button
                            onClick={() => setShowCognitivePrompt(true)}
                            className="mt-2 text-[12px] font-semibold text-accent underline underline-offset-2"
                          >
                            Try to recall →
                          </button>
                        ) : (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={cognitiveInput}
                              onChange={e => setCognitiveInput(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && answerCognitivePrompt()}
                              placeholder="Your answer..."
                              className="flex-1 h-9 rounded-xl bg-card px-3 text-[13px] text-foreground outline-none focus:ring-2 focus:ring-accent/30"
                              autoFocus
                            />
                            <button onClick={answerCognitivePrompt} className="w-9 h-9 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Engagement indicator */}
                {selectedMemory.engagementScore !== undefined && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedMemory.engagementScore}%` }}
                        className={`h-full rounded-full ${
                          selectedMemory.engagementScore >= 80 ? 'bg-success' : selectedMemory.engagementScore >= 50 ? 'bg-accent' : 'bg-warning'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{selectedMemory.engagementScore}% engaged</span>
                  </div>
                )}
              </div>

              <div className="px-5 pb-6 pt-3 flex gap-2.5">
                <button
                  onClick={() => { toggleFavorite(selectedMemory.id); setSelectedMemory(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null); }}
                  className="flex-1 h-11 rounded-2xl bg-destructive/10 text-destructive text-[14px] font-bold flex items-center justify-center gap-2"
                >
                  <Heart className={`w-4 h-4 ${selectedMemory.isFavorite ? 'fill-destructive' : ''}`} />
                  {selectedMemory.isFavorite ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }}
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
