/**
 * Weather Service & Caching Unit Tests
 * Kisan Bhai Platform
 */

import { weatherService } from '../src/server/services/WeatherService.js';

export async function runWeatherTests(): Promise<{ passed: boolean; message: string }> {
  console.log('🧪 Testing: Weather Service & Agro-Advisories...');

  const data1 = await weatherService.getWeather({ lat: 22.30, lng: 70.80, locationName: 'Rajkot Farm Node' });

  if (!data1 || typeof data1.temperatureC !== 'number') {
    throw new Error('Weather Service failed: Missing temperature reading');
  }

  // Test caching (subsequent request returns same data structure with fast response)
  const start = Date.now();
  const data2 = await weatherService.getWeather({ lat: 22.30, lng: 70.80, locationName: 'Rajkot Farm Node' });
  const duration = Date.now() - start;

  if (duration > 50) {
    console.warn(`Weather cache response took ${duration}ms (expected < 50ms for memory cache)`);
  }

  if (data1.temperatureC !== data2.temperatureC) {
    throw new Error('Weather Cache failed: Inconsistent cached values');
  }

  return { passed: true, message: 'All Weather Service & Caching tests passed.' };
}
