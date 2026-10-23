import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Sprout,
  LayoutDashboard,
  TrendingUp,
  Scan,
  Users,
  Store,
  Wrench,
  Sparkles,
  Tractor,
  CreditCard,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  ArrowRight,
  Award,
} from 'lucide-react';
import farmerImg from '../assets/images/farmer_champion_portrait_1790247882281.jpg';

interface AppSidebarProps {
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpenOnMobile,
  onCloseMobile,
}) => {
  const { currentView, setCurrentView, language, setIsLogoSplashOpen } = useApp();
  const { currentUser, userRole } = useUserStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isHi = language === 'hi';

  // Primary Navigation Items
  const primaryNavItems = [
    {
      id: 'farmer-dashboard',
      labelEn: 'Overview',
      labelHi: 'डैशबोर्ड (Overview)',
      icon: LayoutDashboard,
    },
    {
      id: 'market-prices',
      labelEn: 'Mandi Radar',
      labelHi: 'मंडी रडार (Rates)',
      icon: TrendingUp,
      badge: 'Live',
    },
    {
      id: 'disease-scanner',
      labelEn: 'Crop Doctor',
      labelHi: 'क्रॉप डॉक्टर (AI Scan)',
      icon: Scan,
    },
    {
      id: 'clusters',
      labelEn: 'Clusters',
      labelHi: 'फार्म क्लस्टर (Groups)',
      icon: Users,
    },
    {
      id: 'marketplace',
      labelEn: 'Marketplace',
      labelHi: 'मार्केटप्लेस (Buy/Sell)',
      icon: Store,
    },
    {
      id: 'buyer-offers',
      labelEn: 'Buyer Offers',
      labelHi: 'खरीदार ऑफ़र (Kisan Rewards)',
      icon: Award,
      badge: 'Rewards',
    },
    {
      id: 'profit-calculator',
      labelEn: 'Tools',
      labelHi: 'कृषि टूल्स (Tools)',
      icon: Wrench,
    },
    {
      id: 'ai-assistant',
      labelEn: 'Kishan AI',
      labelHi: 'किसान AI (Advisor)',
      icon: Sparkles,
      highlight: true,
    },
  ];

  // Secondary Navigation Items (Below Divider)
  const secondaryNavItems = [
    {
      id: 'my-crops',
      labelEn: 'My Farm',
      labelHi: 'मेरा खेत (My Farm)',
      icon: Tractor,
    },
    {
      id: 'transactions',
      labelEn: 'Payments',
      labelHi: 'भुगतान (Payments)',
      icon: CreditCard,
    },
    {
      id: 'talk-to-expert',
      labelEn: 'Support',
      labelHi: 'सहायता (Support)',
      icon: HelpCircle,
    },
    {
      id: 'settings',
      labelEn: 'Settings',
      labelHi: 'सेटिंग्स (Settings)',
      icon: Settings,
    },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between overflow-y-auto scrollbar-none select-none">
      {/* Top Branding Section */}
      <div>
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#087443]/50">
          <div
            onClick={() => {
              setCurrentView('farmer-dashboard');
              setIsLogoSplashOpen(true);
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#20A464] flex items-center justify-center text-white shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform shrink-0">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden transition-all duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-wider text-white uppercase">
                    KISHAN BHAI
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#FFD84D] tracking-wide">
                  Bharat Agri-App
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-[#087443] hover:bg-[#20A464] text-white items-center justify-center transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Drawer Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-[#087443] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section 1 */}
        <div className="px-3 py-4 space-y-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all relative group cursor-pointer ${
                  isActive
                    ? 'bg-[#087443] text-white shadow-xs'
                    : 'text-emerald-100/90 hover:text-white hover:bg-[#087443]/50'
                }`}
                title={item.labelEn}
              >
                {/* Yellow Accent Line for Active Item */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#FFD84D] rounded-r-md"></span>
                )}

                <div
                  className={`w-5 h-5 shrink-0 flex items-center justify-center ${
                    isActive ? 'text-[#FFD84D]' : 'text-emerald-300 group-hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-left truncate">
                    <span className="truncate">{isHi ? item.labelHi : item.labelEn}</span>
                    {item.badge && (
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#FFD84D] text-[#004D36]">
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && (
                      <span className="w-2 h-2 rounded-full bg-[#FFD84D] animate-ping"></span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="px-5 py-2">
          <div className="border-t border-[#087443]/60"></div>
        </div>

        {/* Navigation Section 2 */}
        <div className="px-3 py-2 space-y-1">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all relative group cursor-pointer ${
                  isActive
                    ? 'bg-[#087443] text-white shadow-xs'
                    : 'text-emerald-100/80 hover:text-white hover:bg-[#087443]/50'
                }`}
                title={item.labelEn}
              >
                {/* Yellow Accent Line for Active Item */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#FFD84D] rounded-r-md"></span>
                )}

                <div
                  className={`w-5 h-5 shrink-0 flex items-center justify-center ${
                    isActive ? 'text-[#FFD84D]' : 'text-emerald-300/80 group-hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {!isCollapsed && (
                  <span className="flex-1 text-left truncate">
                    {isHi ? item.labelHi : item.labelEn}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Promotional Card: "Stronger Farmers. Brighter Tomorrow." */}
      {!isCollapsed && (
        <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-[#087443] to-[#003827] border border-emerald-600/40 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FFD84D] animate-pulse"></span>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FFD84D]">
                Mission Bharat
              </span>
            </div>
            <h4 className="text-xs font-bold leading-snug">
              "Stronger Farmers. Brighter Tomorrow."
            </h4>
            <p className="text-[11px] text-emerald-100/90 leading-tight">
              Empowering Indian smallholders with AI intelligence, shared machinery & direct mandi access.
            </p>
            <button
              type="button"
              onClick={() => handleNavClick('ai-assistant')}
              className="mt-1 w-full py-2 px-3 rounded-xl bg-[#20A464] hover:bg-[#1b8c55] text-white font-extrabold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFD84D]" />
              <span>Ask Kisan AI</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Dark-Green Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 bg-[#004D36] border-r border-[#087443]/40 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Slide-Out Drawer Overlay */}
      {isOpenOnMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[#004D36] text-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
