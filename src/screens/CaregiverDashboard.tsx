import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import CaregiverManageSheet from '@/components/CaregiverManageSheet';
import { motion } from 'framer-motion';
import {
  MapPin, MessageCircle, Bell, Phone, Heart, Moon, Footprints,
  Pill, TrendingDown, TrendingUp, AlertTriangle, ChevronRight,
  Activity, Brain, FileText, Share2, Download, Mail, Shield,
  Plus, Eye, LogOut, BarChart3, Check, Settings2
} from 'lucide-react';
import { useMedications, useActivities, useVitals } from '@/hooks/useCareData';

export default function CaregiverDashboard() {
  const { activeCaregiverTab, toggleCaregiverView, currentMood, medicationAdherence, taskCompletionRate, mode } = useApp();
  const { data: medications = [] } = useMedications();
  const { data: activities = [] } = useActivities();
  const { data: vitals = [] } = useVitals();
  const stepCount = Number(vitals.find(v => v.type === 'steps')?.value || 0);
  const sleepHours = Number(vitals.find(v => v.type === 'sleep')?.value || 0);
  const [tasksDone, setTasksDone] = useState<Set<string>>(new Set(['1', '2']));
  const [reportRange, setReportRange] = useState<'7' | '30' | '90'>('7');
  const [manageOpen, setManageOpen] = useState(false);

  const toggleTask = (id: string) => {
    setTasksDone(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // Dashboard Tab
  if (activeCaregiverTab === 'dashboard') {
    return (
      <div className="h-full overflow-y-auto warm-gradient pb-6">
        <div className="px-5 pt-3 pb-3">
          <div className="flex items-center justify-between">
            <h1 className="text-[22px] font-bold text-foreground">Care Dashboard</h1>
            <button onClick={toggleCaregiverView} className="text-[14px] text-primary font-medium touch-target">Patient View</button>
          </div>
        </div>

        {/* Patient Status */}
        <div className="px-5 mt-1">
          <div className="ios-card-elevated p-4">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-[26px]">👩‍🦳</div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success border-2 border-card" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[16px] font-bold text-foreground">Margaret Smith</div>
                <div className="text-[12px] text-muted-foreground">Active 2 min ago</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    mode === 'full' ? 'bg-primary/10 text-primary' : mode === 'simplified' ? 'bg-warning/10 text-warning' : 'bg-lavender/10 text-lavender'
                  }`}>
                    {mode === 'full' ? 'Full' : mode === 'simplified' ? 'Simple' : 'Essential'}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> Home
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 mt-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: MapPin, label: 'Location', bg: 'bg-primary/8', color: 'text-primary' },
              { icon: MessageCircle, label: 'Message', bg: 'bg-sage/8', color: 'text-sage' },
              { icon: Bell, label: 'Reminder', bg: 'bg-accent/8', color: 'text-accent' },
              { icon: Phone, label: 'Call', bg: 'bg-destructive/8', color: 'text-destructive' },
            ].map(action => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  whileTap={{ scale: 0.92 }}
                  className="ios-card p-3 flex flex-col items-center gap-2 touch-target"
                >
                  <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <span className="text-[11px] font-medium text-foreground">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Today's Activity</h2>
          <div className="ios-card-elevated p-4">
            {activities.map((item, i) => (
              <div key={item.id} className="flex items-start gap-3 pb-3 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${item.completed ? 'bg-success/10' : 'bg-warning/10'}`}>
                    {item.icon}
                  </div>
                  {i < activities.length - 1 && <div className="w-px h-5 bg-border/60 mt-1" />}
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="text-[14px] font-medium text-foreground">{item.description}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{item.time}</div>
                </div>
                {item.completed ? (
                  <Check className="w-4 h-4 text-success mt-1 shrink-0" />
                ) : (
                  <span className="text-warning text-[11px] font-medium mt-1">Pending</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Health Metrics */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Health Snapshot</h2>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {[
              { label: 'Sleep', value: `${sleepHours}h`, Icon: Moon, trend: 'up', color: 'text-lavender', bg: 'bg-lavender/8' },
              { label: 'Steps', value: `${(stepCount / 1000).toFixed(1)}k`, Icon: Footprints, trend: 'down', color: 'text-sage', bg: 'bg-sage/8' },
              { label: 'Mood', value: currentMood.emoji, Icon: Heart, trend: 'stable', color: 'text-accent', bg: 'bg-accent/8' },
              { label: 'Meds', value: `${medicationAdherence}%`, Icon: Pill, trend: 'up', color: 'text-primary', bg: 'bg-primary/8' },
            ].map(metric => {
              const Icon = metric.Icon;
              return (
                <div key={metric.label} className="ios-card-elevated min-w-[120px] p-3 shrink-0">
                  <div className={`w-8 h-8 rounded-lg ${metric.bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 ${metric.color}`} />
                  </div>
                  <div className="text-[20px] font-bold text-foreground">{metric.value}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[11px] text-muted-foreground">{metric.label}</span>
                    {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-success" />}
                    {metric.trend === 'down' && <TrendingDown className="w-3 h-3 text-destructive" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Alerts</h2>
          <div className="ios-card-elevated divide-y divide-border/60">
            {[
              { text: 'Medication taken late (15 min)', time: '2 hours ago', level: 'warn' },
              { text: 'Mode switch suggested', time: 'Yesterday', level: 'info' },
              { text: 'Fall detected, resolved', time: 'Feb 10', level: 'critical' },
            ].map((alert, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  alert.level === 'critical' ? 'bg-destructive' : alert.level === 'warn' ? 'bg-warning' : 'bg-primary'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-foreground">{alert.text}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{alert.time}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Health Tab
  if (activeCaregiverTab === 'health') {
    return (
      <div className="h-full overflow-y-auto warm-gradient pb-6">
        <div className="px-5 pt-3 pb-3">
          <h1 className="text-[22px] font-bold text-foreground">Patient Health</h1>
        </div>

        {/* Vitals */}
        <div className="px-5 mt-1">
          <h2 className="text-ios-title3 text-foreground mb-3">Vital Signs</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Heart Rate', value: '72 bpm', Icon: Heart, time: '1 hr ago', bg: 'bg-destructive/8', color: 'text-destructive' },
              { label: 'Blood Pressure', value: '120/80', Icon: Activity, time: 'This morning', bg: 'bg-primary/8', color: 'text-primary' },
              { label: 'Weight', value: '150 lbs', Icon: BarChart3, time: 'Yesterday', bg: 'bg-sage/8', color: 'text-sage' },
              { label: 'Temperature', value: '98.6°F', Icon: Activity, time: '2 hrs ago', bg: 'bg-accent/8', color: 'text-accent' },
            ].map(vital => (
              <div key={vital.label} className="ios-card-elevated p-3.5">
                <div className={`w-9 h-9 rounded-xl ${vital.bg} flex items-center justify-center mb-2`}>
                  <vital.Icon className={`w-[18px] h-[18px] ${vital.color}`} />
                </div>
                <div className="text-[18px] font-bold text-foreground">{vital.value}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{vital.label}</div>
                <div className="text-[11px] text-muted-foreground">{vital.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Monitoring */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Activity</h2>
          <div className="ios-card-elevated p-4 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[14px] text-foreground font-medium">Movement</span>
                <span className="text-[13px] text-primary font-medium">{stepCount.toLocaleString()} steps</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((stepCount / 3000) * 100, 100)}%` }} className="h-full rounded-full bg-primary" />
              </div>
              <div className="text-[11px] text-muted-foreground mt-1.5">7-day avg: 3,100 steps</div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[14px] text-foreground font-medium">Sleep</span>
                <span className="text-[13px] text-lavender font-medium">{sleepHours} hrs</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(sleepHours / 9) * 100}%` }} className="h-full rounded-full bg-lavender" />
              </div>
              <div className="text-[11px] text-muted-foreground mt-1.5">Quality: Good · 2 interruptions</div>
            </div>
            <div className="pt-2.5 border-t border-border/60">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-[13px] text-warning font-medium">Movement lower than usual today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cognitive Health */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Cognitive Health</h2>
          <div className="ios-card-elevated p-4 space-y-3">
            {[
              { label: 'Task Completion', value: `${taskCompletionRate}%`, trend: 'down from 91%', color: 'text-warning' },
              { label: 'Avg Response Time', value: '45 sec', trend: 'up from 30 sec', color: 'text-warning' },
              { label: 'Voice Command Success', value: '78%', trend: 'stable', color: 'text-primary' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-1">
                <span className="text-[14px] text-foreground">{item.label}</span>
                <div className="text-right">
                  <span className="text-[14px] font-bold text-foreground">{item.value}</span>
                  <span className={`block text-[11px] ${item.color}`}>{item.trend}</span>
                </div>
              </div>
            ))}
            <div className="pt-2.5 border-t border-border/60">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-accent" />
                <span className="text-[13px] text-accent font-medium">Consider switching to Simplified Mode</span>
              </div>
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Medications</h2>
          <div className="ios-card-elevated divide-y divide-border/60">
            {medications.map(med => (
              <div key={med.id} className="flex items-center gap-3 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${med.taken ? 'bg-success/10' : 'bg-warning/10'}`}>
                  <Pill className={`w-5 h-5 ${med.taken ? 'text-success' : 'text-warning'}`} />
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-foreground">{med.name} {med.dosage}</div>
                  <div className="text-[12px] text-muted-foreground">{med.time}</div>
                </div>
                <span className={`text-[12px] font-semibold ${med.taken ? 'text-success' : 'text-warning'}`}>
                  {med.taken ? `Taken ${med.taken_at}` : 'Pending'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[12px] text-muted-foreground text-center">
            Adherence: {medicationAdherence}% (last 30 days)
          </div>
        </div>

        {/* Mood */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Mood Tracking</h2>
          <div className="ios-card-elevated p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[28px]">{currentMood.emoji}</span>
              <div>
                <div className="text-[14px] font-semibold text-foreground">Currently: {currentMood.label}</div>
                <div className="text-[12px] text-muted-foreground">Logged at {currentMood.time}</div>
              </div>
            </div>
            <div className="flex justify-between pt-3 border-t border-border/60">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-[18px]">{['😊', '😊', '😐', '😊', '😔', '😊', '😊'][i]}</span>
                  <span className="text-[10px] text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tasks Tab
  if (activeCaregiverTab === 'tasks') {
    const tasks = [
      { id: '1', title: 'Morning medication — Lisinopril', type: 'med', time: '9:00 AM', assignee: 'Auto' },
      { id: '2', title: 'Morning shower', type: 'care', time: '8:30 AM', assignee: 'Sarah' },
      { id: '3', title: 'Prepare lunch', type: 'care', time: '12:00 PM', assignee: 'Sarah' },
      { id: '4', title: 'Afternoon medication — Metformin', type: 'med', time: '2:00 PM', assignee: 'Auto' },
      { id: '5', title: 'Evening walk', type: 'care', time: '5:00 PM', assignee: 'John' },
      { id: '6', title: 'Evening medication — Aspirin', type: 'med', time: '8:00 PM', assignee: 'Auto' },
      { id: '7', title: 'Doctor visit', type: 'appt', time: 'Tomorrow 10 AM', assignee: 'Sarah' },
    ];

    return (
      <div className="h-full overflow-y-auto warm-gradient pb-6 relative">
        <div className="px-5 pt-3 pb-3">
          <div className="flex items-center justify-between">
            <h1 className="text-[22px] font-bold text-foreground">Care Tasks</h1>
            <button className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center touch-target">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {['All', 'Today', 'This Week', 'Mine'].map((f, i) => (
              <button key={f} className={`px-4 h-8 rounded-full text-[12px] font-semibold touch-target ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 mt-3">
          <h3 className="text-[16px] font-bold text-foreground mb-2">Today</h3>
          <div className="ios-card-elevated divide-y divide-border/60">
            {tasks.filter(t => t.time !== 'Tomorrow 10 AM').map(task => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full flex items-center gap-3 p-4 text-left active:bg-muted/30 touch-target"
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                  tasksDone.has(task.id) ? 'border-success bg-success' : 'border-border'
                }`}>
                  {tasksDone.has(task.id) && <Check className="w-3.5 h-3.5 text-success-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[14px] font-medium ${tasksDone.has(task.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{task.assignee} · {task.time}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                  task.type === 'med' ? 'bg-primary/8 text-primary' : task.type === 'appt' ? 'bg-accent/8 text-accent' : 'bg-sage/8 text-sage'
                }`}>
                  {task.type === 'med' ? 'Med' : task.type === 'appt' ? 'Appt' : 'Care'}
                </span>
              </button>
            ))}
          </div>
          <h3 className="text-[16px] font-bold text-foreground mb-2 mt-5">Upcoming</h3>
          <div className="ios-card-elevated p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/8 flex items-center justify-center shrink-0">
              <span className="text-lg">🏥</span>
            </div>
            <div>
              <div className="text-[14px] font-medium text-foreground">Doctor Visit</div>
              <div className="text-[12px] text-muted-foreground">Tomorrow, 10:00 AM · Sarah</div>
            </div>
          </div>
        </div>

        {/* Caregiver Manage FAB */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setManageOpen(true)}
          className="fixed bottom-20 right-4 w-14 h-14 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-center z-30 ios-card-elevated"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
          aria-label="Manage patient data"
        >
          <Settings2 className="w-6 h-6" />
        </motion.button>

        <CaregiverManageSheet open={manageOpen} onClose={() => setManageOpen(false)} />
      </div>
    );
  }

  // Reports Tab
  if (activeCaregiverTab === 'reports') {
    return (
      <div className="h-full overflow-y-auto warm-gradient pb-6">
        <div className="px-5 pt-3 pb-3">
          <div className="flex items-center justify-between">
            <h1 className="text-[22px] font-bold text-foreground">Reports</h1>
            <button className="flex items-center gap-1 text-[14px] text-primary font-medium touch-target">
              <Share2 className="w-4 h-4" /> Export
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {(['7', '30', '90'] as const).map(r => (
              <button
                key={r}
                onClick={() => setReportRange(r)}
                className={`px-4 h-8 rounded-full text-[12px] font-semibold touch-target ${reportRange === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {r} days
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 mt-3">
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Active Days', value: '28/30', color: 'text-success' },
              { label: 'Med Adherence', value: `${medicationAdherence}%`, color: 'text-primary' },
              { label: 'Task Completion', value: `${taskCompletionRate}%`, color: 'text-accent' },
              { label: 'Health Score', value: '8.2/10', color: 'text-sage' },
            ].map(stat => (
              <div key={stat.label} className="ios-card-elevated p-4 text-center">
                <div className={`text-[22px] font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-[12px] text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Bars */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Activity Trends</h2>
          <div className="ios-card-elevated p-4">
            <div className="flex items-end gap-2 h-28">
              {[65, 80, 45, 90, 70, 85, 78].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    className="w-full rounded-lg bg-primary/60"
                  />
                  <span className="text-[9px] text-muted-foreground font-medium">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incidents */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Incidents</h2>
          <div className="ios-card-elevated divide-y divide-border/60">
            {[
              { text: 'Falls: 1 incident', detail: 'Feb 10 — Resolved', Icon: AlertTriangle },
              { text: 'Missed Medications: 2', detail: 'Last 30 days', Icon: Pill },
              { text: 'Alerts Triggered: 5', detail: 'Last 30 days', Icon: Bell },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <item.Icon className="w-5 h-5 text-warning shrink-0" />
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-foreground">{item.text}</div>
                  <div className="text-[11px] text-muted-foreground">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Share Report</h2>
          <div className="ios-card-elevated divide-y divide-border/60">
            {[
              { Icon: Mail, label: 'Email to family', desc: 'Send summary to care team' },
              { Icon: Download, label: 'Download PDF', desc: 'Full report with charts' },
              { Icon: Share2, label: 'Share with doctor', desc: 'Secure, HIPAA-compliant link' },
            ].map(opt => (
              <button key={opt.label} className="w-full flex items-center gap-3 p-4 text-left active:bg-muted/30 touch-target">
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                  <opt.Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-foreground">{opt.label}</div>
                  <div className="text-[11px] text-muted-foreground">{opt.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Settings Tab
  return (
    <div className="h-full overflow-y-auto warm-gradient pb-6">
      <div className="px-5 pt-3 pb-3">
        <h1 className="text-[22px] font-bold text-foreground">Settings</h1>
      </div>

      {/* Profile */}
      <div className="px-5 mt-1">
        <div className="ios-card-elevated p-4 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-[22px] shrink-0">👩</div>
          <div className="flex-1 min-w-0">
            <div className="text-[16px] font-bold text-foreground">Sarah Johnson</div>
            <div className="text-[12px] text-muted-foreground">Primary Caregiver (Daughter)</div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </div>
      </div>

      {/* Notifications */}
      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Notifications</h2>
        <div className="ios-card-elevated divide-y divide-border/60">
          {[
            { label: 'Critical Alerts', desc: 'Falls, emergencies', on: true, locked: true },
            { label: 'Medication reminders', desc: '', on: true, locked: false },
            { label: 'Task assignments', desc: '', on: true, locked: false },
            { label: 'Daily summaries', desc: '', on: false, locked: false },
            { label: 'Weekly reports', desc: '', on: true, locked: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-4">
              <div className="flex-1">
                <div className="text-[14px] font-medium text-foreground">{item.label}</div>
                {item.desc && <div className="text-[11px] text-muted-foreground">{item.desc}</div>}
              </div>
              <div className={`w-[46px] h-[28px] rounded-full flex items-center px-0.5 transition-colors ${item.on ? 'bg-success justify-end' : 'bg-muted justify-start'} ${item.locked ? 'opacity-50' : ''}`}>
                <div className="w-6 h-6 rounded-full bg-card shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Care Team */}
      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Care Team</h2>
        <div className="ios-card-elevated divide-y divide-border/60">
          {[
            { name: 'Sarah Johnson', role: 'Primary', access: 'Full access', emoji: '👩' },
            { name: 'John Johnson', role: 'Son', access: 'View only', emoji: '👨' },
            { name: 'Dr. Smith', role: 'Doctor', access: 'Health data', emoji: '👨‍⚕️' },
          ].map(member => (
            <div key={member.name} className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="text-[18px]">{member.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-foreground">{member.name}</div>
                <div className="text-[11px] text-muted-foreground">{member.role} · {member.access}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          ))}
          <button className="w-full p-4 text-primary text-[14px] font-semibold text-center touch-target">
            + Add Member
          </button>
        </div>
      </div>

      {/* Patient Interface */}
      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Patient Interface</h2>
        <div className="ios-card-elevated divide-y divide-border/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
                <Eye className="w-[18px] h-[18px] text-primary" />
              </div>
              <div>
                <div className="text-[14px] font-medium text-foreground">Current Mode</div>
                <div className="text-[12px] text-muted-foreground">{mode === 'full' ? 'Full' : mode === 'simplified' ? 'Simplified' : 'Essential'}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
                <Shield className="w-[18px] h-[18px] text-primary" />
              </div>
              <div>
                <div className="text-[14px] font-medium text-foreground">Emergency SOS</div>
                <div className="text-[12px] text-muted-foreground">Primary: Sarah · Auto-call: 30s</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="px-5 mt-5 mb-6">
        <div className="ios-card-elevated">
          <button className="w-full p-4 text-left flex items-center gap-3 active:bg-muted/30 touch-target">
            <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
              <FileText className="w-[18px] h-[18px] text-primary" />
            </div>
            <span className="text-[14px] font-medium text-foreground flex-1">Help & Support</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <button className="w-full ios-card mt-3 p-4 flex items-center gap-3 text-destructive touch-target">
          <LogOut className="w-5 h-5" />
          <span className="text-[14px] font-medium">Sign Out</span>
        </button>
        <div className="text-center mt-4 text-[11px] text-muted-foreground">MemoCare v1.0.0</div>
      </div>
    </div>
  );
}
