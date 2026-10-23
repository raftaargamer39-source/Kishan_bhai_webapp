import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Sprout,
  LayoutDashboard,
  TrendingUp,
  Scan,
  Users,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Globe,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  CloudSun,
  Droplets,
  Award,
  BookOpen,
  Calculator,
  Radio,
  Check,
  ShoppingBag,
  Clock,
  Database,
} from 'lucide-react';
import { UserRole } from '../../shared/types';
import { NotificationCenter } from './NotificationCenter';
import { AnimatedKishanLogo } from './AnimatedKishanLogo';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { signOutFirebaseUser } from '../services/firebaseAuthService';
import { motion, AnimatePresence } from 'motion/react';
import {
  getUserLogins,
  subscribeToUserLogins,
  UserLoginRow,
  SUPABASE_PROJECT_ID,
} from '../services/supabaseClient';

export const Navbar: React.FC = () => {
  const { currentUser, setCurrentUser, userRole, setUserRole } = useUserStore();
  const {
    language,
    setLanguage,
    t,
    currentView,
    setCurrentView,
    setIsNfcModalOpen,
    setIsLogoSplashOpen,
    addToast,
    isDarkMode,
    toggleDarkMode,
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginsMenuOpen, setIsLoginsMenuOpen] = useState(false);
  const [isMobileLoginsOpen, setIsMobileLoginsOpen] = useState(false);
  const [recentLogins, setRecentLogins] = useState<UserLoginRow[]>([]);

  useEffect(() => {
    getUserLogins(8).then(({ logins }) => setRecentLogins(logins));
    const channel = subscribeToUserLogins((newLogin) => {
      setRecentLogins((prev) => [newLogin, ...prev.filter((l) => l.id !== newLogin.id)].slice(0, 8));
    });
    return () => {
      channel?.unsubscribe();
    };
  }, []);

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const roles: { role: UserRole; label: string; desc: string; icon: string }[] = [
    { role: 'FARMER', label: 'Farmer (किसान)', desc: 'Crop health, mandi rates & clusters', icon: '🌾' },
    { role: 'CHAMPION', label: 'Village Champion (प्रधान)', desc: 'Coordinate village clusters & pooling', icon: '⭐' },
    { role: 'BUYER', label: 'Institutional Buyer (क्रेता)', desc: 'Procure bulk cluster harvests', icon: '🏢' },
    { role: 'ADMIN', label: 'Admin Console', desc: 'Platform operations & telemetry', icon: '⚙️' },
  ];

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    setIsRoleMenuOpen(false);
    if (role === 'FARMER') setCurrentView('farmer-dashboard');
    else if (role === 'CHAMPION') setCurrentView('champion-dashboard');
    else if (role === 'BUYER') setCurrentView('buyer-dashboard');
    else if (role === 'ADMIN') setCurrentView('admin-dashboard');
  };

  const handleLogout = async () => {
    try {
      await signOutFirebaseUser();
    } catch {}
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    addToast('Signed Out', 'You have been signed out of your account.', 'info');
    setCurrentView('login');
  };

  // Primary App Dock items
  const primaryDock = [
    {
      id: 'farmer-dashboard',
      label: language === 'hi' ? 'डैशबोर्ड' : 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'market-prices',
      label: language === 'hi' ? 'मंडी भाव' : 'Mandi Radar',
      icon: TrendingUp,
      livePulse: true,
    },
    {
      id: 'disease-scanner',
      label: language === 'hi' ? 'फसल जांच' : 'Crop Doctor',
      icon: Scan,
    },
    {
      id: 'clusters',
      label: language === 'hi' ? 'फार्म क्लस्टर' : 'Clusters',
      icon: Users,
    },
  ];

  // Secondary Tools App Drawer items
  const secondaryTools = [
    { id: 'group-buying', label: language === 'hi' ? 'सामूहिक खरीद' : 'Group Buying', icon: ShoppingBag, desc: 'Connect in groups & buy anything at 35% discount' },
    { id: 'smart-irrigation', label: language === 'hi' ? 'स्मार्ट सिंचाई' : 'Smart Irrigation', icon: Droplets, desc: 'Evapotranspiration pump controls' },
    { id: 'weather', label: language === 'hi' ? 'मौसम पूर्वानुमान' : 'Weather Radar', icon: CloudSun, desc: 'Hyperlocal Doppler alerts' },
    { id: 'government-schemes', label: language === 'hi' ? 'सरकारी योजनाएं' : 'Govt Schemes', icon: Award, desc: 'PM-Kisan, PMFBY subsidies' },
    { id: 'farm-diary', label: language === 'hi' ? 'कृषि डायरी' : 'Farm Journal', icon: BookOpen, desc: 'Daily expense & yield logbook' },
    { id: 'profit-calculator', label: language === 'hi' ? 'मुनाफ़ा कैलकुलेटर' : 'Yield Calculator', icon: Calculator, desc: 'Cost vs MSP return estimates' },
    { id: 'community', label: language === 'hi' ? 'किसान चौपाल' : 'Kisan Chaupal', icon: Users, desc: 'Village farmer Q&A community' },
  ];

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 py-2.5 bg-gradient-to-b from-[#FAF8F5]/95 via-[#FAF8F5]/85 to-transparent dark:from-[#0B100C]/95 dark:via-[#0B100C]/85 dark:to-transparent backdrop-blur-md transition-all">
      {/* Targeted Element: Redesigned as Modern Floating App Navigation Dock */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-5 py-2 rounded-2xl bg-white/95 dark:bg-stone-900/95 border border-stone-200/90 dark:border-stone-800 shadow-sm shadow-stone-200/40 dark:shadow-none flex items-center justify-between gap-2 sm:gap-4 transition-all">
        
        {/* LEFT ZONE: Brand & Workspace Launcher */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => setCurrentView('landing')}
            className="flex items-center cursor-pointer select-none group"
            title="Kishan Bhai Home"
          >
            <AnimatedKishanLogo
              size="sm"
              showText={true}
              interactive={true}
              withSound={false}
              subtitle={language === 'hi' ? 'स्मार्ट कृषि ऐप' : 'Bharat Agri-App'}
            />
          </div>
        </div>

        {/* CENTER ZONE: Rearranged Segmented App Dock */}
        <nav className="hidden lg:flex items-center p-1 bg-stone-100/90 dark:bg-stone-800/70 rounded-xl border border-stone-200/70 dark:border-stone-700/60 shadow-2xs">
          {primaryDock.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-700/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500'}`} />
                <span>{item.label}</span>
                {item.livePulse && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}

          {/* Secondary "More Tools" Dock Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isToolsMenuOpen
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
              <span>{language === 'hi' ? 'अन्य टूल्स' : 'Tools'}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {isToolsMenuOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 dark:border-stone-800">
                  {language === 'hi' ? 'कृषि सुविधाएं' : 'Agritech Modules'}
                </div>
                <div className="grid grid-cols-1 gap-1 pt-1">
                  {secondaryTools.map((tool) => {
                    const ToolIcon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setCurrentView(tool.id);
                          setIsToolsMenuOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-colors cursor-pointer ${
                          currentView === tool.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300'
                            : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <ToolIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold">{tool.label}</div>
                          <div className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">{tool.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* RIGHT ZONE: Rearranged Quick Actions, Persona & User Profile */}
        <div className="hidden md:flex items-center gap-2">
          {/* Direct AI Assistant Trigger */}
          <button
            onClick={() => setCurrentView('ai-assistant')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
            title="Open Kishan Bhai AI Voice & Crop Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'hi' ? 'पूछें AI' : 'Kishan AI'}</span>
          </button>

          {/* Supabase Live Logins Tracker */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLoginsMenuOpen(!isLoginsMenuOpen);
                setIsLangMenuOpen(false);
                setIsRoleMenuOpen(false);
                setIsUserMenuOpen(false);
                setIsToolsMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
              title="Recent Active Sign-Ins (Supabase)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden lg:inline">{language === 'hi' ? 'लॉगिन' : 'Logins'}</span>
              {recentLogins.length > 0 && (
                <span className="text-[10px] font-bold bg-emerald-700 text-white px-1.5 py-0.2 rounded-full">
                  {recentLogins.length}
                </span>
              )}
            </button>

            {isLoginsMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'hi' ? 'हालिया लॉगिन (Supabase)' : 'Recent Logins (Supabase Live)'}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    {SUPABASE_PROJECT_ID}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {recentLogins.length > 0 ? (
                    recentLogins.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold flex items-center justify-center text-[10px]">
                            {item.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 dark:text-stone-100 text-[11px] flex items-center gap-1">
                              <span>{item.user_name}</span>
                              <span className="text-[9px] bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 px-1 rounded">
                                {item.role}
                              </span>
                            </div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400">
                              {item.phone ? `${item.phone.slice(0, 6)}***` : item.email || ''}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                            {item.login_method}
                          </span>
                          <div className="text-[9px] text-stone-400 mt-0.5">
                            {new Date(item.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-stone-400">
                      {language === 'hi' ? 'कोई हालिया लॉगिन नहीं' : 'No recent login records yet'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <NotificationCenter />

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 w-8 h-8 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLangMenuOpen(!isLangMenuOpen);
                setIsRoleMenuOpen(false);
                setIsUserMenuOpen(false);
                setIsToolsMenuOpen(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200 transition-colors cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{currentLangObj.flag}</span>
              <span className="text-[11px] uppercase font-mono">{currentLangObj.code}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 dark:border-stone-800">
                  Select Language (भाषा)
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangMenuOpen(false);
                      addToast('Language Changed', `Switched to ${lang.nativeName}`, 'info');
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      language === lang.code
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </span>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Persona Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setIsRoleMenuOpen(!isRoleMenuOpen);
                setIsLangMenuOpen(false);
                setIsUserMenuOpen(false);
                setIsToolsMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>{roles.find((r) => r.role === userRole)?.icon || '🌾'}</span>
              <span>
                {userRole === 'FARMER' && 'Farmer'}
                {userRole === 'CHAMPION' && 'Champion'}
                {userRole === 'BUYER' && 'Buyer'}
                {userRole === 'ADMIN' && 'Admin'}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 dark:border-stone-800">
                  Switch App View
                </div>
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => handleRoleSelect(r.role)}
                    className={`w-full text-left px-2.5 py-2 text-xs rounded-xl flex items-start gap-2 transition-colors cursor-pointer ${
                      userRole === r.role
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span className="text-sm mt-0.5">{r.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{r.label}</div>
                      <div className="text-[10px] text-stone-500 font-normal leading-tight">{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Account / Profile */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsLangMenuOpen(false);
                  setIsRoleMenuOpen(false);
                  setIsToolsMenuOpen(false);
                }}
                className="flex items-center gap-1.5 p-1 pr-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-[10px]">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[80px] truncate">{currentUser.fullName}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800">
                    <div className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">{currentUser.fullName}</div>
                    <div className="text-[11px] text-stone-500 truncate">{currentUser.email || currentUser.phone}</div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                      {currentUser.village} • {currentUser.role}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentView('profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl flex items-center gap-2 transition-colors cursor-pointer mt-1"
                  >
                    <User className="w-3.5 h-3.5 text-stone-500" />
                    <span>Farm Profile & ID</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('login');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-stone-500" />
                    <span>Switch Account</span>
                  </button>

                  <div className="border-t border-stone-100 dark:border-stone-800 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setCurrentView('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex lg:hidden items-center gap-1.5">
          <button
            onClick={() => setCurrentView('ai-assistant')}
            className="p-1.5 rounded-xl bg-emerald-800 text-white text-xs font-medium flex items-center gap-1"
            title="Kishan AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-xl"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-xl"
            aria-label="Open mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
          {/* User Status Bar */}
          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">{currentUser.fullName}</div>
                  <div className="text-[10px] text-stone-500">{currentUser.role}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-stone-600 dark:text-stone-400 font-medium">Guest Farmer</div>
            )}

            {currentUser ? (
              <button onClick={handleLogout} className="text-[11px] text-rose-700 font-semibold hover:underline">
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  setCurrentView('login');
                  setIsMobileMenuOpen(false);
                }}
                className="text-xs bg-emerald-800 text-white font-semibold px-3 py-1.5 rounded-xl"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Supabase Live Logins Mobile Widget */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/70 dark:border-emerald-800/50 p-2.5">
            <button
              onClick={() => setIsMobileLoginsOpen(!isMobileLoginsOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{language === 'hi' ? 'हालिया लॉगिन (Supabase)' : 'Recent Live Logins'}</span>
                {recentLogins.length > 0 && (
                  <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.2 rounded-full font-bold">
                    {recentLogins.length}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-emerald-700 transition-transform ${isMobileLoginsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isMobileLoginsOpen && (
              <div className="mt-2.5 space-y-1.5 max-h-48 overflow-y-auto pt-2 border-t border-emerald-200/50 dark:border-emerald-800/40">
                {recentLogins.length > 0 ? (
                  recentLogins.map((item) => (
                    <div
                      key={item.id}
                      className="p-1.5 bg-white dark:bg-stone-800 rounded-lg border border-stone-100 dark:border-stone-700 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold flex items-center justify-center text-[9px] shrink-0">
                          {item.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-stone-900 dark:text-stone-100">{item.user_name}</span>
                          <span className="ml-1 text-[9px] bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-1 rounded">
                            {item.role}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] text-stone-400 shrink-0 ml-1">
                        {new Date(item.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-[11px] text-stone-400">
                    {language === 'hi' ? 'कोई हालिया लॉगिन नहीं' : 'No recent login records yet'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Primary Navigation */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block px-1">
              Main Modules
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {primaryDock.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl text-left flex items-center gap-2 text-xs font-semibold transition-all ${
                      currentView === item.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold'
                        : 'bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-600" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Tools */}
          <div className="space-y-1 pt-2 border-t border-stone-100 dark:border-stone-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block px-1">
              Agritech Tools
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {secondaryTools.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setCurrentView(tool.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-left text-xs text-stone-700 dark:text-stone-300 flex items-center gap-2"
                  >
                    <ToolIcon className="w-3.5 h-3.5 text-stone-500" />
                    <span className="truncate">{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selector */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block px-1 mb-1.5">
              भाषा / Language
            </span>
            <div className="grid grid-cols-4 gap-1">
              {SUPPORTED_LANGUAGES.slice(0, 8).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    addToast('Language Changed', `Switched to ${lang.nativeName}`, 'info');
                  }}
                  className={`py-1 rounded-lg text-center text-xs ${
                    language === lang.code
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <span className="block text-sm">{lang.flag}</span>
                  <span className="text-[10px] truncate block">{lang.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Role Selector */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block px-1 mb-1.5">
              Persona / Role
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    handleRoleSelect(r.role);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-1.5 ${
                    userRole === r.role
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <span>{r.icon}</span>
                  <span>{r.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
