import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Check, Clock, Phone, Eye, RotateCcw,
  AlertTriangle, Pill, Volume2, X,
  BarChart3, Bell, Zap, Brain, ArrowRight
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// ── Types ──
interface ExtractedSchedule {
  medication: string;
  time: string;
  frequency: string;
  trigger: string;
  patientMessage: string;
  confidence: number;
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
  const { voiceReminders, addVoiceReminder } = useApp();
  const [activeView, setActiveView] = useState<'record' | 'monitor' | 'escalation'>('record');
  const [recordingStep, setRecordingStep] = useState<'idle' | 'recording' | 'processing' | 'extracted' | 'confirmed'>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [extracted, setExtracted] = useState<ExtractedSchedule | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  // Reactivate snoozed reminders
  useEffect(() => {
    const interval = setInterval(() => {
      // This is handled in AppContext via the snooze timer
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const startRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: 'Speech not supported', description: 'Use Chrome or Safari for voice recording.', variant: 'destructive' });
      return;
    }

    // Start MediaRecorder for actual audio capture
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (err) {
      toast({ title: 'Microphone access denied', description: 'Please allow microphone access.', variant: 'destructive' });
      return;
    }

    // Start SpeechRecognition for transcript
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + ' ';
        } else {
          interim += t;
        }
      }
      setLiveTranscript(finalTranscript + interim);
      setTranscript(finalTranscript.trim());
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        toast({ title: 'Recording error', description: event.error, variant: 'destructive' });
      }
    };

    recognition.onend = () => {};

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setRecordingStep('recording');
    setElapsed(0);
    setTranscript('');
    setLiveTranscript('');
    setExtracted(null);
    setAudioUrl(null);
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);

    const finalText = transcript || liveTranscript;
    if (!finalText.trim()) {
      toast({ title: 'No speech detected', description: 'Please try recording again.', variant: 'destructive' });
      setRecordingStep('idle');
      return;
    }

    setTranscript(finalText.trim());
    setRecordingStep('processing');
    setAiLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('extract-voice-reminder', {
        body: { transcript: finalText.trim() },
      });

      if (error) throw error;

      setExtracted({
        medication: data.medication,
        time: data.time,
        frequency: data.frequency,
        trigger: data.trigger,
        patientMessage: data.patientMessage,
        confidence: data.confidence,
      });
      setRecordingStep('extracted');
    } catch (err: any) {
      console.error('AI extraction failed:', err);
      toast({ title: 'AI extraction failed', description: err.message || 'Please try again.', variant: 'destructive' });
      setRecordingStep('idle');
    } finally {
      setAiLoading(false);
    }
  };

  const confirmSchedule = () => {
    if (!extracted) return;
    addVoiceReminder({
      medication: extracted.medication,
      time: extracted.time,
      frequency: extracted.frequency,
      trigger: extracted.trigger,
      patientMessage: extracted.patientMessage,
      caregiverName: 'Anitha',
      transcript: transcript,
      audioUrl: audioUrl || undefined,
    });
    setRecordingStep('confirmed');
    toast({ title: '✅ Reminder scheduled!', description: `${extracted.medication} at ${extracted.time}` });
    setTimeout(() => {
      setRecordingStep('idle');
      setActiveView('monitor');
    }, 2000);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const statusColor = (s: string) => {
    if (s === 'taken') return 'bg-success/12 text-success';
    if (s === 'missed') return 'bg-destructive/12 text-destructive';
    if (s === 'snoozed') return 'bg-warning/12 text-warning';
    return 'bg-primary/12 text-primary';
  };

  const statusIcon = (s: string) => {
    if (s === 'taken') return '✅';
    if (s === 'missed') return '⚠️';
    if (s === 'snoozed') return '⏰';
    return '🔔';
  };

  const activeReminders = voiceReminders.filter(r => r.status === 'active' || r.status === 'snoozed');
  const completedReminders = voiceReminders.filter(r => r.status === 'taken');
  const adherence = voiceReminders.length > 0
    ? Math.round((completedReminders.length / voiceReminders.length) * 100)
    : 0;

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
                  Your father has {activeReminders.length} active reminders.
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <button onClick={() => setRecordingStep('idle')} className="ios-card-elevated p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground">Record</span>
                </button>
                <button onClick={() => setActiveView('monitor')} className="ios-card-elevated p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground">Schedule</span>
                </button>
                <button onClick={() => setActiveView('escalation')} className="ios-card-elevated p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
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
                      Speak naturally. AI will extract medication, time & frequency automatically.
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
                    <div className="mt-4 mb-5 w-full">
                      <div className="bg-muted/40 rounded-xl p-3 min-h-[60px]">
                        <p className="text-[14px] text-foreground italic leading-relaxed">
                          {liveTranscript || '"Listening..."'}
                        </p>
                      </div>
                    </div>
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
                    <div className="bg-muted/40 rounded-xl p-3 mt-4 w-full">
                      <p className="text-[13px] text-foreground italic">"{transcript}"</p>
                    </div>
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
                    <div className="space-y-2.5 mb-4">
                      {[
                        { icon: '💊', label: 'Medication', value: extracted.medication },
                        { icon: '🕘', label: 'Time', value: extracted.time },
                        { icon: '🔄', label: 'Frequency', value: extracted.frequency },
                        { icon: '🍳', label: 'Trigger', value: extracted.trigger },
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

                    {/* Patient message preview */}
                    <div className="bg-primary/5 rounded-xl p-3 mb-4 border border-primary/10">
                      <div className="text-[11px] font-bold text-primary mb-1">🔊 Patient will hear:</div>
                      <p className="text-[14px] text-foreground italic">"{extracted.patientMessage}"</p>
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
                      Reminder synced to patient's device
                    </p>
                    <p className="text-[12px] text-primary font-bold mt-2">
                      Voice: Anitha's tone
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
                      { icon: '🎙', title: 'You Record', desc: 'Speak the reminder naturally' },
                      { icon: '🤖', title: 'AI Extracts', desc: 'Schedule auto-detected' },
                      { icon: '🔔', title: 'Patient Hears', desc: 'Your message plays aloud' },
                      { icon: '📊', title: 'You Monitor', desc: 'Track adherence in real-time' },
                      { icon: '⚠', title: 'Escalation', desc: 'Get alerted if ignored' },
                    ].map((s, i) => (
                      <motion.div
                        key={s.title}
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
                  <div className="text-[22px] font-extrabold text-success">{adherence}%</div>
                  <div className="text-[10px] font-bold text-muted-foreground mt-0.5">Adherence</div>
                </div>
                <div className="ios-card-elevated p-3 text-center">
                  <div className="text-[22px] font-extrabold text-primary">{activeReminders.length}</div>
                  <div className="text-[10px] font-bold text-muted-foreground mt-0.5">Active</div>
                </div>
                <div className="ios-card-elevated p-3 text-center">
                  <div className="text-[22px] font-extrabold text-success">{completedReminders.length}</div>
                  <div className="text-[10px] font-bold text-muted-foreground mt-0.5">Taken</div>
                </div>
              </div>

              {/* AI Insight */}
              <div className="ios-card-elevated p-3.5 mb-4 border-l-4 border-primary">
                <div className="flex items-start gap-2.5">
                  <Brain className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[12px] font-extrabold text-primary mb-0.5">AI Insight</div>
                    <p className="text-[13px] text-foreground leading-relaxed">
                      "Patient responds faster when reminder uses a slower, gentle speech tone. Morning reminders have highest success."
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
                    <div className="py-3.5 rounded-xl bg-success text-success-foreground font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-sm">
                      <Check className="w-5 h-5" /> I Took It
                    </div>
                    <div className="py-3.5 rounded-xl bg-warning text-warning-foreground font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-sm">
                      <Clock className="w-5 h-5" /> 10 Min
                    </div>
                  </div>
                </div>
              </div>

              {/* All Reminders */}
              <h3 className="text-[15px] font-extrabold text-foreground mb-2.5">📋 Voice Reminders</h3>
              {voiceReminders.length === 0 ? (
                <div className="ios-card-elevated p-8 text-center">
                  <Mic className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <div className="text-[14px] font-bold text-muted-foreground">No voice reminders yet</div>
                  <div className="text-[12px] text-muted-foreground/70 mt-1">Record one to get started</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {voiceReminders.map((rec, i) => (
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
                      <div className="mt-2 text-[11px] text-muted-foreground italic">
                        "{rec.patientMessage}"
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
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
              <h2 className="text-[18px] font-extrabold text-foreground mb-1">⚠ Escalation Center</h2>
              <p className="text-[12px] text-muted-foreground mb-4">
                Alerts when patient doesn't respond to reminders
              </p>

              {/* Escalation Flow Visual */}
              <div className="ios-card-elevated p-4 mb-4">
                <div className="text-[12px] font-extrabold text-foreground mb-3">Escalation Flow</div>
                <div className="flex items-center gap-1.5">
                  {[
                    { label: 'Reminder Sent', icon: '🔔' },
                    { label: '15 min wait', icon: '⏱' },
                    { label: 'Softer Replay', icon: '🔁' },
                    { label: 'Alert Caregiver', icon: '📱' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[14px]">
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

              {/* Active escalations from voice reminders that are still active */}
              {activeReminders.length > 0 && (
                <div className="space-y-3 mb-4">
                  {activeReminders.map(rem => (
                    <motion.div
                      key={rem.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ios-card-elevated border-2 border-warning/30 p-4"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                          <Bell className="w-5 h-5 text-warning" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[14px] font-extrabold text-foreground">
                            {rem.medication} — {rem.time}
                          </div>
                          <div className="text-[12px] text-muted-foreground mt-0.5">
                            Status: {rem.status} · by {rem.caregiverName}
                          </div>
                        </div>
                      </div>
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
                </div>
              )}

              {activeReminders.length === 0 && (
                <div className="ios-card-elevated p-8 text-center">
                  <Check className="w-10 h-10 text-success/30 mx-auto mb-3" />
                  <div className="text-[14px] font-bold text-muted-foreground">All clear!</div>
                  <div className="text-[12px] text-muted-foreground/70 mt-1">No pending escalations</div>
                </div>
              )}

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
