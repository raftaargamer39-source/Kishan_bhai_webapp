/**
 * Production Weather Service for Kisan Bhai
 * Live Open-Meteo & IMD Agro-Meteorology with TTL Caching, Timeout Protection,
 * Spray-Window Intelligence, and Verified Metadata.
 */

import { getWeatherData } from '../weather.js';
import { WeatherData } from '../../../shared/types.js';

export class WeatherService {
  /**
   * Get weather data for a given location or district
   */
  public async getWeather(params: {
    lat?: number;
    lng?: number;
    locationName?: string;
    state?: string;
  }): Promise<WeatherData> {
    const locationName = params.locationName || 'Anandpur, Gujarat';
    const result = await getWeatherData(locationName);
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch weather data');
    }
    return result.data;
  }
}

export const weatherService = new WeatherService();
