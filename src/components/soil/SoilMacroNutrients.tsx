import React from 'react';
import { SoilHealthData } from '../../../shared/types';
import { Layers, Zap, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SoilMacroNutrientsProps {
  soilHealth: SoilHealthData;
  language: string;
}

export const SoilMacroNutrients: React.FC<SoilMacroNutrientsProps> = ({ soilHealth, language }) => {
  // N status calculation: max scale 600 kg/ha
  const nPct = Math.min(100, Math.round((soilHealth.nitrogenKgHa / 560) * 100));
  // P status calculation: max scale 60 kg/ha
  const pPct = Math.min(100, Math.round((soilHealth.phosphorusKgHa / 56) * 100));
  // K status calculation: max scale 400 kg/ha
  const kPct = Math.min(100, Math.round((soilHealth.potassiumKgHa / 380) * 100));
  // OC status calculation: max scale 1.2%
  const ocPct = Math.min(100, Math.round((soilHealth.organicCarbonPct / 1.0) * 100));
  // pH status calculation: scale 4 to 10
  const phPct = Math.min(100, Math.max(0, Math.round(((soilHealth.soilPh - 4) / 6) * 100)));

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-stone-900">
              {language === 'hi' ? 'प्राथमिक पोषक तत्व (N - P - K) व मृदा रसायन' : 'Macro-Nutrient & Chemistry Benchmarks'}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {language === 'hi'
              ? 'भारतीय कृषि अनुसंधान परिषद (ICAR) एवं मृदा स्वास्थ्य कार्ड मानकों के अनुसार विश्लेषण।'
              : 'Tested laboratory values per hectare calibrated against Indian Council of Agricultural Research (ICAR) fertility indices.'}
          </p>
        </div>
        <div className="text-xs font-mono bg-stone-100 text-stone-700 px-3 py-1.5 rounded-xl border border-stone-200 self-start sm:self-auto">
          Sample ID: <span className="font-bold">{soilHealth.sampleId}</span>
        </div>
      </div>

      {/* Grid of Key Nutrients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Nitrogen (N) */}
        <div className="bg-stone-50/90 rounded-2xl p-4 border border-stone-200/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Nitrogen (N) • नाइट्रोजन
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  soilHealth.nitrogenStatus === 'Low'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : soilHealth.nitrogenStatus === 'Medium'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {soilHealth.nitrogenStatus}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900 font-display">
                {soilHealth.nitrogenKgHa}
              </span>
              <span className="text-xs font-semibold text-stone-500">kg / hectare</span>
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-[11px] text-stone-500 font-medium">
                <span>0</span>
                <span className="text-emerald-700 font-bold">Ideal: 280-560 kg/ha</span>
                <span>600</span>
              </div>
              <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    soilHealth.nitrogenKgHa < 280 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${nPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200/60 text-[11px] text-stone-600 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
            <span>
              {soilHealth.nitrogenKgHa < 280
                ? 'Deficient in nitrogen. Top-dress with split urea / neem-coated urea and bio-fertilizers.'
                : 'Adequate vegetative growth support.'}
            </span>
          </div>
        </div>

        {/* Available Phosphorus (P) */}
        <div className="bg-stone-50/90 rounded-2xl p-4 border border-stone-200/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Phosphorus (P) • फास्फोरस
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  soilHealth.phosphorusStatus === 'Low'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : soilHealth.phosphorusStatus === 'Medium'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {soilHealth.phosphorusStatus}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900 font-display">
                {soilHealth.phosphorusKgHa}
              </span>
              <span className="text-xs font-semibold text-stone-500">kg / hectare</span>
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-[11px] text-stone-500 font-medium">
                <span>0</span>
                <span className="text-emerald-700 font-bold">Ideal: 23-56 kg/ha</span>
                <span>60</span>
              </div>
              <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${pPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200/60 text-[11px] text-stone-600 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
            <span>
              Apply Single Super Phosphate (SSP) or DAP as basal dose during land preparation for root vigor.
            </span>
          </div>
        </div>

        {/* Available Potassium (K) */}
        <div className="bg-stone-50/90 rounded-2xl p-4 border border-stone-200/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Potassium (K) • पोटाश
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                {soilHealth.potassiumStatus}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900 font-display">
                {soilHealth.potassiumKgHa}
              </span>
              <span className="text-xs font-semibold text-stone-500">kg / hectare</span>
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-[11px] text-stone-500 font-medium">
                <span>0</span>
                <span className="text-emerald-700 font-bold">Ideal: 145-335 kg/ha</span>
                <span>400</span>
              </div>
              <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${kPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200/60 text-[11px] text-stone-600 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
            <span>High reserve of native potassium in Vertisols supports heavy boll/grain development.</span>
          </div>
        </div>
      </div>

      {/* Secondary Row: pH, Organic Carbon, Electrical Conductivity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="text-xs font-bold text-stone-600">Soil Reaction (pH)</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-stone-900 font-display">{soilHealth.soilPh}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {soilHealth.phStatus}
            </span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1.5">
            Optimal Range: 6.5 - 7.8 (Excellent nutrient absorption)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="text-xs font-bold text-stone-600">Organic Carbon (OC %)</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-stone-900 font-display">{soilHealth.organicCarbonPct}%</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {soilHealth.organicCarbonStatus}
            </span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1.5">
            Target Benchmark: &gt; 0.75% (Apply 4-5 tonnes FYM/acre)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="text-xs font-bold text-stone-600">Electrical Conductivity (EC)</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-stone-900 font-display">
              {soilHealth.electricalConductivityDsM} <span className="text-xs font-normal text-stone-500">dS/m</span>
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Normal
            </span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1.5">
            Threshold: &lt; 0.8 dS/m (Safe from root salinity stress)
          </div>
        </div>
      </div>
    </div>
  );
};
