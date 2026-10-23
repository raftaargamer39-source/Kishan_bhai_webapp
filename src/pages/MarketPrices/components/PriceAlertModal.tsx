import React from 'react';
import { Bell, Plus, Trash2, X } from 'lucide-react';
import { usePriceAlertStore } from '../../../store/priceAlertStore';
import { useApp } from '../../../context/AppContext';

interface PriceAlertModalProps {
  currentLocationInfo: { state: string; district: string };
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({ currentLocationInfo }) => {
  const { language, addToast } = useApp();
  
  const isAlertModalOpen = usePriceAlertStore((state) => state.isAlertModalOpen);
  const setAlertModalOpen = usePriceAlertStore((state) => state.setAlertModalOpen);
  const priceAlerts = usePriceAlertStore((state) => state.priceAlerts);
  const newCrop = usePriceAlertStore((state) => state.newCrop);
  const setNewCrop = usePriceAlertStore((state) => state.setNewCrop);
  const newCondition = usePriceAlertStore((state) => state.newCondition);
  const setNewCondition = usePriceAlertStore((state) => state.setNewCondition);
  const newTargetPrice = usePriceAlertStore((state) => state.newTargetPrice);
  const setNewTargetPrice = usePriceAlertStore((state) => state.setNewTargetPrice);
  const addAlert = usePriceAlertStore((state) => state.addAlert);
  const toggleAlert = usePriceAlertStore((state) => state.toggleAlert);
  const deleteAlert = usePriceAlertStore((state) => state.deleteAlert);

  if (!isAlertModalOpen) return null;

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newTargetPrice);
    if (!priceNum || isNaN(priceNum)) {
      addToast('Invalid Price', 'Please enter a valid numeric target price.', 'error');
      return;
    }

    addAlert({
      crop: newCrop,
      targetPrice: priceNum,
      condition: newCondition,
      state: currentLocationInfo.state,
      district: currentLocationInfo.district,
    });

    setAlertModalOpen(false);
    addToast(
      language === 'hi' ? 'मूल्य अलर्ट सेट किया गया' : 'Price Alert Created',
      `Alert set for ${newCrop} when ${newCondition.toLowerCase()} ₹${priceNum}`,
      'success'
    );
  };

  const handleDeleteAlert = (id: string) => {
    deleteAlert(id);
    addToast('Alert Removed', 'Price threshold alert has been deleted.', 'success');
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                {language === 'hi' ? 'मूल्य सीमा अलर्ट प्रबंधक' : 'Mandi Price Threshold Alerts'}
              </h3>
              <p className="text-xs text-stone-500">
                {language === 'hi' ? 'AsyncStorage द्वारा संरक्षित' : 'Persisted via Zustand & AsyncStorage'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAlertModalOpen(false)}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create Alert Form */}
        <form onSubmit={handleCreateAlert} className="space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            {language === 'hi' ? 'नया मूल्य अलर्ट जोड़ें' : 'Set New Price Threshold Alert'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">Select Crop</label>
              <select
                value={newCrop}
                onChange={(e) => setNewCrop(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-hidden"
              >
                {['Cotton (Kapas)', 'Groundnut (Mungfali)', 'Wheat (Gehun)', 'Mustard (Sarson)', 'Soybean', 'Tomato', 'Onion (Pyaz)', 'Cumin (Jeera)'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">Condition</label>
              <select
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value as 'ABOVE' | 'BELOW')}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-hidden"
              >
                <option value="ABOVE">Price Goes Above (≥)</option>
                <option value="BELOW">Price Drops Below (≤)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">Target Price (₹ per Quintal)</label>
            <input
              type="number"
              value={newTargetPrice}
              onChange={(e) => setNewTargetPrice(e.target.value)}
              placeholder="e.g. 7500"
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? 'अलर्ट सहेजें' : 'Save Price Alert'}</span>
          </button>
        </form>

        {/* Existing Alerts List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center justify-between">
            <span>{language === 'hi' ? 'सक्रिय अलर्ट' : 'Your Active Price Alerts'}</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono">
              {priceAlerts.length} total
            </span>
          </h4>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {priceAlerts.length > 0 ? (
              priceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    alert.isActive ? 'bg-white border-stone-200 shadow-2xs' : 'bg-stone-100 border-stone-200 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900">{alert.crop}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        alert.condition === 'ABOVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {alert.condition} ₹{alert.targetPrice}
                      </span>
                      {alert.isTriggered && (
                        <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full animate-pulse">
                          TRIGGERED
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Mandi: {alert.district}, {alert.state} • {new Date(alert.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                        alert.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {alert.isActive ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="w-7 h-7 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-stone-400 text-xs">
                No price alerts set yet. Add one above!
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setAlertModalOpen(false)}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Close Manager
          </button>
        </div>
      </div>
    </div>
  );
};
