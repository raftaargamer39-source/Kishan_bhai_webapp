import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  User,
  Sprout,
  MapPin,
  ShieldCheck,
  Save,
  Radio,
  Coins,
  Globe,
  CheckCircle2,
  Phone,
  Layers,
  Sparkles,
  FileText,
} from 'lucide-react';
import { INDIAN_STATES_AND_DISTRICTS } from '../data/indianStatesAndDistricts';

export const FarmProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser } = useUserStore();
  const { addToast, setIsNfcModalOpen, setIsWalletModalOpen, wallet, language, setLanguage } = useApp();

  const [fullName, setFullName] = useState(currentUser?.fullName || 'Ramesh Patel');
  const [village, setVillage] = useState(currentUser?.village || 'Anandpur');
  const [state, setState] = useState(currentUser?.state || 'Gujarat');
  const [farmSize, setFarmSize] = useState(currentUser?.farmSizeAcres?.toString() || '4.5');
  const [crops, setCrops] = useState(currentUser?.crops?.join(', ') || 'Cotton, Groundnut, Wheat');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);
    const updated = {
      ...currentUser,
      fullName,
      village,
      state,
      farmSizeAcres: parseFloat(farmSize) || 0,
      crops: crops.split(',').map((c) => c.trim()).filter(Boolean),
      phone,
    };

    setCurrentUser(updated);

    try {
      // Sync with backend API
      await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updated.id,
          fullName: updated.fullName,
          village: updated.village,
          state: updated.state,
          farmSizeAcres: updated.farmSizeAcres,
          crops: updated.crops,
          phone: updated.phone,
          preferredLanguage: language,
        }),
      });
      addToast('Profile Saved', 'Farm details updated successfully across Virtual Clusters.', 'success');
    } catch {
      addToast('Profile Updated Locally', 'Changes saved to your device session.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 to-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-emerald-800/40 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-emerald-400/30">
            SMALLHOLDER DIGITAL IDENTITY
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'hi' ? 'सत्यापित किसान' : 'Verified Farmer'}</span>
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
          {language === 'hi' ? 'किसान प्रोफाइल व खेत रिकॉर्ड' : 'Farm Profile & Land Records'}
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm">
          {language === 'hi'
            ? 'अपनी ज़मीन, फसल विवरण, संपर्क जानकारी और वेब3 वॉलेट प्रबंधित करें।'
            : 'Maintain land holding records, active crops, contact details, and connected Web3 wallet.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: ID Preview, Connected Wallet, and Badges */}
        <div className="space-y-6">
          {/* Kishan Bhai Smart ID Card */}
          <div className="bg-gradient-to-br from-emerald-800 to-stone-900 text-white p-6 rounded-2xl shadow-md border border-emerald-700/50 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold block">
                  Kishan Bhai Smart ID
                </span>
                <h3 className="text-lg font-bold font-display mt-0.5">{fullName}</h3>
                <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-300" />
                  <span>{village}, {state}</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-bold text-sm text-emerald-300">
                <Sprout className="w-5 h-5 text-emerald-300" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10">
              <div>
                <span className="text-stone-400 text-[10px] block">Role</span>
                <span className="font-semibold text-emerald-200">{currentUser?.role || 'FARMER'}</span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] block">Farm Holding</span>
                <span className="font-semibold">{farmSize} Acres</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] font-mono">
              <span className="text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Verified Agricultural ID</span>
              </span>
              <button
                type="button"
                onClick={() => setIsNfcModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Radio className="w-3 h-3 text-emerald-300" />
                <span>NFC Card</span>
              </button>
            </div>
          </div>

          {/* Connected Wallet Box */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-700" />
                <span>Algorand Testnet Wallet</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsWalletModalOpen(true)}
                className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
              >
                Switch
              </button>
            </div>
            <p className="font-mono text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200 break-all">
              {wallet.address}
            </p>
            <div className="flex justify-between text-xs font-semibold pt-1 border-t border-stone-100">
              <span className="text-stone-600">Balance:</span>
              <span className="text-emerald-700 font-mono font-bold">{wallet.usdcBalance.toFixed(2)} USDC</span>
            </div>
          </div>

          {/* Verification & Cooperative Hub Info */}
          <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/80 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Cooperative Mesh Status</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Your farm profile is active in the verified regional cluster network with pooled grain bargaining power and direct APMC buyer access.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-[11px]">
              <span className="text-stone-600">Cluster Standing:</span>
              <span className="font-semibold text-emerald-800">Tier 1 Gold Partner</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Personal Details Form & Farm Land Summary */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal & Farm Specifics Form */}
          <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-6 border border-stone-200 shadow-xs space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold font-display text-base text-stone-900 flex items-center gap-2">
                <User className="w-4 h-4 text-green-700" />
                <span>Personal & Farm Specifics</span>
              </h3>
              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Live Synchronized</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Full Legal Name:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Contact Phone:</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">State (राज्य - All India):</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                >
                  <optgroup label="States (28)">
                    {INDIAN_STATES_AND_DISTRICTS.filter((s) => s.type === 'state').map((s) => (
                      <option key={s.state} value={s.state}>
                        {s.state} ({s.hindiName})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Union Territories (8)">
                    {INDIAN_STATES_AND_DISTRICTS.filter((s) => s.type === 'ut').map((s) => (
                      <option key={s.state} value={s.state}>
                        {s.state} ({s.hindiName})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Village / District / Town:</label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Farm Land Holding (Acres):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Active Crops (comma separated):</label>
              <input
                type="text"
                required
                value={crops}
                onChange={(e) => setCrops(e.target.value)}
                placeholder="Cotton, Wheat, Groundnut"
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Preferred Interface Language:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                  <input
                    type="radio"
                    name="lang"
                    checked={language === 'en'}
                    onChange={() => setLanguage('en')}
                  />
                  <span>English</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                  <input
                    type="radio"
                    name="lang"
                    checked={language === 'hi'}
                    onChange={() => setLanguage('hi')}
                  />
                  <span>हिंदी (Hindi)</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>

          {/* Farm Records & Operational Overview */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4 text-xs">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-700" />
              <span>Registered Land & Crop Records Summary</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 text-[11px] block">Total Cultivable Area</span>
                <p className="font-bold text-stone-900 text-base">{farmSize} Acres</p>
                <span className="text-[10px] text-emerald-700 font-medium">100% Khata Verified</span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 text-[11px] block">Monitored Crops</span>
                <p className="font-bold text-stone-900 text-base">
                  {crops.split(',').filter((c) => c.trim()).length} Varietals
                </p>
                <span className="text-[10px] text-emerald-700 font-medium">Real-time Mandi linked</span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 text-[11px] block">Location Region</span>
                <p className="font-bold text-stone-900 text-base truncate">{state}</p>
                <span className="text-[10px] text-emerald-700 font-medium">{village} Circle</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
