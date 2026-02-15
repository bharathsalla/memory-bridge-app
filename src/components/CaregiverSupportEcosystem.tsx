import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Brain, Shield, Coffee, BookOpen, MessageCircle,
  ChevronRight, ChevronLeft, ExternalLink, Users, AlertTriangle,
  Smile, Frown, Meh, ArrowRight, Check, X, Clock, Lightbulb
} from 'lucide-react';

type Module = null | 'checkin' | 'chatbot' | 'safebreak' | 'burnout' | 'education';
type EducationSub = null | 'alzheimers' | 'lewy' | 'frontotemporal' | 'vascular' | 'community' | 'stages';

const moodOptions = [
  { emoji: '😊', label: 'Managing Well', color: 'bg-success/15 text-success border-success/30' },
  { emoji: '😔', label: 'Feeling Tired', color: 'bg-warning/15 text-warning border-warning/30' },
  { emoji: '😫', label: 'Overwhelmed', color: 'bg-destructive/15 text-destructive border-destructive/30' },
];

const burnoutQuestions = [
  "I feel emotionally drained from caregiving.",
  "I feel I have little control over my daily routine.",
  "I often feel isolated or unsupported.",
  "I have trouble sleeping due to caregiving worries.",
  "I neglect my own health for the patient.",
];

