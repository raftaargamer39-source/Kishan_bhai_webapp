import React, { useState } from 'react';
import {
  Droplets,
  Bug,
  TrendingUp,
  Tractor,
  Package,
  FileText,
  Sparkles,
  Sprout,
  HelpCircle,
  Coins,
  Camera,
} from 'lucide-react';

interface Props {
  onSelectPrompt: (prompt: string, sampleImage?: string) => void;
  language: string;
}

export const AIQuickPrompts: React.FC<Props> = ({ onSelectPrompt, language }) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'IRRIGATION' | 'DISEASE' | 'MARKET' | 'COMMERCE'>('ALL');

  const sampleLeafSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%232d3748"/><path d="M150 20 C230 40, 260 140, 150 180 C40 140, 70 40, 150 20 Z" fill="%2348bb78"/><circle cx="120" cy="80" r="14" fill="%23744210"/><circle cx="165" cy="110" r="18" fill="%23744210"/><circle cx="140" cy="135" r="10" fill="%23b7791f"/><text x="20" y="190" fill="white" font-size="12">Sample: Cotton Leaf Spot Sample</text></svg>`;

  const prompts = [
    {
      id: 'irrigation_wheat',
      category: 'IRRIGATION',
      icon: Droplets,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50/80',
      title: language === 'hi' ? 'क्या आज गेहूँ में पानी दें?' : 'Should I water my wheat today?',
      subtitle: language === 'hi' ? 'नमी सेंसर व वर्षा पूर्वानुमान' : 'Checks soil moisture & 70% rain forecast',
      query: 'Should I water my wheat today considering live soil moisture and rain forecast?',
    },
    {
      id: 'disease_scan',
      category: 'DISEASE',
      icon: Bug,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50/80',
      title: language === 'hi' ? 'पत्तियों में पीलापन व धब्बे की जांच' : 'Check leaf disease & yellow spots',
      subtitle: language === 'hi' ? 'कंप्यूटर विजन रोग पहचान' : 'Fungal diagnosis & foliar spray remedies',
      query: 'Please analyze my crop for yellow leaf spots, pathogen infection, and provide immediate treatment plan.',
      sampleImage: sampleLeafSvg,
    },
    {
      id: 'market_sell',
      category: 'MARKET',
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      title: language === 'hi' ? 'फसल कहाँ बेचें? (मंडी भाव)' : 'Where should I sell my crop?',
      subtitle: language === 'hi' ? 'गोंडल vs राजकोट APMC भाव तुलना' : 'Compares Gondal APMC vs regional rates',
      query: 'Where should I sell my Sharbati wheat and cotton harvest to maximize price realization?',
    },
    {
      id: 'what_to_grow',
      category: 'COMMERCE',
      icon: Sprout,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/80',
      title: language === 'hi' ? 'आगामी सीजन में क्या उगाएं?' : 'What should I grow next season?',
      subtitle: language === 'hi' ? 'काली मिट्टी व कम पानी की फसलें' : 'Optimal crops for Black Soil & low water',
      query: 'What crop should I grow in the upcoming season for maximum net profit on medium black soil?',
    },
    {
      id: 'fertilizer_pool',
      category: 'COMMERCE',
      icon: Package,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50/80',
      title: language === 'hi' ? 'सामूहिक DAP खाद आर्डर बनाएं' : 'Create 250-Bag DAP Group Pool',
      subtitle: language === 'hi' ? '20% थोक छूट पर क्लस्टर डिमांड' : 'Autonomous state modification & wholesale discount',
      query: 'Create a collective bulk order requirement for 250 bags of IFFCO DAP fertilizer at 20% discount',
    },
    {
      id: 'government_schemes',
      category: 'COMMERCE',
      icon: FileText,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/80',
      title: language === 'hi' ? 'सरकारी योजनाएं व 90% सोलर सब्सिडी' : 'Find Government Schemes & Subsidies',
      subtitle: language === 'hi' ? 'PM-KUSUM व पीएम किसान' : 'PM-KUSUM 90% solar pump & PM-KISAN guidance',
      query: 'What government subsidies and agricultural schemes am I eligible for in Gujarat?',
    },
  ];

  const filteredPrompts = activeCategory === 'ALL'
    ? prompts
    : prompts.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-3">
      {/* Category Pills Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-medium scrollbar-none">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'ALL'
                ? 'bg-green-700 text-white font-bold shadow-2xs'
                : 'bg-white/80 text-stone-600 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            {language === 'hi' ? 'सभी प्रश्न' : 'All Topics'}
          </button>

          <button
            onClick={() => setActiveCategory('IRRIGATION')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeCategory === 'IRRIGATION'
                ? 'bg-blue-700 text-white font-bold shadow-2xs'
                : 'bg-white/80 text-stone-600 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <Droplets className="w-3 h-3 text-blue-500" />
            <span>{language === 'hi' ? 'सिंचाई सलाह' : 'Irrigation'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('DISEASE')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeCategory === 'DISEASE'
                ? 'bg-rose-700 text-white font-bold shadow-2xs'
                : 'bg-white/80 text-stone-600 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <Bug className="w-3 h-3 text-rose-500" />
            <span>{language === 'hi' ? 'रोग व कीट' : 'Disease & Pest'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('MARKET')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeCategory === 'MARKET'
                ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                : 'bg-white/80 text-stone-600 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>{language === 'hi' ? 'मंडी भाव' : 'Mandi Rates'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('COMMERCE')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeCategory === 'COMMERCE'
                ? 'bg-purple-700 text-white font-bold shadow-2xs'
                : 'bg-white/80 text-stone-600 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <Package className="w-3 h-3 text-purple-500" />
            <span>{language === 'hi' ? 'खाद व योजनाएं' : 'Inputs & Schemes'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredPrompts.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPrompt(p.query, p.sampleImage)}
              className="text-left bg-white/80 hover:bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-xs transition-all hover:border-emerald-500/50 cursor-pointer active:scale-[0.99] flex items-start gap-3 group"
            >
              <div className={`w-8 h-8 rounded-xl ${p.bgColor} ${p.iconColor} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-stone-900 group-hover:text-green-700 transition-colors truncate">
                  {p.title}
                </div>
                <div className="text-[11px] text-stone-500 truncate mt-0.5">
                  {p.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
