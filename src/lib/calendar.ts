import type { Listing } from '@/lib/schemas/listing';

export type CalendarDay = {
  date: string;
  available: boolean;
  price: number;
  minStay: number;
};

export function toCalendarDays(listing: Listing): CalendarDay[] {
  return listing.availability.map((d) => ({
    date: d.date,
    available: !d.is_blocked,
    price: d.nightly_price_hint ?? Number((listing.monthly_rent / 30).toFixed(2)),
    minStay: d.min_stay_nights,
  }));
}

export function diffDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function validateSelection(listing: Listing, checkIn: Date, checkOut: Date): { ok: true } | { ok: false; minStay: number } {
  const days = toCalendarDays(listing);
  const byDate = new Map(days.map((d) => [d.date, d] as const));
  const nights = diffDays(checkIn, checkOut);
  if (nights <= 0) return { ok: false, minStay: listing.minimum_stay_nights };

  let maxMinStay = 0;
  for (let i = 0; i < nights; i++) {
    const d = new Date(checkIn);
    d.setDate(checkIn.getDate() + i);
    const s = d.toISOString().slice(0, 10);
    const info = byDate.get(s);
    if (!info || !info.available) return { ok: false, minStay: listing.minimum_stay_nights };
    if (info.minStay > maxMinStay) maxMinStay = info.minStay;
  }

  if (nights < Math.max(maxMinStay, listing.minimum_stay_nights)) {
    return { ok: false, minStay: Math.max(maxMinStay, listing.minimum_stay_nights) };
  }

  return { ok: true };
}

export function calculateBreakdown(listing: Listing, checkIn: Date, checkOut: Date) {
  const days = toCalendarDays(listing);
  const byDate = new Map(days.map((d) => [d.date, d] as const));
  const nights = diffDays(checkIn, checkOut);
  let subtotal = 0;
  for (let i = 0; i < nights; i++) {
    const d = new Date(checkIn);
    d.setDate(checkIn.getDate() + i);
    const s = d.toISOString().slice(0, 10);
    const info = byDate.get(s);
    if (!info || !info.available) continue;
    subtotal += info.price;
  }
  const cleaning = listing.fees.cleaning_fee;
  const holdingDeposit = Math.round(listing.monthly_rent * 0.10);
  const securityHold = listing.deposits.security_deposit.amount;
  const total = Math.round(subtotal + cleaning);

  return {
    nights,
    subtotal,
    cleaning,
    holdingDeposit,
    securityHold,
    total,
    copy: 'Stripe monthly billing • card on file • dispute ready',
  };
}

export function findEarliestValidWindow(listing: Listing, minNights: number = 30): { start: Date; end: Date } | null {
  const days = toCalendarDays(listing);
  const byDate = new Map(days.map((d) => [d.date, d] as const));
  
  // Start from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check up to 120 days ahead
  for (let i = 0; i < 120; i++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + i);
    const startStr = startDate.toISOString().slice(0, 10);
    
    const startDay = byDate.get(startStr);
    if (!startDay || !startDay.available) continue;
    
    // Check if we can get minNights consecutive days from this start
    let consecutiveDays = 0;
    let endDate = new Date(startDate);
    
    for (let j = 0; j < minNights; j++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + j);
      const checkStr = checkDate.toISOString().slice(0, 10);
      
      const checkDay = byDate.get(checkStr);
      if (!checkDay || !checkDay.available) break;
      
      consecutiveDays++;
      endDate = new Date(checkDate);
    }
    
    if (consecutiveDays >= minNights) {
      return { start: startDate, end: endDate };
    }
  }
  
  return null;
}


