import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Mic,
  X,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Sprout,
  Droplets,
  Bug,
  Building2,
  BookOpen,
  Calculator,
  PhoneCall,
  ShieldCheck,
  Tag,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchResultItem {
  id: string;
  title: string;
  hindiTitle: string;
  gujaratiTitle?: string;
  subtitle: string;
  category: 'tool' | 'mandi' | 'disease' | 'scheme' | 'crop';
  categoryLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  viewTarget: string;
  badge?: string;
  price?: string;
}

export const HomeSearchBar: React.FC = () => {
  const { language, setCurrentView } = useApp();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHi = language === 'hi';
  const isGu = language === 'gu';

  // Comprehensive Search Database
  const searchItems: SearchResultItem[] = useMemo(
    () => [
      // Primary Tools
      {
        id: 'tool_scanner',
        title: 'Crop Doctor (Leaf Disease Scanner)',
        hindiTitle: 'पत्ती का फोटो लें (फसल रोग पहचान)',
        gujaratiTitle: 'પાંદડાનો ફોટો લો (રોગ ઓળખ)',
        subtitle: 'Scan diseased leaves for instant diagnosis and certified spray prescription',
        category: 'tool',
        categoryLabel: isHi ? 'सुविधा' : 'Tool',
        icon: Bug,
        viewTarget: 'disease-scanner',
        badge: isHi ? 'कैमरा' : 'AI Doctor',
      },
      {
        id: 'tool_voice_ai',
        title: 'Voice Kisan AI (Ask Farming Questions)',
        hindiTitle: 'किसान एआई से बोलकर पूछें',
        gujaratiTitle: 'કિસાન એઆઈ સાથે વાત કરો',
        subtitle: '24/7 spoken voice advisory in Hindi, Gujarati, and English',
        category: 'tool',
        categoryLabel: isHi ? 'सुविधा' : 'Tool',
        icon: Sparkles,
        viewTarget: 'ai-assistant',
        badge: isHi ? 'माइक' : 'Voice AI',
      },
      {
        id: 'tool_mandi_prices',
        title: 'Live APMC Mandi Rates & MSP',
        hindiTitle: 'दैनिक मंडी भाव व न्यूनतम समर्थन मूल्य (MSP)',
        gujaratiTitle: 'દૈનિક માર્કેટ યાર્ડ ના ભાવ',
        subtitle: 'Live commodity modal prices, price alerts, and daily mandi trends',
        category: 'tool',
        categoryLabel: isHi ? 'मंडी' : 'Market',
        icon: TrendingUp,
        viewTarget: 'market-prices',
        badge: isHi ? 'लाइव' : 'Live',
      },
      {
        id: 'tool_crop_advisor',
        title: 'Crop Recommendation & Advisor',
        hindiTitle: 'फसल चयन सलाहकार (अधिकतम मुनाफा)',
        gujaratiTitle: 'પાક પસંદગી સલાહકાર',
        subtitle: 'Scientific crop planning based on soil N-P-K, water, and budget',
        category: 'tool',
        categoryLabel: isHi ? 'फसल' : 'Crop',
        icon: Sprout,
        viewTarget: 'crop-recommendation',
        badge: isHi ? 'सलाह' : 'Advisor',
      },
      {
        id: 'tool_irrigation',
        title: 'Smart Irrigation & Water Scheduling',
        hindiTitle: 'स्मार्ट सिंचाई और जल प्रबंधन',
        gujaratiTitle: 'સ્માર્ટ સિંચાઈ વ્યવસ્થા',
        subtitle: 'Real-time ET0 evapotranspiration schedule and drip moisture advice',
        category: 'tool',
        categoryLabel: isHi ? 'सुविधा' : 'Tool',
        icon: Droplets,
        viewTarget: 'smart-irrigation',
      },
      {
        id: 'tool_soil_health',
        title: 'Soil Health Card & NPK Fertilizer',
        hindiTitle: 'मृदा स्वास्थ्य कार्ड व खाद गणना (NPK)',
        gujaratiTitle: 'જમીન આરોગ્ય કાર્ડ',
        subtitle: 'Digital soil test analysis, organic carbon, and precise fertilizer doses',
        category: 'tool',
        categoryLabel: isHi ? 'मृदा' : 'Soil',
        icon: Sprout,
        viewTarget: 'soil-health',
      },
      {
        id: 'tool_schemes',
        title: 'Government Agriculture Schemes',
        hindiTitle: 'सरकारी कृषि योजनाएं व सब्सिडी (PM-Kisan)',
        gujaratiTitle: 'સરકારી યોજનાઓ અને સબસિડી',
        subtitle: 'PM-Kisan, PMFBY crop insurance, drip irrigation 70% subsidy, and KCC',
        category: 'scheme',
        categoryLabel: isHi ? 'योजना' : 'Scheme',
        icon: Building2,
        viewTarget: 'government-schemes',
        badge: 'Govt',
      },
      {
        id: 'tool_diary',
        title: 'Farm Accounting Diary & Expenses',
        hindiTitle: 'किसान बही-खाता (खर्च और कमाई)',
        gujaratiTitle: 'ખેતી રોજમેળ અને હિસાબ',
        subtitle: 'Track seeds, fertilizer bills, labor payments, and harvest profit',
        category: 'tool',
        categoryLabel: isHi ? 'खाता' : 'Finance',
        icon: BookOpen,
        viewTarget: 'farm-diary',
      },
      {
        id: 'tool_calculator',
        title: 'Crop Profit & ROI Calculator',
        hindiTitle: 'फसल लागत व मुनाफा कैलकुलेटर',
        gujaratiTitle: 'પાક નફો કેલ્ક્યુલેટર',
        subtitle: 'Estimate net returns per acre across MSP and APMC market prices',
        category: 'tool',
        categoryLabel: isHi ? 'कैलकुलेटर' : 'Calculator',
        icon: Calculator,
        viewTarget: 'profit-calculator',
      },
      {
        id: 'tool_expert',
        title: 'Talk to Agronomy Expert / KVK',
        hindiTitle: 'कृषि विशेषज्ञ / केवीके वैज्ञानिक से बात करें',
        gujaratiTitle: 'કૃષિ નિષ્ણાત સાથે વાત કરો',
        subtitle: 'Direct consultation with ICAR scientists and local Kisan Call Center (1800-180-1551)',
        category: 'tool',
        categoryLabel: isHi ? 'सलाह' : 'Expert',
        icon: PhoneCall,
        viewTarget: 'talk-to-expert',
      },
      {
        id: 'tool_community_app',
        title: 'Kisan Chaupal - Farmer Community & Peer Network App',
        hindiTitle: 'किसान चौपाल (समुदाय ऐप व ज्ञान मंच)',
        gujaratiTitle: 'ખેડૂત ચોપાલ (કમ્યુનિટી નેટવર્ક એપ)',
        subtitle: 'Farmer social app: discuss crop problems, listen to voice chaupal, share organic recipes & get verified solutions',
        category: 'tool',
        categoryLabel: isHi ? 'ऐप' : 'App',
        icon: Users,
        viewTarget: 'community',
        badge: 'App',
      },

      // Crops & Mandi Rates Items
      {
        id: 'mandi_wheat',
        title: 'Wheat (Gehun) - Sharbati / Lokwan',
        hindiTitle: 'गेहूं (शरबती / लोकवन) मंडी भाव',
        gujaratiTitle: 'ઘઉં ના ભાવ',
        subtitle: 'Rajkot APMC: ₹2,890/Qtl • MSP: ₹2,275/Qtl • Daily Trend: +1.8%',
        category: 'mandi',
        categoryLabel: isHi ? 'मंडी भाव' : 'Mandi Price',
        icon: TrendingUp,
        viewTarget: 'market-prices',
        price: '₹2,890/Qtl',
      },
      {
        id: 'mandi_cotton',
        title: 'Cotton (Kapas) - Shankar-6 Hybrid',
        hindiTitle: 'कपास (शंकर-6 बीटी) मंडी भाव',
        gujaratiTitle: 'કપાસ ના ભાવ',
        subtitle: 'Rajkot APMC: ₹7,380/Qtl • MSP: ₹7,020/Qtl • High Mill Demand',
        category: 'mandi',
        categoryLabel: isHi ? 'मंडी भाव' : 'Mandi Price',
        icon: TrendingUp,
        viewTarget: 'market-prices',
        price: '₹7,380/Qtl',
      },
      {
        id: 'mandi_groundnut',
        title: 'Groundnut (Mungfali) - GG-20',
        hindiTitle: 'मूंगफली (GG-20) मंडी भाव',
        gujaratiTitle: 'મગફળી ના ભાવ',
        subtitle: 'Gondal APMC: ₹6,420/Qtl • MSP: ₹6,377/Qtl • Steady Inflow',
        category: 'mandi',
        categoryLabel: isHi ? 'मंडी भाव' : 'Mandi Price',
        icon: TrendingUp,
        viewTarget: 'market-prices',
        price: '₹6,420/Qtl',
      },
      {
        id: 'mandi_mustard',
        title: 'Yellow Mustard (Sarson) - Pusa-31',
        hindiTitle: 'पीली सरसों / राई मंडी भाव',
        gujaratiTitle: 'રાઈ / સરસવ ના ભાવ',
        subtitle: 'Jaipur APMC: ₹5,450/Qtl • MSP: ₹5,650/Qtl • Oil content 42%',
        category: 'mandi',
        categoryLabel: isHi ? 'मंडी भाव' : 'Mandi Price',
        icon: TrendingUp,
        viewTarget: 'market-prices',
        price: '₹5,450/Qtl',
      },
      {
        id: 'mandi_cumin',
        title: 'Cumin (Jeera) - GC-4',
        hindiTitle: 'जीरा (गुजरात जीरा-4) मंडी भाव',
        gujaratiTitle: 'જીરું ના ભાવ',
        subtitle: 'Unjha APMC: ₹19,500/Qtl • High export premium demand',
        category: 'mandi',
        categoryLabel: isHi ? 'मंडी भाव' : 'Mandi Price',
        icon: TrendingUp,
        viewTarget: 'market-prices',
        price: '₹19,500/Qtl',
      },
      {
        id: 'mandi_chana',
        title: 'Chickpea / Gram (Chana) - JG-11',
        hindiTitle: 'चना (दिग्विजय / जे.जी-11) मंडी भाव',
        gujaratiTitle: 'ચણા ના ભાવ',
        subtitle: 'Bikaner APMC: ₹5,400/Qtl • MSP: ₹5,440/Qtl • Heavy Procurement',
        category: 'mandi',
        categoryLabel: isHi ? 'मंडी भाव' : 'Mandi Price',
        icon: TrendingUp,
        viewTarget: 'market-prices',
        price: '₹5,400/Qtl',
      },

      // Popular Diseases & Solutions
      {
        id: 'disease_yellow_rust',
        title: 'Wheat Yellow Rust (Stripe Rust)',
        hindiTitle: 'गेहूं का पीला रतुआ रोग (Yellow Rust)',
        gujaratiTitle: 'ઘઉં નો પીળો ગેરુ રોગ',
        subtitle: 'Symptoms: Yellow powdery stripes on leaf blades. Spray Propiconazole 25% EC @ 1ml/L',
        category: 'disease',
        categoryLabel: isHi ? 'रोग' : 'Disease',
        icon: Bug,
        viewTarget: 'disease-scanner',
        badge: 'Doctor',
      },
      {
        id: 'disease_pink_bollworm',
        title: 'Cotton Pink Bollworm (गुलाबी सुंडी)',
        hindiTitle: 'कपास की गुलाबी सुंडी (Pink Bollworm)',
        gujaratiTitle: 'કપાસ ની ગુલાબી ઈયળ',
        subtitle: 'Rosetted flowers, damaged bolls. Install Pheromone Traps @ 5/acre or Chlorantraniliprole spray',
        category: 'disease',
        categoryLabel: isHi ? 'रोग' : 'Disease',
        icon: Bug,
        viewTarget: 'disease-scanner',
        badge: 'Doctor',
      },
      {
        id: 'disease_leaf_curl',
        title: 'Chilli & Tomato Leaf Curl Virus',
        hindiTitle: 'मिर्च व टमाटर का पत्ती मरोड़ रोग (Churda-Murda)',
        gujaratiTitle: 'મરચી નો કોકડવા રોગ',
        subtitle: 'Whitefly transmitted viral curling. Spray Diafenthiuron 50 WP or Neem Oil 10000 ppm',
        category: 'disease',
        categoryLabel: isHi ? 'रोग' : 'Disease',
        icon: Bug,
        viewTarget: 'disease-scanner',
        badge: 'Doctor',
      },

      // Schemes
      {
        id: 'scheme_pm_kisan',
        title: 'PM Kisan Samman Nidhi Yojana',
        hindiTitle: 'पीएम-किसान सम्मान निधि (₹6,000 वार्षिक)',
        gujaratiTitle: 'પીએમ કિસાન સન્માન નિધિ',
        subtitle: 'Direct DBT bank transfer of ₹2,000 every 4 months to all landholding farmers',
        category: 'scheme',
        categoryLabel: isHi ? 'योजना' : 'Scheme',
        icon: ShieldCheck,
        viewTarget: 'government-schemes',
        badge: '₹6000/yr',
      },
      {
        id: 'scheme_drip_subsidy',
        title: 'PM Krishi Sinchayee Yojana (Drip 70% Subsidy)',
        hindiTitle: 'ड्रिप व स्प्रिंकलर सिंचाई सब्सिडी (70% अनुदान)',
        gujaratiTitle: 'ટપક સિંચાઈ સબસિડી',
        subtitle: 'Government subsidy for micro-irrigation systems to save 50% water',
        category: 'scheme',
        categoryLabel: isHi ? 'योजना' : 'Scheme',
        icon: Droplets,
        viewTarget: 'government-schemes',
        badge: '70% off',
      },
    ],
    [isHi, isGu]
  );

  // Filtered Results
  const filteredResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Default recommended / top searches
      return searchItems.slice(0, 6);
    }

    return searchItems.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(trimmed);
      const matchHindi = item.hindiTitle.toLowerCase().includes(trimmed);
      const matchGujarati = item.gujaratiTitle?.toLowerCase().includes(trimmed);
      const matchSubtitle = item.subtitle.toLowerCase().includes(trimmed);
      const matchCategory = item.categoryLabel.toLowerCase().includes(trimmed);
      return matchTitle || matchHindi || matchGujarati || matchSubtitle || matchCategory;
    });
  }, [query, searchItems]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectItem = (item: SearchResultItem) => {
    setCurrentView(item.viewTarget);
    setIsOpen(false);
    setQuery('');
  };

  // Voice speech synthesis / microphone search trigger
  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = isHi ? 'hi-IN' : isGu ? 'gu-IN' : 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const spokenText = event.results[0][0].transcript;
          setQuery(spokenText);
          setIsOpen(true);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
          // If error, redirect directly to voice AI
          setCurrentView('ai-assistant');
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } catch {
        setCurrentView('ai-assistant');
      }
    } else {
      setCurrentView('ai-assistant');
    }
  };

  const quickPills = isHi
    ? [
        { label: '🌾 गेहूं भाव', term: 'गेहूं' },
        { label: '🩺 रोग पहचानें', term: 'रोग' },
        { label: '🌱 कपास भाव', term: 'कपास' },
        { label: '🏛️ पीएम-किसान', term: 'किसान' },
        { label: '💧 ड्रिप सिंचाई', term: 'सिंचाई' },
      ]
    : [
        { label: '🌾 Wheat Price', term: 'Wheat' },
        { label: '🩺 Crop Doctor', term: 'Doctor' },
        { label: '🌱 Cotton Mandi', term: 'Cotton' },
        { label: '🏛️ PM-Kisan', term: 'Kisan' },
        { label: '💧 Smart Drip', term: 'Irrigation' },
      ];

  return (
    <div
      ref={containerRef}
      id="home-search-section"
      className="relative w-full z-30 transition-all"
    >
      {/* Search Input Container */}
      <div className="relative bg-white dark:bg-stone-900 rounded-2xl border-2 border-emerald-600/30 hover:border-emerald-600 dark:border-stone-700 dark:hover:border-emerald-500 shadow-md focus-within:shadow-xl focus-within:border-emerald-600 transition-all p-1.5 sm:p-2">
        <div className="flex items-center gap-2 px-2 sm:px-3">
          {/* Search Icon */}
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-400">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={
              isHi
                ? 'फसल, मंडी भाव, रोग, योजना या सलाह खोजें... (जैसे: गेहूं, कपास, खाद)'
                : isGu
                ? 'પાક, માર્કેટ યાર્ડ ભાવ, રોગ અથવા યોજના શોધો...'
                : 'Search crops, live mandi rates, diseases, schemes, or tools...'
            }
            className="w-full bg-transparent text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-hidden py-2"
          />

          {/* Clear Button */}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Search Button */}
          <button
            onClick={handleVoiceSearch}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
            title={isHi ? 'बोलकर खोजें' : 'Voice Search'}
          >
            <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">
              {isListening
                ? isHi
                  ? 'सुन रहे हैं...'
                  : 'Listening...'
                : isHi
                ? 'बोलें'
                : 'Voice'}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Search Chips Below Search Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 overflow-x-auto scrollbar-none py-0.5">
        <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 flex items-center gap-1 shrink-0 uppercase tracking-wider pl-1">
          <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          {isHi ? 'त्वरित खोज:' : 'Quick:'}
        </span>
        {quickPills.map((pill) => (
          <button
            key={pill.term}
            onClick={() => {
              setQuery(pill.term);
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="text-xs px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-emerald-50 dark:bg-stone-800 dark:hover:bg-emerald-950/50 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-stone-200/80 dark:border-stone-700/80 transition-all shrink-0 cursor-pointer font-medium"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Autocomplete / Results Dropdown Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[460px] flex flex-col"
          >
            {/* Header info in dropdown */}
            <div className="px-4 py-2.5 bg-stone-50 dark:bg-stone-800/80 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {query
                  ? isHi
                    ? `"${query}" के परिणाम (${filteredResults.length})`
                    : `Results for "${query}" (${filteredResults.length})`
                  : isHi
                  ? 'लोकप्रिय खोज व त्वरित सुविधाएं'
                  : 'Popular Searches & Quick Actions'}
              </span>
              <span className="text-[11px] font-mono text-stone-400">Esc to close</span>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/60 p-1.5">
              {filteredResults.length > 0 ? (
                filteredResults.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className="w-full text-left p-3 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 rounded-xl transition-all flex items-start justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                              {isHi ? item.hindiTitle : item.title}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                              {item.categoryLabel}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                {item.badge}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-center">
                        {item.price && (
                          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg">
                            {item.price}
                          </span>
                        )}
                        <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 group-hover:text-emerald-600 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 mx-auto flex items-center justify-center">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                    {isHi ? 'कोई सीधा परिणाम नहीं मिला' : 'No exact match found'}
                  </h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    {isHi
                      ? 'आप सीधे किसान एआई सहायक से बोलकर या लिखकर यह सवाल पूछ सकते हैं।'
                      : 'Ask Kisan AI directly for customized agronomic answers.'}
                  </p>
                  <button
                    onClick={() => {
                      setCurrentView('ai-assistant');
                      setIsOpen(false);
                    }}
                    className="mt-2 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isHi ? 'किसान एआई से पूछें' : 'Ask Kisan AI'}</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
