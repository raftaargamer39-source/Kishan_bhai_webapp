import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useUserStore } from '../../store/userStore';
import {
  CropRecommendationInput,
  FarmingGoalType,
  AvailableWaterLevel,
  IrrigationMethodType,
  CropSeasonType,
} from '../../../shared/types';
import {
  MapPin,
  Sprout,
  Droplets,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Calendar,
  Zap,
  Loader2,
} from 'lucide-react';

interface CropRecommendationWizardProps {
  onCalculate: (input: CropRecommendationInput) => Promise<void>;
  isLoading: boolean;
  onOpenUploadModal: () => void;
}

export const CropRecommendationWizard: React.FC<CropRecommendationWizardProps> = ({
  onCalculate,
  isLoading,
  onOpenUploadModal,
}) => {
  const farmerProfile = useUserStore(state => state.farmerProfile);
  const { soilHealth, language } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState<CropRecommendationInput>({
    state: farmerProfile.state || 'Gujarat',
    district: farmerProfile.district || 'Rajkot',
    village: farmerProfile.village || 'Anandpur',
    farmSizeAcres: farmerProfile.farmSizeAcres || 4.5,
    availableWater: 'Moderate',
    irrigationType: 'Drip',
    farmingExperience: 'Moderate (5-10 yrs)',
    budgetPerAcre: 28000,
    soilType: soilHealth.soilType || 'Medium Black Cotton',
    soilPh: soilHealth.soilPh || 7.4,
    nitrogenKgHa: soilHealth.nitrogenKgHa || 165,
    phosphorusKgHa: soilHealth.phosphorusKgHa || 24,
    potassiumKgHa: soilHealth.potassiumKgHa || 340,
    organicCarbonPct: soilHealth.organicCarbonPct || 0.62,
    season: 'Rabi',
    farmingGoal: 'Maximum Profit',
  });

  const handleUseMyLocation = () => {
    setFormData((prev) => ({
      ...prev,
      state: farmerProfile.state || 'Gujarat',
      district: farmerProfile.district || 'Rajkot',
      village: farmerProfile.village || 'Anandpur',
    }));
  };

  const handleAutoFillFromSoilHealthCard = () => {
    setFormData((prev) => ({
      ...prev,
      soilType: soilHealth.soilType,
      soilPh: soilHealth.soilPh,
      nitrogenKgHa: soilHealth.nitrogenKgHa,
      phosphorusKgHa: soilHealth.phosphorusKgHa,
      potassiumKgHa: soilHealth.potassiumKgHa,
      organicCarbonPct: soilHealth.organicCarbonPct,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(formData);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
      {/* Wizard Progress Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-stone-900">
              {language === 'hi' ? '🌱 क्या उगाएं? — फसल चयन सलाहकार' : '🌱 What Should I Grow? — Multi-Factor Advisor'}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {language === 'hi'
              ? 'स्थान, मिट्टी, जल स्तर, बजट और लक्ष्य के आधार पर वैज्ञानिक रूप से सत्यापित फसल सिफारिशें।'
              : 'Multi-factor algorithm matching your land, resources, soil chemistry, and farming goals.'}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === 1 ? 'bg-[#1B3B11] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>1. Location</span>
          </button>
          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === 2 ? 'bg-[#1B3B11] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>2. Farm & Water</span>
          </button>
          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === 3 ? 'bg-[#1B3B11] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>3. Soil & Goal</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: LOCATION */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Step 1: Farm Location & Regional Agro-Climatic Zone</span>
              </h3>
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                Use My Profile Location
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">State / राज्य</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden"
                >
                  <option value="Gujarat">Gujarat (गुजरात)</option>
                  <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                  <option value="Rajasthan">Rajasthan (राजस्थान)</option>
                  <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                  <option value="Punjab">Punjab (पंजाब)</option>
                  <option value="Haryana">Haryana (हरियाणा)</option>
                  <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                  <option value="Karnataka">Karnataka (कर्नाटक)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">District / जिला</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Rajkot, Gondal"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Village / गाँव</label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  placeholder="e.g. Anandpur"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs text-stone-600">
              <span className="font-bold text-stone-900">Agro-Climatic Context:</span> Gujarat Saurashtra Region (Zone VII) characterized by medium black cotton soil, semi-arid monsoon rainfall, and strong winter solar radiation.
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-[#1B3B11] hover:bg-green-700 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-md inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Continue to Farm Resources</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FARM RESOURCES */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>Step 2: Farm Area, Water Resources & Investment Budget</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Cultivable Land Area (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="500"
                  value={formData.farmSizeAcres}
                  onChange={(e) => setFormData({ ...formData, farmSizeAcres: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Available Water Supply</label>
                <select
                  value={formData.availableWater}
                  onChange={(e) => setFormData({ ...formData, availableWater: e.target.value as AvailableWaterLevel })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden"
                >
                  <option value="Moderate">Moderate (Borewell / Canal 2-3 waterings)</option>
                  <option value="Abundant">Abundant (Perennial canal / high borewell yield)</option>
                  <option value="Low">Low / Rainfed (Single post-monsoon watering)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Irrigation Method</label>
                <select
                  value={formData.irrigationType}
                  onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value as IrrigationMethodType })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden"
                >
                  <option value="Drip">Drip Irrigation (ड्रिप सिंचाई)</option>
                  <option value="Sprinkler">Sprinkler Irrigation (फव्वारा)</option>
                  <option value="Flood / Furrow">Flood / Furrow (पारंपरिक बहाव)</option>
                  <option value="Rainfed">Rainfed / Dryland (वर्षा आधारित)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Budget Available (₹ / acre)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    step="1000"
                    min="5000"
                    max="200000"
                    value={formData.budgetPerAcre}
                    onChange={(e) => setFormData({ ...formData, budgetPerAcre: parseInt(e.target.value) || 20000 })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Farming Experience</label>
                <select
                  value={formData.farmingExperience}
                  onChange={(e) => setFormData({ ...formData, farmingExperience: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden"
                >
                  <option value="Experienced (>10 yrs)">Experienced (&gt;10 years commercial farming)</option>
                  <option value="Moderate (5-10 yrs)">Moderate (5 - 10 years experience)</option>
                  <option value="Beginner (<5 yrs)">Beginner (&lt;5 years or first time with new crop)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-5 py-3 rounded-2xl inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-[#1B3B11] hover:bg-green-700 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-md inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Continue to Soil & Goal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SOIL, SEASON & FARMING GOAL */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Step 3: Soil Chemistry, Upcoming Season & Farming Goal</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoFillFromSoilHealthCard}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  Auto-Fill from Soil Card
                </button>
                <button
                  type="button"
                  onClick={onOpenUploadModal}
                  className="text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  Upload SHC
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Target Sowing Season</label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value as CropSeasonType })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden"
                >
                  <option value="Rabi">Rabi (रबी - Winter Sowing)</option>
                  <option value="Kharif">Kharif (खरीफ - Monsoon Sowing)</option>
                  <option value="Zaid">Zaid (जायद - Summer Sowing)</option>
                  <option value="All">All Seasons Analysis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Primary Farming Goal</label>
                <select
                  value={formData.farmingGoal}
                  onChange={(e) => setFormData({ ...formData, farmingGoal: e.target.value as FarmingGoalType })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden font-bold"
                >
                  <option value="Maximum Profit">💰 Maximum Profit / High ROI</option>
                  <option value="Low Water Requirement">💧 Low Water / Drought Tolerant</option>
                  <option value="Low Risk">🛡️ Low Market Risk / MSP Guaranteed</option>
                  <option value="Short Duration">⚡ Short Duration / Fast Turnaround</option>
                  <option value="High Yield">🌾 High Yield Output</option>
                  <option value="Sustainable Farming">🌱 Sustainable / Soil Fertility Rejuvenation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Soil Type</label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden"
                >
                  <option value="Medium Black Cotton">Medium Black Cotton (Vertisols)</option>
                  <option value="Deep Black Soil">Deep Black Clayey Soil</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                  <option value="Alluvial Loam">Alluvial Loam</option>
                  <option value="Red Soil">Red / Laterite Soil</option>
                </select>
              </div>
            </div>

            {/* Chemistry Row */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
              <div className="text-xs font-bold text-stone-700">Soil Chemical Metrics (from Soil Health Card):</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-stone-500 font-bold">Soil pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.soilPh}
                    onChange={(e) => setFormData({ ...formData, soilPh: parseFloat(e.target.value) || 7.0 })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 mt-0.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-stone-500 font-bold">Organic Carbon (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.organicCarbonPct}
                    onChange={(e) => setFormData({ ...formData, organicCarbonPct: parseFloat(e.target.value) || 0.6 })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 mt-0.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-stone-500 font-bold">Nitrogen (kg/ha)</label>
                  <input
                    type="number"
                    value={formData.nitrogenKgHa}
                    onChange={(e) => setFormData({ ...formData, nitrogenKgHa: parseInt(e.target.value) || 160 })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 mt-0.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-stone-500 font-bold">Phosphorus (kg/ha)</label>
                  <input
                    type="number"
                    value={formData.phosphorusKgHa}
                    onChange={(e) => setFormData({ ...formData, phosphorusKgHa: parseInt(e.target.value) || 24 })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 mt-0.5"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-5 py-3 rounded-2xl inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-600 to-[#1B3B11] hover:from-emerald-500 hover:to-[#244A17] disabled:opacity-75 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-extrabold px-8 py-3 rounded-2xl shadow-lg inline-flex items-center gap-2.5 cursor-pointer transition-all transform active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-emerald-300 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                )}
                <span>{isLoading ? 'Analyzing Agro-Climatic Data...' : 'Get My Crop Recommendations →'}</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
