import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Sparkles, Heart, Calendar, Clock, TrendingUp, TrendingDown,
  ChevronRight, Eye, BookOpen, MessageCircle, AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Simulated data the caregiver would see
const memoryEngagement = [
  { day: 'Mon', entries: 3, recalled: 2, score: 85 },
  { day: 'Tue', entries: 2, recalled: 1, score: 72 },
  { day: 'Wed', entries: 4, recalled: 3, score: 88 },
  { day: 'Thu', entries: 1, recalled: 0, score: 45 },
  { day: 'Fri', entries: 3, recalled: 2, score: 78 },
  { day: 'Sat', entries: 5, recalled: 4, score: 92 },
  { day: 'Sun', entries: 2, recalled: 2, score: 90 },
];

const recentMemories = [
  { id: '1', title: 'Morning garden walk', date: 'Today', time: '9:15 AM', emoji: '🌹', mood: '😊', recalled: true, score: 92, prompt: 'Who helped water the plants?', answer: 'Sarah' },
  { id: '2', title: 'Called John', date: 'Today', time: '11:00 AM', emoji: '📞', mood: '😊', recalled: false, score: 78, prompt: 'What good news did John share?', answer: null },
  { id: '3', title: 'Lunch with Sarah', date: 'Yesterday', time: '1:00 PM', emoji: '🍲', mood: '😊', recalled: true, score: 85, prompt: 'What did Sarah cook?', answer: 'My favorite soup' },
  { id: '4', title: 'Grandchildren visited', date: 'Yesterday', time: '4:30 PM', emoji: '🃏', mood: '😊', recalled: true, score: 95, prompt: "What are grandchildren's names?", answer: 'Emma and Liam' },
  { id: '5', title: 'Listened to music', date: '2 days ago', time: '7:00 PM', emoji: '🎵', mood: '😌', recalled: false, score: 70, prompt: 'Who did you dance with?', answer: null },
];

const cognitiveInsights = [
  { label: 'Memory Recall Rate', value: '72%', trend: 'up', detail: '↑ 8% from last week', color: 'text-success' },
  { label: 'Avg Engagement', value: '79%', trend: 'stable', detail: 'Consistent this week', color: 'text-primary' },
  { label: 'Emotional Diversity', value: '3 moods', trend: 'down', detail: 'Mostly happy — monitor', color: 'text-accent' },
  { label: 'Entries per Day', value: '2.9', trend: 'up', detail: '↑ from 2.1 last week', color: 'text-sage' },
];

const chartTooltipStyle = {
  contentStyle: { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '11px' },
  labelStyle: { color: 'hsl(var(--foreground))', fontWeight: 600 },
};

