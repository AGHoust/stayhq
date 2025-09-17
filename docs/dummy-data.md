# MTL Dummy Listings Dataset

This demo ships with a static, front-end-only dataset of 1,000 Mid-Term Let (MTL) listings to showcase the Houst Direct concept without any backend.

## What's included

- 1,000 listings in `data/listings.json` validated by a strict Zod schema (`src/lib/schemas/listing.ts`).
- Deterministic generator script in `scripts/generate-listings.ts` using seeded randomness.
- In-memory query helpers in `src/lib/listings.ts` for search, filters, and pagination.

## Generation rules

- Cities (exact distribution): London 800, Lisbon 50, Dublin 50, Edinburgh 40, Paris 40, Sydney 20.
- Currency: GBP for all cities (concept simplification, including Sydney).
- Price bands (monthly_rent): London 1-bed £1,700–£2,700; 2-bed £2,200–£3,400. Lisbon £1,200–£2,000. Dublin £1,600–£2,600. Edinburgh £1,400–£2,200. Paris £1,800–£3,000. Sydney £2,000–£3,200.
- Bedrooms: 60% 1-bed, 40% 2-bed. Base nightly = monthly_rent / 30.
- Deposits: 10% holding (charged at booking, non-refundable, applied to Month 1), £500 security hold (auth 2 days before, release 7 days after).
- Cancellation: ≥30 days before → 100%, <30 days before → 50%.
- Payment plan: Stripe monthly billing, card-on-file, dispute ready.
- Agreement: Dropbox Sign LTO, required at ≥30 nights, status pending.
- Screening: Guesty Screening required, status pending.
- Availability: 60 days from today, ~12% blocked, nightly hint ≈ monthly/30.
- Images: Deterministic Picsum URLs per listing id.

## Regenerate

```bash
npm run gen:listings
npm run check:listings
```

## Usage

- Import the dataset statically: `import listings from "@/data/listings.json"`.
- Use the helpers in `src/lib/listings.ts`: `getAllListings()`, `useListings({...})`, `getListingById(id)`.
- 1,000 rows (≈3–5MB) are fine to keep in memory in modern browsers. Memoize filtering; consider virtualization for large grids.

### Pages

- Landing restored to three sections powered by the in-memory dataset:
  - Mid-let Properties (London default)
  - Last-Minute Bargains (next-7-days window)
  - Featured Properties (top-rated fallback)
- Explore Mid-lets lives at the dedicated page (UI-level route/state): `/midlets`, with search, city filters, price range, and pagination.

### Badge System

Dynamic badges are computed per listing using `src/lib/badges.ts`:

- **"Mid-let"**: Always shown for MTL listings (`ui_flags.mtl_badge === true`)
- **"Last-minute"**: Available if there's a valid check-in window in the next 7 days that can satisfy the minimum stay requirement
- **"Available 60+ days"**: If the longest consecutive available streak is ≥60 days
- **"Available 30+ days"**: If the longest consecutive available streak is ≥30 days (but <60)
- **"Featured"**: Placeholder for future marketing flags (not currently implemented)

### UI Improvements

- **Compare Button**: Enhanced visibility with orange background, white border, and always-visible tooltips
- **Stay Type Display**: Clear distinction between booking availability types with color-coded badges

### Booking Flow

The booking system includes client-side validation and price calculation:

- **Calendar Validation**: Uses `src/lib/calendar.ts` helpers to validate date selections against availability and minimum stay requirements
- **Price Breakdown**: Calculates subtotal (sum of nightly prices), cleaning fee, holding deposit (10% of monthly rent, credited to Month 1), and security deposit hold (£500, refundable)
- **Payment Copy**: "Stripe monthly billing • card on file • dispute ready"
- **Booking CTA**: Disabled until valid dates are selected

### Compare Page

The compare functionality supports both legacy Property and new Listing types:

- **Deposits Summary**: Shows holding deposit and security deposit amounts for MTL listings
- **Earliest Valid Window**: Displays the next available 30-day consecutive period
- **Badges**: Same dynamic badge system as property cards
- **Stay Type Availability**: Shows whether properties accept "Mid-let only", "Short-stay only", or "Both" booking types
- **Mixed Types**: Handles both legacy properties and new MTL listings in the same comparison table

### Stay Type Availability

Properties can have different booking availability types:

- **"Mid-let only"**: Only accepts bookings of 30+ nights (default for MTL listings)
- **"Short-stay only"**: Only accepts bookings of <30 nights
- **"Both"**: Accepts both short-stay and mid-term bookings

**DEV NOTE**: The `stay_type_availability` field in `ui_flags` is dummy data for demo purposes. In production, this should be pulled from Looker tables based on actual booking rules and property configurations.

## Swapping to real APIs later

- Replace the static import with a fetch call to your API.
- Move the Zod `ListingSchema` server-side to validate payloads; keep a `Listing` TypeScript type on the client.
- For >5–10k results, consider indexed search (e.g., FlexSearch/Lunr) or a Web Worker.

