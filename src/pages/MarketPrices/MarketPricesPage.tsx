import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { useUserStore } from '../../store/userStore';
import { useMarketStore } from '../../store/marketStore';
import { fetchLiveMarketPrices as fetchPricesFromService } from '../../services/marketService';
import {
  checkPriceAlerts,
  PriceAlert,
} from '../../services/priceAlertService';
import { usePriceAlertStore } from '../../store/priceAlertStore';
import {
  TrendingUp,
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Truck,
  CheckCircle2,
  Package,
  Layers,
  RefreshCw,
  Wifi,
  Navigation,
  Bell,
  Plus,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PriceAlertModal } from './components/PriceAlertModal';
import { MarketPricesTable } from './components/MarketPricesTable';
import { MandiTicker } from '../../components/MandiTicker';

export const MarketPricesPage: React.FC = () => {
  const farmerProfile = useUserStore(state => state.farmerProfile);
  const mandiPrices = useMarketStore(state => state.mandiPrices);
  const { language, setCurrentView, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [mandiFilter, setMandiFilter] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Cotton (Kapas)');
  const [selectedState, setSelectedState] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [livePrices, setLivePrices] = useState<any[]>(mandiPrices);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [currentLocationInfo, setCurrentLocationInfo] = useState({
    state: farmerProfile.state || 'Gujarat',
    district: farmerProfile.district || 'Rajkot',
    mandi: `${farmerProfile.district || 'Rajkot'} APMC Yard`,
    fetchedAt: new Date().toLocaleTimeString(),
  });

  const [triggeredAlertsList, setTriggeredAlertsList] = useState<{ alert: PriceAlert; currentPrice: number }[]>([]);

  // Zustand Store Selectors
  const priceAlerts = usePriceAlertStore((state) => state.priceAlerts);
  const isAlertModalOpen = usePriceAlertStore((state) => state.isAlertModalOpen);
  const setAlertModalOpen = usePriceAlertStore((state) => state.setAlertModalOpen);
  const loadAlerts = usePriceAlertStore((state) => state.loadAlerts);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Fetch real-time market prices using marketService
  const handleFetchLiveMarketPrices = async (targetState?: string, targetDistrict?: string) => {
    setIsLoadingLive(true);
    try {
      const data = await fetchPricesFromService(targetState, targetDistrict);
      const pricesToUse = data.success && data.prices && data.prices.length > 0 ? data.prices : mandiPrices;
      setLivePrices(pricesToUse);

      if (data.success && data.locationQuery) {
        setCurrentLocationInfo({
          state: data.locationQuery.state,
          district: data.locationQuery.district,
          mandi: `${data.locationQuery.district} APMC Yard`,
          fetchedAt: new Date().toLocaleTimeString(),
        });
      }

      // Check price alerts
      const triggered = checkPriceAlerts(pricesToUse);
      if (triggered.length > 0) {
        setTriggeredAlertsList(triggered);
        triggered.forEach((item) => {
          addToast(
            language === 'hi' ? '🚨 मूल्य चेतावनी ट्रिगर हुई!' : '🚨 Price Alert Triggered!',
            `${item.alert.crop} in ${item.alert.district} has reached ₹${item.currentPrice} (Target: ${item.alert.condition} ₹${item.alert.targetPrice})`,
            'success'
          );
        });
      }

      addToast(
        language === 'hi' ? 'लाइव मंडी भाव अपडेट' : 'Agmarknet Live Prices Updated',
        language === 'hi'
          ? `मंडी के ताज़ा भाव सफलतापूर्वक लोड किए गए।`
          : `Successfully fetched live APMC prices.`,
        'success'
      );
    } catch (err) {
      console.error('Failed to fetch live mandi prices:', err);
      setLivePrices(mandiPrices);
    } finally {
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    handleFetchLiveMarketPrices(farmerProfile.state, farmerProfile.district);
  }, []);

  const filteredPrices = livePrices.filter((record) => {
    const matchSearch =
      record.crop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMandi =
      record.mandi.toLowerCase().includes(mandiFilter.toLowerCase()) ||
      record.district.toLowerCase().includes(mandiFilter.toLowerCase());
    const matchState = selectedState === 'All' || record.state === selectedState;
    return matchSearch && matchState && matchMandi;
  });

  const activeRecord = livePrices.find((m) => m.crop === selectedCrop) || livePrices[0] || mandiPrices[0];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3B11] to-green-700 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>{language === 'hi' ? 'दैनिक मंडी भाव व बाजार विश्लेषण' : 'Real-time Mandi Rates & Market Intelligence'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {language === 'hi' ? 'मंडी भाव और बाजार मूल्य' : 'Market Prices & Mandi Rates'}
          </h1>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
            {language === 'hi'
              ? 'प्रमुख कृषि उपज मंडी समितियों (APMC) के मॉडल भाव, आवक मात्रा और 7-दिवसीय मूल्य रुझान।'
              : 'Verified daily APMC modal prices, arrival volumes (Quintals), and predictive price trends across regional mandis.'}
          </p>

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <span className="bg-emerald-900/80 text-emerald-200 border border-emerald-600/50 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {currentLocationInfo.district}, {currentLocationInfo.state} ({currentLocationInfo.mandi})
            </span>
            <span className="bg-emerald-800/60 text-emerald-300 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
              Live API: Agmarknet APMC Sync ({currentLocationInfo.fetchedAt})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setAlertModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-4 py-3 rounded-2xl shadow-lg transition-all cursor-pointer text-sm"
          >
            <Bell className="w-4 h-4" />
            <span>{language === 'hi' ? 'मूल्य अलर्ट' : `Price Alerts (${priceAlerts.filter(a => a.isActive).length})`}</span>
          </button>

          <button
            onClick={() => handleFetchLiveMarketPrices(farmerProfile.state, farmerProfile.district)}
            disabled={isLoadingLive}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-4 py-3 rounded-2xl transition-all cursor-pointer text-sm backdrop-blur-sm"
            title="Fetch live prices for current location"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingLive ? 'animate-spin' : ''}`} />
            <span>{language === 'hi' ? 'ताज़ा भाव फेच करें' : 'Fetch Live Location Prices'}</span>
          </button>

          <button
            onClick={() => setCurrentView('harvest')}
            className="flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold px-5 py-3 rounded-2xl shadow-lg transition-all cursor-pointer text-sm"
          >
            <Package className="w-5 h-5" />
            <span>{language === 'hi' ? 'फसल पूल में बेचें' : 'Sell via Harvest Pool'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Multi-State APMC Live Ticker */}
      <MandiTicker />

      {/* Interactive Price Trend Chart for Selected Crop */}
      {activeRecord && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                  {activeRecord.crop}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {activeRecord.mandi} ({activeRecord.state})
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-stone-900 font-display">
                  ₹{activeRecord.modalPricePerQuintal.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-stone-500">/ Quintal</span>
                <span
                  className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                    activeRecord.priceChangeDailyPct >= 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {activeRecord.priceChangeDailyPct >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  <span>{activeRecord.priceChangeDailyPct > 0 ? `+${activeRecord.priceChangeDailyPct}%` : `${activeRecord.priceChangeDailyPct}%`}</span>
                </span>
              </div>
            </div>

            {/* Quick Crop Selector Pills */}
            <div className="flex flex-wrap gap-2">
              {['Cotton (Kapas)', 'Groundnut (Mungfali)', 'Wheat (Gehun)', 'Mustard (Sarson)', 'Soybean', 'Tomato'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCrop(c)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedCrop === c
                      ? 'bg-green-700 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {c.split('(')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeRecord.priceTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="date" stroke="#a8a29e" fontSize={11} />
                <YAxis stroke="#a8a29e" fontSize={11} domain={['dataMin - 100', 'dataMax + 100']} unit="₹" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1917',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`₹${value}/Quintal`, 'Modal Price']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#2D4F1E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Floating Search & Filter Bar */}
      <div className="sticky top-20 z-30 bg-white/90 backdrop-blur-xl rounded-2xl border border-stone-200 shadow-lg flex flex-col transition-all duration-300">
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'फसल खोजें...' : 'Search crop...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all w-full sm:w-auto ${
              isFilterOpen || selectedState !== 'All' || mandiFilter
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>{language === 'hi' ? 'फ़िल्टर' : 'Filters'}</span>
            {(selectedState !== 'All' || mandiFilter) && (
              <span className="bg-emerald-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">
                {(selectedState !== 'All' ? 1 : 0) + (mandiFilter ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-stone-100"
            >
              <div className="p-4 bg-stone-50/50 rounded-b-2xl flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    {language === 'hi' ? 'मंडी / जिला' : 'Mandi / District'}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={language === 'hi' ? 'मंडी दर्ज करें...' : 'Filter by mandi...'}
                      value={mandiFilter}
                      onChange={(e) => setMandiFilter(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-hidden focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    {language === 'hi' ? 'राज्य' : 'State'}
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-hidden focus:border-emerald-500 transition-all"
                  >
                    <option value="All">All States (सभी राज्य)</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mandi Rates Table */}
      <MarketPricesTable
        filteredPrices={filteredPrices}
        setSelectedCrop={setSelectedCrop}
      />

      <PriceAlertModal currentLocationInfo={currentLocationInfo} />
    </div>
  );
};
