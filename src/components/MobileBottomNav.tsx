import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import { 
  Home, 
  Scan, 
  Sprout, 
  TrendingUp, 
  Grid,
  Sparkles,
  X,
  Droplets,
  CloudSun,
  Award,
  BookOpen,
  Calculator,
  ShoppingBag,
  Users,
  Settings,
  Globe,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';

export const MobileBottomNav: React.FC = () => {
  const { userRole, setUserRole } = useUserStore();
  const { 
    currentView, 
    setCurrentView, 
    language, 
    setLanguage, 
    isDarkMode, 
    toggleDarkMode,
    t 
  } = useApp();

  const [isHubOpen, setIsHubOpen] = useState(false);

  const getDashboardId = () => {
    switch (userRole) {
      case 'CHAMPION': return 'champion-dashboard';
      case 'BUYER': return 'buyer-dashboard';
      case 'ADMIN': return 'admin-dashboard';
      default: return 'farmer-dashboard';
    }
  };

  const dashboardId = getDashboardId();

  const navItems = [
    {
      id: dashboardId,
      label: language === 'hi' ? 'होम' : 'Home',
      icon: Home,
      isActive: currentView === dashboardId || currentView === 'landing',
    },
    {
      id: 'my-crops',
      label: language === 'hi' ? 'फसलें' : 'Crops',
      icon: Sprout,
      isActive: currentView === 'my-crops' || currentView === 'soil-health' || currentView === 'crop-recommendation',
    },
    // Center Primary Action (Scan Crop)
    {
      id: 'disease-scanner',
      label: language === 'hi' ? 'रोग जांच' : 'Scan AI',
      icon: Scan,
      isPrimaryAction: true,
      isActive: currentView === 'disease-scanner',
    },
    {
      id: 'market-prices',
      label: language === 'hi' ? 'मंडी भाव' : 'Mandi',
      icon: TrendingUp,
      isActive: currentView === 'market-prices' || currentView === 'harvest' || currentView === 'marketplace',
    },
    {
      id: 'hub-drawer',
      label: language === 'hi' ? 'हब मेनू' : 'Hub',
      icon: Grid,
      isDrawerTrigger: true,
      isActive: isHubOpen || currentView === 'settings' || currentView === 'farm-diary',
    },
  ];

  const quickTools = [
    { id: 'smart-irrigation', label: language === 'hi' ? 'स्मार्ट सिंचाई' : 'Smart Irrigation', icon: Droplets, color: 'text-sky-600 bg-sky-50' },
    { id: 'weather', label: language === 'hi' ? 'मौसम राडार' : 'Weather Doppler', icon: CloudSun, color: 'text-blue-600 bg-blue-50' },
    { id: 'group-buying', label: language === 'hi' ? 'सामूहिक खरीद (35% छूट)' : 'Group Buying (35% Off)', icon: ShoppingBag, color: 'text-emerald-700 bg-emerald-50' },
    { id: 'government-schemes', label: language === 'hi' ? 'सरकारी योजनाएं' : 'Govt Schemes', icon: Award, color: 'text-amber-700 bg-amber-50' },
    { id: 'community', label: language === 'hi' ? 'किसान चौपाल' : 'Kisan Chaupal', icon: Users, color: 'text-emerald-800 bg-emerald-100/60' },
    { id: 'profit-calculator', label: language === 'hi' ? 'मुनाफ़ा कैलकुलेटर' : 'Yield Calculator', icon: Calculator, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'farm-diary', label: language === 'hi' ? 'कृषि डायरी' : 'Farm Journal', icon: BookOpen, color: 'text-stone-700 bg-stone-100' },
    { id: 'settings', label: language === 'hi' ? 'सेटिंग्स व प्रोफाइल' : 'Settings & Profile', icon: Settings, color: 'text-stone-700 bg-stone-100' },
  ];

  return (
    <>
      {/* Quick Hub Bottom Drawer Modal */}
      {isHubOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="absolute inset-0"
            onClick={() => setIsHubOpen(false)}
          />
          <div className="relative bg-[#FAF8F5] dark:bg-[#141C18] border-t border-emerald-900/10 dark:border-stone-800 rounded-t-3xl p-5 shadow-2xl max-h-[80vh] overflow-y-auto">
            {/* Drawer handle */}
            <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-800 text-white rounded-xl">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {language === 'hi' ? 'कृषि हब व त्वरित टूल्स' : 'Kishan Agri Hub & Tools'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {language === 'hi' ? 'सभी 14 आधुनिक कृषि सुविधाएं' : 'All farm operating modules'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHubOpen(false)}
                className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Language & Theme Controls */}
            <div className="flex items-center justify-between my-3 p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {language === 'hi' ? 'भाषा (Language)' : 'Language'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      language === l.code
                        ? 'bg-emerald-800 text-white shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    {l.nativeName}
                  </button>
                ))}
              </div>
            </div>

            {/* 8-Grid of Agritech Tools */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {quickTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setCurrentView(tool.id);
                      setIsHubOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 hover:border-emerald-700/40 text-left transition-all active:scale-98 cursor-pointer shadow-2xs group"
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${tool.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-emerald-800">
                        {tool.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom AI Trigger */}
            <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => {
                  setCurrentView('ai-assistant');
                  setIsHubOpen(false);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-700 text-white font-bold text-xs rounded-2xl flex items-center justify-between shadow-md active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{language === 'hi' ? 'किसान AI वॉइस असिस्टेंट से पूछें' : 'Ask 24/7 Kisan AI Voice Expert'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-200" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Dock Bar */}
      <nav
        id="mobile-bottom-nav"
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#111714]/95 backdrop-blur-lg border-t border-emerald-900/10 dark:border-stone-800/80 px-2 sm:px-4 py-1 pb-safe flex items-center justify-around shadow-[0_-8px_24px_rgba(20,70,51,0.06)]"
      >
        <div className="max-w-lg mx-auto w-full flex items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon;

            // Distinctive Floating Center Primary Action: Scan Disease
            if (item.isPrimaryAction) {
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setCurrentView(item.id)}
                  aria-label={item.label}
                  className="relative -top-4 flex flex-col items-center justify-center cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 group-active:scale-95 group-hover:shadow-emerald-900/50 transition-all border-2 border-white dark:border-stone-900">
                    <Scan className="w-6 h-6 text-amber-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-900 dark:text-emerald-300 tracking-tight mt-0.5">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => {
                  if (item.isDrawerTrigger) {
                    setIsHubOpen(true);
                  } else {
                    setCurrentView(item.id);
                  }
                }}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
                  item.isActive
                    ? 'text-emerald-800 dark:text-emerald-400 font-bold'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 font-medium'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    item.isActive 
                      ? 'bg-emerald-800/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 scale-105' 
                      : 'hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] leading-tight mt-0.5 ${item.isActive ? 'font-bold text-emerald-900 dark:text-emerald-300' : 'text-stone-500 dark:text-stone-400'}`}>
                  {item.label}
                </span>
                {item.isActive && (
                  <span className="w-1 h-1 rounded-full bg-amber-600 dark:bg-amber-400 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
