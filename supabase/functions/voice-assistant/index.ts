import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { command, screen, screenContext, patientName, onboardingStep } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a warm, patient voice companion for a dementia care app called MemoCare. You speak to the patient directly in a caring, simple way. The patient's name is "${patientName || 'Friend'}".

CONTEXT:
- Current screen: ${screen}
- Screen details: ${screenContext}
- Onboarding step: ${onboardingStep || 'none'}

YOUR CAPABILITIES (tell the patient what you can do when relevant):
- Navigate to screens: today, memories, safety, care, wellbeing
- Mark medications as taken
- Call caregiver Sarah (emergency)
- Log mood (happy, sad, tired, anxious, calm)
- Read the current page aloud
- Answer questions about what's on the current screen

RULES:
1. Keep responses under 2 sentences. Be concise and warm.
2. If the patient asks about their activities, medications, health, or schedule — use the screen context data to give a specific, helpful answer.
3. If the patient seems confused or off-topic, gently redirect them to the current screen's purpose.
4. If the patient asks to navigate somewhere, respond with the exact tab name they should go to.
5. Never use technical jargon. Speak like a kind family member.
6. If you can answer from the context, do so directly. Don't say "I don't know" if the data is in the context.

RESPONSE FORMAT — Return valid JSON only:
{
  "reply": "What to say to the patient",
  "action": null or one of: "nav_today", "nav_memories", "nav_safety", "nav_care", "nav_wellbeing", "take_med", "sos", "cancel_sos", "read_page", "mood_happy", "mood_sad", "mood_tired", "mood_anxious", "mood_calm",
  "isRelevant": true/false (is the command relevant to the app)
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: command },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ reply: "I need a moment. Please try again.", action: null, isRelevant: true }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ reply: "I am having trouble connecting right now.", action: null, isRelevant: true }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ reply: "I did not catch that. Could you say it again?", action: null, isRelevant: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { reply: raw, action: null, isRelevant: true };
    } catch {
      parsed = { reply: raw.replace(/[{}"`]/g, '').trim() || "I did not catch that.", action: null, isRelevant: true };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("voice-assistant error:", e);
    return new Response(JSON.stringify({ reply: "I am having a small issue. Please try again.", action: null, isRelevant: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