export default function CaregiverSupportEcosystem() {
  const [activeModule, setActiveModule] = useState<Module>(null);
  const [educationSub, setEducationSub] = useState<EducationSub>(null);

  // Stress check-in state
  const [moodHistory, setMoodHistory] = useState<{ emoji: string; label: string; date: string }[]>([
    { emoji: '😊', label: 'Managing Well', date: 'Mon' },
    { emoji: '😔', label: 'Feeling Tired', date: 'Tue' },
    { emoji: '😔', label: 'Feeling Tired', date: 'Wed' },
  ]);
  const [todayMood, setTodayMood] = useState<string | null>(null);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: "Hi, I'm your dementia care support assistant. I'm here to listen and help. How are you feeling today?" },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Burnout state
  const [burnoutAnswers, setBurnoutAnswers] = useState<number[]>([]);
  const [burnoutDone, setBurnoutDone] = useState(false);

  // Safe break state
  const [breakActive, setBreakActive] = useState(false);

  const negativeCount = moodHistory.filter(m => m.emoji !== '😊').length;

  const handleMoodSelect = (emoji: string, label: string) => {
    setTodayMood(emoji);
    setMoodHistory(prev => [...prev, { emoji, label, date: 'Today' }]);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');

    // Simulated bot responses
    setTimeout(() => {
      let response = "I understand. Caregiving is incredibly challenging. Would you like to try a quick breathing exercise, or would you prefer some practical tips?";

      if (userMsg.toLowerCase().includes('exhaust') || userMsg.toLowerCase().includes('tired') || userMsg.toLowerCase().includes('fail')) {
        response = "You are NOT failing. Dementia caregiving is one of the hardest roles anyone can take on. Exhaustion is completely normal. Would you like a short reset exercise?";
      } else if (userMsg.toLowerCase().includes('wander')) {
        response = "Night wandering is common in mid-stage Alzheimer's. Consider motion sensors or calming light cues before bedtime. Would you like more behavior management tips?";
      } else if (userMsg.toLowerCase().includes('aggress') || userMsg.toLowerCase().includes('angry')) {
        response = "Aggression in dementia is often from confusion or pain, not directed at you. Stay calm, speak slowly, and try redirecting to a familiar activity. You're doing your best. 💙";
      } else if (userMsg.toLowerCase().includes('guilt')) {
        response = "Caregiver guilt is incredibly common. Remember: seeking help isn't weakness, it's wisdom. You matter too. Would you like to explore some self-care strategies?";
      } else if (userMsg.toLowerCase().includes('yes') || userMsg.toLowerCase().includes('sure')) {
        response = "Great! Try this: Close your eyes. Breathe in for 4 counts, hold for 4, out for 6. Repeat 3 times. This activates your calm nervous system. 🧘";
      }

      setChatMessages(prev => [...prev, { role: 'bot', text: response }]);
    }, 800);
  };

  const handleBurnoutAnswer = (score: number) => {
    const next = [...burnoutAnswers, score];
    setBurnoutAnswers(next);
    if (next.length >= burnoutQuestions.length) setBurnoutDone(true);
  };

  const burnoutScore = burnoutAnswers.reduce((a, b) => a + b, 0);
  const burnoutLevel = burnoutScore <= 5 ? 'Low' : burnoutScore <= 10 ? 'Moderate' : 'High';
  const burnoutColor = burnoutScore <= 5 ? 'text-success' : burnoutScore <= 10 ? 'text-warning' : 'text-destructive';

  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="flex items-center gap-1 text-primary text-[14px] font-medium mb-4">
      <ChevronLeft className="w-4 h-4" /> Back
    </button>
  );

  // ── MODULE SCREENS ──

  if (activeModule === 'checkin') {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => { setActiveModule(null); setTodayMood(null); }} />
        <div className="text-center mb-2">
          <div className="text-[28px] mb-1">🧠</div>
          <h3 className="text-[18px] font-bold text-foreground">Caregiver Check-In</h3>
          <p className="text-[14px] text-muted-foreground mt-1">How are YOU feeling today?</p>
        </div>

        {!todayMood ? (
          <div className="space-y-2.5">
            {moodOptions.map(opt => (
              <motion.button
                key={opt.emoji}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleMoodSelect(opt.emoji, opt.label)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border ${opt.color} transition-all`}
              >
                <span className="text-[28px]">{opt.emoji}</span>
                <span className="text-[15px] font-semibold">{opt.label}</span>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ios-card-elevated p-4 text-center">
            <div className="text-[36px] mb-2">{todayMood}</div>
            <p className="text-[14px] text-foreground font-medium">
              {todayMood === '😊' ? "Glad you're holding steady 💙" : todayMood === '😔' ? "It's okay to feel tired. You're doing more than enough." : "You've been through a lot. Consider talking to our support chatbot. 💙"}
            </p>
            {todayMood !== '😊' && (
              <button onClick={() => setActiveModule('chatbot')} className="mt-3 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-bold">
                Talk to Support Bot
              </button>
            )}
          </motion.div>
        )}

        {/* Mood trend */}
        <div className="ios-card-elevated p-4">
          <h4 className="text-[14px] font-bold text-foreground mb-3">This Week</h4>
          <div className="flex gap-2 justify-center">
            {moodHistory.slice(-7).map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[20px]">{m.emoji}</span>
                <span className="text-[10px] text-muted-foreground">{m.date}</span>
              </div>
            ))}
          </div>
          {negativeCount >= 3 && (
            <div className="mt-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
              <p className="text-[12px] text-warning font-medium">⚠ You've had a tough week. Consider talking to the support chatbot or taking a break.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeModule === 'chatbot') {
    return (
      <div className="flex flex-col h-full" style={{ minHeight: 400 }}>
        <BackButton onClick={() => setActiveModule(null)} />
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-foreground">Dementia Care Assistant</h3>
            <p className="text-[11px] text-muted-foreground">Trained on dementia care best practices</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-3 max-h-[300px]">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChatSend()}
            placeholder="Type how you're feeling..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-[13px] text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button onClick={handleChatSend} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-bold shrink-0">
            Send
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {["I'm exhausted", "Wandering at night", "Feeling guilty", "Need a break"].map(q => (
            <button key={q} onClick={() => { setChatInput(q); }} className="px-3 py-1.5 rounded-full bg-muted text-[11px] text-muted-foreground border border-border/60">
              {q}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeModule === 'safebreak') {
    const isStable = true; // Simulated: patient is stable
    return (
      <div className="space-y-4">
        <BackButton onClick={() => { setActiveModule(null); setBreakActive(false); }} />
        <div className="text-center mb-2">
          <div className="text-[28px] mb-1">☕</div>
          <h3 className="text-[18px] font-bold text-foreground">Safe Break Mode</h3>
          <p className="text-[14px] text-muted-foreground mt-1">Take guilt-free rest when patient is stable</p>
        </div>

        <div className={`ios-card-elevated p-5 border-2 ${isStable ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isStable ? 'bg-success/15' : 'bg-warning/15'}`}>
              {isStable ? <Check className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-warning" />}
            </div>
            <div>
              <div className={`text-[16px] font-bold ${isStable ? 'text-success' : 'text-warning'}`}>
                {isStable ? '🟢 All Stable' : '⚠ Stay Attentive'}
              </div>
              <div className="text-[12px] text-muted-foreground">
                {isStable ? 'Patient inside geofence · GPS stable · Battery OK' : 'Patient near boundary area'}
              </div>
            </div>
          </div>

          {isStable && !breakActive && (
            <p className="text-[13px] text-foreground mb-3">Safe to take a short 20–30 min break. You'll be alerted if anything changes.</p>
          )}

          {!breakActive ? (
            <button onClick={() => setBreakActive(true)} disabled={!isStable} className={`w-full py-3 rounded-xl font-bold text-[14px] ${isStable ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}>
              {isStable ? '☕ Start Break Timer' : 'Not safe for break right now'}
            </button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Break Active</div>
              <div className="text-[36px] font-bold text-success">20:00</div>
              <p className="text-[12px] text-muted-foreground mt-1">Monitoring continues. You'll be notified of any changes.</p>
              <button onClick={() => setBreakActive(false)} className="mt-3 px-5 py-2 rounded-xl bg-muted text-muted-foreground text-[13px] font-medium">
                End Break
              </button>
            </motion.div>
          )}
        </div>

        <div className="ios-card p-4">
          <h4 className="text-[13px] font-bold text-foreground mb-2">🧠 Why breaks matter</h4>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Research shows caregiver burnout directly impacts patient care quality. Regular short breaks improve decision-making, patience, and emotional resilience.
          </p>
        </div>
      </div>
    );
  }

  if (activeModule === 'burnout') {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => { setActiveModule(null); setBurnoutAnswers([]); setBurnoutDone(false); }} />
        <div className="text-center mb-2">
          <div className="text-[28px] mb-1">📊</div>
          <h3 className="text-[18px] font-bold text-foreground">Burnout Risk Assessment</h3>
          <p className="text-[14px] text-muted-foreground mt-1">Monthly 5-question wellness check</p>
        </div>

        {!burnoutDone ? (
          <div className="ios-card-elevated p-5">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
              Question {burnoutAnswers.length + 1} of {burnoutQuestions.length}
            </div>
            <div className="h-1.5 rounded-full bg-muted mb-4 overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(burnoutAnswers.length / burnoutQuestions.length) * 100}%` }} />
            </div>
            <p className="text-[15px] font-medium text-foreground mb-5">
              {burnoutQuestions[burnoutAnswers.length]}
            </p>
            <div className="space-y-2">
              {[
                { label: 'Never', score: 0 },
                { label: 'Sometimes', score: 1 },
                { label: 'Often', score: 2 },
                { label: 'Always', score: 3 },
              ].map(opt => (
                <button key={opt.label} onClick={() => handleBurnoutAnswer(opt.score)} className="w-full text-left px-4 py-3 rounded-xl bg-muted text-[14px] text-foreground font-medium hover:bg-muted/70 transition-colors border border-border/40">
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="ios-card-elevated p-5 text-center">
              <div className={`text-[32px] font-bold ${burnoutColor}`}>{burnoutLevel}</div>
              <p className="text-[12px] text-muted-foreground mt-1">Burnout Risk Level</p>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${burnoutScore <= 5 ? 'bg-success' : burnoutScore <= 10 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${(burnoutScore / 15) * 100}%` }} />
              </div>
              <p className="text-[13px] text-foreground mt-3">Score: {burnoutScore}/15</p>
            </div>

            <div className="ios-card-elevated p-4">
              <h4 className="text-[14px] font-bold text-foreground mb-2">💡 Recommendations</h4>
              <div className="space-y-2 text-[13px] text-muted-foreground">
                {burnoutLevel === 'High' ? (
                  <>
                    <p>• Talk to our support chatbot for immediate guidance</p>
                    <p>• Consider joining a caregiver support group</p>
                    <p>• Consult a professional counselor</p>
                    <p>• Schedule regular respite care</p>
                  </>
                ) : burnoutLevel === 'Moderate' ? (
                  <>
                    <p>• Take regular breaks using Safe Break mode</p>
                    <p>• Connect with other caregivers in our community section</p>
                    <p>• Practice daily stress check-ins</p>
                  </>
                ) : (
                  <>
                    <p>• Great job managing your wellbeing! 💙</p>
                    <p>• Continue your current self-care routine</p>
                    <p>• Check in monthly to track your wellness</p>
                  </>
                )}
              </div>
              {burnoutLevel === 'High' && (
                <button onClick={() => { setActiveModule('chatbot'); setBurnoutDone(false); setBurnoutAnswers([]); }} className="mt-3 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-bold">
                  Talk to Support Bot
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  if (activeModule === 'education') {
    if (educationSub === 'community') {
      return (
        <div className="space-y-4">
          <BackButton onClick={() => setEducationSub(null)} />
          <h3 className="text-[18px] font-bold text-foreground">💬 Community Support</h3>
          {[
            { platform: 'Reddit', groups: ['r/Alzheimers', 'r/dementia', 'r/CaregiverSupport'], color: 'bg-[#FF4500]/10 text-[#FF4500]' },
            { platform: 'Facebook', groups: ["Alzheimer's Caregiver Support Group", 'Dementia Caregivers India', 'Young Onset Dementia Support'], color: 'bg-[#1877F2]/10 text-[#1877F2]' },
            { platform: 'Quora', groups: ["Alzheimer's Caregiving", 'Dementia Behavior Management'], color: 'bg-[#B92B27]/10 text-[#B92B27]' },
          ].map(p => (
            <div key={p.platform} className="ios-card-elevated p-4">
              <div className={`inline-flex px-2.5 py-1 rounded-lg text-[12px] font-bold mb-3 ${p.color}`}>{p.platform}</div>
              <div className="space-y-2">
                {p.groups.map(g => (
                  <button key={g} className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <span className="text-[13px] text-foreground font-medium">{g}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (educationSub === 'stages') {
      return (
        <div className="space-y-4">
          <BackButton onClick={() => setEducationSub(null)} />
          <h3 className="text-[18px] font-bold text-foreground">📊 Tips by Stage</h3>
          {[
            { stage: 'Early Stage', color: 'bg-success/10 border-success/20', dot: 'bg-success', tips: ['Use reminders and routines', 'Simplify the environment', 'Encourage independence', 'Start legal & financial planning'], learnMore: 'Focus on maintaining quality of life and planning ahead while the person can still participate in decisions.' },
            { stage: 'Middle Stage', color: 'bg-warning/10 border-warning/20', dot: 'bg-warning', tips: ['Increase supervision gradually', 'Wandering prevention strategies', 'Use calm redirection methods', 'Reduce overstimulation'], learnMore: 'This is often the longest stage. Behavior changes like sundowning and aggression are common. Patience and routine are key.' },
            { stage: 'Late Stage', color: 'bg-destructive/10 border-destructive/20', dot: 'bg-destructive', tips: ['Focus on comfort care', 'Monitor swallowing difficulties', 'Watch for infection signs', 'Provide emotional reassurance'], learnMore: 'Communication becomes very limited. Focus on sensory comfort—gentle touch, soft music, familiar scents. Hospice care may be appropriate.' },
          ].map(s => (
            <StageCard key={s.stage} {...s} />
          ))}
        </div>
      );
    }

    // Dementia type sub-pages
    const dementiaTypes: Record<string, { title: string; icon: string; source: string; topics: string[] }> = {
      alzheimers: { title: "Alzheimer's Disease", icon: '🧠', source: "Alzheimer's Association", topics: ['Early stage coping strategies', 'Mid-stage aggression management', 'Late stage comfort care', 'Memory preservation techniques'] },
      lewy: { title: 'Lewy Body Dementia', icon: '🔬', source: 'Lewy Body Dementia Association', topics: ['Hallucination management', 'Medication sensitivity awareness', 'Sleep disturbance patterns', 'Movement symptom care'] },
      frontotemporal: { title: 'Frontotemporal Dementia', icon: '🧩', source: 'Association for Frontotemporal Degeneration', topics: ['Personality change support', 'Impulse behavior management', 'Language difficulty coping', 'Social behavior changes'] },
      vascular: { title: 'Vascular Dementia', icon: '❤️‍🩹', source: 'Stroke Association', topics: ['Stroke history relation', 'Sudden decline patterns', 'Prevention focus strategies', 'Cognitive rehabilitation'] },
    };

    if (educationSub && dementiaTypes[educationSub]) {
      const dt = dementiaTypes[educationSub];
      return (
        <div className="space-y-4">
          <BackButton onClick={() => setEducationSub(null)} />
          <div className="text-center mb-2">
            <div className="text-[32px] mb-1">{dt.icon}</div>
            <h3 className="text-[18px] font-bold text-foreground">{dt.title}</h3>
            <p className="text-[12px] text-muted-foreground mt-1">Source: {dt.source}</p>
          </div>
          <div className="ios-card-elevated p-4 space-y-2.5">
            {dt.topics.map(t => (
              <button key={t} className="w-full flex items-center justify-between p-3.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <span className="text-[14px] text-foreground font-medium">{t}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 text-primary text-[13px] font-bold">
            <ExternalLink className="w-4 h-4" /> Visit {dt.source}
          </button>
        </div>
      );
    }

    // Education main page
    return (
      <div className="space-y-4">
        <BackButton onClick={() => setActiveModule(null)} />
        <div className="text-center mb-2">
          <div className="text-[28px] mb-1">📚</div>
          <h3 className="text-[18px] font-bold text-foreground">Education & Support</h3>
          <p className="text-[14px] text-muted-foreground mt-1">Learn, connect, and find trusted resources</p>
        </div>

        {/* By Dementia Type */}
        <div>
          <h4 className="text-[14px] font-bold text-foreground mb-2.5">By Dementia Type</h4>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(dementiaTypes).map(([key, dt]) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.97 }}
                onClick={() => setEducationSub(key as EducationSub)}
                className="ios-card-elevated p-4 text-center"
              >
                <div className="text-[24px] mb-1.5">{dt.icon}</div>
                <div className="text-[12px] font-bold text-foreground leading-tight">{dt.title}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Community & Stages */}
        <div className="space-y-2.5">
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => setEducationSub('community')} className="w-full ios-card-elevated p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lavender/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-lavender" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-[14px] font-bold text-foreground">Community Support</div>
              <div className="text-[12px] text-muted-foreground">Reddit, Facebook, Quora groups</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>

          <motion.button whileTap={{ scale: 0.98 }} onClick={() => setEducationSub('stages')} className="w-full ios-card-elevated p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-[14px] font-bold text-foreground">Tips by Stage</div>
              <div className="text-[12px] text-muted-foreground">Early, Middle & Late stage guidance</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>
      </div>
    );
  }

  // ── MAIN CARD GRID ──
  const modules = [
    { id: 'checkin' as Module, icon: '🧠', title: 'Daily Stress Check-In', desc: 'Quick emotional pulse', bg: 'bg-primary/8', border: 'border-primary/15' },
    { id: 'chatbot' as Module, icon: '💬', title: 'Support Chatbot', desc: 'Dementia-trained AI assistant', bg: 'bg-lavender/8', border: 'border-lavender/15' },
    { id: 'safebreak' as Module, icon: '☕', title: 'Safe Break Mode', desc: 'Rest when patient is stable', bg: 'bg-success/8', border: 'border-success/15' },
    { id: 'burnout' as Module, icon: '📊', title: 'Burnout Assessment', desc: 'Monthly wellness check', bg: 'bg-warning/8', border: 'border-warning/15' },
    { id: 'education' as Module, icon: '📚', title: 'Education & Community', desc: 'Learn & connect with others', bg: 'bg-accent/8', border: 'border-accent/15' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Heart className="w-5 h-5 text-rose" />
        <h3 className="text-[16px] font-bold text-foreground">Caregiver Wellness Hub</h3>
      </div>
      <p className="text-[12px] text-muted-foreground -mt-1">Your emotional support & education center</p>

      <div className="space-y-2.5">
        {modules.map(m => (
          <motion.button
            key={m.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModule(m.id)}
            className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border ${m.border} ${m.bg} transition-all text-left`}
          >
            <div className="text-[26px] shrink-0">{m.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-foreground">{m.title}</div>
              <div className="text-[12px] text-muted-foreground">{m.desc}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </motion.button>
        ))}
      </div>

      {negativeCount >= 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-warning/10 border border-warning/20">
          <p className="text-[12px] text-warning font-medium">💛 You've had a tough week. Consider using the Support Chatbot or Burnout Assessment.</p>
        </motion.div>
      )}
    </div>
  );
}

// ── Stage Card Sub-component ──
function StageCard({ stage, color, dot, tips, learnMore }: { stage: string; color: string; dot: string; tips: string[]; learnMore: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`ios-card-elevated p-4 border ${color}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${dot}`} />
        <h4 className="text-[15px] font-bold text-foreground">{stage}</h4>
      </div>
      <div className="space-y-1.5">
        {tips.map(t => (
          <div key={t} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-[13px] text-foreground">{t}</span>
          </div>
        ))}
      </div>
      <button onClick={() => setExpanded(!expanded)} className="mt-3 text-[12px] text-primary font-medium">
        {expanded ? 'Show Less' : 'Learn More ▸'}
      </button>
      {expanded && (
        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-[12px] text-muted-foreground mt-2 leading-relaxed">
          {learnMore}
        </motion.p>
      )}
    </div>
  );
}
