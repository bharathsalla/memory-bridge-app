import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get 30 days of activity history
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activities, error } = await supabase
      .from("user_activities")
      .select("*")
      .gte("timestamp", thirtyDaysAgo.toISOString())
      .order("timestamp", { ascending: false });

    if (error) throw error;

    // Analyze patterns
    const patterns = analyzePatterns(activities || []);

    // Save learned patterns
    for (const pattern of patterns) {
      await supabase.from("learned_patterns").upsert(
        {
          pattern_type: pattern.type,
          hour: pattern.hour,
          day_of_week: pattern.dayOfWeek || 1,
          confidence_score: pattern.confidence,
          success_rate: pattern.successRate,
          recommended_actions: pattern.recommendedActions,
          last_calculated_at: new Date().toISOString(),
        }
      );
    }

    // Schedule proactive reminders based on patterns
    await scheduleProactiveReminders(supabase, patterns);

    return new Response(
      JSON.stringify({ success: true, patterns }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function analyzePatterns(activities: any[]) {
  const hourlyActivity = Array(24).fill(0);
  const hourlySuccess = Array(24).fill(0);

  activities.forEach((activity) => {
    const hour = activity.hour_of_day;
    if (hour == null) return;
    hourlyActivity[hour]++;
    if (activity.activity_type === "reminder_completed") {
      hourlySuccess[hour]++;
    }
  });

  const patterns = [];

  for (let hour = 0; hour < 24; hour++) {
    if (hourlyActivity[hour] >= 3) {
      const successRate = hourlySuccess[hour] / hourlyActivity[hour];
      if (successRate >= 0.6) {
        patterns.push({
          type: "optimal_time",
          hour,
          dayOfWeek: null,
          confidence: Math.min(hourlyActivity[hour] / 10, 1),
          successRate,
          recommendedActions: getRecommendedActions(hour),
        });
      }
    }
  }

  return patterns.sort((a, b) => b.successRate - a.successRate).slice(0, 5);
}

function getRecommendedActions(hour: number): string[] {
  if (hour >= 7 && hour <= 9) return ["medication", "breakfast_reminder"];
  if (hour >= 12 && hour <= 14) return ["medication", "lunch_reminder"];
  if (hour >= 18 && hour <= 20) return ["medication", "dinner_reminder"];
  if (hour >= 21 && hour <= 23) return ["evening_medication", "bedtime_routine"];
  return ["check_in"];
}

async function scheduleProactiveReminders(supabase: any, patterns: any[]) {
  const today = new Date();

  for (const pattern of patterns) {
    const nextTime = new Date();
    nextTime.setHours(pattern.hour, 0, 0, 0);
    if (nextTime <= today) nextTime.setDate(nextTime.getDate() + 1);

    const timeStr = `${pattern.hour.toString().padStart(2, "0")}:00`;

    const { data: existing } = await supabase
      .from("reminders")
      .select("id")
      .eq("type", "proactive_learned")
      .single();

    if (!existing) {
      const { data: reminder } = await supabase
        .from("reminders")
        .insert({
          type: "check_in",
          title: "🔔 Smart Reminder",
          message: `Based on your routine, good time for: ${pattern.recommendedActions.join(", ")}`,
          schedule: { type: "daily", times: [timeStr], days_of_week: [1, 2, 3, 4, 5, 6, 7] },
          priority: "medium",
          active: true,
          created_by: "system",
        })
        .select()
        .single();

      if (reminder) {
        await supabase.from("scheduled_reminders").insert({
          reminder_id: reminder.id,
          next_due_time: nextTime.toISOString(),
          status: "active",
        });
      }
    }
  }
}