export default function CaregiverMemoryInsights() {
  const [selectedEntry, setSelectedEntry] = useState<typeof recentMemories[0] | null>(null);

  return (
    <div className="h-full overflow-y-auto warm-gradient pb-6">
      <div className="px-5 pt-3 pb-2">
        <h1 className="text-[22px] font-bold text-foreground">Memory Insights</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">Patient's Memory Lane activity & cognitive patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="px-5 mt-2">
        <div className="grid grid-cols-2 gap-2.5">
          {cognitiveInsights.map(item => (
            <div key={item.label} className="ios-card-elevated p-3.5">
              <div className={`text-[18px] font-bold ${item.color}`}>{item.value}</div>
              <div className="text-[12px] font-semibold text-foreground mt-0.5">{item.label}</div>
              <div className="flex items-center gap-1 mt-1">
                {item.trend === 'up' && <TrendingUp className="w-3 h-3 text-success" />}
                {item.trend === 'down' && <TrendingDown className="w-3 h-3 text-warning" />}
                <span className="text-[10px] text-muted-foreground">{item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Chart */}
      <div className="px-5 mt-5">
        <h2 className="text-[16px] font-bold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" /> Weekly Engagement
        </h2>
        <div className="ios-card-elevated p-4">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={memoryEngagement}>
              <defs>
                <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip {...chartTooltipStyle} />
              <Area type="monotone" dataKey="score" name="Engagement %" stroke="hsl(var(--primary))" fill="url(#gradScore)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 p-2.5 rounded-xl bg-primary/8">
            <div className="flex items-start gap-2">
              <Brain className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="text-[11px] text-foreground">Thursday dip (45%) — only 1 entry, no recalls. Suggest gently encouraging memory review on low-activity days.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recall Success */}
      <div className="px-5 mt-5">
        <h2 className="text-[16px] font-bold text-foreground mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-sage" /> Recall Success Rate
        </h2>
        <div className="ios-card-elevated p-4">
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={memoryEngagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="entries" name="Total Entries" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.3} />
              <Bar dataKey="recalled" name="Successfully Recalled" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-3 mt-2 justify-center">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-muted-foreground/30" />Total</span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-success" />Recalled</span>
          </div>
        </div>
      </div>

      {/* Recent Memories Review */}
      <div className="px-5 mt-5">
        <h2 className="text-[16px] font-bold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" /> Recent Memories
        </h2>
        <div className="ios-card-elevated divide-y divide-border/40">
          {recentMemories.map(mem => (
            <button
              key={mem.id}
              onClick={() => setSelectedEntry(selectedEntry?.id === mem.id ? null : mem)}
              className="w-full p-3.5 text-left active:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0">
                  <span className="text-[20px]">{mem.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-foreground">{mem.title}</span>
                    <span className="text-[12px]">{mem.mood}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">{mem.date} · {mem.time}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      mem.recalled ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>
                      {mem.recalled ? '✓ Recalled' : '○ Not recalled'}
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${selectedEntry?.id === mem.id ? 'rotate-90' : ''}`} />
              </div>

              {/* Expanded detail */}
              {selectedEntry?.id === mem.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3 p-3 rounded-2xl bg-muted/30"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3 h-3 text-accent" />
                    <span className="text-[10px] font-bold text-accent">Recall Prompt</span>
                  </div>
                  <p className="text-[12px] text-foreground font-medium">{mem.prompt}</p>
                  {mem.answer ? (
                    <p className="text-[11px] text-success mt-1">Patient answered: "{mem.answer}"</p>
                  ) : (
                    <p className="text-[11px] text-warning mt-1">Patient hasn't attempted this recall yet</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${mem.score >= 80 ? 'bg-success' : mem.score >= 50 ? 'bg-accent' : 'bg-warning'}`} style={{ width: `${mem.score}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{mem.score}%</span>
                  </div>
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cognitive Alerts */}
      <div className="px-5 mt-5">
        <h2 className="text-[16px] font-bold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" /> Cognitive Alerts
        </h2>
        <div className="ios-card-elevated divide-y divide-border/40">
          {[
            { text: 'Recall rate dropped Thursday — only 0/1 recalled', level: 'warn', time: '2 days ago' },
            { text: 'Patient frequently recalls family names (strong long-term memory)', level: 'positive', time: 'This week' },
            { text: 'Music triggers emotional memories — consider therapeutic playlist', level: 'info', time: '3 days ago' },
            { text: 'Afternoon entries have lower engagement — possible sundowning pattern', level: 'warn', time: 'Pattern detected' },
          ].map((alert, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                alert.level === 'warn' ? 'bg-warning' : alert.level === 'positive' ? 'bg-success' : 'bg-primary'
              }`} />
              <div className="flex-1">
                <div className="text-[13px] font-medium text-foreground leading-snug">{alert.text}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{alert.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Therapeutic Recommendations */}
      <div className="px-5 mt-5 mb-4">
        <h2 className="text-[16px] font-bold text-foreground mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-destructive" /> Recommendations
        </h2>
        <div className="space-y-2.5">
          {[
            { emoji: '🎵', title: 'Create a music playlist', desc: 'Patient responds well to Frank Sinatra — music-triggered memories are strongest', bg: 'bg-secondary/8' },
            { emoji: '📸', title: 'Add family photo prompts', desc: 'Patient recalls family names well. Upload more family photos for daily review.', bg: 'bg-primary/8' },
            { emoji: '🕐', title: 'Morning sessions preferred', desc: 'Memory recall is highest before noon. Schedule reminiscence therapy in AM.', bg: 'bg-accent/8' },
          ].map(rec => (
            <div key={rec.title} className={`ios-card-elevated p-3.5 flex items-start gap-3`}>
              <div className={`w-10 h-10 rounded-2xl ${rec.bg} flex items-center justify-center shrink-0`}>
                <span className="text-[20px]">{rec.emoji}</span>
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-foreground">{rec.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{rec.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
