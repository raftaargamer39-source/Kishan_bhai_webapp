import React from 'react';
import { SoilRecordHistoryItem } from '../../../shared/types';
import { Calendar, History, TrendingUp, CheckCircle, FileText } from 'lucide-react';

interface SoilHistoryTrackerProps {
  history: SoilRecordHistoryItem[];
  language: string;
}

export const SoilHistoryTracker: React.FC<SoilHistoryTrackerProps> = ({ history, language }) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <History className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-stone-900">
              {language === 'hi' ? 'मृदा परीक्षण इतिहास एवं सुधार ट्रैक' : 'Multi-Year Soil Testing & Fertility History'}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {language === 'hi'
              ? 'पिछले वर्षों के प्रयोगशाला परीक्षण परिणामों और मृदा स्वास्थ्य सूचकांक में हुई प्रगति का रिकॉर्ड।'
              : 'Chronological comparison of certified test reports showing fertility improvements over successive crop seasons.'}
          </p>
        </div>
      </div>

      {/* Comparison Cards / Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px] bg-stone-50/70">
              <th className="py-3 px-4 rounded-l-xl">Test Date / Year</th>
              <th className="py-3 px-4">Health Score</th>
              <th className="py-3 px-4">Organic Carbon (OC)</th>
              <th className="py-3 px-4">Nitrogen (N)</th>
              <th className="py-3 px-4">Phosphorus (P)</th>
              <th className="py-3 px-4">Potassium (K)</th>
              <th className="py-3 px-4">pH</th>
              <th className="py-3 px-4 rounded-r-xl">Tested By / Lab</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
            {history.map((record, idx) => (
              <tr key={record.id} className="hover:bg-stone-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-stone-900 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>{record.testDate}</span>
                  {idx === 0 && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                      Current
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-extrabold text-stone-900 font-display text-sm">{record.soilHealthScore || record.overallScore}</span>
                  <span className="text-[11px] text-stone-400 font-normal"> / 100</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-stone-900">{record.organicCarbonPct}%</span>
                </td>
                <td className="py-3.5 px-4">{record.nitrogenKgHa} kg/ha</td>
                <td className="py-3.5 px-4">{record.phosphorusKgHa} kg/ha</td>
                <td className="py-3.5 px-4">{record.potassiumKgHa} kg/ha</td>
                <td className="py-3.5 px-4 font-mono">{record.soilPh || record.ph || 7.4}</td>
                <td className="py-3.5 px-4 text-stone-500 truncate max-w-[200px]">
                  {record.testedBy || record.labName || 'Government Soil Lab'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-4 text-xs text-emerald-950 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <span className="font-bold">Soil Health Progress:</span> Organic carbon improved from 0.52% (2024) to 0.62% (2026) due to FYM application and chickpea pulse rotation.
          </div>
        </div>
      </div>
    </div>
  );
};
