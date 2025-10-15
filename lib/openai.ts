import { CONFIG } from './config';
import { SYSTEM_PROMPT } from './prompt';

function estimateTokensFromMessages(messages: any[]): number {
  const chars = messages.reduce((n: number, m: any) => n + (m?.content?.length || 0), 0);
  return Math.ceil(chars * CONFIG.TOKEN_PER_CHAR_EST);
}

export function buildMessages(payload: any) {
  const { transcript = [], tones = [], essence = '' } = payload || {};
  const essenceLine = essence ? `Session Essence: ${essence}` : '';
  const toneLine = tones.length ? `Chosen tones: ${tones.join(', ')}` : `Chosen tones: (not set)`;
  const sys = { role: 'system', content: `${SYSTEM_PROMPT}\n${essenceLine}\n${toneLine}` };

  const msgs = [sys, ...transcript.map((m: any) => ({
    role: m.role === 'mercury' ? 'assistant' as const : 'user' as const,
    content: m.content
  }))];

  return msgs;
}

async function postChat(messages: any[], signal?: AbortSignal) {
  const inputEstimate = estimateTokensFromMessages(messages);
  const room = Math.max(300, CONFIG.MAX_TOTAL_TOKENS - inputEstimate);
  const maxCompletion = Math.min(CONFIG.MAX_COMPLETION_TOKENS, room);

  const body = JSON.stringify({
    model: CONFIG.MODEL,
    messages,
    max_completion_tokens: maxCompletion
  });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body,
    signal
  });

  return res;
}

export async function completeOnce(messages: any[], attempt = 0): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CONFIG.HTTP_TIMEOUT_MS);

  try {
    const res = await postChat(messages, ctrl.signal);
    const raw = await res.text();
    if (!res.ok) {
      const err = new Error(`OpenAI ${res.status}: ${raw || 'request failed'}`);
      (err as any).code = `E${res.status}`;
      throw err;
    }
    let json: any = {};
    try { json = JSON.parse(raw); } catch {
      const err = new Error('Malformed JSON from model');
      (err as any).code = 'EJSON';
      throw err;
    }
    const content = json?.choices?.[0]?.message?.content ?? '';
    if (!content || !content.trim()) {
      const err = new Error('Empty completion from model');
      (err as any).code = 'EEMPTY';
      throw err;
    }
    return content;
  } catch (e:any) {
    if (attempt < CONFIG.MAX_RETRIES) {
      await new Promise(r => setTimeout(r, CONFIG.FIRST_RETRY_DELAY_MS * (attempt + 1)));
      return completeOnce(messages, attempt + 1);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function debugMessage(e:any) {
  if (!CONFIG.DEBUG) return 'Something went wrong. Try again.';
  const msg = e?.message || 'unknown error';
  const code = e?.code || 'E499-ABORT';
  return `[debug] ${code}: ${msg}`;
}
