/**
 * Crop Recommendation & Financial Calculation Unit Tests
 * Kisan Bhai Platform
 */

import { recommendCrops } from '../src/server/cropAdvisor.js';

export async function runCropAdvisorTests(): Promise<{ passed: boolean; message: string }> {
  console.log('🧪 Testing: Deterministic Crop Advisor & Profit Calculations...');

  const result = await recommendCrops({
    state: 'Gujarat',
    district: 'Rajkot',
    village: 'Anandpur',
    landSizeAcres: 3.5,
    availableWater: 'Low',
    irrigationType: 'Drip',
    farmingGoal: 'Maximum Profit',
    budgetPerAcre: 15000,
    farmingExperienceYears: 8,
    soilType: 'Black Clay Loam (Vertisol)',
    soilPh: 7.4,
    nitrogenKgHa: 165,
    phosphorusKgHa: 24,
    potassiumKgHa: 340,
    organicCarbonPct: 0.62,
    season: 'Rabi',
  });

  if (!result || !result.topCrops || result.topCrops.length === 0) {
    throw new Error('Crop Recommendation failed: No recommendations returned');
  }

  // Verify deterministic profit math
  const first = result.topCrops[0];
  if (first.estimatedProfitPerAcre !== first.potentialRevenuePerAcre - first.estimatedCostPerAcre) {
    throw new Error(
      `Financial Calculation Inconsistency: Net profit (${first.estimatedProfitPerAcre}) != Revenue (${first.potentialRevenuePerAcre}) - Cost (${first.estimatedCostPerAcre})`
    );
  }

  // Verify suitability score is bounded between 0 and 100
  for (const crop of result.topCrops) {
    if (crop.suitabilityScore < 0 || crop.suitabilityScore > 100) {
      throw new Error(`Invalid suitability score: ${crop.suitabilityScore} for ${crop.cropName}`);
    }
  }

  return { passed: true, message: 'All Crop Advisor & Financial Calculation tests passed.' };
}
