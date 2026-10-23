import React from 'react';
import { MicronutrientMetric } from '../../../shared/types';
import { FlaskConical, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SoilMicroNutrientsProps {
  micronutrients: MicronutrientMetric[];
  language: string;
}

export const SoilMicroNutrients: React.FC<SoilMicroNutrientsProps> = ({ micronutrients, language }) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
            <FlaskConical className="w-4 h-4" />
          </span>
          <h3 className="font-bold text-stone-900 text-base">
            {language === 'hi' ? 'सूक्ष्म पोषक तत्व विश्लेषण (Micronutrient Profile)' : 'Secondary & Micronutrient Profile'}
          </h3>
        </div>
        <span className="text-xs text-stone-500">Atomic Absorption Spectroscopy Tested</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {micronutrients.map((micro, idx) => {
          const isDeficient = micro.status === 'Deficient';
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isDeficient
                  ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                  : 'bg-stone-50 border-stone-200/80 hover:border-stone-300'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-stone-700">{micro.name}</div>
                <div className="text-lg font-extrabold text-stone-900 mt-1.5 font-display">{micro.value}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-200/60">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      isDeficient
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isDeficient ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    <span>{micro.status}</span>
                  </span>
                </div>
                {micro.ideal && (
                  <div className="text-[10px] text-stone-500 mt-1 font-mono">
                    Ideal: {micro.ideal}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-stone-900">Agronomist Recommendation:</span> Zinc and Boron deficiency detected. Apply Zinc Sulphate 21% @ 10 kg/acre (basal) and foliar spray Solubor (Boron 20%) @ 1g/L at pre-flowering for enhanced pod and boll set.
        </div>
      </div>
    </div>
  );
};
