import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Package,
  IndianRupee,
  MapPin,
  Building,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface PreviousOrder {
  id: string;
  crop: string;
  variety: string;
  buyerName: string;
  buyerId: string;
  previousQuantityQuintals: number;
  previousPricePerQuintal: number;
  deliveryLocation: string;
  completedDate: string;
}

const PREVIOUS_ORDERS: PreviousOrder[] = [
  {
    id: 'ord_cot_prev_101',
    crop: 'Cotton (Kapas)',
    variety: 'Shankar-6 Long Staple',
    buyerName: 'Arvind Limited (Cotton Division)',
    buyerId: 'buyer_arvind_mills',
    previousQuantityQuintals: 45,
    previousPricePerQuintal: 7550,
    deliveryLocation: 'Rajkot APMC Weighbridge Yard',
    completedDate: '2026-10-02',
  },
  {
    id: 'ord_gn_prev_102',
    crop: 'Groundnut (Mungfali)',
    variety: 'GG-20 Bold Kernel',
    buyerName: 'Gujarat State Seeds & Agro',
    buyerId: 'buyer_gujarat_agro',
    previousQuantityQuintals: 30,
    previousPricePerQuintal: 6650,
    deliveryLocation: 'Gondal Central Warehouse',
    completedDate: '2026-10-12',
  },
  {
    id: 'ord_wht_prev_103',
    crop: 'Wheat (Sharbati)',
    variety: 'Sharbati A-Grade',
    buyerName: 'ITC Limited (Agri Business)',
    buyerId: 'buyer_itc_foods',
    previousQuantityQuintals: 60,
    previousPricePerQuintal: 2880,
    deliveryLocation: 'Sanand Processing Depot',
    completedDate: '2026-10-19',
  },
];

interface RepeatOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: () => void;
}

export const RepeatOrderModal: React.FC<RepeatOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const { addToast, language } = useApp();
  const isHi = language === 'hi';

  const [selectedOrder, setSelectedOrder] = useState<PreviousOrder>(PREVIOUS_ORDERS[0]);
  const [quantity, setQuantity] = useState<number>(PREVIOUS_ORDERS[0].previousQuantityQuintals);
  const [pricePerQuintal, setPricePerQuintal] = useState<number>(PREVIOUS_ORDERS[0].previousPricePerQuintal);
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>(PREVIOUS_ORDERS[0].deliveryLocation);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectOrder = (order: PreviousOrder) => {
    setSelectedOrder(order);
    setQuantity(order.previousQuantityQuintals);
    setPricePerQuintal(order.previousPricePerQuintal);
    setDeliveryAddress(order.deliveryLocation);
  };

  const totalAmount = quantity * pricePerQuintal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      addToast('Invalid Quantity', 'Please enter a valid crop quantity', 'error');
      return;
    }
    if (!pricePerQuintal || pricePerQuintal <= 0) {
      addToast('Invalid Price', 'Please enter an agreed price per quintal', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/repeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: 'farmer_01',
          crop: selectedOrder.crop,
          quantityQuintals: quantity,
          agreedPricePerQuintal: pricePerQuintal,
          deliveryDate,
          buyerId: selectedOrder.buyerId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(
          isHi ? 'पुनरावृत्ति आदेश सफलतापूर्वक दर्ज! 🌾' : 'Repeat Order Confirmed! 🌾',
          isHi
            ? `नया आदेश #${data.orderId} उत्पन्न हुआ। +100 रिवार्ड पॉइंट्स प्राप्त हुए!`
            : `Order #${data.orderId} generated. +100 Loyalty Points awarded to your ledger!`,
          'success'
        );
        onOrderCreated?.();
        onClose();
      } else {
        addToast('Order Failed', data.error || 'Failed to submit repeat order', 'error');
      }
    } catch (err: any) {
      addToast('Submission Error', err.message || 'Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#004D36] to-[#087443] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                {isHi ? 'पिछला लेनदेन दोहराएं' : 'Repeat Previous Transaction'}
              </h3>
              <p className="text-xs text-emerald-200">
                {isHi
                  ? 'पिछली प्रमाणित बिक्री का चयन करें और नए नियमों के साथ पुन: आदेश दें।'
                  : 'Select a past completed transaction and initiate a fresh verified repeat order.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Step: Select past completed order */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              1. {isHi ? 'पिछला प्रमाणित आदेश चुनें' : 'Select Past Completed Order'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PREVIOUS_ORDERS.map((ord) => {
                const isSelected = selectedOrder.id === ord.id;
                return (
                  <div
                    key={ord.id}
                    onClick={() => handleSelectOrder(ord)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#087443] bg-[#E8F6E9] shadow-xs ring-2 ring-[#087443]/20'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-900 truncate">{ord.crop}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#087443]" />}
                    </div>
                    <p className="text-[11px] text-stone-600 truncate">{ord.buyerName}</p>
                    <p className="text-[10px] text-stone-400 mt-1">
                      {ord.previousQuantityQuintals} Q @ ₹{ord.previousPricePerQuintal}/Q
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Step: Review & Edit Terms */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="text-xs font-bold text-stone-800">
                2. {isHi ? 'नए नियम व मात्रा निर्धारित करें' : 'Adjust Terms for New Order'}
              </span>
              <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-semibold">
                ⚠️ {isHi ? 'ताजा समीक्षा आवश्यक है' : 'Review & Confirm Current Terms'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isHi ? 'मात्रा (क्विंटल में)' : 'Quantity (Quintals)'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#087443]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isHi ? 'प्रस्तावित मूल्य (₹/क्विंटल)' : 'Agreed Price (₹/Quintal)'}
                </label>
                <input
                  type="number"
                  min="100"
                  value={pricePerQuintal}
                  onChange={(e) => setPricePerQuintal(Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#087443]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isHi ? 'डिलीवरी तिथि' : 'Scheduled Delivery Date'}
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#087443]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isHi ? 'डिलीवरी / पिकअप स्थान' : 'Delivery / Pickup Depot'}
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#087443]"
                  required
                />
              </div>
            </div>

            {/* Total Payout Preview */}
            <div className="bg-[#E8F6E9] rounded-xl p-3 border border-emerald-300 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-800 font-semibold block">
                  {isHi ? 'अनुमानित कुल भुगतान राशि' : 'Estimated Gross Order Value'}
                </span>
                <span className="text-xl font-black text-[#004D36]">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-700 font-bold block">
                  Kisan Rewards Earned:
                </span>
                <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                  +100 Points on Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Transparency Disclaimer */}
          <div className="flex items-start gap-2 text-[11px] text-stone-500 bg-stone-100 p-3 rounded-xl border border-stone-200">
            <AlertCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <p>
              {isHi
                ? 'नया आदेश पूर्व आदेश के संदर्भ में एक स्वतंत्र कानूनी संविदा है। डिजिटल वेइंग और गुणवत्ता जांच के बाद ही अंतिम भुगतान एस्क्रो से जारी होता है।'
                : 'Repeat order initiates a fresh binding agreement. Final settlement is released through Kishan Bhai escrow following physical weighbridge & quality verification.'}
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#087443] hover:bg-[#004D36] text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Generating Order...</span>
              ) : (
                <>
                  <span>{isHi ? 'नया आदेश कन्फर्म करें' : 'Confirm Repeat Order'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
