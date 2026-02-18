import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, AlarmClock, Plus, Pill, X } from 'lucide-react';
import { useScheduledReminders, useAcknowledgeReminder, useSnoozeReminder, useCreateReminder } from '@/hooks/useReminders';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const typeConfig: Record<string, { emoji: string; color: string; bg: string }> = {
  medication: { emoji: '💊', color: 'text-primary', bg: 'bg-primary/10' },
  meal: { emoji: '🍽️', color: 'text-accent', bg: 'bg-accent/10' },
  exercise: { emoji: '🚶', color: 'text-sage', bg: 'bg-sage/10' },
  check_in: { emoji: '😊', color: 'text-lavender', bg: 'bg-lavender/10' },
  custom: { emoji: '📋', color: 'text-secondary', bg: 'bg-secondary/10' },
};

export default function RemindersScreen() {
  const { data: scheduled = [], isLoading } = useScheduledReminders();
  const acknowledge = useAcknowledgeReminder();
  const snooze = useSnoozeReminder();
  const createReminder = useCreateReminder();
  const [showCreate, setShowCreate] = useState(false);
  const [newType, setNewType] = useState('medication');
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newTime, setNewTime] = useState('08:00');

  const handleAcknowledge = (scheduledId: string, reminderId: string) => {
    acknowledge.mutate(
      { scheduledId, reminderId, startTime: Date.now() - 5000 },
      { onSuccess: () => toast({ title: '✅ Done!', description: 'Reminder completed.' }) }
    );
  };

  const handleSnooze = (scheduledId: string, reminderId: string) => {
    snooze.mutate(
      { scheduledId, reminderId, minutes: 10 },
      { onSuccess: () => toast({ title: '⏰ Snoozed', description: 'Reminder will come back in 10 minutes.' }) }
    );
  };

  const handleCreate = () => {
    if (!newTitle.trim() || !newMessage.trim()) return;
    createReminder.mutate(
      {
        type: newType,
        title: newTitle,
        message: newMessage,
        schedule: { type: 'daily', times: [newTime], days_of_week: [1,2,3,4,5,6,7] },
      },
      {
        onSuccess: () => {
          toast({ title: '✅ Reminder Created' });
          setShowCreate(false);
          setNewTitle('');
          setNewMessage('');
        },
      }
    );
  };

  const activeReminders = scheduled.filter(s => s.status === 'sent' || (s.status === 'active' && new Date(s.next_due_time) <= new Date()));
  const upcomingReminders = scheduled.filter(s => s.status === 'active' && new Date(s.next_due_time) > new Date());

  return (
    <div className="h-full overflow-y-auto ios-grouped-bg pb-24 relative">
      {/* iOS Large Title */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-ios-large-title text-foreground">Reminders</h1>
          <p className="text-ios-subheadline text-muted-foreground mt-1">{scheduled.length} scheduled</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          size="sm"
          className="h-9 px-3 rounded-full text-ios-footnote font-semibold gap-1"
        >
          <Plus className="w-4 h-4" /> New
        </Button>
      </div>

      {/* Active Reminders */}
      {activeReminders.length > 0 && (
        <div className="px-4 mt-3">
          <p className="text-ios-footnote font-medium text-destructive uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
            <AlarmClock className="w-3.5 h-3.5" /> Active Now
          </p>
          <div className="space-y-2">
            {activeReminders.map((item, i) => {
              const reminder = item.reminders as any;
              if (!reminder) return null;
              const cfg = typeConfig[reminder.type] || typeConfig.custom;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <div className="ios-card border-l-4 border-l-destructive">
                    <div className="p-4">
                      {reminder.photo_url && (
                        <img src={reminder.photo_url} alt="" className="w-full h-32 object-cover rounded-xl mb-3" />
                      )}
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                          <span className="text-[20px]">{cfg.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-ios-callout font-semibold text-foreground">{reminder.title}</div>
                          <div className="text-ios-subheadline text-muted-foreground mt-1">{reminder.message}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          onClick={() => handleAcknowledge(item.id, reminder.id)}
                          disabled={acknowledge.isPending}
                          className="flex-1 h-11 rounded-xl font-semibold gap-2"
                        >
                          <Check className="w-4 h-4" /> Done
                        </Button>
                        <Button
                          onClick={() => handleSnooze(item.id, reminder.id)}
                          disabled={snooze.isPending}
                          variant="secondary"
                          className="flex-1 h-11 rounded-xl font-semibold gap-2"
                        >
                          <Clock className="w-4 h-4" /> 10 Min
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div className="px-4 mt-5">
        <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Upcoming
        </p>
        {isLoading ? (
          <div className="ios-card p-8 text-center text-ios-subheadline text-muted-foreground">Loading...</div>
        ) : upcomingReminders.length === 0 && activeReminders.length === 0 ? (
          <div className="ios-card p-10 text-center">
            <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <div className="text-ios-callout font-semibold text-muted-foreground">No reminders yet</div>
            <div className="text-ios-footnote text-muted-foreground/70 mt-1">Tap + to create one</div>
          </div>
        ) : (
          <div className="ios-card overflow-hidden divide-y divide-border/30">
            {upcomingReminders.map((item, i) => {
              const reminder = item.reminders as any;
              if (!reminder) return null;
              const cfg = typeConfig[reminder.type] || typeConfig.custom;
              const dueDate = new Date(item.next_due_time);
              const timeStr = dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              return (
                <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <div className="flex items-center gap-3 p-4">
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <span className="text-[18px]">{cfg.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-ios-subheadline font-semibold text-foreground truncate">{reminder.title}</div>
                      <div className="text-ios-footnote text-muted-foreground mt-0.5">{reminder.message}</div>
                    </div>
                    <span className="text-ios-footnote font-semibold text-muted-foreground shrink-0">{timeStr}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Reminder Bottom Sheet */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 ios-blur-dark flex items-end justify-center"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card rounded-t-2xl w-full p-5 pb-8 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center mb-3">
                <div className="w-9 h-1 rounded-full bg-muted-foreground/20" />
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-ios-title2 text-foreground">New Reminder</h3>
                <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center touch-target">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { id: 'medication', label: '💊 Med' },
                  { id: 'meal', label: '🍽️ Meal' },
                  { id: 'exercise', label: '🚶 Walk' },
                  { id: 'check_in', label: '😊 Check-in' },
                ].map(t => (
                  <Button
                    key={t.id}
                    variant={newType === t.id ? 'default' : 'outline'}
                    onClick={() => setNewType(t.id)}
                    className="rounded-full text-ios-footnote font-semibold h-9 px-4"
                  >
                    {t.label}
                  </Button>
                ))}
              </div>

              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Reminder title..." className="h-11 rounded-xl text-ios-callout mb-3" />
              <Textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Message for the patient..." rows={2} className="rounded-xl text-ios-callout mb-3 resize-none" />
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="h-11 px-4 rounded-xl bg-muted text-ios-callout text-foreground outline-none border border-border" />
              </div>
              <Button onClick={handleCreate} disabled={createReminder.isPending || !newTitle.trim()} size="lg" className="w-full h-12 rounded-xl text-ios-callout font-semibold">
                {createReminder.isPending ? 'Creating...' : 'Create Reminder'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
