import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  CloudSun,
  Droplets,
  Wind,
  Sun,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Zap,
  MapPin,
  Search,
  Sunrise,
  Sunset,
  Gauge,
  ThermometerSun,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  RefreshCw,
  Eye,
  Umbrella,
  CloudRain,
  Activity,
  ChevronRight,
  Info,
} from 'lucide-react';
import { WeatherData, DailyForecastItem, WeatherFarmingAction, WeatherAlertItem } from '../../shared/types';

const POPULAR_LOCATIONS = [
  'Anandpur, Gujarat',
  'Rajkot, Gujarat',
  'Gondal, Gujarat',
  'Junagadh, Gujarat',
  'Amreli, Gujarat',
  'Ahmedabad, Gujarat',
  'Nashik, Maharashtra',
  'Karnal, Haryana',
];

export const WeatherModule: React.FC = () => {
  const { currentUser, farmerProfile } = useUserStore();
  const { setCurrentView, askAiWithPrompt, addDiaryEntry } = useApp();
  const defaultLocation = farmerProfile?.village
    ? `${farmerProfile.village}, ${farmerProfile.state || 'Gujarat'}`
    : (currentUser?.village ? `${currentUser.village}, ${currentUser.state || 'Gujarat'}` : 'Anandpur, Gujarat');

  const [location, setLocation] = useState<string>(defaultLocation);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'all' | 'irrigation' | 'spraying' | 'disease'>('all');

  const fetchWeather = (loc: string) => {
    setLoading(true);
    fetch(`/api/weather?location=${encodeURIComponent(loc)}`)
      .then((res) => res.json())
      .then((data: WeatherData) => {
        setWeather(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Weather fetch error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWeather(location);
  }, [location]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(searchQuery.trim());
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  const handleSaveActionToDiary = (action: WeatherFarmingAction) => {
    addDiaryEntry({
      date: new Date().toISOString().split('T')[0],
      category: action.actionCategory === 'IRRIGATION' ? 'Irrigation' : action.actionCategory === 'SPRAY' ? 'Pesticide' : 'Disease & Pest',
      title: `Weather Advisory: ${action.title}`,
      crop: farmerProfile?.mainCrop || 'Cotton (Bt)',
      notes: `${action.conditionDescription} -> Action: ${action.recommendedAction}`,
      expenseAmountInr: 0,
    });
  };

  const riskScore = weather?.riskScore || {
    rainRisk: 70,
    heatRisk: 25,
    windRisk: 18,
    diseaseRisk: 42,
    overallScore: 32,
    riskLevel: 'Low' as const,
    summary: 'Stable agricultural climate. Manage morning spraying and monitor tomorrow\'s rain window.',
  };

  const farmingActions = weather?.farmingActions || [];
  const alerts = weather?.alerts || [];
  const forecast = weather?.forecast || [];
  const selectedDay = forecast[selectedDayIdx] || forecast[0];

  const filteredActions = farmingActions.filter((act) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'irrigation') return act.actionCategory === 'IRRIGATION';
    if (activeTab === 'spraying') return act.actionCategory === 'SPRAY';
    if (activeTab === 'disease') return act.actionCategory === 'PEST_DISEASE';
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. PAGE HEADER */}
      <div className="bg-gradient-to-br from-[#1b3811] via-[#244b17] to-[#12280a] text-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                <CloudSun className="w-3.5 h-3.5" />
                Hyperlocal Agro-Meteorology
              </span>
              <span className="bg-white/10 text-stone-200 text-xs px-3 py-1 rounded-full font-medium border border-white/15">
                AI-Powered • Fast Analysis • Farmer-Friendly
              </span>
              {weather?.isDemo && (
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-amber-400/30">
                  Demo Weather Data
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
              <span>🌦</span> Weather Intelligence
            </h1>
            <p className="text-stone-200 text-sm sm:text-base max-w-2xl">
              &ldquo;Know the weather. Know what to do.&rdquo; Real-time agronomic forecasting designed to protect crops, optimize watering, and maximize farm yields.
            </p>
          </div>

          {/* Location Selector & Controls */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {!isSearching ? (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm font-semibold text-white truncate max-w-[200px]">
                  {weather?.location || location}
                </span>
                <button
                  type="button"
                  id="btn-change-location"
                  onClick={() => setIsSearching(true)}
                  className="text-xs text-emerald-300 hover:text-emerald-200 underline font-medium ml-2 cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="input-weather-location"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search village or district..."
                    className="w-full pl-9 pr-3 py-2 bg-white text-stone-900 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  id="btn-submit-location-search"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                >
                  Update
                </button>
                <button
                  type="button"
                  id="btn-cancel-location-search"
                  onClick={() => setIsSearching(false)}
                  className="px-2.5 py-2 text-stone-300 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </form>
            )}

            <button
              type="button"
              id="btn-refresh-weather"
              onClick={() => fetchWeather(location)}
              disabled={loading}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh live atmospheric telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Location Quick Presets */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-stone-300 font-medium shrink-0 uppercase tracking-wider">Quick Locations:</span>
          {POPULAR_LOCATIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              id={`chip-loc-${loc.split(',')[0].toLowerCase()}`}
              onClick={() => setLocation(loc)}
              className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                location.includes(loc.split(',')[0])
                  ? 'bg-emerald-500 text-white font-bold shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-stone-200 font-medium border border-white/10'
              }`}
            >
              {loc.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CURRENT CONDITIONS HERO STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Temperature & Feels Like */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Current Temperature</span>
            <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-display flex items-baseline gap-1">
              {weather?.temperatureC || 31}°C
            </div>
            <p className="text-xs text-stone-600 font-medium flex items-center gap-1">
              <span>Feels like {weather?.feelsLikeC || 33}°C</span>
              <span className="text-stone-400">•</span>
              <span className="text-emerald-700 font-semibold">{weather?.condition || 'Partly Cloudy'}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
            <ThermometerSun className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Rain Probability & Clouds */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Rain Probability (Today)</span>
            <div className="text-3xl sm:text-4xl font-extrabold text-green-700 font-display flex items-baseline gap-1">
              {weather?.rainfallProbability || 25}%
            </div>
            <p className="text-xs text-stone-600 font-medium truncate max-w-[170px]">
              {weather?.cloudConditions || 'Partly Cloudy (45% cover)'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <Droplets className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Relative Humidity & Dew */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Relative Humidity</span>
            <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-display">
              {weather?.humidity || 68}%
            </div>
            <p className="text-xs text-stone-600 font-medium">
              {(weather?.humidity || 68) >= 70 ? 'High canopy moisture (watch fungi)' : 'Optimal ambient moisture'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
            <CloudRain className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Surface Wind & Solar Sun Times */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Wind Speed & Sun</span>
            <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-display flex items-baseline gap-1">
              {weather?.windSpeedKmh || 16} <span className="text-base font-normal text-stone-500">km/h</span>
            </div>
            <p className="text-xs text-stone-600 font-medium flex items-center gap-1.5">
              <Sunrise className="w-3.5 h-3.5 text-amber-500" />
              <span>{weather?.sunrise || '06:12 AM'}</span>
              <span className="text-stone-300">|</span>
              <Sunset className="w-3.5 h-3.5 text-orange-500" />
              <span>{weather?.sunset || '06:54 PM'}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 border border-stone-200">
            <Wind className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. WEATHER RISK SCORE & WEATHER ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Risk Score Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Gauge className="w-4 h-4" />
              </div>
              <h2 className="font-bold font-display text-base text-stone-900">Weather Risk Score</h2>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                riskScore.riskLevel === 'Critical'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : riskScore.riskLevel === 'High'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : riskScore.riskLevel === 'Moderate'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {riskScore.riskLevel} Risk
            </span>
          </div>

          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60 text-center space-y-1">
            <span className="text-xs text-stone-500 font-medium">Today&apos;s Farm Weather Risk</span>
            <div className="text-4xl font-extrabold text-stone-900 font-display">
              {riskScore.overallScore} <span className="text-lg font-medium text-stone-400">/ 100</span>
            </div>
            <p className="text-xs text-stone-600 font-medium pt-1">{riskScore.summary}</p>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-stone-700">
                <span className="flex items-center gap-1.5">🌧 Rain Risk</span>
                <span>{riskScore.rainRisk}%</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${riskScore.rainRisk}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-stone-700">
                <span className="flex items-center gap-1.5">🌡 Heat Risk</span>
                <span>{riskScore.heatRisk}%</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${riskScore.heatRisk}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-stone-700">
                <span className="flex items-center gap-1.5">💨 Wind Risk</span>
                <span>{riskScore.windRisk}%</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-stone-500 rounded-full transition-all duration-500"
                  style={{ width: `${riskScore.windRisk}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-stone-700">
                <span className="flex items-center gap-1.5">💧 Disease Incubation Risk</span>
                <span>{riskScore.diseaseRisk}%</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${riskScore.diseaseRisk}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Weather Alerts Hub */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h2 className="font-bold font-display text-base text-stone-900">Active Agro-Weather Alerts</h2>
              </div>
              <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold">
                {alerts.length} Active Advisories
              </span>
            </div>

            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : alert.severity === 'HIGH'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-blue-50/70 border-blue-200 text-blue-950'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <span className="text-base">{alert.icon}</span>
                        <span>{alert.title}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-white/80 border border-current">
                        {alert.severity}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <div>
                        <span className="text-[10px] uppercase font-bold opacity-75 block">What is happening</span>
                        <p className="font-medium text-stone-800">{alert.whatIsHappening}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold opacity-75 block">When it may happen</span>
                        <p className="font-medium text-stone-800">{alert.whenItMayHappen}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold opacity-75 block">Farmer Action</span>
                        <p className="font-semibold text-emerald-900">{alert.whatFarmerShouldDo}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-stone-500 bg-stone-50 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-medium">No severe weather risks or storm warnings for this area.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 border-t border-stone-100">
            <span>Last atmospheric radar sync: {weather?.lastUpdated || 'Just now'}</span>
            <button
              type="button"
              id="btn-ask-ai-weather"
              onClick={() => askAiWithPrompt('Analyze upcoming 48-hour weather impacts on my cotton and wheat irrigation scheduling.')}
              className="text-xs font-bold text-green-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              Ask Kisan Bhai about this forecast &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 4. WEATHER → FARMING ACTION (THE MOST IMPORTANT SECTION) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Action Engine
              </span>
              <span className="text-xs text-stone-500 font-medium">Weather Data &rarr; AI Analysis &rarr; Farming Decision</span>
            </div>
            <h2 className="text-2xl font-extrabold font-display text-stone-900">
              Weather &rarr; Farming Action
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Transforming raw weather measurements directly into specific daily tasks and protective agronomic decisions.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center bg-stone-100 p-1 rounded-2xl gap-1">
            {(['all', 'irrigation', 'spraying', 'disease'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                id={`tab-action-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                  activeTab === tab ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {tab === 'all' ? 'All Actions' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActions.map((action) => (
            <div
              key={action.id}
              className="p-4 rounded-2xl border border-stone-200/80 hover:border-emerald-500/50 bg-gradient-to-b from-stone-50/50 to-white transition-all shadow-2xs space-y-3 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-xl shrink-0">
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm group-hover:text-green-700 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">{action.conditionDescription}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    action.urgency === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : action.urgency === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {action.urgency} Urgency
                </span>
              </div>

              {/* Recommended Action Box */}
              <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-600/15 space-y-1">
                <span className="text-[11px] font-bold text-green-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Recommended Action:
                </span>
                <p className="text-xs text-stone-800 font-medium leading-relaxed">
                  {action.recommendedAction}
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  id={`btn-save-diary-${action.id}`}
                  onClick={() => handleSaveActionToDiary(action)}
                  className="text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Log to Farm Diary</span>
                </button>

                {action.actionCategory === 'IRRIGATION' ? (
                  <button
                    type="button"
                    id={`btn-goto-irrigation-${action.id}`}
                    onClick={() => setCurrentView('smart-irrigation')}
                    className="font-bold text-green-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Adjust Irrigation</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : action.actionCategory === 'PEST_DISEASE' ? (
                  <button
                    type="button"
                    id={`btn-goto-scanner-${action.id}`}
                    onClick={() => setCurrentView('crop-disease-scanner')}
                    className="font-bold text-green-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Disease Scanner</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    type="button"
                    id={`btn-ask-ai-action-${action.id}`}
                    onClick={() => askAiWithPrompt(`Provide specific guidance on: ${action.title} - ${action.recommendedAction}`)}
                    className="font-bold text-green-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ask AI Advice</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 7-DAY FARM FORECAST (HORIZONTAL CARDS) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-stone-900">
              7-Day Precision Farm Forecast
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Day-by-day agro-meteorological trajectory to plan spraying, irrigation cycles, and labor deployment.
            </p>
          </div>
          <span className="text-xs text-stone-400 font-mono">
            Click any day to view detailed agronomical advisory
          </span>
        </div>

        {/* Horizontal 7-Day Scroller / Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {forecast.map((day, idx) => {
            const isSelected = selectedDayIdx === idx;
            const isRainy = day.rainChance >= 45;
            return (
              <div
                key={day.day + idx}
                id={`card-forecast-day-${idx}`}
                onClick={() => setSelectedDayIdx(idx)}
                className={`p-4 rounded-2xl border text-center transition-all cursor-pointer space-y-2.5 relative ${
                  isSelected
                    ? 'bg-green-700 text-white border-green-700 shadow-md scale-102 ring-2 ring-emerald-400/50'
                    : 'bg-stone-50/70 hover:bg-stone-100/80 text-stone-900 border-stone-200/80'
                }`}
              >
                {/* Day Header */}
                <div>
                  <span className={`font-bold text-sm block ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                    {day.day}
                  </span>
                  <span className={`text-[10px] block ${isSelected ? 'text-emerald-200' : 'text-stone-400'}`}>
                    {day.date}
                  </span>
                </div>

                {/* Weather Icon */}
                <div className="text-2xl py-1">{day.icon || '☀️'}</div>

                {/* Temperature */}
                <div>
                  <div className={`font-extrabold text-base ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                    {day.tempHigh}°C
                  </div>
                  <div className={`text-[11px] font-medium ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                    Low: {day.tempLow}°C
                  </div>
                </div>

                {/* Rain Probability Pill */}
                <div>
                  <span
                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? isRainy
                          ? 'bg-blue-400 text-blue-950'
                          : 'bg-white/20 text-emerald-100'
                        : isRainy
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-stone-200/70 text-stone-700'
                    }`}
                  >
                    💧 {day.rainChance}%
                  </span>
                </div>

                {/* Micro metrics: Humidity & Wind */}
                <div className={`text-[10px] space-y-0.5 pt-1 border-t ${isSelected ? 'border-white/20 text-stone-200' : 'border-stone-200 text-stone-500'}`}>
                  <div className="flex justify-between">
                    <span>Hum:</span>
                    <span className="font-semibold">{day.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wind:</span>
                    <span className="font-semibold">{day.windKmh} km/h</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Day Expanded Agronomic Advisory */}
        {selectedDay && (
          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-600/20 space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2 font-bold text-sm text-green-700">
                <ShieldCheck className="w-5 h-5" />
                <span>
                  {selectedDay.day} ({selectedDay.date}) — Agronomic Advisory for {farmerProfile?.mainCrop || 'Cotton & Wheat'}:
                </span>
              </div>
              <span className="text-xs bg-white text-emerald-800 font-semibold px-2.5 py-1 rounded-lg border border-emerald-200">
                Condition: {selectedDay.condition}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
              {selectedDay.advisory}
            </p>
          </div>
        )}
      </div>

      {/* 6. HACKATHON SHORTCUTS & SMART IRRIGATION BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-[#1b3811] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl border border-blue-400/20">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/30 text-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-400/30">
              Module Synergy
            </span>
            <span className="text-xs text-stone-300">Weather + Smart Irrigation</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            Connect Weather Forecast with Soil IoT & Smart Irrigation
          </h2>
          <p className="text-xs sm:text-sm text-stone-200">
            Combine 48-hour rain probabilities with in-ground capacitive soil sensors to eliminate water waste and automate solar pump operations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          <button
            type="button"
            id="btn-goto-smart-irrigation-banner"
            onClick={() => setCurrentView('smart-irrigation')}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
          >
            <span>Open Smart Irrigation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            id="btn-ask-ai-irrigation-query"
            onClick={() => askAiWithPrompt('Should I water my wheat today considering tomorrow\'s rainfall forecast?')}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/20 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-emerald-300" />
            <span>Ask &ldquo;Should I irrigate?&rdquo;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
