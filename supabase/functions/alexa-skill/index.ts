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

    const alexaRequest = await req.json();
    const requestType = alexaRequest?.request?.type;

    if (requestType === "IntentRequest") {
      const intentName = alexaRequest.request.intent.name;

      if (intentName === "ShowRemindersIntent") {
        // Get active reminders
        const { data: scheduled } = await supabase
          .from("scheduled_reminders")
          .select("*, reminders(title, message, type)")
          .in("status", ["active", "sent"])
          .order("next_due_time", { ascending: true })
          .limit(5);

        if (!scheduled || scheduled.length === 0) {
          return buildAlexaResponse("You have no reminders right now.", true);
        }

        let speech = `You have ${scheduled.length} reminder${scheduled.length > 1 ? "s" : ""}. `;
        scheduled.forEach((item: any, i: number) => {
          speech += `${i + 1}. ${item.reminders?.message || item.reminders?.title}. `;
        });

        return buildAlexaResponse(speech, false);
      }

      if (intentName === "MarkCompleteIntent") {
        const { data: reminders } = await supabase
          .from("scheduled_reminders")
          .select("id")
          .eq("status", "sent")
          .order("next_due_time", { ascending: true })
          .limit(1);

        if (reminders && reminders.length > 0) {
          await supabase
            .from("scheduled_reminders")
            .update({ status: "completed", completed_at: new Date().toISOString() })
            .eq("id", reminders[0].id);

          return buildAlexaResponse("Okay, marked as complete.", true);
        }

        return buildAlexaResponse("Could not find that reminder.", true);
      }
    }

    // Default / LaunchRequest
    return buildAlexaResponse(
      "Welcome to MemoCare Assistant. You can ask me about your reminders or mark them complete.",
      false
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildAlexaResponse(text: string, shouldEndSession: boolean) {
  return new Response(
    JSON.stringify({
      version: "1.0",
      response: {
        outputSpeech: { type: "PlainText", text },
        shouldEndSession,
      },
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
