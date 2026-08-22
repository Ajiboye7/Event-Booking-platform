import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Booking Platform",
  description: "Event ticket booking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/events" className="font-semibold tracking-tight">
              Booking Platform
            </Link>
            <nav className="flex gap-6 text-sm text-neutral-600">
              <Link href="/events" className="hover:text-neutral-900">
                Events
              </Link>
              <Link href="/my-bookings" className="hover:text-neutral-900">
                My bookings
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
