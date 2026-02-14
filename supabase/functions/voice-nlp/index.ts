import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, transcript, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "correct_name") {
      systemPrompt = `You are a speech-to-text correction assistant for a dementia care app. The user spoke their name aloud and the speech recognition captured it. Your job is to return the corrected, properly capitalized name. Return ONLY the corrected name, nothing else. No quotes, no explanation. If it sounds like a real name, capitalize it properly. If it's gibberish, return "Friend".`;
      userPrompt = `Speech recognition captured: "${transcript}"`;
    } else if (type === "check_relevance") {
      systemPrompt = `You are a context checker for a dementia care app called MemoCare. The user is on a specific screen and said something. Determine if what they said is relevant to the current screen/flow or if it's off-topic/confused.

Return a JSON object with:
- "relevant": boolean (true if related to the app/screen/care tasks)
- "summary": string (brief 1-sentence summary of what user seems to want)
- "redirect_message": string (if irrelevant, a gentle message to redirect them back, mentioning what screen they're on and what they should focus on. Be kind and patient.)

Only return valid JSON, nothing else.`;
      userPrompt = `Current screen: ${context?.screen || "unknown"}
Screen purpose: ${context?.screenPurpose || "unknown"}
Current flow step: ${context?.flowStep || "general browsing"}
User said: "${transcript}"`;
    } else if (type === "correct_input") {
      systemPrompt = `You are a speech-to-text input correction assistant for a dementia care app. The user spoke a value to fill into a form field. Correct any grammar/spelling issues and return the clean value. Return ONLY the corrected value, nothing else.
Field type: ${context?.fieldType || "text"}
Field label: ${context?.fieldLabel || "input"}`;
      userPrompt = `Speech recognition captured: "${transcript}"`;
    }

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("voice-nlp error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
