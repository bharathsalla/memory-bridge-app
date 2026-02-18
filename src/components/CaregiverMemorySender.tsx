import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Send, MapPin, Image, Sparkles, ChevronRight, Eye, Clock, Brain, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Demo photos for upload simulation
const demoPhotos = [
  { url: familyDinner, label: 'Family dinner' },
  { url: gardenMorning, label: 'Garden walk' },
  { url: beachGrandkids, label: 'Beach day' },
  { url: birthdayCelebration, label: 'Birthday party' },
  { url: morningTea, label: 'Morning tea' },
  { url: parkPicnic, label: 'Park picnic' },
];

export default function CaregiverMemorySender() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    location: '',
    selectedPhoto: '',
  });
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
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
          <Brain className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <h2 className="text-[17px] font-extrabold text-foreground">Memory Manager</h2>
          <p className="text-[12px] text-muted-foreground font-medium">Send memories to your patient</p>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {justSent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 bg-success/10 border border-success/20 rounded-xl px-4 py-3 flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
              <Send className="w-3 h-3 text-white" />
            </div>
            <p className="text-[13px] font-bold text-success">Memory sent to patient's Memories tab!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Memory Button / Form */}
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-card rounded-2xl border-2 border-dashed border-primary/30 p-5 flex items-center gap-4 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="text-[15px] font-bold text-foreground">Add & Send New Memory</p>
                <p className="text-[12px] text-muted-foreground font-medium mt-0.5">Upload photos, add location & message</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/40" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <p className="text-[16px] font-bold text-foreground">New Memory for Patient</p>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Photo Selection */}
              <div>
                <p className="text-[13px] font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Select a Photo
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {demoPhotos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setForm(f => ({ ...f, selectedPhoto: photo.url }))}
                      className={`relative rounded-xl overflow-hidden aspect-square transition-all ${
                        form.selectedPhoto === photo.url ? 'ring-3 ring-primary scale-[0.95]' : 'ring-1 ring-border/40'
                      }`}
                    >
                      <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                      {form.selectedPhoto === photo.url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                            <Image className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                      <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                        <span className="text-[10px] font-bold text-white">{photo.label}</span>
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <p className="text-[13px] font-bold text-muted-foreground mb-1.5">Memory Title</p>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Remember our beach trip?"
                  className="w-full h-11 px-4 rounded-xl bg-muted text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none"
                />
              </div>

              {/* Personal Message */}
              <div>
                <p className="text-[13px] font-bold text-muted-foreground mb-1.5">Personal Message</p>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Write a warm message to help recall this memory..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-muted text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none resize-none"
                />
              </div>

              {/* Location */}
              <div>
                <p className="text-[13px] font-bold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Location (optional)
                </p>
                <input
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. KBR National Park, Hyderabad"
                  className="w-full h-11 px-4 rounded-xl bg-muted text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none"
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={!form.title.trim() || !form.selectedPhoto || sending}
                className="w-full h-12 rounded-xl text-[15px] font-bold gap-2"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recently Sent */}
      <div className="mt-5 space-y-3">
        <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">Recently Sent</p>
        {recentSent.length === 0 ? (
          <div className="bg-muted/20 rounded-xl p-6 text-center">
            <p className="text-[13px] text-muted-foreground font-medium">No memories sent yet. Add one above!</p>
          </div>
        ) : (
          recentSent.map((mem: any, i: number) => (
            <motion.div key={mem.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-3.5">
                  {mem.photo_url ? (
                    <img src={mem.photo_url} alt={mem.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0 text-2xl">{mem.emoji}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-foreground line-clamp-1">{mem.title}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 font-medium">
                      Sent {mem.shared_at ? new Date(mem.shared_at).toLocaleDateString() : 'recently'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${mem.viewed_by_patient ? 'bg-success' : 'bg-accent'}`} />
                      <span className={`text-[11px] font-bold ${mem.viewed_by_patient ? 'text-success' : 'text-accent'}`}>
                        {mem.viewed_by_patient ? 'Viewed' : 'Delivered'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* AI Suggestions */}
      <div className="mt-5 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-[13px] font-bold text-foreground">AI Suggests These Memories</p>
        </div>
        <p className="text-[12px] text-muted-foreground font-medium mb-3">Based on patient mood & recall patterns</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {[
            { image: birthdayCelebration, label: 'Birthday 2024' },
            { image: morningTea, label: 'Morning routine' },
            { image: gardenMorning, label: 'Garden walk' },
          ].map((sug, i) => (
            <button
              key={i}
              onClick={() => {
                setForm(f => ({ ...f, selectedPhoto: sug.image, title: sug.label }));
                setShowForm(true);
              }}
              className="shrink-0 w-24 active:scale-95 transition-transform"
            >
              <img src={sug.image} alt={sug.label} className="w-24 h-20 rounded-xl object-cover" />
              <p className="text-[11px] font-bold text-foreground mt-1.5 text-center line-clamp-1">{sug.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Sync Status */}
      <div className="mt-4 bg-muted/30 rounded-xl p-3 flex items-center gap-3 border border-border/30">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <p className="text-[12px] text-muted-foreground font-medium">
          Live sync with patient's Memories tab · {sharedMemories.length} memories shared
        </p>
      </div>
    </div>
  );
}
