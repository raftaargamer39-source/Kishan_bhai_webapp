import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Package,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
} from 'lucide-react';
import { HarvestPoolLot } from '../../shared/types';

export const HarvestPoolingPage: React.FC = () => {
  const currentUser = useUserStore(state => state.currentUser);
  const { addToast } = useApp();
  const [lots, setLots] = useState<HarvestPoolLot[]>([]);
  const [showAddLotModal, setShowAddLotModal] = useState(false);

  // New lot form state
  const [crop, setCrop] = useState('BT Cotton (Shankar-6)');
  const [quantityKg, setQuantityKg] = useState('18500');
  const [minPrice, setMinPrice] = useState('78');
  const [harvestDate, setHarvestDate] = useState('2026-10-15');
  const [qualityGrade, setQualityGrade] = useState<'Grade A+' | 'Grade A' | 'Standard'>('Grade A+');
  const [notes, setNotes] = useState('Aggregated from 14 smallholder plots with uniform ginning staple length.');

  const fetchLots = () => {
    fetch('/api/marketplace')
      .then((res) => res.json())
      .then((data) => {
        if (data.lots) setLots(data.lots);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/marketplace/create-lot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clusterId: 'cls_anandpur_1',
          clusterName: 'Anandpur Golden Cotton & Wheat Cluster',
          farmerName: currentUser?.fullName || 'Ramesh Patel',
          village: currentUser?.village || 'Anandpur',
          crop,
          quantityKg: parseInt(quantityKg) || 10000,
          expectedHarvestDate: harvestDate,
          minimumTargetPricePerKg: parseFloat(minPrice) || 75,
          qualityGrade,
          notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLots((prev) => [data.lot, ...prev]);
        setShowAddLotModal(false);
        addToast('Harvest Lot Created', `${data.lot.crop} lot published for institutional buyer discovery.`, 'success');
      }
    } catch (e: any) {
      addToast('Error', e.message, 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-amber-800/40 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-amber-400/30">
              SUPPLY AGGREGATION ENGINE
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              Harvest Pooling Lots
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl">
              Eliminate middlemen commission by combining small harvest yields into certified 10–50 ton standardized lots directly for institutional mills and food processors.
            </p>
          </div>

          <button
            onClick={() => setShowAddLotModal(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Pool New Harvest Lot</span>
          </button>
        </div>
      </div>

      {/* Grid of Lots */}
      {lots.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-white/80 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base text-stone-900">No Pooled Harvest Lots Available</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Pool harvest yields from cluster farmers to list standardized bulk lots directly for institutional buyers.
            </p>
          </div>
          <button
            onClick={() => setShowAddLotModal(true)}
            className="bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-5 py-2.5 rounded-2xl shadow transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-[0.99] border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>Pool First Harvest Lot</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lots.map((lot) => (
          <div
            key={lot.id}
            className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {lot.qualityGrade}
                  </span>
                  <span className="text-xs text-stone-500">{lot.village}, Gujarat</span>
                </div>
                <h3 className="font-bold text-lg text-stone-900 mt-1">{lot.crop}</h3>
                <p className="text-xs text-stone-500">{lot.clusterName}</p>
              </div>

              <div className="text-right">
                <span className="text-xl font-bold font-display text-emerald-700 block">
                  {(lot.quantityKg / 1000).toFixed(1)} Tons
                </span>
                <span className="text-xs text-stone-500">
                  Target: <strong>₹{lot.minimumTargetPricePerKg}/Kg</strong>
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200/70 leading-relaxed">
              {lot.notes}
            </p>

            <div className="grid grid-cols-3 gap-2 py-2 border-y border-stone-100 text-center text-xs">
              <div>
                <span className="text-[10px] text-stone-400 block">Harvest Date</span>
                <span className="font-semibold text-stone-800">{lot.expectedHarvestDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Moisture</span>
                <span className="font-semibold text-stone-800">{lot.moisturePercentage || 8.5}%</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Estimated Pool Value</span>
                <span className="font-bold text-emerald-700">₹{(lot.quantityKg * lot.minimumTargetPricePerKg).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-stone-500 pt-1">
              <span>Status: <strong className="text-emerald-700">{lot.status}</strong></span>
              <span className="font-mono text-[11px] text-stone-400">Escrow Ready</span>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Modal */}
      {showAddLotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-bold font-display text-lg text-stone-900">Pool Harvest Lot</h3>
              <button onClick={() => setShowAddLotModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <form onSubmit={handleCreateLot} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Crop & Variety:</label>
                <input
                  type="text"
                  required
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Total Pooled Quantity (Kg):</label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Min Target (₹/Kg):</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Expected Date:</label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Quality Grade:</label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none"
                  >
                    <option value="Grade A+">Grade A+ (Export / Mill Premium)</option>
                    <option value="Grade A">Grade A (Standard Commercial)</option>
                    <option value="Standard">Standard Fair Average Quality (FAQ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Lot Specifications & Notes:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLotModal(false)}
                  className="px-3 py-2 text-stone-500 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Publish Harvest Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
