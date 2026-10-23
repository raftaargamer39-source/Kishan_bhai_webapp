import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  AlertTriangle,
  CloudRain,
  TrendingUp,
  Droplets,
  Landmark,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCheck,
} from 'lucide-react';
import { FarmAlertItem } from '../../shared/types';

export const AlertsPage: React.FC = () => {
  const { alerts, markAlertAsRead, markAllAlertsAsRead, language, setCurrentView } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'WEATHER', 'PEST', 'MARKET', 'IRRIGATION', 'GOVERNMENT'];

  const filteredAlerts = alerts.filter((alert) => {
    if (selectedCategory === 'All') return true;
    return alert.category === selectedCategory;
  });

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'WEATHER':
        return <CloudRain className="w-5 h-5 text-blue-600" />;
      case 'PEST':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'MARKET':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'IRRIGATION':
        return <Droplets className="w-5 h-5 text-cyan-600" />;
      case 'GOVERNMENT':
        return <Landmark className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-stone-600" />;
    }
  };

  const handleActionClick = (actionUrl?: string) => {
    if (!actionUrl) return;
    if (actionUrl.includes('irrigation')) setCurrentView('smart-irrigation');
    else if (actionUrl.includes('disease') || actionUrl.includes('pest')) setCurrentView('disease-scanner');
    else if (actionUrl.includes('market') || actionUrl.includes('mandi')) setCurrentView('market-prices');
    else if (actionUrl.includes('schemes') || actionUrl.includes('pm-kisan')) setCurrentView('government-schemes');
    else if (actionUrl.includes('crops')) setCurrentView('my-crops');
    else setCurrentView('dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3B11] to-green-700 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>{language === 'hi' ? 'खेत अलर्ट व आपातकालीन सूचनाएं' : 'Field Advisory & Real-time Warning Feed'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {language === 'hi' ? 'चेतावनी व अलर्ट' : 'Farm Alerts & Weather Warnings'}
          </h1>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
            {language === 'hi'
              ? 'ग्राम-स्तर मौसम पूर्वानुमान, कीट प्रकोप चेतावनी, मंडी भाव उछाल और जल तालिका अलर्ट।'
              : 'Hyper-local weather warnings, village pest outbreaks, APMC price triggers, and irrigation reminders.'}
          </p>
        </div>

        <button
          onClick={markAllAlertsAsRead}
          className="flex items-center justify-center gap-2 bg-emerald-950/60 hover:bg-emerald-950/90 text-emerald-200 border border-emerald-500/30 px-5 py-3 rounded-2xl transition-all cursor-pointer text-xs font-bold shrink-0"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-green-700 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl border transition-all p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                alert.isRead ? 'border-stone-200 opacity-80' : 'border-emerald-500/40 ring-1 ring-emerald-500/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-100'
                      : alert.severity === 'WARNING'
                      ? 'bg-amber-100'
                      : 'bg-emerald-100'
                  }`}
                >
                  {getAlertIcon(alert.category)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : alert.severity === 'WARNING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs font-bold text-stone-500 font-mono">{alert.timestamp}</span>
                    {!alert.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-stone-900">{alert.title}</h3>
                  <p className="text-xs text-stone-600 max-w-3xl leading-relaxed">{alert.description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {alert.actionUrl && (
                  <button
                    onClick={() => {
                      markAlertAsRead(alert.id);
                      handleActionClick(alert.actionUrl);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <span>{alert.actionLabel || 'Take Action'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {!alert.isRead && (
                  <button
                    onClick={() => markAlertAsRead(alert.id)}
                    className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
            <Bell className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-xs">No active alerts in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
