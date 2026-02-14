// NLP service for voice-over grammar correction and relevance checking

const NLP_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-nlp`;
const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function callNLP(body: Record<string, unknown>): Promise<string> {
  try {
    const resp = await fetch(NLP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      console.warn('NLP call failed:', resp.status);
      return '';
    }
    const data = await resp.json();
    return data.result || '';
  } catch (e) {
    console.warn('NLP call error:', e);
    return '';
  }
}

export async function correctName(transcript: string): Promise<string> {
  const result = await callNLP({ type: 'correct_name', transcript });
  return result || transcript;
}

export async function correctInput(transcript: string, fieldLabel: string, fieldType = 'text'): Promise<string> {
  const result = await callNLP({
    type: 'correct_input',
    transcript,
    context: { fieldLabel, fieldType },
  });
  return result || transcript;
}

export interface RelevanceResult {
  relevant: boolean;
  summary: string;
  redirect_message: string;
}

export async function checkRelevance(
  transcript: string,
  screen: string,
  screenPurpose: string,
  flowStep: string
): Promise<RelevanceResult> {
  const result = await callNLP({
    type: 'check_relevance',
    transcript,
    context: { screen, screenPurpose, flowStep },
  });
  try {
    return JSON.parse(result);
  } catch {
    return { relevant: true, summary: '', redirect_message: '' };
  }
}
