import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, AlarmClock, Plus, Pill, UtensilsCrossed, Footprints, MessageCircle, X } from 'lucide-react';
import { useScheduledReminders, useAcknowledgeReminder, useSnoozeReminder, useCreateReminder } from '@/hooks/useReminders';
import { toast } from '@/hooks/use-toast';

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
    <div className="h-full overflow-y-auto warm-gradient pb-24">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-[18px] font-bold text-foreground">Reminders</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active / Due Reminders */}
      {activeReminders.length > 0 && (
        <div className="px-4 mt-2">
          <h2 className="text-[14px] font-bold text-destructive mb-2 flex items-center gap-1.5">
            <AlarmClock className="w-4 h-4" /> Active Now
          </h2>
          <div className="space-y-2.5">
            {activeReminders.map((item, i) => {
              const reminder = item.reminders as any;
              if (!reminder) return null;
              const cfg = typeConfig[reminder.type] || typeConfig.custom;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="ios-card-elevated p-4 border-l-4 border-destructive"
                >
                  {reminder.photo_url && (
                    <img src={reminder.photo_url} alt="" className="w-full h-32 object-cover rounded-xl mb-3" />
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <span className="text-[22px]">{cfg.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[16px] font-bold text-foreground">{reminder.title}</div>
                      <div className="text-[14px] text-muted-foreground mt-0.5 leading-relaxed">{reminder.message}</div>
                      <div className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
                        {reminder.priority?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAcknowledge(item.id, reminder.id)}
                      disabled={acknowledge.isPending}
                      className="flex-1 h-12 rounded-xl bg-success text-success-foreground font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform touch-target"
                    >
                      <Check className="w-5 h-5" /> Done
                    </button>
                    <button
                      onClick={() => handleSnooze(item.id, reminder.id)}
                      disabled={snooze.isPending}
                      className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform touch-target"
                    >
                      <Clock className="w-5 h-5" /> 10 Min
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div className="px-4 mt-4">
        <h2 className="text-[14px] font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-muted-foreground" /> Upcoming
        </h2>
        {isLoading ? (
          <div className="ios-card-elevated p-6 text-center text-muted-foreground text-[14px]">Loading...</div>
        ) : upcomingReminders.length === 0 && activeReminders.length === 0 ? (
          <div className="ios-card-elevated p-8 text-center">
            <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <div className="text-[15px] font-semibold text-muted-foreground">No reminders yet</div>
            <div className="text-[12px] text-muted-foreground/70 mt-1">Tap + to create one</div>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingReminders.map((item, i) => {
              const reminder = item.reminders as any;
              if (!reminder) return null;
              const cfg = typeConfig[reminder.type] || typeConfig.custom;
              const dueDate = new Date(item.next_due_time);
              const timeStr = dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="ios-card-elevated flex items-center gap-3 p-3.5"
                >
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <span className="text-[18px]">{cfg.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-foreground truncate">{reminder.title}</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">{reminder.message}</div>
                  </div>
                  <div className="text-[12px] font-medium text-muted-foreground shrink-0">{timeStr}</div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Reminder Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card rounded-t-3xl w-full max-w-md p-5 pb-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-bold text-foreground">New Reminder</h3>
                <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Type selector */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { id: 'medication', label: '💊 Med', Icon: Pill },
                  { id: 'meal', label: '🍽️ Meal', Icon: UtensilsCrossed },
                  { id: 'exercise', label: '🚶 Walk', Icon: Footprints },
                  { id: 'check_in', label: '😊 Check-in', Icon: MessageCircle },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setNewType(t.id)}
                    className={`px-3 py-2 rounded-xl text-[13px] font-semibold border-2 transition-all ${
                      newType === t.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Reminder title..."
                className="w-full h-11 px-4 rounded-xl bg-muted/50 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border/20 focus:border-primary/30 mb-3"
              />

              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Message for the patient..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border/20 focus:border-primary/30 mb-3 resize-none"
              />

              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-muted/50 text-[14px] text-foreground outline-none border border-border/20"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={createReminder.isPending || !newTitle.trim()}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-[16px] active:scale-95 transition-transform disabled:opacity-50"
              >
                {createReminder.isPending ? 'Creating...' : 'Create Reminder'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
