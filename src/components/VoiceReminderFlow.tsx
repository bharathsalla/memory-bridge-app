import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Check, ChevronRight, Clock, Phone, Eye, RotateCcw,
  AlertTriangle, TrendingUp, Pill, Sun, Volume2, X, Play, Pause,
  MessageCircle, BarChart3, Bell, Zap, Brain, ArrowRight, Send
} from 'lucide-react';

// ── Types ──
interface ExtractedSchedule {
  medication: string;
  time: string;
  frequency: string;
  trigger: string;
  confidence: number;
}

interface ReminderRecord {
  id: string;
  medication: string;
  time: string;
  frequency: string;
  status: 'confirmed' | 'missed' | 'pending' | 'snoozed';
  adherence: number;
  lastResponse: string;
  caregiverName: string;
}

interface EscalationEvent {
  id: string;
  medication: string;
  time: string;
  attempts: number;
  status: 'escalated' | 'resolved' | 'pending';
  timestamp: string;
}

// ── Simulated data generators ──
function generateRecords(): ReminderRecord[] {
  const meds = ['Blood Pressure Tablet', 'Metformin', 'Aspirin', 'Vitamin D', 'Calcium'];
  const times = ['8:00 AM', '9:00 AM', '12:00 PM', '2:00 PM', '8:00 PM'];
  const statuses: ReminderRecord['status'][] = ['confirmed', 'missed', 'pending', 'snoozed'];
  return meds.slice(0, 3 + Math.floor(Math.random() * 2)).map((med, i) => ({
    id: `rec-${i}`,
    medication: med,
    time: times[i % times.length],
    frequency: 'Daily',
    status: statuses[Math.floor(Math.random() * statuses.length)],
    adherence: 70 + Math.floor(Math.random() * 28),
    lastResponse: ['Took it on time', 'Snoozed 10 min', 'No response', 'Confirmed via voice'][Math.floor(Math.random() * 4)],
    caregiverName: 'Anitha',
  }));
}

function generateEscalations(): EscalationEvent[] {
  return [
    { id: 'e1', medication: 'Blood Pressure Tablet', time: '9:00 AM', attempts: 3, status: 'escalated', timestamp: '15 min ago' },
    { id: 'e2', medication: 'Metformin', time: '2:00 PM', attempts: 2, status: 'resolved', timestamp: 'Yesterday' },
    { id: 'e3', medication: 'Aspirin', time: '8:00 PM', attempts: 1, status: 'pending', timestamp: '2 days ago' },
  ];
}

// ── Recording animation ──
function RecordingWave({ isRecording }: { isRecording: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-destructive"
          animate={isRecording ? {
            height: [8, 16 + Math.random() * 28, 8],
          } : { height: 4 }}
          transition={isRecording ? {
            duration: 0.4 + Math.random() * 0.3,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.03,
          } : {}}
        />
      ))}
    </div>
  );
}

