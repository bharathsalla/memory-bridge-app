import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Mic, Heart, Calendar, Clock, Sparkles, MessageCircle, ChevronRight, X, Send, BookOpen, Loader2 } from 'lucide-react';
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
  photo: ['Who was with you in this moment?', 'Where was this taken?', 'What made this moment special?'],
  voice: ['What were you talking about?', 'Who were you speaking with?', 'How did this conversation make you feel?'],
  note: ['What inspired you to write this?', 'Who does this remind you of?', 'What made this moment special?'],
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, () => {
        loadMemories();
      })
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
    await supabase.from('memories').update({
      cognitive_answer: cognitiveInput,
      engagement_score: newScore,
    }).eq('id', selectedMemory.id);
    setMemories(prev => prev.map(m =>
      m.id === selectedMemory.id ? { ...m, cognitiveAnswer: cognitiveInput, engagementScore: newScore } : m
    ));
    setSelectedMemory(prev => prev ? { ...prev, cognitiveAnswer: cognitiveInput, engagementScore: newScore } : null);
    setCognitiveInput('');
    setShowCognitivePrompt(false);
    toast({ title: '🎉 Great recall!', description: 'Your memory exercise has been recorded.' });
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
      toast({ title: '✨ Memory saved!', description: 'Your moment has been captured.' });
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

  const todayCount = memories.filter(m => m.date === 'Today').length;
  const favCount = memories.filter(m => m.isFavorite).length;
  const avgEngagement = memories.length ? Math.round(memories.reduce((s, m) => s + (m.engagementScore || 0), 0) / memories.length) : 0;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <span className="text-[18px] text-muted-foreground font-medium">Loading your memories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Header with Stats */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[28px] font-extrabold text-foreground">Memory Lane</h1>
            <p className="text-[16px] text-muted-foreground mt-1 font-medium">Your daily journal & cognitive exercise</p>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-[15px] font-bold text-accent">{avgEngagement}%</span>
          </div>
        </div>
        <div className="flex gap-3">
          {[
            { label: 'Today', value: todayCount, icon: '📅' },
            { label: 'Favorites', value: favCount, icon: '❤️' },
            { label: 'Total', value: memories.length, icon: '📚' },
          ].map(s => (
            <div key={s.label} className="flex-1 ios-card p-4 flex items-center gap-3">
              <span className="text-[22px]">{s.icon}</span>
              <div>
                <div className="text-[20px] font-extrabold text-foreground">{s.value}</div>
                <div className="text-[13px] text-muted-foreground font-semibold">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {memories.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-24 h-24 bg-primary/10 flex items-center justify-center mb-5">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-[24px] font-extrabold text-foreground mb-3">Start Your Memory Lane</h2>
          <p className="text-[18px] text-muted-foreground text-center leading-relaxed">
            Capture moments, answer recall prompts, and build your cognitive timeline. Tap + to add your first memory.
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {Object.entries(groupedByDate).map(([date, entries]) => (
          <div key={date} className="mb-6">
            <div className="flex items-center gap-3 mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-[18px] font-extrabold text-primary">{date}</span>
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-[14px] text-muted-foreground font-semibold">{entries.length} entries</span>
            </div>
            <div className="space-y-4 ml-1">
              {entries.map((memory, i) => (
                <motion.button
                  key={memory.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedMemory(memory)}
                  className="w-full flex gap-4 text-left group"
                >
                  <div className="flex flex-col items-center pt-2">
                    <div className={`w-4 h-4 shrink-0 ring-2 ring-background ${
                      memory.type === 'photo' ? 'bg-primary' : memory.type === 'voice' ? 'bg-secondary' : 'bg-accent'
                    }`} />
                    {i < entries.length - 1 && <div className="w-0.5 flex-1 bg-border/40 mt-1" />}
                  </div>
                  <div className="flex-1 ios-card-elevated p-5 mb-0 active:scale-[0.98] transition-transform">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-muted/50 flex items-center justify-center shrink-0">
                        <span className="text-[28px]">{memory.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[19px] font-extrabold text-foreground">{memory.title}</span>
                          {memory.mood && <span className="text-[20px]">{memory.mood}</span>}
                        </div>
                        <p className="text-[16px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{memory.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Clock className="w-4 h-4 text-muted-foreground/60" />
                          <span className="text-[15px] text-muted-foreground font-medium">{memory.time}</span>
                          {memory.cognitiveAnswer && (
                            <span className="text-[13px] font-bold text-success bg-success/10 px-2.5 py-1 ml-auto flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> Recalled
                            </span>
                          )}
                          {!memory.cognitiveAnswer && memory.cognitivePrompt && (
                            <span className="text-[13px] font-bold text-accent bg-accent/10 px-2.5 py-1 ml-auto">
                              💭 Recall prompt
                            </span>
                          )}
                          {memory.isFavorite && <Heart className="w-4 h-4 text-destructive fill-destructive" />}
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
        className="absolute bottom-5 right-5 w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center z-30 shadow-lg active:scale-90 transition-transform touch-target"
        aria-label="Add memory"
      >
        <Plus className="w-7 h-7" />
      </motion.button>

      {/* Add Memory Sheet */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/40" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 350 }} className="absolute bottom-0 left-0 right-0 bg-card p-5 pb-8" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-muted mx-auto mb-5" />

              {addStep === 'type' && (
                <>
                  <h3 className="text-[22px] font-extrabold text-foreground mb-2 text-center">Add a Memory</h3>
                  <p className="text-[16px] text-muted-foreground text-center mb-5">What would you like to capture?</p>
                  <div className="space-y-3">
                    {[
                      { type: 'photo', icon: Camera, label: 'Take a Photo', desc: 'Capture this moment visually', color: 'text-primary', bg: 'bg-primary/8' },
                      { type: 'voice', icon: Mic, label: 'Voice Note', desc: 'Tell us about your day', color: 'text-secondary', bg: 'bg-secondary/8' },
                      { type: 'note', icon: BookOpen, label: 'Write a Note', desc: 'Jot down a thought or feeling', color: 'text-accent', bg: 'bg-accent/8' },
                    ].map(opt => {
                      const Icon = opt.icon;
                      return (
                        <button key={opt.label} onClick={() => { setNewMemory(prev => ({ ...prev, type: opt.type })); setAddStep('content'); }} className="w-full ios-card-elevated p-5 flex items-center gap-4 active:scale-[0.98] transition-transform touch-target">
                          <div className={`w-14 h-14 ${opt.bg} flex items-center justify-center shrink-0`}><Icon className={`w-7 h-7 ${opt.color}`} /></div>
                          <div className="flex-1 text-left">
                            <div className="text-[19px] font-extrabold text-foreground">{opt.label}</div>
                            <div className="text-[15px] text-muted-foreground mt-0.5 font-medium">{opt.desc}</div>
                          </div>
                          <ChevronRight className="w-6 h-6 text-muted-foreground/40" />
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {addStep === 'content' && (
                <>
                  <h3 className="text-[22px] font-extrabold text-foreground mb-5 text-center">What happened?</h3>
                  <input type="text" placeholder="Give it a title (e.g., Walk in the park)" value={newMemory.title} onChange={e => setNewMemory(prev => ({ ...prev, title: e.target.value }))} className="w-full h-14 bg-muted/50 px-4 text-[18px] text-foreground placeholder:text-muted-foreground mb-3 outline-none focus:ring-2 focus:ring-primary/30 touch-target" />
                  <textarea placeholder="Describe this memory... Who was there? What did you feel?" value={newMemory.description} onChange={e => setNewMemory(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full bg-muted/50 p-4 text-[18px] text-foreground placeholder:text-muted-foreground mb-4 outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  <div className="flex gap-3">
                    <button onClick={() => setAddStep('type')} className="flex-1 h-14 bg-muted/50 text-muted-foreground text-[18px] font-bold touch-target">Back</button>
                    <button onClick={() => setAddStep('mood')} disabled={!newMemory.title.trim()} className="flex-1 h-14 bg-primary text-primary-foreground text-[18px] font-bold disabled:opacity-40 touch-target">Next</button>
                  </div>
                </>
              )}

              {addStep === 'mood' && (
                <>
                  <h3 className="text-[22px] font-extrabold text-foreground mb-2 text-center">How did this make you feel?</h3>
                  <p className="text-[16px] text-muted-foreground text-center mb-5">This helps us understand your emotional journey</p>
                  <div className="flex justify-center gap-4 mb-6">
                    {moodOptions.map(m => (
                      <button key={m.emoji} onClick={() => setNewMemory(prev => ({ ...prev, mood: m.emoji }))} className={`flex flex-col items-center gap-2 p-4 transition-all touch-target ${newMemory.mood === m.emoji ? 'bg-primary/10 ring-2 ring-primary scale-110' : 'bg-muted/30'}`}>
                        <span className="text-[34px]">{m.emoji}</span>
                        <span className="text-[13px] font-semibold text-muted-foreground">{m.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setAddStep('content')} className="flex-1 h-14 bg-muted/50 text-muted-foreground text-[18px] font-bold touch-target">Back</button>
                    <button onClick={addNewMemory} disabled={saving} className="flex-1 h-14 bg-primary text-primary-foreground text-[18px] font-bold disabled:opacity-40 flex items-center justify-center gap-2 touch-target">
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 350 }} className="bg-card w-full overflow-hidden shadow-2xl border-t border-border/20" onClick={e => e.stopPropagation()}>
              <div className="flex justify-end p-4 pb-0">
                <button onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }} className="w-10 h-10 bg-muted/50 flex items-center justify-center touch-target">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="px-6 pb-3 text-center">
                <div className="w-20 h-20 bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-[42px]">{selectedMemory.emoji}</span>
                </div>
                <h3 className="text-[24px] font-extrabold text-foreground">{selectedMemory.title}</h3>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <span className="text-[16px] text-muted-foreground font-medium">{selectedMemory.date} · {selectedMemory.time}</span>
                  {selectedMemory.mood && <span className="text-[22px]">{selectedMemory.mood}</span>}
                </div>
                <p className="text-[18px] text-muted-foreground mt-4 leading-relaxed">{selectedMemory.description}</p>

                {selectedMemory.voiceTranscript && (
                  <div className="mt-4 p-4 bg-secondary/8 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="w-4 h-4 text-secondary" />
                      <span className="text-[14px] font-bold text-secondary">Voice Transcript</span>
                    </div>
                    <p className="text-[16px] text-foreground/80 italic leading-relaxed">"{selectedMemory.voiceTranscript}"</p>
                  </div>
                )}

                {selectedMemory.cognitivePrompt && (
                  <div className="mt-4 p-4 bg-accent/8">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      <span className="text-[15px] font-bold text-accent">Memory Recall Exercise</span>
                    </div>
                    <p className="text-[17px] font-semibold text-foreground">{selectedMemory.cognitivePrompt}</p>
                    {selectedMemory.cognitiveAnswer ? (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[15px] text-success font-bold bg-success/10 px-3 py-1.5">✓ {selectedMemory.cognitiveAnswer}</span>
                      </div>
                    ) : (
                      <>
                        {!showCognitivePrompt ? (
                          <button onClick={() => setShowCognitivePrompt(true)} className="mt-3 text-[16px] font-bold text-accent underline underline-offset-2 touch-target">Try to recall →</button>
                        ) : (
                          <div className="mt-3 flex gap-3">
                            <input type="text" value={cognitiveInput} onChange={e => setCognitiveInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && answerCognitivePrompt()} placeholder="Your answer..." className="flex-1 h-12 bg-card px-4 text-[17px] text-foreground outline-none focus:ring-2 focus:ring-accent/30 touch-target" autoFocus />
                            <button onClick={answerCognitivePrompt} className="w-12 h-12 bg-accent text-accent-foreground flex items-center justify-center touch-target"><Send className="w-5 h-5" /></button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {selectedMemory.engagementScore !== undefined && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${selectedMemory.engagementScore}%` }} className={`h-full ${selectedMemory.engagementScore >= 80 ? 'bg-success' : selectedMemory.engagementScore >= 50 ? 'bg-accent' : 'bg-warning'}`} />
                    </div>
                    <span className="text-[14px] text-muted-foreground font-medium">{selectedMemory.engagementScore}% engaged</span>
                  </div>
                )}
              </div>

              <div className="px-5 pb-6 pt-4 flex gap-3">
                <button onClick={() => { toggleFavorite(selectedMemory.id); setSelectedMemory(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null); }} className="flex-1 h-14 bg-destructive/10 text-destructive text-[18px] font-bold flex items-center justify-center gap-2 touch-target">
                  <Heart className={`w-5 h-5 ${selectedMemory.isFavorite ? 'fill-destructive' : ''}`} />
                  {selectedMemory.isFavorite ? 'Saved' : 'Save'}
                </button>
                <button onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }} className="flex-1 h-14 bg-muted/50 text-muted-foreground text-[18px] font-bold touch-target">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
