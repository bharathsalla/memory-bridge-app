import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, CalendarDays, CheckSquare, Users, Send, Plus, Check, Heart, ChevronRight, Clock, UserCheck } from 'lucide-react';
import patientAvatar from '@/assets/patient-avatar.jpg';
import CaregiverManageSheet from '@/components/CaregiverManageSheet';

const messages = [
  { id: '1', sender: 'Sarah', text: 'Hi Mom! How are you feeling today?', time: '10:30 AM', isMine: false, avatar: '👩' },
  { id: '2', sender: 'You', text: "I'm doing well, dear! Took my morning walk.", time: '10:35 AM', isMine: true, avatar: '' },
  { id: '3', sender: 'John', text: "That's great! I'll visit this weekend.", time: '11:00 AM', isMine: false, avatar: '👨' },
];

const careTasks = [
  { id: '1', title: 'Morning shower', assignee: 'Sarah', done: true, time: '8:00 AM', emoji: '🛁' },
  { id: '2', title: 'Prepare lunch', assignee: 'Sarah', done: false, time: '12:00 PM', emoji: '🍽️' },
  { id: '3', title: 'Evening walk', assignee: 'John', done: false, time: '5:00 PM', emoji: '🚶' },
  { id: '4', title: 'Doctor visit', assignee: 'Sarah', done: false, time: 'Tomorrow 10 AM', emoji: '🏥' },
];

const careViewOptions = [
  { id: 'husband', label: 'Husband', emoji: '👨', role: 'Primary Family' },
  { id: 'daughter', label: 'Daughter (Sarah)', emoji: '👩', role: 'Primary Caregiver' },
  { id: 'son', label: 'Son (John)', emoji: '👨', role: 'Family Member' },
  { id: 'doctor', label: 'Dr. Smith', emoji: '👨‍⚕️', role: 'Physician' },
  { id: 'nurse', label: 'Nurse Maria', emoji: '👩‍⚕️', role: 'Home Nurse' },
];

