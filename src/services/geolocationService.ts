import { INDIAN_STATES_AND_DISTRICTS, StateData, getDistrictsForState } from '../data/indianStatesAndDistricts';

export interface GeoLocationResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  state?: string;
  district?: string;
  village?: string;
  formattedAddress?: string;
  source: 'gps' | 'network' | 'saved' | 'fallback';
  error?: string;
  timestamp?: number;
}

// Key geographical anchors for Indian States to guarantee accurate coordinate-to-state mapping
const STATE_ANCHORS: { state: string; defaultDistrict: string; lat: number; lng: number }[] = [
  { state: 'Assam', defaultDistrict: 'Kamrup Metropolitan (Guwahati)', lat: 26.1445, lng: 91.7362 },
  { state: 'Gujarat', defaultDistrict: 'Anand', lat: 22.5645, lng: 72.9289 },
  { state: 'Maharashtra', defaultDistrict: 'Pune', lat: 18.5204, lng: 73.8567 },
  { state: 'Uttar Pradesh', defaultDistrict: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { state: 'Rajasthan', defaultDistrict: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { state: 'Punjab', defaultDistrict: 'Ludhiana', lat: 30.901, lng: 75.8573 },
  { state: 'Haryana', defaultDistrict: 'Karnal', lat: 29.6857, lng: 76.9905 },
  { state: 'Madhya Pradesh', defaultDistrict: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { state: 'Bihar', defaultDistrict: 'Patna', lat: 25.5941, lng: 85.1376 },
  { state: 'West Bengal', defaultDistrict: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { state: 'Karnataka', defaultDistrict: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946 },
  { state: 'Tamil Nadu', defaultDistrict: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { state: 'Telangana', defaultDistrict: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { state: 'Andhra Pradesh', defaultDistrict: 'Guntur', lat: 16.3067, lng: 80.4365 },
  { state: 'Kerala', defaultDistrict: 'Palakkad', lat: 10.7867, lng: 76.6548 },
  { state: 'Odisha', defaultDistrict: 'Khordha (Bhubaneswar)', lat: 20.2961, lng: 85.8245 },
  { state: 'Chhattisgarh', defaultDistrict: 'Raipur', lat: 21.2514, lng: 81.6296 },
  { state: 'Jharkhand', defaultDistrict: 'Ranchi', lat: 23.3441, lng: 85.3096 },
  { state: 'Uttarakhand', defaultDistrict: 'Dehradun', lat: 30.3165, lng: 78.0322 },
  { state: 'Himachal Pradesh', defaultDistrict: 'Shimla', lat: 31.1048, lng: 77.1734 },
  { state: 'Delhi (NCT)', defaultDistrict: 'New Delhi', lat: 28.6139, lng: 77.209 },
  { state: 'Jammu and Kashmir', defaultDistrict: 'Srinagar', lat: 34.0837, lng: 74.7973 },
  { state: 'Goa', defaultDistrict: 'North Goa (Panaji)', lat: 15.4909, lng: 73.8278 },
  { state: 'Tripura', defaultDistrict: 'West Tripura (Agartala)', lat: 23.8315, lng: 91.2868 },
  { state: 'Manipur', defaultDistrict: 'Imphal East', lat: 24.817, lng: 93.9368 },
  { state: 'Meghalaya', defaultDistrict: 'East Khasi Hills (Shillong)', lat: 25.5788, lng: 91.8933 },
  { state: 'Nagaland', defaultDistrict: 'Kohima', lat: 25.6751, lng: 94.1086 },
  { state: 'Mizoram', defaultDistrict: 'Aizawl', lat: 23.7271, lng: 92.7176 },
  { state: 'Arunachal Pradesh', defaultDistrict: 'Itanagar', lat: 27.0844, lng: 93.6053 },
  { state: 'Sikkim', defaultDistrict: 'Gangtok (East Sikkim)', lat: 27.3389, lng: 88.6065 },
  { state: 'Chandigarh', defaultDistrict: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { state: 'Ladakh', defaultDistrict: 'Leh', lat: 34.1526, lng: 77.5771 },
  { state: 'Puducherry', defaultDistrict: 'Puducherry', lat: 11.9416, lng: 79.8083 },
];

/**
 * Match a raw state string (e.g. from reverse geocoder) to official Indian state
 */
export function matchStateName(rawState: string): StateData | undefined {
  if (!rawState) return undefined;
  const clean = rawState.toLowerCase().replace(/state of|state|province|nct of|nct/gi, '').trim();

  return INDIAN_STATES_AND_DISTRICTS.find((s) => {
    const sLower = s.state.toLowerCase();
    return sLower.includes(clean) || clean.includes(sLower) || s.hindiName.includes(rawState);
  });
}

/**
 * Approximate closest Indian state by Euclidean distance to known state anchors
 */
function findNearestStateByCoordinates(lat: number, lng: number): { state: string; district: string } {
  let minDistance = Infinity;
  let nearest = { state: 'Gujarat', district: 'Anand' };

  for (const anchor of STATE_ANCHORS) {
    const dLat = anchor.lat - lat;
    const dLng = anchor.lng - lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistance) {
      minDistance = distSq;
      nearest = { state: anchor.state, district: anchor.defaultDistrict };
    }
  }

  return nearest;
}

/**
 * Reverse geocode latitude and longitude using free APIs, with fallback to nearest anchor
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<{ state: string; district: string; village: string; formattedAddress: string }> {
  // 1. Try BigDataCloud Client Reverse Geocode (free, high reliability)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      const rawState = data.principalSubdivision || data.region || '';
      const matched = matchStateName(rawState);
      const stateName = matched ? matched.state : rawState || 'Gujarat';

      const rawCity = data.city || data.locality || data.principalSubdivisionCode || '';
      const rawLocality = data.locality || data.localityInfo?.administrative?.[3]?.name || '';

      // Match district in state
      const validDistricts = getDistrictsForState(stateName);
      let districtMatch = validDistricts.find((d) =>
        rawCity.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(rawCity.toLowerCase())
      );
      if (!districtMatch) {
        districtMatch = validDistricts[0] || rawCity || 'Anand';
      }

      const villageName = rawLocality && rawLocality !== rawCity ? rawLocality : (data.locality || 'Gram Panchayat');

      return {
        state: stateName,
        district: districtMatch,
        village: villageName,
        formattedAddress: `${villageName}, ${districtMatch}, ${stateName}`,
      };
    }
  } catch {
    // Network reverse geocode failed or timed out, proceed to next fallback
  }

  // 2. Try OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      const addr = data.address || {};
      const rawState = addr.state || '';
      const matched = matchStateName(rawState);
      const stateName = matched ? matched.state : 'Gujarat';

      const validDistricts = getDistrictsForState(stateName);
      const detectedCity = addr.county || addr.state_district || addr.city || addr.town || '';
      let districtMatch = validDistricts.find((d) =>
        detectedCity.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(detectedCity.toLowerCase())
      );
      if (!districtMatch) {
        districtMatch = validDistricts[0] || 'Anand';
      }

      const villageName = addr.village || addr.suburb || addr.hamlet || addr.town || 'Gram Panchayat';

      return {
        state: stateName,
        district: districtMatch,
        village: villageName,
        formattedAddress: `${villageName}, ${districtMatch}, ${stateName}`,
      };
    }
  } catch {
    // OSM failed
  }

  // 3. Fallback to Nearest Indian State anchor by GPS coordinates
  const nearest = findNearestStateByCoordinates(lat, lng);
  return {
    state: nearest.state,
    district: nearest.district,
    village: 'Gram Panchayat',
    formattedAddress: `${nearest.district}, ${nearest.state}`,
  };
}

/**
 * Automatically acquire browser GPS location, reverse-geocode, and return full result
 */
export async function autoDetectLocation(): Promise<GeoLocationResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return {
      success: false,
      source: 'fallback',
      error: 'Geolocation not supported by device/browser',
      state: 'Gujarat',
      district: 'Anand',
      village: 'Anandpur',
      formattedAddress: 'Anandpur, Anand, Gujarat',
    };
  }

  return new Promise<GeoLocationResult>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          const geoData = await reverseGeocodeCoordinates(latitude, longitude);
          const result: GeoLocationResult = {
            success: true,
            latitude: Number(latitude.toFixed(6)),
            longitude: Number(longitude.toFixed(6)),
            accuracy: Math.round(accuracy),
            state: geoData.state,
            district: geoData.district,
            village: geoData.village,
            formattedAddress: geoData.formattedAddress,
            source: 'gps',
            timestamp: Date.now(),
          };

          // Cache in local storage for instant retrieval
          try {
            localStorage.setItem('kishanbhai_saved_geolocation', JSON.stringify(result));
          } catch {}

          resolve(result);
        } catch (err: any) {
          const fallback = findNearestStateByCoordinates(latitude, longitude);
          resolve({
            success: true,
            latitude: Number(latitude.toFixed(6)),
            longitude: Number(longitude.toFixed(6)),
            accuracy: Math.round(accuracy),
            state: fallback.state,
            district: fallback.district,
            village: 'Gram Panchayat',
            formattedAddress: `${fallback.district}, ${fallback.state}`,
            source: 'gps',
            timestamp: Date.now(),
          });
        }
      },
      (error) => {
        // GPS permission denied or timed out
        let errorMsg = 'Location permission not granted or GPS unavailable';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'GPS Permission Denied. You can select state & city manually or tap Turn On GPS.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'GPS signal search timed out. Falling back to manual selection.';
        }

        // Check if we have previously cached location
        try {
          const cached = localStorage.getItem('kishanbhai_saved_geolocation');
          if (cached) {
            const parsed = JSON.parse(cached);
            resolve({
              ...parsed,
              source: 'saved',
              error: errorMsg,
            });
            return;
          }
        } catch {}

        resolve({
          success: false,
          source: 'fallback',
          error: errorMsg,
          state: 'Gujarat',
          district: 'Anand',
          village: 'Anandpur',
          formattedAddress: 'Anandpur, Anand, Gujarat',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 120000,
      }
    );
  });
}
