import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Store,
  Package,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { HarvestPoolLot } from '../../shared/types';

export const BuyerMarketplacePage: React.FC = () => {
  const currentUser = useUserStore(state => state.currentUser);
  const { addToast } = useApp();
  const [lots, setLots] = useState<HarvestPoolLot[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('ALL');

  useEffect(() => {
    fetch('/api/marketplace')
      .then((res) => res.json())
      .then((data) => {
        if (data.lots) setLots(data.lots);
      })
      .catch(() => {});
  }, []);

  const filteredLots = lots.filter((lot) => {
    const matchSearch =
      lot.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.clusterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.village.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCrop = selectedCrop === 'ALL' || lot.crop.toLowerCase().includes(selectedCrop.toLowerCase());
    return matchSearch && matchCrop;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-stone-800 space-y-3">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-amber-400/30">
            DIGITAL MANDI CATALOG
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
          Cluster Harvest Marketplace
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm max-w-2xl">
          Direct institutional procurement from certified smallholder clusters across Gujarat and Western India.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by crop, cluster name, or village..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-600 shadow-xs"
          />
        </div>

        <div className="flex gap-2">
          {['ALL', 'Cotton', 'Wheat', 'Mustard', 'Soybean'].map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                selectedCrop === crop
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Marketplace Grid */}
      {filteredLots.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-white/80 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base text-stone-900">No Harvest Lots Listed</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              There are currently no active pooled harvest lots matching your criteria. Pooled lots from Virtual Farm Clusters will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLots.map((lot) => (
          <div
            key={lot.id}
            className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  {lot.qualityGrade}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {lot.village}, Gujarat
                </span>
              </div>

              <div>
                <h3 className="font-bold text-lg text-stone-900">{lot.crop}</h3>
                <p className="text-xs text-stone-500">{lot.clusterName}</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Available Volume:</span>
                  <span className="font-bold text-stone-900">{(lot.quantityKg / 1000).toFixed(1)} Metric Tons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Target Base Price:</span>
                  <span className="font-bold text-emerald-700">₹{lot.minimumTargetPricePerKg} / Kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Harvest Date:</span>
                  <span className="font-semibold text-stone-800">{lot.expectedHarvestDate}</span>
                </div>
              </div>

              <p className="text-xs text-stone-600 line-clamp-2">{lot.notes}</p>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
              <span className="text-[11px] text-stone-400 font-mono">Lot #{lot.id.slice(-4)}</span>
              <button
                onClick={() => addToast('Proposal Feature', 'Please switch to Institutional Buyer role to submit binding purchase bids.', 'info')}
                className="bg-stone-900 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Inquire Lot
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
