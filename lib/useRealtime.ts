"use client";

import { useEffect, useState } from "react";

// Minimal client for the real-time channel described in API_CONTRACT.md.
// Backend transport (WebSocket vs SSE, pub/sub mechanism) is unspecified on
// purpose — this hook only assumes it'll receive JSON messages shaped like:
//   { type: "SEAT_COUNT_UPDATED", eventId, seatsAvailable }
//   { type: "HOLD_EXPIRING_SOON", holdId, secondsLeft }

type RealtimeMessage =
  | { type: "SEAT_COUNT_UPDATED"; eventId: string; seatsAvailable: number }
  | { type: "HOLD_EXPIRING_SOON"; holdId: string; secondsLeft: number };

export function useSeatCount(eventId: string, initialCount: number) {
  const [seatsAvailable, setSeatsAvailable] = useState(initialCount);

  useEffect(() => {
    // TODO: point this at your real-time endpoint once the backend exists.
    // const socket = new WebSocket(`${WS_BASE}/api/ws`);
    // socket.onmessage = (event) => {
    //   const msg: RealtimeMessage = JSON.parse(event.data);
    //   if (msg.type === "SEAT_COUNT_UPDATED" && msg.eventId === eventId) {
    //     setSeatsAvailable(msg.seatsAvailable);
    //   }
    // };
    // return () => socket.close();
  }, [eventId]);

  return seatsAvailable;
}

export function useHoldExpiry(holdId: string | null) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!holdId) return;
    // TODO: subscribe to HOLD_EXPIRING_SOON messages for this holdId.
  }, [holdId]);

  return secondsLeft;
}
