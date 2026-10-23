import React from 'react';
import { CropRecommendationResultItem } from '../../../shared/types';
import { X, CheckCircle2, TrendingUp, Droplets, Calendar, ShieldCheck, DollarSign } from 'lucide-react';

interface CropComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  crops: CropRecommendationResultItem[];
  onViewGuide: (cropId: string) => void;
}

export const CropComparisonModal: React.FC<CropComparisonModalProps> = ({
  isOpen,
  onClose,
  crops,
  onViewGuide,
}) => {
  if (!isOpen || crops.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">Agronomic & Financial Tradeoff</div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">
              Side-by-Side Crop Comparison
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Comparing {crops.length} selected crops to help you balance input expenditure, water needs, and profit margins.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="py-3.5 px-4 font-bold text-stone-600 rounded-l-xl">Metric / Parameter</th>
                {crops.map((c) => (
                  <th key={c.cropId} className="py-3.5 px-4 font-extrabold text-stone-900 text-sm">
                    {c.cropName} <span className="font-normal text-xs text-stone-500">({c.hindiName})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              <tr>
                <td className="py-3 px-4 font-bold text-stone-600">Suitability Match</td>
                {crops.map((c) => (
                  <td key={c.cropId} className="py-3 px-4">
                    <span className="text-base font-black text-emerald-700 font-display">{c.suitabilityScore}%</span>
                  </td>
                ))}
              </tr>

              <tr className="bg-emerald-50/40">
                <td className="py-3 px-4 font-bold text-emerald-950">Est. Net Profit / acre</td>
                {crops.map((c) => (
                  <td key={c.cropId} className="py-3 px-4 font-black text-emerald-900 font-display text-sm">
                    ₹{c.estimatedNetProfitPerAcreInr.toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-stone-600">Est. Production Cost</td>
                {crops.map((c) => (
                  <td key={c.cropId} className="py-3 px-4 font-bold text-stone-800">
                    ₹{c.estimatedCostPerAcreInr.toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-stone-600">Expected Yield / acre</td>
                {crops.map((c) => (
                  <td key={c.cropId} className="py-3 px-4 font-bold text-stone-800">
                    {c.expectedYieldRange} Quintals
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-stone-600">Crop Duration</td>
                {crops.map((c) => (
                  <td key={c.cropId} className="py-3 px-4">{c.durationDays}</td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-stone-600">Water Requirement</td>
                {crops.map((c) => (
                  <td key={c.cropId} className="py-3 px-4">
                    <span className="font-bold text-blue-700">{c.waterRequirement}</span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-stone-600">Market Risk</td>
                {crops.map((c) => (
                  <td key={c.cropId} className="py-3 px-4">
                    <span className="font-semibold text-stone-800">{c.marketRisk}</span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-stone-600">Mandi Rate Benchmark</td>
                {crops.map((c) => (
                  <td key={c.cropId} className="py-3 px-4 text-emerald-800 font-semibold">{c.mandiPriceReference}</td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-stone-600">Sowing Window</td>
                {crops.map((c) => (
                  <td key={c.cropId} className="py-3 px-4">{c.sowingWindow}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          {crops.map((c) => (
            <button
              key={c.cropId}
              onClick={() => {
                onClose();
                onViewGuide(c.cropId);
              }}
              className="px-4 py-2.5 bg-[#1B3B11] hover:bg-green-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
            >
              View {c.cropName} Complete Guide →
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
