import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  Plus,
  Calendar,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Droplets,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  Bell,
} from 'lucide-react';
import { CropLifecycleItem } from '../../shared/types';
import { HarvestReminderModal } from '../components/HarvestReminderModal';

export const MyCropsPage: React.FC = () => {
  const { crops, addCrop, updateCrop, removeCrop, language, setCurrentView } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropLifecycleItem | null>(null);
  const [reminderCrop, setReminderCrop] = useState<CropLifecycleItem | null>(null);

  const handleSaveReminder = (cropId: string, reminderConfig: NonNullable<CropLifecycleItem['harvestReminder']>) => {
    updateCrop(cropId, { harvestReminder: reminderConfig });
  };

  // New Crop Form state
  const [newCropName, setNewCropName] = useState('Wheat');
  const [newVariety, setNewVariety] = useState('HD-3226 High Yield');
  const [newArea, setNewArea] = useState<number>(2.0);
  const [newSowingDate, setNewSowingDate] = useState('2026-11-01');
  const [newExpectedYield, setNewExpectedYield] = useState<number>(35);

  const handleCreateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    const item: CropLifecycleItem = {
      id: `crop_${Date.now()}`,
      cropName: newCropName,
      hindiName: newCropName,
      variety: newVariety,
      sowingDate: newSowingDate,
      areaAcres: Number(newArea),
      stage: 'Sowing / Seedling',
      stageProgressPct: 10,
      healthScore: 96,
      expectedHarvestDate: '2027-03-15',
      expectedYieldQuintals: Number(newExpectedYield),
      soilMoistureStatus: 'OPTIMAL',
      pestVulnerability: 'LOW',
      pestWatchlist: ['Aphids', 'Rust'],
      recentAction: 'Land preparation and bio-fertilizer treatment',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    };
    addCrop(item);
    setIsAddModalOpen(false);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Sowing / Seedling':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Vegetative':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Flowering & Pod Initiation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Grain Filling / Boll Dev':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Maturity & Harvesting':
        return 'bg-amber-200 text-amber-900 border-amber-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1B3B11] to-green-700 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Sprout className="w-4 h-4" />
            <span>{language === 'hi' ? 'फसल प्रबंधन' : 'Crop Lifecycle Management'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {language === 'hi' ? 'मेरी फसलें और निगरानी' : 'My Crops & Field Monitoring'}
          </h1>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
            {language === 'hi'
              ? 'प्रत्येक फसल के विकास चरण, स्वास्थ्य स्कोर, सिंचाई आवश्यकता और कीट संवेदनशीलता की वास्तविक स्थिति।'
              : 'Track active crop stages, vegetative progress, health scores, and agronomical advisory.'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold px-5 py-3 rounded-2xl shadow-lg transition-all cursor-pointer text-sm shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>{language === 'hi' ? 'नई फसल जोड़ें' : 'Register New Crop'}</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-xs font-semibold text-stone-500 mb-1">{language === 'hi' ? 'कुल फसली रकबा' : 'Total Crop Area'}</div>
          <div className="text-2xl font-bold text-stone-900 font-display">
            {crops.reduce((acc, c) => acc + c.areaAcres, 0).toFixed(1)} <span className="text-sm font-normal text-stone-500">Acres</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">100% precision mapped</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-xs font-semibold text-stone-500 mb-1">{language === 'hi' ? 'सक्रिय फसलें' : 'Active Crops'}</div>
          <div className="text-2xl font-bold text-stone-900 font-display">{crops.length}</div>
          <div className="text-[11px] text-stone-500 font-medium mt-1">Kharif & Rabi Season</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-xs font-semibold text-stone-500 mb-1">{language === 'hi' ? 'औसत स्वास्थ्य' : 'Avg Crop Health'}</div>
          <div className="text-2xl font-bold text-emerald-700 font-display">
            {Math.round(crops.reduce((acc, c) => acc + c.healthScore, 0) / (crops.length || 1))}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Optimal vigor index</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-xs font-semibold text-stone-500 mb-1">{language === 'hi' ? 'अनुमानित कुल पैदावार' : 'Est. Total Yield'}</div>
          <div className="text-2xl font-bold text-stone-900 font-display">
            {crops.reduce((acc, c) => acc + c.expectedYieldQuintals, 0)} <span className="text-sm font-normal text-stone-500">Quintals</span>
          </div>
          <div className="text-[11px] text-stone-500 font-medium mt-1">Target seasonal output</div>
        </div>
      </div>

      {/* Crops List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {crops.map((crop) => (
          <div
            key={crop.id}
            className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
          >
            {/* Image Header */}
            <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
              <img
                src={crop.imageUrl}
                alt={crop.cropName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute top-3 right-3">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-xs ${getStageColor(crop.stage)}`}>
                  {crop.stage}
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h3 className="text-lg font-bold">{crop.cropName}</h3>
                <p className="text-xs text-emerald-200">{crop.variety} • {crop.areaAcres} Acres</p>
              </div>
            </div>

            {/* Body Info */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              {/* Progress */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-stone-600">{language === 'hi' ? 'विकास प्रगति' : 'Growth Progress'}</span>
                  <span className="text-green-700 font-bold">{crop.stageProgressPct}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200/60">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${crop.stageProgressPct}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="text-stone-500 text-[10px] uppercase font-bold">{language === 'hi' ? 'बुवाई तिथि' : 'Sown Date'}</div>
                  <div className="font-semibold text-stone-800 mt-0.5">{crop.sowingDate}</div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="text-stone-500 text-[10px] uppercase font-bold">{language === 'hi' ? 'स्वास्थ्य स्कोर' : 'Health Score'}</div>
                  <div className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{crop.healthScore}/100</span>
                  </div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="text-stone-500 text-[10px] uppercase font-bold">{language === 'hi' ? 'अनुमानित पैदावार' : 'Target Yield'}</div>
                  <div className="font-semibold text-stone-800 mt-0.5">{crop.expectedYieldQuintals} Quintals</div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="text-stone-500 text-[10px] uppercase font-bold">{language === 'hi' ? 'कीट जोखिम' : 'Pest Risk'}</div>
                  <div className={`font-semibold mt-0.5 ${crop.pestVulnerability === 'HIGH' ? 'text-rose-600' : crop.pestVulnerability === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {crop.pestVulnerability}
                  </div>
                </div>
              </div>

              {/* Recent Advisory */}
              <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 text-xs">
                <div className="text-emerald-900 font-bold flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{language === 'hi' ? 'हालिया कृषि कार्य' : 'Recent Agronomic Action'}</span>
                </div>
                <p className="text-emerald-800/90 line-clamp-2">{crop.recentAction}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                {crop.harvestReminder?.enabled && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] font-bold border border-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <span>Harvest Reminder Active ({crop.harvestReminder.reminderDaysBefore.join(', ')}d prior)</span>
                    </div>
                    <button
                      onClick={() => setReminderCrop(crop)}
                      className="text-emerald-700 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentView('disease-scanner')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-stone-100 hover:bg-emerald-100 text-stone-800 hover:text-emerald-900 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>{language === 'hi' ? 'रोग जांच' : 'Scan'}</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('smart-irrigation')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <Droplets className="w-4 h-4 text-emerald-200" />
                    <span>{language === 'hi' ? 'सिंचाई' : 'Water'}</span>
                  </button>

                  <button
                    onClick={() => setReminderCrop(crop)}
                    className="flex items-center justify-center px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition-all cursor-pointer border border-amber-200 shadow-2xs"
                    title="Schedule Harvest Reminder"
                  >
                    <Bell className="w-4 h-4 text-amber-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Crop Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
                <Sprout className="w-5 h-5" />
                <span>{language === 'hi' ? 'नई फसल पंजीकृत करें' : 'Register New Crop'}</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCrop} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{language === 'hi' ? 'फसल का नाम' : 'Crop Name'}</label>
                <select
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="BT Cotton">BT Cotton (कपास)</option>
                  <option value="Groundnut">Groundnut (मूंगफली)</option>
                  <option value="Sharbati Wheat">Wheat (गेहूँ)</option>
                  <option value="Yellow Mustard">Mustard (सरसों)</option>
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                  <option value="Chickpea (Chana)">Chickpea (चना)</option>
                  <option value="Tomato">Tomato (टमाटर)</option>
                  <option value="Cumin (Jeera)">Cumin (जीरा)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{language === 'hi' ? 'किस्म / वैरायटी' : 'Variety / Hybrid'}</label>
                <input
                  type="text"
                  value={newVariety}
                  onChange={(e) => setNewVariety(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  placeholder="e.g. Shankar-6 Hybrid / GW-496"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{language === 'hi' ? 'रकबा (एकड़)' : 'Area (Acres)'}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={newArea}
                    onChange={(e) => setNewArea(parseFloat(e.target.value) || 1)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{language === 'hi' ? 'बुवाई तिथि' : 'Sowing Date'}</label>
                  <input
                    type="date"
                    value={newSowingDate}
                    onChange={(e) => setNewSowingDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{language === 'hi' ? 'अनुमानित पैदावार (क्विंटल)' : 'Expected Total Yield (Quintals)'}</label>
                <input
                  type="number"
                  min="1"
                  value={newExpectedYield}
                  onChange={(e) => setNewExpectedYield(parseInt(e.target.value) || 10)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  required
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
                >
                  {language === 'hi' ? 'फसल जोड़ें' : 'Add Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Harvest Reminder Scheduler Modal */}
      {reminderCrop && (
        <HarvestReminderModal
          crop={reminderCrop}
          isOpen={!!reminderCrop}
          onClose={() => setReminderCrop(null)}
          onSave={handleSaveReminder}
          language={language}
        />
      )}
    </div>
  );
};
