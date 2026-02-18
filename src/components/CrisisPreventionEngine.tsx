import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Activity, Heart, Moon, Thermometer,
  MapPin, Cloud, Pill, Brain, TrendingUp, ChevronRight, ChevronDown,
  Check, Phone, Clock, Zap, Eye, Wind, Footprints, MessageCircle,
  Smartphone, Watch, Radio, BarChart3, Target, ArrowUp, ArrowDown,
  CheckCircle2, Circle, X, Send, Bot
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

type CrisisTab = 'forecast' | 'plan' | 'coach';

interface RiskAlert {
  id: string;
  type: 'agitation' | 'wandering' | 'confusion' | 'fall';
  level: 'high' | 'moderate' | 'low';
  probability: number;
  timeWindow: string;
  factors: { label: string; icon: React.ReactNode; detail: string; severity: 'bad' | 'warning' | 'ok' }[];
}

interface ActionItem {
  id: string;
  priority: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  done: boolean;
  actions?: { label: string; type: 'call' | 'reminder' | 'done' }[];
}

const riskAlerts: RiskAlert[] = [
  {
    id: '1',
    type: 'agitation',
    level: 'high',
    probability: 87,
    timeWindow: 'Tomorrow 4-7 PM',
    factors: [
      { label: 'Sleep Quality: Poor', icon: <Moon className="w-4 h-4" />, detail: '4 wake-ups (baseline: 1-2)', severity: 'bad' },
      { label: 'Stress Signals: High', icon: <Heart className="w-4 h-4" />, detail: 'HRV 35ms (baseline: 55ms)', severity: 'bad' },
      { label: 'Weather: Pressure Drop', icon: <Cloud className="w-4 h-4" />, detail: 'Dropped 8mb in 12 hours', severity: 'warning' },
      { label: 'Resting HR: Elevated', icon: <Activity className="w-4 h-4" />, detail: '78 bpm (baseline: 68 bpm)', severity: 'bad' },
    ],
  },
  {
    id: '2',
    type: 'wandering',
    level: 'moderate',
    probability: 64,
    timeWindow: 'Tomorrow 10 PM - 2 AM',
    factors: [
      { label: 'Sleep Pattern: Irregular', icon: <Moon className="w-4 h-4" />, detail: 'Only 20% deep sleep (usual: 35%)', severity: 'warning' },
      { label: 'GPS: Restless Movement', icon: <MapPin className="w-4 h-4" />, detail: '3 pacing episodes today', severity: 'warning' },
    ],
  },
];

const actionPlan: ActionItem[] = [
  {
    id: '1', priority: 1, title: 'Call Doctor', description: 'Review 2 PM medication timing with Dr. Martinez',
    icon: <Phone className="w-5 h-5" />, done: true,
    actions: [{ label: 'Call Now', type: 'call' }, { label: 'Mark Done', type: 'done' }],
  },
  {
    id: '2', priority: 2, title: 'Cancel 5 PM Group Visit', description: 'Too many visitors increases agitation risk',
    icon: <X className="w-5 h-5" />, done: true,
  },
  {
    id: '3', priority: 2, title: 'Dim Lights at 3:30 PM', description: 'Reduce sensory stimulation before high-risk window',
    icon: <Eye className="w-5 h-5" />, done: false,
    actions: [{ label: 'Set Reminder', type: 'reminder' }, { label: 'Mark Done', type: 'done' }],
  },
  {
    id: '4', priority: 2, title: 'Play Jazz Playlist at 4 PM', description: 'Robert responds well to familiar jazz music',
    icon: <Radio className="w-5 h-5" />, done: false,
    actions: [{ label: 'Set Reminder', type: 'reminder' }, { label: 'Mark Done', type: 'done' }],
  },
  {
    id: '5', priority: 2, title: 'Sarah Stay Home 4-7 PM', description: 'Familiar presence reduces crisis severity by 60%',
    icon: <Heart className="w-5 h-5" />, done: false,
    actions: [{ label: 'Add to Calendar', type: 'reminder' }, { label: 'Mark Done', type: 'done' }],
  },
  {
    id: '6', priority: 3, title: 'Charge GPS Tracker', description: 'Current battery: 67% — needs 100% for overnight',
    icon: <MapPin className="w-5 h-5" />, done: false,
    actions: [{ label: 'Remind Me', type: 'reminder' }],
  },
  {
    id: '7', priority: 3, title: 'Notify Backup Caregiver', description: 'Send message to John about tomorrow risk',
    icon: <MessageCircle className="w-5 h-5" />, done: false,
    actions: [{ label: 'Send Message', type: 'call' }, { label: 'Mark Done', type: 'done' }],
  },
];

