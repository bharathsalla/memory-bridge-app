import { useState } from 'react';
import SegmentedControl from '@/components/ui/SegmentedControl';
import patientAvatar from '@/assets/patient-avatar.jpg';
import { PushNotificationSimulator, BackgroundFetchSimulator, AlexaIntegrationSimulator, PersistentNotificationSimulator } from '@/components/NativeFeatureSimulators';
import { useApp } from '@/contexts/AppContext';
import CaregiverManageSheet from '@/components/CaregiverManageSheet';
import CaregiverRemindersPanel from '@/components/CaregiverRemindersPanel';
import CaregiverSupportEcosystem from '@/components/CaregiverSupportEcosystem';
import CrisisPreventionEngine from '@/components/CrisisPreventionEngine';
import CaregiverMemorySender from '@/components/CaregiverMemorySender';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, MessageCircle, Bell, Phone, Heart, Moon, Footprints,
  Pill, TrendingDown, TrendingUp, AlertTriangle, ChevronRight,
  Activity, Brain, FileText, Share2, Download, Mail, Shield,
  Plus, Eye, LogOut, BarChart3, Check, Settings2, Monitor, Mic, MousePointer, Timer, Scan, Clock, User, Sparkles, X
} from 'lucide-react';
import IconBox, { iosColors, getColor } from '@/components/ui/IconBox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, Legend
} from 'recharts';
import { useMedications, useActivities, useVitals, useMissedDoseAlerts } from '@/hooks/useCareData';
import { useScheduledReminders } from '@/hooks/useReminders';
import { formatISTTime } from '@/lib/timeUtils';

