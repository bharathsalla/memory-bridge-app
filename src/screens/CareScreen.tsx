import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, CalendarDays, CheckSquare, Users, Send, Plus, Check, Heart, ChevronRight, Clock, UserCheck, X, Paperclip, ArrowUp, Camera, Image, Brain, Sparkles, MapPin, Eye } from 'lucide-react';
import patientAvatar from '@/assets/patient-avatar.jpg';
import CaregiverManageSheet from '@/components/CaregiverManageSheet';
import CaregiverMemorySender from '@/components/CaregiverMemorySender';


import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent } from '@/components/ui/tabs';

const messages = [
  { id: '1', sender: 'Sarah', text: 'Hi Mom! How are you feeling today? 💕', time: '10:30 AM', isMine: false, avatar: '👩' },
  { id: '2', sender: 'You', text: "I'm doing well, dear! Took my morning walk. The garden looks beautiful today 🌸", time: '10:35 AM', isMine: true, avatar: '' },
  { id: '3', sender: 'Sarah', text: "That's wonderful! Don't forget to take your afternoon medicine at 2pm", time: '10:38 AM', isMine: false, avatar: '👩' },
  { id: '4', sender: 'You', text: "Thank you for reminding me, sweetie ❤️", time: '10:40 AM', isMine: true, avatar: '' },
  { id: '5', sender: 'John', text: "Hey Mom! I'll visit this weekend. Want me to bring anything?", time: '11:00 AM', isMine: false, avatar: '👨' },
];

const careTasks = [
  { id: '1', title: 'Morning shower', assignee: 'Sarah', done: true, time: '8:00 AM' },
  { id: '2', title: 'Prepare lunch', assignee: 'Sarah', done: false, time: '12:00 PM' },
  { id: '3', title: 'Evening walk', assignee: 'John', done: false, time: '5:00 PM' },
  { id: '4', title: 'Doctor visit', assignee: 'Sarah', done: false, time: 'Tomorrow 10 AM' },
];

const careViewOptions = [
  { id: 'husband', label: 'Husband', role: 'Primary Family' },
  { id: 'daughter', label: 'Daughter (Sarah)', role: 'Primary Caregiver' },
  { id: 'son', label: 'Son (John)', role: 'Family Member' },
  { id: 'doctor', label: 'Dr. Smith', role: 'Physician' },
  { id: 'nurse', label: 'Nurse Maria', role: 'Home Nurse' },
];