const coachMessages = [
  { id: '1', sender: 'user', text: "The app says high risk tomorrow. What if I can't cancel the group visit? Robert looks forward to it." },
  { id: '2', sender: 'coach', text: "I understand — social connection is important for Robert. Here are 3 options:\n\n1. **Keep visit BUT limit to 2 people** max, shorten to 30 minutes\n\n2. **Move visit to morning (10-11 AM)** when agitation risk is lowest\n\n3. **Switch to video call** instead — less overwhelming, easier to end\n\nWhich feels doable for you?" },
  { id: '3', sender: 'user', text: "Option 2 sounds good. Can we move it to 10 AM?" },
  { id: '4', sender: 'coach', text: "Great choice! Morning visits work best for Robert. I'll:\n\n✅ Update the action plan\n✅ Send a reminder at 9:30 AM\n✅ Suggest ending by 11 AM before energy dips\n\nYou're doing amazing, Sarah. 3 crises prevented this month! 💪" },
];

const levelColors = {
  high: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20', dot: 'bg-destructive' },
  moderate: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  low: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20', dot: 'bg-success' },
};

const typeEmoji: Record<string, string> = {
  agitation: '😤', wandering: '🚶', confusion: '😵', fall: '⚠️',
};

const severityColor = {
  bad: 'text-destructive',
  warning: 'text-amber-600',
  ok: 'text-success',
};

