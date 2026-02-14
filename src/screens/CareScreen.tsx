import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { MessageCircle, CalendarDays, CheckSquare, Users, Send, Plus, Check, Settings2 } from 'lucide-react';
import patientAvatar from '@/assets/patient-avatar.jpg';
import CaregiverManageSheet from '@/components/CaregiverManageSheet';

const messages = [
  { id: '1', sender: 'Sarah', text: 'Hi Mom! How are you feeling today?', time: '10:30 AM', isMine: false },
  { id: '2', sender: 'You', text: "I'm doing well, dear! Took my morning walk.", time: '10:35 AM', isMine: true },
  { id: '3', sender: 'John', text: "That's great! I'll visit this weekend.", time: '11:00 AM', isMine: false },
];

const careTasks = [
  { id: '1', title: 'Morning shower', assignee: 'Sarah', done: true, time: '8:00 AM' },
  { id: '2', title: 'Prepare lunch', assignee: 'Sarah', done: false, time: '12:00 PM' },
  { id: '3', title: 'Evening walk', assignee: 'John', done: false, time: '5:00 PM' },
  { id: '4', title: 'Doctor visit', assignee: 'Sarah', done: false, time: 'Tomorrow 10 AM' },
];

export default function CareScreen() {
  const { toggleCaregiverView } = useApp();
  const [activeSection, setActiveSection] = useState<'chat' | 'tasks' | 'calendar' | 'team'>('chat');
  const [messageInput, setMessageInput] = useState('');
  const [tasksDone, setTasksDone] = useState<Set<string>>(new Set(['1']));
  const [manageOpen, setManageOpen] = useState(false);

  const toggleTask = (id: string) => {
    setTasksDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sections = [
    { id: 'chat' as const, label: 'Chat', icon: MessageCircle },
    { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
    { id: 'calendar' as const, label: 'Calendar', icon: CalendarDays },
    { id: 'team' as const, label: 'Team', icon: Users },
  ];

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Header - differentiated with a distinct accent banner */}
      <div className="px-5 pt-3 pb-3 bg-background border-b border-border/40">
        <div className="ios-card-elevated p-4 flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-secondary/15 flex items-center justify-center shrink-0 ring-2 ring-secondary/30">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <h1 className="text-[22px] font-bold text-foreground">Care Circle</h1>
          </div>
          <button
            onClick={toggleCaregiverView}
            className="flex items-center gap-2 px-4 h-9 rounded-full bg-secondary text-secondary-foreground text-[14px] font-semibold touch-target"
          >
            <img src={patientAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
            Dashboard →
          </button>
        </div>
        <div className="flex gap-2">
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-4 h-9 rounded-full text-[14px] font-medium transition-all touch-target ${
                  activeSection === s.id
                    ? 'bg-primary text-primary-foreground'
                    : 'ios-card-elevated text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeSection === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 px-5 pt-4 space-y-3">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                    msg.isMine
                      ? 'bg-primary text-primary-foreground rounded-br-lg'
                      : 'ios-card-elevated rounded-bl-lg'
                  }`}>
                    {!msg.isMine && <div className="text-[13px] font-semibold text-primary mb-0.5">{msg.sender}</div>}
                    <p className={`text-[16px] leading-relaxed ${msg.isMine ? '' : 'text-foreground'}`}>{msg.text}</p>
                    <p className={`text-[12px] mt-1.5 ${msg.isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{msg.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="px-4 pb-3 pt-2 bg-background/90 backdrop-blur-xl border-t border-border/40">
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder="Message your family..."
                  className="flex-1 h-12 px-5 rounded-full bg-card text-[16px] text-foreground placeholder:text-muted-foreground/60 outline-none ios-card-elevated"
                />
                <button className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform touch-target">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'tasks' && (
          <div className="px-5 pt-4 pb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-foreground">Today's Tasks</h2>
              <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center touch-target">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {careTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="w-full ios-card-elevated flex items-center gap-3.5 p-4 text-left active:bg-muted/30 transition-colors touch-target rounded-2xl"
                >
                  <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                    tasksDone.has(task.id) ? 'border-success bg-success' : 'border-border'
                  }`}>
                    {tasksDone.has(task.id) && <Check className="w-4 h-4 text-success-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className={`text-[16px] font-medium ${tasksDone.has(task.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </div>
                    <div className="text-[13px] text-muted-foreground">{task.assignee} · {task.time}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'calendar' && (
          <div className="px-5 pt-4 pb-6 space-y-3">
            <h2 className="text-[18px] font-bold text-foreground">Upcoming</h2>
            {[
              { title: 'Doctor Visit', date: 'Tomorrow, 10:00 AM', emoji: '🏥' },
              { title: 'Family Lunch', date: 'Saturday, 12:00 PM', emoji: '🍽️' },
              { title: 'Physical Therapy', date: 'Monday, 2:00 PM', emoji: '💪' },
            ].map(apt => (
              <div key={apt.title} className="ios-card-elevated p-5 flex items-center gap-4 rounded-2xl">
                <div className="w-14 h-14 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                  <span className="text-[26px]">{apt.emoji}</span>
                </div>
                <div>
                  <div className="text-[16px] font-semibold text-foreground">{apt.title}</div>
                  <div className="text-[14px] text-muted-foreground mt-0.5">{apt.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'team' && (
          <div className="px-5 pt-4 pb-6 space-y-3">
            <h2 className="text-[18px] font-bold text-foreground">Care Team</h2>
            <div className="space-y-3">
              {[
                { name: 'Sarah Johnson', role: 'Primary Caregiver (Daughter)', emoji: '👩', status: 'Online', statusColor: 'text-success' },
                { name: 'John Johnson', role: 'Son', emoji: '👨', status: 'Last seen 1h ago', statusColor: 'text-muted-foreground' },
                { name: 'Dr. Smith', role: 'Primary Physician', emoji: '👨‍⚕️', status: 'Available', statusColor: 'text-primary' },
                { name: 'Nurse Maria', role: 'Home Nurse', emoji: '👩‍⚕️', status: 'Next visit: Monday', statusColor: 'text-muted-foreground' },
              ].map(member => (
                <div key={member.name} className="ios-card-elevated flex items-center gap-3.5 p-4 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-[24px]">{member.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[16px] font-medium text-foreground">{member.name}</div>
                    <div className="text-[13px] text-muted-foreground">{member.role}</div>
                  </div>
                  <span className={`text-[12px] font-medium ${member.statusColor}`}>{member.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Caregiver Manage FAB — positioned above tab bar to avoid send button collision */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setManageOpen(true)}
        className="absolute bottom-20 right-4 w-14 h-14 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-center z-30 ios-card-elevated"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        aria-label="Manage patient data"
      >
        <Settings2 className="w-6 h-6" />
      </motion.button>

      <CaregiverManageSheet open={manageOpen} onClose={() => setManageOpen(false)} />
    </div>
  );
}
