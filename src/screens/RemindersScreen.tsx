import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, AlarmClock, Plus, Pill, UtensilsCrossed, Footprints, MessageCircle, X } from 'lucide-react';
import { useScheduledReminders, useAcknowledgeReminder, useSnoozeReminder, useCreateReminder } from '@/hooks/useReminders';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      {/* Gradient Header — Care-style */}
      <div className="bg-gradient-to-br from-primary via-primary to-accent px-5 pt-5 pb-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-foreground/5" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-[20px] font-extrabold text-primary-foreground leading-tight font-display">Reminders</h1>
              <p className="text-[13px] text-primary-foreground/60 font-medium">{scheduled.length} scheduled</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            size="sm"
            className="h-10 px-3 rounded-xl text-[13px] font-semibold border-primary-foreground/25 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 gap-1.5"
          >
            <Plus className="w-4 h-4" /> New
          </Button>
        </div>
      </div>

      {/* Active / Due Reminders */}
      {activeReminders.length > 0 && (
        <div className="mx-4 mt-4">
          <p className="text-[13px] font-bold text-destructive uppercase tracking-wider mb-2 px-1 font-display flex items-center gap-1.5">
            <AlarmClock className="w-4 h-4" /> Active Now
          </p>
          <div className="space-y-3">
            {activeReminders.map((item, i) => {
              const reminder = item.reminders as any;
              if (!reminder) return null;
              const cfg = typeConfig[reminder.type] || typeConfig.custom;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border-destructive/30 shadow-sm border-l-4 border-l-destructive">
                    <CardContent className="p-4">
                      {reminder.photo_url && (
                        <img src={reminder.photo_url} alt="" className="w-full h-36 object-cover rounded-xl mb-3" />
                      )}
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                          <span className="text-[24px]">{cfg.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[16px] font-bold text-foreground">{reminder.title}</div>
                          <div className="text-[14px] text-muted-foreground mt-1 leading-relaxed">{reminder.message}</div>
                          <Badge className={`mt-2 ${cfg.bg} ${cfg.color} border-0 text-[11px] font-bold`}>
                            {reminder.priority?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button
                          onClick={() => handleAcknowledge(item.id, reminder.id)}
                          disabled={acknowledge.isPending}
                          className="flex-1 h-12 rounded-xl gradient-success text-success-foreground font-extrabold text-[15px] gap-2"
                        >
                          <Check className="w-5 h-5" /> Done
                        </Button>
                        <Button
                          onClick={() => handleSnooze(item.id, reminder.id)}
                          disabled={snooze.isPending}
                          variant="default"
                          className="flex-1 h-12 rounded-xl font-extrabold text-[15px] gap-2"
                        >
                          <Clock className="w-5 h-5" /> 10 Min
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div className="mx-4 mt-5">
        <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1 font-display flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> Upcoming
        </p>
        {isLoading ? (
          <Card className="border-border/60 shadow-sm"><CardContent className="p-8 text-center text-muted-foreground text-[14px]">Loading...</CardContent></Card>
        ) : upcomingReminders.length === 0 && activeReminders.length === 0 ? (
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-10 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <div className="text-[16px] font-bold text-muted-foreground">No reminders yet</div>
              <div className="text-[13px] text-muted-foreground/70 mt-1">Tap + to create one</div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60 shadow-sm overflow-hidden divide-y divide-border/30">
            {upcomingReminders.map((item, i) => {
              const reminder = item.reminders as any;
              if (!reminder) return null;
              const cfg = typeConfig[reminder.type] || typeConfig.custom;
              const dueDate = new Date(item.next_due_time);
              const timeStr = dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <div className="flex items-center gap-3.5 p-4">
                    <div className={`w-11 h-11 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <span className="text-[20px]">{cfg.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-foreground truncate">{reminder.title}</div>
                      <div className="text-[13px] text-muted-foreground mt-0.5">{reminder.message}</div>
                    </div>
                    <span className="text-[13px] font-bold text-muted-foreground shrink-0">{timeStr}</span>
                  </div>
                </motion.div>
              );
            })}
          </Card>
        )}
      </div>

      {/* Create Reminder Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card rounded-t-3xl w-full p-6 pb-8 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center mb-3">
                <div className="w-10 h-1 rounded-full bg-muted" />
              </div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[20px] font-extrabold text-foreground font-display">New Reminder</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} className="w-9 h-9 rounded-full">
                  <X className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>

              <div className="flex gap-2 mb-5 flex-wrap">
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
                    className="rounded-xl text-[14px] font-bold h-11 px-4"
                  >
                    {t.label}
                  </Button>
                ))}
              </div>

              <Input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Reminder title..."
                className="h-12 rounded-xl text-[15px] mb-3"
              />

              <Textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Message for the patient..."
                rows={2}
                className="rounded-xl text-[15px] mb-3 resize-none"
              />

              <div className="flex items-center gap-3 mb-5">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-muted/50 text-[15px] text-foreground outline-none border border-border"
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={createReminder.isPending || !newTitle.trim()}
                size="lg"
                className="w-full h-14 rounded-xl text-[16px] font-extrabold shadow-lg"
              >
                {createReminder.isPending ? 'Creating...' : 'Create Reminder'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