export default function CrisisPreventionEngine() {
  const [activeTab, setActiveTab] = useState<CrisisTab>('forecast');
  const [expandedAlert, setExpandedAlert] = useState<string | null>('1');
  const [tasks, setTasks] = useState(actionPlan);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(coachMessages);

  const completedCount = tasks.filter(t => t.done).length;
  const progressPct = Math.round((completedCount / tasks.length) * 100);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const sendCoachMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: chatInput }]);
    setChatInput('');
    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'coach',
        text: "That's a thoughtful question. Based on Robert's patterns, I'd recommend keeping the routine as consistent as possible. Small changes compound — even moving lunch 30 minutes earlier can help. You're handling this beautifully. 💙"
      }]);
    }, 1500);
  };

  const groupedByPriority = [1, 2, 3].map(p => ({
    priority: p,
    label: p === 1 ? '🔥 Priority 1: Medical' : p === 2 ? '🏠 Priority 2: Environment' : '🚨 Priority 3: Safety',
    items: tasks.filter(t => t.priority === p),
  }));

  return (
    <div className="h-full flex flex-col">
      {/* Status Bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h2 className="text-[16px] font-bold text-foreground">Crisis Prevention</h2>
            <p className="text-[12px] text-muted-foreground font-medium">AI monitoring · Updated 8 min ago</p>
          </div>
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[11px] font-bold px-2 py-0.5">
            2 Alerts
          </Badge>
        </div>

        {/* Device Status */}
        <div className="flex gap-2 mb-3">
          {[
            { icon: <Watch className="w-3 h-3" />, label: 'Apple Watch', status: 'Connected', ok: true },
            { icon: <MapPin className="w-3 h-3" />, label: 'GPS', status: 'Active', ok: true },
            { icon: <Cloud className="w-3 h-3" />, label: 'Weather', status: 'Synced', ok: true },
          ].map(d => (
            <div key={d.label} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 text-[10px] font-semibold text-muted-foreground">
              {d.icon}
              <span>{d.label}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${d.ok ? 'bg-success' : 'bg-destructive'}`} />
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex bg-muted/50 rounded-xl p-1">
          {[
            { id: 'forecast' as const, label: 'Forecast', icon: BarChart3 },
            { id: 'plan' as const, label: 'Action Plan', icon: Target },
            { id: 'coach' as const, label: 'AI Coach', icon: Bot },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[12px] font-semibold transition-all ${
                activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* FORECAST TAB */}
        {activeTab === 'forecast' && (
          <div className="px-4 space-y-3">
            {/* Morning Greeting */}
            <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10 shadow-none">
              <CardContent className="p-4">
                <p className="text-[13px] font-semibold text-primary mb-1">🌅 Good Morning, Sarah</p>
                <p className="text-[18px] font-bold text-foreground leading-tight">Robert's Crisis Forecast</p>
                <p className="text-[12px] text-muted-foreground mt-1 font-medium">Based on 48-hour data analysis</p>
              </CardContent>
            </Card>

            {/* Risk Alerts */}
            {riskAlerts.map((alert) => {
              const colors = levelColors[alert.level];
              const isExpanded = expandedAlert === alert.id;
              return (
                <motion.div key={alert.id} layout>
                  <Card className={`border ${colors.border} ${colors.bg} shadow-sm`}>
                    <CardContent className="p-0">
                      <button
                        onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                        className="w-full p-4 flex items-center gap-3 text-left"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[28px]">{typeEmoji[alert.type]}</span>
                          <div className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge className={`${colors.bg} ${colors.text} border ${colors.border} text-[10px] font-bold uppercase px-1.5 py-0`}>
                              {alert.level} risk
                            </Badge>
                          </div>
                          <p className="text-[16px] font-bold text-foreground capitalize">{alert.type} Risk</p>
                          <p className="text-[13px] text-muted-foreground font-medium">{alert.timeWindow} · {alert.probability}% likely</p>
                        </div>
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                              <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4" className="stroke-muted/30" />
                              <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4"
                                strokeDasharray={`${alert.probability * 1.256} 125.6`}
                                className={alert.level === 'high' ? 'stroke-destructive' : 'stroke-amber-500'}
                                strokeLinecap="round" />
                            </svg>
                            <span className={`absolute inset-0 flex items-center justify-center text-[12px] font-bold ${colors.text}`}>
                              {alert.probability}%
                            </span>
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <Separator />
                            <div className="p-4 space-y-2.5">
                              <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide">Why This Alert</p>
                              {alert.factors.map((f, i) => (
                                <div key={i} className="flex items-start gap-3">
                                  <div className={`mt-0.5 ${severityColor[f.severity]}`}>{f.icon}</div>
                                  <div>
                                    <p className={`text-[13px] font-semibold ${severityColor[f.severity]}`}>{f.label}</p>
                                    <p className="text-[12px] text-muted-foreground">{f.detail}</p>
                                  </div>
                                </div>
                              ))}
                              <Button size="sm" className="w-full h-9 rounded-lg text-[13px] font-semibold mt-2 gap-1.5">
                                <Target className="w-3.5 h-3.5" />
                                View Prevention Plan
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Pattern Match */}
            <Card className="border border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-primary" />
                  <p className="text-[13px] font-bold text-foreground">Pattern Match</p>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  This sleep pattern preceded <span className="font-bold text-foreground">8 of Robert's last 10</span> agitation episodes. The AI model has <span className="font-bold text-primary">92% confidence</span> in this prediction.
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-[11px] font-semibold text-muted-foreground">30-day baseline</Badge>
                  <Badge variant="outline" className="text-[11px] font-semibold text-muted-foreground">LightGBM v2.1</Badge>
                  <Badge variant="outline" className="text-[11px] font-semibold text-muted-foreground">Last trained: 2d ago</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Vitals */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Heart Rate', value: '78', unit: 'bpm', icon: <Heart className="w-4 h-4" />, trend: 'up', color: 'text-destructive' },
                { label: 'HRV', value: '35', unit: 'ms', icon: <Activity className="w-4 h-4" />, trend: 'down', color: 'text-destructive' },
                { label: 'Sleep Score', value: '42', unit: '/100', icon: <Moon className="w-4 h-4" />, trend: 'down', color: 'text-amber-600' },
                { label: 'Steps Today', value: '1,240', unit: '', icon: <Footprints className="w-4 h-4" />, trend: 'down', color: 'text-muted-foreground' },
              ].map(v => (
                <Card key={v.label} className="border border-border shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-muted-foreground">{v.icon}</span>
                      {v.trend === 'up' ? <ArrowUp className={`w-3 h-3 ${v.color}`} /> : <ArrowDown className={`w-3 h-3 ${v.color}`} />}
                    </div>
                    <p className="text-[20px] font-bold text-foreground leading-none">{v.value}<span className="text-[12px] text-muted-foreground ml-0.5">{v.unit}</span></p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-1">{v.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ACTION PLAN TAB */}
        {activeTab === 'plan' && (
          <div className="px-4 space-y-4">
            {/* Progress */}
            <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10 shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[15px] font-bold text-foreground">Your Prevention Plan</p>
                  <span className="text-[13px] font-bold text-primary">{completedCount}/{tasks.length} done</span>
                </div>
                <Progress value={progressPct} className="h-2.5 rounded-full" />
                <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">{progressPct}% complete — keep going!</p>
              </CardContent>
            </Card>

            {/* Grouped Tasks */}
            {groupedByPriority.map(group => (
              <div key={group.priority}>
                <p className="text-[14px] font-bold text-foreground mb-2.5">{group.label}</p>
                <div className="space-y-2">
                  {group.items.map((task, i) => (
                    <motion.div key={task.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <Card className={`border shadow-sm transition-all ${task.done ? 'border-success/20 bg-success/5' : 'border-border'}`}>
                        <CardContent className="p-3.5">
                          <div className="flex items-start gap-3">
                            <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0">
                              {task.done ? (
                                <CheckCircle2 className="w-5.5 h-5.5 text-success" />
                              ) : (
                                <Circle className="w-5.5 h-5.5 text-border" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[14px] font-bold leading-tight ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {task.title}
                              </p>
                              <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{task.description}</p>
                              {!task.done && task.actions && (
                                <div className="flex gap-2 mt-2">
                                  {task.actions.map(a => (
                                    <Button
                                      key={a.label}
                                      size="sm"
                                      variant={a.type === 'done' ? 'default' : 'outline'}
                                      className="h-7 rounded-md text-[11px] font-semibold px-2.5"
                                      onClick={(e) => { e.stopPropagation(); if (a.type === 'done') toggleTask(task.id); }}
                                    >
                                      {a.label}
                                    </Button>
                                  ))}
                                </div>
                              )}
                              {task.done && (
                                <p className="text-[11px] text-success font-semibold mt-1">✓ Completed</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI COACH TAB */}
        {activeTab === 'coach' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-3">
              {/* Coach intro */}
              <div className="flex items-center gap-2 px-2 py-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-foreground">Crisis Coach</p>
                  <p className="text-[11px] text-muted-foreground">AI-powered dementia care assistant</p>
                </div>
              </div>

              {chatMessages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'coach' && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-auto mb-1">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[82%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                      : 'bg-card border border-border rounded-2xl rounded-bl-md'
                  }`}>
                    {msg.text.split('\n').map((line, li) => (
                      <p key={li} className={li > 0 ? 'mt-1.5' : ''}>
                        {line.split(/(\*\*[^*]+\*\*)/).map((part, pi) =>
                          part.startsWith('**') && part.endsWith('**')
                            ? <strong key={pi} className="font-bold">{part.slice(2, -2)}</strong>
                            : part
                        )}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Coach input */}
            <div className="px-3 pb-3 pt-2 border-t border-border/30 bg-background/80 backdrop-blur-sm">
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendCoachMessage()}
                  placeholder="Ask your crisis coach..."
                  className="h-10 rounded-full text-[13px] border-border bg-muted/30 pl-4"
                />
                <Button size="icon" onClick={sendCoachMessage} className="w-10 h-10 rounded-full shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
