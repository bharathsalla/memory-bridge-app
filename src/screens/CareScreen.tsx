import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, CalendarDays, CheckSquare, Users, Send, Plus, Check, Heart, ChevronRight } from 'lucide-react';
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

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Compact header */}
      <div className="px-4 pt-2 pb-2 bg-background">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-[20px] font-bold text-foreground">Care Circle</h1>
          </div>
          <button
            onClick={handleDashboardClick}
            className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold touch-target"
          >
            <img src={patientAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
            Dashboard
          </button>
        </div>
        {/* Segment tabs */}
        <div className="flex bg-muted/60 rounded-xl p-0.5">
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-[12px] font-semibold transition-all ${
                  activeSection === s.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeSection === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 px-4 pt-3 space-y-2.5">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.isMine ? 'flex-row-reverse' : ''}`}
                >
                  {!msg.isMine && (
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1 text-[14px]">
                      {msg.avatar}
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                    msg.isMine
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-card border border-border/40 rounded-bl-md'
                  }`}>
                    {!msg.isMine && <div className="text-[11px] font-semibold text-primary mb-0.5">{msg.sender}</div>}
                    <p className={`text-[15px] leading-snug ${msg.isMine ? '' : 'text-foreground'}`}>{msg.text}</p>
                    <p className={`text-[11px] mt-1 ${msg.isMine ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>{msg.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="px-3 pb-2 pt-1.5 bg-background border-t border-border/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder="Message your family..."
                  className="flex-1 h-10 px-4 rounded-full bg-muted/60 text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border/30"
                />
                <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform touch-target">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'tasks' && (
          <div className="px-4 pt-3 pb-6 space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[16px] font-bold text-foreground">Today's Tasks</h2>
              <span className="text-[12px] text-muted-foreground">{tasksDone.size}/{careTasks.length} done</span>
            </div>
            {careTasks.map(task => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full bg-card border border-border/30 flex items-center gap-3 p-3.5 text-left active:bg-muted/30 transition-colors touch-target rounded-xl"
              >
                <span className="text-[18px]">{task.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[15px] font-medium ${tasksDone.has(task.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </div>
                  <div className="text-[12px] text-muted-foreground">{task.assignee} · {task.time}</div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  tasksDone.has(task.id) ? 'border-success bg-success' : 'border-border'
                }`}>
                  {tasksDone.has(task.id) && <Check className="w-3 h-3 text-success-foreground" />}
                </div>
              </button>
            ))}
          </div>
        )}

        {activeSection === 'calendar' && (
          <div className="px-4 pt-3 pb-6 space-y-2.5">
            <h2 className="text-[16px] font-bold text-foreground mb-1">Upcoming</h2>
            {[
              { title: 'Doctor Visit', date: 'Tomorrow, 10:00 AM', emoji: '🏥' },
              { title: 'Family Lunch', date: 'Saturday, 12:00 PM', emoji: '🍽️' },
              { title: 'Physical Therapy', date: 'Monday, 2:00 PM', emoji: '💪' },
            ].map(apt => (
              <div key={apt.title} className="bg-card border border-border/30 p-4 flex items-center gap-3.5 rounded-xl">
                <div className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                  <span className="text-[22px]">{apt.emoji}</span>
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-foreground">{apt.title}</div>
                  <div className="text-[13px] text-muted-foreground mt-0.5">{apt.date}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}

        {activeSection === 'team' && (
          <div className="px-4 pt-3 pb-6 space-y-2.5">
            <h2 className="text-[16px] font-bold text-foreground mb-1">Care Team</h2>
            {[
              { name: 'Sarah Johnson', role: 'Primary Caregiver (Daughter)', emoji: '👩', status: 'Online', online: true },
              { name: 'John Johnson', role: 'Son', emoji: '👨', status: 'Last seen 1h ago', online: false },
              { name: 'Dr. Smith', role: 'Primary Physician', emoji: '👨‍⚕️', status: 'Available', online: true },
              { name: 'Nurse Maria', role: 'Home Nurse', emoji: '👩‍⚕️', status: 'Next visit: Monday', online: false },
            ].map(member => (
              <div key={member.name} className="bg-card border border-border/30 flex items-center gap-3 p-3.5 rounded-xl">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-[20px]">{member.emoji}</span>
                  </div>
                  {member.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-foreground">{member.name}</div>
                  <div className="text-[12px] text-muted-foreground">{member.role}</div>
                </div>
                <span className={`text-[11px] font-medium ${member.online ? 'text-success' : 'text-muted-foreground'}`}>{member.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB - Plus icon to open manage widget */}
      <button
        onClick={() => setManageOpen(true)}
        className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center z-30 shadow-lg active:scale-90 transition-transform"
        aria-label="Add new item"
      >
        <Plus className="w-5 h-5" />
      </button>

      <CaregiverManageSheet open={manageOpen} onClose={() => setManageOpen(false)} />

      {/* View Selector Modal */}
      <AnimatePresence>
        {viewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center px-6"
            onClick={() => setViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-border/30"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border/30">
                <h3 className="text-[17px] font-bold text-foreground text-center">Choose Dashboard View</h3>
                <p className="text-[12px] text-muted-foreground text-center mt-1">Select who is viewing the dashboard</p>
              </div>
              <div className="p-3 space-y-1.5">
                {careViewOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => selectView(opt.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl active:bg-muted/50 transition-colors touch-target hover:bg-muted/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                      <span className="text-[20px]">{opt.emoji}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[15px] font-semibold text-foreground">{opt.label}</div>
                      <div className="text-[12px] text-muted-foreground">{opt.role}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
              <div className="p-3 border-t border-border/30">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="w-full h-10 rounded-xl bg-muted text-muted-foreground text-[14px] font-semibold"
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
