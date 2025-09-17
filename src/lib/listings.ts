import { useMemo, useState, useEffect } from "react";
import type { Listing } from "@/lib/schemas/listing";
import { hasLastMinuteWindow } from "@/lib/badges";

// Load data dynamically to avoid import issues
let DATA: Listing[] = [];
let dataLoaded = false;

async function loadData() {
  if (dataLoaded) return DATA;
  
  try {
    console.log('🔄 Loading listings from /listings.json...');
    const response = await fetch('/listings.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    DATA = data as Listing[];
    dataLoaded = true;
    console.log('✅ Loaded', DATA.length, 'listings');
    return DATA;
  } catch (error) {
    console.error('❌ Failed to load listings:', error);
    return [];
  }
}

export async function getAllListings(): Promise<Listing[]> {
  await loadData();
  return DATA;
}

export async function getListingById(id: string): Promise<Listing | null> {
  await loadData();
  return DATA.find(l => l.id === id) ?? null;
}

type Params = {
  q?: string;
  cities?: string[];
  page?: number;
  pageSize?: number;
  minRent?: number;
  maxRent?: number;
};

export function useListings(params: Params) {
  const { q, cities, page = 1, pageSize = 24, minRent, maxRent } = params;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 useListings: Starting to load data...');
    loadData().then(data => {
      console.log('✅ useListings: Loaded', data.length, 'listings');
      setListings(data);
      setLoading(false);
    }).catch(error => {
      console.error('❌ useListings: Failed to load data:', error);
      setLoading(false);
    });
  }, []);

  const result = useMemo(() => {
    if (loading) {
      return { items: [], total: 0, page, pageSize, loading };
    }

    let rows = listings;

    if (cities?.length) rows = rows.filter(r => cities.includes(r.city));
    if (q?.trim()) {
      const s = q.toLowerCase();
      rows = rows.filter(r =>
        r.title.toLowerCase().includes(s) ||
        r.summary.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        r.city.toLowerCase().includes(s)
      );
    }
    if (typeof minRent === "number") rows = rows.filter(r => r.monthly_rent >= minRent);
    if (typeof maxRent === "number") rows = rows.filter(r => r.monthly_rent <= maxRent);

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const items = rows.slice(start, start + pageSize);

    return { items, total, page, pageSize, loading };
  }, [listings, loading, q, JSON.stringify(cities), page, pageSize, minRent, maxRent]);

  return result;
}

// Helpers for landing sections
export async function getFeatured(limit = 12): Promise<Listing[]> {
  await loadData();
  // Top-rated fallback
  const sorted = [...DATA].sort((a, b) => b.reviews.rating_avg - a.reviews.rating_avg);
  return sorted.slice(0, limit);
}

export async function getLastMinute(limit = 12): Promise<Listing[]> {
  await loadData();
  const rows = DATA.filter((l) => hasLastMinuteWindow(l));
  return rows.slice(0, limit);
}

export async function getStandard(city: Listing['city'] = 'London', limit = 12): Promise<Listing[]> {
  await loadData();
  return DATA.filter((l) => l.city === city).slice(0, limit);
}


