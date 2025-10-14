
# Changelog

## 1.2.0 — Edge auto-retry
- Added **auto-retry**: if the first stream chunk takes >8s, abort and retry once.
- Keeps Hobby free plan smooth under occasional OpenAI/network slowness.
- Version bump to 1.2.0.

## 1.1.0 — Edge Chat
- /api/chat moved to **Edge runtime** (fetch-based streaming).
- Fewer free-tier timeouts; same UX.
- Stripe endpoints remain Node runtime.

## 1.0.0 — Initial Release
- Next.js app with Mercury chat, remedies, Stripe $19/mo, Supabase schema, legal pages.
- One guest session + two logged-in free sessions.
