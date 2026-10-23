import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wifi,
  WifiOff,
  CloudLightning,
  RefreshCw,
  Trash2,
  CheckCircle2,
  HardDrive,
  Database,
  Layers,
  Sprout,
  ShieldCheck,
  HelpCircle,
  X,
  Smartphone,
  BookOpen,
} from 'lucide-react';

export const OfflineManagerModal: React.FC = () => {
  const {
    isOnline,
    isOfflineModalOpen,
    setIsOfflineModalOpen,
    cacheStats,
    syncOfflineData,
    clearCacheAndReset,
    offlineQueue,
    language,
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  if (!isOfflineModalOpen) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    await syncOfflineData();
    setIsSyncing(false);
  };

  const handleClear = async () => {
    if (window.confirm(language === 'hi' ? 'क्या आप सभी ऑफ़लाइन कैश रीसेट करना चाहते हैं?' : 'Reset and clear all offline farm caches?')) {
      setIsClearing(true);
      await clearCacheAndReset();
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1B3B1B] text-white p-6 relative">
          <button
            onClick={() => setIsOfflineModalOpen(false)}
            className="absolute top-4 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6 text-amber-300" />}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-white/15 text-emerald-200 mb-1">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
                <span>{isOnline ? 'Network Connected' : 'Offline Field Mode'}</span>
              </div>
              <h3 className="text-xl font-bold font-serif-display">
                {language === 'hi' ? 'ऑफ़लाइन फील्ड साथी एवं कैश हब' : 'Offline Field Companion'}
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status Explanation */}
          <div className={`p-4 rounded-2xl border ${isOnline ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-amber-50/90 border-amber-200 text-amber-950'}`}>
            <div className="flex items-start gap-3">
              <CloudLightning className={`w-5 h-5 mt-0.5 shrink-0 ${isOnline ? 'text-emerald-700' : 'text-amber-700'}`} />
              <div className="text-xs space-y-1 leading-relaxed">
                <p className="font-semibold text-sm">
                  {isOnline
                    ? (language === 'hi' ? 'सेवा कार्यकर्ता सक्रिय — डेटा ऑफ़लाइन के लिए तैयार है' : 'Service Worker Active — Core Assets Cached')
                    : (language === 'hi' ? 'आप ऑफ़लाइन हैं — स्थानीय कैश से काम कर रहे हैं' : 'Offline Mode Active — Running on Service Worker')}
                </p>
                <p className="text-stone-700">
                  {language === 'hi'
                    ? 'खेत में इंटरनेट न होने पर भी मंडी भाव, मिट्टी की जांच गाइड, फसल रोग लक्षण और आपकी डायरी सुरक्षित रूप से उपलब्ध हैं।'
                    : 'Even in remote farm areas with zero cellular reception, your core dashboard, APMC rates, crop disease guide, and soil intelligence remain available.'}
                </p>
              </div>
            </div>
          </div>

          {/* Cached Features Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500">
              {language === 'hi' ? 'ऑफ़लाइन उपलब्ध कृषि सुविधाएं' : 'Available Offline Without Internet'}
            </h4>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-stone-900 block">APMC Mandi Rates</span>
                  <span className="text-stone-700 text-[11px]">Cached price benchmarks</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-stone-900 block">Disease Knowledge</span>
                  <span className="text-stone-700 text-[11px]">15+ crop illness guides</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-stone-900 block">Soil Health Guide</span>
                  <span className="text-stone-700 text-[11px]">NPK & organic remedies</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-stone-900 block">Farm Diary Notes</span>
                  <span className="text-stone-700 text-[11px]">Local queue + auto-sync</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cache Statistics & Metrics */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono text-stone-600 pb-2 border-b border-stone-200">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-stone-700" />
                <span>Service Worker Engine</span>
              </span>
              <span className="font-bold text-stone-900">v{cacheStats.version}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <div className="text-lg font-bold font-mono text-stone-900">{cacheStats.coreAssets || 8}</div>
                <div className="text-[10px] text-stone-700 font-medium">Core Shell Assets</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <div className="text-lg font-bold font-mono text-[#2D5A27]">{cacheStats.dataEndpoints || 6}</div>
                <div className="text-[10px] text-stone-700 font-medium">Farm Datasets</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <div className="text-lg font-bold font-mono text-purple-700">{offlineQueue.length}</div>
                <div className="text-[10px] text-stone-700 font-medium">Pending Syncs</div>
              </div>
            </div>

            {cacheStats.lastSyncTimestamp && (
              <p className="text-[11px] text-stone-700 text-center">
                Last synchronized:{' '}
                <span className="font-mono text-stone-900">
                  {new Date(cacheStats.lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full bg-[#2D5A27] hover:bg-[#1B3B1B] text-white font-semibold py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Caching Farm Intelligence...' : 'Sync / Update Offline Farm Pack'}</span>
            </button>

            <button
              onClick={handleClear}
              disabled={isClearing}
              className="w-full bg-white hover:bg-stone-100 text-stone-700 hover:text-stone-900 border border-stone-300 font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-stone-700" />
              <span>Reset Local Cache & Storage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
