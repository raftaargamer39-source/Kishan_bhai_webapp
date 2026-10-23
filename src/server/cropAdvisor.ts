import { CropDetail, CropRecommendationInput, CropRecommendationResult, CropRecommendationResultItem } from '../../shared/types.js';
import { CROP_RECOMMENDATIONS_DATABASE } from '../data/agriData.js';
import { GoogleGenAI } from '@google/genai';

/**
 * Intelligent Multi-Factor Crop Recommendation Engine
 * Combines Location, Soil Chemistry, Water Availability, Budget, Season, and Farmer Goals.
 */
export async function recommendCrops(input: CropRecommendationInput): Promise<CropRecommendationResult> {
  const ranked = CROP_RECOMMENDATIONS_DATABASE.map((crop) => {
    let score = 70; // baseline

    // 1. Season Alignment
    const seasonQuery = input.season || 'Rabi';
    if (seasonQuery !== 'All' && seasonQuery !== 'Auto-Detected') {
      if (crop.bestSeason === seasonQuery || crop.bestSeason === 'Multi-Season') {
        score += 15;
      } else {
        score -= 25; // Wrong season penalty
      }
    } else {
      score += 10;
    }

    // 2. Soil Type & pH Alignment
    if (input.soilType) {
      const match = crop.suitableSoils.some((s) =>
        s.toLowerCase().includes(input.soilType.toLowerCase()) ||
        input.soilType.toLowerCase().includes(s.toLowerCase())
      );
      if (match) {
        score += 8;
      }
    }

    if (input.soilPh) {
      // Ideal neutral range is 6.5 - 7.8
      if (input.soilPh >= 6.5 && input.soilPh <= 7.8) {
        score += 5;
      } else if (input.soilPh < 6.0 || input.soilPh > 8.2) {
        score -= 10;
      }
    }

    // 3. Water & Irrigation Alignment
    if (input.availableWater === 'Low') {
      if (crop.waterRequirement.includes('Low')) {
        score += 12;
      } else if (crop.waterRequirement.includes('High')) {
        score -= 20;
      }
    } else if (input.availableWater === 'Abundant') {
      score += 6;
    }

    if (input.irrigationType === 'Drip') {
      score += 4; // Drip enhances efficiency for all crops
    }

    // 4. Budget Feasibility
    if (input.budgetPerAcre && input.budgetPerAcre > 0) {
      if (input.budgetPerAcre >= crop.estimatedCostPerAcre) {
        score += 6;
      } else {
        const deficitRatio = (crop.estimatedCostPerAcre - input.budgetPerAcre) / crop.estimatedCostPerAcre;
        if (deficitRatio > 0.3) {
          score -= 15;
        } else {
          score -= 6;
        }
      }
    }

    // 5. Farming Goal Match
    const goal = input.farmingGoal || 'Maximum Profit';
    if (goal === 'Maximum Profit') {
      if (crop.estimatedProfitPerAcre > 50000) score += 12;
      else if (crop.estimatedProfitPerAcre > 40000) score += 6;
    } else if (goal === 'Low Water Requirement') {
      if (crop.waterRequirement.includes('Low')) score += 15;
      else if (crop.waterRequirement.includes('Medium')) score += 2;
      else score -= 15;
    } else if (goal === 'Low Risk') {
      if (crop.marketRisk === 'Low') score += 14;
      else if (crop.marketRisk === 'High') score -= 16;
    } else if (goal === 'Short Duration') {
      if (crop.durationDays <= 110) score += 12;
      else if (crop.durationDays > 140) score -= 12;
    } else if (goal === 'High Yield') {
      if (crop.expectedYieldQuintals >= 15) score += 12;
    } else if (goal === 'Sustainable Farming') {
      if (crop.id === 'rec_chickpea' || crop.cropName.includes('Gram')) score += 16; // Biological N fixation
      if (crop.waterRequirement.includes('Low')) score += 8;
    }

    // Clamp score 50 - 98
    const finalScore = Math.min(98, Math.max(50, Math.round(score)));

    return {
      ...crop,
      suitabilityScore: finalScore,
    };
  });

  // Sort descending by suitability score
  ranked.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  const topPick = ranked[0];
  const secondPick = ranked[1];
  const thirdPick = ranked[2];

  // Try generating contextual AI advice via Gemini if API key is present
  let aiAdvice = {
    kisanBhaiAdvice: `Based on your farm in ${input.district || 'Rajkot'}, ${input.state || 'Gujarat'} with ${input.soilType || 'Medium Black Cotton'} soil and ${input.availableWater || 'Moderate'} water supply, ${topPick.cropName} (${topPick.hindiName}) is your top recommended crop for the ${input.season || 'Rabi'} season.`,
    whyReasons: [
      `${topPick.cropName} provides high profit realization (Estimated ₹${topPick.estimatedProfitPerAcre.toLocaleString('en-IN')}/acre) tailored to your ${input.farmingGoal || 'farming goals'}.`,
      `Matches your soil conditions (${input.soilType || 'Black soil'}) and water availability with a low-risk profile.`,
      `Backed by strong Mandi demand and government MSP support of ₹${topPick.marketInformation.mspPricePerQuintal || topPick.marketInformation.currentMandiPricePerQuintal}/quintal.`,
      `Alternative viable rotations include ${secondPick?.cropName || 'Chickpea'} and ${thirdPick?.cropName || 'Wheat'} to maintain biological soil fertility.`,
    ],
    topPickName: topPick.cropName,
    seasonalNote: `Sowing window for ${topPick.cropName} in ${input.state || 'Gujarat'} is optimal between ${topPick.sowingPeriod}.`,
    resourceAlignment: `Budget requirement of ₹${topPick.estimatedCostPerAcre.toLocaleString('en-IN')}/acre aligns cleanly with your stated parameters.`,
  };

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are "Kisan Bhai", India's premier agronomist and crop advisor. 
Generate a clear, authoritative, and actionable recommendation summary for a farmer.

Farmer Inputs:
- Location: ${input.village || 'Village'}, ${input.district || 'Rajkot'}, ${input.state || 'Gujarat'}
- Farm Size: ${input.farmSizeAcres || 4.5} Acres
- Soil: ${input.soilType || 'Medium Black Cotton'}, pH: ${input.soilPh || 7.4}
- Water: ${input.availableWater || 'Moderate'}, Irrigation: ${input.irrigationType || 'Drip'}
- Season: ${input.season || 'Rabi'}
- Budget: ₹${input.budgetPerAcre || 25000}/acre
- Goal: ${input.farmingGoal || 'Maximum Profit'}
- Top Recommended Crop: ${topPick.cropName} (${topPick.hindiName}) with ${topPick.suitabilityScore}% match score.
- Second Recommended: ${secondPick?.cropName} (${secondPick?.suitabilityScore}%)
- Third Recommended: ${thirdPick?.cropName} (${thirdPick?.suitabilityScore}%)

Respond in valid JSON only with this schema:
{
  "kisanBhaiAdvice": "1-2 sentences warm direct advice to the farmer.",
  "whyReasons": ["Reason 1 why top crop matches soil and climate", "Reason 2 on water and economics", "Reason 3 on market risk and harvest advantage"],
  "topPickName": "${topPick.cropName}",
  "seasonalNote": "Exact optimal sowing dates and temperature advice.",
  "resourceAlignment": "Specific note on how budget and irrigation align with this recommendation."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.kisanBhaiAdvice && parsed.whyReasons) {
          aiAdvice = parsed;
        }
      }
    } catch {
      // Fall back safely to agronomic template
    }
  }

  const topRecommendations: CropRecommendationResultItem[] = ranked.map((crop) => ({
    cropId: crop.id,
    cropName: crop.cropName,
    hindiName: crop.hindiName,
    variety: crop.variety,
    season: crop.bestSeason,
    suitabilityScore: crop.suitabilityScore,
    expectedYieldRange: crop.expectedYieldPerAcre || `${crop.expectedYieldQuintals} Quintals`,
    estimatedCostPerAcreInr: crop.estimatedCostPerAcre,
    estimatedRevenuePerAcreInr: crop.potentialRevenuePerAcre,
    estimatedNetProfitPerAcreInr: crop.estimatedProfitPerAcre,
    durationDays: `${crop.durationDays} Days`,
    waterRequirement: crop.waterRequirement,
    marketRisk: crop.marketRisk,
    soilCompatibility: crop.suitableSoils?.[0] || 'Black Cotton / Loam',
    sowingWindow: crop.sowingPeriod,
    reasons: [
      crop.whyThisCrop || `Matches soil and climatic conditions for ${crop.bestSeason} season.`,
      `Net profit potential of ₹${crop.estimatedProfitPerAcre.toLocaleString('en-IN')}/acre with ${crop.marketRisk.toLowerCase()} market risk.`,
      `Water efficiency: ${crop.waterRequirement}.`,
      crop.marketInformation?.mspPricePerQuintal
        ? `Govt MSP support of ₹${crop.marketInformation.mspPricePerQuintal}/quintal.`
        : `Strong local APMC Mandi demand in ${input.district || 'district'}.`
    ],
    mandiPriceReference: crop.marketInformation
      ? `₹${crop.marketInformation.currentMandiPricePerQuintal || crop.marketInformation.mspPricePerQuintal}/Qtl`
      : undefined,
  }));

  return {
    topCrops: ranked,
    topRecommendations,
    aiAdvice,
    aiExplanation: aiAdvice.kisanBhaiAdvice,
    district: input.district || 'Rajkot',
    season: input.season || 'Rabi',
    farmingGoal: input.farmingGoal || 'Maximum Profit',
    inputSummary: input,
    timestamp: new Date().toISOString(),
    isDemo: false,
  };
}
