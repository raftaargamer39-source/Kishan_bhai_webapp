import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight, RefreshCw, MapPin, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface MandiRate {
  id: string;
  crop: string;
  cropHi: string;
  variety: string;
  mandi: string;
  state: string;
  modalPrice: number; // in ₹ per Quintal
  mspPrice: number;
  prevPrice: number;
  unit: string;
  arrivalTons: number;
}

const LIVE_MANDI_DATA: MandiRate[] = [
  {
    id: 'm1',
    crop: 'Cotton (Kapas)',
    cropHi: 'कपास (शंकर-6)',
    variety: 'Shankar-6 Medium Long',
    mandi: 'Rajkot APMC',
    state: 'Gujarat',
    modalPrice: 7420,
    mspPrice: 7020,
    prevPrice: 7310,
    unit: '₹/Quintal',
    arrivalTons: 1450,
  },
  {
    id: 'm2',
    crop: 'Wheat (Gehun)',
    cropHi: 'गेहूं (शरबती)',
    variety: 'Sharbati MP Gold',
    mandi: 'Indore APMC',
    state: 'Madhya Pradesh',
    modalPrice: 2840,
    mspPrice: 2275,
    prevPrice: 2805,
    unit: '₹/Quintal',
    arrivalTons: 3200,
  },
  {
    id: 'm3',
    crop: 'Groundnut (Mungfali)',
    cropHi: 'मूंगफली',
    variety: 'TAG-24 Bold',
    mandi: 'Gondal APMC',
    state: 'Gujarat',
    modalPrice: 6380,
    mspPrice: 6780,
    prevPrice: 6290,
    unit: '₹/Quintal',
    arrivalTons: 890,
  },
  {
    id: 'm4',
    crop: 'Mustard (Sarson)',
    cropHi: 'सरसों',
    variety: 'Yellow 42% Oil',
    mandi: 'Jaipur APMC',
    state: 'Rajasthan',
    modalPrice: 5720,
    mspPrice: 5650,
    prevPrice: 5680,
    unit: '₹/Quintal',
    arrivalTons: 1100,
  },
  {
    id: 'm5',
    crop: 'Soybean (Soya)',
    cropHi: 'सोयाबीन',
    variety: 'JS-335 Yellow',
    mandi: 'Latur APMC',
    state: 'Maharashtra',
    modalPrice: 4890,
    mspPrice: 4892,
    prevPrice: 4910,
    unit: '₹/Quintal',
    arrivalTons: 2150,
  },
  {
    id: 'm6',
    crop: 'Gram (Chana)',
    cropHi: 'चना (देशी)',
    variety: 'Desi Bold',
    mandi: 'Bikaner APMC',
    state: 'Rajasthan',
    modalPrice: 6150,
    mspPrice: 5440,
    prevPrice: 6090,
    unit: '₹/Quintal',
    arrivalTons: 640,
  },
];

export const MandiTicker: React.FC = () => {
  const { language, setCurrentView } = useApp();
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const filteredRates = selectedState === 'ALL'
    ? LIVE_MANDI_DATA
    : LIVE_MANDI_DATA.filter((r) => r.state.toUpperCase().includes(selectedState.toUpperCase()));

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="bg-white dark:bg-[#141C18] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-3.5 sm:p-4 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-stone-100 dark:border-stone-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-700/20 text-emerald-800 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'hi' ? 'लाइव मंडी' : 'Agmarknet APMC'}
            </span>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {language === 'hi' ? 'दैनिक कृषि मंडी लाइव भाव' : 'Daily Mandi Arrivals & Real-Time Rates'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* State Filter Buttons */}
          <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-stone-900 p-1 rounded-xl border border-stone-200/70 dark:border-stone-800 text-[11px] font-medium">
            {['ALL', 'Gujarat', 'Madhya Pradesh', 'Rajasthan', 'Maharashtra'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                  selectedState === st 
                    ? 'bg-emerald-800 text-white font-bold shadow-2xs' 
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {st === 'ALL' ? (language === 'hi' ? 'सभी राज्य' : 'All Mandis') : st.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={handleManualRefresh}
            title="Refresh Mandi Ticker"
            className="p-1.5 rounded-xl text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-700' : ''}`} />
          </button>

          <button
            onClick={() => setCurrentView('market-prices')}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer ml-1"
          >
            <span>{language === 'hi' ? 'विस्तार से' : 'Full Radar'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of Commodity Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3">
        {filteredRates.map((rate) => {
          const diff = rate.modalPrice - rate.prevPrice;
          const isUp = diff >= 0;
          const pctChange = ((diff / rate.prevPrice) * 100).toFixed(1);
          const mspDiff = rate.modalPrice - rate.mspPrice;

          return (
            <div
              key={rate.id}
              onClick={() => setCurrentView('market-prices')}
              className="bg-[#FAF8F5] dark:bg-stone-900/70 hover:bg-white dark:hover:bg-stone-900 p-3 rounded-xl border border-stone-200/80 dark:border-stone-800 hover:border-emerald-600/50 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 truncate">
                      {language === 'hi' ? rate.cropHi : rate.crop.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate flex items-center gap-0.5 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                      <span className="truncate">{rate.mandi}</span>
                    </div>
                  </div>

                  <div className={`text-[10px] font-bold flex items-center px-1.5 py-0.5 rounded-md ${
                    isUp 
                      ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                      : 'bg-rose-100/70 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                  }`}>
                    {isUp ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                    <span>{isUp ? `+${pctChange}%` : `${pctChange}%`}</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <div className="font-mono font-bold text-base text-stone-900 dark:text-stone-100 tracking-tight tabular-nums">
                    ₹{rate.modalPrice.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono">/क्विंटल</div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-800/80 text-[10px] flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span>MSP ₹{rate.mspPrice}</span>
                <span className={`font-semibold tabular-nums ${mspDiff >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {mspDiff >= 0 ? `+₹${mspDiff}` : `-₹${Math.abs(mspDiff)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
