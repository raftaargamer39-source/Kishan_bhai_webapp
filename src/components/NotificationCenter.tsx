import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Sparkles,
  CloudRain,
  Package,
  Tractor,
  DollarSign,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface AppNotification {
  id: string;
  title: string;
  titleHi: string;
  message: string;
  messageHi: string;
  timestamp: string;
  category: 'weather' | 'bulk' | 'bid' | 'machinery' | 'escrow';
  targetView: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Pest & Spray Weather Alert',
    titleHi: 'कीट व छिड़काव मौसम चेतावनी',
    message: 'High humidity (82%) detected in Anandpur. Delay copper spray by 24 hours to prevent runoff.',
    messageHi: 'आनंदपुर में उच्च आर्द्रता (82%)। बारिश से बचाव के लिए कॉपर स्प्रे 24 घंटे टालें।',
    timestamp: '15 mins ago',
    category: 'weather',
    targetView: 'weather',
    read: false,
  },
  {
    id: 'n2',
    title: 'Bulk Discount Tier Unlocked! (24%)',
    titleHi: 'थोक छूट टियर सक्रिय! (24%)',
    message: 'Anandpur Cluster reached 425/500 bags for IFFCO Technical Urea. ₹266.50/bag rate active.',
    messageHi: 'इफको नीम-कोटेड यूरिया के 425/500 बैग पूरे हुए। ₹266.50 प्रति बैग भाव लागू।',
    timestamp: '1 hour ago',
    category: 'bulk',
    targetView: 'bulk-buying',
    read: false,
  },
  {
    id: 'n3',
    title: 'Institutional Buyer Bid on Cotton Lot',
    titleHi: 'कपास लॉट पर खरीदार की बोली प्राप्त',
    message: 'ITC Agri Sourcing offered ₹75.50/kg for Lot #KB-CT-882 (45 Tons Shankar-6).',
    messageHi: 'आईटीसी एग्री सोर्सिंग ने लॉट #KB-CT-882 के लिए ₹75.50/किलो का प्रस्ताव दिया।',
    timestamp: '3 hours ago',
    category: 'bid',
    targetView: 'marketplace',
    read: false,
  },
  {
    id: 'n4',
    title: 'Cluster Escrow Settled on Algorand',
    titleHi: 'अल्गोरैंड पर क्लस्टर एस्क्रो सेटल',
    message: 'Collective harvest settlement verified on Algorand Testnet. Tx: V7XW2...C1EGF.',
    messageHi: 'सामूहिक फसल सेटलमेंट अल्गोरैंड टेस्टनेट पर सत्यापित हुआ।',
    timestamp: '5 hours ago',
    category: 'escrow',
    targetView: 'transactions',
    read: true,
  },
];

export const NotificationCenter: React.FC = () => {
  const { language, setCurrentView } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setCurrentView(notif.targetView);
    setIsOpen(false);
  };

  const getCategoryIcon = (category: AppNotification['category']) => {
    switch (category) {
      case 'weather':
        return <CloudRain className="w-3.5 h-3.5 text-blue-600" />;
      case 'bulk':
        return <Package className="w-3.5 h-3.5 text-emerald-600" />;
      case 'bid':
        return <DollarSign className="w-3.5 h-3.5 text-amber-600" />;
      case 'machinery':
        return <Tractor className="w-3.5 h-3.5 text-indigo-600" />;
      case 'escrow':
        return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 bg-white/70 hover:bg-white border border-stone-200/80 transition-all cursor-pointer shadow-2xs"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-stone-200/90 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-stone-900">
                {language === 'hi' ? 'सूचनाएं एवं अलर्ट' : 'Activity & Agro-Alerts'}
              </span>
              {unreadCount > 0 && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} {language === 'hi' ? 'नई' : 'New'}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                <span>{language === 'hi' ? 'सभी पढ़ें' : 'Mark all read'}</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 px-1">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 my-0.5 ${
                  notif.read ? 'hover:bg-stone-50/80 opacity-80' : 'bg-emerald-50/40 hover:bg-emerald-50/80 font-medium'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-white border border-stone-200/80 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  {getCategoryIcon(notif.category)}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-stone-900 leading-tight">
                      {language === 'hi' ? notif.titleHi : notif.title}
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono shrink-0 ml-2">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {language === 'hi' ? notif.messageHi : notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span className="font-mono">Real-time telemetry</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-700 font-semibold hover:underline cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
