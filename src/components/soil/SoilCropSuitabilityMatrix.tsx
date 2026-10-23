import React from 'react';
import { SoilCropSuitabilityInsight } from '../../../shared/types';
import { useApp } from '../../context/AppContext';
import { Sprout, CheckCircle2, AlertTriangle, Droplets, ArrowRight } from 'lucide-react';

interface SoilCropSuitabilityMatrixProps {
  suitability: SoilCropSuitabilityInsight;
  language: string;
}

export const SoilCropSuitabilityMatrix: React.FC<SoilCropSuitabilityMatrixProps> = ({ suitability, language }) => {
  const { setCurrentView } = useApp();

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Sprout className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-stone-900">
              {language === 'hi' ? 'मृदा उपयुक्तता एवं फसल अनुकूलता' : 'Soil → Crop Compatibility & Irrigation Profile'}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {language === 'hi'
              ? 'आपकी मिट्टी की संरचना और रसायन के अनुसार सर्वोत्तम फसलें एवं सिंचाई निर्देश।'
              : 'Direct agronomic correlation between your soil chemistry (Vertisol, pH 7.4) and compatible commercial crops.'}
          </p>
        </div>

        <button
          onClick={() => setCurrentView('crop-recommendation')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B3B11] hover:text-green-700 bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
        >
          <span>Run AI Crop Recommendation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Highly Suitable Crops Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Optimal & Highly Suitable Crops</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(suitability.highlySuitableCrops || suitability.suitableCrops || []).map((crop, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">{crop.cropName}</span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {crop.suitabilityScore || crop.matchScore || 95}% Match
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">{crop.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Less Suitable / Requiring Modification */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Restricted or Requiring Soil Amendment</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(suitability.lessSuitableCrops || []).map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">{item.cropName}</span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  {item.constraint || item.concern || 'Soil Limitation'}
                </span>
              </div>
              <div className="text-xs text-stone-600">
                <span className="font-semibold text-stone-800">Required Amendment:</span> {item.requiredModification || item.remedyIfGrown || 'Apply organic soil conditioners'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Soil Texture & Irrigation Dynamics */}
      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <Droplets className="w-4 h-4 text-blue-600" />
          <span>Soil Physical Texture & Irrigation Strategy</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <div className="text-[10px] font-bold text-stone-400 uppercase">Soil Texture</div>
            <div className="font-bold text-stone-900 mt-0.5">{suitability.soilTexture || 'Clay Loam (Vertisol)'}</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <div className="text-[10px] font-bold text-stone-400 uppercase">Water Retention Capacity</div>
            <div className="font-bold text-emerald-800 mt-0.5">{suitability.waterRetentionCapacity || 'High (60-65%)'}</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <div className="text-[10px] font-bold text-stone-400 uppercase">Infiltration Rate</div>
            <div className="font-bold text-stone-900 mt-0.5">{suitability.infiltrationRate || 'Moderate (8-12 mm/hr)'}</div>
          </div>
        </div>

        <div className="text-xs text-stone-700 leading-relaxed bg-white p-3.5 rounded-xl border border-stone-200/80">
          <span className="font-bold text-stone-900">Irrigation Recommendation:</span> {suitability.irrigationRecommendation || 'High clay content requires controlled pulse irrigation to prevent waterlogging and maintain root aeration.'}
        </div>
      </div>
    </div>
  );
};