export default function CareScreen() {
  const { toggleCaregiverView } = useApp();
  const [messageInput, setMessageInput] = useState('');
  const [tasksDone, setTasksDone] = useState<Set<string>>(new Set(['1']));
  const [manageOpen, setManageOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleTask = (id: string) => {
    setTasksDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectView = (_viewId: string) => {
    setViewModalOpen(false);
    toggleCaregiverView();
  };

  const showFab = activeTab === 'tasks' || activeTab === 'calendar' || activeTab === 'team';

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab]);

  // Auto-resize textarea
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="h-full flex flex-col ios-grouped-bg relative overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-accent px-5 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-[20px] font-extrabold text-primary-foreground leading-tight font-display">Care Circle</h1>
              <p className="text-[13px] text-primary-foreground/60 font-medium">3 members online</p>
            </div>
          </div>
          <Button
            onClick={() => setViewModalOpen(true)}
            variant="outline"
            size="sm"
            className="h-10 px-3 rounded-xl text-[13px] font-semibold border-primary-foreground/25 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 gap-2"
          >
            <img src={patientAvatar} alt="" className="w-6 h-6 rounded-lg object-cover" />
            Dashboard
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-3 pb-1.5 shrink-0">
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            {[
              { value: 'chat', icon: <MessageCircle className="w-4 h-4" />, label: 'Chat' },
              { value: 'tasks', icon: <CheckSquare className="w-4 h-4" />, label: 'Tasks' },
              { value: 'calendar', icon: <CalendarDays className="w-4 h-4" />, label: 'Events' },
              { value: 'team', icon: <Users className="w-4 h-4" />, label: 'Team' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg text-[13px] font-bold transition-all ${
                  activeTab === tab.value
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat — ChatGPT-style */}
        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden">
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-3">
            {/* Date pill */}
            <div className="flex justify-center mb-4">
              <span className="text-[11px] text-muted-foreground font-medium bg-muted/50 px-4 py-1.5 rounded-full">Today</span>
            </div>

            <div className="space-y-5">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {msg.isMine ? (
                    /* My message — right aligned, primary bubble */
                    <div className="flex justify-end">
                      <div className="max-w-[82%]">
                        <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md shadow-sm">
                          <p className="text-[15px] leading-relaxed">{msg.text}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground/50 mt-1 text-right mr-1 font-medium">
                          {msg.time} · Read ✓✓
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Other's message — left aligned with avatar */
                    <div className="flex gap-3 items-end">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-[16px] shadow-sm border border-border/50">
                        {msg.avatar}
                      </div>
                      <div className="max-w-[78%]">
                        <p className="text-[11px] font-bold text-primary ml-1 mb-1">{msg.sender}</p>
                        <div className="bg-muted/60 text-foreground px-4 py-3 rounded-2xl rounded-bl-md">
                          <p className="text-[15px] leading-relaxed">{msg.text}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground/50 mt-1 ml-1 font-medium">{msg.time}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <div ref={chatEndRef} />
          </div>

          {/* ChatGPT-style input bar */}
          <div className="px-3 pb-3 pt-2 shrink-0">
            <div className="relative bg-muted/40 border border-border/60 rounded-2xl overflow-hidden shadow-sm focus-within:border-primary/40 focus-within:shadow-md transition-all">
              <textarea
                ref={textareaRef}
                value={messageInput}
                onChange={handleTextareaInput}
                placeholder="Message Care Circle..."
                rows={1}
                className="w-full resize-none bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 px-4 pt-3 pb-2 outline-none max-h-[120px] leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // send message
                  }
                }}
              />
              <div className="flex items-center justify-between px-3 pb-2.5">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/60 transition-colors touch-target">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all touch-target ${
                    messageInput.trim()
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tasks */}
        <TabsContent value="tasks" className="flex-1 min-h-0 overflow-y-auto mt-0">
          <div className="px-5 pt-4 pb-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[19px] font-extrabold text-foreground font-display">Today's Tasks</h2>
              <Badge variant="secondary" className="text-[13px] font-bold bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full">
                {tasksDone.size}/{careTasks.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {careTasks.map((task, i) => (
                <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <div
                    className="bg-card rounded-2xl border border-border/60 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => toggleTask(task.id)}
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
                        tasksDone.has(task.id) ? 'border-success bg-success' : 'border-border'
                      }`}>
                        {tasksDone.has(task.id) && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[16px] font-bold leading-tight ${tasksDone.has(task.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[13px] text-muted-foreground font-medium flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" /> {task.assignee}
                          </span>
                          <span className="text-[13px] text-muted-foreground font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {task.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Memory Management Section ── */}
            <Separator className="my-6" />
            <CaregiverMemorySender />
          </div>
        </TabsContent>

        {/* Calendar */}
        <TabsContent value="calendar" className="flex-1 min-h-0 overflow-y-auto mt-0">
          <div className="px-5 pt-4 pb-24">
            <h2 className="text-[19px] font-extrabold text-foreground mb-4 font-display">Upcoming Events</h2>
            <div className="space-y-3">
              {[
                { title: 'Doctor Visit', date: 'Tomorrow, 10:00 AM', type: 'Medical' },
                { title: 'Family Lunch', date: 'Saturday, 12:00 PM', type: 'Social' },
                { title: 'Physical Therapy', date: 'Monday, 2:00 PM', type: 'Health' },
              ].map((apt, i) => (
                <motion.div key={apt.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <div className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center shrink-0">
                        <CalendarDays className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[16px] font-bold text-foreground">{apt.title}</p>
                        <p className="text-[14px] text-muted-foreground mt-1 font-medium">{apt.date}</p>
                        <Badge variant="outline" className="mt-1.5 text-[11px] font-semibold text-primary border-primary/20 rounded-full">
                          {apt.type}
                        </Badge>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="flex-1 min-h-0 overflow-y-auto mt-0">
          <div className="px-5 pt-4 pb-24">
            <h2 className="text-[19px] font-extrabold text-foreground mb-4 font-display">Care Team</h2>
            <div className="space-y-3">
              {[
                { name: 'Sarah Johnson', role: 'Primary Caregiver', status: 'Online', online: true },
                { name: 'John Johnson', role: 'Son', status: 'Last seen 1h ago', online: false },
                { name: 'Dr. Smith', role: 'Primary Physician', status: 'Available', online: true },
                { name: 'Nurse Maria', role: 'Home Nurse', status: 'Next visit: Mon', online: false },
              ].map((member, i) => (
                <motion.div key={member.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
                    <div className="p-4 flex items-center gap-4">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        {member.online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[16px] font-bold text-foreground">{member.name}</p>
                        <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">{member.role}</p>
                      </div>
                      <Badge variant={member.online ? 'secondary' : 'outline'} className={`text-[11px] font-semibold shrink-0 rounded-full ${
                        member.online ? 'bg-success/10 text-success border-success/20' : 'text-muted-foreground'
                      }`}>
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* FAB */}
      {showFab && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setManageOpen(true)}
          className="absolute bottom-6 right-5 w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center z-30 shadow-lg active:scale-90 transition-transform touch-target"
          aria-label="Add new item"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      <CaregiverManageSheet open={manageOpen} onClose={() => setManageOpen(false)} />

      {/* View Picker Modal */}
      <AnimatePresence>
        {viewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-5"
            onClick={() => setViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-card rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-border"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 pb-3 flex items-center justify-between">
                <h3 className="text-[18px] font-extrabold text-foreground">Choose Dashboard View</h3>
                <button onClick={() => setViewModalOpen(false)} className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center touch-target">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <Separator />
              <div className="p-3 space-y-1">
                {careViewOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => selectView(opt.id)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl active:bg-muted/50 transition-colors touch-target"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[15px] font-bold text-foreground">{opt.label}</p>
                      <p className="text-[12px] text-muted-foreground font-medium">{opt.role}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                  </button>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <Button variant="outline" onClick={() => setViewModalOpen(false)} size="lg" className="w-full h-11 rounded-xl text-[15px] font-semibold border-border">
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
