import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Sparkles, Heart, TrendingUp, TrendingDown, Loader2,
  ChevronRight, BookOpen, AlertTriangle, RefreshCw, FileText, Image, Mic, MessageSquare, Check, Circle
} from 'lucide-react';
import IconBox, { iosColors, getColor } from '@/components/ui/IconBox';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InsightsData {
  total_entries: number;
  recalled_count: number;
  recall_rate: number;
  avg_engagement: number;
  mood_distribution: Record<string, number>;
  alerts: { text: string; level: string; time: string }[];
  recommendations: { emoji: string; title: string; desc: string; bg: string }[];
  daily_breakdown: { day: string; entries: number; recalled: number; score: number }[];
  recent_memories?: any[];
}

const chartTooltipStyle = {
  contentStyle: { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '11px' },
  labelStyle: { color: 'hsl(var(--foreground))', fontWeight: 600 },
};

export default function CaregiverMemoryInsights() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const { toast } = useToast();

  const fetchInsights = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data: result, error } = await supabase.functions.invoke('cognitive-analysis');
      if (error) throw error;
      setData(result);
    } catch (e) {
      console.error('Failed to fetch insights:', e);
      toast({ title: 'Error', description: 'Failed to load cognitive insights', variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center warm-gradient">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-[13px] text-muted-foreground">Analyzing cognitive patterns...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center warm-gradient px-8">
        <div className="text-center">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-[18px] font-bold text-foreground mb-2">No Data Available</h2>
          <p className="text-[13px] text-muted-foreground">Patient hasn't added any memories yet. Insights will appear once memory entries are recorded.</p>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: 'Recall Rate', value: `${data.recall_rate}%`, trend: data.recall_rate >= 70 ? 'up' : 'down', detail: `${data.recalled_count}/${data.total_entries} recalled`, color: 'text-success' },
    { label: 'Avg Engagement', value: `${data.avg_engagement}%`, trend: data.avg_engagement >= 70 ? 'up' : 'stable', detail: 'This week', color: 'text-primary' },
    { label: 'Moods Logged', value: `${Object.keys(data.mood_distribution).length}`, trend: 'stable', detail: `${data.total_entries} entries`, color: 'text-accent' },
    { label: 'Entries/Day', value: data.daily_breakdown.length > 0 ? (data.total_entries / Math.max(data.daily_breakdown.length, 1)).toFixed(1) : '0', trend: 'up', detail: 'This week', color: 'text-sage' },
  ];

  return (
    <div className="h-full overflow-y-auto ios-grouped-bg pb-6">
      {/* iOS Large Title Header */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-ios-large-title text-foreground">Insights</h1>
          <button onClick={() => fetchInsights(true)} disabled={refreshing} className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-[15px] text-muted-foreground mt-1">AI cognitive analysis</p>
      </div>

      {/* Key Metrics */}
      <div className="px-5 mt-2">
        <div className="grid grid-cols-2 gap-2.5">
          {metrics.map(item => (
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
      {data.daily_breakdown.length > 0 && (
        <div className="px-5 mt-5">
          <h2 className="text-[16px] font-bold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" /> Weekly Engagement
          </h2>
          <div className="ios-card-elevated p-4">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={data.daily_breakdown}>
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
          </div>
        </div>
      )}

      {/* Recall Success */}
      {data.daily_breakdown.length > 0 && (
        <div className="px-5 mt-5">
          <h2 className="text-[16px] font-bold text-foreground mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-sage" /> Recall Success Rate
          </h2>
          <div className="ios-card-elevated p-4">
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={data.daily_breakdown}>
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
      )}

      {/* Recent Memories from DB */}
      {data.recent_memories && data.recent_memories.length > 0 && (
        <div className="px-5 mt-5">
          <h2 className="text-[16px] font-bold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Recent Patient Memories
          </h2>
          <div className="ios-card-elevated divide-y divide-border/40">
            {data.recent_memories.map((mem: any) => (
              <button
                key={mem.id}
                onClick={() => setSelectedEntry(selectedEntry?.id === mem.id ? null : mem)}
                className="w-full p-3.5 text-left active:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <IconBox Icon={mem.type === 'photo' ? Image : mem.type === 'voice' ? Mic : MessageSquare} color={mem.type === 'photo' ? iosColors.blue : mem.type === 'voice' ? iosColors.orange : iosColors.green} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-foreground">{mem.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(mem.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {new Date(mem.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                        mem.cognitive_answer ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {mem.cognitive_answer ? <><Check className="w-2.5 h-2.5" /> Recalled</> : <><Circle className="w-2.5 h-2.5" /> Not recalled</>}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${selectedEntry?.id === mem.id ? 'rotate-90' : ''}`} />
                </div>

                {selectedEntry?.id === mem.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 p-3 rounded-2xl bg-muted/30">
                    <p className="text-[12px] text-foreground mb-2">{mem.description}</p>
                    {mem.cognitive_prompt && (
                      <>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="w-3 h-3 text-accent" />
                          <span className="text-[10px] font-bold text-accent">Recall Prompt</span>
                        </div>
                        <p className="text-[12px] text-foreground font-medium">{mem.cognitive_prompt}</p>
                        {mem.cognitive_answer ? (
                          <p className="text-[11px] text-success mt-1">Patient answered: "{mem.cognitive_answer}"</p>
                        ) : (
                          <p className="text-[11px] text-warning mt-1">Patient hasn't attempted this recall yet</p>
                        )}
                      </>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${(mem.engagement_score || 0) >= 80 ? 'bg-success' : (mem.engagement_score || 0) >= 50 ? 'bg-accent' : 'bg-warning'}`} style={{ width: `${mem.engagement_score || 0}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{mem.engagement_score || 0}%</span>
                    </div>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Cognitive Alerts */}
      {data.alerts.length > 0 && (
        <div className="px-5 mt-5">
          <h2 className="text-[16px] font-bold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" /> Cognitive Alerts
          </h2>
          <div className="ios-card-elevated divide-y divide-border/40">
            {data.alerts.map((alert, i) => (
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
      )}

      {/* AI Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="px-5 mt-5 mb-4">
          <h2 className="text-[16px] font-bold text-foreground mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-destructive" /> AI Recommendations
          </h2>
          <div className="space-y-2.5">
            {data.recommendations.map((rec, i) => (
              <div key={i} className="ios-card-elevated p-3.5 flex items-start gap-3">
                <IconBox Icon={[Brain, Heart, BookOpen, Sparkles][i % 4]} color={getColor(i)} />
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-foreground">{rec.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{rec.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
