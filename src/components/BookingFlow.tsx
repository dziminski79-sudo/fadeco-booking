"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Loader2 } from "lucide-react";
import { createBooking, fetchSlots } from "@/app/book/actions";
import {
  SHOP,
  formatPrice,
  type Barber,
  type Service,
  type Slot,
} from "@/lib/config";

function shopDateString(offsetDays: number) {
  const base = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: SHOP.timeZone }).format(base);
}

function dayLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return {
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(date),
    day: d,
    month: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(date),
  };
}

const inputClass =
  "w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm outline-none transition-colors focus:border-amber-500";

export default function BookingFlow({
  services,
  barbers,
}: {
  services: Service[];
  barbers: Barber[];
}) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | "any" | null>(null);
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => shopDateString(i)), []);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const service = services.find((s) => s.id === serviceId) ?? null;
  const barber = barbers.find((b) => b.id === (slot?.staffId ?? staffId)) ?? null;

  useEffect(() => {
    if (!serviceId || !staffId || !date) return;
    let cancelled = false;
    fetchSlots({ serviceId, staffId, date }).then((result) => {
      if (!cancelled) setSlots(result);
    });
    return () => {
      cancelled = true;
    };
  }, [serviceId, staffId, date]);

  function resetFrom(step: "service" | "staff" | "date") {
    setSlot(null);
    setSlots(null);
    setError(null);
    if (step === "service") setStaffId(null);
    if (step !== "date") setDate(null);
  }

  function submit() {
    if (!serviceId || !staffId || !date || !slot) return;
    setError(null);
    startTransition(async () => {
      const result = await createBooking({
        serviceId,
        staffId: slot.staffId,
        date,
        startsAt: slot.startsAt,
        ...form,
      });
      if (result.ok) {
        router.push(`/book/confirmed/${result.id}`);
      } else {
        setError(result.error);
        setSlot(null);
        const fresh = await fetchSlots({ serviceId, staffId, date });
        setSlots(fresh);
      }
    });
  }

  const canSubmit = slot && form.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(form.email);

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
      <div className="space-y-10">
        <section>
          <StepTitle n={1} title="Select a service" done={!!serviceId} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setServiceId(s.id);
                  resetFrom("service");
                }}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  serviceId === s.id
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-600"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{s.name}</span>
                  <span className="font-bold text-amber-400">{formatPrice(s.price_cents)}</span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                  <Clock size={12} /> {s.duration_min} min
                </p>
              </button>
            ))}
          </div>
        </section>

        {serviceId && (
          <section>
            <StepTitle n={2} title="Choose your barber" done={!!staffId} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[{ id: "any", name: "First available", bio: "We will match you with an open chair." }, ...barbers].map(
                (b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setStaffId(b.id);
                      resetFrom("staff");
                    }}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      staffId === b.id
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-600"
                    }`}
                  >
                    <span className="font-semibold">{b.name}</span>
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{b.bio}</p>
                  </button>
                ),
              )}
            </div>
          </section>
        )}

        {serviceId && staffId && (
          <section>
            <StepTitle n={3} title="Pick a date and time" done={!!slot} />
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {days.map((d) => {
                const l = dayLabel(d);
                return (
                  <button
                    key={d}
                    onClick={() => {
                      setDate(d);
                      setSlot(null);
                      setSlots(null);
                      setError(null);
                    }}
                    className={`flex w-16 shrink-0 flex-col items-center rounded-lg border py-3 transition-colors ${
                      date === d
                        ? "border-amber-500 bg-amber-500 text-neutral-950"
                        : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-600"
                    }`}
                  >
                    <span className="text-xs uppercase opacity-70">{l.weekday}</span>
                    <span className="text-lg font-bold">{l.day}</span>
                    <span className="text-xs opacity-70">{l.month}</span>
                  </button>
                );
              })}
            </div>

            {date && slots === null && (
              <p className="mt-4 flex items-center gap-2 text-sm text-neutral-400">
                <Loader2 size={16} className="animate-spin" /> Checking availability
              </p>
            )}
            {date && slots && slots.length === 0 && (
              <p className="mt-4 text-sm text-neutral-400">
                No openings on this day. Try another date or barber.
              </p>
            )}
            {slots && slots.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {slots.map((s) => (
                  <button
                    key={s.startsAt}
                    onClick={() => setSlot(s)}
                    className={`rounded-md border py-2.5 text-sm transition-colors ${
                      slot?.startsAt === s.startsAt
                        ? "border-amber-500 bg-amber-500 font-semibold text-neutral-950"
                        : "border-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {slot && (
          <section>
            <StepTitle n={4} title="Your details" done={false} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Full name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className={inputClass}
                type="email"
                placeholder="Email address"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className={inputClass}
                type="tel"
                placeholder="Phone (optional)"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </section>
        )}
      </div>

      <aside className="h-fit rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 lg:sticky lg:top-24">
        <h2 className="font-semibold">Your booking</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Service" value={service?.name} />
          <Row label="Barber" value={barber?.name ?? (staffId === "any" ? "First available" : undefined)} />
          <Row
            label="When"
            value={
              slot
                ? new Intl.DateTimeFormat("en-US", {
                    timeZone: SHOP.timeZone,
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(slot.startsAt))
                : undefined
            }
          />
          <Row label="Total" value={service ? formatPrice(service.price_cents) : undefined} />
        </dl>
        {error && <p className="mt-4 rounded-md bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <button
          disabled={!canSubmit || pending}
          onClick={submit}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending && <Loader2 size={16} className="animate-spin" />}
          Confirm booking
        </button>
        <p className="mt-3 text-center text-xs text-neutral-500">Pay in the shop. Free cancellation.</p>
      </aside>
    </div>
  );
}

function StepTitle({ n, title, done }: { n: number; title: string; done: boolean }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-semibold">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
          done ? "bg-amber-500 text-neutral-950" : "border border-neutral-600 text-neutral-400"
        }`}
      >
        {done ? <Check size={14} /> : n}
      </span>
      {title}
    </h2>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className={value ? "text-right" : "text-neutral-600"}>{value ?? "Not selected"}</dd>
    </div>
  );
}
