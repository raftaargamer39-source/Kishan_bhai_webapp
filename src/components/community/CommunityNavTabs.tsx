import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Sparkles,
  Mic,
  Sprout,
  Award,
  Bookmark,
  Users2,
  ShoppingBag,
  ShoppingCart,
} from 'lucide-react';

export type CommunityTab = 'cluster-cart' | 'cluster-chat' | 'feed' | 'doctor' | 'voice' | 'clubs' | 'champions' | 'saved';

interface CommunityNavTabsProps {
  activeTab: CommunityTab;
  onTabChange: (tab: CommunityTab) => void;
  voiceCount: number;
  savedCount: number;
}

export const CommunityNavTabs: React.FC<CommunityNavTabsProps> = ({
  activeTab,
  onTabChange,
  voiceCount,
  savedCount,
}) => {
  const { language } = useApp();
  const isHi = language === 'hi';
  const isGu = language === 'gu';

  const tabs: {
    id: CommunityTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }[] = [
    {
      id: 'cluster-cart',
      label: isHi ? 'साझा शॉपिंग कार्ट' : isGu ? 'શેર્ડ શોપિંગ કાર્ટ' : 'Shared Group Cart',
      icon: ShoppingCart,
      badge: isHi ? 'सामूहिक' : 'Group',
    },
    {
      id: 'cluster-chat',
      label: isHi ? 'क्लस्टर खरीद चैट' : isGu ? 'ક્લસ્ટર ખરીદ ચેટ' : 'Cluster Buying Chat',
      icon: Users2,
      badge: 'Live',
    },
    {
      id: 'feed',
      label: isHi ? 'मुख्य चौपाल' : isGu ? 'મુખ્ય ચોપાલ' : 'All Feeds',
      icon: MessageSquare,
    },
    {
      id: 'doctor',
      label: isHi ? 'कृषि समाधान मंच' : isGu ? 'નિષ્ણાત સમાધાન' : 'Doctor Q&A',
      icon: Sparkles,
      badge: isHi ? 'प्रमाणित' : 'Verified',
    },
    {
      id: 'voice',
      label: isHi ? 'ऑडियो चौपाल' : isGu ? 'ઓડિયો ચોપાલ' : 'Voice Chaupal',
      icon: Mic,
      badge: voiceCount > 0 ? voiceCount : undefined,
    },
    {
      id: 'clubs',
      label: isHi ? 'फसल समूह (क्लब)' : isGu ? 'પાક સમૂહ' : 'Crop Clubs',
      icon: Sprout,
    },
    {
      id: 'champions',
      label: isHi ? 'प्रगतिशील किसान' : isGu ? 'પ્રગતિશીલ ખેડૂત' : 'Champions',
      icon: Award,
    },
    {
      id: 'saved',
      label: isHi ? 'मेरी पोस्ट व सेव' : isGu ? 'સેવ કરેલ' : 'Saved & Mine',
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : undefined,
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-1.5 shadow-xs">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : ''}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-amber-400 text-stone-950'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
