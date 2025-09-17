import { writeFileSync } from 'fs';
import { z } from 'zod';
import { ListingSchema } from '../src/lib/schemas/listing';
import seedrandom from 'seedrandom';

// Seeded random number generator for deterministic results
function createSeededRng(seed: string) {
  const rng = seedrandom(seed);
  return () => rng();
}

// Helper to round to 2 decimal places
function roundTo(num: number, decimals: number): number {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// City distribution: 2000 total - London 70%, others spread evenly
const CITY_DISTRIBUTION = [
  ...Array(1400).fill('London'),    // 70% of 2000
  ...Array(120).fill('Lisbon'),     // 6%
  ...Array(120).fill('Dublin'),     // 6%
  ...Array(100).fill('Edinburgh'),  // 5%
  ...Array(100).fill('Paris'),      // 5%
  ...Array(80).fill('Sydney'),      // 4%
  ...Array(80).fill('Auckland'),    // 4%
];

// Price bands by city and bedroom count
const PRICE_BANDS = {
  London: { 1: [1700, 2700], 2: [2200, 3400] },
  Lisbon: { 1: [1200, 2000], 2: [1200, 2000] },
  Dublin: { 1: [1600, 2600], 2: [1600, 2600] },
  Edinburgh: { 1: [1400, 2200], 2: [1400, 2200] },
  Paris: { 1: [1800, 3000], 2: [1800, 3000] },
  Sydney: { 1: [2000, 3200], 2: [2000, 3200] },
  Auckland: { 1: [1800, 2800], 2: [2300, 3500] },
};

// Coordinate bounds by city (accurate geographic bounds)
const COORDINATES = {
  London: { lat: [51.30, 51.65], lng: [-0.50, 0.30] },
  Lisbon: { lat: [38.68, 38.80], lng: [-9.25, -9.05] },
  Dublin: { lat: [53.30, 53.42], lng: [-6.40, -6.10] },
  Edinburgh: { lat: [55.90, 56.00], lng: [-3.35, -3.10] },
  Paris: { lat: [48.80, 48.90], lng: [2.25, 2.43] },
  Sydney: { lat: [-33.92, -33.84], lng: [151.10, 151.28] },
  Auckland: { lat: [-36.95, -36.75], lng: [174.70, 174.90] },
};

// Common amenities pool
const AMENITIES_POOL = [
  'Wi-Fi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating',
  'TV', 'Cable TV', 'Laptop friendly workspace', 'Iron', 'Hair dryer',
  'Hot water', 'Bed linens', 'Extra pillows and blankets', 'Microwave',
  'Refrigerator', 'Dishwasher', 'Coffee maker', 'Toaster', 'Stove',
  'Oven', 'Dining table', 'High chair', 'Crib', 'Fire extinguisher',
  'Smoke alarm', 'Carbon monoxide alarm', 'First aid kit', 'Private entrance',
  'Lockbox', 'Keypad', 'Garden or backyard', 'Patio or balcony', 'BBQ grill',
  'Pool', 'Hot tub', 'Gym', 'Parking', 'Elevator', 'Wheelchair accessible'
];

// Neighborhoods by city
const NEIGHBORHOODS = {
  London: ['Shoreditch', 'Camden', 'Islington', 'Hackney', 'Brixton', 'Clapham', 'Fulham', 'Kensington', 'Chelsea', 'Westminster'],
  Lisbon: ['Alfama', 'Bairro Alto', 'Chiado', 'Belém', 'Príncipe Real', 'Graça', 'Mouraria', 'Estrela', 'Campo de Ourique', 'Areeiro'],
  Dublin: ['Temple Bar', 'St. Stephen\'s Green', 'Grafton Street', 'O\'Connell Street', 'Parnell Square', 'Merrion Square', 'Phoenix Park', 'Grand Canal', 'Docklands', 'Rathmines'],
  Edinburgh: ['Old Town', 'New Town', 'Leith', 'Stockbridge', 'Morningside', 'Bruntsfield', 'Marchmont', 'Tollcross', 'Grassmarket', 'Dean Village'],
  Paris: ['Le Marais', 'Saint-Germain-des-Prés', 'Montmartre', 'Champs-Élysées', 'Latin Quarter', 'Bastille', 'Canal Saint-Martin', 'Belleville', 'Pigalle', 'République'],
  Sydney: ['The Rocks', 'Circular Quay', 'Darling Harbour', 'Bondi', 'Manly', 'Surry Hills', 'Paddington', 'Newtown', 'Glebe', 'Balmain'],
  Auckland: ['Auckland CBD', 'Ponsonby', 'Parnell', 'Newmarket', 'Remuera', 'Mission Bay', 'Devonport', 'Takapuna', 'Grey Lynn', 'Mount Eden']
};

// Landmarks by city
const LANDMARKS = {
  London: ['Tower Bridge', 'Big Ben', 'London Eye', 'Buckingham Palace', 'Hyde Park', 'Covent Garden', 'Camden Market', 'Borough Market'],
  Lisbon: ['Belém Tower', 'Jerónimos Monastery', 'Castle of São Jorge', 'Praça do Comércio', 'Elevador de Santa Justa', 'LX Factory', 'Time Out Market'],
  Dublin: ['Trinity College', 'Guinness Storehouse', 'Dublin Castle', 'St. Patrick\'s Cathedral', 'Temple Bar', 'Phoenix Park', 'Grafton Street'],
  Edinburgh: ['Edinburgh Castle', 'Royal Mile', 'Arthur\'s Seat', 'Holyrood Palace', 'Princes Street', 'Grassmarket', 'Dean Village', 'Calton Hill'],
  Paris: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Arc de Triomphe', 'Sacré-Cœur', 'Seine River', 'Champs-Élysées', 'Montmartre'],
  Sydney: ['Sydney Opera House', 'Harbour Bridge', 'Bondi Beach', 'Darling Harbour', 'The Rocks', 'Royal Botanic Gardens', 'Manly Beach'],
  Auckland: ['Sky Tower', 'Auckland Harbour Bridge', 'Mission Bay', 'Ponsonby Road', 'Auckland Domain', 'Viaduct Harbour', 'Mount Eden', 'Devonport']
};

function generateListing(id: string): z.infer<typeof ListingSchema> {
  const rng = createSeededRng(id);
  
  // Assign city based on distribution
  const cityIndex = Math.floor(rng() * CITY_DISTRIBUTION.length);
  const city = CITY_DISTRIBUTION[cityIndex] as keyof typeof PRICE_BANDS;
  
  // 60% 1-bed, 40% 2-bed
  const bedrooms = rng() < 0.6 ? 1 : 2;
  const bathrooms = bedrooms === 1 ? 1 : 2;
  const maxGuests = bedrooms === 1 ? 2 : 4;
  
  // Price within city band
  const [minPrice, maxPrice] = PRICE_BANDS[city][bedrooms];
  const monthly_rent = Math.round(minPrice + rng() * (maxPrice - minPrice));
  const base_nightly = roundTo(monthly_rent / 30, 2);
  
  // Coordinates within city bounds
  const [latMin, latMax] = COORDINATES[city].lat;
  const [lngMin, lngMax] = COORDINATES[city].lng;
  const lat = roundTo(latMin + rng() * (latMax - latMin), 6);
  const lng = roundTo(lngMin + rng() * (lngMax - lngMin), 6);
  
  // Random amenities (6-12)
  const amenityCount = 6 + Math.floor(rng() * 7);
  const shuffledAmenities = [...AMENITIES_POOL].sort(() => rng() - 0.5);
  const amenities = shuffledAmenities.slice(0, amenityCount);
  
  // Random neighborhood and landmark
  const neighborhood = NEIGHBORHOODS[city][Math.floor(rng() * NEIGHBORHOODS[city].length)];
  const landmark = LANDMARKS[city][Math.floor(rng() * LANDMARKS[city].length)];
  
  // Title generation
  const titleTemplates = [
    `Bright ${bedrooms}-Bed in ${neighborhood}, ${city} (MTL)`,
    `Modern ${bedrooms}-Bed near ${landmark} (MTL)`,
    `Stylish ${bedrooms}-Bed in ${neighborhood}, ${city} (MTL)`,
    `Contemporary ${bedrooms}-Bed near ${landmark} (MTL)`,
    `Charming ${bedrooms}-Bed in ${neighborhood}, ${city} (MTL)`
  ];
  const title = titleTemplates[Math.floor(rng() * titleTemplates.length)];
  
  // Summary (10-16 words)
  const summaryTemplates = [
    `Perfect ${bedrooms}-bedroom apartment in ${neighborhood} with modern amenities and great transport links.`,
    `Stylish ${bedrooms}-bedroom home near ${landmark} with fully equipped kitchen and workspace.`,
    `Contemporary ${bedrooms}-bedroom flat in ${neighborhood} with high-speed Wi-Fi and city views.`,
    `Modern ${bedrooms}-bedroom apartment close to ${landmark} with all essential amenities included.`,
    `Beautiful ${bedrooms}-bedroom property in ${neighborhood} with excellent location and modern facilities.`
  ];
  const summary = summaryTemplates[Math.floor(rng() * summaryTemplates.length)];
  
  // Description (80-140 words)
  const descriptionTemplates = [
    `This beautiful ${bedrooms}-bedroom apartment in ${neighborhood} offers the perfect base for your ${city} stay. The property features a fully equipped kitchen with modern appliances, high-speed Wi-Fi (300 Mbps), and a dedicated workspace perfect for remote work. The living area is bright and spacious, with comfortable seating and a smart TV. The bedroom(s) are well-appointed with quality linens and storage space. Located just minutes from ${landmark}, you'll have easy access to ${city}'s best attractions, restaurants, and transport links. This property is ideal for stays of 1-3 months, offering the comfort of home with the convenience of a prime location.`,
    `Experience ${city} like a local in this stylish ${bedrooms}-bedroom home near ${landmark}. The apartment boasts a modern kitchen with all essential appliances, including a washer/dryer for your convenience. High-speed Wi-Fi (300 Mbps) ensures you stay connected, while the dedicated workspace makes remote work a breeze. The property is perfectly suited for mid-term stays of 1-3 months, offering both comfort and functionality. With excellent transport connections and walking distance to ${neighborhood}'s best cafes and restaurants, this is the ideal home base for exploring ${city}.`,
    `Discover ${city} from this contemporary ${bedrooms}-bedroom flat in ${neighborhood}. The property features a fully equipped kitchen, high-speed Wi-Fi (300 Mbps), and a comfortable living space with smart TV. The bedroom(s) offer peaceful rest with quality bedding and ample storage. Perfect for 1-3 month stays, this home provides all the amenities you need for a comfortable extended visit. Located near ${landmark}, you'll enjoy easy access to ${city}'s top attractions, dining, and shopping. The property includes a washer/dryer and dedicated workspace, making it ideal for both leisure and business travelers.`
  ];
  const description = descriptionTemplates[Math.floor(rng() * descriptionTemplates.length)];
  
  // Bed configuration
  const bedConfig = bedrooms === 1 
    ? [{ room: 'Bedroom 1', beds: ['1 Queen'] }]
    : [
        { room: 'Bedroom 1', beds: ['1 Queen'] },
        { room: 'Bedroom 2', beds: ['1 Double'] }
      ];
  
  // Add sofa bed to some 1-bedrooms
  if (bedrooms === 1 && rng() < 0.3) {
    bedConfig.push({ room: 'Living room', beds: ['1 Sofa Bed (small)'] });
  }
  
  // Determine stay type and minimum nights
  // 75% mid-let only (30 nights), 25% both (2 nights)
  const stayType: 'mtl_only' | 'both' = rng() < 0.75 ? 'mtl_only' : 'both';
  const minimumStayNights = stayType === 'both' ? 2 : 30;
  
  // Generate 365 days of availability from today (1 year advance booking)
  const availability = [];
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    
    // ~12% blocked
    const is_blocked = rng() < 0.12;
    
    availability.push({
      date: dateStr,
      is_blocked,
      min_stay_nights: minimumStayNights,
      nightly_price_hint: roundTo(monthly_rent / 30, 2),
      unavailable_reason: is_blocked ? 'maintenance' : undefined,
    });
  }
  
  // Reviews
  const rating_avg = roundTo(3.5 + rng() * 1.5, 1);
  const review_count = Math.floor(rng() * 201);

  const listing = {
    id,
    platform: 'Houst Direct' as const,
    airbnb_listing_id: null,
    
    title,
    summary,
    description,
    
    hero_image: `https://picsum.photos/seed/${id}-hero/1600/900`,
    images: [
      `https://picsum.photos/seed/${id}-1/1600/900`,
      `https://picsum.photos/seed/${id}-2/1600/900`,
      `https://picsum.photos/seed/${id}-3/1600/900`,
      `https://picsum.photos/seed/${id}-4/1600/900`,
      `https://picsum.photos/seed/${id}-5/1600/900`,
      `https://picsum.photos/seed/${id}-6/1600/900`,
    ],
    
    amenities,
    
    address_line1: `${Math.floor(1 + rng() * 999)} ${neighborhood} Street`,
    address_line2: null,
    postcode: null,
    city,
    country: city === 'Sydney' ? 'Australia' : city === 'Auckland' ? 'New Zealand' : city === 'Paris' ? 'France' : city === 'Lisbon' ? 'Portugal' : city === 'Dublin' ? 'Ireland' : city === 'Edinburgh' ? 'Scotland' : 'United Kingdom',
    lat,
    lng,
    
    bedrooms,
    bed_configuration: bedConfig,
    bathrooms,
    max_guests: maxGuests,
    
    check_in_time: '15:00:00',
    check_out_time: '11:00:00',
    house_rules: null,
    registration_number: null,
    
    price_currency: 'GBP' as const,
    monthly_rent,
    base_nightly,
    minimum_stay_nights: minimumStayNights,

    fees: {
      cleaning_fee: Math.round(50 + rng() * 100),
      service_fee: Math.round(20 + rng() * 60),
      admin_fee: Math.round(10 + rng() * 40),
      tax_rate_pct: roundTo(5 + rng() * 15, 2),
    },

    deposits: {
      holding_deposit: {
        percentage: 10,
        charged_at_booking: true,
        non_refundable: true,
        applied_to_rent: true,
        label: 'Holding deposit (applied to Month 1 rent)'
      },
      security_deposit: {
        type: 'hold' as const,
        amount: 500,
        authorize_days_before_checkin: 2,
        release_days_after_checkout: 7,
        label: 'Security deposit hold'
      }
    },

    cancellation_policy: {
      name: 'Flexible MTL',
      rules: [
        { window: '>= 30 days before check-in', refund: '100%' },
        { window: '< 30 days before check-in', refund: '50%' },
      ],
      display_text: 'Cancel 30+ days before check-in for full refund; otherwise 50%.'
    },

    payment_plan: {
      type: 'monthly_billing' as const,
      provider: 'Stripe' as const,
      payment_method_types: ['card'],
      dispute_ready: true,
    },

    agreement: {
      lto_required: true,
      threshold_nights: minimumStayNights >= 30 ? 30 : minimumStayNights,
      provider: 'Dropbox Sign' as const,
      template_id: 'tpl_mtl_demo_001',
      lto_status: 'pending' as const,
    },

    screening: {
      required: true,
      provider: 'Guesty Screening',
      status: 'pending' as const,
    },

    availability,
    reviews: { rating_avg, review_count },

    ui_flags: {
      mtl_badge: true,
      show_monthly_toggle: true,
      show_deposit_breakdown: true,
      show_agreement_step: true,
      show_screening_step: true,
      // DEV NOTE: This is dummy data for demo purposes
      // In production, this should be pulled from Looker tables based on actual booking rules
      stay_type_availability: stayType,
    }
  };

  return listing;
}

// Generate 2000 listings
const listings = [];
for (let i = 1; i <= 2000; i++) {
  const id = `HOUST-MTL-${i.toString().padStart(4, '0')}`;
  const listing = generateListing(id);
  
  // Validate with schema
  try {
    const validatedListing = ListingSchema.parse(listing);
    listings.push(validatedListing);
  } catch (error) {
    console.error(`Validation failed for ${id}:`, error);
    throw error;
  }
}

// Write to file
writeFileSync('data/listings.json', JSON.stringify(listings, null, 2));

console.log(`✅ Generated ${listings.length} validated listings`);
console.log('📁 Written to data/listings.json');
console.log('🔍 Run "npm run check:listings" to verify the data');