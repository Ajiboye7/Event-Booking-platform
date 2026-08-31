"use client";

import { useState } from "react";
import { requestHold, payHold } from "@/lib/api";
import { useSeatCount } from "@/lib/useRealtime";

type Props = {
  eventId: string;
  initialSeatsAvailable: number;
  priceCents: number;
};

type FlowState =
  | { step: "idle" }
  | { step: "held"; holdId: string; expiresAt: string }
  | { step: "paying"; holdId: string }
  | { step: "confirmed" }
  | { step: "sold_out" }
  | { step: "rate_limited"; retryAfterMs: number }
  | { step: "error"; message: string };

export default function BookingWidget({
  eventId,
  initialSeatsAvailable,
  priceCents,
}: Props) {
  const seatsAvailable = useSeatCount(eventId, initialSeatsAvailable);
  const [quantity, setQuantity] = useState(1);
  const [flow, setFlow] = useState<FlowState>({ step: "idle" });

  async function handleBook() {
    const result = await requestHold(eventId, quantity);

    if (!result.ok) {
      if (result.reason === "SOLD_OUT") setFlow({ step: "sold_out" });
      else if (result.reason === "RATE_LIMITED")
        setFlow({ step: "rate_limited", retryAfterMs: result.retryAfterMs });
      else setFlow({ step: "error", message: "Something went wrong. Try again." });
      return;
    }

    setFlow({ step: "held", holdId: result.holdId, expiresAt: result.expiresAt });
  }

  async function handlePay() {
    if (flow.step !== "held") return;
    setFlow({ step: "paying", holdId: flow.holdId });
    await payHold(flow.holdId);
    // TODO: real confirmation should come from the real-time channel once
    // the webhook has actually processed, this is a placeholder.
    setFlow({ step: "confirmed" });
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-2xl font-semibold">
          ${(priceCents / 100).toFixed(2)}
        </span>
        <span
          className={
            seatsAvailable === 0 ? "text-sm text-red-600" : "text-sm text-neutral-500"
          }
        >
          {seatsAvailable === 0 ? "Sold out" : `${seatsAvailable} seats left`}
        </span>
      </div>

      {flow.step === "idle" && (
        <>
          <label className="mb-1 block text-sm text-neutral-600">Quantity</label>
          <input
            type="number"
            min={1}
            max={8}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="mb-4 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
          <button
            onClick={handleBook}
            disabled={seatsAvailable === 0}
            className="w-full rounded-md bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Reserve tickets
          </button>
        </>
      )}

      {flow.step === "held" && (
        <div>
          <p className="mb-3 text-sm text-neutral-600">
            Seats held until {new Date(flow.expiresAt).toLocaleTimeString()}.
            Complete payment before the hold expires.
          </p>
          <button
            onClick={handlePay}
            className="w-full rounded-md bg-neutral-900 py-2.5 text-sm font-medium text-white"
          >
            Pay now
          </button>
        </div>
      )}

      {flow.step === "paying" && (
        <p className="text-sm text-neutral-600">Processing payment…</p>
      )}

      {flow.step === "confirmed" && (
        <p className="text-sm font-medium text-emerald-700">
          Booking confirmed. See it under My bookings.
        </p>
      )}

      {flow.step === "sold_out" && (
        <p className="text-sm text-red-600">
          Those seats just sold out. Try a smaller quantity.
        </p>
      )}

      {flow.step === "rate_limited" && (
        <p className="text-sm text-amber-700">
          Too many attempts — try again in a moment.
        </p>
      )}

      {flow.step === "error" && (
        <p className="text-sm text-red-600">{flow.message}</p>
      )}
    </div>
  );
}
