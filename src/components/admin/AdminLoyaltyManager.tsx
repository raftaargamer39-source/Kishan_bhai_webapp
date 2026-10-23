import React, { useEffect, useState } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  Save,
  RotateCcw,
  Sparkles,
  Users,
  Coins,
  History,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LoyaltyRule {
  level: string;
  minPoints: number;
  badge: string;
  color: string;
  benefits: string[];
}

export const AdminLoyaltyManager: React.FC = () => {
  const { addToast } = useApp();
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempPoints, setTempPoints] = useState<number>(0);

  useEffect(() => {
    fetch('/api/admin/loyalty/rules')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.rules) {
          setRules(data.rules);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveThreshold = (index: number) => {
    const updated = [...rules];
    updated[index].minPoints = tempPoints;
    setRules(updated);
    setEditingIndex(null);
    addToast('Threshold Updated', `Rule updated for tier ${updated[index].level}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-2xl p-6 text-white border border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white">
              Kishan Bhai Kisan Rewards — Admin Governance & Points Engine
            </h2>
            <p className="text-xs text-stone-300">
              Configure loyalty tier thresholds, audit point issuance ledger, and prevent fraud.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-emerald-300">
          <ShieldCheck className="w-4 h-4" />
          <span>Anti-Fraud Guard Active</span>
        </div>
      </div>

      {/* Tier Thresholds Configurator */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Configurable Loyalty Tier Thresholds</h3>
            <p className="text-xs text-stone-500">
              Automatic level promotions are calculated from verified completed activity points.
            </p>
          </div>
          <span className="text-xs text-stone-400 font-mono">4 Active Tiers</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-stone-400 text-xs">Loading rules...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rules.map((rule, idx) => {
              const isEditing = editingIndex === idx;

              return (
                <div
                  key={rule.level}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-stone-900">
                      {rule.badge}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-bold">
                      Tier {idx + 1}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 block">Min. Points Required</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="number"
                          value={tempPoints}
                          onChange={(e) => setTempPoints(Number(e.target.value))}
                          className="w-24 p-1 text-sm font-bold border rounded-lg bg-white"
                        />
                        <button
                          onClick={() => handleSaveThreshold(idx)}
                          className="p-1 bg-[#087443] text-white rounded-lg hover:bg-[#004D36]"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xl font-black text-stone-900 font-mono">
                          {rule.minPoints} pts
                        </span>
                        <button
                          onClick={() => {
                            setEditingIndex(idx);
                            setTempPoints(rule.minPoints);
                          }}
                          className="text-[11px] text-[#087443] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-200 space-y-1">
                    <span className="text-[10px] text-stone-400 block font-semibold">
                      Unlocked Privileges:
                    </span>
                    <ul className="text-[11px] text-stone-600 space-y-1">
                      {rule.benefits.slice(0, 3).map((b, i) => (
                        <li key={i} className="flex items-start gap-1 leading-tight">
                          <CheckCircle2 className="w-3 h-3 text-[#087443] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Point Awarding Ledger Standard Policy */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-xs">
        <h3 className="text-sm font-bold text-stone-900">Standard Point Value Rules (Configured Policy)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          {[
            { action: 'Farmer KYC & Land Verification', pts: 50, trigger: 'One-time on approved 7/12 land record' },
            { action: 'Completed Eligible Sale', pts: 100, trigger: 'Per verified APMC / buyer escrow payment' },
            { action: 'Successful Physical Delivery', pts: 50, trigger: 'Weighbridge clearance slip uploaded' },
            { action: 'Positive Buyer Rating', pts: 20, trigger: 'Buyer confirms quality >= 4 stars' },
            { action: 'Quality Compliance Milestone', pts: 50, trigger: 'Lab tested zero-adulteration milestone' },
          ].map((item, i) => (
            <div key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="text-lg font-black text-[#087443] font-mono block">+{item.pts} Pts</span>
              <span className="font-bold text-stone-800 block text-[11px]">{item.action}</span>
              <span className="text-[10px] text-stone-500 leading-tight block">{item.trigger}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
