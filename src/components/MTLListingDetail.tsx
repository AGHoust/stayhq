import React, { useMemo, useState } from 'react';
import type { Listing } from '@/lib/schemas/listing';
import { getBadges } from '@/lib/badges';
import { calculateBreakdown, validateSelection } from '@/lib/calendar';

interface Props {
  listing: Listing;
  onBack: () => void;
}

const MTLListingDetail: React.FC<Props> = ({ listing, onBack }) => {
  const badges = useMemo(() => getBadges(listing), [listing]);
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [error, setError] = useState<string>('');

  const parsedCheckIn = checkIn ? new Date(checkIn) : null;
  const parsedCheckOut = checkOut ? new Date(checkOut) : null;

  const valid = useMemo(() => {
    if (!parsedCheckIn || !parsedCheckOut) return null;
    const res = validateSelection(listing, parsedCheckIn, parsedCheckOut);
    if (res.ok) return { ok: true as const };
    return { ok: false as const, minStay: res.minStay };
  }, [listing, checkIn, checkOut]);

  const breakdown = useMemo(() => {
    if (!parsedCheckIn || !parsedCheckOut) return null;
    if (valid && (valid as any).ok === false) return null;
    return calculateBreakdown(listing, parsedCheckIn, parsedCheckOut);
  }, [listing, parsedCheckIn, parsedCheckOut, valid]);

  const onDatesChange = (type: 'in' | 'out', value: string) => {
    if (type === 'in') setCheckIn(value); else setCheckOut(value);
    setError('');
  };
  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onBack} className="text-petrol font-semibold">Back to results</button>
          <div className="text-ink font-bold">{listing.city}</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-2">
              {badges.map((b) => (
                <span key={b} className="bg-petrol text-white px-3 py-1 rounded-full text-sm font-semibold">{b}</span>
              ))}
            </div>
            <img src={listing.hero_image} alt={listing.title} className="w-full h-80 object-cover rounded-xl" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              {listing.images.slice(0, 6).map((src, i) => (
                <img key={i} src={src} alt={`${listing.title}-${i}`} className="w-full h-32 object-cover rounded-lg" />
              ))}
            </div>

            <h1 className="text-3xl font-bold text-ink mt-6">{listing.title}</h1>
            <p className="text-muted mt-2">{listing.summary}</p>
            <p className="text-ink mt-4 leading-relaxed">{listing.description}</p>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-ink mb-2">Deposits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-xl p-4 bg-card">
                  <div className="font-semibold text-ink mb-1">Holding deposit</div>
                  <div className="text-sm text-muted">{listing.deposits.holding_deposit.label}</div>
                  <div className="text-sm text-ink mt-2">{listing.deposits.holding_deposit.percentage}% at booking • applied to Month 1 • non-refundable</div>
                </div>
                <div className="border border-border rounded-xl p-4 bg-card">
                  <div className="font-semibold text-ink mb-1">Security deposit</div>
                  <div className="text-sm text-muted">{listing.deposits.security_deposit.label}</div>
                  <div className="text-sm text-ink mt-2">£{listing.deposits.security_deposit.amount} {listing.deposits.security_deposit.type} • auth {listing.deposits.security_deposit.authorize_days_before_checkin} days before • release {listing.deposits.security_deposit.release_days_after_checkout} days after</div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-ink mb-2">Agreement</h2>
              <div className="border border-border rounded-xl p-4 bg-card">
                <div>Dropbox Sign LTO required for stays ≥ {listing.agreement.threshold_nights} nights • status: {listing.agreement.lto_status}</div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-ink mb-2">Screening</h2>
              <div className="border border-border rounded-xl p-4 bg-card">
                <div>{listing.screening.provider} • status: {listing.screening.status}</div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-ink mb-2">Cancellation policy</h2>
              <div className="border border-border rounded-xl p-4 bg-card">
                <div className="font-semibold">{listing.cancellation_policy.name}</div>
                <ul className="list-disc pl-5 mt-2 text-ink">
                  {listing.cancellation_policy.rules.map((r, i) => (
                    <li key={i}>{r.window}: {r.refund}</li>
                  ))}
                </ul>
                <div className="text-sm text-muted mt-2">{listing.cancellation_policy.display_text}</div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-ink mb-2">Availability (next 60 days)</h2>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {listing.availability.map((a) => (
                  <div key={a.date} className={`p-2 rounded ${a.is_blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`} title={`${a.date} ${a.is_blocked ? 'Blocked' : 'Available'}`}>
                    {a.date.slice(5)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="text-3xl font-bold text-ink">£{listing.monthly_rent.toLocaleString()}<span className="text-lg text-muted font-normal">/month</span></div>
              <div className="text-sm text-muted mt-1">Base nightly ≈ £{listing.base_nightly.toFixed(2)}</div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm text-ink mb-1">Check-in</label>
                  <input type="date" value={checkIn} onChange={(e) => onDatesChange('in', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-ink mb-1">Check-out</label>
                  <input type="date" value={checkOut} onChange={(e) => onDatesChange('out', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2" />
                </div>
                {valid && (valid as any).ok === false && (
                  <div className="text-ember text-sm">Minimum stay is {(valid as any).minStay} nights for these dates.</div>
                )}
              </div>

              {breakdown && (
                <div className="mt-5 pt-5 border-t border-border text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>£{Math.round(breakdown.subtotal).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Cleaning fee</span><span>£{breakdown.cleaning.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Holding deposit (credited)</span><span>£{breakdown.holdingDeposit.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Security deposit hold</span><span>£{breakdown.securityHold.toLocaleString()}</span></div>
                  <div className="flex justify-between font-semibold mt-2"><span>Total</span><span>£{breakdown.total.toLocaleString()}</span></div>
                  <div className="text-muted mt-2">{breakdown.copy}</div>
                </div>
              )}

              <button disabled={!breakdown} className="mt-5 w-full bg-petrol text-white py-3 rounded-lg font-semibold disabled:opacity-50">Start booking</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MTLListingDetail;


