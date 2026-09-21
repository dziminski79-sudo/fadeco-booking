import Link from "next/link";
import { CalendarCheck, Clock, MapPin, MousePointerClick, Scissors, UserRound } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getBarbers, getServices } from "@/lib/data";
import { SHOP, formatPrice } from "@/lib/config";

export const dynamic = "force-dynamic";

const steps = [
  { icon: Scissors, title: "Pick a service", text: "Choose the cut or shave you want." },
  { icon: UserRound, title: "Choose your barber", text: "Or let us match you with the first available chair." },
  { icon: CalendarCheck, title: "Lock in a time", text: "See real availability and confirm in seconds." },
];

const hours = [
  ["Mon to Wed", "9:00 AM to 6:00 PM"],
  ["Thu and Fri", "9:00 AM to 7:00 PM"],
  ["Saturday", "10:00 AM to 4:00 PM"],
  ["Sunday", "Closed"],
];

export default async function Home() {
  const [services, barbers] = await Promise.all([getServices(), getBarbers()]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-neutral-900">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.16),transparent_55%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1.2fr_1fr] md:py-32">
            <div className="flex flex-col justify-center gap-6">
              <span className="w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-amber-400">
                Barbershop in Austin, TX
              </span>
              <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                Sharp cuts.
                <br />
                <span className="text-amber-400">Zero waiting.</span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-neutral-400">
                Pick your barber, see live availability, and book your chair in
                under a minute. No calls, no walk-in gamble.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/book"
                  className="rounded-md bg-amber-500 px-6 py-3.5 text-center text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-400"
                >
                  Book Your Appointment
                </Link>
                <Link
                  href="#services"
                  className="rounded-md border border-neutral-700 px-6 py-3.5 text-center text-sm font-semibold transition-colors hover:border-neutral-500"
                >
                  View Services
                </Link>
              </div>
            </div>
            <div className="hidden items-center md:flex">
              <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-2xl">
                <p className="text-xs uppercase tracking-widest text-neutral-500">Next available</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {["10:00 AM", "10:30 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"].map((t, i) => (
                    <span
                      key={t}
                      className={`rounded-md border px-2 py-2 text-center text-sm ${
                        i === 2
                          ? "border-amber-500 bg-amber-500 font-semibold text-neutral-950"
                          : "border-neutral-700 text-neutral-300"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm text-neutral-400">
                  <MousePointerClick size={16} className="text-amber-400" />
                  Tap a time to reserve it
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="mt-2 text-neutral-400">Straightforward pricing, no surprises.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.id}
                className="flex items-start justify-between gap-6 rounded-xl border border-neutral-800 bg-neutral-900/40 p-6"
              >
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="mt-1 text-sm text-neutral-400">{s.description}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500">
                    <Clock size={13} /> {s.duration_min} min
                  </p>
                </div>
                <p className="text-xl font-bold text-amber-400">{formatPrice(s.price_cents)}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="barbers" className="border-y border-neutral-900 bg-neutral-900/30 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-bold tracking-tight">Meet the barbers</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {barbers.map((b) => (
                <div key={b.id} className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-xl font-bold text-amber-400">
                    {b.name[0]}
                  </span>
                  <h3 className="mt-4 font-semibold">{b.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-400">{b.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight">Booking takes 3 steps</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-neutral-950">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="font-semibold">
                    {i + 1}. {title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="visit" className="border-t border-neutral-900 bg-neutral-900/30 py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Visit the shop</h2>
              <p className="mt-6 flex items-center gap-3 text-neutral-300">
                <MapPin size={18} className="text-amber-400" /> {SHOP.address}
              </p>
              <p className="mt-3 text-neutral-400">{SHOP.phone}</p>
              <Link
                href="/book"
                className="mt-8 inline-block rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-400"
              >
                Reserve a chair
              </Link>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <h3 className="flex items-center gap-2 font-semibold">
                <Clock size={16} className="text-amber-400" /> Opening hours
              </h3>
              <dl className="mt-4 divide-y divide-neutral-800 text-sm">
                {hours.map(([day, time]) => (
                  <div key={day} className="flex justify-between py-3">
                    <dt className="text-neutral-400">{day}</dt>
                    <dd>{time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
