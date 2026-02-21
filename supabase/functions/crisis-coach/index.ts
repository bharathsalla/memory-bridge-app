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

    if (mode === "risk-assessment") {
      systemPrompt = `You are CrisisGuard AI — a clinical dementia risk assessment engine. Given the patient's REAL biometric vitals from their wearable device and environmental sensors, compute accurate crisis risk scores.

REAL Patient Vitals (from Calmora Watch & sensors):
${context || "No vitals available."}

You MUST respond with a JSON object:
{
  "agitationRisk": number 0-100 (based on HRV deviation, sleep quality, pressure drops),
  "wanderingRisk": number 0-100 (based on sleep disruption, HRV, time of day patterns),
  "agitationLevel": "high" | "moderate" | "low",
  "wanderingLevel": "high" | "moderate" | "low",
  "agitationWindow": predicted time window string (e.g. "Tomorrow 4–7 PM"),
  "wanderingWindow": predicted time window string (e.g. "Tonight 10 PM–2 AM"),
  "riskSummary": 1-sentence summary of overall risk
}

Clinical rules for risk calculation:
- HRV below 40ms = HIGH agitation risk (>75%)
- HRV 40-50ms = MODERATE (50-75%)
- HRV above 50ms = LOW (<50%)
- Sleep wake-ups >3 = increases both risks by 15-20%
- Deep sleep <1h = increases agitation risk by 10-15%
- Barometric pressure drop >8mb/12h = increases agitation risk by 15-20%
- SpO2 below 95% = flag additional concern
- Elevated resting HR (>75bpm) combined with low HRV = compound risk increase
- Use the ACTUAL numbers provided, do NOT invent data

Respond ONLY with the JSON object, no other text.`;
    } else if (mode === "forecast") {
      systemPrompt = `You are CrisisGuard AI — a clinical dementia crisis forecast engine. Analyze the patient's REAL biometric data and provide a detailed 48-hour crisis forecast analysis.

REAL Patient Vitals (from Calmora Watch & sensors):
${context || "No specific context provided."}

You MUST respond with a JSON object containing:
1. "summary": A 1-sentence overall risk summary (max 80 chars)
2. "model_last_ran": current timestamp description like "Today 8:00 AM"
3. "next_run": next scheduled run like "Today 2:00 PM"
4. "alert_factors": array of exactly 4 objects, each with:
   - "label": factor name (e.g. "Sleep Quality: Poor")
   - "icon": one of "sleep", "hrv", "pressure", "pattern"
   - "color": one of "indigo", "purple", "blue", "green"
   - "detail": 2-sentence clinical explanation referencing the ACTUAL patient data provided. Use real numbers.
5. "pattern_factors": array of 6 objects, each with:
   - "label": factor name
   - "weight": number 0-100 (must reflect actual data severity from the vitals provided)
6. "pattern_insight": 2-sentence insight about pattern matching against patient history, referencing actual values
7. "match_count": number of matching past crisis signatures (realistic 4-9)
8. "match_total": total past signatures checked (realistic 8-12)
9. "lead_time_hours": average lead time in hours (realistic 24-48)
10. "predicted_vs_actual": array of 7 objects with "week" (W1-W7), "predicted" (0-5), "actual" (0-4) — realistic clinical data
11. "confidence_pct": overall confidence percentage based on data completeness

Rules:
- ALL numbers must directly relate to the REAL patient vitals provided
- Reference specific values (HR, HRV, sleep hours, pressure mb values)
- Be clinically accurate
- Pattern weights should reflect actual risk contribution from real data

Respond ONLY with the JSON object, no other text.`;
    } else if (mode === "action-plan") {
      // Determine task count dynamically based on risk levels from context
      let taskCount = 5; // default
      const agitationMatch = context?.match(/Agitation (\d+)%/);
      const wanderingMatch = context?.match(/Wandering (\d+)%/);
      const agitationRisk = agitationMatch ? parseInt(agitationMatch[1]) : 50;
      const wanderingRisk = wanderingMatch ? parseInt(wanderingMatch[1]) : 50;
      const avgRisk = (agitationRisk + wanderingRisk) / 2;
      
      if (avgRisk >= 75) taskCount = 9;
      else if (avgRisk >= 60) taskCount = 7;
      else if (avgRisk >= 40) taskCount = 5;
      else taskCount = 3;

      systemPrompt = `You are CrisisGuard AI — a clinical dementia care assistant. Based on the patient's current biometric data and predicted risks, generate exactly ${taskCount} specific, actionable prevention tasks.

Current patient data:
${context || "No specific context provided."}

You MUST respond with a JSON array of exactly ${taskCount} task objects. Each task must have:
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

    if (mode === "risk-assessment") {
      try {
        let jsonStr = reply;
        const match = reply.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) jsonStr = match[1].trim();
        const risk = JSON.parse(jsonStr);
        return new Response(JSON.stringify({ risk }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ risk: null, reply }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (mode === "forecast") {
      try {
        let jsonStr = reply;
        const match = reply.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) jsonStr = match[1].trim();
        const forecast = JSON.parse(jsonStr);
        return new Response(JSON.stringify({ forecast }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ forecast: null, reply }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

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
