import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || query.length < 2) {
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use RxNorm API (free, no API key required) for medicine name suggestions
    const url = `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(query)}`;
    const rxResponse = await fetch(url);

    if (!rxResponse.ok) {
      throw new Error(`RxNorm API error: ${rxResponse.status}`);
    }

    const data = await rxResponse.json();
    const suggestions: string[] = data?.suggestionGroup?.suggestionList?.suggestion || [];

    // Also try approximate match for better results
    const approxUrl = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=10`;
    const approxResponse = await fetch(approxUrl);
    let approxNames: string[] = [];

    if (approxResponse.ok) {
      const approxData = await approxResponse.json();
      const candidates = approxData?.approximateGroup?.candidate || [];
      approxNames = candidates.map((c: any) => c.rxstring).filter(Boolean);
    }

    // Combine and deduplicate
    const allNames = [...new Set([...suggestions, ...approxNames])].slice(0, 15);

    return new Response(JSON.stringify(allNames), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("search-medicines error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
