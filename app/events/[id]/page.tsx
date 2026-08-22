import { getEvent } from "@/lib/api";
import BookingWidget from "@/components/BookingWidget";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let event;
  try {
    event = await getEvent(id);
  } catch {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Couldn't load this event — backend isn't wired up yet.
      </p>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
        <p className="mt-1 text-neutral-500">
          {event.venue} · {new Date(event.startsAt).toLocaleString()}
        </p>
        <p className="mt-6 leading-relaxed text-neutral-700">{event.description}</p>
      </div>

      <div>
        <BookingWidget
          eventId={event.id}
          initialSeatsAvailable={event.seatsAvailable}
          priceCents={event.priceCents}
        />
      </div>
    </div>
  );
}
