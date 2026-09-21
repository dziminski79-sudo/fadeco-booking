# Fade & Co. Booking

A working online booking system for a barbershop. Concept project built to
demonstrate a full-stack booking flow (not a real client project; the shop is
fictional).

**Live demo:** https://fadeco-booking.vercel.app

## The problem

Small service businesses lose customers to phone tag and walk-in guesswork.
Owners want customers to book themselves, without double bookings and without
paying for a heavy SaaS.

## The solution

- Customers pick a service, a barber (or "first available"), a day, and a time
  slot based on real availability, then confirm in under a minute.
- Availability is computed from each barber's working hours, the service
  duration, and existing bookings, in the shop's time zone.
- Double bookings are impossible: the database itself rejects overlapping
  bookings for the same barber (Postgres exclusion constraint), so two people
  clicking at the same moment cannot both win.
- The owner signs in with a passwordless magic link and sees upcoming
  bookings grouped by day, with cancel actions and basic stats.

## Tech stack

Next.js (App Router, Server Actions), TypeScript, Tailwind CSS, Supabase
(Postgres + Auth), Zod validation, deployed on Vercel.

## Security notes

- Row Level Security is enabled on every table with no public policies. All
  data access goes through server-side code, so the public key can never read
  customer data.
- Server Actions validate input with Zod and re-check availability on the
  server before writing.
- Admin access requires a valid session and an email on an allow-list.

## Run locally

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Copy `.env.example` to `.env.local` and fill in the values.
3. `npm install` then `npm run dev`.

## Possible next steps

Email confirmations and reminders (automation project), rate limiting on the
public booking action, per-barber days off, and online payments.
