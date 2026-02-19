import { useState } from 'react';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { motion } from 'framer-motion';
import { Send, Camera, Pill, UtensilsCrossed, Footprints, MessageCircle, Heart, Bell, Clock, Check, X, Upload, Brain, TrendingUp, Mic, Smile, Edit3, ArrowUpFromLine, AlertCircle, UserCheck, ClipboardList, Sparkles, Loader2 } from 'lucide-react';
import IconBox, { iosColors, getColor } from '@/components/ui/IconBox';
import { useSendCaregiverReminder, useReminderLogs, useLearnedPatterns, useAnalyzePatterns } from '@/hooks/useReminders';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import VoiceReminderFlow from './VoiceReminderFlow';

const reminderTypes = [
  { value: 'medication', label: 'Medication', Icon: Pill, color: iosColors.orange, defaultMessage: 'Time to take your medication' },
  { value: 'meal', label: 'Meal Time', Icon: UtensilsCrossed, color: iosColors.green, defaultMessage: 'Time for a meal' },
  { value: 'exercise', label: 'Exercise', Icon: Footprints, color: iosColors.blue, defaultMessage: 'Time for a walk' },
  { value: 'check_in', label: 'Check-In', Icon: Smile, color: iosColors.purple, defaultMessage: 'How are you feeling?' },
  { value: 'custom', label: 'Custom', Icon: Edit3, color: iosColors.teal, defaultMessage: '' },
];

