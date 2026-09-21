create extension if not exists btree_gist;

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  duration_min int not null check (duration_min > 0),
  price_cents int not null check (price_cents >= 0),
  active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text not null default '',
  active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists staff_hours (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  open_time time not null,
  close_time time not null,
  check (close_time > open_time),
  unique (staff_id, weekday)
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id),
  staff_id uuid not null references staff(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null default '',
  notes text not null default '',
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  constraint no_double_booking exclude using gist (
    staff_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status = 'confirmed')
);

create index if not exists bookings_starts_at_idx on bookings (starts_at);

alter table services enable row level security;
alter table staff enable row level security;
alter table staff_hours enable row level security;
alter table bookings enable row level security;

-- No public policies on purpose: the app reads and writes through
-- server-side code using the service role key, so the anon key can
-- never read customer data.

insert into services (name, description, duration_min, price_cents, sort_order)
select * from (values
  ('Classic Haircut', 'Scissor or clipper cut, neck shave, and styling.', 30, 3500, 1),
  ('Skin Fade', 'Precision fade blended to your preferred length on top.', 45, 4500, 2),
  ('Beard Trim & Shape', 'Line-up, trim, and hot towel finish.', 30, 2500, 3),
  ('Haircut + Beard', 'Our most popular combo: full cut and beard work.', 60, 6000, 4),
  ('Hot Towel Shave', 'Traditional straight-razor shave with hot towels.', 30, 3500, 5)
) as v(name, description, duration_min, price_cents, sort_order)
where not exists (select 1 from services);

insert into staff (name, bio, sort_order)
select * from (values
  ('Marcus', 'Master barber, 12 years of experience. Specializes in fades.', 1),
  ('Diego', 'Classic cuts and beard sculpting. Known for his straight-razor work.', 2),
  ('Tyler', 'Modern styles and textured cuts. Loves a clean line-up.', 3)
) as v(name, bio, sort_order)
where not exists (select 1 from staff);

insert into staff_hours (staff_id, weekday, open_time, close_time)
select s.id, d.weekday, d.open_time::time, d.close_time::time
from staff s
cross join (values
  (1, '09:00', '18:00'),
  (2, '09:00', '18:00'),
  (3, '09:00', '18:00'),
  (4, '09:00', '19:00'),
  (5, '09:00', '19:00'),
  (6, '10:00', '16:00')
) as d(weekday, open_time, close_time)
where not exists (select 1 from staff_hours);
