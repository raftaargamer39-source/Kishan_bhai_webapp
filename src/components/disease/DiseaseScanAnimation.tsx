import React from 'react';
import { Sparkles, CheckCircle2, Loader2, Scan } from 'lucide-react';

interface DiseaseScanAnimationProps {
  currentStep: number;
  steps: string[];
  scanProgress: number;
  imageUrl?: string | null;
}

export const DiseaseScanAnimation: React.FC<DiseaseScanAnimationProps> = ({
  currentStep,
  steps,
  scanProgress,
  imageUrl,
}) => {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-stone-900 border border-emerald-500/30 p-6 flex flex-col items-center justify-center min-h-[380px] text-white shadow-xl">
      {/* Background Image with blur and dark overlay */}
      {imageUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={imageUrl}
            alt="Crop analysis target"
            className="w-full h-full object-cover opacity-35 scale-105 filter blur-xs"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-emerald-950/70 to-stone-950/90" />
        </div>
      )}

      {/* High-tech Scanning Laser Beam */}
      <div
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] z-10 transition-all duration-300 pointer-events-none"
        style={{
          top: `${Math.min(95, Math.max(5, (scanProgress % 100)))}%`,
        }}
      />

      {/* Grid overlay for computer vision aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Central Radar & Spinner */}
      <div className="relative z-20 flex flex-col items-center max-w-md text-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Scan className="w-8 h-8 text-emerald-300 animate-pulse" />
          </div>
          <div className="absolute -inset-1 rounded-full border border-emerald-400/40 animate-ping opacity-30" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>AI Computer Vision Engine</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {steps[currentStep] || 'Analyzing Crop...'}
          </h3>
          <p className="text-xs text-emerald-200/80 mt-1">
            Extracting leaf morphology, chlorosis patterns & pathogen markers
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-800/80 rounded-full h-2.5 overflow-hidden border border-emerald-500/30 shadow-inner">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full transition-all duration-200 rounded-full shadow-[0_0_10px_#10b981]"
            style={{ width: `${scanProgress}%` }}
          />
        </div>
        <div className="flex justify-between w-full text-[11px] text-stone-400 font-mono">
          <span>Processing frames</span>
          <span className="text-emerald-300 font-bold">{scanProgress}%</span>
        </div>

        {/* Multi-step progression checklist */}
        <div className="w-full bg-stone-950/60 backdrop-blur-md rounded-xl p-3 border border-emerald-500/20 text-left space-y-1.5 mt-2">
          {steps.map((stepText, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2 text-xs transition-colors ${
                  isDone
                    ? 'text-emerald-300 font-medium'
                    : isCurrent
                    ? 'text-white font-bold'
                    : 'text-stone-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-stone-600 shrink-0" />
                )}
                <span className="truncate">{stepText}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
