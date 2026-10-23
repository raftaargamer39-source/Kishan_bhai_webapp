import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  FlaskConical,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sprout,
  FileText,
  MapPin,
  Sparkles,
  Info,
  Calendar,
  Download,
  Share2,
  Printer,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { SoilMacroNutrients } from '../components/soil/SoilMacroNutrients';
import { SoilMicroNutrients } from '../components/soil/SoilMicroNutrients';
import { SoilImprovementTabs } from '../components/soil/SoilImprovementTabs';
import { SoilHistoryTracker } from '../components/soil/SoilHistoryTracker';
import { SoilCropSuitabilityMatrix } from '../components/soil/SoilCropSuitabilityMatrix';
import { SoilReportModal } from '../components/soil/SoilReportModal';

export const SoilHealthPage: React.FC = () => {
  const {
    soilHealth,
    soilHistory,
    soilImprovementPlans,
    soilCropSuitability,
    language,
    setCurrentView,
    resetSoilToInitial,
    askAiWithPrompt,
    addToast,
  } = useApp();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleAskAI = () => {
    askAiWithPrompt(
      `My soil test shows pH ${soilHealth.soilPh}, Organic Carbon ${soilHealth.organicCarbonPct}%, Nitrogen ${soilHealth.nitrogenKgHa} kg/ha, Phosphorus ${soilHealth.phosphorusKgHa} kg/ha, Potassium ${soilHealth.potassiumKgHa} kg/ha in ${soilHealth.village}, ${soilHealth.district}. What fertilizer and crop management do you recommend?`
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1B3B11] via-[#244A17] to-green-700 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>{language === 'hi' ? 'डिजिटल मृदा स्वास्थ्य कार्ड' : 'Soil Health Intelligence (SHC)'}</span>
            <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px]">
              Govt. Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'hi' ? 'मृदा स्वास्थ्य और पोषक तत्व विश्लेषण' : 'Soil Health Card & Soil Nutrients'}
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {language === 'hi'
              ? 'खेत की मिट्टी का रासायनिक, जैविक एवं सूक्ष्म पोषक तत्व विश्लेषण। एन-पी-के संतुलन, जैविक कार्बन संवर्धन और फसल उपयुक्तता।'
              : 'Complete laboratory breakdown of macro-nutrients (N-P-K), micronutrients, soil pH, and organic carbon rejuvenation roadmap.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-emerald-200/90 font-medium">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{soilHealth.village}, {soilHealth.district}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tested: {soilHealth.testDate}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>SHC #{soilHealth.sampleId}</span>
            </div>
          </div>
        </div>

        {/* Soil Health Score Badge & CTAs */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
          <div className="bg-emerald-950/70 border border-emerald-500/40 p-4 rounded-2xl backdrop-blur-md flex items-center gap-3.5 w-full sm:w-auto">
            <div className="text-center">
              <div className="text-3xl font-black text-white font-display">
                {soilHealth.soilHealthScore || 82}
                <span className="text-xs text-emerald-300 font-normal">/100</span>
              </div>
              <div className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-wider">Health Index</div>
            </div>
            <div className="h-9 w-px bg-emerald-700/50" />
            <div className="text-xs">
              <div className="font-bold text-white">{soilHealth.scoreClassification || 'Good Fertility Index'}</div>
              <div className="text-emerald-200/80 text-[11px]">Vertisol Clay Loam</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer text-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Soil Report</span>
            </button>

            <button
              onClick={handleAskAI}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer text-xs"
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <span>Ask AI Advisor</span>
            </button>

            <button
              onClick={handlePrint}
              title="Print or Save PDF"
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={resetSoilToInitial}
              title="Reset to Baseline"
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Macro-Nutrient & Chemistry Benchmarks */}
      <SoilMacroNutrients soilHealth={soilHealth} language={language} />

      {/* Secondary & Micronutrient Profile */}
      <SoilMicroNutrients micronutrients={soilHealth.micronutrients} language={language} />

      {/* Actionable Improvement Roadmap */}
      <SoilImprovementTabs plans={soilImprovementPlans} language={language} />

      {/* Soil Crop Suitability Matrix */}
      <SoilCropSuitabilityMatrix suitability={soilCropSuitability} language={language} />

      {/* Multi-Year Soil Testing History */}
      <SoilHistoryTracker history={soilHistory} language={language} />

      {/* Soil Report Upload Modal */}
      <SoilReportModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};
