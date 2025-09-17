import React, { useMemo, useState, useEffect } from 'react';
import { useListings, getAllListings } from '@/lib/listings';
import { hasLastMinuteWindow } from '@/lib/badges';
import PropertyCard from './PropertyCard';

const LastMinuteListingsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const pageSize = 24;

  useEffect(() => {
    const loadData = async () => {
      try {
        const all = await getAllListings();
        setAllListings(all);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load listings:', error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const all = allListings.filter(hasLastMinuteWindow);
  const total = all.length;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);
  const items = useMemo(() => {
    const start = (page - 1) * pageSize;
    return all.slice(start, start + pageSize);
  }, [all, page]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Last-Minute Bargains</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
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
      </div>
    </div>
  );
};

export default LastMinuteListingsPage;


