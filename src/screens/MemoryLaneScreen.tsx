import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Phone, MapPin, Users, MessageSquare, Clock, Heart, X, Send, Loader2, ChevronRight, ChevronDown, Image, Mic, Sparkles, Check } from 'lucide-react';
import IconBox, { iosColors } from '@/components/ui/IconBox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
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
  { type: 'phone', icon: Phone, label: 'Phone Call' },
  { type: 'place', icon: MapPin, label: 'Visited Place' },
  { type: 'person', icon: Users, label: 'Met Someone' },
  { type: 'other', icon: MessageSquare, label: 'Other' },
];

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

const typeIcon = (type: string) => {
  if (type === 'photo') return Image;
  if (type === 'voice') return Mic;
  return MessageSquare;
};

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
        emoji: m.emoji || '',
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

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center ios-grouped-bg">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col ios-grouped-bg relative">
      {/* iOS Large Title with + in nav bar */}
      <div className="px-4 pt-4 pb-1 flex items-center justify-between">
        <div>
          <h1 className="text-ios-large-title text-foreground">Timeline</h1>
          <p className="text-ios-subheadline text-muted-foreground mt-1">{dateStr}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center touch-target">
          <Plus className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {memories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <Clock className="w-10 h-10 text-muted-foreground/20 mb-5" />
            <h3 className="text-ios-title2 text-foreground mb-2">No memories yet</h3>
            <p className="text-ios-subheadline text-muted-foreground text-center">
              Tap + to log your first moment.
            </p>
          </div>
        )}

        {Object.entries(groupedByDate).map(([date, entries]) => (
          <div key={date} className="mt-5">
            <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">{date} · {entries.length} memor{entries.length > 1 ? 'ies' : 'y'}</p>
            <div className="mx-4 ios-card overflow-hidden divide-y divide-border/30">
              {entries.map((memory) => {
                const IconComp = typeIcon(memory.type);
                return (
                  <button
                    key={memory.id}
                    onClick={() => setSelectedMemory(memory)}
                    className="w-full flex items-center gap-3 px-4 text-left touch-target"
                    style={{ minHeight: 56 }}
                  >
                    <IconBox Icon={IconComp} color={memory.type === 'photo' ? iosColors.blue : memory.type === 'voice' ? iosColors.orange : iosColors.green} />
                    <div className="flex-1 min-w-0">
                      <p className="text-ios-callout font-medium text-foreground line-clamp-1">{memory.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-ios-footnote text-muted-foreground">{memory.time}</span>
                        {memory.cognitiveAnswer && (
                          <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Recalled</span>
                        )}
                      </div>
                    </div>
                    {memory.isFavorite && <Heart className="w-4 h-4 text-muted-foreground shrink-0" />}
                    <ChevronRight className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ===== ADD ACTIVITY MODAL ===== */}
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
              className="w-full bg-card rounded-t-2xl max-h-[88%] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted" />
              </div>

              <div className="px-5 pb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-ios-title2 text-foreground">What did you do?</h3>
                  <button onClick={() => { setShowAdd(false); setSelectedCategory(''); setNewTitle(''); setNewDescription(''); }} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center touch-target">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Category as grouped list */}
                <div className="ios-card overflow-hidden divide-y divide-border/30 mb-4">
                  {activityCategories.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.type;
                    return (
                      <button
                        key={cat.type}
                        onClick={() => setSelectedCategory(cat.type)}
                        className="w-full flex items-center gap-3 px-4 text-left touch-target"
                        style={{ minHeight: 48 }}
                      >
                        <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                        <span className={`text-ios-callout font-medium flex-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>{cat.label}</span>
                        {isSelected && <Check className="w-5 h-5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <Input
                  placeholder="What happened?"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="h-11 rounded-xl text-ios-callout mb-3"
                />
                <Textarea
                  placeholder="Any details..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  rows={2}
                  className="rounded-xl text-ios-callout mb-4 resize-none"
                />

                <div className="flex gap-3">
                  <Button
                    onClick={saveActivity}
                    disabled={saving || !newTitle.trim()}
                    className="flex-1 h-12 rounded-xl text-ios-callout font-semibold"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => { setShowAdd(false); setSelectedCategory(''); setNewTitle(''); setNewDescription(''); }}
                    className="h-12 rounded-xl text-ios-callout font-semibold px-6"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MEMORY DETAIL MODAL ===== */}
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
              className="bg-card w-full rounded-t-2xl max-h-[80%] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted" />
              </div>

              <div className="px-5 pb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-ios-footnote text-muted-foreground">{selectedMemory.date} · {selectedMemory.time}</p>
                  <button onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center touch-target">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <h3 className="text-ios-title2 text-foreground">{selectedMemory.title}</h3>
                {selectedMemory.description && (
                  <p className="text-ios-callout text-muted-foreground mt-2 leading-relaxed">{selectedMemory.description}</p>
                )}

                {/* Cognitive Recall */}
                {selectedMemory.cognitivePrompt && (
                  <div className="mt-4 ios-card p-4">
                    <p className="text-ios-footnote font-semibold text-primary mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Recall Exercise
                    </p>
                    <p className="text-ios-callout font-medium text-foreground">{selectedMemory.cognitivePrompt}</p>
                    {selectedMemory.cognitiveAnswer ? (
                      <p className="mt-2 text-ios-callout text-muted-foreground">Answered: {selectedMemory.cognitiveAnswer}</p>
                    ) : !showCognitivePrompt ? (
                      <button onClick={() => setShowCognitivePrompt(true)} className="mt-2 text-ios-callout font-semibold text-primary">
                        Try to recall →
                      </button>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <Input
                          value={cognitiveInput}
                          onChange={e => setCognitiveInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && answerCognitivePrompt()}
                          placeholder="Your answer..."
                          className="h-11 rounded-xl text-ios-callout"
                          autoFocus
                        />
                        <Button onClick={answerCognitivePrompt} size="icon" className="h-11 w-11 rounded-xl shrink-0">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <Separator className="my-5" />

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => { toggleFavorite(selectedMemory.id); setSelectedMemory(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null); }}
                    className="flex-1 h-11 rounded-xl font-semibold gap-2"
                  >
                    <Heart className={`w-4 h-4 ${selectedMemory.isFavorite ? 'text-muted-foreground fill-muted-foreground' : ''}`} />
                    {selectedMemory.isFavorite ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => { setSelectedMemory(null); setShowCognitivePrompt(false); }}
                    className="flex-1 h-11 rounded-xl font-semibold"
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
