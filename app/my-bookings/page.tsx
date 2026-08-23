import {listMyBookings} from '../../lib/api'

export default async function MyBookingsPage() {
  let bookings: any[] = [];
  let loadError = false;

  try {
    const data = await listMyBookings();
    bookings = data.bookings ?? [];
  } catch {
    loadError = true;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">My bookings</h1>

      {loadError && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Couldn't load bookings — backend isn't wired up yet. Incorporate the backend and see the data here
        </p>
      )}

      {!loadError && bookings.length === 0 && (
        <p className="text-sm text-neutral-500">No bookings yet.</p>
      )}

      <ul className="space-y-3">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="rounded-lg border border-neutral-200 bg-white p-4 text-sm"
          >
            <div className="flex justify-between">
              <span className="font-medium">{booking.eventTitle}</span>
              <span className="text-neutral-500">Qty {booking.quantity}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
