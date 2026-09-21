export const SHOP = {
  name: "Fade & Co.",
  timeZone: "America/Chicago",
  slotStepMin: 30,
  minLeadMin: 60,
  maxDaysAhead: 30,
  address: "214 Market Street, Austin, TX",
  phone: "(555) 010-4477",
  email: "hello@fadeandco.example",
} as const;

export type Service = {
  id: string;
  name: string;
  description: string;
  duration_min: number;
  price_cents: number;
};

export type Barber = {
  id: string;
  name: string;
  bio: string;
};

export type Slot = {
  label: string;
  startsAt: string;
  staffId: string;
};

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatInShopTime(
  iso: string,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SHOP.timeZone,
    ...options,
  }).format(new Date(iso));
}
