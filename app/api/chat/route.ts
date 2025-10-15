export const runtime = 'edge';

import { CONFIG } from '@/lib/config';
import { buildMessages, completeOnce, debugMessage } from '@/lib/openai';

function extractToneChips(text: string) {
  const lowered = text.toLowerCase();
  const directTag = lowered.match(/tone[s]?\s*[:=]\s*([^\n]+)/);
  const plusList = lowered.includes('+') ? lowered.split('+') : null;
  let tokens: string[] = [];

  if (directTag) {
    tokens = directTag[1].split(/[,&]/).map(s=>s.trim());
  } else if (plusList && plusList.length > 1) {
    tokens = plusList.map(s=>s.trim());
  }
  tokens = tokens.map(t => t.replace(/[^a-z\-\s]/g,'')).filter(Boolean);
  const uniq: string[] = [];
  for (const t of tokens) if (!uniq.includes(t)) uniq.push(t);
  return uniq.slice(0,3);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const transcript = Array.isArray(body?.transcript) ? body.transcript : [];
    let tones = Array.isArray(body?.tones) ? body.tones : [];
    const essence = typeof body?.essence === 'string' ? body.essence : '';

    const lastUser = [...transcript].reverse().find((m:any)=>m.role==='user');
    if (lastUser) {
      const parsed = extractToneChips(lastUser.content);
      if (parsed.length) {
        const merged = [...tones, ...parsed].map(s=>s.trim().toLowerCase());
        const uniq: string[] = [];
        for (const t of merged) if (!uniq.includes(t)) uniq.push(t);
        tones = uniq.slice(0,3);
      }
    }

    const messages = buildMessages({ transcript, tones, essence });
    const text = await completeOnce(messages);

    const marker = tones.length ? ` [tones:${tones.join(', ')}]` : '';
    return new Response(text + marker, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (e:any) {
    return new Response(debugMessage(e), { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}
