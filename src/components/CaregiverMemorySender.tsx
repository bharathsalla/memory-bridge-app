import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Send, MapPin, Image, Sparkles, Eye, Brain, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import familyDinner from '@/assets/memories/family-dinner.jpg';
import gardenMorning from '@/assets/memories/garden-morning.jpg';
import beachGrandkids from '@/assets/memories/beach-grandkids.jpg';
import birthdayCelebration from '@/assets/memories/birthday-celebration.jpg';
import morningTea from '@/assets/memories/morning-tea.jpg';
import parkPicnic from '@/assets/memories/park-picnic.jpg';

// ── Hook: shared memories ──
export function useSharedMemories() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['shared-memories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .not('shared_by', 'is', null)
        .order('shared_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  return query;
}

export function useSendMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memory: {
      title: string;
      description: string;
      shared_by: string;
      shared_message: string;
      location: string;
      photo_url: string;
      emoji: string;
    }) => {
      const { data, error } = await supabase
        .from('memories')
        .insert({
          title: memory.title,
          description: memory.description,
          type: 'photo',
          emoji: memory.emoji || '📸',
          mood: '😊',
          shared_by: memory.shared_by,
          shared_message: memory.shared_message,
          location: memory.location,
          photo_url: memory.photo_url,
          shared_at: new Date().toISOString(),
          viewed_by_patient: false,
          engagement_score: 70,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-memories'] });
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
}

const demoPhotos = [
  { url: familyDinner, label: 'Family dinner' },
  { url: gardenMorning, label: 'Garden walk' },
  { url: beachGrandkids, label: 'Beach day' },
  { url: birthdayCelebration, label: 'Birthday party' },
  { url: morningTea, label: 'Morning tea' },
  { url: parkPicnic, label: 'Park picnic' },
];

const aiSuggestions = [
  { image: birthdayCelebration, label: 'Birthday 2024', reason: 'High recall potential', score: 92 },
  { image: morningTea, label: 'Morning routine', reason: 'Calming effect observed', score: 87 },
  { image: gardenMorning, label: 'Garden walk', reason: 'Positive mood trigger', score: 84 },
];

export default function CaregiverMemorySender() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', location: '', selectedPhoto: '' });
  const [sending, setSending] = useState(false);
  const [justSent, setJustSent] = useState(false);

  const { data: sharedMemories = [] } = useSharedMemories();
  const sendMemory = useSendMemory();

  const handleSend = async () => {
    if (!form.title.trim() || !form.selectedPhoto) return;
    setSending(true);
    try {
      await sendMemory.mutateAsync({
        title: form.title,
        description: form.message || form.title,
        shared_by: 'Sarah',
        shared_message: form.message,
        location: form.location,
        photo_url: form.selectedPhoto,
        emoji: '📸',
      });
      setJustSent(true);
      setForm({ title: '', message: '', location: '', selectedPhoto: '' });
      setShowForm(false);
      setTimeout(() => setJustSent(false), 3000);
    } finally {
      setSending(false);
    }
  };

  const recentSent = sharedMemories.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-[17px] font-extrabold text-foreground">Memory Manager</h2>
          <p className="text-[12px] text-muted-foreground font-medium">Send & manage patient memories</p>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {justSent && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
          >
            <Card className="border-success/30 bg-success/5">
              <CardContent className="p-3 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                <p className="text-[13px] font-semibold text-success">Memory sent to patient's Memories tab!</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Memory Button / Form */}
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card
              className="border-dashed border-2 border-primary/25 bg-primary/[0.02] cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => setShowForm(true)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-foreground">Add & Send New Memory</p>
                  <p className="text-[12px] text-muted-foreground font-medium mt-0.5">Photos, location & personal message</p>
                </div>
                <Send className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[16px]">New Memory</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>Choose a photo and add context for the patient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Photo Grid */}
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Camera className="w-3.5 h-3.5" /> Select Photo
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {demoPhotos.map((photo, i) => (
                      <button
                        key={i}
                        onClick={() => setForm(f => ({ ...f, selectedPhoto: photo.url }))}
                        className={`relative rounded-xl overflow-hidden aspect-square transition-all ${
                          form.selectedPhoto === photo.url
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-card scale-[0.96]'
                            : 'ring-1 ring-border hover:ring-primary/30'
                        }`}
                      >
                        <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                        {form.selectedPhoto === photo.url && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-primary-foreground drop-shadow-md" />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent px-2 py-1.5">
                          <span className="text-[10px] font-semibold text-white">{photo.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Title */}
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Memory Title
                  </label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Remember our beach trip?"
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Personal Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Write a warm message to recall this memory..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none resize-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Location (optional)
                  </label>
                  <input
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. KBR National Park, Hyderabad"
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
                  />
                </div>

                {/* Send */}
                <Button
                  onClick={handleSend}
                  disabled={!form.title.trim() || !form.selectedPhoto || sending}
                  className="w-full h-11 rounded-xl text-[14px] font-bold gap-2"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Memory to Patient
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Suggestions */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/[0.04] to-accent/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-[14px]">AI Suggestions</CardTitle>
                <CardDescription className="text-[11px]">Based on mood & recall patterns</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px] font-semibold bg-primary/10 text-primary border-none">
              Smart Pick
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-2">
            {aiSuggestions.map((sug, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => {
                  setForm(f => ({ ...f, selectedPhoto: sug.image, title: sug.label }));
                  setShowForm(true);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 active:scale-[0.98] transition-all text-left group"
              >
                <img src={sug.image} alt={sug.label} className="w-14 h-14 rounded-lg object-cover shrink-0 ring-1 ring-border" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-foreground">{sug.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{sug.reason}</p>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center">
                    <span className="text-[12px] font-extrabold text-primary">{sug.score}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground font-medium">Score</span>
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recently Sent */}
      <div>
        <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          Recently Sent · {recentSent.length}
        </h3>
        {recentSent.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Image className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground font-medium">No memories sent yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentSent.map((mem: any, i: number) => (
              <motion.div key={mem.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="p-3 flex items-center gap-3">
                    {mem.photo_url ? (
                      <img src={mem.photo_url} alt={mem.title} className="w-14 h-14 rounded-lg object-cover shrink-0 ring-1 ring-border" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0 text-xl">{mem.emoji}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-foreground line-clamp-1">{mem.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                        Sent {mem.shared_at ? new Date(mem.shared_at).toLocaleDateString() : 'recently'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge
                          variant={mem.viewed_by_patient ? 'secondary' : 'outline'}
                          className={`text-[10px] h-5 px-2 font-semibold ${
                            mem.viewed_by_patient
                              ? 'bg-success/10 text-success border-success/20'
                              : 'text-accent border-accent/20'
                          }`}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {mem.viewed_by_patient ? 'Viewed' : 'Delivered'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Indicator */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        <p className="text-[11px] text-muted-foreground font-medium">
          Live sync · {sharedMemories.length} memories shared
        </p>
      </div>
    </div>
  );
}
