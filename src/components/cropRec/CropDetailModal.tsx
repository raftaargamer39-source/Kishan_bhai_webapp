import React, { useState } from 'react';
import { CropCatalogItem, CropDetail } from '../../../shared/types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sprout,
  Calendar,
  Layers,
  Droplets,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Bug,
  Activity,
  PlusCircle,
  MessageSquare,
  DollarSign,
  Package,
} from 'lucide-react';

interface CropDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  crop: CropCatalogItem | CropDetail | any | null;
}

export const CropDetailModal: React.FC<CropDetailModalProps> = ({ isOpen, onClose, crop }) => {
  const { addCrop, setCurrentView, askAiWithPrompt, addToast, language } = useApp();
  const [activeTab, setActiveTab] = useState<'stages' | 'nutrition' | 'pests' | 'harvest' | 'market'>('stages');

  if (!isOpen || !crop) return null;

  const durationDays = crop.durationDays || 120;
  const yieldText = crop.averageYieldQuintalsPerAcre || crop.expectedYieldQuintals || 20;
  const netProfit = crop.estimatedNetProfitPerAcreInr || crop.estimatedProfitPerAcre || 42000;
  const waterReq = crop.waterRequirement || 'Medium';
  const phRange = crop.soilPhRange || '6.5 - 8.0';
  const description = crop.description || crop.overview || crop.whyThisCrop || '';
  const stages = crop.stages || (crop.growthStages ? crop.growthStages.map((s: any) => ({
    stageName: s.stage || s.title,
    startDay: s.daysRange?.split('-')[0]?.trim() || 0,
    endDay: s.daysRange?.split('-')[1]?.trim() || 30,
    description: s.description,
    waterAdvice: s.waterAdvice,
    nutritionAdvice: s.nutritionAdvice,
  })) : []);

  const diseases = crop.diseases || (crop.commonDiseases ? crop.commonDiseases.map((d: any) => ({
    name: d.name,
    symptoms: d.symptoms,
    organicControl: d.organicRemedy,
    chemicalControl: d.chemicalSpray,
  })) : []);

  const pests = crop.pests || (crop.commonPests ? crop.commonPests.map((p: any) => ({
    name: p.name,
    symptoms: p.symptoms,
    ipmControl: p.ipmControl,
    chemicalSpray: p.thresholdAction,
  })) : []);

  const fertilizer = crop.fertilizerPlan || {
    nitrogenKgAcre: 45,
    phosphorusKgAcre: 20,
    potassiumKgAcre: 20,
    basalDose: crop.nutrientRequirements?.basal || '50 kg DAP + 20 kg MOP at time of sowing',
    topDressing: crop.nutrientRequirements?.topDressing || 'Split application of Urea with irrigation',
    micronutrients: crop.nutrientRequirements?.micronutrients || 'Zinc sulphate foliar spray at 30 & 45 DAS',
  };

  const handleAddToActiveCrops = () => {
    addCrop({
      id: `crop_${Date.now()}`,
      cropName: crop.cropName,
      hindiName: crop.hindiName,
      variety: crop.variety,
      sowingDate: new Date().toISOString().split('T')[0],
      areaAcres: 2.0,
      stage: 'Sowing / Seedling',
      stageProgressPct: 5,
      healthScore: 98,
      expectedHarvestDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      expectedYieldQuintals: Math.round(Number(yieldText) * 2.0),
      soilMoistureStatus: 'OPTIMAL',
      pestVulnerability: 'LOW',
      pestWatchlist: pests.map((p: any) => p.name).slice(0, 2),
      recentAction: 'Planned sowing based on AI Suitability recommendation',
      imageUrl: crop.imageUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    });
    addToast('Crop Added to Active Cultivation', `${crop.cropName} (${crop.variety}) added to your field roster.`, 'success');
    onClose();
    setCurrentView('my-crops');
  };

  const handleAskAIAboutCrop = () => {
    onClose();
    askAiWithPrompt(
      `I want detailed agronomic guidance on cultivating ${crop.cropName} (${crop.variety}) in ${crop.season || 'Rabi'} season. What are the key stages, basal fertilizer doses, pest control, and expected profit per acre?`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={crop.imageUrl}
              alt={crop.cropName}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-stone-200 shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                  {crop.cropName}
                </h2>
                {crop.hindiName && (
                  <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-lg">
                    {crop.hindiName}
                  </span>
                )}
                <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {crop.variety}
                </span>
              </div>

              <div className="text-xs text-stone-500 italic mt-0.5">
                {crop.scientificName || crop.cropName} • {crop.season || crop.bestSeason || 'Multi-Season'} Season • Duration: {durationDays} days
              </div>

              <p className="text-xs text-stone-600 mt-2 leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Agronomic Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
            <div className="text-[10px] text-stone-400 font-bold uppercase">Optimal Soil pH</div>
            <div className="font-bold text-stone-900 mt-0.5">{phRange}</div>
          </div>

          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
            <div className="text-[10px] text-stone-400 font-bold uppercase">Water Level</div>
            <div className="font-bold text-blue-700 mt-0.5">{waterReq}</div>
          </div>

          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
            <div className="text-[10px] text-stone-400 font-bold uppercase">Est. Yield / Acre</div>
            <div className="font-bold text-stone-900 mt-0.5">{yieldText} Quintals</div>
          </div>

          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
            <div className="text-[10px] text-emerald-800 font-bold uppercase">Est. Net Profit</div>
            <div className="font-black text-emerald-950 mt-0.5">₹{Number(netProfit).toLocaleString('en-IN')}/ac</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab('stages')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stages' ? 'bg-[#1B3B11] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            🌱 Growth Stages ({stages.length})
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'nutrition' ? 'bg-[#1B3B11] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            🧪 Fertilizer & Nutrition
          </button>
          <button
            onClick={() => setActiveTab('pests')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pests' ? 'bg-[#1B3B11] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            🔍 Pests & Diseases ({diseases.length + pests.length})
          </button>
          <button
            onClick={() => setActiveTab('harvest')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'harvest' ? 'bg-[#1B3B11] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            🌾 Harvest & Storage
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'market' ? 'bg-[#1B3B11] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            📈 Mandi Rates & Buyers
          </button>
        </div>

        {/* Tab 1: Growth Stages */}
        {activeTab === 'stages' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stages.map((stage: any, idx: number) => (
                <div key={idx} className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-stone-900 text-sm">{stage.stageName}</span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Days {stage.startDay} - {stage.endDay}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">{stage.description}</p>
                  <div className="pt-2 border-t border-stone-200/70 space-y-1 text-[11px]">
                    <div><span className="font-bold text-stone-800">💧 Water:</span> {stage.waterAdvice}</div>
                    <div><span className="font-bold text-stone-800">🧪 Nutrition:</span> {stage.nutritionAdvice}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Nutrition */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="font-bold text-emerald-950">Recommended Dose of Fertilizer (RDF):</div>
              <div className="grid grid-cols-3 gap-2 font-bold text-stone-800">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 text-center">
                  Nitrogen: {fertilizer.nitrogenKgAcre || 45} kg/ac
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 text-center">
                  Phosphorus: {fertilizer.phosphorusKgAcre || 20} kg/ac
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 text-center">
                  Potassium: {fertilizer.potassiumKgAcre || 20} kg/ac
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="font-bold text-stone-900">1. Basal Dose (At Sowing)</div>
                <p className="text-stone-600">{fertilizer.basalDose}</p>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="font-bold text-stone-900">2. Top Dressing / Fertigation</div>
                <p className="text-stone-600">{fertilizer.topDressing}</p>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="font-bold text-stone-900">3. Micronutrient Foliar Spray</div>
                <p className="text-stone-600">{fertilizer.micronutrients}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Pests & Diseases */}
        {activeTab === 'pests' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Major Diseases & IPM Remedies</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {diseases.map((d: any, i: number) => (
                  <div key={i} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
                    <div className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-rose-600" />
                      <span>{d.name}</span>
                    </div>
                    <p className="text-stone-600 text-[11px]"><strong>Symptoms:</strong> {d.symptoms}</p>
                    <div className="text-[11px] pt-1 border-t border-stone-200 space-y-0.5">
                      <div className="text-emerald-700"><strong>Organic:</strong> {d.organicControl}</div>
                      <div className="text-blue-700"><strong>Chemical:</strong> {d.chemicalControl}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Major Insect Pests & Control</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {pests.map((p: any, i: number) => (
                  <div key={i} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
                    <div className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                      <Bug className="w-4 h-4 text-amber-600" />
                      <span>{p.name}</span>
                    </div>
                    <p className="text-stone-600 text-[11px]"><strong>Symptoms:</strong> {p.symptoms}</p>
                    <div className="text-[11px] pt-1 border-t border-stone-200 space-y-0.5">
                      <div className="text-emerald-700"><strong>IPM / Traps:</strong> {p.ipmControl}</div>
                      <div className="text-amber-800"><strong>Threshold Spray:</strong> {p.chemicalSpray}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Harvest & Storage */}
        {activeTab === 'harvest' && (
          <div className="space-y-4 text-xs">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
              <h4 className="font-bold text-stone-900 text-sm">Harvest Maturity Indicators</h4>
              <ul className="space-y-1.5 list-disc list-inside text-stone-600">
                {(crop.harvestIndicators || ['Leaves turn golden yellow', 'Pods/grains reach optimal moisture', 'Bolls open naturally']).map((ind: string, i: number) => (
                  <li key={i}>{ind}</li>
                ))}
              </ul>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
              <h4 className="font-bold text-stone-900 text-sm">Post-Harvest Curing & Storage</h4>
              <p className="text-stone-600 leading-relaxed">
                {crop.postHarvestStorage || crop.storageConsiderations?.join('. ') || 'Sun dry grains to 10-12% moisture content before bagging in hermetic grain bags. Store in well-aerated rodent-proof godowns.'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Market Information */}
        {activeTab === 'market' && (
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-sm">Mandi Price Index</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  MSP Supported: {crop.mspSupport || crop.marketInformation?.mspPricePerQuintal ? 'Yes (Verified)' : 'Open Market'}
                </span>
              </div>
              <p className="text-stone-700">
                <strong>Reference Mandi Price:</strong> {crop.mandiPriceReference || `₹${crop.marketInformation?.currentMandiPricePerQuintal || 6200} / Quintal (Avg)`}
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
              <h4 className="font-bold text-stone-900 text-sm">Top Mandis & Buyers</h4>
              <p className="text-stone-600 leading-relaxed">
                {crop.marketHubs ? crop.marketHubs.join(', ') : (crop.marketInformation?.topBuyers || 'Rajkot, Gondal, Unjha, APMC mandi trading hubs with active institutional procurement.')}
              </p>
            </div>
          </div>
        )}

        {/* Footer CTAs */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleAskAIAboutCrop}
            className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-4 py-3 rounded-2xl inline-flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            <span>{language === 'hi' ? 'एआई सलाहकार से फसल पर चर्चा करें' : 'Discuss with AI Agronomist'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-all cursor-pointer text-center"
            >
              Close Guide
            </button>
            <button
              onClick={handleAddToActiveCrops}
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-3 rounded-2xl inline-flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'hi' ? 'मेरी फसलों में जोड़ें' : 'Add to My Active Crops'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
