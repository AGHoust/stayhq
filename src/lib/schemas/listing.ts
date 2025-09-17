import { z } from "zod";

export const BedConfig = z.object({
  room: z.string(),
  beds: z.array(z.string()).min(1),
});

export const ListingSchema = z.object({
  id: z.string().regex(/^HOUST-MTL-\d{4}$/),
  platform: z.literal("Houst Direct"),
  airbnb_listing_id: z.string().nullable(),

  title: z.string().min(10),
  summary: z.string().min(10),
  description: z.string().min(60),

  hero_image: z.string().url(),
  images: z.array(z.string().url()).min(4),

  amenities: z.array(z.string()).min(6),

  address_line1: z.string().nullable(),
  address_line2: z.string().nullable(),
  postcode: z.string().nullable(),
  city: z.enum(["London", "Lisbon", "Dublin", "Edinburgh", "Paris", "Sydney", "Auckland"]),
  country: z.string(),
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),

  bedrooms: z.number().int().min(1).max(2),
  bed_configuration: z.array(BedConfig).min(1),
  bathrooms: z.number().int().min(1).max(2),
  max_guests: z.number().int().min(1).max(4),

  check_in_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  check_out_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  house_rules: z.string().nullable(),
  registration_number: z.string().nullable(),

  price_currency: z.literal("GBP"),
  monthly_rent: z.number().positive(),
  base_nightly: z.number().positive(),
  minimum_stay_nights: z.number().int().min(1),

  fees: z.object({
    cleaning_fee: z.number().nonnegative(),
    service_fee: z.number().nonnegative(),
    admin_fee: z.number().nonnegative(),
    tax_rate_pct: z.number().min(0).max(25),
  }),

  deposits: z.object({
    holding_deposit: z.object({
      percentage: z.number().min(5).max(20),
      charged_at_booking: z.boolean(),
      non_refundable: z.boolean(),
      applied_to_rent: z.boolean(),
      label: z.string(),
    }),
    security_deposit: z.object({
      type: z.enum(["hold","charge"]),
      amount: z.number().positive(),
      authorize_days_before_checkin: z.number().int().min(0).max(10),
      release_days_after_checkout: z.number().int().min(1).max(30),
      label: z.string(),
    })
  }),

  cancellation_policy: z.object({
    name: z.string(),
    rules: z.array(z.object({
      window: z.string(),
      refund: z.string(),
    })).length(2),
    display_text: z.string(),
  }),

  payment_plan: z.object({
    type: z.literal("monthly_billing"),
    provider: z.literal("Stripe"),
    payment_method_types: z.array(z.string()).min(1),
    dispute_ready: z.boolean(),
  }),

  agreement: z.object({
    lto_required: z.boolean(),
    threshold_nights: z.number().int().min(1),
    provider: z.literal("Dropbox Sign"),
    template_id: z.string(),
    lto_status: z.enum(["pending","signed","not_required"]),
  }),

  screening: z.object({
    required: z.boolean(),
    provider: z.string(),
    status: z.enum(["pending","approved","failed"]),
  }),

  availability: z.array(z.object({
    date: z.string(),
    is_blocked: z.boolean(),
    min_stay_nights: z.number().int().min(1),
    nightly_price_hint: z.number().positive().optional(),
    unavailable_reason: z.string().optional(),
  })).min(365),

  reviews: z.object({
    rating_avg: z.number().min(3.5).max(5),
    review_count: z.number().int().min(0).max(200),
  }),

  ui_flags: z.object({
    mtl_badge: z.boolean(),
    show_monthly_toggle: z.boolean(),
    show_deposit_breakdown: z.boolean(),
    show_agreement_step: z.boolean(),
    show_screening_step: z.boolean(),
    // DEV NOTE: stay_type_availability is a dummy field for demo purposes
    // In production, this should be pulled from Looker tables based on actual booking rules
    // Values: "mtl_only" (30+ nights only), "short_stay_only" (<30 nights only), "both" (flexible)
    stay_type_availability: z.enum(["mtl_only", "short_stay_only", "both"]).default("mtl_only"),
  })
});

export type Listing = z.infer<typeof ListingSchema>;

