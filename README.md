# Event Ticket Booking Platform — scaffold

## What's here (frontend, done for you)
- `app/events` — event list + detail pages
- `app/my-bookings` — booking history page
- `components/BookingWidget.tsx` — the hold → pay → confirm flow, client-side
- `lib/api.ts` — typed fetch calls matching `API_CONTRACT.md`
- `lib/useRealtime.ts` — stub hook for the real-time channel (TODO markers
  show exactly where to wire in your WebSocket/SSE client)

All frontend calls assume the API routes in `API_CONTRACT.md` exist. Right
now they don't — every page will show the "backend isn't wired up yet"
fallback until you build the routes.

## What's here (data model, done for you)
- `prisma/schema.prisma` — Postgres schema with comments explaining *why*
  each field/constraint exists, without telling you the algorithm

## What's NOT here (this is the actual project)
- `app/api/*` route handlers — you write these
- The atomic seat-decrement logic for `/hold`
- The webhook idempotency handling for `/webhooks/payment`
- The background job for hold expiry
- The real-time pub/sub wiring
- The rate limiter
- The load-test / concurrency test scripts described in the acceptance
  criteria

## Setup
```bash
npm install
cp .env.example .env   # set DATABASE_URL to your Postgres instance
npx prisma migrate dev --name init
npm run dev
```

Come back to the conversation once you've got a first attempt at
`POST /api/events/:id/hold` — bring your approach, not just "it doesn't
work," and we'll go through it like a code review.
