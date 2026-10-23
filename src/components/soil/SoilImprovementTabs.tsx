import React, { useState } from 'react';
import { SoilImprovementPlanItem } from '../../../shared/types';
import { useApp } from '../../context/AppContext';
import {
  Sprout,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Droplets,
  FlaskConical,
  PlusCircle,
} from 'lucide-react';

interface SoilImprovementTabsProps {
  plans: SoilImprovementPlanItem[];
  language: string;
}

export const SoilImprovementTabs: React.FC<SoilImprovementTabsProps> = ({ plans, language }) => {
  const { addDiaryEntry, addToast } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Organic Matter', 'Crop Rotation', 'Nutrient Management', 'Irrigation & Drainage'];

  const filteredPlans = activeCategory === 'All'
    ? plans
    : plans.filter((p) => p.category.toLowerCase().includes(activeCategory.toLowerCase().slice(0, 5)));

  const handleAddPlanToDiary = (plan: SoilImprovementPlanItem) => {
    addDiaryEntry({
      date: new Date().toISOString().split('T')[0],
      category: 'Fertilizer',
      crop: 'All Soil / Fields',
      title: `Soil Plan: ${plan.title}`,
      notes: `${plan.description || ''} • Action: ${(plan.actionSteps || []).join('; ')}`,
      quantityOrDose: plan.dosageOrMethod || 'Recommended Application',
      expenseAmountInr: plan.estimatedCostInr || 1200,
      revenueAmountInr: 0,
      incomeAmountInr: 0,
    });
    addToast('Scheduled in Farm Diary', `"${plan.title}" saved to your diary.`, 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-stone-900">
              {language === 'hi' ? 'मृदा सुधार एवं कार्बन संवर्धन कार्ययोजना' : 'Actionable Soil Health Improvement Roadmap'}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {language === 'hi'
              ? 'आपकी मिट्टी के पोषक तत्वों को संतुलित करने और जैविक कार्बन को >0.8% तक ले जाने के वैज्ञानिक उपाय।'
              : 'Step-by-step agronomic roadmap to elevate Organic Carbon, restore N-P-K balance, and optimize water retention.'}
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 bg-stone-100 p-1 rounded-2xl self-start sm:self-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-stone-50/80 hover:bg-stone-50 border border-stone-200 rounded-2xl p-4 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  {plan.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    (plan.priority || 'HIGH') === 'CRITICAL'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : (plan.priority || 'HIGH') === 'HIGH'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {plan.priority || plan.impactLevel || 'HIGH'} PRIORITY
                </span>
              </div>

              <h3 className="font-bold text-stone-900 text-sm">{plan.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{plan.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-stone-200/80">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-stone-200/70">
                  <div className="text-[10px] font-semibold text-stone-400">Application Method</div>
                  <div className="font-bold text-stone-800 text-[11px] mt-0.5 truncate">{plan.dosageOrMethod || (plan.actionSteps && plan.actionSteps[0]) || 'Field Incorporation'}</div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-stone-200/70">
                  <div className="text-[10px] font-semibold text-stone-400">Target Timeframe</div>
                  <div className="font-bold text-stone-800 text-[11px] mt-0.5 flex items-center gap-1 truncate">
                    <Calendar className="w-3 h-3 text-stone-500" />
                    <span>{plan.timeframe || plan.timeline || 'Immediate / Pre-Sowing'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5 text-xs text-emerald-950 flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Expected Outcome:</span> {plan.expectedOutcome || 'Enhanced soil organic carbon, balanced microbial flora, and higher yield resilience.'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-xs">
                  <span className="text-stone-500">Est. Investment: </span>
                  <span className="font-bold text-stone-900">₹{(plan.estimatedCostInr || 1200).toLocaleString('en-IN')}/acre</span>
                </div>

                <button
                  onClick={() => handleAddPlanToDiary(plan)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Log in Diary</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
