'use client';
import { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'mercury'; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'mercury', content: 'Speak what you’re trying to say — to anyone, about anything.' } as const,
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [tones, setTones] = useState<string[]>([]);
  const [essence, setEssence] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setBusy(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ transcript: next, tones, essence })
    });

    const txt = await res.text();
    const toneMatch = txt.match(/\[tones:(.*?)\]/);
    if (toneMatch) {
      const list = toneMatch[1].split(',').map(s=>s.trim()).filter(Boolean);
      setTones(list);
    }
    const clean = toneMatch ? txt.replace(toneMatch[0],'').trim() : txt;

    setMessages(m => [...m, { role: 'mercury', content: clean }]);
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
            </div>
          ))}

          {tones.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tones.map((t, idx) => (
                <span key={idx} className="text-xs rounded-full border border-white/20 px-3 py-1 opacity-90">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Tell me what you’re trying to say… (you can add tones like: calm, clear, warm)"
            className="flex-1 rounded-md bg-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            disabled={busy}
            onClick={() => send()}
            className="rounded-md bg-white/10 px-6 py-3 hover:bg-white/20 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
