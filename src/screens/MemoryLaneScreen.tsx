import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Phone, MapPin, Users, MessageSquare, Clock, Heart, X, Send, Sparkles, Loader2, Camera, Mic, BookOpen } from 'lucide-react';
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

const activityCategories = [
  { type: 'phone', icon: Phone, label: 'Phone Call', color: 'bg-blue-500' },
  { type: 'place', icon: MapPin, label: 'Visited Place', color: 'bg-amber-500' },
  { type: 'person', icon: Users, label: 'Met Someone', color: 'bg-purple-500' },
  { type: 'other', icon: MessageSquare, label: 'Other', color: 'bg-primary' },
];

const typeToCategory = (type: string) => {
  if (type === 'voice') return activityCategories[0];
  if (type === 'photo') return activityCategories[1];
  return activityCategories[3];
};

const cognitivePrompts: Record<string, string[]> = {
  phone: ['Who did you call?', 'What did you talk about?'],
  place: ['Where did you go?', 'What did you see there?'],
  person: ['Who did you meet?', 'What did you do together?'],
  other: ['What happened?', 'How did it make you feel?'],
  photo: ['Where was this taken?', 'Who was with you?'],
  voice: ['What were you talking about?', 'Who were you with?'],
  note: ['What inspired this?', 'Who does this remind you of?'],
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadMemories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('memories').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setMemories((data || []).map((m: any) => ({
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
      })));
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

  const saveActivity = useCallback(async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    const catType = selectedCategory || 'other';
    const prompts = cognitivePrompts[catType] || cognitivePrompts.other;
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    const typeMap: Record<string, string> = { phone: 'voice', place: 'photo', person: 'note', other: 'note' };
    try {
      const { error } = await supabase.from('memories').insert({
        type: typeMap[catType] || 'note',
        title: newTitle,
        description: newDescription,
        emoji: catType === 'phone' ? '📞' : catType === 'place' ? '📍' : catType === 'person' ? '👥' : '💬',
        cognitive_prompt: prompt,
        engagement_score: 50,
      });
      if (error) throw error;
      toast({ title: 'Activity saved', description: 'Added to your timeline.' });
    } catch (e) {
      console.error('Failed to save:', e);
      toast({ title: 'Error', description: 'Could not save activity.', variant: 'destructive' });
    } finally {
      setSaving(false);
      setShowAdd(false);
      setSelectedCategory('');
      setNewTitle('');
      setNewDescription('');
    }
  }, [selectedCategory, newTitle, newDescription, toast]);

  const groupedByDate = memories.reduce<Record<string, MemoryEntry[]>>((acc, m) => {
    if (!acc[m.date]) acc[m.date] = [];
    acc[m.date].push(m);
    return acc;
  }, {});

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning!' : now.getHours() < 17 ? 'Good Afternoon!' : 'Good Evening!';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Green header banner */}
      <div className="bg-primary px-5 py-5">
        <h1 className="text-[22px] font-bold text-primary-foreground">{greeting}</h1>
        <p className="text-[14px] text-primary-foreground/80 mt-0.5">Today is {dateStr}</p>
      </div>

      {/* My Day title + Add button */}
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-[22px] font-bold text-foreground">My Day</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-[15px] font-semibold flex items-center gap-2 active:scale-95 transition-transform touch-target"
        >
          <Plus className="w-4 h-4" /> Add Activity
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {memories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-[18px] font-bold text-foreground mb-1">No activities yet</h3>
            <p className="text-[15px] text-muted-foreground text-center">
              Tap "Add Activity" to log your first moment.
            </p>
          </div>
        )}

        {Object.entries(groupedByDate).map(([date, entries]) => (
          <div key={date} className="mb-6">
            {date !== 'Today' && (
              <p className="text-[13px] font-semibold text-primary uppercase tracking-wider mb-3">{date}</p>
            )}

            {/* Timeline entries */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[18px] top-6 bottom-6 w-[2px] bg-border/60" />

              <div className="space-y-5">
                {entries.map((memory, i) => {
                  const cat = typeToCategory(memory.type);
                  const IconComp = cat.icon;
                  return (
                    <motion.button
                      key={memory.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => setSelectedMemory(memory)}
                      className="w-full flex gap-4 text-left"
                    >
                      {/* Colored circle icon */}
                      <div className={`w-[38px] h-[38px] rounded-full ${cat.color} flex items-center justify-center shrink-0 z-10 shadow-sm`}>
                        <IconComp className="w-[18px] h-[18px] text-white" />
                      </div>

                      {/* Card */}
                      <div className="flex-1 bg-card rounded-2xl border border-border/40 p-4 shadow-sm active:scale-[0.98] transition-transform">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[13px] font-medium">{memory.time}</span>
                        </div>
                        <h3 className="text-[17px] font-bold text-foreground leading-snug">{memory.title}</h3>
                        {memory.description && (
                          <p className="text-[14px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
                            {memory.description}
                          </p>
                        )}
                        {/* Subtle indicators */}
                        <div className="flex items-center gap-2 mt-2">
                          {memory.cognitiveAnswer && (
                            <span className="text-[11px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">Recalled</span>
                          )}
                          {memory.isFavorite && (
                            <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Activity Bottom Sheet */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/30" onClick={() => setShowAdd(false)}>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl p-5 pb-8 max-h-[85%] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-5" />

              {/* Category selector */}
              <h3 className="text-[18px] font-bold text-foreground mb-4">What did you do?</h3>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {activityCategories.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.type;
                  return (
                    <button
                      key={cat.type}
                      onClick={() => setSelectedCategory(cat.type)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all touch-target ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border/40 bg-card'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-[15px] font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input fields */}
              <input
                type="text"
                placeholder="What happened? (e.g. Called my son)"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full h-12 rounded-xl bg-muted/40 border border-border/30 px-4 text-[15px] text-foreground placeholder:text-muted-foreground mb-3 outline-none focus:ring-2 focus:ring-primary/30 touch-target"
              />
              <textarea
                placeholder="Any details you want to remember..."
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-muted/40 border border-border/30 p-4 text-[15px] text-foreground placeholder:text-muted-foreground mb-5 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />

              {/* Save / Cancel */}
              <div className="flex gap-3">
                <button
                  onClick={saveActivity}
                  disabled={saving || !newTitle.trim()}
                  className="flex-[2] h-12 rounded-xl bg-primary text-primary-foreground text-[16px] font-bold flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 transition-transform touch-target"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save ✓
                </button>
                <button
                  onClick={() => { setShowAdd(false); setSelectedCategory(''); setNewTitle(''); setNewDescription(''); }}
                  className="flex-1 h-12 rounded-xl border border-border/40 text-muted-foreground text-[16px] font-semibold touch-target"
                >
                  Cancel
                </button>
              </div>
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
              <div className="flex justify-between items-center px-5 pt-4 pb-2">
                <p className="text-[13px] font-semibold text-muted-foreground">{selectedMemory.date} · {selectedMemory.time}</p>
                <button onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center touch-target">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="px-5 pb-2">
                <h3 className="text-[20px] font-bold text-foreground">{selectedMemory.title}</h3>
                {selectedMemory.description && (
                  <p className="text-[15px] text-muted-foreground mt-2 leading-relaxed">{selectedMemory.description}</p>
                )}
              </div>

              {/* Cognitive Recall */}
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
                      <input type="text" value={cognitiveInput} onChange={e => setCognitiveInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && answerCognitivePrompt()} placeholder="Your answer..." className="flex-1 h-10 rounded-lg bg-card px-3 text-[15px] text-foreground outline-none focus:ring-2 focus:ring-primary/30 touch-target" autoFocus />
                      <button onClick={answerCognitivePrompt} className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center touch-target"><Send className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="px-5 py-4 flex gap-3">
                <button
                  onClick={() => { toggleFavorite(selectedMemory.id); setSelectedMemory(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null); }}
                  className={`flex-1 h-11 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 touch-target transition-colors ${
                    selectedMemory.isFavorite ? 'bg-destructive/10 text-destructive' : 'bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${selectedMemory.isFavorite ? 'fill-destructive' : ''}`} />
                  {selectedMemory.isFavorite ? 'Saved' : 'Save'}
                </button>
                <button onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }} className="flex-1 h-11 rounded-xl bg-muted/40 text-muted-foreground text-[15px] font-semibold touch-target">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
