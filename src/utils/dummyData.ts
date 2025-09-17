import { Property } from './types';

// Generate availability data for the next 180 days
const generateAvailability = (availableDates: string[]) => {
  const availability = [];
  const today = new Date();
  
  for (let i = 0; i < 180; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    availability.push({
      date: dateString,
      available: availableDates.includes(dateString) || Math.random() > 0.4
    });
  }
  
  return availability;
};

export const featuredProperties: Property[] = [
  {
    id: '1',
    title: 'Elegant Townhouse in Notting Hill',
    location: 'London, UK',
    monthlyRate: 4200,
    nightlyRate: 140,
    images: [
      'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg',
      'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg',
      'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg'
    ],
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Garden', 'Fireplace'],
    availableDates: ['2025-02-15', '2025-03-01', '2025-04-01'],
    travelerType: 'Great for Couples',
    discountType: 'none',
    rating: 4.9,
    reviews: 127,
    description: 'Beautiful Victorian townhouse in the heart of Notting Hill with period features and modern amenities.',
    localTips: [
      {
        id: '1',
        title: 'Portobello Market',
        description: 'Famous antique market just 5 minutes walk',
        category: 'shopping',
        image: 'https://images.pexels.com/photos/2138922/pexels-photo-2138922.jpeg'
      }
    ],
    minStay: 30,
    maxStay: 180,
    bedrooms: 3,
    bathrooms: 2,
    hostName: 'Sarah',
    availability: generateAvailability(['2025-02-15', '2025-03-01', '2025-04-01']),
    allowsShortStay: false,
    tags: ['Desk', 'Washer/Dryer']
  },
  {
    id: '2',
    title: 'Modern Loft in Shoreditch',
    location: 'London, UK',
    monthlyRate: 3800,
    nightlyRate: 127,
    images: [
      'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg',
      'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg'
    ],
    amenities: ['WiFi', 'Gym', 'Rooftop', 'Concierge'],
    availableDates: ['2025-01-20', '2025-02-20', '2025-03-20'],
    travelerType: 'Digital Nomad Friendly',
    discountType: 'none',
    rating: 4.7,
    reviews: 89,
    description: 'Contemporary loft in vibrant Shoreditch with stunning city views.',
    localTips: [],
    minStay: 30,
    maxStay: 90,
    bedrooms: 2,
    bathrooms: 1,
    hostName: 'Marcus',
    availability: generateAvailability(['2025-01-20', '2025-02-20', '2025-03-20']),
    allowsShortStay: true,
    tags: ['Pet-friendly', 'Desk']
  },
  {
    id: '3',
    title: 'Seaside Villa in Brighton',
    location: 'Brighton, UK',
    monthlyRate: 2900,
    nightlyRate: 97,
    images: [
      'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
      'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg'
    ],
    amenities: ['Beach Access', 'WiFi', 'Kitchen', 'Terrace'],
    availableDates: ['2025-03-01', '2025-04-01', '2025-05-01'],
    travelerType: 'Perfect for Families',
    discountType: 'none',
    rating: 4.8,
    reviews: 156,
    description: 'Charming seaside villa with direct beach access and panoramic sea views.',
    localTips: [],
    minStay: 30,
    maxStay: 120,
    bedrooms: 4,
    bathrooms: 3,
    hostName: 'Emma',
    availability: generateAvailability(['2025-03-01', '2025-04-01', '2025-05-01']),
    allowsShortStay: false,
    tags: ['Washer/Dryer', 'Pet-friendly']
  }
];

export const lastMinuteProperties: Property[] = [
  {
    id: '4',
    title: 'Cozy Studio in Camden',
    location: 'London, UK',
    monthlyRate: 2200,
    nightlyRate: 73,
    images: [
      'https://images.pexels.com/photos/2883049/pexels-photo-2883049.jpeg'
    ],
    amenities: ['WiFi', 'Kitchen', 'Washer'],
    availableDates: ['2025-01-15', '2025-02-01'],
    travelerType: 'Solo Traveler',
    discountType: 'last_minute',
    rating: 4.5,
    reviews: 43,
    description: 'Perfect studio for solo travelers in vibrant Camden.',
    localTips: [],
    minStay: 30,
    maxStay: 90,
    bedrooms: 1,
    bathrooms: 1,
    hostName: 'James',
    availability: generateAvailability(['2025-01-15', '2025-02-01']),
    allowsShortStay: true,
    tags: ['Desk']
  },
  {
    id: '5',
    title: 'Luxury Penthouse in Canary Wharf',
    location: 'London, UK',
    monthlyRate: 6500,
    nightlyRate: 217,
    images: [
      'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg'
    ],
    amenities: ['Concierge', 'Gym', 'Pool', 'Balcony', 'Parking'],
    availableDates: ['2025-01-10', '2025-02-10'],
    travelerType: 'Business Traveler',
    discountType: 'last_minute',
    rating: 4.9,
    reviews: 78,
    description: 'Stunning penthouse with Thames views and premium amenities.',
    localTips: [],
    minStay: 30,
    maxStay: 180,
    bedrooms: 3,
    bathrooms: 2,
    hostName: 'Victoria',
    availability: generateAvailability(['2025-01-10', '2025-02-10']),
    allowsShortStay: false,
    tags: ['Desk', 'Washer/Dryer']
  }
];

export const allProperties = [...featuredProperties, ...lastMinuteProperties];