import type { Listing } from '@/lib/schemas/listing';

export function getLongestAvailableStreak(listing: Listing): number {
  let longest = 0;
  let current = 0;
  for (const day of listing.availability) {
    if (!day.is_blocked) {
      current += 1;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
  }
  return longest;
}

export function hasLastMinuteWindow(listing: Listing): boolean {
  const today = new Date();
  const in7 = new Date();
  in7.setDate(today.getDate() + 7);

  // Map availability by date for quick lookup
  const byDate = new Map<string, { is_blocked: boolean; min_stay_nights: number }>();
  for (const d of listing.availability) byDate.set(d.date, { is_blocked: d.is_blocked, min_stay_nights: d.min_stay_nights });

  for (let i = 0; i < 8; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d > in7) break;
    const dateStr = d.toISOString().slice(0, 10);
    const meta = byDate.get(dateStr);
    if (!meta || meta.is_blocked) continue;
    const minStay = meta.min_stay_nights;

    // Count consecutive available days from this date
    let streak = 0;
    for (let j = 0; j < 120; j++) {
      const dd = new Date(d);
      dd.setDate(d.getDate() + j);
      const s = dd.toISOString().slice(0, 10);
      const m = byDate.get(s);
      if (!m || m.is_blocked) break;
      streak += 1;
      if (streak >= minStay) return true;
    }
  }
  return false;
}

export function getBadges(listing: Listing): string[] {
  const badges: string[] = [];
  if (listing.ui_flags.mtl_badge) badges.push('Mid-let');

  // Short Stay Available pill for listings that support both stay types
  if (listing.ui_flags.stay_type_availability === 'both') {
    badges.push('Short Stay Available');
  }

  // Featured: placeholder marketing flag (not in schema). Fallback by rating top 5% is not computable locally without full dataset metrics here.
  // Consumers can add 'Featured' contextually if needed; we skip unless added via UI flag later.

  if (hasLastMinuteWindow(listing)) badges.push('Last-minute');

  const longest = getLongestAvailableStreak(listing);
  if (longest >= 60) badges.push('Available 60+ days');
  else if (longest >= 30) badges.push('Available 30+ days');

  return badges;
}


