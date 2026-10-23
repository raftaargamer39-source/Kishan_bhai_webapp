import { create } from 'zustand';
import { MandiPriceRecord } from '../../shared/types';
import { INITIAL_MANDI_PRICES } from '../data/agriData';

interface MarketStore {
  mandiPrices: MandiPriceRecord[];
  setMandiPrices: (prices: MandiPriceRecord[]) => void;
  fetchMandiPrices: () => Promise<void>;
}

export const useMarketStore = create<MarketStore>((set) => ({
  mandiPrices: INITIAL_MANDI_PRICES,
  setMandiPrices: (prices) => set({ mandiPrices: prices }),
  fetchMandiPrices: async () => {
    try {
      const res = await fetch('/api/mandi/prices');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && Array.isArray(data.prices) && data.prices.length > 0) {
          set({ mandiPrices: data.prices });
        }
      }
    } catch {
      // Retain fallback initial prices
    }
  },
}));
