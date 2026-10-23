import React, { useState } from 'react';
import { Sprout, Droplets, CloudRain, TrendingUp, MapPin, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../../../shared/types';

interface Props {
  currentUser?: UserProfile | null;
  language: string;
}

export const AIFarmContextBadge: React.FC<Props> = ({ currentUser, language }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const farmerName = currentUser?.fullName || 'Ramesh Patel';
  const village = currentUser?.village || 'Anandpur';
  const state = currentUser?.state || 'Gujarat';
  const landholding = currentUser?.farmSizeAcres || 4.5;
  const primaryCrop = currentUser?.crops?.[0] || 'Sharbati Wheat';

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden transition-all">
      {/* Summary Header Strip */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/80 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-green-700 flex items-center justify-center font-bold text-xs shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900">
                {language === 'hi' ? 'खेत का लाइव डेटा कनेक्टेड' : 'Live Farm Context Active'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {village}, {state}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 truncate max-w-xs sm:max-w-md">
              {language === 'hi'
                ? `${primaryCrop} (${landholding} एकड़) • नमी: 42% • कल 70% बारिश का अनुमान`
                : `${primaryCrop} (${landholding} Acres) • Soil Moisture: 42% • Rain Forecast: 70%`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Quick Tags */}
          <div className="hidden md:flex items-center gap-2 text-[11px] font-medium text-stone-700">
            <span className="inline-flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-lg">
              <Droplets className="w-3 h-3 text-blue-600" />
              <span>Moisture: 42%</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-lg">
              <CloudRain className="w-3 h-3 text-sky-600" />
              <span>Rain: 70% (14mm)</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>Mandi: ₹2,680/Qtl</span>
            </span>
          </div>

          <button
            type="button"
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            title="Toggle details"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Live Telemetry Drawer */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50/50">
          <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 shadow-2xs">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mb-1">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Crop & Stage</span>
            </div>
            <div className="font-bold text-stone-900">{primaryCrop}</div>
            <div className="text-[10px] text-stone-500">Day 68 • CRI / Tillering Stage</div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 shadow-2xs">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mb-1">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <span>Soil IoT Sensor</span>
            </div>
            <div className="font-bold text-stone-900">42% (Optimal)</div>
            <div className="text-[10px] text-stone-500">Medium Black Loamy Soil</div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 shadow-2xs">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mb-1">
              <CloudRain className="w-3.5 h-3.5 text-sky-600" />
              <span>Tomorrow Weather</span>
            </div>
            <div className="font-bold text-stone-900">29.5°C • 70% Rain</div>
            <div className="text-[10px] text-stone-500">Heavy Showers (14-18mm)</div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 shadow-2xs">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nearest APMC Mandi</span>
            </div>
            <div className="font-bold text-stone-900">Gondal @ ₹2,680/Qtl</div>
            <div className="text-[10px] text-emerald-600 font-semibold">+₹140 Above MSP</div>
          </div>
        </div>
      )}
    </div>
  );
};
