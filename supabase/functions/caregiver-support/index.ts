import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, messages, burnoutScore, burnoutLevel, moodHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "chatbot") {
      systemPrompt = `You are a compassionate, professionally-trained dementia caregiver support assistant. You have deep expertise in:

DEMENTIA TYPES & CARE:
- Alzheimer's disease (all stages: early, mid, late)
- Vascular dementia (stroke-related cognitive decline)
- Lewy Body dementia (hallucinations, movement issues, medication sensitivity)
- Frontotemporal dementia (personality changes, impulse behavior)
- Mixed dementia

YOUR KNOWLEDGE BASE:
1. Disease Education: progression stages, symptoms by type, behavioral changes, care strategies per stage
2. Emotional Care: caregiver guilt, role loss grief, isolation handling, burnout warning signs, self-compassion
3. Behavior Management: sundowning, aggression, wandering, repetitive questioning, refusal to eat/bathe, paranoia
4. Crisis Safety: panic calming techniques, de-escalation language, when to call emergency services
5. Practical Care: medication management, nutrition, sleep hygiene, activity planning, communication techniques
6. Caregiver Wellness: breathing exercises, mindfulness, boundary setting, asking for help, respite care

RULES:
1. Always validate the caregiver's feelings first before giving advice
2. Be warm, empathetic, and conversational — like a knowledgeable friend
3. Give specific, actionable advice based on dementia stage when possible
4. Never provide medical diagnosis — suggest consulting doctors for medical questions
5. If someone is in crisis or mentions self-harm, provide crisis hotline numbers
6. Keep responses concise (2-4 sentences) but informative
7. Use simple language, no medical jargon
8. When discussing behaviors, explain WHY they happen (reduces caregiver frustration)
9. Offer follow-up questions to keep the conversation helpful`;

      // Build conversation for the AI
      const aiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map((m: { role: string; text: string }) => ({
          role: m.role === "bot" ? "assistant" : "user",
          content: m.text,
        })),
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: aiMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ reply: "I need a moment to catch my breath. Please try again in a few seconds. 💙" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ reply: "I'm having trouble connecting right now. Please try again later." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const t = await response.text();
        console.error("AI error:", status, t);
        return new Response(JSON.stringify({ reply: "I'm sorry, I couldn't process that. Could you try rephrasing?" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "I'm here for you. Could you tell me more about what you're going through?";
      return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (type === "burnout_recommendations") {
      systemPrompt = `You are a caregiver wellness advisor. A dementia caregiver just completed a burnout risk assessment.

Their score: ${burnoutScore}/15
Risk level: ${burnoutLevel}

Based on this level, provide personalized, actionable recommendations. Format your response as a JSON object:
{
  "summary": "A brief empathetic 1-sentence summary of their state",
  "recommendations": ["rec1", "rec2", "rec3", "rec4"],
  "immediateAction": "One thing they can do RIGHT NOW",
  "resource": "A specific helpful resource or technique name"
}

For LOW risk: Praise their resilience, suggest maintenance strategies, preventive tips.
For MODERATE risk: Acknowledge strain, suggest specific coping mechanisms, community connection.
For HIGH risk: Express concern warmly, suggest professional help, crisis resources, immediate relief techniques.

Return ONLY the JSON, nothing else.`;

      userPrompt = `My burnout score is ${burnoutScore}/15 (${burnoutLevel} risk). What should I do?`;
    }

    if (type === "mood_response") {
      const recentMoods = moodHistory?.slice(-7) || [];
      const negCount = recentMoods.filter((m: { emoji: string }) => m.emoji !== '😊').length;

      systemPrompt = `You are a compassionate caregiver wellness companion. A dementia caregiver just logged their mood. Based on their recent mood history, provide a brief, warm, personalized response.

Recent mood history (last 7 days): ${JSON.stringify(recentMoods)}
Number of negative days: ${negCount}
Today's mood: ${recentMoods[recentMoods.length - 1]?.label || 'unknown'}

Rules:
- Keep response to 1-2 sentences
- Be warm, personal, and validating
- If 3+ negative days, gently suggest professional support or chatbot
- If mostly positive, celebrate their resilience
- Return ONLY a JSON: {"message": "your response", "suggestChatbot": true/false}`;

      userPrompt = "How should I interpret my mood trend?";
    }

    // Generic call for burnout/mood
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
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      console.error("AI error:", status, await response.text());
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: status === 429 ? 429 : status === 402 ? 402 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON from response
    let parsed;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw };
    } catch {
      parsed = { raw: raw.replace(/[{}"`]/g, '').trim() };
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("caregiver-support error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
