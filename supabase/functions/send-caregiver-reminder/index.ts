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

    const { type, message, photoUrl, caregiverName, medName, medDosage, medQty, medInstructions, medTime, medPeriod, medFoodInstruction } = await req.json();

    // Build dose time
    let doseDate = new Date();
    let displayTime = "";

    if (medTime) {
      const [h, m] = medTime.split(":").map(Number);
      doseDate.setHours(h, m, 0, 0);

      // If time already passed today, schedule for tomorrow
      if (doseDate.getTime() < Date.now()) {
        doseDate.setDate(doseDate.getDate() + 1);
      }

      // Validate: must be at least 2 min in the future
      const diffMs = doseDate.getTime() - Date.now();
      if (diffMs < 2 * 60 * 1000) {
        return new Response(
          JSON.stringify({ error: "Dose time must be at least 2 minutes from now." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      displayTime = doseDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } else {
      // No specific time — schedule 2 min from now so popup shows immediately
      doseDate = new Date(Date.now() + 2 * 60 * 1000);
      displayTime = doseDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }

    // Build instructions string
    const instrParts: string[] = [];
    if (medPeriod) instrParts.push(medPeriod);
    if (medFoodInstruction) instrParts.push(medFoodInstruction);
    if (medInstructions) instrParts.push(medInstructions);
    const fullInstructions = instrParts.length > 0
      ? instrParts.join(" · ")
      : `Sent by ${caregiverName || "Caregiver"}`;

    // Create the reminder
    const { data: reminder, error: reminderError } = await supabase
      .from("reminders")
      .insert({
        type: type || "custom",
        title: `🔔 From ${caregiverName || "Caregiver"}`,
        message: medName || message || "You have a new reminder",
        photo_url: photoUrl || null,
        schedule: { type: "once", times: [doseDate.toISOString()] },
        priority: "high",
        persistent: true,
        active: true,
        created_by: caregiverName || "caregiver",
      })
      .select()
      .single();

    if (reminderError) throw reminderError;

    // If type is medication, insert into medications table
    if (type === "medication") {
      await supabase.from("medications").insert({
        name: medName || message || "Medication Reminder",
        dosage: medDosage || "As directed",
        time: displayTime,
        instructions: fullInstructions + (medQty ? ` · Qty: ${medQty}` : ""),
        taken: false,
      });
    }

    // Add to activities
    await supabase.from("activities").insert({
      description: `${type === "medication" ? "💊" : "🔔"} ${medName || message || "Reminder"} — Scheduled for ${displayTime} by ${caregiverName || "Caregiver"}`,
      time: new Date().toISOString(),
      icon: type === "medication" ? "💊" : "🔔",
      completed: false,
    });

    // Create scheduled reminder with next_due_time = actual dose time
    // The patient popup will show 2 min before this time
    await supabase.from("scheduled_reminders").insert({
      reminder_id: reminder.id,
      next_due_time: doseDate.toISOString(),
      status: "active",
      last_sent_at: new Date().toISOString(),
      send_count: 1,
    });

    // Log the event
    await supabase.from("reminder_logs").insert({
      reminder_id: reminder.id,
      event_type: "caregiver_triggered",
      timestamp: new Date().toISOString(),
      triggered_by_name: caregiverName || "Caregiver",
      metadata: { type, message, has_photo: !!photoUrl, medName, medDosage, medQty, medPeriod, medFoodInstruction, medTime, dose_time: doseDate.toISOString() },
    });

    return new Response(
      JSON.stringify({ success: true, reminder, dose_time: doseDate.toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
