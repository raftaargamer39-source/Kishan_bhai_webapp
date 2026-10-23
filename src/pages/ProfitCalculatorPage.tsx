import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  PieChart as PieIcon,
  Percent,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

export const ProfitCalculatorPage: React.FC = () => {
  const { language } = useApp();

  // Inputs state
  const [cropName, setCropName] = useState('BT Cotton');
  const [farmSizeAcres, setFarmSizeAcres] = useState<number>(4.5);
  const [seedCost, setSeedCost] = useState<number>(2200);
  const [fertilizerCost, setFertilizerCost] = useState<number>(4500);
  const [pesticideCost, setPesticideCost] = useState<number>(3200);
  const [labourCost, setLabourCost] = useState<number>(6500);
  const [irrigationCost, setIrrigationCost] = useState<number>(1800);
  const [machineryCost, setMachineryCost] = useState<number>(3800);
  const [miscCost, setMiscCost] = useState<number>(1000);
  const [expectedYieldPerAcre, setExpectedYieldPerAcre] = useState<number>(12);
  const [sellingPricePerQuintal, setSellingPricePerQuintal] = useState<number>(7350);

  // Computations
  const results = useMemo(() => {
    const costPerAcre =
      seedCost +
      fertilizerCost +
      pesticideCost +
      labourCost +
      irrigationCost +
      machineryCost +
      miscCost;
    const totalCost = costPerAcre * farmSizeAcres;
    const totalYieldQuintals = expectedYieldPerAcre * farmSizeAcres;
    const grossRevenue = totalYieldQuintals * sellingPricePerQuintal;
    const netProfit = grossRevenue - totalCost;
    const netProfitPerAcre = netProfit / (farmSizeAcres || 1);
    const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    const breakEvenPrice = totalYieldQuintals > 0 ? totalCost / totalYieldQuintals : 0;
    const breakEvenYield = sellingPricePerQuintal > 0 ? costPerAcre / sellingPricePerQuintal : 0;

    const breakdownData = [
      { name: 'Seeds & Nursery', value: seedCost * farmSizeAcres, color: '#16a34a' },
      { name: 'Fertilizers', value: fertilizerCost * farmSizeAcres, color: '#3b82f6' },
      { name: 'Crop Protection', value: pesticideCost * farmSizeAcres, color: '#f59e0b' },
      { name: 'Labour & Weeding', value: labourCost * farmSizeAcres, color: '#8b5cf6' },
      { name: 'Irrigation & Power', value: irrigationCost * farmSizeAcres, color: '#06b6d4' },
      { name: 'Machinery Hire', value: machineryCost * farmSizeAcres, color: '#ec4899' },
      { name: 'Misc & Mandi Cess', value: miscCost * farmSizeAcres, color: '#a8a29e' },
    ];

    return {
      costPerAcre,
      totalCost,
      totalYieldQuintals,
      grossRevenue,
      netProfit,
      netProfitPerAcre,
      roi,
      breakEvenPrice,
      breakEvenYield,
      breakdownData,
    };
  }, [
    farmSizeAcres,
    seedCost,
    fertilizerCost,
    pesticideCost,
    labourCost,
    irrigationCost,
    machineryCost,
    miscCost,
    expectedYieldPerAcre,
    sellingPricePerQuintal,
  ]);

  const handleResetDefaults = () => {
    setFarmSizeAcres(4.5);
    setSeedCost(2200);
    setFertilizerCost(4500);
    setPesticideCost(3200);
    setLabourCost(6500);
    setIrrigationCost(1800);
    setMachineryCost(3800);
    setMiscCost(1000);
    setExpectedYieldPerAcre(12);
    setSellingPricePerQuintal(7350);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3B11] to-green-700 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>{language === 'hi' ? 'कृषि अर्थशास्त्र व लाभ कैलकुलेटर' : 'Farm Economics & Profitability Engine'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {language === 'hi' ? 'फसल लाभ कैलकुलेटर' : 'Crop Profit & ROI Calculator'}
          </h1>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
            {language === 'hi'
              ? 'लागत, अनुमानित पैदावार और मंडी भाव के आधार पर शुद्ध लाभ, प्रति एकड़ मुनाफा और ब्रेक-ईवन मूल्य का सटीक आकलन।'
              : 'Interactive cost modeling for Indian smallholders. Calculate net revenue, ROI, and break-even points before sowing.'}
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="flex items-center justify-center gap-2 bg-emerald-950/60 hover:bg-emerald-950/90 text-emerald-200 border border-emerald-500/30 px-4 py-2.5 rounded-2xl transition-all cursor-pointer text-xs font-bold shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-xs font-semibold text-stone-500 mb-1">Total Investment (कुल लागत)</div>
          <div className="text-2xl font-bold text-stone-900 font-display">
            ₹{Math.round(results.totalCost).toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">₹{Math.round(results.costPerAcre).toLocaleString()} / acre</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-xs font-semibold text-stone-500 mb-1">Gross Revenue (कुल बिक्री)</div>
          <div className="text-2xl font-bold text-stone-900 font-display">
            ₹{Math.round(results.grossRevenue).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">{results.totalYieldQuintals.toFixed(1)} Quintals total</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-xs font-semibold text-stone-500 mb-1">Net Seasonal Profit (शुद्ध लाभ)</div>
          <div className={`text-2xl font-bold font-display ${results.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            ₹{Math.round(results.netProfit).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">₹{Math.round(results.netProfitPerAcre).toLocaleString()} / acre</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-xs font-semibold text-stone-500 mb-1">Return on Investment (ROI %)</div>
          <div className="text-2xl font-bold text-emerald-700 font-display">
            {results.roi.toFixed(1)}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Healthy crop margin</div>
        </div>
      </div>

      {/* Main Grid: Inputs vs Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Sliders and Inputs */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-green-700" />
              <span>Input Parameters & Acreage</span>
            </h2>
            <select
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 focus:outline-hidden"
            >
              <option value="BT Cotton">BT Cotton (कपास)</option>
              <option value="Groundnut">Groundnut (मूंगफली)</option>
              <option value="Wheat">Wheat (गेहूँ)</option>
              <option value="Mustard">Mustard (सरसों)</option>
              <option value="Soybean">Soybean (सोयाबीन)</option>
            </select>
          </div>

          <div className="space-y-4">
            {/* Land Area */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Farm Cultivation Area (एकड़)</span>
                <span className="text-green-700 font-display text-sm">{farmSizeAcres} Acres</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={farmSizeAcres}
                onChange={(e) => setFarmSizeAcres(parseFloat(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            {/* Expected Yield */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Expected Yield per Acre (क्विंटल प्रति एकड़)</span>
                <span className="text-green-700 font-display text-sm">{expectedYieldPerAcre} Qtl / Acre</span>
              </div>
              <input
                type="range"
                min="3"
                max="40"
                step="0.5"
                value={expectedYieldPerAcre}
                onChange={(e) => setExpectedYieldPerAcre(parseFloat(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            {/* Expected Price */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Expected Selling Price (भाव प्रति क्विंटल)</span>
                <span className="text-green-700 font-display text-sm">₹{sellingPricePerQuintal} / Qtl</span>
              </div>
              <input
                type="range"
                min="2000"
                max="12000"
                step="50"
                value={sellingPricePerQuintal}
                onChange={(e) => setSellingPricePerQuintal(parseInt(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            {/* Cost Breakdown Inputs Grid */}
            <div className="pt-4 border-t border-stone-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                Cost of Cultivation per Acre (₹ / एकड़ लागत)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 mb-1">Seeds & Nursery</label>
                  <input
                    type="number"
                    value={seedCost}
                    onChange={(e) => setSeedCost(parseInt(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-medium text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1">Fertilizers & Nutrients</label>
                  <input
                    type="number"
                    value={fertilizerCost}
                    onChange={(e) => setFertilizerCost(parseInt(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-medium text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1">Pesticides & Bio-agents</label>
                  <input
                    type="number"
                    value={pesticideCost}
                    onChange={(e) => setPesticideCost(parseInt(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-medium text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1">Labour & Weeding</label>
                  <input
                    type="number"
                    value={labourCost}
                    onChange={(e) => setLabourCost(parseInt(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-medium text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1">Irrigation & Power</label>
                  <input
                    type="number"
                    value={irrigationCost}
                    onChange={(e) => setIrrigationCost(parseInt(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-medium text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1">Machinery & Tillage</label>
                  <input
                    type="number"
                    value={machineryCost}
                    onChange={(e) => setMachineryCost(parseInt(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-medium text-stone-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chart & Break-Even Metrics */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pie Chart Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
            <h3 className="font-bold text-stone-900 text-sm mb-2 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-700" />
              <span>Investment Distribution</span>
            </h3>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={results.breakdownData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {results.breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`₹${Math.round(value).toLocaleString()}`, 'Expenditure']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 mt-2">
              {results.breakdownData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Break-even & Safety Metrics */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Break-Even Safety Metrics</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-2xl border border-emerald-200/60">
                <div className="text-stone-500 text-[10px] uppercase font-bold">Break-Even Price</div>
                <div className="text-lg font-bold text-stone-900 font-display mt-0.5">
                  ₹{Math.round(results.breakEvenPrice)} <span className="text-xs font-normal">/ Qtl</span>
                </div>
                <div className="text-[10px] text-stone-500">Minimum sell rate to avoid loss</div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-emerald-200/60">
                <div className="text-stone-500 text-[10px] uppercase font-bold">Break-Even Yield</div>
                <div className="text-lg font-bold text-stone-900 font-display mt-0.5">
                  {results.breakEvenYield.toFixed(1)} <span className="text-xs font-normal">Qtl / acre</span>
                </div>
                <div className="text-[10px] text-stone-500">Minimum yield needed</div>
              </div>
            </div>

            <div className="text-xs text-emerald-900 font-medium">
              💡 By aggregating seed & fertilizer purchase via <strong>Kisan Bhai Virtual Clusters</strong>, your total investment reduces by an average of 18-22%.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
