export async function* streamOnce(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  signal?: AbortSignal
) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5',
      stream: true,
      temperature: 0.9,
      max_completion_tokens: 800,
      messages,
    }),
    signal,
  });

if (!res.ok || !res.body) {
  const txt = await res.text().catch(() => '');
  throw new Error(`OpenAI ${res.status}: ${txt || 'request failed'}`);
}

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;

      const data = trimmed.replace('data:', '').trim();
      if (data === '[DONE]') return;

      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta as string;
      } catch {
        // swallow JSON parsing errors for partial chunks
      }
    }
  }
}

export async function* streamOpenAIWithRetry(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  firstChunkTimeoutMs = 8000,
  maxRetries = 1
) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const { signal } = controller;

    let firstChunk = false;
    let timedOut = false;

    const timer = setTimeout(() => {
      if (!firstChunk) {
        timedOut = true;
        controller.abort();
      }
    }, firstChunkTimeoutMs);

    try {
      for await (const chunk of streamOnce(messages, signal)) {
        if (!firstChunk) {
          firstChunk = true; // ✅ JS boolean
          clearTimeout(timer);
        }
        yield chunk;
      }
      clearTimeout(timer);
      return; // completed successfully
    } catch (e) {
      clearTimeout(timer);
      if (timedOut && attempt < maxRetries) {
        attempt += 1;
        continue; // retry once
      } else {
        throw e;
      }
    }
  }
}
