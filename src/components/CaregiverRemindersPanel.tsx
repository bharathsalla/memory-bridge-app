import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Camera, Pill, UtensilsCrossed, Footprints, MessageCircle, Heart, Bell, Clock, Check, X, Upload, Brain, TrendingUp, Mic } from 'lucide-react';
import { useSendCaregiverReminder, useReminderLogs, useLearnedPatterns, useAnalyzePatterns } from '@/hooks/useReminders';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import VoiceReminderFlow from './VoiceReminderFlow';

const reminderTypes = [
  { value: 'medication', label: '💊 Medication', defaultMessage: 'Time to take your medication' },
  { value: 'meal', label: '🍽️ Meal Time', defaultMessage: 'Time for a meal' },
  { value: 'exercise', label: '🚶 Exercise', defaultMessage: 'Time for a walk' },
  { value: 'check_in', label: '😊 Check-In', defaultMessage: 'How are you feeling?' },
  { value: 'custom', label: '✏️ Custom', defaultMessage: '' },
];

export default function CaregiverRemindersPanel() {
  const [activeTab, setActiveTab] = useState<'voice' | 'send' | 'logs' | 'patterns'>('voice');
  const [type, setType] = useState('medication');
  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const sendReminder = useSendCaregiverReminder();
  const { data: logs = [] } = useReminderLogs();
  const { data: patterns = [] } = useLearnedPatterns();
  const analyzePatterns = useAnalyzePatterns();

  const selectedType = reminderTypes.find(t => t.value === type);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const filename = `reminders/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('reminder-photos').upload(filename, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('reminder-photos').getPublicUrl(filename);
      setPhotoUrl(urlData.publicUrl);
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSend = () => {
    const msg = type === 'custom' ? message : (selectedType?.defaultMessage || message);
    if (!msg.trim()) return;
    sendReminder.mutate(
      { type, message: msg, photoUrl: photoUrl || undefined, caregiverName: 'Sarah' },
      {
        onSuccess: () => {
          toast({ title: '✅ Reminder sent!' });
          setMessage('');
          setPhotoUrl('');
          setType('medication');
        },
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  return (
    <div className="h-full overflow-y-auto warm-gradient pb-6">
      {/* Tabs */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex bg-muted/50 rounded-2xl p-1">
          {[
            { id: 'voice' as const, label: 'Voice', icon: Mic },
            { id: 'send' as const, label: 'Send', icon: Bell },
            { id: 'logs' as const, label: 'Activity', icon: Clock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 h-9 rounded-xl text-[11px] font-semibold transition-all ${
                activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Tab */}
      {activeTab === 'voice' && <VoiceReminderFlow />}

      {/* Send Tab */}
      {activeTab === 'send' && (
        <div className="px-4 pt-2 space-y-4">
          <h2 className="text-[16px] font-bold text-foreground">Send Reminder to Patient</h2>

          {/* Type */}
          <div className="flex flex-wrap gap-2">
            {reminderTypes.map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`px-3 py-2 rounded-xl text-[13px] font-semibold border-2 transition-all ${
                  type === t.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Custom message */}
          {type === 'custom' && (
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Enter your custom message..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-muted/50 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border/20 focus:border-primary/30 resize-none"
            />
          )}

          {/* Photo upload */}
          <div>
            <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/50 border border-border/20 cursor-pointer active:bg-muted transition-colors">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-[14px] text-muted-foreground">
                {uploading ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Add Photo (Optional)'}
              </span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {photoUrl && (
              <div className="relative mt-2">
                <img src={photoUrl} alt="" className="w-full h-32 object-cover rounded-xl" />
                <button
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={sendReminder.isPending}
            className="w-full h-13 rounded-xl bg-success text-success-foreground font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 touch-target"
          >
            <Send className="w-5 h-5" />
            {sendReminder.isPending ? 'Sending...' : 'Send Reminder Now'}
          </button>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="px-4 pt-2">
          <h2 className="text-[16px] font-bold text-foreground mb-3">Reminder Activity</h2>
          {logs.length === 0 ? (
            <div className="ios-card-elevated p-8 text-center text-muted-foreground text-[14px]">No activity yet</div>
          ) : (
            <div className="space-y-2">
              {logs.map((log: any, i: number) => {
                const eventEmoji: Record<string, string> = {
                  sent: '📤', completed: '✅', snoozed: '⏰', missed: '❌', caregiver_triggered: '👨‍⚕️',
                };
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="ios-card-elevated flex items-center gap-3 p-3"
                  >
                    <span className="text-[18px]">{eventEmoji[log.event_type] || '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-foreground capitalize">{log.event_type?.replace('_', ' ')}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {log.reminders?.title || 'Reminder'} · {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                    {log.triggered_by_name && (
                      <span className="text-[11px] text-primary font-medium">by {log.triggered_by_name}</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className="px-4 pt-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-bold text-foreground">Learned Patterns</h2>
            <button
              onClick={() => analyzePatterns.mutate(undefined, { onSuccess: () => toast({ title: '🧠 Analysis complete' }) })}
              disabled={analyzePatterns.isPending}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold active:scale-95 transition-transform"
            >
              {analyzePatterns.isPending ? 'Analyzing...' : '🔄 Refresh'}
            </button>
          </div>
          {patterns.length === 0 ? (
            <div className="ios-card-elevated p-8 text-center">
              <Brain className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <div className="text-[14px] text-muted-foreground">Not enough data yet</div>
              <div className="text-[12px] text-muted-foreground/70 mt-1">Patterns emerge after 7+ days of activity</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {patterns.map((p: any, i: number) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="ios-card-elevated p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-lavender/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-lavender" />
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-foreground">
                        {p.hour != null ? `${p.hour.toString().padStart(2, '0')}:00` : 'All day'} — {(Number(p.success_rate) * 100).toFixed(0)}% success
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Confidence: {(Number(p.confidence_score) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  {p.recommended_actions && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.recommended_actions.map((action: string) => (
                        <span key={action} className="px-2 py-0.5 rounded-md bg-primary/8 text-primary text-[10px] font-semibold">
                          {action.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
