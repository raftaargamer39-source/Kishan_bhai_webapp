import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import { useMarketStore } from '../store/marketStore';
import {
  Sprout,
  Store,
  Users,
  Tractor,
  Scan,
  TrendingUp,
  Droplets,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Calculator,
  Compass,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Clock,
  MapPin,
  Flame,
  Layers,
  ShoppingBag,
  Award,
  Search,
} from 'lucide-react';
import { AnimatedKishanLogo } from '../components/AnimatedKishanLogo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../../shared/types';

// Authentic Generated High-Fidelity Domain Imagery
import heroLandscapeImg from '../assets/images/hero_agri_landscape_1790247857958.jpg';
import harvestGrainImg from '../assets/images/cluster_harvest_grain_1790247870115.jpg';
import farmerPortraitImg from '../assets/images/farmer_champion_portrait_1790247882281.jpg';
import soilSensorImg from '../assets/images/smart_soil_sensor_1790247893198.jpg';

export const LandingPage: React.FC = () => {
  const setUserRole = useUserStore((state) => state.setUserRole);
  const { setCurrentView, language, isDarkMode } = useApp();
  const mandiPrices = useMarketStore((state) => state.mandiPrices);

  // Collective Power Calculator state
  const [selectedCrop, setSelectedCrop] = useState<'wheat' | 'rice' | 'mustard' | 'cotton'>('wheat');
  const [farmAcreage, setFarmAcreage] = useState<number>(8);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabRole, setActiveTabRole] = useState<'FARMER' | 'CHAMPION' | 'BUYER'>('FARMER');

  const cropSpecs = {
    wheat: { nameEn: 'Wheat (गेहूं)', seedSavingsPerAcre: 1400, equipSavingsPerAcre: 2100, marketGainPerAcre: 5200 },
    rice: { nameEn: 'Basmati Rice (बासमती चावल)', seedSavingsPerAcre: 1900, equipSavingsPerAcre: 2800, marketGainPerAcre: 8400 },
    mustard: { nameEn: 'Mustard (सरसों)', seedSavingsPerAcre: 1100, equipSavingsPerAcre: 1800, marketGainPerAcre: 4600 },
    cotton: { nameEn: 'Cotton (कपास)', seedSavingsPerAcre: 2200, equipSavingsPerAcre: 3100, marketGainPerAcre: 9200 },
  };

  const currentCropSpec = cropSpecs[selectedCrop];
  const inputSavings = currentCropSpec.seedSavingsPerAcre * farmAcreage;
  const machinerySavings = currentCropSpec.equipSavingsPerAcre * farmAcreage;
  const directBuyerGain = currentCropSpec.marketGainPerAcre * farmAcreage;
  const totalClusterAdvantage = inputSavings + machinerySavings + directBuyerGain;

  // Live Mandi Ticker Feed (real Indian benchmarks)
  const tickerItems = [
    { commodity: 'Wheat Sharbati', mandi: 'Khanna, PB', price: '₹2,540', mspDiff: '+₹115', delta: '+1.8%' },
    { commodity: 'Basmati 1121', mandi: 'Karnal, HR', price: '₹4,380', mspDiff: '+₹340', delta: '+3.2%' },
    { commodity: 'Mustard Bold', mandi: 'Alwar, RJ', price: '₹5,720', mspDiff: '+₹170', delta: '+0.9%' },
    { commodity: 'Cotton Long', mandi: 'Rajkot, GJ', price: '₹7,450', mspDiff: '+₹290', delta: '+2.4%' },
    { commodity: 'Soybean Yellow', mandi: 'Indore, MP', price: '₹4,890', mspDiff: '+₹90', delta: '+0.4%' },
    { commodity: 'Chana Desi', mandi: 'Akola, MH', price: '₹5,980', mspDiff: '+₹140', delta: '+1.1%' },
  ];

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);
    if (role === 'FARMER') setCurrentView('farmer-dashboard');
    else if (role === 'CHAMPION') setCurrentView('champion-dashboard');
    else if (role === 'BUYER') setCurrentView('buyer-dashboard');
    else setCurrentView('farmer-dashboard');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return;
    if (q.includes('price') || q.includes('mandi') || q.includes('rate') || q.includes('msp')) {
      setCurrentView('market-prices');
    } else if (q.includes('disease') || q.includes('pest') || q.includes('leaf') || q.includes('scan')) {
      setCurrentView('disease-scanner');
    } else if (q.includes('weather') || q.includes('rain') || q.includes('irrigation')) {
      setCurrentView('weather');
    } else if (q.includes('cluster') || q.includes('champion') || q.includes('group')) {
      setCurrentView('clusters');
    } else if (q.includes('scheme') || q.includes('subsidy') || q.includes('pm')) {
      setCurrentView('government-schemes');
    } else if (q.includes('buy') || q.includes('fertilizer') || q.includes('seed')) {
      setCurrentView('bulk-buying');
    } else {
      setCurrentView('farmer-dashboard');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#0B100C] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors selection:bg-emerald-200 dark:selection:bg-emerald-900/60">
      
      {/* 1. TOP LIVE MANDI TICKER - Tabular, High-Density Agricultural Marquee */}
      <aside aria-label="Live Mandi Price Feeds" className="w-full bg-stone-900 text-stone-300 text-xs py-2 px-4 border-b border-stone-800 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0 text-emerald-400 font-semibold tracking-wide uppercase text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mandi Live Pulse</span>
          </div>

          <div className="overflow-x-auto no-scrollbar flex items-center gap-6 text-[12px] font-mono tabular-nums whitespace-nowrap">
            {tickerItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentView('market-prices')}
                className="inline-flex items-center gap-2 hover:text-white transition-colors cursor-pointer group"
                title="Click to view deep mandi price analytics"
              >
                <span className="font-sans font-medium text-stone-400 group-hover:text-stone-200">{item.commodity}</span>
                <span className="text-stone-500 text-[10px] hidden sm:inline">({item.mandi})</span>
                <span className="font-bold text-stone-100">{item.price}/qtl</span>
                <span className="text-emerald-400 font-medium text-[11px]">{item.delta}</span>
                <span className="text-stone-700">·</span>
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0 text-stone-400 text-[11px]">
            <span className="font-mono">DIRECT PAYMENT</span>
            <span className="text-emerald-400">INSTANT UPI / DBT</span>
          </div>
        </div>
      </aside>

      {/* 2. EDITORIAL HERO SECTION */}
      <section className="relative w-full pt-10 sm:pt-14 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-stone-200/70 dark:border-stone-800/80 overflow-hidden">
        {/* Subtle Warm Atmospheric Grain Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#153E26_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto">
          {/* Unboxed Metadata Kicker */}
          <div className="flex items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400 mb-4">
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">Bharat Digital Agritech Infrastructure</span>
            <span aria-hidden="true">·</span>
            <span>4,200+ Farmers Connected</span>
            <span aria-hidden="true">·</span>
            <span>Transparent Cooperative Escrow</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold text-stone-900 dark:text-stone-50 tracking-tight leading-[1.08] text-balance">
                Small Farms. <br />
                <span className="text-emerald-800 dark:text-emerald-400 italic font-normal">One Powerful</span> Collective.
              </h1>

              <p className="text-lg sm:text-xl text-stone-700 dark:text-stone-300 leading-relaxed max-w-2xl">
                Kishan Bhai brings village smallholders together into digital virtual farm clusters. Pool bulk fertilizer orders, rent tractors at cooperative rates, scan crop diseases instantly, and sell directly to institutional buyers with guaranteed digital settlements.
              </p>

              {/* Natural Hindi Sub-Heading */}
              <div className="p-3.5 bg-stone-100/80 dark:bg-stone-900/60 rounded-xl border border-stone-200/60 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 leading-normal flex items-start gap-3">
                <span className="font-display font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                  किसान भाई
                </span>
                <span>
                  छोटे खेतों की सामूहिक ताक़त — अब बीज, खाद और मशीनरी की थोक खरीद से लेकर उपज की सीधी बिक्री तक, सब कुछ एक जगह।
                </span>
              </div>

              {/* Direct Action Hub */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  onClick={() => handleRoleSelection('FARMER')}
                  className="px-6 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-sm hover:shadow active:scale-[0.99] flex items-center gap-2 cursor-pointer"
                >
                  <Sprout className="w-4 h-4 text-emerald-200" />
                  <span>Enter Farmer Portal (किसान प्रवेश)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => handleRoleSelection('BUYER')}
                  className="px-6 py-3.5 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 font-medium text-sm transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Store className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                  <span>Institutional Buyer Desk (क्रेता डेस्क)</span>
                </button>

                <button
                  onClick={() => handleRoleSelection('CHAMPION')}
                  className="px-4 py-3.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Village Champion Coordinator</span>
                </button>
              </div>

              {/* Instant Utility Search Bar */}
              <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3.5 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search mandi rates (wheat, cotton), disease scanner, irrigation, PM-Kisan..."
                    className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:border-emerald-600 dark:focus:border-emerald-400 shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-medium hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
                  >
                    Explore
                  </button>
                </div>
              </form>
            </div>

            {/* Right Visual Column - Authentic Generated Agritech Landscape */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-xl bg-stone-100 dark:bg-stone-900 group">
                <img
                  src={heroLandscapeImg}
                  alt="Scenic lush Indian agricultural fields at golden sunrise with modern cooperative irrigation canals"
                  referrerPolicy="no-referrer"
                  className="w-full h-[360px] sm:h-[440px] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />

                {/* Measured Contrast Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent pointer-events-none" />

                {/* Floating Telemetry & Insight Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 shadow-lg text-stone-900 dark:text-stone-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                        Active Cluster Hub
                      </span>
                    </div>
                    <span className="text-xs font-mono text-stone-500 dark:text-stone-400 tabular-nums">
                      Khanna, Punjab
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-100 dark:border-stone-800 text-center font-mono tabular-nums">
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase font-sans">Pooled Grain</div>
                      <div className="text-sm font-bold text-stone-900 dark:text-stone-100">840 Tons</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase font-sans">Tractor Roster</div>
                      <div className="text-sm font-bold text-stone-900 dark:text-stone-100">14 Units</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase font-sans">Escrow Paid</div>
                      <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">₹42.8 Lakh</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-stone-600 dark:text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      <span>Canal Inflow: Optimal (+4% Soil Moisture)</span>
                    </span>
                    <button
                      onClick={() => setCurrentView('clusters')}
                      className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline flex items-center cursor-pointer"
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE COLLECTIVE SAVINGS & POWER CALCULATOR */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-stone-100/60 dark:bg-stone-900/40 border-b border-stone-200/70 dark:border-stone-800">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-emerald-800 dark:text-emerald-400 tracking-wider uppercase mb-1">
                Quantitative Collective Advantage
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-stone-100">
                Calculate Your Cluster Power & Savings (सामूहिक बचत कैलकुलेटर)
              </h2>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md">
              See the concrete financial difference when smallholders pool fertilizer purchases, share heavy machinery, and sell in unified bulk lots.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs">
            {/* Calculator Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Crop Selector Segmented Controls */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                  Select Primary Crop (फसल चुनें)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(cropSpecs) as Array<keyof typeof cropSpecs>).map((cropKey) => {
                    const isSelected = selectedCrop === cropKey;
                    return (
                      <button
                        key={cropKey}
                        type="button"
                        onClick={() => setSelectedCrop(cropKey)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-600 dark:border-emerald-500 shadow-2xs'
                            : 'bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-300'
                        }`}
                      >
                        {cropSpecs[cropKey].nameEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Acreage Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                  <span>Farm Landholding (खेत का आकार)</span>
                  <span className="font-mono text-stone-900 dark:text-stone-100 text-sm font-bold">
                    {farmAcreage} Acres
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={farmAcreage}
                  onChange={(e) => setFarmAcreage(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-stone-400 font-mono mt-1">
                  <span>1 Acre</span>
                  <span>15 Acres</span>
                  <span>30 Acres</span>
                  <span>50 Acres</span>
                </div>
              </div>

              {/* Mechanism Explanation */}
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-700/80 text-xs text-stone-600 dark:text-stone-300 space-y-1.5 leading-relaxed">
                <div className="font-medium text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Formula Grounding</span>
                </div>
                <p>
                  Calculated against standard 2026 APMC commission rates (6%), retail fertilizer markups, and local tractor rental rates in North & Central India.
                </p>
              </div>
            </div>

            {/* Calculator Real-Time Yield Display */}
            <div className="lg:col-span-7 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-stone-200 dark:border-stone-800 pt-6 lg:pt-0 lg:pl-8">
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Estimated Season Advantage with Kishan Bhai
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-700/70">
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">Input Bulk Savings</div>
                    <div className="text-xl font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100 mt-1">
                      ₹{inputSavings.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Seeds & Fertilizers</div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-700/70">
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">Machinery Shared</div>
                    <div className="text-xl font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100 mt-1">
                      ₹{machinerySavings.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Tractor & Harvester</div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-700/70">
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">Direct Buyer Premium</div>
                    <div className="text-xl font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100 mt-1">
                      ₹{directBuyerGain.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Zero Middlemen</div>
                  </div>
                </div>

                {/* Total Calculated Metric Card */}
                <div className="p-5 rounded-xl bg-emerald-900 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-emerald-200">
                      Total Annual Added Farm Income
                    </span>
                    <span className="text-xs font-mono text-emerald-300">+{((totalClusterAdvantage / (farmAcreage * 22000)) * 100).toFixed(0)}% ROI</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight">
                    ₹{totalClusterAdvantage.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-emerald-100/90 leading-relaxed">
                    Based on {farmAcreage} acres under collective cluster purchasing and direct verified institutional contracts.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Ready to activate this advantage for your land?
                </span>
                <button
                  onClick={() => setCurrentView('clusters')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>Join Local Cluster</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE THREE PILLARS: BESPOKE ROLE ARCHITECTURE */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 border-b border-stone-200/70 dark:border-stone-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-medium text-emerald-800 dark:text-emerald-400 tracking-wider uppercase">
              Cooperative Ecosystem
            </div>
            <h2 className="text-3xl font-display font-semibold text-stone-900 dark:text-stone-100">
              Three Unified Roles. One Complete Ecosystem.
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Every participant strengthens the entire agricultural supply chain — from cultivation to harvest pooling and instant settlement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Smallholder Farmer */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden flex flex-col justify-between shadow-xs hover:border-emerald-600/50 transition-all">
              <div>
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={farmerPortraitImg}
                    alt="Farmer Village Champion in Indian agricultural field"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <div className="text-[11px] font-mono text-emerald-300 uppercase tracking-wider">For Growers</div>
                    <div className="text-lg font-display font-semibold">Smallholder Farmer (किसान)</div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Manage farm plots, access voice AI agronomy in regional dialects, detect leaf pathogens with your camera, and order seeds with village neighbors.
                  </p>

                  <div className="space-y-2 border-t border-stone-100 dark:border-stone-800 pt-3">
                    <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Instant AI Pathogen & Pest Diagnostic</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Input Group Purchasing (खाद बीज थोक भाव)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Machinery Roster Booking by Hour</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => handleRoleSelection('FARMER')}
                  className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Launch Farmer Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 2: Village Champion */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden flex flex-col justify-between shadow-xs hover:border-amber-600/50 transition-all">
              <div>
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={heroLandscapeImg}
                    alt="Village farm cluster overview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <div className="text-[11px] font-mono text-amber-300 uppercase tracking-wider">For Coordinators</div>
                    <div className="text-lg font-display font-semibold">Village Champion (ग्राम प्रधान)</div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Lead local farmer clusters, onboard neighbors, organize collective harvesting lots, and manage local farm equipment pools.
                  </p>

                  <div className="space-y-2 border-t border-stone-100 dark:border-stone-800 pt-3">
                    <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Village Cluster Roster & Farmer Verifications</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Cooperative Harvest Pooling Lot Creation</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Community SMS & Voice Broadcast Alerts</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => handleRoleSelection('CHAMPION')}
                  className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Launch Champion Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 3: Institutional Buyer */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden flex flex-col justify-between shadow-xs hover:border-blue-600/50 transition-all">
              <div>
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={harvestGrainImg}
                    alt="Authentic harvested grains and basmati rice in natural sacks"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <div className="text-[11px] font-mono text-blue-300 uppercase tracking-wider">For Off-Takers</div>
                    <div className="text-lg font-display font-semibold">Institutional Buyer (थोक खरीदार)</div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Source verified 100+ quintal single-origin grain lots directly from clusters with moisture testing data, digital provenance, and Algorand escrow.
                  </p>

                  <div className="space-y-2 border-t border-stone-100 dark:border-stone-800 pt-3">
                    <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Verified Bulk Harvest Pool Catalog</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Smart Contract Milestone Escrow</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Direct Cluster Logistics & Weighment</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => handleRoleSelection('BUYER')}
                  className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Launch Buyer Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DEEP-TECH AGRONOMIC SUITE SPOTLIGHT */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-stone-100/50 dark:bg-stone-900/30 border-b border-stone-200/70 dark:border-stone-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Feature Slot */}
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-lg bg-stone-900 relative">
              <img
                src={soilSensorImg}
                alt="Smart agronomic soil moisture and nutrient sensor probe in rich soil"
                referrerPolicy="no-referrer"
                className="w-full h-[320px] sm:h-[380px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-stone-900/90 backdrop-blur-md border border-stone-700 text-white text-xs space-y-1 font-mono">
                <div className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">
                  Real-Time Agro-Physics Engine
                </div>
                <div className="text-stone-300 font-sans">
                  IoT Soil Evapotranspiration + Local Weather Doppler
                </div>
                <div className="flex justify-between text-stone-400 text-[11px] pt-1">
                  <span>Soil Moisture: 28% (Optimal)</span>
                  <span>Rain ETA: 36 hrs</span>
                </div>
              </div>
            </div>

            {/* Interactive Feature Cards */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-medium text-emerald-800 dark:text-emerald-400 tracking-wider uppercase">
                  Precision Agronomy Tools
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-stone-100">
                  Instant Science for Indian Soils & Crops
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  No generic suggestions. Kishan Bhai analyzes your local soil geography, weather stations, and crop photos for targeted actionable solutions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setCurrentView('disease-scanner')}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-left hover:border-emerald-600 dark:hover:border-emerald-500 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Scan className="w-5 h-5 text-emerald-600" />
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                    Leaf Pathogen Scanner
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Detect Yellow Rust, Late Blight, and stem borers in seconds with treatment prescriptions.
                  </div>
                </button>

                <button
                  onClick={() => setCurrentView('smart-irrigation')}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-left hover:border-emerald-600 dark:hover:border-emerald-500 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                    Smart Irrigation Advisor
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Prevent over-watering using satellite evapotranspiration data and pump power schedules.
                  </div>
                </button>

                <button
                  onClick={() => setCurrentView('market-prices')}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-left hover:border-emerald-600 dark:hover:border-emerald-500 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                  <div className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                    Live Mandi & MSP Radar
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Real-time commodity arrivals, modal prices across 1,200+ mandis, and MSP comparisons.
                  </div>
                </button>

                <button
                  onClick={() => setCurrentView('government-schemes')}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-left hover:border-emerald-600 dark:hover:border-emerald-500 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                    Government Yojana Navigator
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    PM-Kisan, PMFBY crop insurance, solar pump subsidies, and soil health card benefits.
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED GROUND PROOF & TESTIMONIALS */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="text-xs font-medium text-emerald-800 dark:text-emerald-400 tracking-wider uppercase">
              Proven Ground Results
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-stone-100">
              Transforming Villages Across Bharat
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
                "Our village cluster in Khanna pooled 28 farmers for DAP fertilizer and saved ₹1,650 per acre up front. We sold our wheat harvest directly to a flour mill without paying a single rupee to middlemen."
              </p>
              <div className="border-t border-stone-100 dark:border-stone-800 pt-3">
                <div className="font-semibold text-sm text-stone-900 dark:text-stone-100">Sardar Gurpreet Singh</div>
                <div className="text-xs text-stone-500">Khanna Village Cluster · Punjab (32 Acres)</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
                "As a village champion, I registered 42 small farmers. When pest hit our soybean crop, the camera scanner diagnosed stem fly immediately and recommended the right biopesticide before damage spread."
              </p>
              <div className="border-t border-stone-100 dark:border-stone-800 pt-3">
                <div className="font-semibold text-sm text-stone-900 dark:text-stone-100">Ramcharan Patel</div>
                <div className="text-xs text-stone-500">Village Champion · Sehore, Madhya Pradesh</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
                "We procure 500 quintals of organic mustard every harvest. With Kishan Bhai's escrow contract, payment is held safely and released automatically upon quality testing. Zero defaults, 100% transparency."
              </p>
              <div className="border-t border-stone-100 dark:border-stone-800 pt-3">
                <div className="font-semibold text-sm text-stone-900 dark:text-stone-100">Anil Singhania</div>
                <div className="text-xs text-stone-500">Procurement Head · Satya Agro Foods Ltd.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. QUIET EDITORIAL FOOTER */}
      <footer className="w-full py-10 px-4 sm:px-6 lg:px-8 bg-stone-900 text-stone-400 text-xs border-t border-stone-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-white text-base">Kishan Bhai</span>
            <span className="text-stone-600">·</span>
            <span>Digital Agriculture & Farm Cluster Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button onClick={() => setCurrentView('farmer-dashboard')} className="hover:text-white transition-colors cursor-pointer">
              Farmer Workspace
            </button>
            <button onClick={() => setCurrentView('market-prices')} className="hover:text-white transition-colors cursor-pointer">
              Mandi Rates
            </button>
            <button onClick={() => setCurrentView('disease-scanner')} className="hover:text-white transition-colors cursor-pointer">
              Disease Scanner
            </button>
            <button onClick={() => setCurrentView('clusters')} className="hover:text-white transition-colors cursor-pointer">
              Farm Clusters
            </button>
            <button onClick={() => setCurrentView('farm-diary')} className="hover:text-white transition-colors cursor-pointer">
              Farm Diary
            </button>
          </div>

          <div className="font-mono text-stone-500 text-[11px] tabular-nums">
            BHARAT AGRI-NETWORK · 2026
          </div>
        </div>
      </footer>
    </div>
  );
};
