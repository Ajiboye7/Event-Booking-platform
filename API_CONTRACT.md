# API Contract — Event Ticket Booking Platform

This is the contract the frontend is built against. Your job is to make the
backend actually honor it under real concurrency — not just return the right
shape on a single happy-path request.

Every route below notes **which hard problem lives there**, so you know what
you're actually being tested on when you implement it.

---

## `GET /api/events`
List events, paginated.

**Query params:** `cursor` (opaque string, optional), `limit` (default 20)

**Response 200:**
```json
{
  "events": [
    {
      "id": "evt_123",
      "title": "string",
      "venue": "string",
      "startsAt": "ISO8601",
      "seatsAvailable": 42,
      "totalSeats": 500,
      "priceCents": 2500
    }
  ],
  "nextCursor": "string|null"
}
```
> **Hard problem here:** cursor-based pagination. Don't use `skip/limit` —
> seed enough fake events (10k+) that you can actually feel why `skip` gets
> slow and why concurrent inserts make `skip/limit` return duplicates/gaps.

---

## `GET /api/events/:id`
Single event detail.

**Response 200:** same shape as one item above, plus `description`.

---

## `POST /api/events/:id/hold`
Attempt to reserve N seats. This is **the** endpoint — everything hard in
this project happens here or downstream of here.

**Request:**
```json
{ "quantity": 2 }
```

**Response 201 (success):**
```json
{ "holdId": "hold_abc", "expiresAt": "ISO8601", "quantity": 2 }
```

**Response 409 (not enough seats):**
```json
{ "error": "SOLD_OUT", "seatsAvailable": 1 }
```

**Response 429 (rate limited):**
```json
{ "error": "RATE_LIMITED", "retryAfterMs": 4000 }
```

> **Hard problems here:**
> - **Race condition / overselling** — this must be safe when hundreds of
>   these arrive concurrently for the same event. Read-check-then-write
>   will NOT pass the acceptance test. Look into atomic conditional updates.
> - **Rate limiting** — per-user, per-event. A bot firing this in a loop
>   should get 429s, not a bigger chance at the last seat.

---

## `POST /api/holds/:id/pay`
Simulate initiating payment for a hold (kicks off the fake payment provider,
which will call the webhook below asynchronously — possibly more than once).

**Response 202:**
```json
{ "status": "PROCESSING" }
```

---

## `POST /api/webhooks/payment`
Simulated payment provider calling back. **You control this simulator** —
build it to sometimes deliver the same event 2–5 times, out of order, with
random delay, because that's what real providers do.

**Request:**
```json
{
  "providerEventId": "evt_provider_xyz",
  "type": "payment.succeeded",
  "holdId": "hold_abc"
}
```

**Response 200:** always, fast, regardless of whether this is a duplicate —
the provider should never be made to retry because you were slow to answer.

> **Hard problems here:**
> - **Idempotency** — same `providerEventId` arriving 5 times must result in
>   exactly one booking confirmation.
> - **Transactions** — confirming a hold → creating a booking must be atomic.
>   If your process dies after step 1 but before step 2, on restart the
>   system must recover cleanly, not double-book or lose the seat forever.

---

## `GET /api/me/bookings`
Current user's confirmed bookings, paginated (same cursor approach as events).

---

## `GET /api/me/notifications`
Missed/unread notifications for reconnect scenarios (real-time delivery is
separate — see below).

---

## Real-time channel (WebSocket or SSE) — `/api/ws`
Not a REST endpoint, but part of the contract. Two message types the client
must handle:

```json
{ "type": "SEAT_COUNT_UPDATED", "eventId": "evt_123", "seatsAvailable": 41 }
```
```json
{ "type": "HOLD_EXPIRING_SOON", "holdId": "hold_abc", "secondsLeft": 60 }
```

> **Hard problem here:** this must be decoupled from the request/response
> cycle of `/hold` and the webhook handler — neither of those endpoints
> should block waiting on a socket push. Think pub/sub.

---

## Background job: hold expiry
Not an HTTP endpoint at all — a job that runs independently of any request,
finds `PENDING` holds past `expiresAt`, releases the seats, and notifies the
user. **Not a `setTimeout` in your Express/Next process** — it must survive
a server restart (i.e., an in-memory timer is disqualified by definition;
holds are persisted in Postgres precisely so this job can recover after a
crash).

---

## What's deliberately NOT specified

I'm not telling you the locking strategy for `/hold`, the queue technology
for expiry, or the pub/sub mechanism for real-time. That's the actual
assignment. Come back once you've got a first attempt and I'll review it.