export default function CaregiverDashboard() {
  const { activeCaregiverTab, setActiveCaregiverTab, toggleCaregiverView, currentMood, medicationAdherence, taskCompletionRate, mode, setMode, isSOSActive, sosTriggeredLocation, patientLocation, sosHistory, cancelSOS } = useApp();
  const { data: medications = [] } = useMedications();
  const { data: activities = [] } = useActivities();
  const { data: vitals = [] } = useVitals();
  const { data: scheduledReminders = [] } = useScheduledReminders();
  const { data: missedDoseAlerts = [] } = useMissedDoseAlerts();
  const overdueReminders = scheduledReminders.filter(sr => {
    if (sr.status !== 'active') return false;
    const dueTime = new Date(sr.next_due_time).getTime();
    const now = Date.now();
    // Only overdue if due time has passed AND it's been 2+ min past due
    return now > dueTime && (now - dueTime) > 2 * 60 * 1000;
  });
  const stepCount = Number(vitals.find(v => v.type === 'steps')?.value || 0);
  const sleepHours = Number(vitals.find(v => v.type === 'sleep')?.value || 0);
  const [tasksDone, setTasksDone] = useState<Set<string>>(new Set(['1', '2']));
  const [reportRange, setReportRange] = useState<'7' | '30' | '90'>('7');
  const [manageOpen, setManageOpen] = useState(false);
  const [modeModalOpen, setModeModalOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [cgActivityFilter, setCgActivityFilter] = useState('all');
  const [cgAlertFilter, setCgAlertFilter] = useState('all');

  const toggleTask = (id: string) => {
    setTasksDone(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // Dashboard Tab
  if (activeCaregiverTab === 'dashboard') {
    return (
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6">
        {/* iOS Large Title Header */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <h1 className="text-ios-large-title text-foreground">Dashboard</h1>
            <Button onClick={toggleCaregiverView} size="sm" className="h-9 px-3 rounded-xl text-[13px] font-semibold gap-1.5 bg-primary/10 text-primary hover:bg-primary/15 border-0">
              <Eye className="w-4 h-4" /> Patient View
            </Button>
          </div>
          <p className="text-[15px] text-muted-foreground mt-1">Margaret's care overview</p>
        </div>

        {/* Patient Status — Enhanced Profile Card */}
        <div className="px-5 mt-1">
          <div className="rounded-2xl overflow-hidden bg-primary">
            <div className="flex items-center gap-3 px-4 py-5" style={{ minHeight: 84 }}>
              <div className="relative shrink-0">
                <img src={patientAvatar} alt="Margaret" className="w-14 h-14 rounded-full object-cover ring-2 ring-white/30" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-primary" style={{ backgroundColor: '#fff' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-ios-headline font-semibold text-primary-foreground">Margaret Smith</div>
                <div className="text-ios-footnote text-primary-foreground/70">Active 2 min ago</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-primary-foreground">
                    {mode === 'full' ? 'Full' : mode === 'simplified' ? 'Simple' : 'Essential'}
                  </span>
                  <span className="text-[11px] text-primary-foreground/70 font-medium flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> Home
                  </span>
                </div>
              </div>
              <Shield className="w-5 h-5 text-primary-foreground/30 shrink-0" />
            </div>
            {/* Caregiver Details */}
            <div className="px-4 pb-4 pt-1 border-t border-primary-foreground/15 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary-foreground/60" />
                <div>
                  <div className="text-[10px] text-primary-foreground/60">Caregiver</div>
                  <div className="text-[12px] font-semibold text-primary-foreground">Sarah Johnson</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-primary-foreground/60" />
                <div>
                  <div className="text-[10px] text-primary-foreground/60">Relationship</div>
                  <div className="text-[12px] font-semibold text-primary-foreground">Daughter</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary-foreground/60" />
                <div>
                  <div className="text-[10px] text-primary-foreground/60">Contact</div>
                  <div className="text-[12px] font-semibold text-primary-foreground">+1 555-0123</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary-foreground/60" />
                <div>
                  <div className="text-[10px] text-primary-foreground/60">Care Status</div>
                  <div className="text-[12px] font-semibold text-primary-foreground">Active</div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => setActiveCaregiverTab('safety')}
            className="mt-3 w-full ios-card flex items-center gap-3 px-4 py-3.5 text-left">
            <IconBox Icon={Shield} color={iosColors.green} />
            <span className="text-[15px] font-bold text-foreground flex-1">Enable Safety Tracking</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground/30 shrink-0" />
          </button>

          <div className="mt-4 ios-card p-4">
            <CaregiverSupportEcosystem />
          </div>
        </div>

        {/* SOS Active Alert Banner */}
        {isSOSActive && (
          <div className="px-5 mt-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ios-card-elevated bg-destructive/10 border-2 border-destructive p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center animate-pulse shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-[16px] font-bold text-destructive">SOS Triggered!</div>
                  <div className="text-[12px] text-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {sosTriggeredLocation || patientLocation}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveCaregiverTab('safety')}
                  className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold text-[13px] text-center"
                >
                  View Details
                </button>
                <button
                  onClick={cancelSOS}
                  className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground font-semibold text-[13px] text-center"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Quick Actions — iOS grouped list */}
        <div className="mt-6">
          <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Quick Actions</p>
          <div className="mx-4 ios-card overflow-hidden divide-y divide-border/30">
            {[
              { icon: MapPin, label: 'Location', detail: 'Home · Safe zone', color: iosColors.teal },
              { icon: MessageCircle, label: 'Send Message', detail: 'Care circle chat', color: iosColors.blue },
              { icon: Bell, label: 'Send Reminder', detail: 'Medication, meals, etc.', color: iosColors.orange },
              { icon: Phone, label: 'Call Patient', detail: 'Direct call', color: iosColors.green },
            ].map(action => {
              const Icon = action.icon;
              return (
                <button key={action.label} className="w-full flex items-center gap-3 px-4 text-left touch-target" style={{ minHeight: 60 }}>
                  <IconBox Icon={Icon} color={action.color} />
                  <div className="flex-1">
                    <p className="text-ios-callout font-medium text-foreground">{action.label}</p>
                    <p className="text-ios-footnote text-muted-foreground">{action.detail}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity Timeline — Categorized */}
        <div className="mt-6">
          <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Today's Activity</p>
          <div className="mx-4 mb-2">
            <SegmentedControl
              value={cgActivityFilter}
              onChange={setCgActivityFilter}
              items={[
                { value: 'all', label: 'All' },
                { value: 'medication', label: 'Medication' },
                { value: 'meals', label: 'Meals' },
                { value: 'exercise', label: 'Exercise' },
              ]}
            />
          </div>
          <div className="mx-4 ios-card overflow-hidden divide-y divide-border/30">
            {(() => {
              const categorize = (desc: string) => {
                const d = desc.toLowerCase();
                if (d.includes('medication') || d.includes('pill') || d.includes('💊') || d.includes('taken') || d.includes('medicine') || d.includes('metformin') || d.includes('lisinopril') || d.includes('aspirin') || d.includes('dolo')) return 'medication';
                if (d.includes('breakfast') || d.includes('lunch') || d.includes('dinner') || d.includes('meal') || d.includes('🍳') || d.includes('food')) return 'meals';
                if (d.includes('walk') || d.includes('exercise') || d.includes('step') || d.includes('🚶')) return 'exercise';
                return 'other';
              };

              const filtered = [...activities]
                .filter(a => cgActivityFilter === 'all' || categorize(a.description) === cgActivityFilter)
                .sort((a, b) => {
                  const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                  const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                  return dateB - dateA;
                });

              if (filtered.length === 0) {
                return <div className="px-5 py-6 text-center text-ios-footnote text-muted-foreground">No activity in this category</div>;
              }

              return filtered.map((item, idx) => {
                const cat = categorize(item.description);
                const iconMap: Record<string, { Icon: typeof Check; color: string }> = {
                  medication: { Icon: Pill, color: iosColors.orange },
                  meals: { Icon: Activity, color: iosColors.green },
                  exercise: { Icon: Footprints, color: iosColors.blue },
                  other: { Icon: Clock, color: iosColors.teal },
                };
                const ci = iconMap[cat] || iconMap.other;

                return (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-4" style={{ minHeight: 68 }}>
                    {item.completed ? (
                      <IconBox Icon={ci.Icon} color={iosColors.green} />
                    ) : (
                      <IconBox Icon={ci.Icon} color={ci.color} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-ios-callout font-medium text-foreground leading-snug">{item.description}</div>
                      <div className="text-ios-footnote text-muted-foreground mt-0.5">
                        {item.created_at
                          ? formatISTTime(item.created_at)
                          : item.time}
                      </div>
                    </div>
                    {item.completed ? (
                      <span className="text-ios-caption font-semibold text-success shrink-0">Done</span>
                    ) : (
                      <span className="text-ios-caption font-medium text-muted-foreground shrink-0">Pending</span>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Health Metrics — Apple Health grouped list */}
        <div className="mt-6">
          <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Health Snapshot</p>
          <div className="mx-4 ios-card overflow-hidden divide-y divide-border/30">
            {[
              { label: 'Sleep', value: `${sleepHours}h`, Icon: Moon, trend: 'up', color: iosColors.purple },
              { label: 'Steps', value: `${(stepCount / 1000).toFixed(1)}k`, Icon: Footprints, trend: 'down', color: iosColors.green },
              { label: 'Mood', value: currentMood.label, Icon: Heart, trend: 'stable', color: iosColors.red },
              { label: 'Medications', value: `${medicationAdherence}%`, Icon: Pill, trend: 'up', color: iosColors.orange },
            ].map(metric => {
              const Icon = metric.Icon;
              return (
                <div key={metric.label} className="flex items-center gap-3 px-4" style={{ minHeight: 60 }}>
                  <IconBox Icon={Icon} color={metric.color} />
                  <div className="flex-1">
                    <p className="text-ios-callout font-medium text-foreground">{metric.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-ios-headline text-foreground">{metric.value}</span>
                    {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
                    {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts — Categorized with Segmented Tabs */}
        <div className="mt-6 mb-6">
          <p className="text-ios-footnote font-medium text-muted-foreground uppercase tracking-wider mb-2 px-5">Alerts</p>
          <div className="mx-4 mb-2">
            <SegmentedControl
              value={cgAlertFilter}
              onChange={setCgAlertFilter}
              items={[
                { value: 'all', label: 'All' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'medication', label: 'Medication' },
                { value: 'system', label: 'System' },
              ]}
            />
          </div>
          <div className="mx-4 ios-card overflow-hidden divide-y divide-border/30">
            {(() => {
              type AlertItem = { id: string; category: string; severity: 'destructive' | 'warning'; title: string; detail: string; time: string };
              const allAlerts: AlertItem[] = [];

              // Overdue reminders → urgent
              overdueReminders.forEach(sr => {
                const rd = sr.reminders as any;
                allAlerts.push({
                  id: `overdue-${sr.id}`,
                  category: 'urgent',
                  severity: 'destructive',
                  title: 'Patient Not Responding',
                  detail: `${rd?.message || 'Reminder'} — No confirmation`,
                  time: sr.created_at ? formatISTTime(sr.created_at) : '',
                });
              });

              // SOS history → urgent
              sosHistory.filter(s => !s.resolved || sosHistory.indexOf(s) < 3).slice(0, 2).forEach(sos => {
                allAlerts.push({
                  id: `sos-${sos.id}`,
                  category: 'urgent',
                  severity: sos.resolved ? 'warning' : 'destructive',
                  title: sos.resolved ? `SOS resolved — ${sos.location}` : `SOS Active — ${sos.location}`,
                  detail: '',
                  time: sos.timestamp,
                });
              });

              // Missed medications from DB alerts
              missedDoseAlerts.forEach(alert => {
                allAlerts.push({
                  id: `missed-alert-${alert.id}`,
                  category: 'medication',
                  severity: 'destructive',
                  title: `Missed Dose: ${alert.medication_name}`,
                  detail: `${alert.patient_name} — Scheduled at ${alert.dose_time}`,
                  time: formatISTTime(alert.missed_at),
                });
              });

              // Missed medications from local state (30 min overdue)
              medications.filter(m => !m.taken).forEach(med => {
                const now = new Date();
                const medTimeParts = med.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
                let isOverdue = false;
                if (medTimeParts) {
                  let hours = parseInt(medTimeParts[1]);
                  const minutes = parseInt(medTimeParts[2]);
                  const period = medTimeParts[3]?.toUpperCase();
                  if (period === 'PM' && hours !== 12) hours += 12;
                  if (period === 'AM' && hours === 12) hours = 0;
                  const medDate = new Date();
                  medDate.setHours(hours, minutes, 0, 0);
                  isOverdue = (now.getTime() - medDate.getTime()) > 30 * 60 * 1000;
                }
                if (isOverdue) {
                  allAlerts.push({
                    id: `missed-${med.id}`,
                    category: 'medication',
                    severity: 'destructive',
                    title: `Missed: ${med.name} ${med.dosage}`,
                    detail: `Scheduled at ${med.time} — Not taken`,
                    time: '',
                  });
                }
              });

              // Static system alerts
              allAlerts.push(
                { id: 'sys-1', category: 'system', severity: 'warning', title: 'Medication taken late (15 min)', detail: '', time: '2 hours ago' },
                { id: 'sys-2', category: 'system', severity: 'warning', title: 'Mode switch suggested', detail: '', time: 'Yesterday' },
              );

              const filtered = allAlerts.filter(a => cgAlertFilter === 'all' || a.category === cgAlertFilter);

              if (filtered.length === 0) {
                return <div className="px-5 py-6 text-center text-ios-footnote text-muted-foreground">No alerts in this category</div>;
              }

              return filtered.map(alert => (
                <div key={alert.id} className="flex items-center gap-3 p-4">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${alert.severity === 'destructive' ? 'bg-destructive animate-pulse' : 'bg-warning'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-ios-callout font-medium ${alert.severity === 'destructive' ? 'text-destructive font-bold' : 'text-foreground'}`}>
                      {alert.title}
                    </div>
                    {alert.detail && <div className="text-ios-footnote text-foreground mt-0.5">{alert.detail}</div>}
                    {alert.time && <div className="text-ios-caption text-muted-foreground mt-0.5">{alert.time}</div>}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    );
  }

  // Vitals Tab - Crisis Prevention Engine + Patient Mode Switcher
  if (activeCaregiverTab === 'vitals') {
    
    const modeOptions = [
      { id: 'full' as const, label: 'Independent', desc: 'Full navigation & features' },
      { id: 'simplified' as const, label: 'Guided', desc: 'Simplified with key tabs' },
      { id: 'essential' as const, label: 'Assisted', desc: 'Single-screen essentials' },
    ];

    return (
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6">
        {/* iOS Large Title Header */}
        <div className="px-5 pt-4 pb-3">
          <h1 className="text-ios-large-title text-foreground">Vitals</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Health monitoring & mode</p>
        </div>

        {/* Patient View — iOS grouped list row */}
        <div className="px-4 mb-4">
          <button
            onClick={() => setModeModalOpen(true)}
            className="w-full ios-card flex items-center justify-between px-4 touch-target"
            style={{ minHeight: 52 }}
          >
            <div className="flex items-center gap-3">
              <IconBox Icon={Eye} color={iosColors.blue} size={36} iconSize={18} />
              <span className="text-ios-callout font-medium text-foreground">Patient View</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[13px] font-semibold ${
                mode === 'full' ? 'text-primary' : mode === 'simplified' ? 'text-warning' : 'text-destructive'
              }`}>
                {mode === 'full' ? 'Independent' : mode === 'simplified' ? 'Guided' : 'Assisted'}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
            </div>
          </button>
        </div>

        {/* Greeting + Crisis Forecast Card */}
        <div className="px-4 mb-5">
          <div className="ios-card p-4">
            <div className="flex items-start justify-between mb-1">
              <p className="text-[15px] font-semibold text-primary">Good Morning, Sarah</p>
              <span className="text-[11px] font-semibold text-primary flex items-center gap-1 bg-primary/8 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> AI Active
              </span>
            </div>
            <h2 className="text-[22px] font-bold text-foreground leading-tight">Crisis Forecast</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">48-hour predictive analysis</p>
          </div>
        </div>

        {/* Crisis Prevention Engine */}
        <CrisisPreventionEngine />

        {/* Mode Modal */}
        <AnimatePresence>
          {modeModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm"
              onClick={() => setModeModalOpen(false)}
            >
              <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="w-full bg-card rounded-t-3xl p-6 pb-8 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-5" />
                <h3 className="text-[18px] font-extrabold text-foreground mb-1">Patient View Mode</h3>
                <p className="text-[13px] text-muted-foreground mb-5">Choose the interface complexity for the patient.</p>
                <div className="space-y-2.5">
                  {modeOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { setMode(opt.id); setModeModalOpen(false); }}
                      className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                        mode === opt.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border/60 bg-card hover:border-primary/30'
                      }`}
                    >
                      <span className="text-[22px]">
                        <div className={`w-4 h-4 rounded-full ${mode === opt.id ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                      </span>
                      <div className="flex-1">
                        <p className={`text-[15px] font-bold ${mode === opt.id ? 'text-primary' : 'text-foreground'}`}>{opt.label}</p>
                        <p className="text-[12px] text-muted-foreground">{opt.desc}</p>
                      </div>
                      {mode === opt.id && <Check className="w-5 h-5 text-primary shrink-0" />}
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
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6 relative">
        {/* iOS Large Title Header */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-ios-large-title text-foreground">Tasks</h1>
              <p className="text-[15px] text-muted-foreground mt-1">{tasksDone.size}/{tasks.length} completed today</p>
            </div>
            <button
              onClick={() => setRemindersOpen(true)}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center touch-target"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="px-5 mt-3">
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            {['All', 'Today', 'This Week', 'Mine'].map((f, i) => (
              <button key={f} className={`flex-1 h-9 rounded-lg text-[12px] font-bold transition-all ${i === 0 ? 'bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'text-muted-foreground'}`}>
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
          <div className="ios-card overflow-hidden">
            <div className="flex items-center gap-3 px-4" style={{ minHeight: 56 }}>
              <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <div className="text-ios-callout font-medium text-foreground">Doctor Visit</div>
                <div className="text-ios-footnote text-muted-foreground">Tomorrow, 10:00 AM · Sarah</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30 shrink-0" />
            </div>
          </div>

          {/* Memory Manager Section */}
          <Separator className="my-6" />
          <CaregiverMemorySender />
        </div>

        {/* No FAB — iOS doesn't use floating action buttons */}

        <CaregiverManageSheet open={manageOpen} onClose={() => setManageOpen(false)} />

        {/* Reminders Panel Overlay */}
        <AnimatePresence>
          {remindersOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col bg-foreground/40 backdrop-blur-sm"
              onClick={() => setRemindersOpen(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="mt-12 flex-1 bg-background rounded-t-3xl overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                {/* Handle & Header */}
                <div className="pt-2 pb-1 flex flex-col items-center">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />
                </div>
                <div className="flex items-center justify-between px-5 pb-3">
                  <h2 className="text-[20px] font-bold text-foreground">Reminders</h2>
                  <button
                    onClick={() => setRemindersOpen(false)}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <CaregiverRemindersPanel />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Reports Tab — Behavioral Analytics Dashboard
  if (activeCaregiverTab === 'reports') {
    const weeklyActivity = [
      { day: 'Mon', steps: 3200, screenTime: 45, taskRate: 88, cogScore: 82 },
      { day: 'Tue', steps: 2800, screenTime: 52, taskRate: 75, cogScore: 79 },
      { day: 'Wed', steps: 1500, screenTime: 68, taskRate: 60, cogScore: 71 },
      { day: 'Thu', steps: 3400, screenTime: 38, taskRate: 92, cogScore: 85 },
      { day: 'Fri', steps: 2100, screenTime: 55, taskRate: 70, cogScore: 74 },
      { day: 'Sat', steps: 3800, screenTime: 30, taskRate: 95, cogScore: 88 },
      { day: 'Sun', steps: 2900, screenTime: 42, taskRate: 82, cogScore: 80 },
    ];

    const behaviorRadar = [
      { metric: 'Focus', patient: 65, baseline: 85 },
      { metric: 'Navigation', patient: 70, baseline: 90 },
      { metric: 'Response', patient: 55, baseline: 80 },
      { metric: 'Memory', patient: 45, baseline: 85 },
      { metric: 'Voice', patient: 72, baseline: 88 },
      { metric: 'Motor', patient: 68, baseline: 82 },
    ];

    const screenTimeBySection = [
      { name: 'Today', value: 35, color: 'hsl(var(--primary))' },
      { name: 'Memories', value: 25, color: 'hsl(var(--accent))' },
      { name: 'Safety', value: 15, color: 'hsl(var(--destructive))' },
      { name: 'Care', value: 15, color: 'hsl(var(--sage))' },
      { name: 'Wellbeing', value: 10, color: 'hsl(var(--lavender))' },
    ];

    const eyeTrackingData = [
      { time: '9AM', fixations: 12, saccades: 8, dwellTime: 2.1 },
      { time: '10AM', fixations: 18, saccades: 14, dwellTime: 1.8 },
      { time: '11AM', fixations: 8, saccades: 22, dwellTime: 3.2 },
      { time: '12PM', fixations: 15, saccades: 10, dwellTime: 2.0 },
      { time: '1PM', fixations: 6, saccades: 18, dwellTime: 4.1 },
      { time: '2PM', fixations: 20, saccades: 12, dwellTime: 1.5 },
      { time: '3PM', fixations: 10, saccades: 16, dwellTime: 2.8 },
    ];

    const voicePatterns = [
      { day: 'Mon', onTopic: 85, offTopic: 10, silences: 5 },
      { day: 'Tue', onTopic: 78, offTopic: 15, silences: 7 },
      { day: 'Wed', onTopic: 60, offTopic: 28, silences: 12 },
      { day: 'Thu', onTopic: 82, offTopic: 12, silences: 6 },
      { day: 'Fri', onTopic: 70, offTopic: 20, silences: 10 },
      { day: 'Sat', onTopic: 88, offTopic: 8, silences: 4 },
      { day: 'Sun', onTopic: 80, offTopic: 14, silences: 6 },
    ];

    const tabSwitching = [
      { day: 'Mon', switches: 8, avgDwell: 45 },
      { day: 'Tue', switches: 12, avgDwell: 32 },
      { day: 'Wed', switches: 22, avgDwell: 18 },
      { day: 'Thu', switches: 6, avgDwell: 55 },
      { day: 'Fri', switches: 15, avgDwell: 28 },
      { day: 'Sat', switches: 5, avgDwell: 60 },
      { day: 'Sun', switches: 9, avgDwell: 40 },
    ];

    const predictions = [
      { label: 'Cognitive Decline Risk', value: 'Moderate', color: 'text-warning', bg: 'bg-warning/10', detail: 'Based on 7-day pattern analysis' },
      { label: 'Mode Switch Likely', value: 'In ~2 weeks', color: 'text-accent', bg: 'bg-accent/10', detail: 'Task completion trending down 8%' },
      { label: 'Confusion Episodes', value: '↑ 15%', color: 'text-destructive', bg: 'bg-destructive/10', detail: 'Increased screen switching mid-task' },
      { label: 'Voice Engagement', value: 'Stable', color: 'text-success', bg: 'bg-success/10', detail: 'On-topic speech at 78% average' },
    ];

    const chartTooltipStyle = {
      contentStyle: { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '11px' },
      labelStyle: { color: 'hsl(var(--foreground))', fontWeight: 600 },
    };

    return (
      <div className="h-full overflow-y-auto ios-grouped-bg pb-6">
        {/* iOS Large Title Header */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <h1 className="text-ios-large-title text-foreground">Analytics</h1>
            <button className="flex items-center gap-1 text-[13px] text-primary font-semibold touch-target bg-primary/10 px-3 h-9 rounded-xl">
              <Share2 className="w-4 h-4" /> Export
            </button>
          </div>
          <p className="text-[15px] text-muted-foreground mt-1">AI-powered behavioral insights</p>
        </div>
        <div className="px-5 mt-3">
          <SegmentedControl
            value={reportRange}
            onChange={(v) => setReportRange(v as '7' | '30' | '90')}
            items={[
              { value: '7', label: '7 days' },
              { value: '30', label: '30 days' },
              { value: '90', label: '90 days' },
            ]}
          />
        </div>

        {/* Predictive Insights */}
        <div className="px-5 mt-2">
          <h2 className="text-ios-title3 text-foreground mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-accent" /> Predictive Insights
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {predictions.map(p => (
              <div key={p.label} className={`ios-card-elevated p-3.5`}>
                <div className={`text-[16px] font-bold ${p.color}`}>{p.value}</div>
                <div className="text-[12px] font-semibold text-foreground mt-1">{p.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{p.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cognitive & Activity Trends */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Activity & Cognitive Trends
          </h2>
          <div className="ios-card-elevated p-4">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="gradSteps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCog" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip {...chartTooltipStyle} />
                <Area type="monotone" dataKey="cogScore" name="Cognitive Score" stroke="hsl(var(--accent))" fill="url(#gradCog)" strokeWidth={2} />
                <Area type="monotone" dataKey="taskRate" name="Task Rate %" stroke="hsl(var(--primary))" fill="url(#gradSteps)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-primary" />Task Rate</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-accent" />Cognitive</span>
            </div>
          </div>
        </div>

        {/* Behavioral Radar */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3 flex items-center gap-2">
            <Scan className="w-4 h-4 text-lavender" /> Behavioral Profile
          </h2>
          <div className="ios-card-elevated p-4">
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={behaviorRadar}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Radar name="Baseline" dataKey="baseline" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.1} strokeDasharray="4 4" />
                <Radar name="Patient" dataKey="patient" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip {...chartTooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-1 justify-center">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-primary" />Patient</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-muted-foreground" />Baseline</span>
            </div>
          </div>
        </div>

        {/* Eye Tracking */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-sage" /> Eye Movement Analysis
          </h2>
          <div className="ios-card-elevated p-4">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={eyeTrackingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip {...chartTooltipStyle} />
                <Line type="monotone" dataKey="fixations" name="Fixations" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="saccades" name="Saccades" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="dwellTime" name="Dwell (s)" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-3 mt-2 justify-center flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-primary" />Fixations</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-warning" />Saccades</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-accent" />Dwell Time</span>
            </div>
            <div className="mt-3 p-2.5 rounded-xl bg-warning/8 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <span className="text-[11px] text-foreground">Increased dwell time at 1PM suggests confusion during medication reminder screen</span>
            </div>
          </div>
        </div>

        {/* Screen Switching / Tab Behavior */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-destructive" /> Screen Switching Patterns
          </h2>
          <div className="ios-card-elevated p-4">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={tabSwitching}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="switches" name="Tab Switches" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="p-2.5 rounded-xl bg-muted/50 text-center">
                <div className="text-[16px] font-bold text-foreground">11</div>
                <div className="text-[10px] text-muted-foreground">Avg switches/day</div>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/50 text-center">
                <div className="text-[16px] font-bold text-foreground">39s</div>
                <div className="text-[10px] text-muted-foreground">Avg dwell time</div>
              </div>
            </div>
            <div className="mt-3 p-2.5 rounded-xl bg-destructive/8 flex items-start gap-2">
              <MousePointer className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <span className="text-[11px] text-foreground">Wednesday spike (22 switches) correlates with low cognitive score — possible agitation</span>
            </div>
          </div>
        </div>

        {/* Screen Time Distribution */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3 flex items-center gap-2">
            <Timer className="w-4 h-4 text-primary" /> Screen Time Distribution
          </h2>
          <div className="ios-card-elevated p-4">
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={screenTimeBySection} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} dataKey="value">
                    {screenTimeBySection.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {screenTimeBySection.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[12px] text-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                      {s.name}
                    </span>
                    <span className="text-[12px] font-semibold text-foreground">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Voice Over Analysis */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3 flex items-center gap-2">
            <Mic className="w-4 h-4 text-secondary" /> Voice Interaction Analysis
          </h2>
          <div className="ios-card-elevated p-4">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={voicePatterns} stackOffset="expand" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="onTopic" name="On-Topic" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="offTopic" name="Off-Topic" stackId="a" fill="hsl(var(--warning))" />
                <Bar dataKey="silences" name="Long Silences" stackId="a" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-3 mt-2 justify-center flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-success" />On-Topic</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-warning" />Off-Topic</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-muted-foreground" />Silences</span>
            </div>
            <div className="mt-3 p-2.5 rounded-xl bg-accent/8 flex items-start gap-2">
              <Mic className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span className="text-[11px] text-foreground">Wednesday: 28% off-topic speech detected — patient discussed unrelated childhood memories during medication prompt</span>
            </div>
          </div>
        </div>

        {/* Incidents */}
        <div className="px-5 mt-5">
          <h2 className="text-ios-title3 text-foreground mb-3">Incidents</h2>
          <div className="ios-card-elevated divide-y divide-border/60">
            {[
              { text: 'Falls: 1 incident', detail: 'Feb 10 — Resolved', Icon: AlertTriangle },
              { text: 'Missed Medications: 2', detail: 'Last 30 days', Icon: Pill, color: iosColors.orange },
              { text: 'Confusion Episodes: 4', detail: 'Last 7 days — up from 2', Icon: Brain, color: iosColors.purple },
              { text: 'Alerts Triggered: 5', detail: 'Last 30 days', Icon: Bell, color: iosColors.red },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <IconBox Icon={item.Icon} color={item.color} />
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
                <IconBox Icon={opt.Icon} color={[iosColors.red, iosColors.blue, iosColors.green][['Email to family', 'Download PDF', 'Share with doctor'].indexOf(opt.label)] || iosColors.blue} />
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
    <div className="h-full overflow-y-auto ios-grouped-bg pb-6">
      {/* iOS Large Title Header */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-ios-large-title text-foreground">Settings</h1>
        <p className="text-[15px] text-muted-foreground mt-1">Manage preferences</p>
      </div>

      {/* Profile */}
      <div className="px-5 mt-1">
        <div className="ios-card-elevated p-4 flex items-center gap-3.5">
          <IconBox Icon={User} color={iosColors.blue} size={48} iconSize={24} />
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
            { name: 'Sarah Johnson', role: 'Primary', access: 'Full access', color: iosColors.blue },
            { name: 'John Johnson', role: 'Son', access: 'View only', color: iosColors.green },
            { name: 'Dr. Smith', role: 'Doctor', access: 'Health data', color: iosColors.purple },
          ].map(member => (
            <div key={member.name} className="flex items-center gap-3 p-4">
              <IconBox Icon={User} color={member.color} />
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

      {/* Native Feature Integrations */}
      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Device Integrations</h2>
        <PushNotificationSimulator />
      </div>

      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Background Services</h2>
        <BackgroundFetchSimulator />
      </div>

      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Voice Assistants</h2>
        <AlexaIntegrationSimulator />
      </div>

      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Persistent Alerts</h2>
        <PersistentNotificationSimulator />
      </div>

      {/* Patient Interface */}
      <div className="px-5 mt-5">
        <h2 className="text-ios-title3 text-foreground mb-3">Patient Interface</h2>
        <div className="ios-card-elevated divide-y divide-border/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <IconBox Icon={Eye} color={iosColors.blue} />
              <div>
                <div className="text-[14px] font-medium text-foreground">Current Mode</div>
                <div className="text-[12px] text-muted-foreground">{mode === 'full' ? 'Full' : mode === 'simplified' ? 'Simplified' : 'Essential'}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <IconBox Icon={Shield} color={iosColors.red} />
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
            <IconBox Icon={FileText} color={iosColors.teal} />
            <span className="text-[14px] font-medium text-foreground flex-1">Help & Support</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <button className="w-full ios-card mt-3 p-4 flex items-center gap-3 text-destructive touch-target">
          <IconBox Icon={LogOut} color="#FF3B30" />
          <span className="text-[14px] font-medium">Sign Out</span>
        </button>
        <div className="text-center mt-4 text-[11px] text-muted-foreground">MemoCare v1.0.0</div>
      </div>
    </div>
  );
}
