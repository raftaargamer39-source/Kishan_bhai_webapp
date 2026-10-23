import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Award,
  History,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface LedgerItem {
  id: string;
  farmerId: string;
  transactionId?: string;
  activityType: string;
  pointsChange: number;
  status: string;
  idempotencyKey: string;
  description: string;
  createdAt: string;
}

interface RewardsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RewardsHistoryModal: React.FC<RewardsHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useApp();
  const isHi = language === 'hi';
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/farmer/rewards/history')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.ledger) {
            setLedger(data.ledger);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                {isHi ? 'किसान रिवार्ड्स खाता व ऑडिट लेज़र' : 'Kisan Rewards Ledger & Audit History'}
              </h3>
              <p className="text-xs text-amber-200/80">
                {isHi
                  ? 'प्रत्येक अर्जित, सत्यापित व समायोजित अंक का पारदर्शी विवरण।'
                  : 'Transparent point history with strict anti-fraud audit trail'}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Rules Summary Box */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{isHi ? 'रिवार्ड अंक नियम गाइड' : 'How Verified Points Are Awarded'}</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="font-black text-[#087443] block text-sm">+50</span>
                <span className="text-[10px] text-stone-600">Profile KYC</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="font-black text-[#087443] block text-sm">+100</span>
                <span className="text-[10px] text-stone-600">Completed Sale</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="font-black text-[#087443] block text-sm">+50</span>
                <span className="text-[10px] text-stone-600">Verified Delivery</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="font-black text-[#087443] block text-sm">+20</span>
                <span className="text-[10px] text-stone-600">Buyer Rating</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="font-black text-[#087443] block text-sm">+50</span>
                <span className="text-[10px] text-stone-600">Quality Spec</span>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              {isHi ? 'खाता प्रविष्टियां (लेज़र)' : 'Transaction Ledger Entries'}
            </h4>

            {loading ? (
              <div className="text-center py-8 text-stone-400 text-xs">Loading ledger records...</div>
            ) : ledger.length === 0 ? (
              <div className="text-center py-8 text-stone-500 text-xs">No records found.</div>
            ) : (
              <div className="space-y-2">
                {ledger.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-stone-900">{item.description}</span>
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                          {item.activityType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-stone-400 font-mono">
                        <span>ID: {item.id}</span>
                        <span>•</span>
                        <span>Key: {item.idempotencyKey}</span>
                        <span>•</span>
                        <span>
                          {new Date(item.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black font-mono text-[#087443] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl block">
                        +{item.pointsChange} pts
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 uppercase block mt-1">
                        ✓ {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-500">
            Kishan Bhai Anti-Fraud Protocol • Automated Duplicate Guard Active
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
