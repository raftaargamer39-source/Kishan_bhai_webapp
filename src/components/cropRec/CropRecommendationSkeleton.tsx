import React, { useState, useEffect } from 'react';
import { Sparkles, Sprout, Loader2, Database, TrendingUp, ShieldCheck } from 'lucide-react';

interface CropRecommendationSkeletonProps {
  language?: string;
}

export const CropRecommendationSkeleton: React.FC<CropRecommendationSkeletonProps> = ({ language }) => {
  const isHi = language === 'hi';

  const processingSteps = isHi
    ? [
        'मृदा स्वास्थ्य (pH, नाइट्रोजन, फास्फोरस, पोटाश) का विश्लेषण...',
        'आईसीएआर (ICAR) कृषि-जलवायु मॉडल से फसल मिलान...',
        'ताजा मंडी भाव और एमएसपी (MSP) लाभ मार्जिन की गणना...',
        'आपके खेत के लिए शीर्ष फसल सिफारिशें तैयार की जा रही हैं...',
      ]
    : [
        'Analyzing soil profile (pH, N-P-K, organic carbon & moisture)...',
        'Cross-referencing ICAR agro-climatic zones & seasonal suitability...',
        'Benchmarking local APMC Mandi rates & minimum support price (MSP)...',
        'Synthesizing top-yield rankings & personalized farmer advisory...',
      ];

  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev + 1) % processingSteps.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [processingSteps.length]);

  return (
    <div
      id="crop-advisor-loading-skeleton"
      className="space-y-6 animate-fadeIn transition-all duration-300"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Active AI Computation Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#16350E] to-stone-900 border border-emerald-500/40 rounded-2xl p-6 sm:p-7 shadow-xl text-white relative overflow-hidden">
        {/* Shimmer Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent animate-shimmer pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center shrink-0 shadow-inner">
              <Loader2 className="w-6 h-6 text-emerald-300 animate-spin" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                  {isHi ? 'एआई फसल सलाहकार सक्रिय' : 'Kishan Bhai AI Processing'}
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                {isHi ? 'कृषि डेटा का गहरा विश्लेषण जारी है...' : 'Evaluating Optimal Crops for Your Land...'}
              </h3>

              <p className="text-xs sm:text-sm text-emerald-200/90 flex items-center gap-2 transition-all duration-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{processingSteps[currentStepIdx]}</span>
              </p>
            </div>
          </div>

          {/* Micro Telemetry Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-emerald-800/60">
            <div className="flex items-center gap-1.5 bg-black/30 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[11px] text-emerald-200">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>ICAR Crop Matrix</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/30 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[11px] text-emerald-200">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>APMC Live MSP</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/30 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[11px] text-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Agronomist Verified</span>
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="mt-5 pt-4 border-t border-emerald-800/60">
          <div className="w-full bg-emerald-950/80 rounded-full h-2 overflow-hidden border border-emerald-800/40 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full rounded-full transition-all duration-700 ease-out animate-pulse"
              style={{ width: `${Math.min(96, (currentStepIdx + 1) * 25)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-emerald-300/80 mt-2 font-mono">
            <span>{isHi ? 'चरण' : 'Step'} {currentStepIdx + 1} of 4</span>
            <span className="flex items-center gap-1">
              <Sprout className="w-3 h-3 text-emerald-400 animate-bounce" />
              {isHi ? 'अनुशंसा पत्र तैयार किया जा रहा है' : 'Computing ROI & Suitability Index'}
            </span>
          </div>
        </div>
      </div>

      {/* Skeleton AI Agronomist Synthesis Callout */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-[#1B3B11]/40 border border-emerald-500/20 rounded-2xl p-6 shadow-sm space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-700/50 rounded-full" />
            <div className="h-4 w-40 bg-emerald-700/40 rounded-md" />
          </div>
          <div className="h-3 w-28 bg-emerald-700/30 rounded-md" />
        </div>
        <div className="space-y-2 pt-1">
          <div className="h-3.5 w-full bg-emerald-800/40 rounded-md" />
          <div className="h-3.5 w-4/5 bg-emerald-800/30 rounded-md" />
        </div>
        <div className="pt-2 border-t border-emerald-800/40 flex justify-between gap-4">
          <div className="h-3 w-36 bg-emerald-800/30 rounded-md" />
          <div className="h-3 w-40 bg-emerald-800/30 rounded-md" />
        </div>
      </div>

      {/* Header Skeleton */}
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-1.5 animate-pulse">
          <div className="h-6 w-56 bg-stone-300 dark:bg-stone-700 rounded-lg" />
          <div className="h-3.5 w-80 bg-stone-200 dark:bg-stone-800 rounded-md" />
        </div>
        <div className="h-9 w-32 bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse" />
      </div>

      {/* 3 Ranked Crop Skeleton Cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((itemRank) => (
          <div
            key={itemRank}
            className="rounded-2xl p-6 sm:p-6 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-5 animate-pulse"
          >
            {/* Top Banner Row Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-stone-200 dark:bg-stone-800 shrink-0 flex items-center justify-center font-bold text-stone-400">
                  #{itemRank}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="h-6 w-36 sm:w-48 bg-stone-300 dark:bg-stone-700 rounded-md" />
                    <div className="h-5 w-24 bg-stone-200 dark:bg-stone-800 rounded-md" />
                    <div className="h-4 w-32 bg-stone-200 dark:bg-stone-800 rounded-md" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3.5 w-20 bg-stone-200 dark:bg-stone-800 rounded" />
                    <div className="h-3.5 w-24 bg-stone-200 dark:bg-stone-800 rounded" />
                    <div className="h-3.5 w-28 bg-stone-200 dark:bg-stone-800 rounded" />
                  </div>
                </div>
              </div>

              {/* Gauge Placeholder */}
              <div className="flex flex-col items-end gap-1.5 self-start">
                <div className="h-8 w-20 bg-emerald-100 dark:bg-emerald-950/60 rounded-lg" />
                <div className="h-4 w-24 bg-stone-200 dark:bg-stone-800 rounded-full" />
              </div>
            </div>

            {/* Financial Metrics Bento Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((metric) => (
                <div
                  key={metric}
                  className={`p-3.5 rounded-2xl border ${
                    metric === 4
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                      : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200/80 dark:border-stone-800'
                  }`}
                >
                  <div className="h-2.5 w-16 bg-stone-200 dark:bg-stone-700 rounded mb-2" />
                  <div className="h-5 w-20 bg-stone-300 dark:bg-stone-600 rounded" />
                  <div className="h-2 w-12 bg-stone-200 dark:bg-stone-700 rounded mt-1.5" />
                </div>
              ))}
            </div>

            {/* Agronomic Reasons Bullets Skeleton */}
            <div className="bg-stone-50/70 dark:bg-stone-800/40 p-4 rounded-xl space-y-2 border border-stone-100 dark:border-stone-800">
              <div className="h-3 w-40 bg-stone-300 dark:bg-stone-700 rounded mb-2" />
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-200 dark:bg-emerald-900 shrink-0" />
                <div className="h-3 w-full max-w-lg bg-stone-200 dark:bg-stone-700 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-200 dark:bg-emerald-900 shrink-0" />
                <div className="h-3 w-4/5 bg-stone-200 dark:bg-stone-700 rounded" />
              </div>
            </div>

            {/* Bottom Actions Skeleton */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="h-8 w-32 bg-stone-200 dark:bg-stone-800 rounded-xl" />
              <div className="flex items-center gap-2">
                <div className="h-9 w-32 bg-stone-200 dark:bg-stone-800 rounded-xl" />
                <div className="h-9 w-36 bg-emerald-600/30 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
