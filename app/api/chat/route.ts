
export const runtime = 'edge';
import { streamOpenAIWithRetry } from '@/lib/openai-edge';

export async function POST(req: Request) {
  const body = await req.json().catch(()=>({}));
  const { messages, remedy } = body || {};

  const system = { role: 'system', content: `You are Mercury, messenger and mirror. (Full behavioral prompt stored server-side.)` };

  if (remedy) {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5',
        temperature: 0.9,
        max_tokens: 180,
        messages: [ system, { role: 'user', content: `Remedy requested: ${remedy}. Generate a short, safe, vivid instruction.` } ]
      })
    });
    if (!r.ok) return new Response('Something went wrong. Try again.', { status: 500 });
    const j = await r.json();
    const t = j.choices?.[0]?.message?.content ?? 'Here is something simple: a glass of warm water. Sip slowly and breathe.';
    return new Response(t);
  }

  const all = [system, ...((messages||[]).map((m:any)=> ({ role: m.role==='mercury' ? 'assistant' : 'user', content: m.content })))];
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        // Retry once if first chunk takes longer than 8s
        for await (const chunk of streamOpenAIWithRetry(all, 8000, 1)) {
          controller.enqueue(enc.encode(chunk));
        }
      } catch (e) {
        controller.enqueue(enc.encode('Something went wrong. Try again.'));
      } finally {
        controller.close();
      }
    }
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
