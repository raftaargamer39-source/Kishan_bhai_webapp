import React from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  LayoutDashboard,
  Sprout,
  Scan,
  Droplets,
  Layers,
  TrendingUp,
  Calculator,
  Sparkles,
  Landmark,
  BookOpen,
  Users,
  UserCheck,
  Bell,
  Settings,
  ShoppingBag,
  Package,
  Store,
  Tractor,
  CloudSun,
  Receipt,
  User,
  ShieldAlert,
  LogIn,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { userRole, currentUser } = useUserStore();
  const { currentView, setCurrentView, language, alerts } = useApp();

  const unreadAlertCount = alerts.filter((a) => !a.isRead).length;

  const farmerGroups = [
    {
      title: language === 'hi' ? 'एआई व फसल निगरानी' : 'Intelligence & Farm Advisory',
      items: [
        { id: 'farmer-dashboard', labelEn: 'Dashboard Overview', labelHi: 'डैशबोर्ड व मुख्य पृष्ठ', icon: LayoutDashboard },
        { id: 'ai-assistant', labelEn: 'Kisan AI Advisor', labelHi: 'किसान AI सलाहकार', icon: Sparkles },
        { id: 'crop-recommendation', labelEn: '🌱 What Should I Grow?', labelHi: '🌱 क्या उगाएं? (फसल सिफारिश)', icon: Sprout },
        { id: 'soil-health', labelEn: '🧪 Soil Health Intelligence', labelHi: '🧪 मृदा स्वास्थ्य कार्ड (SHC)', icon: Layers },
        { id: 'weather', labelEn: '🌦 Weather Intelligence', labelHi: '🌦 मौसम पूर्वानुमान व सलाह', icon: CloudSun },
        { id: 'smart-irrigation', labelEn: '💧 Smart Irrigation', labelHi: '💧 स्मार्ट सिंचाई सलाहकार', icon: Droplets },
        { id: 'disease-scanner', labelEn: '🔍 AI Disease Scanner', labelHi: '🔍 रोग व कीट स्कैनर', icon: Scan },
        { id: 'my-crops', labelEn: '🌾 My Crops & Fields', labelHi: '🌾 मेरी फसलें व खेत', icon: Sprout },
      ],
    },
    {
      title: language === 'hi' ? 'मंडी, लाभ व योजनाएं' : 'Market & Economics',
      items: [
        { id: 'market-prices', labelEn: 'Live Mandi Rates', labelHi: 'दैनिक मंडी भाव', icon: TrendingUp },
        { id: 'profit-calculator', labelEn: 'Profit & ROI Engine', labelHi: 'फसल लाभ कैलकुलेटर', icon: Calculator },
        { id: 'government-schemes', labelEn: 'Government Schemes', labelHi: 'सरकारी योजनाएं', icon: Landmark },
        { id: 'farm-diary', labelEn: 'Farm Diary & Khata', labelHi: 'खेत डायरी (खाता)', icon: BookOpen },
      ],
    },
    {
      title: language === 'hi' ? 'क्लस्टर व नेटवर्क' : 'Clusters & Network',
      items: [
        { id: 'clusters', labelEn: 'Virtual Farm Clusters', labelHi: 'वर्चुअल फार्म क्लस्टर', icon: Users },
        { id: 'bulk-buying', labelEn: 'Bulk Input Demands', labelHi: 'थोक खाद-बीज खरीद', icon: ShoppingBag },
        { id: 'harvest', labelEn: 'Harvest Pooling Lots', labelHi: 'फसल पूल लॉट', icon: Package },
        { id: 'machinery', labelEn: 'Machinery Booking', labelHi: 'कृषि यंत्र बुकिंग', icon: Tractor },
        { id: 'community', labelEn: 'Kisan Chaupal App', labelHi: 'किसान चौपाल (ऐप)', icon: Users, badge: 'APP' },
        { id: 'talk-to-expert', labelEn: 'Talk to Expert', labelHi: 'विशेषज्ञ परामर्श', icon: UserCheck },
        { id: 'alerts', labelEn: 'Field Alerts', labelHi: 'खेत चेतावनी व अलर्ट', icon: Bell, badge: unreadAlertCount },
        { id: 'settings', labelEn: 'Profile & Settings', labelHi: 'सेटिंग्स व प्रोफ़ाइल', icon: Settings },
      ],
    },
  ];

  const getOtherRoleItems = () => {
    switch (userRole) {
      case 'CHAMPION':
        return [
          { id: 'champion-dashboard', labelEn: 'Champion Command Hub', labelHi: 'ग्राम प्रधान डैशबोर्ड', icon: LayoutDashboard },
          { id: 'clusters', labelEn: 'Manage Village Clusters', labelHi: 'क्लस्टर प्रबंधन', icon: Users },
          { id: 'bulk-buying', labelEn: 'Aggregate Bulk Orders', labelHi: 'थोक मांग एकत्रीकरण', icon: ShoppingBag },
          { id: 'harvest', labelEn: 'Cluster Harvest Lots', labelHi: 'कुल फसल पूल', icon: Package },
          { id: 'machinery', labelEn: 'Village Machinery Roster', labelHi: 'यंत्र उपलब्धता', icon: Tractor },
          { id: 'marketplace', labelEn: 'Buyer Coordination', labelHi: 'क्रेता समन्वय', icon: Store },
          { id: 'transactions', labelEn: 'Settlement Logs', labelHi: 'सेटलमेंट लॉग', icon: Receipt },
        ];
      case 'BUYER':
        return [
          { id: 'buyer-dashboard', labelEn: 'Buyer Procurement Desk', labelHi: 'क्रेता डैशबोर्ड', icon: LayoutDashboard },
          { id: 'marketplace', labelEn: 'Cluster Harvest Catalog', labelHi: 'क्लस्टर फसल सूची', icon: Store },
          { id: 'clusters', labelEn: 'Verified Farm Clusters', labelHi: 'सत्यापित क्लस्टर', icon: Users },
          { id: 'transactions', labelEn: 'Procurement Escrow & Tx', labelHi: 'भुगतान रिकॉर्ड', icon: Receipt },
        ];
      case 'ADMIN':
        return [
          { id: 'admin-dashboard', labelEn: 'System Control Center', labelHi: 'प्रशासक डैशबोर्ड', icon: LayoutDashboard },
          { id: 'clusters', labelEn: 'All Registered Clusters', labelHi: 'सभी क्लस्टर', icon: Users },
          { id: 'transactions', labelEn: 'Algorand Testnet Ledger', labelHi: 'ब्लॉकचेन लेजर', icon: ShieldAlert },
        ];
      default:
        return [];
    }
  };

  return (
    <aside className="w-68 bg-white/75 backdrop-blur-xl border-r border-stone-200/80 hidden lg:flex flex-col shrink-0 min-h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Active Role Indicator */}
      <div className="p-4 border-b border-stone-200/50 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1 px-1">
          {language === 'hi' ? 'सक्रिय खाता' : 'Active Account Profile'}
        </div>
        <div className="flex items-center justify-between bg-emerald-50 text-green-700 px-3 py-2 rounded-2xl text-xs font-bold border border-emerald-200/60">
          <div className="flex items-center gap-2 truncate">
            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></div>
            <span className="truncate">
              {userRole === 'FARMER' && (currentUser?.fullName || 'Ramesh Patel (Farmer)')}
              {userRole === 'CHAMPION' && 'Devraj Bhai (Champion)'}
              {userRole === 'BUYER' && 'ITC Agro Procurement'}
              {userRole === 'ADMIN' && 'Kishan Bhai System Admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-4 px-3 space-y-6">
        {userRole === 'FARMER' ? (
          farmerGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 pb-1">
                {group.title}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-green-700 text-white shadow-xs'
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-300' : 'text-stone-500'}`} />
                      <span className="truncate">{language === 'hi' ? item.labelHi : item.labelEn}</span>
                    </div>

                    {item.badge ? (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          item.badge === 'APP'
                            ? 'bg-amber-400 text-stone-950 font-black'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))
        ) : (
          <div className="space-y-1">
            {getOtherRoleItems().map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-green-700 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-300' : 'text-stone-500'}`} />
                  <span className="truncate">{language === 'hi' ? item.labelHi : item.labelEn}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Switch Account */}
        <div className="pt-2 border-t border-stone-100">
          <button
            onClick={() => setCurrentView('login')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
              currentView === 'login'
                ? 'bg-green-700 text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <LogIn className="w-4 h-4 shrink-0 text-emerald-700" />
            <span className="truncate">{language === 'hi' ? 'खाता बदलें / लॉगिन' : 'Switch Account / Login'}</span>
          </button>
        </div>
      </div>

      {/* Algorand Node status footer */}
      <div className="p-3 border-t border-stone-200/60 bg-stone-50 m-3 rounded-2xl border text-[10px] text-stone-500 font-mono space-y-1">
        <div className="flex items-center justify-between">
          <span>ALGORAND:</span>
          <span className="text-emerald-700 font-bold">TESTNET LIVE</span>
        </div>
        <div className="flex items-center justify-between text-stone-400">
          <span>ESCROW:</span>
          <span className="text-stone-700 font-bold">Smart Contract</span>
        </div>
      </div>
    </aside>
  );
};
