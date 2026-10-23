import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  CloudUpload,
  Database,
  HardDrive,
  ChevronDown,
  X,
  ExternalLink,
  Sprout,
  TrendingUp,
  CloudSun,
  Layers,
  Landmark,
  BookOpen,
} from 'lucide-react';

interface OfflineSyncIndicatorProps {
  isMobile?: boolean;
}

export const OfflineSyncIndicator: React.FC<OfflineSyncIndicatorProps> = ({ isMobile = false }) => {
  const {
    isOnline,
    cacheStats,
    syncOfflineData,
    offlineQueue,
    language,
    setIsOfflineModalOpen,
    addToast,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleManualSync = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isOnline) {
      addToast(
        language === 'hi' ? 'ऑफ़लाइन मोड सक्रिय' : 'Offline Mode Active',
        language === 'hi'
          ? 'नेटवर्क बहाल होने पर डेटा स्वतः सिंक हो जाएगा।'
          : 'Cannot sync while offline. Farm changes are queued and will sync once connected.',
        'info'
      );
      return;
    }

    setIsSyncing(true);
    try {
      const res = await syncOfflineData();
      if (res.success) {
        addToast(
          language === 'hi' ? 'डेटा सिंक सफल' : 'Farm Data Synced',
          language === 'hi'
            ? `${res.count} कृषि डेटासेट स्थानीय कैश में नवीनतम स्थिति में सुरक्षित हैं।`
            : `${res.count} agricultural datasets up-to-date in offline cache.`,
          'success'
        );
      }
    } catch {
      addToast(
        language === 'hi' ? 'सिंक त्रुटि' : 'Sync Failed',
        language === 'hi' ? 'कृपया पुनः प्रयास करें।' : 'Failed to update offline caches.',
        'error'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const isHi = language === 'hi';
  const pendingCount = offlineQueue.length;
  const cachedDatasetsCount = cacheStats.dataEndpoints || 6;
  const lastSyncTimeFormatted = cacheStats.lastSyncTimestamp
    ? new Date(cacheStats.lastSyncTimestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : isHi
    ? 'हाल ही में'
    : 'Recently';

  // Mobile rendering
  if (isMobile) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isHi ? 'ऑफ़लाइन और सिंक स्थिति' : 'Offline & sync status'}
          className={`relative p-2 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
            !isOnline
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-400 dark:border-amber-600'
              : pendingCount > 0
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300'
              : 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800'
          }`}
          title={
            !isOnline
              ? isHi
                ? 'ऑफ़लाइन मोड — स्थानीय कैश सक्रिय'
                : 'Offline Field Mode — Local Cache Active'
              : isSyncing
              ? isHi
                ? 'सिंक हो रहा है...'
                : 'Syncing farm data...'
              : isHi
              ? `डेटा सिंक है (${cachedDatasetsCount} कैश)`
              : `Farm Data Synced (${cachedDatasetsCount} cached)`
          }
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 text-emerald-700 dark:text-emerald-400 animate-spin" />
          ) : !isOnline ? (
            <WifiOff className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          ) : (
            <Wifi className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          )}

          {/* Small status dot indicator */}
          <span
            className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
              !isOnline
                ? 'bg-amber-500 animate-pulse ring-2 ring-white dark:ring-stone-900'
                : pendingCount > 0
                ? 'bg-amber-500 ring-2 ring-white dark:ring-stone-900'
                : 'bg-emerald-500 ring-2 ring-white dark:ring-stone-900'
            }`}
          />

          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] font-bold px-1 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>

        {/* Mobile Dropdown Card */}
        {isOpen && (
          <div className="fixed sm:absolute top-16 right-2 sm:right-0 w-[calc(100vw-1rem)] sm:w-80 bg-white dark:bg-[#151c14] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 py-3 px-4 z-50 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    !isOnline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
                <span className="font-bold text-xs text-stone-900 dark:text-white">
                  {!isOnline
                    ? isHi
                      ? 'ऑफ़लाइन फील्ड मोड'
                      : 'Offline Field Mode'
                    : isHi
                    ? 'ऑनलाइन सिंक स्थिति'
                    : 'Online Farm Sync'}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-2.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                <span>{isHi ? 'कैश किए गए डेटासेट' : 'Cached Datasets'}:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {cachedDatasetsCount} {isHi ? 'प्रकार' : 'modules'}
                </span>
              </div>
              <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                <span>{isHi ? 'लंबित सिंक' : 'Pending Changes'}:</span>
                <span
                  className={`font-mono font-bold ${
                    pendingCount > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-stone-700 dark:text-stone-400'
                  }`}
                >
                  {pendingCount} {isHi ? 'प्रविष्टियां' : 'items'}
                </span>
              </div>
              <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                <span>{isHi ? 'अंतिम सिंक समय' : 'Last Synced'}:</span>
                <span className="font-mono text-stone-700 dark:text-stone-300">
                  {lastSyncTimeFormatted}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex gap-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing || !isOnline}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? (isHi ? 'सिंक जारी...' : 'Syncing...') : (isHi ? 'अभी सिंक करें' : 'Sync Now')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsOfflineModalOpen(true);
                }}
                className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium py-1.5 px-2.5 rounded-xl text-xs flex items-center justify-center transition-colors"
                title={isHi ? 'ऑफ़लाइन हब' : 'Offline Hub'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Header Rendering: Rich, Elegant Pill with Live Status
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isHi ? 'डेटा सिंक स्थिति' : 'Farm data sync status'}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs backdrop-blur-md active:scale-[0.98] ${
          !isOnline
            ? 'bg-amber-100 dark:bg-amber-950/50 hover:bg-amber-200/80 text-amber-900 dark:text-amber-200 border-amber-400 dark:border-amber-700/80 ring-1 ring-amber-400/30'
            : isSyncing
            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border-emerald-400/80 dark:border-emerald-700 animate-pulse'
            : pendingCount > 0
            ? 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
            : 'bg-white/80 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200/90 dark:border-stone-700/80'
        }`}
        title={
          !isOnline
            ? isHi
              ? 'ऑफ़लाइन मोड: स्थानीय कैश से सुरक्षित संचालन'
              : 'Offline Field Mode: Running securely on Service Worker local cache'
            : isSyncing
            ? isHi
              ? 'कृषि डेटाबेस सिंक हो रहा है...'
              : 'Synchronizing agricultural datasets...'
            : isHi
            ? `डेटा सिंक है (${cachedDatasetsCount} डेटासेट कैश)`
            : `Farm Data Synced (${cachedDatasetsCount} datasets cached)`
        }
      >
        {/* Status Indicator Dot with optional pulse */}
        <div className="relative flex items-center justify-center">
          <span
            className={`w-2 h-2 rounded-full ${
              !isOnline
                ? 'bg-amber-500 animate-ping opacity-75'
                : isSyncing
                ? 'bg-emerald-400 animate-ping opacity-75'
                : pendingCount > 0
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />
          <span
            className={`absolute w-2 h-2 rounded-full ${
              !isOnline
                ? 'bg-amber-500'
                : isSyncing
                ? 'bg-emerald-500'
                : pendingCount > 0
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />
        </div>

        {/* State Icon */}
        {isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
        ) : !isOnline ? (
          <WifiOff className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
        ) : pendingCount > 0 ? (
          <CloudUpload className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        )}

        {/* Text Status Label */}
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-semibold text-xs text-stone-900 dark:text-white">
            {!isOnline
              ? isHi
                ? 'ऑफ़लाइन'
                : 'Offline'
              : isSyncing
              ? isHi
                ? 'सिंक जारी...'
                : 'Syncing...'
              : pendingCount > 0
              ? isHi
                ? `${pendingCount} लंबित`
                : `${pendingCount} Pending`
              : isHi
              ? 'डेटा सिंक'
              : 'Synced'}
          </span>

          {/* Cached count badge */}
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
              !isOnline
                ? 'bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200'
                : 'bg-stone-100 dark:bg-stone-700/60 text-stone-600 dark:text-stone-300'
            }`}
          >
            {cachedDatasetsCount} {isHi ? 'डेटा' : 'cached'}
          </span>
        </div>

        <ChevronDown
          className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Desktop Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 bg-white dark:bg-[#141b12] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  !isOnline
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {!isOnline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                  {!isOnline
                    ? isHi
                      ? 'ऑफ़लाइन फील्ड मोड (लोकल कैश)'
                      : 'Offline Field Mode'
                    : isHi
                    ? 'क्लाउड सिंक सक्रिय (ऑनलाइन)'
                    : 'Cloud Synchronized (Online)'}
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {!isOnline
                    ? isHi
                      ? 'इंटरनेट के बिना सुरक्षित रूप से उपलब्ध'
                      : 'Operating with full local storage capability'
                    : isHi
                    ? 'खेत के सभी डेटासेट क्लाउड से जुड़े हैं'
                    : 'All farm datasets updated & cached'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 my-3 text-center">
            <div className="bg-stone-50 dark:bg-stone-900/80 p-2 rounded-xl border border-stone-100 dark:border-stone-800">
              <div className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {cachedDatasetsCount}
              </div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400">
                {isHi ? 'कैश डेटासेट' : 'Datasets'}
              </div>
            </div>

            <div className="bg-stone-50 dark:bg-stone-900/80 p-2 rounded-xl border border-stone-100 dark:border-stone-800">
              <div
                className={`text-sm font-bold font-mono ${
                  pendingCount > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                {pendingCount}
              </div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400">
                {isHi ? 'लंबित कतार' : 'Pending'}
              </div>
            </div>

            <div className="bg-stone-50 dark:bg-stone-900/80 p-2 rounded-xl border border-stone-100 dark:border-stone-800">
              <div className="text-[11px] font-bold font-mono text-stone-700 dark:text-stone-300 truncate">
                {lastSyncTimeFormatted}
              </div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400">
                {isHi ? 'अंतिम सिंक' : 'Last Sync'}
              </div>
            </div>
          </div>

          {/* Cached Agricultural Modules Checklist */}
          <div className="space-y-1.5 mb-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 px-1">
              {isHi ? 'कैश की गई कृषि सेवाएं (ऑफ़लाइन तैयार)' : 'Cached Farm Services (Offline-Ready)'}
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isHi ? 'दैनिक APMC मंडी भाव' : 'APMC Mandi Rates'}</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {isHi ? 'सुरक्षित ✓' : 'Cached ✓'}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isHi ? 'मृदा स्वास्थ्य (SHC) इंटेलिजेंस' : 'Soil Health & SHC Guide'}</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {isHi ? 'सुरक्षित ✓' : 'Cached ✓'}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">
                <span className="flex items-center gap-2">
                  <CloudSun className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isHi ? 'मौसम पूर्वानुमान व कृषि सलाह' : 'Weather & Agro-Radar'}</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {isHi ? 'सुरक्षित ✓' : 'Cached ✓'}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">
                <span className="flex items-center gap-2">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isHi ? 'फसल चक्र व सिफारिश कैटलॉग' : 'Crop Lifecycle & Diseases'}</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {isHi ? 'सुरक्षित ✓' : 'Cached ✓'}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isHi ? 'खेत डायरी (खाता लेजर)' : 'Farm Diary Entries'}</span>
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    pendingCount > 0
                      ? 'text-amber-600 dark:text-amber-400 font-bold'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {pendingCount > 0
                    ? isHi
                      ? `${pendingCount} लंबित सिंक`
                      : `${pendingCount} Pending Sync`
                    : isHi
                    ? 'सिंक है ✓'
                    : 'Synced ✓'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline}
              className="flex-1 bg-green-700 hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? isHi
                    ? 'डेटा सिंक हो रहा है...'
                    : 'Syncing Data...'
                  : !isOnline
                  ? isHi
                    ? 'ऑफ़लाइन (सिंक अनुपलब्ध)'
                    : 'Offline (Cannot sync)'
                  : isHi
                  ? 'अभी तुरंत सिंक करें'
                  : 'Sync Farm Data Now'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsOfflineModalOpen(true);
              }}
              className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium py-2 px-3 rounded-xl transition-colors cursor-pointer"
              title={isHi ? 'विस्तृत ऑफ़लाइन प्रबंधक खोलें' : 'Open Full Offline Manager'}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
