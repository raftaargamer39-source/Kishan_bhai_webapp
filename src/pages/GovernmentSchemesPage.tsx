import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Landmark,
  Search,
  CheckCircle2,
  ExternalLink,
  FileText,
  ShieldCheck,
  Calendar,
  Clock,
  RefreshCw,
  ChevronRight,
  X,
  Plus,
  TrendingUp,
  MapPin,
  Building,
  PhoneCall,
  Sparkles,
  Award,
  Filter,
  Info,
} from 'lucide-react';
import { GOVERNMENT_SCHEMES_CATALOG } from '../data/agriData';
import { GovernmentScheme, SchemeApplication, StateSchemeIntelligence } from '../../shared/types';

interface SchemeStats {
  dbtConnectionStatus: string;
  totalActiveSchemes: number;
  openForApplications: number;
  closingSoonDeadlines: number;
  totalBeneficiariesCount: string;
  totalDisbursedFY: string;
}

const ALL_INDIAN_STATES = [
  'All India',
  'Gujarat',
  'Assam',
  'Maharashtra',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Rajasthan',
  'Punjab',
  'Telangana',
  'Odisha',
  'Bihar',
  'Haryana',
  'Karnataka',
  'Andhra Pradesh',
  'West Bengal',
  'Tamil Nadu',
];

