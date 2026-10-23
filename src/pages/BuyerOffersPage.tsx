import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Filter,
  Search,
  Calendar,
  MapPin,
  Truck,
  TrendingUp,
  AlertCircle,
  Award,
  Sparkles,
  Lock,
  ChevronRight,
  HelpCircle,
  Send,
  X,
} from 'lucide-react';

interface BuyerOfferItem {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerType: 'INSTITUTIONAL' | 'EXPORTER' | 'PROCESSOR' | 'WHOLESALER';
  verificationStatus: 'VERIFIED' | 'PREMIUM_VERIFIED';
  crop: string;
  variety?: string;
  offeredPricePerQuintal: number;
  priceUnit: string;
  quantityRequiredQuintals: number;
  qualityRequirements: string;
  pickupLocation: string;
  deliveryTerms: string;
  validUntil: string;
  minimumOrderQuantityQuintals: number;
  estimatedNetProceedsPerQuintal: number;
  requiredLoyaltyLevel: 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  isGeneralEligible: boolean;
  status: 'ACTIVE' | 'CLOSED';
  createdAt: string;
}

export const BuyerOffersPage: React.FC = () => {
  const { addToast, setCurrentView, language } = useApp();
  const isHi = language === 'hi';

  const [offers, setOffers] = useState<BuyerOfferItem[]>([]);
  const [farmerLevel, setFarmerLevel] = useState<'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'>('GOLD');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [onlyEligible, setOnlyEligible] = useState(false);

  // Modal State
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState<BuyerOfferItem | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [proposedQuantity, setProposedQuantity] = useState<number>(30);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  useEffect(() => {
    fetch('/api/farmer/buyer-offers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.offers) {
          setOffers(data.offers);
          setFarmerLevel(data.farmerLevel || 'GOLD');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredOffers = offers.filter((item) => {
    const matchSearch =
      item.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCrop =
      selectedCrop === 'ALL' || item.crop.toLowerCase().includes(selectedCrop.toLowerCase());

    const matchEligibility = !onlyEligible || item.isGeneralEligible;

    return matchSearch && matchCrop && matchEligibility;
  });

  const crops = ['ALL', 'Cotton', 'Wheat', 'Groundnut', 'Mustard'];

  const handleOpenInquiry = (offer: BuyerOfferItem) => {
    setSelectedOfferForDetail(offer);
    setProposedQuantity(offer.minimumOrderQuantityQuintals);
    setShowInquiryModal(true);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferForDetail) return;

    setSubmittingInquiry(true);
    try {
      const res = await fetch(`/api/buyer-offers/${selectedOfferForDetail.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: 'farmer_01',
          farmerName: 'Ramesh Patel',
          proposedQuantityQuintals: proposedQuantity,
          message: inquiryMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(
          isHi ? 'प्रस्ताव सफलतापूर्वक भेजा गया! 🌾' : 'Offer Response Sent! 🌾',
          data.message,
          'success'
        );
        setShowInquiryModal(false);
        setInquiryMessage('');
      }
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to submit response', 'error');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#004D36] via-[#087443] to-[#122e0d] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-400 text-stone-950 text-xs px-3 py-0.5 rounded-full font-black uppercase shadow-xs">
                Verified Buyer Hub
              </span>
              <span className="text-[11px] font-mono text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                Your Tier: {farmerLevel} FARMER
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              {isHi ? 'प्रमाणित संस्थागत खरीदार ऑफ़र' : 'Smart Buyer Access & Institutional Offers'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {isHi
                ? 'सीधे कॉरपोरेट प्रोसेसर, निर्यातक और थोक खरीदारों से जुड़ें। सभी अनुबंध सीधे किसान भाई एस्क्रो द्वारा सुरक्षित हैं।'
                : 'Direct institutional purchase mandates from verified textile mills, food processors, and international exporters.'}
            </p>
          </div>

          {/* Quick Mandi Radar Switcher */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-left shrink-0 max-w-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <TrendingUp className="w-4 h-4" />
              <span>Indicative Mandi Rates vs Offers</span>
            </div>
            <p className="text-[11px] text-stone-200 leading-snug">
              Compare mandi benchmarks with actual binding purchase contracts.
            </p>
            <button
              onClick={() => setCurrentView('market-prices')}
              className="text-xs text-white font-bold underline hover:text-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View Mandi Benchmark Radar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Fairness & Verification Principles Box */}
      <div className="bg-[#E8F6E9] border border-green-200 rounded-2xl p-4 text-xs text-[#004D36] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#087443] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Transparent Marketplace Policy:</p>
          <p className="text-[11px] text-[#087443]/90 leading-relaxed">
            All prices shown are actual buyer offers stored in the database. Higher loyalty levels unlock additional institutional procurement opportunities where supported by buyers; they never hide ordinary eligible offers from any farmer.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isHi
                  ? 'फसल, खरीदार का नाम या स्थान खोजें...'
                  : 'Search crop, buyer company, or location...'
              }
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#087443]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyEligible}
                onChange={(e) => setOnlyEligible(e.target.checked)}
                className="w-4 h-4 rounded text-[#087443] focus:ring-[#087443]"
              />
              <span>{isHi ? 'केवल पात्र ऑफ़र' : 'Only My Eligible Offers'}</span>
            </label>
          </div>
        </div>

        {/* Crop Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-500 font-semibold text-[11px] shrink-0">Crops:</span>
          {crops.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrop(c)}
              className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                selectedCrop === c
                  ? 'bg-[#004D36] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c === 'ALL' ? (isHi ? 'सभी फसलें' : 'All Crops') : c}
            </button>
          ))}
        </div>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="text-center py-16 text-stone-400 text-sm">
          Loading institutional buyer offers...
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-2xl">
            📦
          </div>
          <h3 className="text-lg font-bold text-stone-800">No matching live buyer offers found</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Currently there are no active procurement mandates matching your search criteria. Check back soon or compare with daily indicative mandi rates.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCrop('ALL');
              setOnlyEligible(false);
            }}
            className="px-4 py-2 bg-[#087443] text-white text-xs font-bold rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOffers.map((offer) => {
            const isEligible = offer.isGeneralEligible;

            return (
              <div
                key={offer.id}
                className="bg-white rounded-3xl border border-stone-200 hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Card Top */}
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Buyer & Level Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-stone-900 text-sm sm:text-base">
                          {offer.buyerName}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          {offer.verificationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 font-medium">
                        Procurement Mandate • {offer.buyerType}
                      </p>
                    </div>

                    {/* Level Requirement Pill */}
                    <div className="shrink-0 text-right">
                      {isEligible ? (
                        <span className="text-[10px] font-bold bg-[#E8F6E9] text-[#087443] border border-green-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {isHi ? 'आप पात्र हैं' : 'Eligible for You'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-700" />
                          {offer.requiredLoyaltyLevel} Tier
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Crop & Offered Price Highlight */}
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold block">
                        Crop & Variety
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-stone-900 block mt-0.5">
                        {offer.crop}
                      </span>
                      {offer.variety && (
                        <span className="text-[11px] text-stone-600 block">{offer.variety}</span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold block">
                        Offered Price
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-[#004D36]">
                          ₹{offer.offeredPricePerQuintal.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-stone-600">/quintal</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold block">
                        Est. Net: ₹{offer.estimatedNetProceedsPerQuintal.toLocaleString('en-IN')}/q
                      </span>
                    </div>
                  </div>

                  {/* Procurement Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-stone-400 block">Total Demand:</span>
                      <span className="font-bold text-stone-800">
                        {offer.quantityRequiredQuintals} Quintals
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-stone-400 block">Min. Order (MOQ):</span>
                      <span className="font-bold text-stone-800">
                        {offer.minimumOrderQuantityQuintals} Quintals
                      </span>
                    </div>
                    <div className="col-span-2 space-y-0.5">
                      <span className="text-[10px] text-stone-400 block">Quality Requirements:</span>
                      <span className="text-[11px] text-stone-700 font-medium leading-snug block">
                        {offer.qualityRequirements}
                      </span>
                    </div>
                    <div className="col-span-2 space-y-0.5">
                      <span className="text-[10px] text-stone-400 block">Pickup / Delivery:</span>
                      <span className="text-[11px] text-stone-700 font-medium leading-snug block">
                        📍 {offer.pickupLocation}
                      </span>
                    </div>
                  </div>

                  {/* Terms & Validity */}
                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-2 border-t border-stone-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      Valid Until: {offer.validUntil}
                    </span>
                    <span className="text-emerald-700 font-semibold">
                      Kishan Rewards: +100 Pts
                    </span>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-stone-500">
                    Escrow Guaranteed Settlement
                  </span>

                  {isEligible ? (
                    <button
                      onClick={() => handleOpenInquiry(offer)}
                      className="px-4 py-2 rounded-xl bg-[#087443] hover:bg-[#004D36] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{isHi ? 'ऑफ़र स्वीकारें / संपर्क करें' : 'Respond / Accept'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        addToast(
                          'Loyalty Level Requirement',
                          `This premium offer requires ${offer.requiredLoyaltyLevel} tier. Complete verified deliveries to earn more points!`,
                          'info'
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-stone-200 text-stone-600 text-xs font-semibold cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-stone-500" />
                      <span>Unlock at {offer.requiredLoyaltyLevel}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inquiry / Response Modal */}
      {showInquiryModal && selectedOfferForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#004D36] to-[#087443] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">
                  Respond to {selectedOfferForDetail.buyerName}
                </h3>
                <p className="text-xs text-emerald-200">
                  {selectedOfferForDetail.crop} @ ₹{selectedOfferForDetail.offeredPricePerQuintal}/q
                </p>
              </div>
              <button
                onClick={() => setShowInquiryModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendInquiry} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Proposed Quantity (Quintals)
                </label>
                <input
                  type="number"
                  min={selectedOfferForDetail.minimumOrderQuantityQuintals}
                  max={selectedOfferForDetail.quantityRequiredQuintals}
                  value={proposedQuantity}
                  onChange={(e) => setProposedQuantity(Number(e.target.value))}
                  className="w-full p-2.5 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#087443] focus:outline-none"
                  required
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Minimum Order Quantity: {selectedOfferForDetail.minimumOrderQuantityQuintals} Quintals
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Message or Field Batch Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="e.g. Grain harvested last week, moisture tested at 8.2%, ready for weighbridge."
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#087443] focus:outline-none resize-none"
                />
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex justify-between items-center text-xs">
                <span className="text-stone-600">Estimated Gross Value:</span>
                <span className="font-black text-[#004D36] text-sm">
                  ₹{(proposedQuantity * selectedOfferForDetail.offeredPricePerQuintal).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(false)}
                  className="flex-1 py-2.5 text-xs text-stone-600 border border-stone-300 rounded-xl font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInquiry}
                  className="flex-1 py-2.5 text-xs bg-[#087443] hover:bg-[#004D36] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit to Buyer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
