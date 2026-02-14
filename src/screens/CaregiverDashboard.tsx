import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import {
  MapPin, MessageCircle, Bell, Phone, Heart, Moon, Footprints,
  Pill, TrendingDown, TrendingUp, AlertTriangle, ChevronRight,
  Activity, Brain, FileText, Share2, Download, Mail, Shield,
  CheckSquare, Plus, Users, Settings, Eye, LogOut, BarChart3
} from 'lucide-react';

export default function CaregiverDashboard() {
  const { activeCaregiverTab, toggleCaregiverView, medications, activities, currentMood, stepCount, sleepHours, medicationAdherence, taskCompletionRate, mode } = useApp();
  const [tasksDone, setTasksDone] = useState<Set<string>>(new Set(['1', '2']));
  const [reportRange, setReportRange] = useState<'7' | '30' | '90'>('7');

  const toggleTask = (id: string) => {
    setTasksDone(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // Dashboard Tab
  if (activeCaregiverTab === 'dashboard') {
    return (
      <div className="h-full overflow-y-auto bg-surface pb-24">
        <div className="px-5 pt-3 pb-3 bg-background">
          <div className="flex items-center justify-between">
            <h1 className="text-ios-title text-foreground">Care Dashboard</h1>
            <button onClick={toggleCaregiverView} className="text-ios-subheadline text-primary">Patient View</button>
          </div>
        </div>

        {/* Patient Status Card */}
        <div className="px-5 mt-3">
          <div className="ios-card-elevated p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">👩‍🦳</div>
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-success border-2 border-card" />
              </div>
              <div className="flex-1">
                <div className="text-ios-headline text-foreground">Margaret Smith</div>
                <div className="text-ios-footnote text-muted-foreground">Active 2 min ago</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    mode === 'full' ? 'bg-blue-500 text-white' : mode === 'simplified' ? 'bg-warning text-white' : 'bg-lavender text-white'
                  }`}>
                    {mode === 'full' ? 'Full' : mode === 'simplified' ? 'Simple' : 'Essential'}
                  </span>
                  <span className="text-ios-caption text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Home
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center">
                <Shield className="w-5 h-5 text-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 mt-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: MapPin, label: 'Location', color: 'bg-primary/10 text-primary' },
              { icon: MessageCircle, label: 'Message', color: 'bg-sage/15 text-sage' },
              { icon: Bell, label: 'Reminder', color: 'bg-accent/10 text-accent' },
              { icon: Phone, label: 'Call', color: 'bg-destructive/10 text-destructive' },
            ].map(action => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  whileTap={{ scale: 0.92 }}
                  className="ios-card-elevated p-3 flex flex-col items-center gap-2"
                >
                  <div className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-ios-caption text-foreground">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Today's Activity Timeline */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Today's Activity</h2>
          <div className="ios-card-elevated p-4">
            {activities.map((item, i) => (
              <div key={item.id} className="flex items-start gap-3 pb-3 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${item.completed ? 'bg-success/15' : 'bg-warning/15'}`}>
                    {item.icon}
                  </div>
                  {i < activities.length - 1 && <div className="w-px h-6 bg-border mt-1" />}
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="text-ios-subheadline text-foreground">{item.description}</div>
                  <div className="text-ios-caption text-muted-foreground">{item.time}</div>
                </div>
                {item.completed ? (
                  <span className="text-success text-ios-caption font-medium">✓</span>
                ) : (
                  <span className="text-warning text-ios-caption font-medium">Pending</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Health Metrics */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Health Snapshot</h2>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {[
              { label: 'Sleep', value: `${sleepHours}h`, icon: Moon, trend: 'up', color: 'text-lavender', bg: 'bg-lavender/10' },
              { label: 'Steps', value: `${(stepCount / 1000).toFixed(1)}k`, icon: Footprints, trend: 'down', color: 'text-sage', bg: 'bg-sage/10' },
              { label: 'Mood', value: currentMood.emoji, icon: Heart, trend: 'stable', color: 'text-accent', bg: 'bg-accent/10' },
              { label: 'Meds', value: `${medicationAdherence}%`, icon: Pill, trend: 'up', color: 'text-primary', bg: 'bg-primary/10' },
            ].map(metric => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="ios-card-elevated min-w-[130px] p-3">
                  <div className={`w-8 h-8 rounded-lg ${metric.bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 ${metric.color}`} />
                  </div>
                  <div className="text-ios-title2 text-foreground">{metric.value}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-ios-caption text-muted-foreground">{metric.label}</span>
                    {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-success" />}
                    {metric.trend === 'down' && <TrendingDown className="w-3 h-3 text-destructive" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="px-5 mt-5 mb-4">
          <h2 className="text-ios-title3 text-foreground mb-3">Alerts</h2>
          <div className="ios-card-elevated divide-y divide-border">
            {[
              { text: 'Medication taken late (15 min)', time: '2 hours ago', level: 'warn' },
              { text: 'Mode switch suggested', time: 'Yesterday', level: 'info' },
              { text: 'Fall detected, resolved', time: 'Feb 10', level: 'critical' },
            ].map((alert, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className={`w-2 h-2 rounded-full ${
                  alert.level === 'critical' ? 'bg-destructive' : alert.level === 'warn' ? 'bg-warning' : 'bg-primary'
                }`} />
                <div className="flex-1">
                  <div className="text-ios-subheadline text-foreground">{alert.text}</div>
                  <div className="text-ios-caption text-muted-foreground">{alert.time}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
      <div className="h-full overflow-y-auto bg-surface pb-24">
        <div className="px-5 pt-3 pb-3 bg-background">
          <h1 className="text-ios-title text-foreground">Patient Health</h1>
        </div>

        {/* Vitals */}
        <div className="px-5 mt-3">
          <h2 className="text-ios-title3 text-foreground mb-3">Vital Signs</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Heart Rate', value: '72 bpm', icon: Heart, time: '1 hr ago', color: 'bg-destructive/10 text-destructive' },
              { label: 'Blood Pressure', value: '120/80', icon: Activity, time: 'This morning', color: 'bg-primary/10 text-primary' },
              { label: 'Weight', value: '150 lbs', icon: BarChart3, time: 'Yesterday', color: 'bg-sage/10 text-sage' },
              { label: 'Temperature', value: '98.6°F', icon: Activity, time: '2 hrs ago', color: 'bg-accent/10 text-accent' },
            ].map(vital => {
              const Icon = vital.icon;
              return (
                <div key={vital.label} className="ios-card-elevated p-4">
                  <div className={`w-10 h-10 rounded-xl ${vital.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-ios-title2 text-foreground">{vital.value}</div>
                  <div className="text-ios-caption text-muted-foreground">{vital.label}</div>
                  <div className="text-ios-caption text-muted-foreground mt-1">{vital.time}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Monitoring */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Activity Monitoring</h2>
          <div className="ios-card-elevated p-4 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-ios-body text-foreground font-medium">Movement</span>
                <span className="text-ios-subheadline text-primary">{stepCount.toLocaleString()} steps</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(stepCount / 3000) * 100}%` }} className="h-full rounded-full bg-primary" />
              </div>
              <div className="text-ios-caption text-muted-foreground mt-1">7-day avg: 3,100 steps</div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-ios-body text-foreground font-medium">Sleep</span>
                <span className="text-ios-subheadline text-lavender">{sleepHours} hrs</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(sleepHours / 9) * 100}%` }} className="h-full rounded-full bg-lavender" />
              </div>
              <div className="text-ios-caption text-muted-foreground mt-1">Quality: Good · 2 interruptions</div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-ios-subheadline text-warning">Movement lower than usual today</span>
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
                <span className="text-ios-body text-foreground">{item.label}</span>
                <div className="text-right">
                  <span className="text-ios-body font-semibold text-foreground">{item.value}</span>
                  <span className={`block text-ios-caption ${item.color}`}>{item.trend}</span>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-accent" />
                <span className="text-ios-subheadline text-accent">Consider switching to Simplified Mode</span>
              </div>
            </div>
          </div>
        </div>

        {/* Medication Tracking */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Medications</h2>
          <div className="ios-card-elevated divide-y divide-border">
            {medications.map(med => (
              <div key={med.id} className="flex items-center gap-3 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${med.taken ? 'bg-success/15' : 'bg-warning/15'}`}>
                  <Pill className={`w-5 h-5 ${med.taken ? 'text-success' : 'text-warning'}`} />
                </div>
                <div className="flex-1">
                  <div className="text-ios-body text-foreground">{med.name} {med.dosage}</div>
                  <div className="text-ios-caption text-muted-foreground">{med.time}</div>
                </div>
                <span className={`text-ios-footnote font-medium ${med.taken ? 'text-success' : 'text-warning'}`}>
                  {med.taken ? `Taken ${med.takenAt}` : 'Pending'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-ios-footnote text-muted-foreground text-center">
            Adherence: {medicationAdherence}% (last 30 days) · 2 missed doses
          </div>
        </div>

        {/* Mood History */}
        <div className="px-5 mt-5 mb-4">
          <h2 className="text-ios-title3 text-foreground mb-3">Mood Tracking</h2>
          <div className="ios-card-elevated p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{currentMood.emoji}</span>
              <div>
                <div className="text-ios-body font-medium text-foreground">Currently: {currentMood.label}</div>
                <div className="text-ios-caption text-muted-foreground">Logged at {currentMood.time}</div>
              </div>
            </div>
            <div className="flex justify-between pt-3 border-t border-border">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-lg">{['😊', '😊', '😐', '😊', '😔', '😊', '😊'][i]}</span>
                  <span className="text-ios-caption text-muted-foreground">{day}</span>
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
      <div className="h-full overflow-y-auto bg-surface pb-24">
        <div className="px-5 pt-3 pb-3 bg-background">
          <div className="flex items-center justify-between">
            <h1 className="text-ios-title text-foreground">Care Tasks</h1>
            <button className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {['All', 'Today', 'This Week', 'Mine'].map((f, i) => (
              <button key={f} className={`px-4 h-8 rounded-full text-ios-footnote font-medium ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 mt-4">
          <h3 className="text-ios-headline text-foreground mb-2">Today</h3>
          <div className="ios-card-elevated divide-y divide-border">
            {tasks.filter(t => t.time !== 'Tomorrow 10 AM').map(task => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full flex items-center gap-3 p-4 text-left active:bg-muted/50"
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  tasksDone.has(task.id) ? 'border-success bg-success' : 'border-border'
                }`}>
                  {tasksDone.has(task.id) && <span className="text-[10px] text-success-foreground">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-ios-body ${tasksDone.has(task.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </div>
                  <div className="text-ios-caption text-muted-foreground">{task.assignee} · {task.time}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  task.type === 'med' ? 'bg-primary/10 text-primary' : task.type === 'appt' ? 'bg-accent/10 text-accent' : 'bg-sage/10 text-sage'
                }`}>
                  {task.type === 'med' ? 'Med' : task.type === 'appt' ? 'Appt' : 'Care'}
                </span>
              </button>
            ))}
          </div>
          <h3 className="text-ios-headline text-foreground mb-2 mt-5">Upcoming</h3>
          <div className="ios-card-elevated p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <span className="text-lg">🏥</span>
            </div>
            <div>
              <div className="text-ios-body text-foreground">Doctor Visit</div>
              <div className="text-ios-caption text-muted-foreground">Tomorrow, 10:00 AM · Sarah</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reports Tab
  if (activeCaregiverTab === 'reports') {
    return (
      <div className="h-full overflow-y-auto bg-surface pb-24">
        <div className="px-5 pt-3 pb-3 bg-background">
          <div className="flex items-center justify-between">
            <h1 className="text-ios-title text-foreground">Reports</h1>
            <button className="flex items-center gap-1 text-ios-subheadline text-primary">
              <Share2 className="w-4 h-4" /> Export
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {(['7', '30', '90'] as const).map(r => (
              <button
                key={r}
                onClick={() => setReportRange(r)}
                className={`px-4 h-8 rounded-full text-ios-footnote font-medium ${reportRange === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {r} days
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Active Days', value: '28/30', color: 'text-success' },
              { label: 'Med Adherence', value: `${medicationAdherence}%`, color: 'text-primary' },
              { label: 'Task Completion', value: `${taskCompletionRate}%`, color: 'text-accent' },
              { label: 'Health Score', value: '8.2/10', color: 'text-sage' },
            ].map(stat => (
              <div key={stat.label} className="ios-card-elevated p-4 text-center">
                <div className={`text-ios-title1 font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-ios-caption text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Bars */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Activity Trends</h2>
          <div className="ios-card-elevated p-4">
            <div className="flex items-end gap-2 h-32">
              {[65, 80, 45, 90, 70, 85, 78].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="w-full rounded-t-md bg-primary/70"
                  />
                  <span className="text-[9px] text-muted-foreground">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incidents */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Incidents</h2>
          <div className="ios-card-elevated divide-y divide-border">
            {[
              { text: 'Falls: 1 incident', detail: 'Feb 10 — Resolved', icon: AlertTriangle },
              { text: 'Missed Medications: 2', detail: 'Last 30 days', icon: Pill },
              { text: 'Alerts Triggered: 5', detail: 'Last 30 days', icon: Bell },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-4">
                  <Icon className="w-5 h-5 text-warning" />
                  <div className="flex-1">
                    <div className="text-ios-body text-foreground">{item.text}</div>
                    <div className="text-ios-caption text-muted-foreground">{item.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Share options */}
        <div className="px-5 mt-5 mb-4">
          <h2 className="text-ios-title3 text-foreground mb-3">Share Report</h2>
          <div className="ios-card-elevated divide-y divide-border">
            {[
              { icon: Mail, label: 'Email to family', desc: 'Send summary to care team' },
              { icon: Download, label: 'Download PDF', desc: 'Full report with charts' },
              { icon: Share2, label: 'Share with doctor', desc: 'Secure, HIPAA-compliant link' },
            ].map(opt => {
              const Icon = opt.icon;
              return (
                <button key={opt.label} className="w-full flex items-center gap-3 p-4 text-left active:bg-muted/50">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-ios-body text-foreground">{opt.label}</div>
                    <div className="text-ios-caption text-muted-foreground">{opt.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Settings Tab
  return (
    <div className="h-full overflow-y-auto bg-surface pb-24">
      <div className="px-5 pt-3 pb-3 bg-background">
        <h1 className="text-ios-title text-foreground">Settings</h1>
      </div>

      {/* Profile */}
      <div className="px-5 mt-3">
        <div className="ios-card-elevated p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">👩</div>
          <div className="flex-1">
            <div className="text-ios-headline text-foreground">Sarah Johnson</div>
            <div className="text-ios-caption text-muted-foreground">Primary Caregiver (Daughter)</div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Notifications */}
      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Notifications</h2>
        <div className="ios-card-elevated divide-y divide-border">
          {[
            { label: 'Critical Alerts', desc: 'Falls, emergencies', on: true, locked: true },
            { label: 'Medication reminders', desc: '', on: true, locked: false },
            { label: 'Task assignments', desc: '', on: true, locked: false },
            { label: 'Daily summaries', desc: '', on: false, locked: false },
            { label: 'Weekly reports', desc: '', on: true, locked: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-4">
              <div>
                <div className="text-ios-body text-foreground">{item.label}</div>
                {item.desc && <div className="text-ios-caption text-muted-foreground">{item.desc}</div>}
              </div>
              <div className={`w-12 h-7 rounded-full flex items-center px-0.5 transition-colors ${item.on ? 'bg-success justify-end' : 'bg-muted justify-start'} ${item.locked ? 'opacity-60' : ''}`}>
                <div className="w-6 h-6 rounded-full bg-card shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Care Team */}
      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Care Team</h2>
        <div className="ios-card-elevated divide-y divide-border">
          {[
            { name: 'Sarah Johnson', role: 'Primary', access: 'Full access', emoji: '👩' },
            { name: 'John Johnson', role: 'Son', access: 'View only', emoji: '👨' },
            { name: 'Dr. Smith', role: 'Doctor', access: 'Health data', emoji: '👨‍⚕️' },
          ].map(member => (
            <div key={member.name} className="flex items-center gap-3 p-4">
              <span className="text-2xl">{member.emoji}</span>
              <div className="flex-1">
                <div className="text-ios-body text-foreground">{member.name}</div>
                <div className="text-ios-caption text-muted-foreground">{member.role} · {member.access}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
          <button className="w-full p-4 text-primary text-ios-body font-medium text-center">
            + Add Member
          </button>
        </div>
      </div>

      {/* Patient Interface Control */}
      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Patient Interface</h2>
        <div className="ios-card-elevated divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-primary" />
              <div>
                <div className="text-ios-body text-foreground">Current Mode</div>
                <div className="text-ios-caption text-muted-foreground">{mode === 'full' ? 'Full' : mode === 'simplified' ? 'Simplified' : 'Essential'}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <div className="text-ios-body text-foreground">Emergency SOS</div>
                <div className="text-ios-caption text-muted-foreground">Primary: Sarah · Auto-call: 30s</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="px-5 mt-5 mb-8">
        <div className="ios-card-elevated divide-y divide-border">
          <button className="w-full p-4 text-left flex items-center gap-3 active:bg-muted/50">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-ios-body text-foreground">Help & Support</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
          </button>
        </div>
        <button className="w-full ios-card mt-3 p-4 flex items-center gap-3 text-destructive">
          <LogOut className="w-5 h-5" />
          <span className="text-ios-body font-medium">Sign Out</span>
        </button>
        <div className="text-center mt-4 text-ios-caption text-muted-foreground">MemoCare v1.0.0</div>
      </div>
    </div>
  );
}