export const GovernmentSchemesPage: React.FC = () => {
  const { language } = useApp();
  const isHi = language === 'hi';
  const { farmerProfile } = useUserStore();

  // User's default detected state from profile (defaults to Gujarat for Ramesh Patel)
  const defaultUserHomeState = farmerProfile?.state || 'Gujarat';

  const [schemes, setSchemes] = useState<GovernmentScheme[]>(GOVERNMENT_SCHEMES_CATALOG);
  const [stats, setStats] = useState<SchemeStats | null>(null);
  const [myApplications, setMyApplications] = useState<SchemeApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'schemes' | 'my-applications'>('schemes');

  // State-based filtering & suggestion controls
  const [selectedState, setSelectedState] = useState<string>(defaultUserHomeState);
  const [stateFilterMode, setStateFilterMode] = useState<'all' | 'stateOnly' | 'recommended'>('all');
  const [stateIntelligence, setStateIntelligence] = useState<StateSchemeIntelligence | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Closing Soon' | 'Year-round Open'>('All');
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [apiOnline, setApiOnline] = useState(true);

  // New Application Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applySchemeId, setApplySchemeId] = useState<string>('sch_gj_mksy');
  const [applyDate, setApplyDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [applyBenefit, setApplyBenefit] = useState<string>('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);

  const categories = [
    'All',
    'Direct Income Support',
    'Crop Insurance',
    'Credit & Loan',
    'Irrigation Subsidy',
    'Organic & Soil',
    'Farm Mechanization',
  ];

  // Fetch real-time data from Express backend API with state suggestion parameters
  const fetchRealTimeSchemes = async (
    stateArg = selectedState,
    filterModeArg = stateFilterMode
  ) => {
    setIsLoading(true);
    try {
      // 1. Fetch live schemes according to selected state & mode
      const queryParams = new URLSearchParams({
        state: stateArg,
        filterMode: filterModeArg,
      });
      if (selectedCategory !== 'All') queryParams.append('category', selectedCategory);
      if (statusFilter !== 'All') queryParams.append('status', statusFilter);

      const schemesRes = await fetch(`/api/schemes?${queryParams.toString()}`);
      if (schemesRes.ok) {
        const schemesData = await schemesRes.json();
        if (schemesData.schemes && schemesData.schemes.length > 0) {
          setSchemes(schemesData.schemes);
        }
        if (schemesData.stateIntelligence) {
          setStateIntelligence(schemesData.stateIntelligence);
        }
      }

      // 2. Fetch live stats
      const statsRes = await fetch('/api/schemes/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 3. Fetch farmer applications
      const appsRes = await fetch(
        `/api/schemes/my-applications?farmerName=${encodeURIComponent(farmerProfile?.name || 'Ramesh Patel')}`
      );
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        if (appsData.applications) {
          setMyApplications(appsData.applications);
        }
      }

      setApiOnline(true);
      setLastSyncTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch {
      setApiOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeSchemes(selectedState, stateFilterMode);
    const interval = setInterval(() => fetchRealTimeSchemes(selectedState, stateFilterMode), 60000);
    return () => clearInterval(interval);
  }, [selectedState, stateFilterMode]);

  // Filter schemes client-side for search term and category
  const filteredSchemes = schemes.filter((scheme) => {
    const matchSearch =
      scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.hindiName.includes(searchTerm) ||
      scheme.benefitSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (scheme.stateAvailability && scheme.stateAvailability.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (scheme.applicationDeadline && scheme.applicationDeadline.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCat = selectedCategory === 'All' || scheme.category === selectedCategory;

    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Open' && (scheme.applicationStatus === 'Open' || scheme.applicationStatus === 'Year-round Open')) ||
      scheme.applicationStatus === statusFilter;

    return matchSearch && matchCat && matchStatus;
  });

  // Handle Record Application submission
  const handleRecordApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingApp(true);
    try {
      const targetScheme = schemes.find((s) => s.id === applySchemeId) || schemes[0];
      const res = await fetch('/api/schemes/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeId: targetScheme.id,
          schemeName: targetScheme.name,
          farmerName: farmerProfile?.name || 'Ramesh Patel',
          applicationDate: applyDate, // User selected Date of Application
          appliedAmountOrBenefit: applyBenefit || targetScheme.financialAssistance,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.application) {
          setMyApplications((prev) => [data.application, ...prev]);
          setApplySuccessMsg(
            isHi
              ? `आवेदन सफलतापूर्वक दर्ज किया गया! पावती संख्या: ${data.application.acknowledgementNumber}`
              : `Application recorded successfully! Acknowledgement: ${data.application.acknowledgementNumber}`
          );
          setTimeout(() => {
            setApplySuccessMsg(null);
            setIsApplyModalOpen(false);
            setActiveTab('my-applications');
          }, 1800);
        }
      }
    } catch {
      // Offline fallback
      const targetScheme = schemes.find((s) => s.id === applySchemeId) || schemes[0];
      const localApp: SchemeApplication = {
        id: `app_local_${Date.now()}`,
        schemeId: targetScheme.id,
        schemeName: targetScheme.name,
        farmerName: farmerProfile?.name || 'Ramesh Patel',
        applicationDate: applyDate,
        acknowledgementNumber: `KB/${selectedState.substring(0, 2).toUpperCase()}/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`,
        appliedAmountOrBenefit: applyBenefit || targetScheme.financialAssistance,
        status: 'Submitted',
        currentStage: 1,
        remarks: `Recorded on ${applyDate} for ${selectedState} portal review.`,
        lastUpdated: new Date().toISOString(),
      };
      setMyApplications((prev) => [localApp, ...prev]);
      setIsApplyModalOpen(false);
      setActiveTab('my-applications');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    if (dateStr.toLowerCase().includes('year-round')) return isHi ? 'वर्ष भर खुला' : 'Year-round Open';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isCurrentStateSelected = (stateName: string) =>
    selectedState.toLowerCase() === stateName.toLowerCase();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header with Live DBT API Status */}
      <div className="bg-gradient-to-r from-[#1B3B11] via-green-800 to-emerald-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-400/30 rounded-full text-[11px] font-bold text-emerald-300">
                <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                <span>DBT Bharat & State Portals Gateway</span>
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  apiOnline
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                    : 'bg-amber-500/20 text-amber-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isHi ? 'रीयल-टाइम डेटा सक्रिय' : 'Real-Time API Connected'}</span>
              </span>

              {/* Farmer State Indicator */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 border border-amber-300/40 text-amber-200">
                <MapPin className="w-3 h-3 text-amber-300" />
                <span>
                  {isHi ? `किसान राज्य: ${farmerProfile?.state || 'गुजरात'}` : `Farmer State: ${farmerProfile?.state || 'Gujarat'}`}
                </span>
              </span>

              <span className="text-xs text-emerald-200/70 font-mono">
                {isHi ? `सिंक: ${lastSyncTime}` : `Sync: ${lastSyncTime}`}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {isHi
                ? 'राज्य अनुसार सरकारी कृषि योजनाएं व आवेदन तारीख'
                : 'State-Smart Government Schemes & Real-Time Application Dates'}
            </h1>

            <p className="text-emerald-100/85 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {isHi
                ? `${selectedState} के किसानों हेतु विशेष राज्य अनुदान, आई-खेड़ूत / महाडीबीटी पोर्टल योजनाएं, पीएम-किसान, फसल बीमा, कट-ऑफ डेडलाइन और रीयल-टाइम आवेदन ट्रैकर।`
                : `Verified state-tailored agricultural subsidies for ${selectedState}, official state department portals, application windows, cut-off deadlines, and personal application tracker.`}
            </p>
          </div>

          {/* Quick Actions & Live Refresh */}
          <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0 self-start md:self-auto">
            <button
              onClick={() => fetchRealTimeSchemes(selectedState, stateFilterMode)}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/40 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer backdrop-blur-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>
                {isLoading
                  ? isHi ? 'रिफ्रेश हो रहा है...' : 'Syncing...'
                  : isHi ? 'रीयल-टाइम रिफ्रेश' : 'Refresh Real-Time'}
              </span>
            </button>

            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isHi ? 'आवेदन तारीख दर्ज करें' : 'Record Application Date'}</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-emerald-600/30">
          <div className="bg-emerald-950/40 border border-emerald-500/20 p-3 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-emerald-300">
              {isHi ? 'उपलब्ध योजनाएं' : 'Total Schemes'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {schemes.length}
            </div>
            <div className="text-[10px] text-emerald-200/70">
              {selectedState === 'All India' ? (isHi ? 'संपूर्ण भारत' : 'All India') : `${selectedState} + Central`}
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/20 p-3 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-emerald-300">
              {isHi ? 'आवेदन चालू (Open Now)' : 'Open for Application'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
              {schemes.filter((s) => s.applicationStatus === 'Open' || s.applicationStatus === 'Year-round Open').length}
            </div>
            <div className="text-[10px] text-emerald-200/70">{isHi ? 'तुरंत आवेदन योग्य' : 'Accepting Today'}</div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/20 p-3 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-amber-300">
              {isHi ? 'अंतिम तिथि नज़दीक' : 'Closing Soon'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
              {schemes.filter((s) => s.applicationStatus === 'Closing Soon').length}
            </div>
            <div className="text-[10px] text-amber-200/70">{isHi ? '30 दिन के भीतर कट-ऑफ' : 'Deadlines in ≤30d'}</div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/20 p-3 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-emerald-300">
              {isHi ? 'राज्य विशेष योजनाएं' : 'State Exclusives'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {schemes.filter((s) => s.isStateExclusive).length}
            </div>
            <div className="text-[10px] text-emerald-200/70">
              {isHi ? `${selectedState} सरकार द्वारा` : `By ${selectedState} Govt`}
            </div>
          </div>
        </div>
      </div>

      {/* STATE SELECTION & SUGGESTION BAR */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-green-800 rounded-lg">
                <MapPin className="w-4 h-4" />
              </span>
              <h2 className="text-sm sm:text-base font-bold text-stone-900">
                {isHi ? 'राज्य अनुसार योजना सुझाव (Suggest According to State)' : 'State Agricultural Scheme Suggestions'}
              </h2>
            </div>
            <p className="text-xs text-stone-500">
              {isHi
                ? `वर्तमान में ${selectedState} के किसानों हेतु अनुकूलित योजनाएं दिखाई जा रही हैं। अपना राज्य बदलें या नीचे तुरंत सुझाव देखें:`
                : `Showing customized schemes, portals, and subsidies tailored for farmers in ${selectedState}. Switch state or filter recommendations:`}
            </p>
          </div>

          {/* State Dropdown Picker */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-stone-600 whitespace-nowrap hidden sm:inline">
              {isHi ? 'राज्य चुनें:' : 'Select State:'}
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                const newState = e.target.value;
                setSelectedState(newState);
                fetchRealTimeSchemes(newState, stateFilterMode);
              }}
              className="px-3.5 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-600 cursor-pointer shadow-2xs"
            >
              {ALL_INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st === defaultUserHomeState ? `🌾 ${st} (My Profile State)` : `📍 ${st}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick State Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {ALL_INDIAN_STATES.slice(0, 9).map((st) => {
            const isSelected = isCurrentStateSelected(st);
            const isHome = st.toLowerCase() === defaultUserHomeState.toLowerCase();

            return (
              <button
                key={st}
                onClick={() => {
                  setSelectedState(st);
                  fetchRealTimeSchemes(st, stateFilterMode);
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-green-700 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <span>{st === 'All India' ? '🇮🇳' : '📍'}</span>
                <span>{st}</span>
                {isHome && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    {isHi ? 'मेरा राज्य' : 'My State'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* State Recommendation Filter Mode Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{isHi ? 'दिखाएं:' : 'Mode:'}</span>
            </span>

            <button
              onClick={() => {
                setStateFilterMode('all');
                fetchRealTimeSchemes(selectedState, 'all');
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                stateFilterMode === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {isHi ? `सभी योजनाएं (${selectedState} प्राथमिकता)` : `All (${selectedState} First)`}
            </button>

            <button
              onClick={() => {
                setStateFilterMode('recommended');
                fetchRealTimeSchemes(selectedState, 'recommended');
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                stateFilterMode === 'recommended'
                  ? 'bg-amber-500 text-stone-950 shadow-xs font-black'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isHi ? `⭐ ${selectedState} हेतु शीर्ष अनुशंसित` : `⭐ Recommended for ${selectedState}`}</span>
            </button>

            <button
              onClick={() => {
                setStateFilterMode('stateOnly');
                fetchRealTimeSchemes(selectedState, 'stateOnly');
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                stateFilterMode === 'stateOnly'
                  ? 'bg-green-800 text-white shadow-xs font-bold'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {isHi ? `केवल ${selectedState} विशेष योजनाएं` : `Only ${selectedState} Exclusives`}
            </button>
          </div>

          <div className="text-xs text-stone-500 font-medium flex items-center gap-1">
            <Award className="w-4 h-4 text-amber-600" />
            <span>
              {isHi
                ? `${filteredSchemes.length} योजनाएं उपलब्ध`
                : `${filteredSchemes.length} schemes matched`}
            </span>
          </div>
        </div>
      </div>

      {/* STATE INTELLIGENCE BANNER (PORTAL, HELPLINE, SUBSIDY HIGHLIGHT) */}
      {stateIntelligence && (
        <div className="bg-gradient-to-br from-emerald-50 via-green-50/60 to-amber-50/50 border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-emerald-200/80">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                {selectedState.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-emerald-950">
                    {stateIntelligence.state} {stateIntelligence.stateHindi && `(${stateIntelligence.stateHindi})`}
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-200/80 text-emerald-900 rounded-md">
                    {stateIntelligence.exclusiveSchemesCount > 0
                      ? `${stateIntelligence.exclusiveSchemesCount} State Exclusive Schemes`
                      : 'Central Schemes Node'}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-medium flex items-center gap-1.5 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-green-700 shrink-0" />
                  <span>{stateIntelligence.primaryNodalDepartment}</span>
                </p>
              </div>
            </div>

            {/* State Helpline & Portal Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href={`tel:${stateIntelligence.helplineNumber}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-bold transition-all shadow-2xs"
                title="Call Official State Kisan Helpline"
              >
                <PhoneCall className="w-3.5 h-3.5 text-green-700" />
                <span>{stateIntelligence.helplineNumber}</span>
              </a>

              <a
                href={stateIntelligence.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <span>{isHi ? `${stateIntelligence.officialPortalName} खोलें` : `Open ${stateIntelligence.officialPortalName}`}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Highlight Cards: Top State Subsidy Alert & Focus Crops */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-white/90 rounded-2xl border border-emerald-200/80 md:col-span-2 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isHi ? `${stateIntelligence.state} राज्य मुख्य सब्सिडी लाभ` : `${stateIntelligence.state} Top Benefit Highlight`}</span>
              </div>
              <p className="text-emerald-950 font-medium leading-relaxed">
                {stateIntelligence.stateTopBenefitHighlight}
              </p>
              {stateIntelligence.subsidyAlert && (
                <div className="pt-1 text-[11px] text-amber-900 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{stateIntelligence.subsidyAlert}</span>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-white/90 rounded-2xl border border-emerald-200/80 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                {isHi ? 'अनुशंसित प्राथमिक फसलें:' : 'State Recommended Crops:'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stateIntelligence.recommendedFocusCrops.map((crop, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-100/80 text-emerald-900 rounded-lg"
                  >
                    🌾 {crop}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs: Catalog vs My Applications */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('schemes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'schemes'
                ? 'bg-green-700 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>
              {isHi
                ? `${selectedState} योजनाएं व अंतिम तारीख`
                : `${selectedState} Schemes & Deadlines`}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-md font-mono">
              {filteredSchemes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('my-applications')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'my-applications'
                ? 'bg-green-700 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{isHi ? 'मेरे आवेदन व तारीख' : 'My Applications & Status'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                activeTab === 'my-applications' ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {myApplications.length}
            </span>
          </button>
        </div>

        <span className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{isHi ? '100% आधिकारिक पोर्टल लिंक' : 'Official State & Central Portals'}</span>
        </span>
      </div>

      {/* TAB 1: SCHEMES CATALOG */}
      {activeTab === 'schemes' && (
        <div className="space-y-6">
          {/* Search, Status & Category Filters */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    isHi
                      ? `योजना का नाम, ${selectedState} सब्सिडी, या अंतिम तारीख खोजें...`
                      : `Search scheme name, ${selectedState} subsidy, benefit, or application deadline...`
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>

              {/* Status Filter Dropdown / Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['All', 'Open', 'Closing Soon', 'Year-round Open'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                    }`}
                  >
                    {st === 'All'
                      ? isHi ? 'सभी स्थितियां' : 'All Status'
                      : st === 'Open'
                      ? isHi ? '🟢 चालू आवेदन' : '🟢 Open Now'
                      : st === 'Closing Soon'
                      ? isHi ? '⏳ जल्द समाप्त' : '⏳ Closing Soon'
                      : isHi ? '📅 वर्ष भर' : '📅 Year-Round'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-stone-100 pt-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-green-700 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {cat === 'All' ? (isHi ? 'सभी श्रेणियां' : 'All Categories') : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Schemes Grid with State Intelligence & Application Dates */}
          {filteredSchemes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
              <Info className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">
                {isHi ? `${selectedState} में इस फ़िल्टर हेतु कोई योजना नहीं मिली` : `No schemes found for this filter in ${selectedState}`}
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {isHi
                  ? 'फ़िल्टर रीसेट करें या "सभी योजनाएं" मोड पर स्विच करें ताकि केंद्रीय और अन्य राज्य योजनाएं देख सकें।'
                  : 'Try resetting the search filter or switch to "All" mode to view nationwide agricultural schemes.'}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setStatusFilter('All');
                  setStateFilterMode('all');
                  fetchRealTimeSchemes(selectedState, 'all');
                }}
                className="px-4 py-2 bg-green-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                {isHi ? 'सभी योजनाएं देखें' : 'Show All Schemes'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSchemes.map((scheme) => {
                const isClosingSoon = scheme.applicationStatus === 'Closing Soon';
                const isYearRound = scheme.applicationStatus === 'Year-round Open';
                const isStateExclusive = scheme.isStateExclusive || scheme.stateAvailability !== 'All India';

                return (
                  <div
                    key={scheme.id}
                    className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4 relative ${
                      isStateExclusive
                        ? 'border-emerald-300 ring-1 ring-emerald-400/30 shadow-xs hover:shadow-md'
                        : 'border-stone-200 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top Badges: State Origin Badge & Application Status Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isStateExclusive ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                              <MapPin className="w-3 h-3" />
                              <span>{scheme.stateAvailability} Govt Exclusive</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full">
                              <span>🇮🇳 All India (Central)</span>
                            </span>
                          )}

                          <span className="text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded-md">
                            {scheme.category}
                          </span>
                        </div>

                        {/* Application Status Badge */}
                        {isClosingSoon ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-md animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>
                              {scheme.daysRemaining
                                ? isHi
                                  ? `अंतिम ${scheme.daysRemaining} दिन शेष`
                                  : `${scheme.daysRemaining} Days Remaining`
                                : isHi ? 'जल्द समाप्त' : 'Closing Soon'}
                            </span>
                          </span>
                        ) : isYearRound ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-md">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            <span>{isHi ? 'वर्ष भर खुला' : 'Year-Round Active'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isHi ? 'आवेदन चालू' : 'Open for Application'}</span>
                          </span>
                        )}
                      </div>

                      {/* State Recommendation Badge */}
                      {scheme.stateRecommendationBadge && (
                        <div className="mb-2 p-2 bg-amber-50/90 border border-amber-200/80 rounded-xl text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{scheme.stateRecommendationBadge}</span>
                        </div>
                      )}

                      <h3 className="text-lg font-bold text-stone-900 tracking-tight leading-snug">
                        {scheme.name}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium mt-0.5">{scheme.hindiName}</p>

                      {/* Financial Assistance Bar */}
                      <div className="my-3 p-3 bg-emerald-50/80 rounded-2xl border border-emerald-100 text-xs flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-emerald-950">
                            {isHi ? 'वित्तीय सहायता: ' : 'Financial Assistance: '}
                          </span>
                          <span className="text-emerald-900 font-medium">{scheme.financialAssistance}</span>
                          {scheme.stateSpecificBenefit && (
                            <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                              ✨ {scheme.stateSpecificBenefit}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Real-time Application Dates Highlight Box */}
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-500 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-stone-600" />
                            <span className="font-medium">{isHi ? 'आवेदन प्रारंभ तिथि:' : 'Application Start Date:'}</span>
                          </span>
                          <span className="font-bold text-stone-900 font-mono">
                            {formatDate(scheme.applicationStartDate) || 'Active'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-stone-600" />
                            <span className="font-medium">{isHi ? 'आवेदन की अंतिम तारीख:' : 'Application Deadline:'}</span>
                          </span>
                          <span
                            className={`font-bold font-mono ${
                              isClosingSoon ? 'text-amber-800 underline' : 'text-stone-900'
                            }`}
                          >
                            {formatDate(scheme.applicationDeadline) || (isHi ? 'वर्ष भर खुला' : 'Year-round')}
                          </span>
                        </div>

                        {scheme.nextInstallmentDate && (
                          <div className="flex items-start justify-between text-[11px] pt-1.5 border-t border-stone-200/80 text-emerald-900">
                            <span className="font-bold">{isHi ? 'आगामी किस्त / लाभ:' : 'Next Disbursement:'}</span>
                            <span className="font-medium text-right max-w-[60%]">{scheme.nextInstallmentDate}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {scheme.benefitSummary}
                      </p>
                    </div>

                    {/* Bottom Controls */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-stone-500 truncate max-w-[45%] flex items-center gap-1">
                        <Building className="w-3 h-3 text-stone-400 shrink-0" />
                        <span>{scheme.stateDepartment || scheme.ministry.split('&')[0]}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setApplySchemeId(scheme.id);
                            setIsApplyModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                          title="Record your date of application"
                        >
                          {isHi ? 'आवेदन दर्ज करें' : 'Track App'}
                        </button>

                        <button
                          onClick={() => setSelectedScheme(scheme)}
                          className="flex items-center gap-1 px-3.5 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                          <span>{isHi ? 'विवरण देखें' : 'View Details'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS & APPLICATION DATES TRACKER */}
      {activeTab === 'my-applications' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                {isHi ? 'मेरे सरकारी योजना आवेदन और आवेदन की तारीख' : 'My Scheme Applications & Dates'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {isHi
                  ? `${farmerProfile?.name || 'किसान'} द्वारा दर्ज किए गए सभी आवेदनों की तारीख, पावती संख्या व सत्यापन स्थिति का रीयल-टाइम रिकॉर्ड (${selectedState})।`
                  : `Real-time record of your submission dates, acknowledgement IDs, and current Tehsil / DBT approval status (${selectedState}).`}
              </p>
            </div>

            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{isHi ? 'नया आवेदन जोड़ें' : 'Add Scheme Application'}</span>
            </button>
          </div>

          {myApplications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-6 space-y-3">
              <Calendar className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">
                {isHi ? 'कोई आवेदन दर्ज नहीं है' : 'No Applications Recorded Yet'}
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {isHi
                  ? `यदि आपने पीएम-किसान, ${selectedState} फसल योजना या कृषि यंत्र सब्सिडी में आवेदन किया है, तो अपनी आवेदन तारीख दर्ज करके स्थिति ट्रैक करें।`
                  : `Record the date when you applied for PM-KISAN, ${selectedState} state grants, or drip subsidies to monitor review milestones.`}
              </p>
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="px-4 py-2 bg-green-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {isHi ? 'आवेदन दर्ज करें' : 'Record Application Now'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs hover:border-emerald-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md">
                          {app.acknowledgementNumber}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            app.status === 'Disbursed'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : app.status === 'Tehsil Approved'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-stone-900 mt-1">{app.schemeName}</h3>
                      <p className="text-xs text-stone-500">
                        {app.farmerName} ({farmerProfile?.village ? `${farmerProfile.village}, ${farmerProfile.district}` : selectedState}) • {app.appliedAmountOrBenefit}
                      </p>
                    </div>

                    {/* Prominent Application Date Badge */}
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-3 shrink-0">
                      <Calendar className="w-5 h-5 text-green-700 shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                          {isHi ? 'आवेदन की तारीख' : 'Date of Application'}
                        </div>
                        <div className="text-sm font-black text-emerald-950 font-mono">
                          {formatDate(app.applicationDate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4-Stage Visual Progress Timeline */}
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                      {isHi ? 'आवेदन प्रगति स्थिति' : 'Application Review Timeline'}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { step: 1, title: isHi ? 'आवेदन जमा' : 'Application Submitted', desc: formatDate(app.applicationDate) },
                        { step: 2, title: isHi ? 'दस्तावेज जांच' : 'Document Verification', desc: app.currentStage >= 2 ? 'Verified' : 'Pending' },
                        { step: 3, title: isHi ? 'तहसील / जिला स्वीकृति' : 'District Approval', desc: app.currentStage >= 3 ? 'Approved' : 'Pending' },
                        { step: 4, title: isHi ? 'डीबीटी भुगतान' : 'DBT Disbursed', desc: app.currentStage >= 4 ? 'Credited' : 'Scheduled' },
                      ].map((st) => {
                        const isDone = app.currentStage >= st.step;
                        const isCurrent = app.currentStage === st.step;

                        return (
                          <div
                            key={st.step}
                            className={`p-3 rounded-2xl border text-xs ${
                              isDone
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                : 'bg-stone-50 border-stone-200 text-stone-500'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold mb-1">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-[10px]">
                                  {st.step}
                                </span>
                              )}
                              <span className={isCurrent ? 'text-emerald-900 font-black' : ''}>{st.title}</span>
                            </div>
                            <div className="text-[10px] text-stone-500 pl-5">{st.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Remarks & Last Update Note */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 gap-2">
                    <div>
                      <span className="font-bold text-stone-800">{isHi ? 'टिप्पणी: ' : 'Remarks: '}</span>
                      <span>{app.remarks}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {isHi ? 'अंतिम अपडेट: ' : 'Updated: '}
                      {new Date(app.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: RECORD APPLICATION DATE MODAL */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-green-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    {isHi ? 'सरकारी योजना आवेदन तारीख दर्ज करें' : 'Record Scheme Application Date'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {isHi ? `${selectedState} पोर्टल आवेदन व स्थिति ट्रैकिंग` : `${selectedState} portal submission & status tracking`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applySuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{applySuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleRecordApplication} className="space-y-4">
                {/* Select Scheme */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {isHi ? 'योजना का चयन करें *' : 'Select Government Scheme *'}
                  </label>
                  <select
                    value={applySchemeId}
                    onChange={(e) => setApplySchemeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 font-medium cursor-pointer"
                  >
                    {schemes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.stateAvailability || 'All India'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* EXACT DATE OF APPLICATION INPUT */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-green-700" />
                    <span>{isHi ? 'आवेदन की तारीख (Date of Application) *' : 'Date of Application *'}</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={applyDate}
                    onChange={(e) => setApplyDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-600"
                  />
                  <p className="text-[11px] text-emerald-800">
                    {isHi
                      ? `वह तारीख जब आपने आधिकारिक पोर्टल (${stateIntelligence?.officialPortalName || 'पोर्टल'}) पर आवेदन जमा किया था।`
                      : `The date when you submitted the application on ${stateIntelligence?.officialPortalName || 'the official portal'}.`}
                  </p>
                </div>

                {/* Optional Benefit / Claim Amount */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {isHi ? 'दावा / अपेक्षित लाभ (वैकल्पिक)' : 'Claim / Applied Benefit (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={isHi ? 'उदा. ₹6,000 / वर्ष या 70% ड्रिप सब्सिडी' : 'e.g. ₹6,000 / year or 70% Drip Subsidy'}
                    value={applyBenefit}
                    onChange={(e) => setApplyBenefit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingApp}
                    className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmittingApp && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isHi ? 'तारीख व आवेदन सहेजें' : 'Save Application Date'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: DETAILED SCHEME VIEW WITH APPLICATION SCHEDULE */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 space-y-6 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                    {selectedScheme.category}
                  </span>
                  <span className="text-xs font-bold bg-stone-100 text-stone-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-600" />
                    <span>{selectedScheme.stateAvailability || 'All India'}</span>
                  </span>
                </div>
                <h2 className="text-xl font-bold text-stone-900 mt-2">{selectedScheme.name}</h2>
                <p className="text-xs text-stone-500">{selectedScheme.hindiName} • {selectedScheme.ministry}</p>
              </div>

              <button
                onClick={() => setSelectedScheme(null)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Application Window & Schedule Card */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-green-700" />
                <span>{isHi ? 'आधिकारिक आवेदन तारीख व समय-सारणी' : 'Official Application Dates & Schedule'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-stone-100">
                  <div className="text-stone-500 text-[10px] uppercase font-bold">
                    {isHi ? 'आवेदन प्रारंभ तिथि' : 'Application Start Date'}
                  </div>
                  <div className="text-sm font-black text-stone-900 font-mono mt-0.5">
                    {formatDate(selectedScheme.applicationStartDate) || 'Active / Continuous'}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-100">
                  <div className="text-stone-500 text-[10px] uppercase font-bold">
                    {isHi ? 'आवेदन की अंतिम तारीख (Deadline)' : 'Application Cut-off Deadline'}
                  </div>
                  <div className="text-sm font-black text-amber-900 font-mono mt-0.5">
                    {formatDate(selectedScheme.applicationDeadline) || 'Year-round Open'}
                  </div>
                </div>
              </div>

              {selectedScheme.nextInstallmentDate && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{isHi ? 'आगामी भुगतान चक्र: ' : 'Disbursement Schedule: '}</span>
                    <span>{selectedScheme.nextInstallmentDate}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Assistance Card */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1">
                {isHi ? 'वित्तीय सहायता व लाभ' : 'Financial Benefit & Subsidy'}
              </div>
              <div className="text-base font-bold text-emerald-900">{selectedScheme.financialAssistance}</div>
              {selectedScheme.stateSpecificBenefit && (
                <div className="text-xs text-emerald-950 font-bold mt-1">
                  🌟 {selectedScheme.stateSpecificBenefit}
                </div>
              )}
              <p className="text-xs text-emerald-800/90 mt-1">{selectedScheme.benefitSummary}</p>
            </div>

            {/* Eligibility Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {isHi ? 'पात्रता मापदंड' : 'Eligibility Criteria'}
              </h4>
              <ul className="space-y-1.5">
                {selectedScheme.eligibilityCriteria.map((item, idx) => (
                  <li key={idx} className="text-xs text-stone-700 flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Documents */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {isHi ? 'आवश्यक दस्तावेज' : 'Required Documents'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedScheme.requiredDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-stone-700 flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-100"
                  >
                    <FileText className="w-4 h-4 text-green-700 shrink-0" />
                    <span className="font-medium">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Walkthrough */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {isHi ? 'आवेदन की क्रमबद्ध प्रक्रिया' : 'Step-by-Step Application Process'}
              </h4>
              <ol className="space-y-2">
                {selectedScheme.applicationProcess.map((step, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-stone-700 flex items-start gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100"
                  >
                    <span className="w-5 h-5 rounded-full bg-green-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
              <a
                href={selectedScheme.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>
                  {isHi
                    ? `आधिकारिक पोर्टल खोलें (${selectedScheme.stateAvailability || 'Govt'})`
                    : `Open Official Portal (${selectedScheme.stateAvailability || 'Govt'})`}
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  setApplySchemeId(selectedScheme.id);
                  setSelectedScheme(null);
                  setIsApplyModalOpen(true);
                }}
                className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black rounded-2xl transition-all cursor-pointer"
              >
                {isHi ? 'आवेदन तारीख दर्ज करें' : 'Record Application Date'}
              </button>

              <button
                onClick={() => setSelectedScheme(null)}
                className="py-3 px-5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl transition-all cursor-pointer"
              >
                {isHi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
