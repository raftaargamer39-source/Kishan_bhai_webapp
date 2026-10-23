import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  History,
  CheckCircle2,
  Lock,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';

interface LoyaltyProfileData {
  farmerName: string;
  totalPoints: number;
  currentLevel: 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  levelBadge: string;
  nextLevel: 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | null;
  pointsToNextLevel: number;
  progressPercent: number;
  unlockedBenefits: string[];
  trustScore: {
    isVerified: boolean;
    completedTransactions: number;
    successfulDeliveries: number;
    verifiedRating: number;
    qualityComplianceRate: number;
    trustScoreOutOf100: number;
  };
  recentLedger: Array<{
    id: string;
    activityType: string;
    pointsChange: number;
    description: string;
    createdAt: string;
  }>;
}

interface KishanRewardsCardProps {
  onOpenHistory?: () => void;
  onOpenRepeatOrder?: () => void;
}

export const KishanRewardsCard: React.FC<KishanRewardsCardProps> = ({
  onOpenHistory,
  onOpenRepeatOrder,
}) => {
  const { setCurrentView, language } = useApp();
  const [profile, setProfile] = useState<LoyaltyProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const isHi = language === 'hi';

  useEffect(() => {
    fetch('/api/farmer/rewards')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPoints = profile?.totalPoints ?? 570;
  const currentLevel = profile?.currentLevel ?? 'GOLD';
  const nextLevel = profile?.nextLevel ?? 'PLATINUM';
  const pointsToNextLevel = profile?.pointsToNextLevel ?? 930;
  const progressPercent = profile?.progressPercent ?? 7;

  const levelColor =
    currentLevel === 'DIAMOND'
      ? 'from-purple-900 via-indigo-950 to-slate-900 border-purple-400/40'
      : currentLevel === 'PLATINUM'
      ? 'from-cyan-950 via-teal-900 to-slate-900 border-cyan-400/40'
      : currentLevel === 'GOLD'
      ? 'from-amber-950 via-yellow-950 to-stone-900 border-amber-400/40'
      : 'from-stone-900 via-slate-900 to-stone-950 border-stone-400/40';

  const badgeColor =
    currentLevel === 'DIAMOND'
      ? 'bg-purple-400 text-purple-950'
      : currentLevel === 'PLATINUM'
      ? 'bg-cyan-400 text-cyan-950'
      : currentLevel === 'GOLD'
      ? 'bg-[#FFD84D] text-[#004D36]'
      : 'bg-slate-300 text-slate-900';

  return (
    <div className={`rounded-3xl p-6 sm:p-7 bg-gradient-to-br ${levelColor} text-white border shadow-xl relative overflow-hidden transition-all space-y-6`}>
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -mb-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
                {isHi ? 'किसान भाई किसान रिवार्ड्स' : 'Kishan Bhai Kisan Rewards'}
              </h2>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs ${badgeColor}`}>
                {currentLevel} FARMER
              </span>
            </div>
            <p className="text-xs text-stone-300 font-medium">
              {isHi
                ? 'प्रमाणित बिक्री करें, लॉयल्टी पॉइंट्स कमाएं और सीधे प्रीमियम खरीदारों से जुड़ें।'
                : 'Verified transaction rewards • Unlock higher institutional buyer access'}
            </p>
          </div>
        </div>

        {/* Trust Score Pill */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div className="text-left">
            <span className="text-[10px] text-stone-400 block leading-none">Farmer Trust Score</span>
            <span className="text-xs font-black text-emerald-300">
              {profile?.trustScore.trustScoreOutOf100 ?? 96}/100 • 100% Verified
            </span>
          </div>
        </div>
      </div>

      {/* Points & Progress Section */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3 relative z-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <span className="text-xs text-stone-300 uppercase tracking-wider font-semibold block">
              {isHi ? 'कुल लॉयल्टी पॉइंट्स' : 'Total Loyalty Points'}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight">
                {totalPoints.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-stone-300">points</span>
            </div>
          </div>

          <div className="text-right">
            {nextLevel ? (
              <>
                <span className="text-xs text-stone-300 block">
                  {isHi ? 'अगला स्तर:' : 'Next Level:'}{' '}
                  <strong className="text-white uppercase font-bold">{nextLevel}</strong>
                </span>
                <span className="text-xs font-semibold text-emerald-300">
                  {pointsToNextLevel} {isHi ? 'पॉइंट्स शेष' : 'points needed'}
                </span>
              </>
            ) : (
              <span className="text-xs font-black text-purple-300 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-400/40">
                👑 Maximum Tier Achieved (Diamond)
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {nextLevel && (
          <div className="space-y-1">
            <div className="w-full bg-black/40 rounded-full h-3 p-0.5 border border-white/10 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>{currentLevel} (0%)</span>
              <span>Progress: {progressPercent}%</span>
              <span>{nextLevel} (100%)</span>
            </div>
          </div>
        )}
      </div>

      {/* Unlocked Benefits & Recent Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Benefits */}
        <div className="bg-black/30 rounded-2xl p-4 border border-white/10 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHi ? 'अनलॉक किए गए लाभ' : 'Unlocked Level Benefits'}</span>
          </div>
          <ul className="space-y-1.5">
            {(profile?.unlockedBenefits || [
              'All Silver standard benefits included',
              'Access additional eligible buyer opportunities',
              'Improved smart buyer algorithmic matching',
              'Access eligible bulk-selling clusters',
              'Detailed loyalty progress analytics',
            ]).slice(0, 4).map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-stone-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Ledger Activity */}
        <div className="bg-black/30 rounded-2xl p-4 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <History className="w-3.5 h-3.5" />
              <span>{isHi ? 'हालिया रिवार्ड्स' : 'Recent Verified Points'}</span>
            </div>
            {onOpenHistory && (
              <button
                onClick={onOpenHistory}
                className="text-[11px] text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                {isHi ? 'पूरा इतिहास देखें' : 'View Full Ledger'}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {(profile?.recentLedger || []).slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5"
              >
                <div className="truncate pr-2">
                  <span className="text-stone-200 font-medium block truncate text-[11px]">
                    {item.description}
                  </span>
                  <span className="text-[9px] text-stone-400 font-mono">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-400 shrink-0 text-xs">
                  +{item.pointsChange} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-white/10 relative z-10">
        <button
          onClick={() => setCurrentView('buyer-offers')}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-xs shadow-lg transition-all active:scale-[0.98] cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-stone-950" />
          <span>{isHi ? 'खरीदार ऑफ़र देखें' : 'Explore Buyer Offers'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {onOpenRepeatOrder && (
          <button
            onClick={onOpenRepeatOrder}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
            <span>{isHi ? 'पिछला ऑर्डर दोहराएं' : 'Repeat Previous Order'}</span>
          </button>
        )}

        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-stone-200 font-semibold text-xs border border-white/10 transition-all cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-stone-400" />
            <span>{isHi ? 'रिवार्ड इतिहास' : 'View Rewards History'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
