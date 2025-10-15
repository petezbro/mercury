'use client';
import { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'mercury'; content: string };

const MAX_USER_CHARS = 4000;
const TOKEN_PER_CHAR_EST = 0.25;

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'mercury', content: 'Speak what you’re trying to say — to anyone, about anything.' } as const,
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [tones, setTones] = useState<string[]>([]);
  const [essence, setEssence] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const charCount = input.length;
  const tokenEstimate = Math.ceil(charCount * TOKEN_PER_CHAR_EST);
  const overLimit = charCount > MAX_USER_CHARS;

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages, busy]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || overLimit) return;
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setBusy(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: next, tones, essence })
    }).catch((e) => new Response(`[debug] NETWORK: ${e?.message || 'request failed'}`, { status: 599 }));

    let txt = '';
    try { txt = await res.text(); } catch (e:any) { txt = `[debug] READ: ${e?.message || 'failed to read response'}`; }

    if (!res.ok) {
      setMessages(m => [...m, { role: 'mercury', content: txt || '[debug] Request failed.' }]);
      setBusy(false);
      return;
    }

    const toneMatch = txt.match(/\[tones:(.*?)\]/);
    if (toneMatch) {
      const list = toneMatch[1].split(',').map(s=>s.trim()).filter(Boolean);
      setTones(list);
      txt = txt.replace(toneMatch[0], '').trim();
    }

    setMessages(m => [...m, { role: 'mercury', content: (txt && txt.trim()) || '[debug] No content returned.' }]);
    setBusy(false);
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8">
        <div
          ref={listRef}
          className="h-[65vh] overflow-y-auto rounded-lg bg-white/5 p-4 backdrop-blur-sm border border-white/10"
        >
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'mercury' ? 'mb-6' : 'mb-6 text-right'}>
              <div
                className={m.role === 'mercury'
                  ? 'inline-block bg-white/10 px-4 py-2 rounded-lg'
                  : 'inline-block bg-white/5 px-4 py-2 rounded-lg'}
              >
                {m.content}
              </div>
              {m.role === 'mercury' && i === messages.length - 1 && busy && (
                <div className="mt-2 thinking-line animate-pulse-line rounded" aria-label="thinking" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Tell me what you’re trying to say…"
              className="flex-1 rounded-md bg-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              disabled={busy || overLimit || !input.trim()}
              onClick={() => send()}
              className="rounded-md bg-white/10 px-6 py-3 hover:bg-white/20 transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs opacity-80">
            <span>{charCount.toLocaleString()} / {MAX_USER_CHARS.toLocaleString()} chars</span>
            <span>~{tokenEstimate.toLocaleString()} tokens est.</span>
          </div>
          <div className="mt-1 h-1 w-full bg-white/10 rounded">
            <div
              className="h-1 rounded"
              style={{
                width: `${Math.min(100, (charCount / MAX_USER_CHARS) * 100)}%`,
                background: overLimit ? '#ef4444' : '#ffffff66'
              }}
            />
          </div>
          {overLimit && <div className="mt-2 text-xs text-red-400">Too long for one turn. Trim a little and resend.</div>}
        </div>
      </div>
    </main>
  );
}
