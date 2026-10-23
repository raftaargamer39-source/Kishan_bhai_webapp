import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Building,
  Store,
  Package,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Coins,
} from 'lucide-react';
import { HarvestPoolLot, BuyerPurchaseRequest } from '../../shared/types';

export const BuyerDashboard: React.FC = () => {
  const currentUser = useUserStore(state => state.currentUser);
  const { setCurrentView, addToast } = useApp();
  const [lots, setLots] = useState<HarvestPoolLot[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<BuyerPurchaseRequest[]>([]);
  const [selectedLot, setSelectedLot] = useState<HarvestPoolLot | null>(null);
  const [offeredPrice, setOfferedPrice] = useState<string>('');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Ahmedabad Processing Depot');

  useEffect(() => {
    fetch('/api/marketplace')
      .then((res) => res.json())
      .then((data) => {
        if (data.lots) setLots(data.lots);
        if (data.purchaseRequests) setPurchaseRequests(data.purchaseRequests);
      })
      .catch(() => {});
  }, []);

  const handleCreatePurchaseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;

    try {
      const price = parseFloat(offeredPrice) || selectedLot.minimumTargetPricePerKg;
      const res = await fetch('/api/marketplace/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          harvestLotId: selectedLot.id,
          buyerId: currentUser?.id || 'usr_buyer_1',
          buyerName: currentUser?.fullName || 'Vikram Mehta',
          buyerCompany: 'AgroPure Organics & Textiles',
          offeredPricePerKg: price,
          deliveryLocation,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPurchaseRequests((prev) => [data.request, ...prev]);
        setSelectedLot(null);
        setOfferedPrice('');
        addToast('Purchase Request Submitted', `Offered ₹${price}/Kg for ${selectedLot.crop} lot.`, 'success');
      }
    } catch (e: any) {
      addToast('Error', e.message, 'error');
    }
  };

  const totalProcuredTons = purchaseRequests
    .filter((r) => r.status === 'ACCEPTED' || r.status === 'COMPLETED')
    .reduce((acc, r) => acc + r.quantityKg, 0) / 1000;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-amber-800/40 space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-amber-400/30">
              INSTITUTIONAL BUYER PROCUREMENT
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-white mt-1">
              {currentUser?.fullName || 'Institutional Buyer'}
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm">
              Direct-from-cluster procurement with lab quality grading and transparent escrow settlement.
            </p>
          </div>

          <button
            onClick={() => setCurrentView('marketplace')}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>Browse Full Mandi Catalog</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Available Clustered Lots</div>
          <div className="text-3xl font-bold font-display text-stone-900">{lots.length}</div>
          <p className="text-[11px] text-emerald-700 font-medium">Quality Graded & Verified</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Active Purchase Proposals</div>
          <div className="text-3xl font-bold font-display text-amber-700">{purchaseRequests.length}</div>
          <p className="text-[11px] text-stone-500 font-medium">
            {purchaseRequests.filter((p) => p.status === 'PENDING').length} Awaiting Cluster Approval
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Procured Volume</div>
          <div className="text-3xl font-bold font-display text-emerald-700">
            {totalProcuredTons.toFixed(1)} <span className="text-base text-stone-500 font-normal">Tons</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-medium">Direct Mandi Disintermediation</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">Traceability Index</div>
          <div className="text-3xl font-bold font-display text-stone-900">100%</div>
          <p className="text-[11px] text-teal-700 font-medium">Full Cluster Farmer Lineage</p>
        </div>
      </div>

      {/* Available Lots Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-stone-900">Available Pooled Harvest Lots</h3>
                <p className="text-xs text-stone-500">Standardized crop lots aggregated by Virtual Farm Clusters</p>
              </div>
            </div>

            <div className="space-y-4">
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          {lot.qualityGrade}
                        </span>
                        <span className="text-xs font-mono text-stone-500">
                          Moisture: {lot.moisturePercentage || 8.5}%
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-stone-900 mt-1">{lot.crop}</h4>
                      <p className="text-xs text-stone-600">
                        {lot.clusterName} • Lead: {lot.farmerName} ({lot.village})
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xl font-bold font-display text-emerald-700 block">
                        {(lot.quantityKg / 1000).toFixed(1)} Tons
                      </span>
                      <span className="text-xs text-stone-600">
                        Min. Target: <strong>₹{lot.minimumTargetPricePerKg}/Kg</strong>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-500 bg-white p-3 rounded-xl border border-stone-200/80">
                    {lot.notes || 'Aggregated cluster harvest lot with standard quality check.'}
                  </p>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px] text-stone-500">
                      Expected Harvest: <strong>{lot.expectedHarvestDate}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedLot(lot);
                        setOfferedPrice(lot.minimumTargetPricePerKg.toString());
                      }}
                      className="bg-stone-900 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Submit Purchase Proposal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Purchase Proposals Track */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-stone-900">Submitted Proposals</h3>
            <p className="text-xs text-stone-500">Track responses from Village Champions</p>

            <div className="space-y-3">
              {purchaseRequests.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-4">No proposals submitted yet.</p>
              ) : (
                purchaseRequests.map((req) => (
                  <div key={req.id} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-stone-900">{req.crop}</h5>
                        <p className="text-[11px] text-stone-500">{req.clusterName}</p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                          req.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] pt-1 border-t border-stone-200 text-stone-600">
                      <span>{(req.quantityKg / 1000).toFixed(1)} Tons @ ₹{req.offeredPricePerKg}/Kg</span>
                      <span className="font-bold text-stone-900">₹{req.totalOfferedInr.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Proposal Modal */}
      {selectedLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold font-display text-lg text-stone-900">Submit Purchase Proposal</h3>
                <p className="text-xs text-stone-500">{selectedLot.crop} • {(selectedLot.quantityKg / 1000).toFixed(1)} Tons</p>
              </div>
              <button
                onClick={() => setSelectedLot(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePurchaseRequest} className="space-y-4 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>Cluster:</span>
                  <span className="font-semibold text-stone-900">{selectedLot.clusterName}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Minimum Target:</span>
                  <span className="font-bold text-emerald-700">₹{selectedLot.minimumTargetPricePerKg}/Kg</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Your Offered Price (₹ per Kg):</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 text-sm font-bold focus:ring-1 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Designated Delivery Depot:</label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                Total Estimated Contract Value: <strong>₹{((parseFloat(offeredPrice) || selectedLot.minimumTargetPricePerKg) * selectedLot.quantityKg).toLocaleString()}</strong>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLot(null)}
                  className="px-3 py-2 text-stone-500 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Send Proposal to Cluster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
