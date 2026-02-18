import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Phone, MapPin, Users, MessageSquare, Clock, Heart, X, Send, Sparkles, Loader2, ChevronRight, ChevronDown, Image, Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

  // Yesterday's memories
  const yesterdayMemories = useMemo(() => {
    return memories.filter(m => m.date === 'Yesterday');
  }, [memories]);

  // Recent memories (last 7 days, excluding today)
  const recentMemories = useMemo(() => {
    return memories.filter(m => m.date !== 'Today');
  }, [memories]);

  const [showAllYesterday, setShowAllYesterday] = useState(false);
  const displayedYesterday = showAllYesterday ? yesterdayMemories : yesterdayMemories.slice(0, 4);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning!' : now.getHours() < 17 ? 'Good Afternoon!' : 'Good Evening!';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const typeIcon = (type: string) => {
    if (type === 'photo') return <Image className="w-4 h-4" />;
    if (type === 'voice') return <Mic className="w-4 h-4" />;
    return <MessageSquare className="w-4 h-4" />;
  };

  const memoryCardStyles = [
    'from-destructive/5 to-destructive/10 border-destructive/20',
    'from-warning/5 to-warning/10 border-warning/20',
    'from-primary/5 to-primary/10 border-primary/20',
    'from-success/5 to-success/10 border-success/20',
    'from-accent/5 to-accent/10 border-accent/20',
    'from-secondary/5 to-secondary/10 border-secondary/20',
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <Loader2 className="w-9 h-9 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col ios-grouped-bg relative">
      {/* iOS Large Title */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-ios-large-title text-foreground">Timeline</h1>
          <p className="text-ios-subheadline text-muted-foreground mt-1">{dateStr}</p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm" className="h-9 px-3 rounded-full text-ios-footnote font-semibold gap-1">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">

        {/* Yesterday's Memories — Featured Section */}
        {yesterdayMemories.length > 0 && (
          <div className="px-5 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm">
                  <Heart className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-foreground">Yesterday's Memories</h2>
                  <p className="text-[12px] text-muted-foreground font-medium">{yesterdayMemories.length} moment{yesterdayMemories.length > 1 ? 's' : ''} captured</p>
                </div>
              </div>
              {yesterdayMemories.length > 4 && (
                <Button variant="ghost" size="sm" onClick={() => setShowAllYesterday(!showAllYesterday)} className="text-[13px] text-primary font-semibold gap-1 h-8 px-2">
                  {showAllYesterday ? 'Less' : 'Show All'}
                  {showAllYesterday ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {displayedYesterday.map((mem, i) => (
                <motion.button
                  key={mem.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setSelectedMemory(mem)}
                  className="text-left"
                >
                  <div className={`rounded-2xl bg-gradient-to-br ${memoryCardStyles[i % memoryCardStyles.length]} border p-4 h-[130px] flex flex-col justify-between shadow-sm active:scale-[0.97] transition-transform`}>
                    <div className="flex items-start justify-between">
                      <span className="text-[32px] leading-none">{mem.emoji}</span>
                      <div className="flex items-center gap-1">
                        {mem.isFavorite && <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" />}
                        {mem.cognitiveAnswer && <Sparkles className="w-3.5 h-3.5 text-success" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-foreground leading-tight line-clamp-2">{mem.title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {typeIcon(mem.type)}
                        <span className="text-[11px] text-muted-foreground font-medium">{mem.time}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <Separator className="mt-5" />
          </div>
        )}

        {/* All Memories Timeline */}
        <div className="px-5 pt-4">
          <h2 className="text-[18px] font-bold text-foreground mb-4">All Memories</h2>

          {memories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-[20px] font-bold text-foreground mb-2">No memories yet</h3>
              <p className="text-[16px] text-muted-foreground text-center leading-relaxed">
                Tap "Add" to log your first moment.
              </p>
            </div>
          )}

          {Object.entries(groupedByDate).map(([date, entries]) => (
            <div key={date} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-[12px] font-bold bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5">
                  {date}
                </Badge>
                <span className="text-[12px] text-muted-foreground font-medium">{entries.length} memor{entries.length > 1 ? 'ies' : 'y'}</span>
              </div>

              <div className="space-y-2.5">
                {entries.map((memory, i) => {
                  const cat = typeToCategory(memory.type);
                  const IconComp = cat.icon;
                  return (
                    <motion.button
                      key={memory.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelectedMemory(memory)}
                      className="w-full text-left"
                    >
                      <Card className="border border-border shadow-sm active:scale-[0.98] transition-transform hover:shadow-md">
                        <CardContent className="p-4 flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 text-[22px]">
                            {memory.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[16px] font-bold text-foreground leading-tight line-clamp-1">{memory.title}</p>
                            {memory.description && (
                              <p className="text-[13px] text-muted-foreground mt-0.5 line-clamp-1 font-medium">{memory.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[12px] text-muted-foreground/70 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {memory.time}
                              </span>
                              {memory.cognitiveAnswer && (
                                <Badge variant="secondary" className="text-[10px] font-bold bg-success/10 text-success border-success/20 px-1.5 py-0">✓ Recalled</Badge>
                              )}
                            </div>
                          </div>
                          {memory.isFavorite && <Heart className="w-4 h-4 text-destructive fill-destructive shrink-0" />}
                          <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                        </CardContent>
                      </Card>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ADD ACTIVITY MODAL (inline, inside app) ===== */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/30 flex items-end"
            onClick={() => { setShowAdd(false); setSelectedCategory(''); setNewTitle(''); setNewDescription(''); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="w-full bg-card rounded-t-2xl shadow-xl max-h-[88%] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted" />
              </div>

              <div className="px-5 pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[22px] font-bold text-foreground">What did you do?</h3>
                  <button onClick={() => { setShowAdd(false); setSelectedCategory(''); setNewTitle(''); setNewDescription(''); }} className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center touch-target">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Category grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {activityCategories.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.type;
                    return (
                      <button
                        key={cat.type}
                        onClick={() => setSelectedCategory(cat.type)}
                        className={`flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl border-2 transition-all touch-target ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-[16px] font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                <Separator className="mb-5" />

                {/* Inputs */}
                <Input
                  placeholder="What happened? (e.g. Called my son)"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="h-14 rounded-xl text-[17px] mb-3 border-border"
                />
                <Textarea
                  placeholder="Any details you want to remember..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  rows={3}
                  className="rounded-xl text-[17px] mb-6 border-border resize-none"
                />

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={saveActivity}
                    disabled={saving || !newTitle.trim()}
                    size="lg"
                    className="flex-[2] h-14 rounded-xl text-[18px] font-bold gap-2"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    Save ✓
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setShowAdd(false); setSelectedCategory(''); setNewTitle(''); setNewDescription(''); }}
                    size="lg"
                    className="flex-1 h-14 rounded-xl text-[18px] font-semibold border-border"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MEMORY DETAIL MODAL (inline, inside app) ===== */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/30 flex items-end"
            onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="bg-card w-full rounded-t-2xl shadow-xl max-h-[80%] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted" />
              </div>

              <div className="px-5 pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[15px] font-medium text-muted-foreground">{selectedMemory.date} · {selectedMemory.time}</p>
                  <button onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }} className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center touch-target">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <h3 className="text-[22px] font-bold text-foreground">{selectedMemory.title}</h3>
                {selectedMemory.description && (
                  <p className="text-[17px] text-muted-foreground mt-2 leading-relaxed">{selectedMemory.description}</p>
                )}

                {/* Cognitive Recall */}
                {selectedMemory.cognitivePrompt && (
                  <Card className="mt-4 border border-primary/15 bg-primary/5 shadow-none">
                    <CardContent className="p-4">
                      <p className="text-[15px] font-semibold text-primary mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Recall Exercise
                      </p>
                      <p className="text-[17px] font-medium text-foreground">{selectedMemory.cognitivePrompt}</p>
                      {selectedMemory.cognitiveAnswer ? (
                        <p className="mt-3 text-[16px] text-success font-semibold">✓ {selectedMemory.cognitiveAnswer}</p>
                      ) : !showCognitivePrompt ? (
                        <button onClick={() => setShowCognitivePrompt(true)} className="mt-2 text-[16px] font-semibold text-primary touch-target">
                          Try to recall →
                        </button>
                      ) : (
                        <div className="mt-3 flex gap-2">
                          <Input
                            value={cognitiveInput}
                            onChange={e => setCognitiveInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && answerCognitivePrompt()}
                            placeholder="Your answer..."
                            className="h-12 rounded-xl text-[16px] touch-target"
                            autoFocus
                          />
                          <Button onClick={answerCognitivePrompt} size="icon" className="h-12 w-12 rounded-xl shrink-0 touch-target">
                            <Send className="w-5 h-5" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Separator className="my-5" />

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => { toggleFavorite(selectedMemory.id); setSelectedMemory(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null); }}
                    size="lg"
                    className={`flex-1 h-13 rounded-xl text-[17px] font-semibold gap-2 border-border ${selectedMemory.isFavorite ? 'text-destructive border-destructive/30' : ''}`}
                  >
                    <Heart className={`w-5 h-5 ${selectedMemory.isFavorite ? 'fill-destructive text-destructive' : ''}`} />
                    {selectedMemory.isFavorite ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }}
                    size="lg"
                    className="flex-1 h-13 rounded-xl text-[17px] font-semibold border-border"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
