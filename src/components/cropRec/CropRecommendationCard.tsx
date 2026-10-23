import React from 'react';
import { CropRecommendationResultItem } from '../../../shared/types';
import {
  Sprout,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Info,
  DollarSign,
  Layers,
  PlusCircle,
} from 'lucide-react';

interface CropRecommendationCardProps {
  crop: CropRecommendationResultItem;
  rank: number;
  isSelectedForCompare: boolean;
  onToggleCompare: (cropId: string) => void;
  onViewGuide: (cropId: string) => void;
  onAddToCrops: (crop: CropRecommendationResultItem) => void;
  language: string;
}

export const CropRecommendationCard: React.FC<CropRecommendationCardProps> = ({
  crop,
  rank,
  isSelectedForCompare,
  onToggleCompare,
  onViewGuide,
  onAddToCrops,
  language,
}) => {
  const isTopMatch = rank === 1;

  return (
    <div
      className={`rounded-2xl p-6 sm:p-6 border transition-all space-y-5 bg-white ${
        isTopMatch
          ? 'border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
          : 'border-stone-200 hover:border-stone-300 shadow-xs'
      }`}
    >
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 font-display ${
              isTopMatch
                ? 'bg-emerald-700 text-white shadow-sm'
                : rank === 2
                ? 'bg-stone-800 text-white'
                : 'bg-stone-200 text-stone-700'
            }`}
          >
            #{rank}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black text-stone-900 tracking-tight">
                {crop.cropName}
              </h3>
              {crop.hindiName && (
                <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-md">
                  {crop.hindiName}
                </span>
              )}
              <span className="text-xs text-stone-600 font-medium italic">
                ({crop.variety})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-stone-500">
              <span className="flex items-center gap-1 font-semibold text-emerald-800">
                <Calendar className="w-3.5 h-3.5" />
                <span>{crop.season} Season</span>
              </span>
              <span>•</span>
              <span>Duration: <strong className="text-stone-800">{crop.durationDays}</strong></span>
              <span>•</span>
              <span>Sowing: <strong className="text-stone-800">{crop.sowingWindow}</strong></span>
            </div>
          </div>
        </div>

        {/* Suitability Score Gauge */}
        <div className="flex items-center sm:flex-col items-end gap-1.5 self-start">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-display">
              {crop.suitabilityScore}%
            </span>
            <span className="text-xs font-bold text-stone-500">Match</span>
          </div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {crop.suitabilityScore >= 90 ? 'Optimal Choice' : 'High Suitability'}
          </div>
        </div>
      </div>

      {/* Financials & Yield Metrics Bento */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Expected Yield</div>
          <div className="text-sm sm:text-base font-extrabold text-stone-900 mt-1 font-display">
            {crop.expectedYieldRange}
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">Quintals / acre</div>
        </div>

        <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Est. Production Cost</div>
          <div className="text-sm sm:text-base font-extrabold text-stone-800 mt-1 font-display">
            ₹{crop.estimatedCostPerAcreInr.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">per acre</div>
        </div>

        <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Est. Gross Revenue</div>
          <div className="text-sm sm:text-base font-extrabold text-stone-900 mt-1 font-display">
            ₹{crop.estimatedRevenuePerAcreInr.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">per acre</div>
        </div>

        <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200">
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Net Est. Profit</div>
          <div className="text-sm sm:text-base font-black text-emerald-950 mt-1 font-display">
            ₹{crop.estimatedNetProfitPerAcreInr.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-0.5">High ROI Index</div>
        </div>
      </div>

      {/* Qualitative Tags & Requirements */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-stone-100 text-stone-800 px-3 py-1.5 rounded-xl font-medium">
          <Droplets className="w-3.5 h-3.5 text-blue-600" />
          <span>Water: <strong>{crop.waterRequirement}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 text-stone-800 px-3 py-1.5 rounded-xl font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Market Risk: <strong>{crop.marketRisk}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 text-stone-800 px-3 py-1.5 rounded-xl font-medium">
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>Soil: <strong>{crop.soilCompatibility}</strong></span>
        </div>

        {crop.mandiPriceReference && (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-xl font-semibold border border-emerald-200">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            <span>Mandi Rate: {crop.mandiPriceReference}</span>
          </div>
        )}
      </div>

      {/* Why This Crop? AI Breakdown */}
      <div className="bg-stone-50/90 rounded-2xl p-4 border border-stone-200/80 space-y-2">
        <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#1B3B11]" />
          <span>Why this crop was recommended for your land:</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 font-medium">
          {crop.reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700 select-none">
          <input
            type="checkbox"
            checked={isSelectedForCompare}
            onChange={() => onToggleCompare(crop.cropId)}
            className="w-4 h-4 rounded-md text-emerald-700 focus:ring-emerald-500"
          />
          <span>Compare with other crops</span>
        </label>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => onAddToCrops(crop)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add to My Active Crops</span>
          </button>

          <button
            onClick={() => onViewGuide(crop.cropId)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1B3B11] hover:bg-green-700 px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>Complete Crop Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