// ── Main component ──
export default function VoiceReminderFlow() {
  const [activeView, setActiveView] = useState<'record' | 'monitor' | 'escalation'>('record');
  const [recordingStep, setRecordingStep] = useState<'idle' | 'recording' | 'processing' | 'extracted' | 'confirmed'>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [extracted, setExtracted] = useState<ExtractedSchedule | null>(null);
  const [records] = useState<ReminderRecord[]>(() => generateRecords());
  const [escalations] = useState<EscalationEvent[]>(() => generateEscalations());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingStep('recording');
    setElapsed(0);
    setTranscript('');
    setExtracted(null);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingStep('processing');
    // Simulate AI processing
    setTimeout(() => {
      setTranscript("Dad, please take your blood pressure tablet every day at 9 AM after breakfast.");
      setExtracted({
        medication: 'Blood Pressure Tablet',
        time: '9:00 AM',
        frequency: 'Daily',
        trigger: 'After Breakfast',
        confidence: 96,
      });
      setRecordingStep('extracted');
    }, 2200);
  };

  const confirmSchedule = () => {
    setRecordingStep('confirmed');
    setTimeout(() => {
      setRecordingStep('idle');
      setActiveView('monitor');
    }, 2000);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const statusColor = (s: string) => {
    if (s === 'confirmed' || s === 'resolved') return 'bg-success/12 text-success';
    if (s === 'missed' || s === 'escalated') return 'bg-destructive/12 text-destructive';
    if (s === 'snoozed') return 'bg-warning/12 text-warning';
    return 'bg-muted text-muted-foreground';
  };

  const statusIcon = (s: string) => {
    if (s === 'confirmed' || s === 'resolved') return '✅';
    if (s === 'missed' || s === 'escalated') return '⚠️';
    if (s === 'snoozed') return '⏰';
    return '⏳';
  };

  const overallAdherence = records.length > 0
    ? Math.round(records.reduce((a, r) => a + r.adherence, 0) / records.length)
    : 0;
  const missedCount = records.filter(r => r.status === 'missed').length;
  const confusionCount = Math.floor(Math.random() * 3) + 1;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tab Navigation */}
      <div className="px-3 pt-3 pb-1.5 shrink-0">
        <div className="flex bg-muted/60 rounded-2xl p-1 gap-0.5">
          {[
            { id: 'record' as const, label: 'Record', icon: Mic },
            { id: 'monitor' as const, label: 'Monitor', icon: BarChart3 },
            { id: 'escalation' as const, label: 'Alerts', icon: AlertTriangle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
                activeView === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground'
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
        <AnimatePresence mode="wait">
          {/* ═══════════ RECORD VIEW ═══════════ */}
          {activeView === 'record' && (
            <motion.div
              key="record"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4 pt-2"
            >
              {/* Greeting */}
              <div className="mb-4">
                <h2 className="text-[20px] font-extrabold text-foreground">
                  Good Evening, Anitha 👋
                </h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Your father has {records.length} reminders today.
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <button
                  onClick={() => setRecordingStep('idle')}
                  className="ios-card-elevated p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground">Record</span>
                </button>
                <button
                  onClick={() => setActiveView('monitor')}
                  className="ios-card-elevated p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground">Schedule</span>
                </button>
                <button
                  onClick={() => setActiveView('monitor')}
                  className="ios-card-elevated p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-success" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground">Activity</span>
                </button>
              </div>

              {/* Recording Card */}
              <div className="ios-card-elevated overflow-hidden">
                {/* IDLE state */}
                {recordingStep === 'idle' && (
                  <div className="p-6 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4 relative">
                      <div className="absolute inset-0 rounded-full bg-destructive/5 animate-ping" />
                      <Mic className="w-9 h-9 text-destructive relative z-10" />
                    </div>
                    <h3 className="text-[17px] font-extrabold text-foreground mb-1">Record a Reminder</h3>
                    <p className="text-[13px] text-muted-foreground text-center mb-5 leading-relaxed max-w-[260px]">
                      Speak naturally. AI will extract medication, time, and frequency automatically.
                    </p>
                    <button
                      onClick={startRecording}
                      className="w-full py-3.5 rounded-2xl bg-destructive text-destructive-foreground font-extrabold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg"
                    >
                      <Mic className="w-5 h-5" />
                      Start Recording
                    </button>
                  </div>
                )}

                {/* RECORDING state */}
                {recordingStep === 'recording' && (
                  <div className="p-6 flex flex-col items-center">
                    <div className="text-[13px] font-bold text-destructive mb-3 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                      Recording · {formatTime(elapsed)}
                    </div>
                    <RecordingWave isRecording={isRecording} />
                    <p className="text-[14px] text-muted-foreground mt-4 mb-5 text-center italic">
                      "Speak your reminder now..."
                    </p>
                    <button
                      onClick={stopRecording}
                      className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center active:scale-90 transition-transform shadow-lg"
                    >
                      <MicOff className="w-7 h-7" />
                    </button>
                    <span className="text-[11px] text-muted-foreground mt-2">Tap to stop</span>
                  </div>
                )}

                {/* PROCESSING state */}
                {recordingStep === 'processing' && (
                  <div className="p-8 flex flex-col items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="w-14 h-14 rounded-full border-3 border-primary border-t-transparent mb-4"
                    />
                    <h3 className="text-[16px] font-extrabold text-foreground mb-1">AI Processing...</h3>
                    <p className="text-[13px] text-muted-foreground text-center">Extracting schedule from your voice</p>
                  </div>
                )}

                {/* EXTRACTED state */}
                {recordingStep === 'extracted' && extracted && (
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-primary" />
                      <h3 className="text-[16px] font-extrabold text-foreground">AI Extracted</h3>
                      <span className="ml-auto px-2.5 py-0.5 rounded-full bg-success/12 text-success text-[11px] font-bold">
                        {extracted.confidence}% match
                      </span>
                    </div>

                    {/* Transcript */}
                    <div className="bg-muted/50 rounded-xl p-3 mb-4">
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Your Recording</div>
                      <p className="text-[14px] text-foreground italic leading-relaxed">"{transcript}"</p>
                    </div>

                    {/* Extracted fields */}
                    <div className="space-y-2.5 mb-5">
                      {[
                        { icon: '💊', label: 'Medication', value: extracted.medication, color: 'bg-primary/8 text-primary' },
                        { icon: '🕘', label: 'Time', value: extracted.time, color: 'bg-accent/8 text-accent' },
                        { icon: '🔄', label: 'Frequency', value: extracted.frequency, color: 'bg-lavender/8 text-lavender' },
                        { icon: '🍳', label: 'Trigger', value: extracted.trigger, color: 'bg-warning/8 text-warning' },
                      ].map(field => (
                        <div key={field.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                          <span className="text-[18px]">{field.icon}</span>
                          <div className="flex-1">
                            <div className="text-[11px] font-bold text-muted-foreground">{field.label}</div>
                            <div className="text-[14px] font-bold text-foreground">{field.value}</div>
                          </div>
                          <Check className="w-4 h-4 text-success" />
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        onClick={() => setRecordingStep('idle')}
                        className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-bold text-[14px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                      >
                        <RotateCcw className="w-4 h-4" /> Re-record
                      </button>
                      <button
                        onClick={confirmSchedule}
                        className="flex-[1.5] py-3 rounded-xl bg-success text-success-foreground font-extrabold text-[14px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-md"
                      >
                        <Check className="w-4 h-4" /> Confirm & Schedule
                      </button>
                    </div>
                  </div>
                )}

                {/* CONFIRMED state */}
                {recordingStep === 'confirmed' && (
                  <div className="p-8 flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mb-4"
                    >
                      <Check className="w-10 h-10 text-success" />
                    </motion.div>
                    <h3 className="text-[18px] font-extrabold text-foreground mb-1">Scheduled! ✨</h3>
                    <p className="text-[13px] text-muted-foreground text-center">
                      Will repeat daily at 9:00 AM
                    </p>
                    <p className="text-[12px] text-primary font-bold mt-2">
                      Voice: Anitha (Cloned)
                    </p>
                  </div>
                )}
              </div>

              {/* How it works */}
              {recordingStep === 'idle' && (
                <div className="mt-5">
                  <h3 className="text-[14px] font-extrabold text-foreground mb-3">How It Works</h3>
                  <div className="space-y-2">
                    {[
                      { step: '1', icon: '🎙', title: 'You Record', desc: 'Speak the reminder naturally' },
                      { step: '2', icon: '🤖', title: 'AI Extracts', desc: 'Schedule auto-detected' },
                      { step: '3', icon: '🔔', title: 'Patient Hears', desc: 'Your cloned voice plays' },
                      { step: '4', icon: '📊', title: 'You Monitor', desc: 'Track adherence in real-time' },
                      { step: '5', icon: '⚠', title: 'Escalation', desc: 'Get alerted if ignored' },
                    ].map((s, i) => (
                      <motion.div
                        key={s.step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30"
                      >
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-[16px] shrink-0">
                          {s.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] font-bold text-foreground">{s.title}</span>
                          <span className="text-[11px] text-muted-foreground ml-1.5">{s.desc}</span>
                        </div>
                        {i < 4 && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════ MONITOR VIEW ═══════════ */}
          {activeView === 'monitor' && (
            <motion.div
              key="monitor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4 pt-2"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="ios-card-elevated p-3 text-center">
                  <div className="text-[22px] font-extrabold text-success">{overallAdherence}%</div>
                  <div className="text-[10px] font-bold text-muted-foreground mt-0.5">Adherence</div>
                </div>
                <div className="ios-card-elevated p-3 text-center">
                  <div className="text-[22px] font-extrabold text-destructive">{missedCount}</div>
                  <div className="text-[10px] font-bold text-muted-foreground mt-0.5">Missed</div>
                </div>
                <div className="ios-card-elevated p-3 text-center">
                  <div className="text-[22px] font-extrabold text-warning">{confusionCount}</div>
                  <div className="text-[10px] font-bold text-muted-foreground mt-0.5">Confusion</div>
                </div>
              </div>

              {/* AI Insight */}
              <div className="ios-card-elevated p-3.5 mb-4 border-l-4 border-primary">
                <div className="flex items-start gap-2.5">
                  <Brain className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[12px] font-extrabold text-primary mb-0.5">AI Insight</div>
                    <p className="text-[13px] text-foreground leading-relaxed">
                      "He responds faster when reminder uses slower speech tone. Morning reminders have 94% success rate."
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Experience Preview */}
              <h3 className="text-[15px] font-extrabold text-foreground mb-2.5 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary" /> Patient Experience
              </h3>
              <div className="ios-card-elevated overflow-hidden mb-5">
                <div className="bg-gradient-to-br from-primary/8 to-accent/5 p-5">
                  <div className="text-center">
                    <p className="text-[20px] font-extrabold text-foreground mb-1">Good Morning Raghavan ☀</p>
                    <p className="text-[15px] text-muted-foreground font-bold">🕘 It is 9:00 AM</p>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10">
                    <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                    <span className="text-[14px] font-bold text-primary">Playing message from Anitha...</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button className="py-3.5 rounded-xl bg-success text-success-foreground font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-sm">
                      <Check className="w-5 h-5" /> I Took It
                    </button>
                    <button className="py-3.5 rounded-xl bg-warning text-warning-foreground font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-sm">
                      <Clock className="w-5 h-5" /> 10 Min
                    </button>
                  </div>
                </div>
              </div>

              {/* Reminder Records */}
              <h3 className="text-[15px] font-extrabold text-foreground mb-2.5">
                📋 Active Reminders
              </h3>
              <div className="space-y-2">
                {records.map((rec, i) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="ios-card-elevated p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                        <Pill className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-bold text-foreground">{rec.medication}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {rec.time} · {rec.frequency} · by {rec.caregiverName}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusColor(rec.status)}`}>
                        {statusIcon(rec.status)} {rec.status}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-success transition-all"
                          style={{ width: `${rec.adherence}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground">{rec.adherence}%</span>
                    </div>
                    <div className="mt-1.5 text-[11px] text-muted-foreground italic">
                      Last: {rec.lastResponse}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══════════ ESCALATION VIEW ═══════════ */}
          {activeView === 'escalation' && (
            <motion.div
              key="escalation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4 pt-2"
            >
              <h2 className="text-[18px] font-extrabold text-foreground mb-1">
                ⚠ Escalation Center
              </h2>
              <p className="text-[12px] text-muted-foreground mb-4">
                Alerts when patient doesn't respond to reminders
              </p>

              {/* Escalation Flow Visual */}
              <div className="ios-card-elevated p-4 mb-4">
                <div className="text-[12px] font-extrabold text-foreground mb-3">Escalation Flow</div>
                <div className="flex items-center gap-1.5">
                  {[
                    { label: 'Reminder Sent', color: 'bg-primary', icon: '🔔' },
                    { label: '15 min wait', color: 'bg-warning', icon: '⏱' },
                    { label: 'Softer Replay', color: 'bg-accent', icon: '🔁' },
                    { label: 'Alert Caregiver', color: 'bg-destructive', icon: '📱' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-lg ${step.color}/15 flex items-center justify-center text-[14px]`}>
                          {step.icon}
                        </div>
                        <span className="text-[8px] font-bold text-muted-foreground mt-1 text-center leading-tight w-14">
                          {step.label}
                        </span>
                      </div>
                      {i < 3 && <ArrowRight className="w-3 h-3 text-muted-foreground/40 mb-3" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Escalation Alert */}
              {escalations.filter(e => e.status === 'escalated').map(esc => (
                <motion.div
                  key={esc.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ios-card-elevated border-2 border-destructive/30 p-4 mb-3"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-extrabold text-destructive">
                        ⚠ Dad did not confirm his {esc.time} medication
                      </div>
                      <div className="text-[12px] text-muted-foreground mt-0.5">
                        {esc.medication} · {esc.attempts} attempts · {esc.timestamp}
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] text-foreground mb-3 leading-relaxed">
                    Would you like to call him?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="py-2.5 rounded-xl bg-success text-success-foreground font-bold text-[12px] flex items-center justify-center gap-1 active:scale-95 transition-transform">
                      <Phone className="w-3.5 h-3.5" /> Call
                    </button>
                    <button className="py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-[12px] flex items-center justify-center gap-1 active:scale-95 transition-transform">
                      <RotateCcw className="w-3.5 h-3.5" /> Replay
                    </button>
                    <button className="py-2.5 rounded-xl bg-muted text-muted-foreground font-bold text-[12px] flex items-center justify-center gap-1 active:scale-95 transition-transform">
                      <Eye className="w-3.5 h-3.5" /> Ignore
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* All Escalation Events */}
              <h3 className="text-[14px] font-extrabold text-foreground mb-2.5 mt-4">History</h3>
              <div className="space-y-2">
                {escalations.map((esc, i) => (
                  <motion.div
                    key={esc.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="ios-card-elevated flex items-center gap-3 p-3.5"
                  >
                    <span className="text-[18px]">{statusIcon(esc.status)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-foreground">{esc.medication}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {esc.time} · {esc.attempts} attempt{esc.attempts > 1 ? 's' : ''} · {esc.timestamp}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusColor(esc.status)}`}>
                      {esc.status}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Tip */}
              <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-[12px] text-foreground leading-relaxed">
                    <span className="font-bold">Pro tip:</span> AI automatically adjusts phrasing and tone on replays to increase response rates.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
