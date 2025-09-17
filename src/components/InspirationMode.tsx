import React from 'react';
import { Star, TrendingUp, DollarSign, MapPin } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { useListings } from '@/lib/listings';
import { listingToProperty } from '@/lib/compare-utils';

interface InspirationModeProps {
  searchParams: any;
  onPropertyClick: (property: any) => void;
}

const InspirationMode: React.FC<InspirationModeProps> = ({ searchParams, onPropertyClick }) => {
  const { items: allListings } = useListings({ page: 1, pageSize: 1000 });

  // Get top rated listings (rating >= 4.5)
  const topRatedListings = allListings
    .filter(listing => listing.reviews.rating_avg >= 4.5)
    .sort((a, b) => b.reviews.rating_avg - a.reviews.rating_avg)
    .slice(0, 6);

  // Get best value listings (lowest price per rating)
  const bestValueListings = allListings
    .map(listing => ({
      ...listing,
      valueScore: listing.reviews.rating_avg / (listing.monthly_rent / 1000)
    }))
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, 6);

  // Get trending areas (most listings per city)
  const cityCounts = allListings.reduce((acc, listing) => {
    acc[listing.city] = (acc[listing.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const trendingCities = Object.entries(cityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([city]) => city);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-ink mb-4">
          Not sure where? We'll show our top rated picks
        </h2>
        <p className="text-lg text-muted">
          Discover amazing places based on your preferences
        </p>
      </div>

      {/* Top Rated */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <Star className="w-6 h-6 text-yellow-500" />
          <h3 className="text-2xl font-bold text-ink">Top Rated</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topRatedListings.map((listing) => (
            <PropertyCard
              key={listing.id}
              property={listing as any}
              onClick={() => onPropertyClick(listingToProperty(listing))}
            />
          ))}
        </div>
      </section>

      {/* Best Value */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <DollarSign className="w-6 h-6 text-green-500" />
          <h3 className="text-2xl font-bold text-ink">Best Value This Month</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestValueListings.map((listing) => (
            <PropertyCard
              key={listing.id}
              property={listing as any}
              onClick={() => onPropertyClick(listingToProperty(listing))}
            />
          ))}
        </div>
      </section>

      {/* Trending Areas */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6 text-orange-500" />
          <h3 className="text-2xl font-bold text-ink">Trending Areas</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingCities.map((city) => (
            <button
              key={city}
              onClick={() => {
                // Filter listings by city and show results
                const cityListings = allListings.filter(listing => listing.city === city);
                if (cityListings.length > 0) {
                  onPropertyClick(listingToProperty(cityListings[0]));
                }
              }}
              className="p-6 bg-card rounded-xl border border-border hover:border-petrol transition-colors text-center group"
            >
              <MapPin className="w-8 h-8 text-muted mx-auto mb-3 group-hover:text-petrol transition-colors" />
              <h4 className="font-semibold text-ink">{city}</h4>
              <p className="text-sm text-muted mt-1">
                {cityCounts[city]} properties
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Search Again */}
      <div className="text-center">
        <button
          onClick={() => window.location.reload()}
          className="bg-petrol text-white px-8 py-3 rounded-lg font-semibold hover:bg-petrol/90 transition-colors"
        >
          Search Again
        </button>
      </div>
    </div>
  );
};

export default InspirationMode;
