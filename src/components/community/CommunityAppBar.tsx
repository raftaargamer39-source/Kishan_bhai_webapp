import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  ArrowLeft,
  Search,
  Plus,
  Mic,
  Radio,
  Share2,
  Sparkles,
} from 'lucide-react';

interface CommunityAppBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onOpenCreateModal: (mode?: 'text' | 'voice' | 'photo') => void;
  totalPostsCount: number;
}

export const CommunityAppBar: React.FC<CommunityAppBarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  totalPostsCount,
}) => {
  const { language, setCurrentView, addToast } = useApp();
  const isHi = language === 'hi';
  const isGu = language === 'gu';

  const handleShareApp = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Kisan Chaupal - Farmer Community Network',
          text: 'Join 14,000+ progressive farmers, ask agri questions, and share crop solutions on Kisan Chaupal!',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      addToast(
        isHi ? 'चौपाल लिंक कॉपी हुआ' : 'Chaupal App Link Copied',
        isHi ? 'व्हाट्सएप पर साथी किसानों के साथ शेयर करें।' : 'Share with fellow farmers on WhatsApp.',
        'success'
      );
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#14300e] via-[#1d4315] to-[#122e0d] text-white rounded-3xl p-4 sm:p-6 shadow-xl border border-emerald-500/30 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top App Switcher Bar */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-emerald-700/40">
        {/* Back to Kisan Bhai Main Hub button */}
        <button
          onClick={() => setCurrentView('farmer-dashboard')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white border border-white/15 text-xs font-bold transition-all backdrop-blur-md cursor-pointer group"
          title="Return to Kisan Bhai Farm Management Hub"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{isHi ? '← मुख्य किसान भाई हब' : '← Back to Farm Hub'}</span>
        </button>

        {/* Live Active Presence & Share App */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 rounded-full text-[11px] font-mono font-medium text-emerald-300 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isHi
                ? '14,850+ किसान ऑनलाइन'
                : isGu
                ? '૧૪,૮૫૦+ ખેડૂત ઓનલાઇન'
                : '14,850+ Farmers Online'}
            </span>
          </div>

          <button
            onClick={handleShareApp}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Share Chaupal App"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isHi ? 'शेयर करें' : 'Share App'}</span>
          </button>
        </div>
      </div>

      {/* Main App Hero Details & Action Buttons */}
      <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-2 rounded-2xl bg-amber-400 text-stone-950 font-black shadow-md flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{isHi ? 'किसान चौपाल' : 'Kisan Chaupal'}</span>
                </h1>
                <span className="bg-amber-400 text-stone-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                  Community App
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
                {isHi
                  ? 'भारत का सबसे बड़ा किसान ज्ञान, समाधान व अनुभव मंच'
                  : isGu
                  ? 'ભારતનું સૌથી મોટું ખેડૂત જ્ઞાન અને અનુભવ મંચ'
                  : 'India’s Dedicated Peer Agronomy & Farmer Social Network'}
              </p>
            </div>
          </div>

          <p className="text-xs text-emerald-100/75 leading-relaxed pt-1">
            {isHi
              ? 'फसल की समस्याएं पूछें, जैविक देसी नुस्खे जानें और पड़ोसी किसानों व केवीके वैज्ञानिकों से सीधे सलाह लें।'
              : 'Ask field questions, share organic recipes, listen to voice updates, and consult KVK scientists.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => onOpenCreateModal('voice')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-lg transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>{isHi ? 'बोलकर पूछें 🎙️' : 'Voice Note 🎙️'}</span>
          </button>

          <button
            onClick={() => onOpenCreateModal('text')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isHi ? 'नई पोस्ट लिखें ✍️' : 'New Post ✍️'}</span>
          </button>
        </div>
      </div>

      {/* Internal In-App Search Bar */}
      <div className="mt-5 pt-3 border-t border-emerald-700/30">
        <div className="relative w-full max-w-xl">
          <Search className="w-4 h-4 text-emerald-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isHi
                ? 'चौपाल में खोजें: रोग, समाधान, खाद, किसान या गांव... (कुल ' + totalPostsCount + ' चर्चाएं)'
                : 'Search discussions, problems, organic recipes, farmers, or villages (' + totalPostsCount + ' posts)...'
            }
            className="w-full bg-emerald-950/60 border border-emerald-600/50 focus:border-amber-400 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-emerald-300/60 focus:outline-hidden transition-all shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};
