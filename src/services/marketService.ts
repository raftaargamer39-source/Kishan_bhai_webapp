import { autoDetectLocation } from './geolocationService';

export interface MandiPriceRecord {
  id: string;
  crop: string;
  variety: string;
  state: string;
  district: string;
  mandi: string;
  modalPricePerQuintal: number;
  minPricePerQuintal: number;
  maxPricePerQuintal: number;
  priceChangeDailyPct: number;
  arrivalVolumeQuintals: number;
  lastUpdated: string;
  dataSource: string;
  priceTrend: { date: string; price: number }[];
}

export interface MarketPriceResponse {
  success: boolean;
  locationQuery: {
    state: string;
    district: string;
  };
  timestamp: string;
  count: number;
  prices: MandiPriceRecord[];
}

/**
 * Fetch real-time commodity prices from the backend APMC / Agmarknet proxy endpoint.
 * Automatically detects user location via GPS if state/district are not provided.
 */
export async function fetchLiveMarketPrices(
  state?: string,
  district?: string,
  crop?: string
): Promise<MarketPriceResponse> {
  let targetState = state;
  let targetDistrict = district;

  // If state or district not provided, attempt to detect from GPS
  if (!targetState || !targetDistrict) {
    try {
      const geo = await autoDetectLocation();
      if (geo.success) {
        if (!targetState && geo.state) targetState = geo.state;
        if (!targetDistrict && geo.district) targetDistrict = geo.district;
      }
    } catch (e) {
      console.warn('[MarketService] Geolocation lookup skipped, using default state/district.');
    }
  }

  const queryParams = new URLSearchParams();
  if (targetState) queryParams.set('state', targetState);
  if (targetDistrict) queryParams.set('district', targetDistrict);
  if (crop) queryParams.set('crop', crop);

  const url = `/api/market-prices?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MarketPriceResponse = await response.json();
    return data;
  } catch (error) {
    console.error('[MarketService] Failed to fetch live market prices:', error);
    // Return graceful fallback structure
    return {
      success: false,
      locationQuery: {
        state: targetState || 'Gujarat',
        district: targetDistrict || 'Rajkot',
      },
      timestamp: new Date().toISOString(),
      count: 0,
      prices: [],
    };
  }
}

/**
 * Search commodity prices across all Indian markets
 */
export async function searchCommodityPrices(searchTerm: string): Promise<MandiPriceRecord[]> {
  try {
    const res = await fetch(`/api/market-prices?crop=${encodeURIComponent(searchTerm)}`);
    const data: MarketPriceResponse = await res.json();
    if (data.success && data.prices) {
      return data.prices;
    }
    return [];
  } catch (err) {
    console.error('[MarketService] Search commodities error:', err);
    return [];
  }
}

/**
 * Uses the browser's Geolocation API to find the user's coordinates, reverse-geocodes
 * to the nearest state and district, and fetches the local mandi prices.
 */
export async function getMarketPricesByLocation(): Promise<MarketPriceResponse> {
  try {
    const geo = await autoDetectLocation();
    
    if (!geo.success) {
      throw new Error(geo.error || 'Failed to detect location');
    }

    return await fetchLiveMarketPrices(geo.state, geo.district);
  } catch (error) {
    console.error('[MarketService] Failed to get market prices by location:', error);
    // Return graceful fallback structure
    return {
      success: false,
      locationQuery: {
        state: 'Unknown',
        district: 'Unknown',
      },
      timestamp: new Date().toISOString(),
      count: 0,
      prices: [],
    };
  }
}
