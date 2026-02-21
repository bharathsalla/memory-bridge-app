import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, context, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt: string;

    if (mode === "action-plan") {
      systemPrompt = `You are CrisisGuard AI — a clinical dementia care assistant. Based on the patient's current biometric data and predicted risks, generate exactly 7 specific, actionable prevention tasks.

Current patient data:
${context || "No specific context provided."}

You MUST respond with a JSON array of exactly 7 task objects. Each task must have:
- "task": a specific, actionable instruction (max 60 chars) directly addressing the predicted risks
- "priority": either "HIGH" or "MEDIUM"

Rules:
- Tasks MUST directly relate to the specific risks and vitals provided
- If agitation risk is high, include calming environment tasks
- If wandering risk is high, include GPS/tracking/supervision tasks  
- If HRV is low, include stress-reduction tasks
- If sleep was poor, include rest-related tasks
- If pressure is dropping, include weather-related comfort tasks
- Include at least one medical/doctor task and one caregiver coordination task
- HIGH priority for risks >70%, MEDIUM for lower risks
- Be specific: mention times, people, actions
- Do NOT include generic advice

Respond ONLY with the JSON array, no other text.`;
    } else {
      systemPrompt = `You are CrisisGuard AI Coach — a compassionate, evidence-based assistant for dementia caregivers. You provide actionable advice about managing predicted crisis events (agitation, wandering, confusion, falls).

Current patient context:
${context || "No specific context provided."}

Guidelines:
- Be warm, supportive, and practical
- Give numbered options when possible (1-3 choices)
- Reference the patient's data when relevant
- Keep responses under 150 words
- Never give medical diagnoses
- Always encourage contacting their doctor for medication changes
- Acknowledge the caregiver's effort and stress`;
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
          { role: "user", content: message },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "";

    if (mode === "action-plan") {
      try {
        // Extract JSON from reply (handle markdown code blocks)
        let jsonStr = reply;
        const match = reply.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) jsonStr = match[1].trim();
        const tasks = JSON.parse(jsonStr);
        return new Response(JSON.stringify({ tasks }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ tasks: null, reply }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ reply: reply || "I'm here to help. Could you rephrase your question?" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("crisis-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