export default function CareScreen() {
  const { toggleCaregiverView } = useApp();
  const [activeSection, setActiveSection] = useState<'chat' | 'tasks' | 'calendar' | 'team'>('chat');
  const [messageInput, setMessageInput] = useState('');
  const [tasksDone, setTasksDone] = useState<Set<string>>(new Set(['1']));
  const [manageOpen, setManageOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const toggleTask = (id: string) => {
    setTasksDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDashboardClick = () => {
    setViewModalOpen(true);
  };

  const selectView = (viewId: string) => {
    setViewModalOpen(false);
    toggleCaregiverView();
  };

  const sections = [
    { id: 'chat' as const, label: 'Chat', icon: MessageCircle },
    { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
    { id: 'calendar' as const, label: 'Calendar', icon: CalendarDays },
    { id: 'team' as const, label: 'Team', icon: Users },
  ];

  const showFab = activeSection === 'tasks' || activeSection === 'calendar' || activeSection === 'team';

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 bg-background">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-[20px] font-extrabold text-foreground leading-tight">Care Circle</h1>
              <p className="text-[14px] text-muted-foreground font-medium">3 members online</p>
            </div>
          </div>
          <button
            onClick={handleDashboardClick}
            className="flex items-center gap-2 px-4 h-11 rounded-2xl bg-primary text-primary-foreground text-[15px] font-bold active:scale-95 transition-transform touch-target"
          >
            <img src={patientAvatar} alt="" className="w-6 h-6 rounded-full object-cover border border-primary-foreground/20" />
            Dashboard
          </button>
        </div>
        {/* Segment tabs */}
        <div className="flex bg-muted/50 rounded-2xl p-1.5">
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-[14px] font-bold transition-all touch-target ${
                  activeSection === s.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 px-5 pt-4 space-y-4 pb-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex gap-3 ${msg.isMine ? 'flex-row-reverse' : ''}`}
                >
                  {!msg.isMine && (
                    <div className="w-10 h-10 rounded-full bg-muted/80 flex items-center justify-center shrink-0 mt-0.5 text-[20px] shadow-sm">
                      {msg.avatar}
                    </div>
                  )}
                  <div className={`max-w-[72%] rounded-2xl px-4 py-3 ${
                    msg.isMine
                      ? 'bg-primary text-primary-foreground rounded-br-lg'
                      : 'bg-card border border-border/30 rounded-bl-lg shadow-sm'
                  }`}>
                    {!msg.isMine && <div className="text-[13px] font-bold text-primary mb-1">{msg.sender}</div>}
                    <p className={`text-[16px] leading-relaxed ${msg.isMine ? '' : 'text-foreground'}`}>{msg.text}</p>
                    <p className={`text-[12px] mt-2 ${msg.isMine ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>{msg.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="px-4 pb-4 pt-3 bg-background border-t border-border/20">
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder="Message your family..."
                  className="flex-1 h-12 px-5 rounded-full bg-muted/50 text-[16px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border/20 focus:border-primary/30 transition-colors"
                />
                <button className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform shadow-sm touch-target">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'tasks' && (
          <div className="px-5 pt-4 pb-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-extrabold text-foreground">Today's Tasks</h2>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-[14px] font-bold text-primary">{tasksDone.size}/{careTasks.length}</span>
              </div>
            </div>
            <div className="space-y-3">
              {careTasks.map((task, i) => (
                <motion.button
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => toggleTask(task.id)}
                  className="w-full ios-card-elevated flex items-center gap-4 p-4 text-left active:scale-[0.98] transition-transform touch-target"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                    <span className="text-[24px]">{task.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[16px] font-bold leading-tight ${tasksDone.has(task.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <UserCheck className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[13px] text-muted-foreground font-medium">{task.assignee}</span>
                      <span className="text-muted-foreground/30">·</span>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[13px] text-muted-foreground font-medium">{task.time}</span>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    tasksDone.has(task.id) ? 'border-success bg-success' : 'border-border/60'
                  }`}>
                    {tasksDone.has(task.id) && <Check className="w-4 h-4 text-success-foreground" />}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'calendar' && (
          <div className="px-5 pt-4 pb-24">
            <h2 className="text-[18px] font-extrabold text-foreground mb-4">Upcoming</h2>
            <div className="space-y-3">
              {[
                { title: 'Doctor Visit', date: 'Tomorrow, 10:00 AM', emoji: '🏥', type: 'Medical' },
                { title: 'Family Lunch', date: 'Saturday, 12:00 PM', emoji: '🍽️', type: 'Social' },
                { title: 'Physical Therapy', date: 'Monday, 2:00 PM', emoji: '💪', type: 'Health' },
              ].map((apt, i) => (
                <motion.div
                  key={apt.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="ios-card-elevated p-5 flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0">
                    <span className="text-[28px]">{apt.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[17px] font-bold text-foreground">{apt.title}</div>
                    <div className="text-[15px] text-muted-foreground mt-1 font-medium">{apt.date}</div>
                    <span className="inline-block mt-1.5 px-3 py-1 rounded-lg text-[12px] font-bold bg-primary/8 text-primary">{apt.type}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'team' && (
          <div className="px-5 pt-4 pb-24">
            <h2 className="text-[18px] font-extrabold text-foreground mb-4">Care Team</h2>
            <div className="space-y-3">
              {[
                { name: 'Sarah Johnson', role: 'Primary Caregiver', emoji: '👩', status: 'Online', online: true },
                { name: 'John Johnson', role: 'Son', emoji: '👨', status: 'Last seen 1h ago', online: false },
                { name: 'Dr. Smith', role: 'Primary Physician', emoji: '👨‍⚕️', status: 'Available', online: true },
                { name: 'Nurse Maria', role: 'Home Nurse', emoji: '👩‍⚕️', status: 'Next visit: Mon', online: false },
              ].map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="ios-card-elevated flex items-center gap-4 p-4"
                >
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center">
                      <span className="text-[26px]">{member.emoji}</span>
                    </div>
                    {member.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success border-[2.5px] border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[17px] font-bold text-foreground">{member.name}</div>
                    <div className="text-[14px] text-muted-foreground mt-0.5 font-medium">{member.role}</div>
                  </div>
                  <span className={`text-[13px] font-bold px-3 py-1.5 rounded-lg ${
                    member.online ? 'text-success bg-success/8' : 'text-muted-foreground bg-muted/40'
                  }`}>{member.status}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

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

      <AnimatePresence>
        {viewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center px-5"
            onClick={() => setViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-card rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-border/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 pb-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-[20px] font-extrabold text-foreground">Choose Dashboard View</h3>
                <p className="text-[15px] text-muted-foreground mt-1.5 font-medium">Select who is viewing</p>
              </div>
              <div className="px-4 pb-3 space-y-2">
                {careViewOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => selectView(opt.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl active:bg-muted/50 transition-colors hover:bg-muted/30 touch-target"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0">
                      <span className="text-[26px]">{opt.emoji}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[17px] font-bold text-foreground">{opt.label}</div>
                      <div className="text-[14px] text-muted-foreground font-medium">{opt.role}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/40" />
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-border/20">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="w-full h-12 rounded-2xl bg-muted/50 text-muted-foreground text-[16px] font-bold active:bg-muted transition-colors touch-target"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
