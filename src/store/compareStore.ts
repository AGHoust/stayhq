import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Property } from '../utils/types';
import type { Listing } from '@/lib/schemas/listing';

type CompareItem = Property | Listing;

interface CompareStore {
  compareList: CompareItem[];
  addToCompare: (item: CompareItem) => void;
  removeFromCompare: (itemId: string) => void;
  clearCompare: () => void;
  isInCompare: (itemId: string) => boolean;
  canAddMore: () => boolean;
  maxCompareItems: number;
  clearStorage: () => void;
}

// Helper function to detect if an item is a legacy Property with 28-day minimum
function isLegacyProperty(item: any): boolean {
  return item && typeof item === 'object' && 'minStay' in item && item.minStay === 28;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      compareList: [],
      maxCompareItems: 3, // Keep at 3 for good comparison options
      
      addToCompare: (item: CompareItem) => {
        const { compareList, maxCompareItems } = get();
        if (compareList.length < maxCompareItems && !compareList.find(p => p.id === item.id)) {
          set({ compareList: [...compareList, item] });
        }
      },
      
      removeFromCompare: (itemId: string) => {
        const { compareList } = get();
        set({ compareList: compareList.filter(p => p.id !== itemId) });
      },
      
      clearCompare: () => {
        set({ compareList: [] });
      },
      
      isInCompare: (itemId: string) => {
        const { compareList } = get();
        return compareList.some(p => p.id === itemId);
      },
      
      canAddMore: () => {
        const { compareList, maxCompareItems } = get();
        return compareList.length < maxCompareItems;
      },
      
      clearStorage: () => {
        localStorage.removeItem('compare-storage');
        set({ compareList: [] });
      }
    }),
    {
      name: 'compare-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Filter out any legacy Property objects with 28-day minimums
          const filteredList = state.compareList.filter(item => !isLegacyProperty(item));
          if (filteredList.length !== state.compareList.length) {
            state.compareList = filteredList;
          }
        }
      },
    }
  )
);