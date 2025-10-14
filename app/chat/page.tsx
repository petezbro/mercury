'use client';
import { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'mercury'; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'mercury', content: 'Ah, a living thought enters. What’s alive in you?' } as const,
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  async function send() {
    if (!input.trim()) return;

    const next: Msg[] = [
      ...messages,
      { role: 'user' as const, content: input.trim() },
    ];
    setMessages(next);
    setInput('');
    setBusy(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: next }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let acc = '';
    let appended = false;

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      acc += decoder.decode(value, { stream: true });

      if (!appended) {
        setMessages((m) => [...m, { role: 'mercury' as const, content: '' }]);
        appended = true;
      }

      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'mercury', content: acc };
        return copy;
      });
    }

    setBusy(false);
  }

  async function requestRemedy(kind: string) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ remedy: kind, messages }),
    });
    const txt = await res.text();
    setMessages((m) => [...m, { role: 'mercury' as const, content: txt }]);
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
                className={
                  m.role === 'mercury'
                    ? 'inline-block bg-white/10 px-4 py-2 rounded-lg'
                    : 'inline-block bg-white/5 px-4 py-2 rounded-lg'
                }
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Speak, and be seen…"
            className="flex-1 rounded-md bg-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            disabled={busy}
            onClick={send}
            className="rounded-md bg-white/10 px-6 py-3 hover:bg-white/20 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>

        <div className="mt-6">
          <div className="text-sm opacity-80">When you’re ready, choose an embodiment:</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {['Drink', 'Eat', 'Breath', 'Gesture'].map((k) => (
              <button
                key={k}
                onClick={() => requestRemedy(k)}
                className="rounded-full border border-white/20 px-4 py-1.5 text-sm hover:bg-white/10"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
