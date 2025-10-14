'use client';

import { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'mercury'; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'mercury', content: 'Ah, a living thought enters. What’s alive in you?' } as const
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
      { role: 'user' as const, content: input.trim() }
    ];

    setMessages(next);
    setInput('');
    setBusy(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: next })
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let acc = '';
    let appended = false;

    while (reader
