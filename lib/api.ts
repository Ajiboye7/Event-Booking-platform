// Thin fetch wrapper matching API_CONTRACT.md.
// Swap NEXT_PUBLIC_API_BASE for your deployed API origin if it's separate
// from the Next.js app.

const BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export type EventSummary = {
  id: string;
  title: string;
  venue: string;
  startsAt: string;
  seatsAvailable: number;
  totalSeats: number;
  priceCents: number;
};

export type EventDetail = EventSummary & { description: string };

export async function listEvents(cursor?: string) {
  const url = new URL(`${BASE}/api/events`, "http://placeholder");
  if (cursor) url.searchParams.set("cursor", cursor);
  const res = await fetch(url.pathname + url.search, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load events");
  return res.json() as Promise<{ events: EventSummary[]; nextCursor: string | null }>;
}

export async function getEvent(id: string) {
  const res = await fetch(`${BASE}/api/events/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load event");
  return res.json() as Promise<EventDetail>;
}

export async function requestHold(eventId: string, quantity: number) {
  const res = await fetch(`${BASE}/api/events/${eventId}/hold`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  const body = await res.json();
  if (res.status === 409) return { ok: false as const, reason: "SOLD_OUT", ...body };
  if (res.status === 429) return { ok: false as const, reason: "RATE_LIMITED", ...body };
  if (!res.ok) return { ok: false as const, reason: "UNKNOWN", ...body };
  return { ok: true as const, ...body };
}

export async function payHold(holdId: string) {
  const res = await fetch(`${BASE}/api/holds/${holdId}/pay`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to start payment");
  return res.json();
}

export async function listMyBookings(cursor?: string) {
  const url = new URL(`${BASE}/api/me/bookings`, "http://placeholder");
  if (cursor) url.searchParams.set("cursor", cursor);
  const res = await fetch(url.pathname + url.search, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load bookings");
  return res.json();
}
