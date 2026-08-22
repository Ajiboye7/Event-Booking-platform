import Link from "next/link";
//import { listEvents } from "@/lib/api";
import { listEvents } from "../../lib/api";

export default async function EventsPage() {
  let events: Awaited<ReturnType<typeof listEvents>>["events"] = [];
  let loadError = false;

  try {
    const data = await listEvents();
    events = data.events;
  } catch {
    loadError = true;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Upcoming events</h1>

      {loadError && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Couldn't load events — backend isn't wired up yet. This page will
          populate once <code>GET /api/events</code> is implemented.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="rounded-lg border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 hover:shadow-sm"
          >
            <h2 className="font-medium">{event.title}</h2>
            <p className="mt-1 text-sm text-neutral-500">{event.venue}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-neutral-500">
                {new Date(event.startsAt).toLocaleDateString()}
              </span>
              <span
                className={
                  event.seatsAvailable === 0
                    ? "font-medium text-red-600"
                    : "font-medium text-neutral-900"
                }
              >
                {event.seatsAvailable === 0
                  ? "Sold out"
                  : `${event.seatsAvailable} seats left`}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
