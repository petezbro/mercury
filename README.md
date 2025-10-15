# Mercury v2.0.0 — Conversation Recalibrator

- Single-source config in `lib/config.ts`
- Non-streaming completions with one retry and 12s timeout
- Chat-only tone selection; multi-tone blending via freeform words
- Emotion pre-hint & recalibration driven by system prompt
- Uses `max_completion_tokens` (modern param)
- Edge runtime API at `/api/chat`

## Deploy
1. Set `OPENAI_API_KEY` in Vercel (Production).
2. Import repo or upload zip → Deploy.
3. Visit `/chat`.
