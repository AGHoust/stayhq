import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useListings } from '@/lib/listings';
import type { Listing } from '@/lib/schemas/listing';
import PropertyCard from './PropertyCard';

const CITIES: Listing['city'][] = ['London','Lisbon','Dublin','Edinburgh','Paris','Sydney'];

const MTLListingsPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>(['London']);
  const [page, setPage] = useState(1);
  const [minRent, setMinRent] = useState<number | undefined>();
  const [maxRent, setMaxRent] = useState<number | undefined>();

  const { items, total, pageSize } = useListings({ q, cities: selectedCities, page, pageSize: 24, minRent, maxRent });
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const toggleCity = (city: string) => {
    setPage(1);
    setSelectedCities((prev) => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Explore Mid-lets</h1>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search title, city, description"
                className="pl-10 pr-3 py-2 border border-border rounded-lg outline-none"
              />
              <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 bg-card rounded-2xl p-4 border border-border h-fit">
          <h2 className="font-semibold text-ink mb-3">Cities</h2>
          <div className="space-y-2">
            {CITIES.map((c) => (
              <label key={c} className="flex items-center gap-2 text-ink">
                <input type="checkbox" checked={selectedCities.includes(c)} onChange={() => toggleCity(c)} />
                <span>{c}</span>
              </label>
            ))}
          </div>
          <div className="mt-6">
            <h2 className="font-semibold text-ink mb-2">Price (GBP/month)</h2>
            <div className="flex gap-2">
              <input
                type="number"
                value={minRent ?? ''}
                onChange={(e) => { setMinRent(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
                placeholder="Min"
                className="w-full border border-border rounded-lg px-2 py-1"
              />
              <input
                type="number"
                value={maxRent ?? ''}
                onChange={(e) => { setMaxRent(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
                placeholder="Max"
                className="w-full border border-border rounded-lg px-2 py-1"
              />
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="mb-4 text-muted">{total.toLocaleString()} places</div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((l) => (
              <PropertyCard key={l.id} property={l as any} onClick={() => {}} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border border-border rounded disabled:opacity-50">Prev</button>
            <div className="text-sm text-muted">Page {page} of {totalPages}</div>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border border-border rounded disabled:opacity-50">Next</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MTLListingsPage;


