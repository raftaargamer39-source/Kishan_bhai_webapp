import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Settings,
  User,
  Globe,
  Bell,
  Shield,
  Smartphone,
  Save,
  CheckCircle2,
  Wallet,
  RotateCcw,
  Sparkles,
  Layers,
  Wifi,
  WifiOff,
  CloudLightning,
  RefreshCw,
  HardDrive,
  Moon,
  Sun,
  Monitor,
  Eye,
  Zap,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import {
  INDIAN_STATES_AND_DISTRICTS,
  getDistrictsForState,
} from '../data/indianStatesAndDistricts';

export const SettingsPage: React.FC = () => {
  const { farmerProfile, updateProfile } = useUserStore();
  const { language, setLanguage, wallet, addToast, isOnline, cacheStats, syncOfflineData, setIsOfflineModalOpen, themeMode, setThemeMode, isDarkMode, toggleDarkMode } = useApp();

  const [isSyncingOffline, setIsSyncingOffline] = useState(false);

  const [name, setName] = useState(farmerProfile.name);
  const [mobile, setMobile] = useState(farmerProfile.mobile);
  const [state, setState] = useState(farmerProfile.state);
  const [district, setDistrict] = useState(farmerProfile.district);
  const [village, setVillage] = useState(farmerProfile.village);
  const [farmSizeAcres, setFarmSizeAcres] = useState<number>(farmerProfile.farmSizeAcres);
  const [soilType, setSoilType] = useState(farmerProfile.soilType);
  const [mainCrop, setMainCrop] = useState(farmerProfile.mainCrop);

  // Notification toggles
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [moistureAlerts, setMoistureAlerts] = useState(true);
  const [priceSpikeAlerts, setPriceSpikeAlerts] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      mobile,
      state,
      district,
      village,
      farmSizeAcres: Number(farmSizeAcres),
      soilType,
      mainCrop,
      preferredLanguage: language,
    });
    addToast('Profile Updated', 'Farmer profile and agricultural preferences have been saved.', 'success');
  };

  const handleClearCache = () => {
    if (window.confirm('Reset local demo cache? (This will restore default seed data)')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3B11] via-[#244218] to-green-700 dark:from-[#0d1b0d] dark:via-[#152714] dark:to-[#1c331a] text-white p-6 sm:p-8 rounded-2xl shadow-md border border-emerald-900/30">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Settings className="w-4 h-4" />
              <span>{language === 'hi' ? 'सेटिंग्स और प्राथमिकताएं' : 'Preferences & Farm Account'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {language === 'hi' ? 'प्रोफ़ाइल, थीम और भाषा' : 'Farmer Profile & Settings'}
            </h1>
            <p className="text-emerald-100/80 text-sm mt-1">
              {language === 'hi'
                ? 'कम रोशनी वाले खेतों के लिए डार्क मोड, क्षेत्रीय भाषा, मृदा प्रकार और किसान प्रोफाइल प्रबंधित करें।'
                : 'Manage field night mode, regional language preference, IoT pump triggers, and wallet keys.'}
            </p>
          </div>

          <button
            onClick={toggleDarkMode}
            title="Quick Dark Mode Toggle"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-emerald-200 border border-white/15 text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-emerald-300" />}
            <span className="hidden sm:inline">
              {isDarkMode ? (language === 'hi' ? 'डे मोड' : 'Light Mode') : (language === 'hi' ? 'नाइट मोड' : 'Dark Mode')}
            </span>
          </button>
        </div>
      </div>

      {/* 1. DARK MODE & LOW-LIGHT FIELD DISPLAY CARD */}
      <div className="bg-white dark:bg-[#161c14] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6 space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100 dark:border-stone-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
              {isDarkMode ? <Moon className="w-5 h-5 text-emerald-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                {language === 'hi' ? 'फील्ड डिस्प्ले और नाइट मोड (Dark Mode)' : 'Low-Light Field & Night Mode'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {language === 'hi'
                  ? 'रात की सिंचाई, तड़के सुबह की गश्त और कम रोशनी में आंखों की सुरक्षा हेतु'
                  : 'OLED battery saver & anti-glare theme for night tube-well irrigation & early field scouting'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                isDarkMode
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-emerald-400' : 'bg-amber-500'}`} />
              {isDarkMode ? (language === 'hi' ? 'डार्क मोड सक्रिय' : 'Night Mode Active') : (language === 'hi' ? 'डे मोड सक्रिय' : 'Day Mode Active')}
            </span>
          </div>
        </div>

        {/* 3 Theme Mode Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Day Mode */}
          <button
            type="button"
            onClick={() => {
              setThemeMode('light');
              addToast('Day Theme Enabled', 'High-contrast sunlight clarity mode activated.', 'info');
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              themeMode === 'light'
                ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-50/60 dark:bg-[#1a2218]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                <Sun className="w-4 h-4" />
              </div>
              {themeMode === 'light' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {language === 'hi' ? '☀️ डे / लाइट मोड' : '☀️ Day Clarity Mode'}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {language === 'hi' ? 'धूप में अधिकतम कंट्रास्ट और स्पष्टता' : 'High sunlight contrast for open field work'}
              </div>
            </div>
          </button>

          {/* Night Mode */}
          <button
            type="button"
            onClick={() => {
              setThemeMode('dark');
              addToast('Night Theme Enabled', 'Low-light field night mode activated for zero eye strain.', 'success');
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              themeMode === 'dark'
                ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/60 ring-2 ring-emerald-600/30'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-50/60 dark:bg-[#1a2218]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-emerald-900 text-emerald-200 flex items-center justify-center shadow-xs">
                <Moon className="w-4 h-4" />
              </div>
              {themeMode === 'dark' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {language === 'hi' ? '🌙 नाइट / डार्क मोड' : '🌙 Low-Light Field Mode'}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {language === 'hi' ? 'कम बैटरी खपत व आंखों को सुकून' : 'OLED battery savings & zero midnight glare'}
              </div>
            </div>
          </button>

          {/* Auto System Mode */}
          <button
            type="button"
            onClick={() => {
              setThemeMode('system');
              addToast('Auto Mode Synced', 'Display now adapts to your device sunrise/sunset schedule.', 'info');
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              themeMode === 'system'
                ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-50/60 dark:bg-[#1a2218]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center shadow-xs">
                <Monitor className="w-4 h-4" />
              </div>
              {themeMode === 'system' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {language === 'hi' ? '⚙️ ऑटो (सिस्टम अनुसार)' : '⚙️ System Auto Sync'}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {language === 'hi' ? 'सूर्योदय/सूर्यास्त व फोन सेटिंग अनुसार' : 'Follows OS sunrise/sunset schedule'}
              </div>
            </div>
          </button>
        </div>

        {/* Agricultural Low-Light Value Banner */}
        <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/40 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{language === 'hi' ? '🔋 फोन बैटरी की 35% तक बचत' : '🔋 Up to 35% OLED Battery Savings'}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{language === 'hi' ? '👀 रात में बिना चकाचौंध के साफ विजन' : '👀 Zero Glare on Midnight Tube-wells'}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{language === 'hi' ? '🔍 रोग के धब्बों की तीव्र पहचान' : '🔍 High-Contrast Foliar Lesion Clarity'}</span>
          </div>
        </div>
      </div>

      {/* Language Preference Card */}
      <div className="bg-white dark:bg-[#161c14] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6 space-y-4 transition-colors">
        <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-700 dark:text-emerald-400" />
          <span>{language === 'hi' ? 'भाषा का चयन (Preferred Language)' : 'Select Application Language'}</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Choose your native tongue for AI agronomist voice synthesis and advisory summaries.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as any);
                addToast('Language Changed', `Switched interface to ${lang.nativeName} (${lang.name})`, 'info');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                language === lang.code
                  ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 ring-2 ring-emerald-600/20 shadow-xs'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-50/50 dark:bg-[#1a2218]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xl">{lang.flag}</span>
                {language === lang.code && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div className="text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">{lang.nativeName}</div>
              <div className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">{lang.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#161c14] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6 sm:p-8 space-y-6 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base flex items-center gap-2">
            <User className="w-5 h-5 text-green-700 dark:text-emerald-400" />
            <span>{language === 'hi' ? 'कृषक और खेत की जानकारी' : 'Farmer & Land Ownership Details'}</span>
          </h3>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Kisan ID: KB-98402
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Full Name (किसान का पूरा नाम)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-50 dark:bg-[#1f281d] border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Mobile Number (मोबाइल नंबर)</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-stone-50 dark:bg-[#1f281d] border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">State (राज्य - All India)</label>
            <select
              value={state}
              onChange={(e) => {
                const newState = e.target.value;
                setState(newState);
                const dists = getDistrictsForState(newState);
                if (dists.length > 0) setDistrict(dists[0]);
              }}
              className="w-full bg-stone-50 dark:bg-[#1f281d] border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <optgroup label="🇮🇳 States (28)">
                {INDIAN_STATES_AND_DISTRICTS.filter((s) => s.type === 'state').map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.state} ({s.hindiName})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏛️ Union Territories (8)">
                {INDIAN_STATES_AND_DISTRICTS.filter((s) => s.type === 'ut').map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.state} ({s.hindiName})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">District / City (जिला / शहर)</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-stone-50 dark:bg-[#1f281d] border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              {getDistrictsForState(state).map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
              {!getDistrictsForState(state).includes(district) && district && (
                <option value={district}>{district}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Village (गांव)</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full bg-stone-50 dark:bg-[#1f281d] border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Total Farm Size (कुल रकबा एकड़)</label>
            <input
              type="number"
              step="0.1"
              value={farmSizeAcres}
              onChange={(e) => setFarmSizeAcres(parseFloat(e.target.value) || 1)}
              className="w-full bg-stone-50 dark:bg-[#1f281d] border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Primary Soil Type</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full bg-stone-50 dark:bg-[#1f281d] border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="Medium Black Cotton">Medium Black Cotton (काली मिट्टी)</option>
              <option value="Alluvial Loam">Alluvial Loam (दोमट मिट्टी)</option>
              <option value="Sandy Loam">Sandy Loam (बलुई दोमट)</option>
              <option value="Red Soil">Red Soil (लाल मिट्टी)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Primary Cash Crop</label>
            <input
              type="text"
              value={mainCrop}
              onChange={(e) => setMainCrop(e.target.value)}
              className="w-full bg-stone-50 dark:bg-[#1f281d] border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'hi' ? 'विवरण सुरक्षित करें' : 'Save Farm Profile'}</span>
          </button>
        </div>
      </form>

      {/* Notifications & Alert Toggles */}
      <div className="bg-white dark:bg-[#161c14] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6 space-y-4 transition-colors">
        <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base flex items-center gap-2">
          <Bell className="w-5 h-5 text-green-700 dark:text-emerald-400" />
          <span>Automated Advisory & Notification Channels</span>
        </h3>

        <div className="space-y-3">
          {[
            {
              title: 'SMS Voice Broadcasts & Weather Warnings',
              desc: 'Receive urgent frost, hailstorm, and pest alerts via Indian Meteorological SMS gateway.',
              checked: smsAlerts,
              toggle: () => setSmsAlerts(!smsAlerts),
            },
            {
              title: 'WhatsApp Farm Advisory & Mandi Rates',
              desc: 'Daily 08:00 AM summary of your primary crop APMC modal rate directly on WhatsApp.',
              checked: whatsappAlerts,
              toggle: () => setWhatsappAlerts(!whatsappAlerts),
            },
            {
              title: 'IoT Sub-Surface Soil Moisture Triggers',
              desc: 'Get notified when soil moisture drops below 40% to initiate solar drip cycles.',
              checked: moistureAlerts,
              toggle: () => setMoistureAlerts(!moistureAlerts),
            },
            {
              title: 'Mandi Price Spike & Cluster Arbitrage Signals',
              desc: 'Alert when a neighbouring APMC mandi pays +₹200/Qtl more than local yard.',
              checked: priceSpikeAlerts,
              toggle: () => setPriceSpikeAlerts(!priceSpikeAlerts),
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={item.toggle}
              className="p-4 bg-stone-50 dark:bg-[#1a2218]/60 rounded-2xl border border-stone-100 dark:border-stone-800/80 flex items-center justify-between cursor-pointer hover:bg-stone-100/70 dark:hover:bg-[#1f2a1c] transition-colors"
            >
              <div className="pr-4">
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">{item.title}</div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{item.desc}</div>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 shrink-0 ${
                  item.checked ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    item.checked ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Mode & Service Worker Cache Engine */}
      <div className="bg-white dark:bg-[#161c14] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6 space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
              <CloudLightning className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                {language === 'hi' ? 'ऑफ़लाइन फील्ड मोड और सर्विस वर्कर कैश' : 'Offline Field Mode & Service Worker'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                PWA Core Assets & Agricultural Intelligence cached for zero-connectivity fields
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                isOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {isOnline ? 'Online (Ready)' : 'Offline Active'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 bg-stone-50 dark:bg-[#1a2218]/60 rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Core Application Shell</div>
            <div className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5">
              {cacheStats.coreAssets || 8} Assets Cached
            </div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> HTML, JS, CSS, Fonts
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 dark:bg-[#1a2218]/60 rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Critical Farm Datasets</div>
            <div className="text-lg font-bold font-mono text-emerald-800 dark:text-emerald-300 mt-0.5">
              {cacheStats.dataEndpoints || 6} Datasets
            </div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Mandi, Disease, Soil, Schemes
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 dark:bg-[#1a2218]/60 rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Engine Version</div>
            <div className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5">
              SW v{cacheStats.version}
            </div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
              {cacheStats.lastSyncTimestamp ? `Synced ${new Date(cacheStats.lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Instant pre-cache'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={async () => {
              setIsSyncingOffline(true);
              await syncOfflineData();
              setIsSyncingOffline(false);
            }}
            disabled={isSyncingOffline}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOffline ? 'animate-spin' : ''}`} />
            <span>{isSyncingOffline ? 'Caching Farm Intelligence...' : 'Sync Offline Farm Pack Now'}</span>
          </button>

          <button
            onClick={() => setIsOfflineModalOpen(true)}
            className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-medium px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <HardDrive className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span>Open Offline Companion Hub</span>
          </button>
        </div>
      </div>

      {/* Algorand Wallet & System Diagnostics */}
      <div className="bg-white dark:bg-[#161c14] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6 space-y-4 transition-colors">
        <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-700 dark:text-emerald-400" />
          <span>Algorand Testnet Wallet & Diagnostics</span>
        </h3>

        <div className="p-4 bg-stone-50 dark:bg-[#1a2218]/60 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-stone-700 dark:text-stone-300">Algorand Testnet Address:</span>
            <span className="font-mono text-emerald-800 dark:text-emerald-400 font-bold">{wallet.address.slice(0, 10)}...{wallet.address.slice(-6)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-stone-700 dark:text-stone-300">Available ALGO Balance:</span>
            <span className="font-mono text-stone-900 dark:text-stone-100 font-bold">{wallet.balanceAlgo.toFixed(2)} ALGO (~₹{(wallet.balanceAlgo * 24.5).toFixed(0)})</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-stone-700 dark:text-stone-300">App Build Version:</span>
            <span className="font-mono text-stone-500 dark:text-stone-400">v2.4.0-SIH-Production</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleClearCache}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 p-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Cache to Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};
