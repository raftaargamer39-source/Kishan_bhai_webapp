import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Droplets,
  Power,
  CloudRain,
  Sun,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
  TrendingDown,
  Info,
  Calendar,
  Plus,
  Radio,
  Sliders,
  RotateCcw,
  Zap,
  Gauge,
  Bot,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertTriangle,
  Play,
  X,
  FileText,
  DollarSign,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  Legend,
} from 'recharts';
import { SmartIrrigationStatus, IoTSensor, IrrigationRecord, WaterAnalytics } from '../../shared/types';

export const SmartIrrigationPage: React.FC = () => {
  const { farmerProfile, currentUser } = useUserStore();
  const { irrigationStatus: initialStatus, togglePump: contextTogglePump, language, setCurrentView, askAiWithPrompt, addDiaryEntry, addToast } = useApp();

  const [status, setStatus] = useState<SmartIrrigationStatus>(initialStatus);
  const [sensors, setSensors] = useState<IoTSensor[]>(initialStatus.sensors || []);
  const [history, setHistory] = useState<IrrigationRecord[]>(initialStatus.history || []);
  const [analytics, setAnalytics] = useState<WaterAnalytics | undefined>(initialStatus.analytics);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<'RAIN_DELAY' | 'DRY' | 'WET' | 'OFFLINE'>('RAIN_DELAY');
  const [isPumpRunning, setIsPumpRunning] = useState<boolean>(initialStatus.pumpStatus === 'RUNNING');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDemoStepper, setShowDemoStepper] = useState<boolean>(false);
  const [stepperStep, setStepperStep] = useState<number>(1);

  // Manual irrigation form state
  const [newDuration, setNewDuration] = useState<number>(35);
  const [newVolume, setNewVolume] = useState<number>(1400);
  const [newCrop, setNewCrop] = useState<string>(farmerProfile?.mainCrop?.split('&')[0]?.trim() || 'Cotton (Bt)');
  const [newField, setNewField] = useState<string>('Plot 1B (North Acre)');
  const [newMethod, setNewMethod] = useState<string>('Drip Micro-Emitter');
  const [newNotes, setNewNotes] = useState<string>('Standard irrigation cycle completed.');

  // Fetch status from API on load
  const fetchStatus = () => {
    fetch('/api/irrigation/status')
      .then((res) => res.json())
      .then((data: SmartIrrigationStatus) => {
        setStatus(data);
        if (data.sensors) setSensors(data.sensors);
        if (data.history) setHistory(data.history);
        if (data.analytics) setAnalytics(data.analytics);
        setIsPumpRunning(data.pumpStatus === 'RUNNING');
        setIsDemoMode(!!data.isDemoSensorMode);
      })
      .catch((err) => console.error('Failed to fetch irrigation status:', err));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTogglePump = async () => {
    const nextState = isPumpRunning ? 'IDLE' : 'RUNNING';
    setIsPumpRunning(!isPumpRunning);
    contextTogglePump();

    try {
      await fetch('/api/irrigation/pump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextState }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulatePreset = async (preset: 'RAIN_DELAY' | 'DRY' | 'WET' | 'OFFLINE') => {
    setActivePreset(preset);
    try {
      const res = await fetch('/api/sensors/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset }),
      });
      const data = await res.json();
      if (data.success && data.status) {
        setStatus(data.status);
        if (data.status.sensors) setSensors(data.status.sensors);
        addToast(
          'Simulation Preset Applied',
          preset === 'RAIN_DELAY'
            ? 'Scenario: Adequate moisture + 70% rain forecast -> Rain Delay Active'
            : preset === 'DRY'
            ? 'Scenario: Dry soil (22%) + Low rain -> YES, Irrigation Needed'
            : preset === 'WET'
            ? 'Scenario: Saturated soil (62%) -> NO, Adequate Buffer'
            : 'Scenario: Sensor telemetry offline -> Fallback to Agro Models',
          'info'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleDemoMode = async () => {
    const next = !isDemoMode;
    setIsDemoMode(next);
    try {
      await fetch('/api/sensors/toggle-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: next }),
      });
      addToast(
        next ? 'Demo Sensor Mode Enabled' : 'Live Sensor Mode Enabled',
        next ? 'Simulated IoT sensor readings enabled for testing & presentation.' : 'Displaying real connected hardware sensor telemetry.',
        'info'
      );
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddIrrigation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/irrigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationMinutes: newDuration,
          waterVolumeLitres: newVolume,
          crop: newCrop,
          fieldName: newField,
          method: newMethod,
          notes: newNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHistory([data.record, ...history]);
        // Also save to diary
        addDiaryEntry({
          date: new Date().toISOString().split('T')[0],
          category: 'Irrigation',
          title: `Smart Irrigation: ${newCrop} (${newDuration} mins)`,
          crop: newCrop,
          notes: `${newVolume} Litres via ${newMethod} on ${newField}. ${newNotes}`,
          expenseAmountInr: Math.round(newDuration * 4.5),
        });
        setShowAddModal(false);
        addToast('Irrigation Logged', 'Session recorded and synchronized with Farm Diary.', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Hackathon demo tour runner step controller
  const executeStepperAction = (step: number) => {
    setStepperStep(step);
    if (step === 1) {
      setCurrentView('farmer-dashboard');
    } else if (step === 2) {
      setCurrentView('weather');
    } else if (step === 3) {
      setCurrentView('smart-irrigation');
    } else if (step === 4 || step === 5 || step === 6) {
      handleSimulatePreset('RAIN_DELAY');
    } else if (step === 7 || step === 8) {
      askAiWithPrompt('Should I water my wheat today considering tomorrow\'s 70% rain forecast?');
    } else if (step === 9) {
      addDiaryEntry({
        date: new Date().toISOString().split('T')[0],
        category: 'Irrigation',
        title: 'AI Decision: Irrigation Delayed Due to Rain Forecast',
        crop: 'Cotton & Wheat',
        notes: 'AI verified 38% soil moisture with 70% rain forecast. Held off 45-min irrigation run. Estimated 2,100 L water saved.',
        expenseAmountInr: 0,
      });
      addToast('Demo Flow Completed', 'AI irrigation decision saved to Farm Diary.', 'success');
    }
  };

  const shouldIrrigate = status.irrigationRequired;
  const isRainDelay = status.rainForecast48hPct >= 45;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* HACKATHON DEMO FLOW STEPPER BANNER */}
      <div className="bg-stone-900 text-white rounded-2xl p-4 border border-stone-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-stone-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Play className="w-3 h-3 fill-current" />
              Interactive Hackathon Demo Flow
            </span>
            <span className="text-xs text-stone-400 font-medium hidden sm:inline">
              9-Step Complete End-to-End Walkthrough
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-toggle-demo-stepper"
              onClick={() => setShowDemoStepper(!showDemoStepper)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
            >
              {showDemoStepper ? 'Hide Stepper' : 'Show 9-Step Guide'}
            </button>
            <button
              type="button"
              id="btn-run-full-flow"
              onClick={() => executeStepperAction(7)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI Demo Query</span>
            </button>
          </div>
        </div>

        {showDemoStepper && (
          <div className="pt-3 border-t border-stone-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 text-[11px]">
              {[
                { s: 1, title: '1. Dashboard', desc: 'Open home summary' },
                { s: 2, title: '2. Rain Forecast', desc: 'Show 70% rain chance' },
                { s: 3, title: '3. Smart Irrigation', desc: 'Open irrigation view' },
                { s: 4, title: '4. Soil Moisture', desc: 'Check 38% moisture' },
                { s: 5, title: '5. AI Decision', desc: 'NO — Delay advised' },
                { s: 6, title: '6. Explain Reason', desc: 'Prevent waterlogging' },
                { s: 7, title: '7. Ask Kisan Bhai', desc: '"Should I water wheat?"' },
                { s: 8, title: '8. AI Advisory', desc: 'Custom recommendation' },
                { s: 9, title: '9. Farm Diary', desc: 'Log water saved' },
              ].map((stepItem) => (
                <button
                  key={stepItem.s}
                  type="button"
                  id={`step-btn-${stepItem.s}`}
                  onClick={() => executeStepperAction(stepItem.s)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    stepperStep === stepItem.s
                      ? 'bg-emerald-500 text-stone-950 border-emerald-400 font-bold shadow-xs'
                      : 'bg-stone-800/80 hover:bg-stone-800 text-stone-300 border-stone-700'
                  }`}
                >
                  <div className="font-bold truncate">{stepItem.title}</div>
                  <div className="text-[10px] opacity-80 truncate">{stepItem.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 1. PAGE HEADER */}
      <div className="bg-gradient-to-br from-[#1b3811] via-[#244b17] to-[#12280a] text-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-emerald-500/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5" />
              Smart Irrigation Intelligence
            </span>
            {isDemoMode ? (
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-amber-400/30 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                Demo Sensor Mode
              </span>
            ) : (
              <span className="bg-emerald-400/20 text-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400" />
                Live Node Telemetry
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
            <span>💧</span> Smart Irrigation
          </h1>
          <p className="text-stone-200 text-sm sm:text-base max-w-2xl font-medium">
            &ldquo;Give your crop the water it needs — not more, not less.&rdquo;
          </p>
        </div>

        {/* Live Solar Pump Controller in Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-3 bg-emerald-950/70 border border-emerald-500/40 p-3 rounded-2xl backdrop-blur-md">
            <button
              type="button"
              id="btn-toggle-solar-pump"
              onClick={handleTogglePump}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                isPumpRunning
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-stone-950'
              }`}
              title={isPumpRunning ? 'Stop Smart Pump' : 'Start Smart Pump'}
            >
              <Power className="w-6 h-6" />
            </button>
            <div className="text-xs pr-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>{isPumpRunning ? 'PUMP ACTIVE' : 'PUMP IDLE'}</span>
                <span className={`w-2 h-2 rounded-full ${isPumpRunning ? 'bg-emerald-400 animate-ping' : 'bg-stone-400'}`}></span>
              </div>
              <div className="text-emerald-200/80 text-[11px]">
                {isPumpRunning ? 'Drip Micro-Cycle in Progress' : '5 HP Solar Tubewell (Standby)'}
              </div>
            </div>
          </div>

          <button
            type="button"
            id="btn-open-add-irrigation-modal"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Irrigation</span>
          </button>
        </div>
      </div>

      {/* 2. TELEMETRY SUMMARY BAR */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
          {/* Soil Moisture */}
          <div className="pt-2 sm:pt-0 sm:px-2 space-y-0.5">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Soil Moisture</span>
            <span className="text-2xl font-extrabold text-stone-900 font-display block">{status.soilMoisturePct}%</span>
            <span className="text-[11px] font-medium text-stone-500 block">Optimal: 35-55%</span>
          </div>

          {/* Crop */}
          <div className="pt-2 sm:pt-0 sm:px-2 space-y-0.5">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Target Crop</span>
            <span className="text-base font-bold text-stone-900 truncate block">{status.activeCropName || 'Cotton (Bt)'}</span>
            <span className="text-[11px] font-medium text-emerald-700 block">Main Cultivation</span>
          </div>

          {/* Crop Stage */}
          <div className="pt-2 sm:pt-0 sm:px-2 space-y-0.5">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Growth Stage</span>
            <span className="text-xs font-bold text-stone-800 line-clamp-2 block leading-tight pt-1">
              Flowering & Boll Setting
            </span>
            <span className="text-[10px] text-amber-700 font-medium block">Water-Sensitive</span>
          </div>

          {/* Temperature */}
          <div className="pt-2 sm:pt-0 sm:px-2 space-y-0.5">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Temperature</span>
            <span className="text-2xl font-extrabold text-stone-900 font-display block">
              {status.temperatureC || 31}°C
            </span>
            <span className="text-[11px] font-medium text-stone-500 block">High Solar Index</span>
          </div>

          {/* Rain Forecast */}
          <div className="pt-2 sm:pt-0 sm:px-2 space-y-0.5">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Rain Forecast</span>
            <span className={`text-2xl font-extrabold font-display block ${isRainDelay ? 'text-blue-700 font-black' : 'text-green-700'}`}>
              {status.rainForecast48hPct}%
            </span>
            <span className={`text-[11px] font-bold block ${isRainDelay ? 'text-blue-800' : 'text-stone-500'}`}>
              {isRainDelay ? 'Rain Delay Active' : 'Low Probability'}
            </span>
          </div>

          {/* Last Irrigation */}
          <div className="pt-2 sm:pt-0 sm:px-2 space-y-0.5">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Last Irrigation</span>
            <span className="text-xs font-bold text-stone-800 block pt-1">Yesterday, 6:00 PM</span>
            <span className="text-[11px] text-stone-500 block">35 min (1,400 L)</span>
          </div>

          {/* Water Requirement */}
          <div className="pt-2 sm:pt-0 sm:px-2 space-y-0.5">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Water Demand</span>
            <span className="text-base font-extrabold text-green-700 block">
              {shouldIrrigate ? '3,800 L' : '0 L (Deferred)'}
            </span>
            <span className="text-[11px] text-stone-500 block">per acre cycle</span>
          </div>
        </div>
      </div>

      {/* 3. PROMINENT "SHOULD YOU IRRIGATE?" CENTERPIECE & IRRIGATION SCORE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Decision Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Hyperlocal Agro-Decision Engine
              </span>
              <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full font-mono">
                Rule + AI Synthesis
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900">
              Should You Irrigate?
            </h2>

            {/* High Contrast Decision Banner */}
            <div
              className={`p-6 rounded-2xl border text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
                !shouldIrrigate
                  ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                  : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              }`}
            >
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold font-display flex items-center justify-center sm:justify-start gap-2">
                  {!shouldIrrigate ? (
                    <>
                      <CloudRain className="w-8 h-8 text-blue-600 shrink-0" />
                      <span>NO — Irrigation Not Recommended</span>
                    </>
                  ) : (
                    <>
                      <Droplets className="w-8 h-8 text-emerald-600 shrink-0" />
                      <span>YES — Irrigation Recommended</span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-stone-700 max-w-xl">
                  {status.decisionReason}
                </p>
              </div>

              <div className="shrink-0 bg-white/90 px-4 py-3 rounded-2xl border border-current shadow-2xs text-center">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Confidence</span>
                <span className="text-2xl font-black font-display text-stone-900">96%</span>
              </div>
            </div>

            {/* Recommended Schedule Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60">
                <span className="text-[10px] uppercase font-bold text-stone-500 block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  Recommended Time
                </span>
                <span className="text-xs font-bold text-stone-800 block pt-1">
                  {status.bestIrrigationTime}
                </span>
              </div>

              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60">
                <span className="text-[10px] uppercase font-bold text-stone-500 block flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-stone-400" />
                  Duration & Volume
                </span>
                <span className="text-xs font-bold text-stone-800 block pt-1">
                  {shouldIrrigate ? `${status.recommendedDurationMinutes} mins (3,800 L)` : '0 mins (No cycle)'}
                </span>
              </div>

              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60">
                <span className="text-[10px] uppercase font-bold text-stone-500 block flex items-center gap-1">
                  <Activity className="w-3 h-3 text-stone-400" />
                  Method & Priority
                </span>
                <span className="text-xs font-bold text-stone-800 block pt-1">
                  Drip Micro-Emitter ({status.priority || 'Medium'} Priority)
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              id="btn-ask-ai-irrigation"
              onClick={() => askAiWithPrompt('Should I water my wheat today considering tomorrow\'s weather and 38% soil moisture?')}
              className="w-full sm:w-auto flex-1 py-3.5 px-5 bg-green-700 hover:bg-green-800 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Bot className="w-4 h-4 text-emerald-300" />
              <span>Ask Kisan Bhai about Irrigation</span>
            </button>

            <button
              type="button"
              id="btn-view-weather-forecast-link"
              onClick={() => setCurrentView('weather')}
              className="w-full sm:w-auto py-3.5 px-5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View 7-Day Rain Forecast</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Irrigation Score Card & 24h Soil Moisture Curve (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Irrigation Score */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Droplets className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-stone-900 text-sm">Irrigation Score</h3>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                Water Status: 78 / 100
              </span>
            </div>

            {/* Score Breakdown Pills */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 flex items-center justify-between">
                <span className="text-stone-600 font-medium">Soil Moisture</span>
                <span className="font-bold text-emerald-700">Good (38%)</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 flex items-center justify-between">
                <span className="text-stone-600 font-medium">Rain Forecast</span>
                <span className="font-bold text-blue-700">{isRainDelay ? 'Rain Delay Active' : 'Safe Window'}</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 flex items-center justify-between">
                <span className="text-stone-600 font-medium">Crop Demand</span>
                <span className="font-bold text-amber-700">Moderate</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 flex items-center justify-between">
                <span className="text-stone-600 font-medium">Temperature</span>
                <span className="font-bold text-stone-800">High (31°C)</span>
              </div>
            </div>
          </div>

          {/* 24-Hour Soil Moisture Trend Chart */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">24-Hour Soil Moisture Curve</h3>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                Optimal Zone: 50%
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={status.hourlyMoistureCurve}>
                  <defs>
                    <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                  <YAxis domain={[15, 75]} stroke="#94a3b8" fontSize={10} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <ReferenceLine y={50} stroke="#059669" strokeDasharray="3 3" label="Threshold (50%)" />
                  <Area
                    type="monotone"
                    dataKey="moisturePct"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#moistureGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1">
              <span>Root-Zone Capacitive Probe (S-104)</span>
              <span className="font-semibold text-stone-700">Depth: 25 cm</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SENSOR SUPPORT & IOT DASHBOARD */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Hardware Node Telemetry
              </span>
              <span className="text-xs text-stone-500 font-medium">Multi-Layer Field IoT Sensor Grid</span>
            </div>
            <h2 className="text-2xl font-extrabold font-display text-stone-900 mt-1">
              Connected IoT Farm Sensors
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Real-time capacitive substrate sensors reporting root moisture, thermals, canopy humidity, salinity, and pH.
            </p>
          </div>

          {/* Demo Sensor Mode Switch & Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-toggle-demo-sensor-mode"
              onClick={handleToggleDemoMode}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDemoMode
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isDemoMode ? 'Demo Mode Active' : 'Enable Demo Sensors'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Scenario Presets */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            Quick Simulation Presets:
          </span>
          {[
            { key: 'RAIN_DELAY', label: '🌧 Impending Rain (70% Rain Delay)' },
            { key: 'DRY', label: '🏜 Dry Root Stress (22% moisture)' },
            { key: 'WET', label: '💧 Saturated Soil (62% moisture)' },
            { key: 'OFFLINE', label: '⚠️ Sensor Offline Fallback' },
          ].map((preset) => (
            <button
              key={preset.key}
              type="button"
              id={`btn-preset-${preset.key.toLowerCase()}`}
              onClick={() => handleSimulatePreset(preset.key as any)}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activePreset === preset.key
                  ? 'bg-green-700 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* 5 Sensors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {sensors.map((sensor) => {
            const isOnline = sensor.status === 'ONLINE';
            const isDelayed = sensor.status === 'DELAYED';
            return (
              <div
                key={sensor.id}
                className="p-4 rounded-2xl border border-stone-200/80 bg-white hover:border-emerald-500/40 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-stone-400 truncate max-w-[120px]">
                      {sensor.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isOnline
                          ? 'bg-emerald-100 text-emerald-800'
                          : isDelayed
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-600 animate-pulse' : isDelayed ? 'bg-amber-600' : 'bg-rose-600'}`}></span>
                      {sensor.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">{sensor.label}</h3>
                    <p className="text-[11px] text-stone-500 truncate">{sensor.location}</p>
                  </div>

                  <div className="py-1">
                    <div className="text-2xl font-extrabold text-stone-900 font-display">
                      {isOnline || isDelayed ? (
                        <>
                          {sensor.value} <span className="text-xs font-normal text-stone-500">{sensor.unit}</span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-rose-600">Packet Lost</span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-600 leading-tight">
                    {sensor.interpretation}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-400 flex items-center justify-between">
                  <span>Battery: {sensor.batteryPct}%</span>
                  <span>{sensor.depthCm ? `Depth: ${sensor.depthCm}cm` : sensor.lastReadingTime}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Offline sensor fallback notice */}
        {sensors.some((s) => s.status === 'OFFLINE') && (
          <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 text-xs text-amber-950 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Sensor Telemetry Notice:</strong> Moisture probe S-104 is currently offline. Kisan Bhai is automatically using historical depletion curve models and Open-Meteo satellite rain forecasts to maintain accurate recommendations.
            </span>
          </div>
        )}
      </div>

      {/* 5. WATER USAGE ANALYTICS & SAVINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily & Weekly Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-xl font-bold font-display text-stone-900">
                Water Usage Analytics & Conservation
              </h2>
              <p className="text-xs text-stone-500">
                Daily actual consumption vs. traditional unoptimized flood irrigation baseline.
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
              2,300 L Saved This Week
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.dailyUsage || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit=" L" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="usedLitres" name="Actual Water Used (L)" fill="#059669" radius={[6, 6, 0, 0]} />
                <Bar dataKey="savedLitres" name="Water Saved (L)" fill="#60a5fa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Stat Card (4 cols) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-emerald-900 via-[#1b3811] to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-emerald-500/30 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-400/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
                Resource Impact
              </span>
            </div>

            <h3 className="text-xl font-bold font-display text-white">
              Estimated Monthly Savings
            </h3>

            <div className="space-y-3">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <span className="text-xs text-stone-300 font-medium block">Total Water Conserved</span>
                <div className="text-3xl font-extrabold text-white font-display">
                  18,400 <span className="text-sm font-normal text-emerald-200">Litres</span>
                </div>
                <span className="text-[11px] text-emerald-300">~4.8 groundwater tubewell hours saved</span>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <span className="text-xs text-stone-300 font-medium block">Pumping Energy & Diesel Cost Saved</span>
                <div className="text-3xl font-extrabold text-amber-300 font-display">
                  ₹2,450 <span className="text-sm font-normal text-stone-300">/ month</span>
                </div>
                <span className="text-[11px] text-stone-300">Based on Gujarat APMC solar tariff index</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            id="btn-ask-ai-savings"
            onClick={() => askAiWithPrompt('How can I further optimize my water usage and fertilizer injection via drip for cotton?')}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Optimization Plan</span>
          </button>
        </div>
      </div>

      {/* 6. IRRIGATION HISTORY TIMELINE */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-stone-900">
              Irrigation History Timeline
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Complete historical record of watering runs, auto-rain delays, and Farm Diary synchronizations.
            </p>
          </div>

          <button
            type="button"
            id="btn-add-irrigation-timeline"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Irrigation Log</span>
          </button>
        </div>

        {/* Timeline Items */}
        <div className="space-y-3">
          {history.map((item) => {
            const isRainSkipped = item.status === 'SKIPPED_RAIN';
            return (
              <div
                key={item.id}
                className={`p-4 sm:p-4 rounded-2xl border text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  isRainSkipped
                    ? 'bg-blue-50/60 border-blue-200'
                    : 'bg-stone-50/60 border-stone-200/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base font-bold ${
                      isRainSkipped ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isRainSkipped ? '🌧️' : '💧'}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{item.dateLabel}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isRainSkipped ? 'bg-blue-200 text-blue-900' : 'bg-emerald-200 text-emerald-900'
                        }`}
                      >
                        {isRainSkipped ? 'Auto Rain-Delay' : `${item.durationMinutes} min run`}
                      </span>
                      {item.savedToDiary && (
                        <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full font-medium">
                          Synced to Diary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 font-medium">
                      {item.crop} • {item.fieldName} • {item.method}
                    </p>
                    <p className="text-xs text-stone-500 pt-0.5">{item.notes}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-extrabold text-stone-900 font-display">
                    {isRainSkipped ? '0 L (Saved)' : `${item.waterVolumeLitres.toLocaleString()} L`}
                  </div>
                  <span className="text-[11px] text-stone-400">{item.loggedBy === 'AUTO_AI' ? 'Automated by AI' : 'Manual Entry'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: ADD MANUAL IRRIGATION */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-green-700 flex items-center justify-center font-bold">
                  <Droplets className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 font-display">Log Irrigation Session</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddIrrigation} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="360"
                    value={newDuration}
                    onChange={(e) => {
                      const mins = Number(e.target.value);
                      setNewDuration(mins);
                      setNewVolume(mins * 40); // 40 L / min estimation
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Est. Water Volume (Litres)</label>
                  <input
                    type="number"
                    value={newVolume}
                    onChange={(e) => setNewVolume(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Target Crop</label>
                <input
                  type="text"
                  value={newCrop}
                  onChange={(e) => setNewCrop(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Field Plot</label>
                  <input
                    type="text"
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Irrigation Method</label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Drip Micro-Emitter">Drip Micro-Emitter</option>
                    <option value="Micro-Sprinkler">Micro-Sprinkler</option>
                    <option value="Furrow Irrigation">Furrow Irrigation</option>
                    <option value="Basin Flood">Basin Flood</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Agronomic Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Fertigation completed, water applied in evening window."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>This log will automatically be added to your seasonal <strong>Farm Diary</strong>.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Irrigation Log</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
