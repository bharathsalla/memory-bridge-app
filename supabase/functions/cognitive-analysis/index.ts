import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all memories from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: memories, error: memError } = await supabase
      .from("memories")
      .select("*")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (memError) throw memError;

    if (!memories || memories.length === 0) {
      return new Response(JSON.stringify({
        total_entries: 0,
        recalled_count: 0,
        recall_rate: 0,
        avg_engagement: 0,
        mood_distribution: {},
        alerts: [{ text: "No memory entries yet. Encourage the patient to add their first memory.", level: "info", time: "Now" }],
        recommendations: [{ emoji: "📸", title: "Start with a photo", desc: "Help the patient capture a simple moment — a meal, a view, or a loved one.", bg: "bg-primary/8" }],
        daily_breakdown: [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build stats
    const totalEntries = memories.length;
    const recalledCount = memories.filter((m: any) => m.cognitive_answer).length;
    const recallRate = Math.round((recalledCount / totalEntries) * 100);
    const avgEngagement = Math.round(memories.reduce((s: number, m: any) => s + (m.engagement_score || 0), 0) / totalEntries);

    // Mood distribution
    const moodDist: Record<string, number> = {};
    memories.forEach((m: any) => {
      const mood = m.mood || "😊";
      moodDist[mood] = (moodDist[mood] || 0) + 1;
    });

    // Daily breakdown for charts
    const dailyMap: Record<string, { entries: number; recalled: number; scores: number[] }> = {};
    memories.forEach((m: any) => {
      const day = new Date(m.created_at).toLocaleDateString("en-US", { weekday: "short" });
      if (!dailyMap[day]) dailyMap[day] = { entries: 0, recalled: 0, scores: [] };
      dailyMap[day].entries++;
      if (m.cognitive_answer) dailyMap[day].recalled++;
      dailyMap[day].scores.push(m.engagement_score || 0);
    });

    const dailyBreakdown = Object.entries(dailyMap).map(([day, d]) => ({
      day,
      entries: d.entries,
      recalled: d.recalled,
      score: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
    }));

    // Use AI to generate cognitive alerts and recommendations
    const memorySummary = memories.slice(0, 20).map((m: any) => ({
      title: m.title,
      type: m.type,
      mood: m.mood,
      recalled: !!m.cognitive_answer,
      engagement: m.engagement_score,
      time: new Date(m.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      date: new Date(m.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    }));

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a cognitive health analyst for a dementia care app. Analyze memory engagement data and return JSON with:
- "alerts": array of {text, level, time} where level is "warn"|"positive"|"info". Max 4 alerts. Focus on patterns like: declining recall rates, time-of-day patterns (sundowning), emotional changes, engagement drops.
- "recommendations": array of {emoji, title, desc, bg} where bg is one of "bg-primary/8"|"bg-secondary/8"|"bg-accent/8". Max 3 recommendations. Be specific and actionable based on the data.
Return ONLY valid JSON with these two keys.`,
          },
          {
            role: "user",
            content: `Weekly stats: ${totalEntries} entries, ${recalledCount} recalled (${recallRate}%), avg engagement ${avgEngagement}%.
Mood distribution: ${JSON.stringify(moodDist)}
Recent memories: ${JSON.stringify(memorySummary)}
Daily breakdown: ${JSON.stringify(dailyBreakdown)}`,
          },
        ],
      }),
    });

    let alerts = [];
    let recommendations = [];

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      try {
        const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        alerts = parsed.alerts || [];
        recommendations = parsed.recommendations || [];
      } catch {
        console.error("Failed to parse AI response:", content);
        alerts = [{ text: "AI analysis temporarily unavailable", level: "info", time: "Now" }];
      }
    } else {
      console.error("AI gateway error:", aiResponse.status);
      alerts = [{ text: "Cognitive analysis will be available soon", level: "info", time: "Now" }];
    }

    // Store the analysis
    await supabase.from("cognitive_insights").insert({
      total_entries: totalEntries,
      recalled_count: recalledCount,
      recall_rate: recallRate,
      avg_engagement: avgEngagement,
      mood_distribution: moodDist,
      alerts,
      recommendations,
      daily_breakdown: dailyBreakdown,
    });

    return new Response(JSON.stringify({
      total_entries: totalEntries,
      recalled_count: recalledCount,
      recall_rate: recallRate,
      avg_engagement: avgEngagement,
      mood_distribution: moodDist,
      alerts,
      recommendations,
      daily_breakdown: dailyBreakdown,
      recent_memories: memories.slice(0, 10),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("cognitive-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
