import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import { useMarketStore } from '../store/marketStore';
import {
  Sprout,
  Scan,
  TrendingUp,
  CloudSun,
  Users,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Droplets,
  Layers,
  MapPin,
  ChevronRight,
  Plus,
  Send,
  CheckSquare,
  Square,
  Building,
  Store,
  HelpCircle,
  ShieldCheck,
  Award,
  AlertTriangle,
  Tractor,
} from 'lucide-react';
import farmerImg from '../assets/images/farmer_champion_portrait_1790247882281.jpg';
import heroAgriImg from '../assets/images/hero_agri_landscape_1790247857958.jpg';
import { WeatherData } from '../../shared/types';
import { KishanRewardsCard } from '../components/loyalty/KishanRewardsCard';
import { RepeatOrderModal } from '../components/loyalty/RepeatOrderModal';
import { RewardsHistoryModal } from '../components/loyalty/RewardsHistoryModal';

interface FarmTask {
  id: string;
  title: string;
  description: string;
  time: string;
  done: boolean;
  tag: 'urgent' | 'pending' | 'warning';
}

export const FarmerDashboard: React.FC = () => {
  const { currentUser } = useUserStore();
  const {
    crops,
    irrigationStatus,
    alerts,
    setCurrentView,
    askAiWithPrompt,
    addToast,
    language,
  } = useApp();

  const isHi = language === 'hi';

  // Weather State
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);

  // Mandi Filter & Refresh State
  const [selectedRegion, setSelectedRegion] = useState<'All' | 'Gujarat' | 'Madhya Pradesh' | 'Rajasthan' | 'Maharashtra'>('All');
  const [isRefreshingMandi, setIsRefreshingMandi] = useState(false);

  // Quick Question Input State for Kishan AI
  const [aiQuestion, setAiQuestion] = useState('');

  // Kisan Rewards Loyalty Modals State
  const [showRewardsHistory, setShowRewardsHistory] = useState(false);
  const [showRepeatOrder, setShowRepeatOrder] = useState(false);

  // Daily Farm Plan checklist with local persistence
  const [farmTasks, setFarmTasks] = useState<FarmTask[]>(() => {
    try {
      const saved = localStorage.getItem('kb_farmer_tasks_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'task-1',
        title: 'Irrigation Check',
        description: 'Check soil moisture sensors and irrigate block B if needed.',
        time: '09:00 AM',
        done: false,
        tag: 'urgent',
      },
      {
        id: 'task-2',
        title: 'Pest Inspection',
        description: 'Inspect cotton leaf under-surface for pink bollworm or whitefly symptoms.',
        time: '11:00 AM',
        done: true,
        tag: 'pending',
      },
      {
        id: 'task-3',
        title: 'Weather Alert Review',
        description: 'Review the evening thunderstorm & rain forecast before pesticide application.',
        time: '05:00 PM',
        done: false,
        tag: 'warning',
      },
    ];
  });

  // Save tasks to Local Storage
  useEffect(() => {
    try {
      localStorage.setItem('kb_farmer_tasks_v3', JSON.stringify(farmTasks));
    } catch {}
  }, [farmTasks]);

  // Fetch real weather data
  const fetchWeather = () => {
    setIsRefreshingWeather(true);
    fetch('/api/weather?location=Anandpur,%20Gujarat')
      .then((res) => res.json())
      .then((data) => {
        setWeather(data);
        setIsRefreshingWeather(false);
      })
      .catch(() => {
        setIsRefreshingWeather(false);
      });
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  // Toggle Task Completion
  const toggleTask = (taskId: string) => {
    setFarmTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  };

  // Add Custom Task
  const handleAddTask = () => {
    const title = window.prompt(isHi ? 'नई गतिविधि दर्ज करें:' : 'Enter new farming activity:');
    if (!title || !title.trim()) return;

    const newTask: FarmTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: 'Scheduled farm field operation',
      time: '02:00 PM',
      done: false,
      tag: 'pending',
    };

    setFarmTasks((prev) => [...prev, newTask]);
    addToast('Activity Added', `Added "${title}" to today's farm plan.`, 'success');
  };

  // Refresh Mandi Feed
  const handleRefreshMandi = () => {
    setIsRefreshingMandi(true);
    setTimeout(() => {
      setIsRefreshingMandi(false);
      addToast('Mandi Feed Refreshed', 'Latest APMC modal prices loaded.', 'info');
    }, 600);
  };

  // Kishan AI Ask Handler
  const handleAskAi = (promptText?: string) => {
    const q = promptText || aiQuestion;
    if (!q || !q.trim()) return;
    askAiWithPrompt(q.trim());
    setCurrentView('ai-assistant');
  };

  // Farmer Details
  const farmerName = currentUser?.fullName || 'Ramesh Patel';
  const farmLocation = currentUser?.village
    ? `${currentUser.village}, ${currentUser.state}`
    : 'Anandpur, Rajkot, Gujarat';
  const farmSizeDisplay = currentUser?.farmSizeAcres
    ? `${currentUser.farmSizeAcres} Acres (${(currentUser.farmSizeAcres * 0.404).toFixed(1)} Ha)`
    : '4.2 Hectares (10.4 Acres)';
  
  const primaryCrop = crops && crops.length > 0 ? crops[0] : null;
  const currentCropName = primaryCrop?.cropName || 'BT Cotton (कपास)';
  const cropHealthPercent = primaryCrop?.healthScore || 92;

  // Weather Values
  const currentTemp = weather?.temperatureC ?? 31;
  const weatherCondition = (weather as any)?.conditionText || (weather as any)?.condition || 'Partly Cloudy';
  const humidity = (weather as any)?.humidityPct || (weather as any)?.humidity || 48;
  const windSpeed = weather?.windSpeedKmh ?? 14;

  // Mandi Dataset with Multi-Region Filtering
  const allMandiRates = [
    {
      crop: 'Cotton (कपास)',
      sub: 'Shankar-6 Hybrid',
      mandi: 'Rajkot APMC',
      state: 'Gujarat',
      price: 7420,
      change: '+₹140',
      isUp: true,
      msp: 7020,
      icon: '🌿',
    },
    {
      crop: 'Wheat (गेहूं)',
      sub: 'Lokwan Sharbati',
      mandi: 'Indore APMC',
      state: 'Madhya Pradesh',
      price: 2840,
      change: '+₹35',
      isUp: true,
      msp: 2275,
      icon: '🌾',
    },
    {
      crop: 'Groundnut (मूंगफली)',
      sub: 'GG-20 Bold',
      mandi: 'Gondal APMC',
      state: 'Gujarat',
      price: 6380,
      change: '-₹40',
      isUp: false,
      msp: 6377,
      icon: '🥜',
    },
    {
      crop: 'Mustard (सरसों)',
      sub: 'Pusa Bold 42% Oil',
      mandi: 'Jaipur APMC',
      state: 'Rajasthan',
      price: 5720,
      change: '+₹90',
      isUp: true,
      msp: 5650,
      icon: '🌼',
    },
    {
      crop: 'Soybean (सोयाबीन)',
      sub: 'JS-9560 Yellow',
      mandi: 'Ujjain APMC',
      state: 'Madhya Pradesh',
      price: 4890,
      change: '+₹60',
      isUp: true,
      msp: 4600,
      icon: '🌱',
    },
    {
      crop: 'Gram / Chana (चना)',
      sub: 'JG-11 Desi',
      mandi: 'Akola APMC',
      state: 'Maharashtra',
      price: 6150,
      change: '+₹110',
      isUp: true,
      msp: 5440,
      icon: '🫘',
    },
  ];

  const displayedMandiRates =
    selectedRegion === 'All'
      ? allMandiRates
      : allMandiRates.filter((m) => m.state === selectedRegion);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ============================================================= */}
      {/* SECTION 1: PERSONALIZED WELCOME BANNER                       */}
      {/* ============================================================= */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#E8F6E9] via-[#f3f9f4] to-[#f9fbf8] border border-[#E5EBE5] shadow-sm p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Greeting & Location Details */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-emerald-200/90 text-xs font-semibold text-[#004D36] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#20A464] animate-pulse"></span>
              <span>Farm Command Active • {farmLocation}</span>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#087443]">Good Morning,</p>
              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-[#14251F] tracking-tight">
                Welcome, {farmerName} 👋
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-[#66756D] max-w-xl leading-relaxed">
              Keep growing with smart insights, better opportunities, and a stronger farming community.
            </p>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E5EBE5] font-semibold text-[#14251F] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#087443]" />
                <span>{farmLocation}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E5EBE5] font-semibold text-[#14251F] flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-[#087443]" />
                <span>Crop: {currentCropName}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E5EBE5] font-semibold text-[#14251F] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#087443]" />
                <span>Area: {farmSizeDisplay}</span>
              </div>
            </div>
          </div>

          {/* Right Compact Farm Information Panel */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white/95 backdrop-blur-xs rounded-2xl border border-emerald-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#087443] flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-[#20A464]" />
                <span>Active Farm Dossier</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E8F6E9] text-[#004D36]">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                <p className="text-[10px] text-[#66756D] font-medium">Crop</p>
                <p className="text-xs font-bold text-[#14251F] truncate mt-0.5">Cotton</p>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                <p className="text-[10px] text-[#66756D] font-medium">Size</p>
                <p className="text-xs font-bold text-[#14251F] truncate mt-0.5">4.2 Ha</p>
              </div>
              <div className="p-2 rounded-xl bg-[#E8F6E9] border border-emerald-200">
                <p className="text-[10px] text-[#087443] font-medium">Health</p>
                <p className="text-xs font-extrabold text-[#004D36] mt-0.5">{cropHealthPercent}%</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  askAiWithPrompt(`Provide farm advisory for ${currentCropName} with size ${farmSizeDisplay}.`);
                  setCurrentView('ai-assistant');
                }}
                className="py-2.5 px-3 rounded-xl bg-[#004D36] hover:bg-[#087443] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFD84D]" />
                <span>Farm Advisory</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('disease-scanner')}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-50 border border-[#087443] text-[#004D36] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Scan className="w-3.5 h-3.5 text-[#087443]" />
                <span>Scan Leaf</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================= */}
      {/* KISHAN BHAI KISAN REWARDS — LOYALTY & SMART BUYER ACCESS      */}
      {/* ============================================================= */}
      <section>
        <KishanRewardsCard
          onOpenHistory={() => setShowRewardsHistory(true)}
          onOpenRepeatOrder={() => setShowRepeatOrder(true)}
        />
      </section>

      {/* ============================================================= */}
      {/* SECTION 2: FARM INTELLIGENCE CARDS (4 Responsive Cards)       */}
      {/* ============================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Farm Health */}
        <div
          onClick={() => setCurrentView('my-crops')}
          className="bg-white rounded-2xl border border-[#E5EBE5] p-5 shadow-2xs hover:shadow-md hover:border-[#20A464]/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#E8F6E9] text-[#004D36] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-[#087443]" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Optimal Stage
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-[#66756D]">Farm Health</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#14251F]">{cropHealthPercent}%</span>
              <span className="text-xs font-bold text-[#20A464]">+4% this week</span>
            </div>

            {/* Mini Line Chart SVG */}
            <div className="mt-3 h-8 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24">
                <path
                  d="M0 18 Q20 16 35 12 T70 8 T100 4"
                  fill="none"
                  stroke="#20A464"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="4" r="3" fill="#004D36" />
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-[#087443] font-semibold">
            <span>View Crop Vigor</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Today's Weather */}
        <div
          onClick={() => setCurrentView('weather')}
          className="bg-white rounded-2xl border border-[#E5EBE5] p-5 shadow-2xs hover:shadow-md hover:border-[#20A464]/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CloudSun className="w-5 h-5" />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fetchWeather();
              }}
              className="text-[#66756D] hover:text-[#087443] p-1"
              title="Refresh Weather"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingWeather ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-[#66756D]">Today's Weather</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#14251F]">{currentTemp}°C</span>
              <span className="text-xs font-semibold text-[#66756D] truncate">{weatherCondition}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-stone-100 text-[11px] text-[#66756D]">
              <div>Humidity: <span className="font-bold text-[#14251F]">{humidity}%</span></div>
              <div>Wind: <span className="font-bold text-[#14251F]">{windSpeed} km/h</span></div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-[#087443] font-semibold">
            <span>7-Day Advisory</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Active Cluster */}
        <div
          onClick={() => setCurrentView('clusters')}
          className="bg-white rounded-2xl border border-[#E5EBE5] p-5 shadow-2xs hover:shadow-md hover:border-[#20A464]/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#087443] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E8F6E9] text-[#004D36]">
              24 Members
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-[#66756D]">Active Cluster</p>
            <h4 className="text-sm font-bold text-[#14251F] mt-1 truncate">
              Anandpur Cluster #12
            </h4>

            {/* Member Avatars */}
            <div className="flex items-center gap-1 mt-3">
              <div className="w-7 h-7 rounded-full bg-[#004D36] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                RP
              </div>
              <div className="w-7 h-7 rounded-full bg-[#087443] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                VJ
              </div>
              <div className="w-7 h-7 rounded-full bg-[#20A464] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                SK
              </div>
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                MK
              </div>
              <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold flex items-center justify-center border-2 border-white">
                +20
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-[#087443] font-semibold">
            <span>Open Cluster Hub</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Best Mandi Offer */}
        <div
          onClick={() => setCurrentView('market-prices')}
          className="bg-white rounded-2xl border border-[#E5EBE5] p-5 shadow-2xs hover:shadow-md hover:border-[#20A464]/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-[#B45309]" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Verified APMC
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-[#66756D]">Best Mandi Offer</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#14251F]">₹7,620</span>
              <span className="text-xs text-[#66756D]">/quintal</span>
            </div>
            <p className="text-xs font-bold text-[#087443] mt-0.5">
              Cotton • Gondal APMC, Gujarat
            </p>
            <p className="text-[11px] text-[#20A464] font-semibold mt-1">
              +₹180/q (2.4% Today) vs MSP
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-[#087443] font-semibold">
            <span>Explore Mandi Radar</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </section>

      {/* ============================================================= */}
      {/* SECTION 3: DAILY MANDI RATES SECTION                          */}
      {/* ============================================================= */}
      <section className="bg-white rounded-3xl border border-[#E5EBE5] p-6 sm:p-7 shadow-xs space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E8F6E9] flex items-center justify-center text-[#087443]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#14251F]">
                Daily Mandi Rates
              </h2>
            </div>
            <p className="text-xs text-[#66756D] mt-0.5">
              Verified feed from e-NAM & Agmarknet • Last updated: Today, 10:30 AM
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleRefreshMandi}
              className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:text-[#004D36] hover:bg-stone-50 transition-colors cursor-pointer"
              title="Refresh Mandi Feed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingMandi ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('market-prices')}
              className="py-2 px-3.5 rounded-xl bg-[#E8F6E9] hover:bg-emerald-100 text-[#004D36] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>View Full Radar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Functional Region Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['All', 'Gujarat', 'Madhya Pradesh', 'Rajasthan', 'Maharashtra'] as const).map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => setSelectedRegion(region)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedRegion === region
                  ? 'bg-[#004D36] text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {region === 'All' ? 'All Mandis' : region}
            </button>
          ))}
        </div>

        {/* Responsive Mandi Crop Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {displayedMandiRates.map((cropItem) => (
            <div
              key={cropItem.crop}
              onClick={() => setCurrentView('market-prices')}
              className="p-3.5 rounded-2xl border border-stone-200/90 bg-[#F7F8F2]/60 hover:bg-white hover:border-[#20A464] hover:shadow-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{cropItem.icon}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    cropItem.isUp
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {cropItem.change}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-black text-[#14251F] group-hover:text-[#087443] transition-colors truncate">
                  {cropItem.crop}
                </h4>
                <p className="text-[10px] text-[#66756D] truncate">{cropItem.mandi}</p>
              </div>

              <div className="pt-1 border-t border-stone-200/60">
                <div className="text-base font-extrabold text-[#14251F]">
                  ₹{cropItem.price.toLocaleString('en-IN')}
                  <span className="text-[10px] font-normal text-[#66756D]">/q</span>
                </div>
                <div className="text-[10px] text-[#66756D] mt-0.5">
                  MSP: <span className="font-semibold text-stone-700">₹{cropItem.msp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================= */}
      {/* SECTION 4: LOWER DASHBOARD (Farm Plan, AI & Quick Tools)      */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* =========================================================== */}
        {/* SECTION 4A: TODAY'S FARM PLAN (Checklist) (7 Cols)          */}
        {/* =========================================================== */}
        <section className="lg:col-span-7 bg-white rounded-3xl border border-[#E5EBE5] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#087443] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#14251F]">
                  Today's Farm Plan
                </h3>
                <p className="text-xs text-[#66756D]">
                  {farmTasks.filter((t) => t.done).length} of {farmTasks.length} operations completed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddTask}
                className="py-1.5 px-3 rounded-xl bg-[#E8F6E9] hover:bg-emerald-100 text-[#004D36] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('farm-diary')}
                className="py-1.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Calendar
              </button>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2.5">
            {farmTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  task.done
                    ? 'bg-stone-50/70 border-stone-200 text-stone-500'
                    : 'bg-white border-stone-200 hover:border-emerald-300 hover:shadow-2xs text-[#14251F]'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-[#087443] hover:text-[#004D36] cursor-pointer"
                >
                  {task.done ? (
                    <CheckSquare className="w-5 h-5 text-[#20A464]" />
                  ) : (
                    <Square className="w-5 h-5 text-stone-400" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs font-bold ${
                        task.done ? 'line-through text-stone-400' : 'text-[#14251F]'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <span className="text-[11px] font-mono text-[#66756D] flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{task.time}</span>
                    </span>
                  </div>

                  <p className="text-xs text-[#66756D] mt-0.5 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================== */}
        {/* SECTION 4B: KISHAN AI ASSISTANT CARD (5 Cols)               */}
        {/* =========================================================== */}
        <section className="lg:col-span-5 bg-gradient-to-br from-[#004D36] via-[#087443] to-[#003827] rounded-3xl text-white p-6 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#20A464] text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-[#FFD84D]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Kishan AI</h3>
                  <p className="text-xs text-[#FFD84D] font-semibold">Your AI Farming Assistant</p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                Gemini 2.5 Active
              </span>
            </div>

            <p className="text-xs text-emerald-100/90 leading-relaxed mt-3">
              Ask any agronomic question regarding crop protection, fertilizers, local weather warnings, or government subsidies in your language.
            </p>

            {/* Suggested Clickable Questions */}
            <div className="space-y-1.5 mt-3.5">
              <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                Suggested Questions:
              </p>
              {[
                'What should I do for my cotton crop today?',
                'What is the latest mandi price for cotton?',
                'How can I identify bollworm symptoms?',
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleAskAi(q)}
                  className="w-full text-left p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-emerald-50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate pr-2">"{q}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FFD84D] group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Input Bar */}
          <div className="pt-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAskAi();
                }}
                placeholder="Ask Kishan AI anything..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white text-stone-900 placeholder:text-stone-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD84D]"
              />
              <button
                type="button"
                onClick={() => handleAskAi()}
                className="absolute right-1.5 p-1.5 rounded-lg bg-[#004D36] text-[#FFD84D] hover:bg-[#087443] transition-colors cursor-pointer"
                title="Send Prompt"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* ============================================================= */}
      {/* SECTION 5: QUICK TOOLS SECTION                                */}
      {/* ============================================================= */}
      <section className="bg-white rounded-3xl border border-[#E5EBE5] p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#14251F]">
              Quick Tools
            </h3>
            <p className="text-xs text-[#66756D]">
              Direct access to essential agronomic and community applications
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Tool 1: Crop Doctor */}
          <div
            onClick={() => setCurrentView('disease-scanner')}
            className="p-4 rounded-2xl border border-stone-200/90 hover:border-[#20A464] hover:bg-[#E8F6E9]/40 hover:shadow-sm transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#14251F] group-hover:text-[#004D36]">
                Crop Doctor
              </h4>
              <p className="text-[11px] text-[#66756D] mt-0.5 leading-snug">
                Identify possible crop problems with leaf scan.
              </p>
            </div>
          </div>

          {/* Tool 2: Mandi Radar */}
          <div
            onClick={() => setCurrentView('market-prices')}
            className="p-4 rounded-2xl border border-stone-200/90 hover:border-[#20A464] hover:bg-[#E8F6E9]/40 hover:shadow-sm transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#14251F] group-hover:text-[#004D36]">
                Mandi Radar
              </h4>
              <p className="text-[11px] text-[#66756D] mt-0.5 leading-snug">
                Explore real-time APMC agricultural market rates.
              </p>
            </div>
          </div>

          {/* Tool 3: Marketplace */}
          <div
            onClick={() => setCurrentView('marketplace')}
            className="p-4 rounded-2xl border border-stone-200/90 hover:border-[#20A464] hover:bg-[#E8F6E9]/40 hover:shadow-sm transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#14251F] group-hover:text-[#004D36]">
                Marketplace
              </h4>
              <p className="text-[11px] text-[#66756D] mt-0.5 leading-snug">
                Buy inputs & sell crops directly to verified buyers.
              </p>
            </div>
          </div>

          {/* Tool 4: Clusters */}
          <div
            onClick={() => setCurrentView('clusters')}
            className="p-4 rounded-2xl border border-stone-200/90 hover:border-[#20A464] hover:bg-[#E8F6E9]/40 hover:shadow-sm transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#087443] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#14251F] group-hover:text-[#004D36]">
                Clusters
              </h4>
              <p className="text-[11px] text-[#66756D] mt-0.5 leading-snug">
                Join farmer groups for bulk discounts & pooling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kisan Rewards Modals */}
      <RepeatOrderModal
        isOpen={showRepeatOrder}
        onClose={() => setShowRepeatOrder(false)}
      />

      <RewardsHistoryModal
        isOpen={showRewardsHistory}
        onClose={() => setShowRewardsHistory(false)}
      />
    </div>
  );
};