export default function CaregiverRemindersPanel() {
  const [activeTab, setActiveTab] = useState<'voice' | 'send' | 'logs' | 'patterns'>('voice');
  const [type, setType] = useState('medication');
  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medQty, setMedQty] = useState('');
  const [medInstructions, setMedInstructions] = useState('');
  const [medTime, setMedTime] = useState('');
  const [medPeriod, setMedPeriod] = useState('Morning');
  const [medFoodInstruction, setMedFoodInstruction] = useState('With Food');

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

  const handleMedicinePhotoExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    try {
      // Upload the photo first
      const filename = `reminders/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from('reminder-photos').upload(filename, file);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from('reminder-photos').getPublicUrl(filename);
      setPhotoUrl(urlData.publicUrl);

      // Convert to base64 for AI
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      // Call AI extraction
      const { data, error } = await supabase.functions.invoke('extract-medicine', {
        body: { imageBase64: base64 },
      });

      if (error) throw error;

      // Populate fields
      if (data.name) setMedName(data.name);
      if (data.dosage) setMedDosage(data.dosage);
      if (data.qty) setMedQty(data.qty);
      if (data.instructions) setMedInstructions(data.instructions);
      if (data.period && ['Morning', 'Afternoon', 'Night'].includes(data.period)) setMedPeriod(data.period);
      if (data.foodInstruction && ['With Food', 'Without Food', 'Before Food'].includes(data.foodInstruction)) setMedFoodInstruction(data.foodInstruction);

      toast({ title: 'Medicine details extracted!' });
    } catch (err: any) {
      toast({ title: 'Extraction failed', description: err.message, variant: 'destructive' });
    } finally {
      setExtracting(false);
    }
  };

  const handleSend = () => {
    let msg: string;
    if (type === 'medication') {
      msg = medName ? `${medName} ${medDosage} ${medQty}`.trim() : (selectedType?.defaultMessage || '');
    } else if (type === 'custom') {
      msg = message;
    } else {
      msg = selectedType?.defaultMessage || message;
    }
    if (!msg.trim()) return;
    sendReminder.mutate(
      { type, message: msg, photoUrl: photoUrl || undefined, caregiverName: 'Sarah', medName, medDosage, medQty, medInstructions: `${medPeriod} · ${medFoodInstruction}${medInstructions ? ' · ' + medInstructions : ''}`, medTime, medPeriod, medFoodInstruction },
      {
        onSuccess: () => {
          toast({ title: 'Reminder sent!' });
          setMessage('');
          setPhotoUrl('');
          setType('medication');
          setMedName('');
          setMedDosage('');
          setMedQty('');
          setMedInstructions('');
          setMedTime('');
          setMedPeriod('Morning');
          setMedFoodInstruction('With Food');
        },
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  return (
    <div className="h-full overflow-y-auto warm-gradient pb-6">
      {/* Tabs */}
      <div className="px-4 pt-3 pb-2">
        <SegmentedControl
          value={activeTab}
          onChange={(v) => setActiveTab(v as 'voice' | 'send' | 'logs')}
          items={[
            { value: 'voice', icon: <Mic className="w-3.5 h-3.5" />, label: 'Voice' },
            { value: 'send', icon: <Bell className="w-3.5 h-3.5" />, label: 'Send' },
            { value: 'logs', icon: <Clock className="w-3.5 h-3.5" />, label: 'Activity' },
          ]}
        />
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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold border-2 transition-all ${
                  type === t.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground'
                }`}
              >
                <t.Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Medication-specific fields */}
          {type === 'medication' && (
            <div className="space-y-3">
              {/* AI Photo Extract Button */}
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 cursor-pointer active:bg-primary/15 transition-colors">
                {extracting ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-primary" />
                )}
                <span className="text-[14px] font-semibold text-primary">
                  {extracting ? 'AI Extracting...' : 'Scan Medicine Photo (AI)'}
                </span>
                <Camera className="w-4 h-4 text-primary ml-auto" />
                <input type="file" accept="image/*" onChange={handleMedicinePhotoExtract} className="hidden" disabled={extracting} />
              </label>

              <input
                value={medName}
                onChange={e => setMedName(e.target.value)}
                placeholder="Medicine Name (e.g. Lisinopril)"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border/20 focus:border-primary/30"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={medDosage}
                  onChange={e => setMedDosage(e.target.value)}
                  placeholder="Dosage (e.g. 10mg)"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border/20 focus:border-primary/30"
                />
                <input
                  value={medQty}
                  onChange={e => setMedQty(e.target.value)}
                  placeholder="Qty (e.g. 1 tablet)"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border/20 focus:border-primary/30"
                />
              </div>

              {/* Timing */}
              <input
                value={medTime}
                onChange={e => setMedTime(e.target.value)}
                type="time"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 text-[14px] text-foreground outline-none border border-border/20 focus:border-primary/30"
              />

              {/* Dose period */}
              <div className="flex flex-wrap gap-2">
                {['Morning', 'Afternoon', 'Night'].map(period => (
                  <button
                    key={period}
                    onClick={() => setMedPeriod(period)}
                    className={`px-3 py-2 rounded-xl text-[13px] font-semibold border-2 transition-all ${
                      medPeriod === period
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    {period === 'Morning' ? '🌅' : period === 'Afternoon' ? '☀️' : '🌙'} {period}
                  </button>
                ))}
              </div>

              {/* With/without food */}
              <div className="flex gap-2">
                {['With Food', 'Without Food', 'Before Food'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setMedFoodInstruction(opt)}
                    className={`flex-1 px-2 py-2 rounded-xl text-[12px] font-semibold border-2 transition-all ${
                      medFoodInstruction === opt
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <input
                value={medInstructions}
                onChange={e => setMedInstructions(e.target.value)}
                placeholder="Additional instructions (optional)"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border/20 focus:border-primary/30"
              />
            </div>
          )}

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
            className="w-full h-13 rounded-xl bg-primary text-primary-foreground font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 touch-target"
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
                const eventIcons: Record<string, { Icon: typeof Send; color: string }> = {
                  sent: { Icon: ArrowUpFromLine, color: iosColors.blue },
                  completed: { Icon: Check, color: iosColors.green },
                  snoozed: { Icon: Clock, color: iosColors.orange },
                  missed: { Icon: AlertCircle, color: iosColors.red },
                  caregiver_triggered: { Icon: UserCheck, color: iosColors.purple },
                };
                const evt = eventIcons[log.event_type] || { Icon: ClipboardList, color: iosColors.teal };
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="ios-card-elevated flex items-center gap-3 p-3"
                  >
                    <IconBox Icon={evt.Icon} color={evt.color} />
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
              onClick={() => analyzePatterns.mutate(undefined, { onSuccess: () => toast({ title: 'Analysis complete' }) })}
              disabled={analyzePatterns.isPending}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold active:scale-95 transition-transform"
            >
              {analyzePatterns.isPending ? 'Analyzing...' : 'Refresh'}
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
