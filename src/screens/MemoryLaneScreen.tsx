import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Mic, Heart, Calendar, Clock, Sparkles, X, Send, BookOpen, Loader2, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  engagementScore?: number;
}

const moodOptions = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
];

const cognitivePrompts: Record<string, string[]> = {
  photo: ['Who was with you?', 'Where was this?', 'What made it special?'],
  voice: ['What were you talking about?', 'Who were you with?', 'How did it feel?'],
  note: ['What inspired this?', 'Who does this remind you of?', 'Why is it important?'],
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const typeIcon = (type: string) => {
  if (type === 'photo') return <Camera className="w-5 h-5" />;
  if (type === 'voice') return <Mic className="w-5 h-5" />;
  return <BookOpen className="w-5 h-5" />;
};

export default function MemoryLaneScreen() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<MemoryEntry | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showCognitivePrompt, setShowCognitivePrompt] = useState(false);
  const [cognitiveInput, setCognitiveInput] = useState('');
  const [addStep, setAddStep] = useState<'type' | 'content' | 'mood'>('type');
  const [newMemory, setNewMemory] = useState({ type: '' as string, title: '', description: '', mood: '' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadMemories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped: MemoryEntry[] = (data || []).map((m: any) => ({
        id: m.id,
        type: m.type as 'photo' | 'voice' | 'note',
        title: m.title,
        description: m.description || '',
        emoji: m.emoji || '📝',
        time: new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        date: formatRelativeDate(m.created_at),
        mood: m.mood,
        isFavorite: m.is_favorite || false,
        cognitivePrompt: m.cognitive_prompt,
        cognitiveAnswer: m.cognitive_answer,
        voiceTranscript: m.voice_transcript,
        engagementScore: m.engagement_score || 50,
      }));
      setMemories(mapped);
    } catch (e) {
      console.error('Failed to load memories:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemories();
    const channel = supabase
      .channel('memories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, () => loadMemories())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadMemories]);

  const toggleFavorite = useCallback(async (id: string) => {
    const mem = memories.find(m => m.id === id);
    if (!mem) return;
    const newVal = !mem.isFavorite;
    setMemories(prev => prev.map(m => m.id === id ? { ...m, isFavorite: newVal } : m));
    await supabase.from('memories').update({ is_favorite: newVal }).eq('id', id);
  }, [memories]);

  const answerCognitivePrompt = useCallback(async () => {
    if (!selectedMemory || !cognitiveInput.trim()) return;
    const newScore = Math.min((selectedMemory.engagementScore || 60) + 15, 100);
    await supabase.from('memories').update({ cognitive_answer: cognitiveInput, engagement_score: newScore }).eq('id', selectedMemory.id);
    setMemories(prev => prev.map(m => m.id === selectedMemory.id ? { ...m, cognitiveAnswer: cognitiveInput, engagementScore: newScore } : m));
    setSelectedMemory(prev => prev ? { ...prev, cognitiveAnswer: cognitiveInput, engagementScore: newScore } : null);
    setCognitiveInput('');
    setShowCognitivePrompt(false);
    toast({ title: 'Great recall!', description: 'Your memory exercise has been recorded.' });
  }, [selectedMemory, cognitiveInput, toast]);

  const addNewMemory = useCallback(async () => {
    setSaving(true);
    const type = (newMemory.type || 'note') as 'photo' | 'voice' | 'note';
    const prompts = cognitivePrompts[type];
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    try {
      const { error } = await supabase.from('memories').insert({
        type,
        title: newMemory.title || 'New memory',
        description: newMemory.description || '',
        emoji: type === 'photo' ? '📸' : type === 'voice' ? '🎙️' : '📝',
        mood: newMemory.mood || '😊',
        cognitive_prompt: prompt,
        engagement_score: 50,
      });
      if (error) throw error;
      toast({ title: 'Memory saved', description: 'Your moment has been captured.' });
    } catch (e) {
      console.error('Failed to save memory:', e);
      toast({ title: 'Error', description: 'Failed to save memory', variant: 'destructive' });
    } finally {
      setSaving(false);
      setShowAdd(false);
      setAddStep('type');
      setNewMemory({ type: '', title: '', description: '', mood: '' });
    }
  }, [newMemory, toast]);

  const groupedByDate = memories.reduce<Record<string, MemoryEntry[]>>((acc, m) => {
    if (!acc[m.date]) acc[m.date] = [];
    acc[m.date].push(m);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Clean Header */}
      <div className="px-5 pt-4 pb-3">
        <h1 className="text-[26px] font-bold text-foreground">Memory Lane</h1>
        <p className="text-[15px] text-muted-foreground mt-0.5">Your personal timeline</p>
      </div>

      {/* Empty state */}
      {memories.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-[20px] font-bold text-foreground mb-2">No memories yet</h2>
          <p className="text-[16px] text-muted-foreground text-center leading-relaxed">
            Tap the + button to capture your first moment.
          </p>
        </div>
      )}

      {/* Clean Timeline */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {Object.entries(groupedByDate).map(([date, entries]) => (
          <div key={date} className="mb-5">
            {/* Date header */}
            <div className="flex items-center gap-2 mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-1.5 z-10">
              <span className="text-[14px] font-semibold text-primary uppercase tracking-wide">{date}</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {/* Memory cards - clean, minimal */}
            <div className="space-y-2.5">
              {entries.map((memory, i) => (
                <motion.button
                  key={memory.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedMemory(memory)}
                  className="w-full bg-card rounded-xl p-4 flex items-center gap-3.5 text-left active:scale-[0.98] transition-transform shadow-sm border border-border/30"
                >
                  {/* Type icon instead of big emoji */}
                  <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 text-primary">
                    {typeIcon(memory.type)}
                  </div>

                  {/* Content - clean text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-semibold text-foreground truncate">{memory.title}</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{memory.time}</p>
                  </div>

                  {/* Minimal indicators */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {memory.cognitiveAnswer && (
                      <span className="w-2 h-2 rounded-full bg-success" title="Recalled" />
                    )}
                    {memory.isFavorite && (
                      <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" />
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => { setShowAdd(true); setAddStep('type'); }}
        className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center z-30 shadow-lg active:scale-90 transition-transform touch-target"
        aria-label="Add memory"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add Memory Bottom Sheet */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/30" onClick={() => setShowAdd(false)}>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl p-5 pb-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-5" />

              {addStep === 'type' && (
                <>
                  <h3 className="text-[20px] font-bold text-foreground mb-4">Add a Memory</h3>
                  <div className="space-y-2.5">
                    {[
                      { type: 'photo', icon: Camera, label: 'Photo', desc: 'Capture a moment' },
                      { type: 'voice', icon: Mic, label: 'Voice Note', desc: 'Record your thoughts' },
                      { type: 'note', icon: BookOpen, label: 'Note', desc: 'Write something down' },
                    ].map(opt => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.type}
                          onClick={() => { setNewMemory(prev => ({ ...prev, type: opt.type })); setAddStep('content'); }}
                          className="w-full rounded-xl border border-border/40 p-4 flex items-center gap-3 active:scale-[0.98] transition-transform touch-target"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center text-primary">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-[16px] font-semibold text-foreground">{opt.label}</p>
                            <p className="text-[13px] text-muted-foreground">{opt.desc}</p>
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
                  <h3 className="text-[20px] font-bold text-foreground mb-4">What happened?</h3>
                  <input
                    type="text"
                    placeholder="Title (e.g., Walk in the park)"
                    value={newMemory.title}
                    onChange={e => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-muted/50 px-4 text-[16px] text-foreground placeholder:text-muted-foreground mb-3 outline-none focus:ring-2 focus:ring-primary/30 touch-target"
                  />
                  <textarea
                    placeholder="A short description..."
                    value={newMemory.description}
                    onChange={e => setNewMemory(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full rounded-xl bg-muted/50 p-4 text-[16px] text-foreground placeholder:text-muted-foreground mb-4 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setAddStep('type')} className="flex-1 h-12 rounded-xl bg-muted/50 text-muted-foreground text-[16px] font-semibold touch-target">Back</button>
                    <button onClick={() => setAddStep('mood')} disabled={!newMemory.title.trim()} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground text-[16px] font-semibold disabled:opacity-40 touch-target">Next</button>
                  </div>
                </>
              )}

              {addStep === 'mood' && (
                <>
                  <h3 className="text-[20px] font-bold text-foreground mb-4 text-center">How did you feel?</h3>
                  <div className="flex justify-center gap-3 mb-5">
                    {moodOptions.map(m => (
                      <button
                        key={m.emoji}
                        onClick={() => setNewMemory(prev => ({ ...prev, mood: m.emoji }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all touch-target ${
                          newMemory.mood === m.emoji ? 'bg-primary/10 ring-2 ring-primary scale-105' : 'bg-muted/30'
                        }`}
                      >
                        <span className="text-[28px]">{m.emoji}</span>
                        <span className="text-[11px] font-medium text-muted-foreground">{m.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setAddStep('content')} className="flex-1 h-12 rounded-xl bg-muted/50 text-muted-foreground text-[16px] font-semibold touch-target">Back</button>
                    <button onClick={addNewMemory} disabled={saving} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground text-[16px] font-semibold disabled:opacity-40 flex items-center justify-center gap-2 touch-target">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Save
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Detail Sheet */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/30 flex items-end" onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }}>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="bg-card w-full rounded-t-2xl shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <div className="flex justify-between items-center px-5 pt-4 pb-2">
                <div className="flex items-center gap-2 text-primary">
                  {typeIcon(selectedMemory.type)}
                  <span className="text-[13px] font-semibold uppercase tracking-wide">{selectedMemory.type}</span>
                </div>
                <button onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center touch-target">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="px-5 pb-2">
                <h3 className="text-[22px] font-bold text-foreground">{selectedMemory.title}</h3>
                <p className="text-[14px] text-muted-foreground mt-1">{selectedMemory.date} · {selectedMemory.time}</p>
                {selectedMemory.description && (
                  <p className="text-[15px] text-foreground/80 mt-3 leading-relaxed">{selectedMemory.description}</p>
                )}
              </div>

              {/* Cognitive Recall — clean */}
              {selectedMemory.cognitivePrompt && (
                <div className="mx-5 mt-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-[13px] font-semibold text-primary mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Recall Exercise
                  </p>
                  <p className="text-[15px] font-medium text-foreground">{selectedMemory.cognitivePrompt}</p>
                  {selectedMemory.cognitiveAnswer ? (
                    <p className="mt-2 text-[14px] text-success font-medium">✓ {selectedMemory.cognitiveAnswer}</p>
                  ) : !showCognitivePrompt ? (
                    <button onClick={() => setShowCognitivePrompt(true)} className="mt-2 text-[14px] font-semibold text-primary touch-target">Try to recall →</button>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text" value={cognitiveInput}
                        onChange={e => setCognitiveInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && answerCognitivePrompt()}
                        placeholder="Your answer..."
                        className="flex-1 h-10 rounded-lg bg-card px-3 text-[15px] text-foreground outline-none focus:ring-2 focus:ring-primary/30 touch-target"
                        autoFocus
                      />
                      <button onClick={answerCognitivePrompt} className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center touch-target">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Actions — minimal */}
              <div className="px-5 py-4 flex gap-3">
                <button
                  onClick={() => { toggleFavorite(selectedMemory.id); setSelectedMemory(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null); }}
                  className={`flex-1 h-12 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 touch-target transition-colors ${
                    selectedMemory.isFavorite ? 'bg-destructive/10 text-destructive' : 'bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${selectedMemory.isFavorite ? 'fill-destructive' : ''}`} />
                  {selectedMemory.isFavorite ? 'Saved' : 'Save'}
                </button>
                <button onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }} className="flex-1 h-12 rounded-xl bg-muted/40 text-muted-foreground text-[15px] font-semibold touch-target">
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
