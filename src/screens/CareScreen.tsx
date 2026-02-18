import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, CalendarDays, CheckSquare, Users, Check, ChevronRight, Clock, UserCheck, X, ArrowUp, Mic, User, Stethoscope, HeartPulse } from 'lucide-react';
import patientAvatar from '@/assets/patient-avatar.jpg';
import IconBox, { iosColors } from '@/components/ui/IconBox';
import CaregiverManageSheet from '@/components/CaregiverManageSheet';
import CaregiverMemorySender from '@/components/CaregiverMemorySender';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent } from '@/components/ui/tabs';

const messages = [
  { id: '1', sender: 'Sarah', text: 'Hi Mom! How are you feeling today?', time: '10:30 AM', isMine: false },
  { id: '2', sender: 'You', text: "I'm doing well, dear! Took my morning walk. The garden looks beautiful today.", time: '10:35 AM', isMine: true },
  { id: '3', sender: 'Sarah', text: "That's wonderful! Don't forget to take your afternoon medicine at 2pm", time: '10:38 AM', isMine: false },
  { id: '4', sender: 'You', text: "Thank you for reminding me, sweetie", time: '10:40 AM', isMine: true },
  { id: '5', sender: 'John', text: "Hey Mom! I'll visit this weekend. Want me to bring anything?", time: '11:00 AM', isMine: false },
];

const careTasks = [
  { id: '1', title: 'Morning shower', assignee: 'Sarah', done: true, time: '8:00 AM' },
  { id: '2', title: 'Prepare lunch', assignee: 'Sarah', done: false, time: '12:00 PM' },
  { id: '3', title: 'Evening walk', assignee: 'John', done: false, time: '5:00 PM' },
  { id: '4', title: 'Doctor visit', assignee: 'Sarah', done: false, time: 'Tomorrow 10 AM' },
];

