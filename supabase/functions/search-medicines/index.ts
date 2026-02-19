import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Common medicines for instant fallback on short queries
const COMMON_MEDICINES = [
  "Aspirin", "Acetaminophen", "Ibuprofen", "Metformin", "Lisinopril", "Amlodipine",
  "Atorvastatin", "Omeprazole", "Losartan", "Metoprolol", "Levothyroxine", "Simvastatin",
  "Gabapentin", "Hydrochlorothiazide", "Sertraline", "Montelukast", "Pantoprazole",
  "Escitalopram", "Rosuvastatin", "Clopidogrel", "Prednisone", "Furosemide",
  "Dolo 650", "Paracetamol", "Cetirizine", "Azithromycin", "Amoxicillin",
  "Ciprofloxacin", "Diclofenac", "Ranitidine", "Domperidone", "Crocin",
];
const cache = new Map<string, { data: string[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

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

    const key = query.toLowerCase().trim();

    // Check cache
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Instant local matches for common medicines
    const localMatches = COMMON_MEDICINES.filter(n => n.toLowerCase().includes(key));

    // Use RxNorm API for more results
    // For short queries, use spelling suggestions (faster)
    const spellUrl = `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(key)}`;
    const drugsUrl = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(key)}`;

    // Run both in parallel for speed
    const [spellRes, drugsRes] = await Promise.all([
      fetch(spellUrl).catch(() => null),
      fetch(drugsUrl).catch(() => null),
    ]);

    const names = new Set<string>();

    // Parse spelling suggestions
    if (spellRes?.ok) {
      const spellData = await spellRes.json();
      const suggestions = spellData?.suggestionGroup?.suggestionList?.suggestion || [];
      suggestions.forEach((s: string) => names.add(s));
    }

    // Parse drug concepts — these give actual brand/generic names
    if (drugsRes?.ok) {
      const drugsData = await drugsRes.json();
      const groups = drugsData?.drugGroup?.conceptGroup || [];
      for (const group of groups) {
        const props = group?.conceptProperties || [];
        for (const p of props) {
          if (p.name) names.add(p.name);
          if (p.synonym) names.add(p.synonym);
        }
      }
    }

    // Combine local + API results and deduplicate
    localMatches.forEach(n => names.add(n));
    const filtered = [...names]
      .filter(n => n.toLowerCase().includes(key))
      .sort((a, b) => {
        // Prioritize exact prefix matches
        const aStarts = a.toLowerCase().startsWith(key) ? 0 : 1;
        const bStarts = b.toLowerCase().startsWith(key) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.length - b.length; // shorter names first
      })
      .slice(0, 20);

    // Cache the result
    cache.set(key, { data: filtered, ts: Date.now() });

    return new Response(JSON.stringify(filtered), {
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
