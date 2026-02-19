import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const { type, message, photoUrl, caregiverName, medName, medDosage, medQty, medInstructions } = await req.json();

    // Create the reminder
    const { data: reminder, error: reminderError } = await supabase
      .from("reminders")
      .insert({
        type: type || "custom",
        title: `🔔 From ${caregiverName || "Caregiver"}`,
        message: message || "You have a new reminder",
        photo_url: photoUrl || null,
        schedule: { type: "once", times: [new Date().toISOString()] },
        priority: "high",
        persistent: true,
        active: true,
        created_by: caregiverName || "caregiver",
      })
      .select()
      .single();

    if (reminderError) throw reminderError;

    // If type is medication, also insert into medications table so it shows on patient's med list
    if (type === "medication") {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      await supabase.from("medications").insert({
        name: medName || message || "Medication Reminder",
        dosage: medDosage || "As directed",
        time: timeStr,
        instructions: medInstructions || `Sent by ${caregiverName || "Caregiver"}${medQty ? ` · Qty: ${medQty}` : ""}`,
        taken: false,
      });
    }

    // Add to activities so it shows in Today's Activity for both caregiver and patient
    await supabase.from("activities").insert({
      description: `${type === "medication" ? "💊" : "🔔"} ${medName || message || "Reminder"} — Sent by ${caregiverName || "Caregiver"}`,
      time: new Date().toISOString(),
      icon: type === "medication" ? "💊" : "🔔",
      completed: false,
    });

    // Create scheduled reminder
    await supabase.from("scheduled_reminders").insert({
      reminder_id: reminder.id,
      next_due_time: new Date().toISOString(),
      status: "sent",
      last_sent_at: new Date().toISOString(),
      send_count: 1,
    });

    // Log the event
    await supabase.from("reminder_logs").insert({
      reminder_id: reminder.id,
      event_type: "caregiver_triggered",
      timestamp: new Date().toISOString(),
      triggered_by_name: caregiverName || "Caregiver",
      metadata: { type, message, has_photo: !!photoUrl, medName, medDosage, medQty },
    });

    return new Response(
      JSON.stringify({ success: true, reminder }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