const careViewOptions = [
  { id: 'husband', label: 'Husband', role: 'Primary Family', icon: User, color: iosColors.blue },
  { id: 'daughter', label: 'Daughter (Sarah)', role: 'Primary Caregiver', icon: HeartPulse, color: iosColors.red },
  { id: 'son', label: 'Son (John)', role: 'Family Member', icon: User, color: iosColors.green },
  { id: 'doctor', label: 'Dr. Smith', role: 'Physician', icon: Stethoscope, color: iosColors.purple },
  { id: 'nurse', label: 'Nurse Maria', role: 'Home Nurse', icon: HeartPulse, color: iosColors.orange },
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

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab]);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="h-full flex flex-col ios-grouped-bg relative overflow-hidden">
      {/* iOS Large Title Header */}
      <div className="px-4 pt-4 pb-1 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-ios-large-title text-foreground">Care Circle</h1>
          <button
            onClick={() => setViewModalOpen(true)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-full text-ios-footnote font-semibold bg-primary text-primary-foreground"
          >
            <img src={patientAvatar} alt="Profile" className="w-[22px] h-[22px] rounded-[5px] object-cover" />
            Dashboard
          </button>
        </div>
        <p className="text-ios-subheadline text-muted-foreground mt-1">3 members online</p>
      </div>

      {/* Tabs — iOS segmented control */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2 pb-1.5 shrink-0">
          <SegmentedControl
            value={activeTab}
            onChange={setActiveTab}
            items={[
              { value: 'chat', icon: <MessageCircle className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />, label: 'Chat' },
              { value: 'tasks', icon: <CheckSquare className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />, label: 'Tasks' },
              { value: 'calendar', icon: <CalendarDays className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />, label: 'Events' },
              { value: 'team', icon: <Users className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />, label: 'Team' },
            ]}
          />
        </div>

        {/* Chat — Apple Messages style */}
        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden">
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-3">
            <div className="flex justify-center mb-4">
              <span className="text-[11px] text-muted-foreground font-medium bg-muted/50 px-4 py-1.5 rounded-full">Today</span>
            </div>

          <div className="space-y-2">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.isMine ? (
                    <div className="flex justify-end">
                      <div className="max-w-[75%]">
                        <div className="px-3.5 py-2 rounded-[18px] rounded-br-sm" style={{ background: 'hsl(var(--primary))' }}>
                          <p className="text-[15px] leading-snug text-primary-foreground">{msg.text}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground/40 mt-0.5 text-right mr-1">{msg.time}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1.5 items-end">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mb-4">
                        <span className="text-[10px] font-semibold text-muted-foreground">{msg.sender[0]}</span>
                      </div>
                      <div className="max-w-[75%]">
                        <p className="text-[10px] font-medium text-muted-foreground ml-1 mb-0.5">{msg.sender}</p>
                        <div className="bg-muted text-foreground px-3.5 py-2 rounded-[18px] rounded-bl-sm">
                          <p className="text-[15px] leading-snug">{msg.text}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground/40 mt-0.5 ml-1">{msg.time}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div ref={chatEndRef} />
          </div>

          {/* Input — Apple Messages style with mic inside */}
          <div className="px-3 pb-3 pt-2 shrink-0">
            <div className="relative flex items-end bg-muted rounded-2xl border border-border/40">
              <textarea
                ref={textareaRef}
                value={messageInput}
                onChange={handleTextareaInput}
                placeholder="Message..."
                rows={1}
                className="flex-1 resize-none bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 pl-4 pr-2 py-2.5 outline-none max-h-[120px] leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                  }
                }}
              />
              <div className="flex items-center gap-1 pr-2 pb-2">
                {!messageInput.trim() && (
                  <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground touch-target">
                    <Mic className="w-5 h-5" />
                  </button>
                )}
                {messageInput.trim() && (
                  <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground touch-target">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tasks */}
        <TabsContent value="tasks" className="flex-1 min-h-0 overflow-y-auto mt-0">
          <div className="pt-3 pb-24">
            <div className="px-5 flex items-center justify-between mb-2">
              <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider">Today's Tasks</p>
              <span className="text-ios-footnote text-muted-foreground">{tasksDone.size}/{careTasks.length}</span>
            </div>
            <div className="mx-4 ios-card overflow-hidden divide-y divide-border/30">
              {careTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="w-full flex items-center gap-3 px-4 text-left touch-target"
                  style={{ minHeight: 56 }}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    tasksDone.has(task.id) ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                  }`}>
                    {tasksDone.has(task.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-ios-callout font-medium ${tasksDone.has(task.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </p>
                    <p className="text-ios-footnote text-muted-foreground">{task.assignee} · {task.time}</p>
                  </div>
                </button>
              ))}
            </div>

            <Separator className="my-5 mx-4" />
            <div className="px-4">
              <CaregiverMemorySender />
            </div>
          </div>
        </TabsContent>

        {/* Calendar */}
        <TabsContent value="calendar" className="flex-1 min-h-0 overflow-y-auto mt-0">
          <div className="pt-3 pb-24">
            <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Upcoming Events</p>
            <div className="mx-4 ios-card overflow-hidden divide-y divide-border/30">
              {[
                { title: 'Doctor Visit', date: 'Tomorrow, 10:00 AM', type: 'Medical' },
                { title: 'Family Lunch', date: 'Saturday, 12:00 PM', type: 'Social' },
                { title: 'Physical Therapy', date: 'Monday, 2:00 PM', type: 'Health' },
              ].map((apt) => (
                <div key={apt.title} className="flex items-center gap-3 px-4" style={{ minHeight: 56 }}>
                  <IconBox Icon={CalendarDays} color={apt.type === 'Medical' ? iosColors.red : apt.type === 'Social' ? iosColors.blue : iosColors.green} />
                  <div className="flex-1">
                    <p className="text-ios-callout font-medium text-foreground">{apt.title}</p>
                    <p className="text-ios-footnote text-muted-foreground">{apt.date}</p>
                  </div>
                  <span className="text-ios-caption text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{apt.type}</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="flex-1 min-h-0 overflow-y-auto mt-0">
          <div className="pt-3 pb-24">
            <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Care Team</p>
            <div className="mx-4 ios-card overflow-hidden divide-y divide-border/30">
              {[
                { name: 'Sarah Johnson', role: 'Primary Caregiver', status: 'Online', online: true },
                { name: 'John Johnson', role: 'Son', status: 'Last seen 1h ago', online: false },
                { name: 'Dr. Smith', role: 'Primary Physician', status: 'Available', online: true },
                { name: 'Nurse Maria', role: 'Home Nurse', status: 'Next visit: Mon', online: false },
              ].map((member) => (
                <div key={member.name} className="flex items-center gap-3 px-4" style={{ minHeight: 56 }}>
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    {member.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ios-callout font-medium text-foreground">{member.name}</p>
                    <p className="text-ios-footnote text-muted-foreground">{member.role}</p>
                  </div>
                  <span className="text-ios-caption text-muted-foreground">{member.status}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CaregiverManageSheet open={manageOpen} onClose={() => setManageOpen(false)} />

      {/* View Picker Modal */}
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-2xl w-full max-w-sm overflow-hidden border border-border"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 flex items-center justify-between">
                <h3 className="text-ios-title2 text-foreground">Choose Dashboard View</h3>
                <button onClick={() => setViewModalOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center touch-target">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="px-5 pb-5 divide-y divide-border/30">
                {careViewOptions.map(view => (
                  <button
                    key={view.id}
                    onClick={() => selectView(view.id)}
                    className="w-full flex items-center gap-3 py-4 text-left touch-target"
                    style={{ minHeight: 56 }}
                  >
                    <IconBox Icon={view.icon} color={view.color} />
                     <div className="flex-1">
                       <p className="text-ios-callout font-medium text-foreground">{view.label}</p>
                       <p className="text-ios-footnote text-muted-foreground">{view.role}</p>
                     </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
