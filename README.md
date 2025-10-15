# Mercury v2.1.0 — Exploratory Recalibrator

- Exploratory, multi-turn dialogue (pre + ask + optional hint)
- Thinking animation (no streaming) so the UI feels alive
- Live char/token counters and input limit
- Edge runtime API (`/api/chat`), non-streaming with retry and guards
- Single-source config in `lib/config.ts`

## Deploy
1) Set `OPENAI_API_KEY` in Vercel → Project → Settings → Environment Variables.
2) Push to GitHub or upload this zip; Vercel will deploy.
3) Visit `/chat`.

## Notes
- Toggle `DEBUG` in `lib/config.ts` to surface detailed error messages.
- Adjust token caps / char limits in `lib/config.ts` to control cost and UX.
