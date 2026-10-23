import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Leaf,
  Info,
  BookOpen,
  ArrowRight,
  UserCheck,
  Bot,
  Percent,
  Check,
  Activity,
  HeartHandshake,
  Sprout,
  ShieldAlert,
  Stethoscope,
  Printer,
  Clock,
  FlaskConical,
  SunMedium,
  Wind,
  Droplets,
  Calendar,
  FileText,
} from 'lucide-react';
import { DiseaseScanResult } from '../../../shared/types';
import { DoctorReportCardModal } from './DoctorReportCardModal';

interface DiseaseResultCardProps {
  result: DiseaseScanResult;
  onAskAi: (result: DiseaseScanResult) => void;
  onSaveToDiary: (result: DiseaseScanResult) => void;
  onConsultExpert: () => void;
  language?: string;
}

export const DiseaseResultCard: React.FC<DiseaseResultCardProps> = ({
  result,
  onAskAi,
  onSaveToDiary,
  onConsultExpert,
  language = 'en',
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [showDoctorReport, setShowDoctorReport] = useState(false);
  const [activeSolutionTab, setActiveSolutionTab] = useState<'both' | 'organic' | 'chemical'>('both');

  const getSeverityStyle = (severity: string) => {
    const s = severity?.toUpperCase();
    switch (s) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-600',
          label: 'Critical',
          icon: '🔴',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500',
          badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
          dot: 'bg-orange-600',
          label: 'High',
          icon: '🟠',
        };
      case 'MODERATE':
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-600',
          label: 'Moderate',
          icon: '🟡',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-500',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-600',
          label: 'Low',
          icon: '🟢',
        };
    }
  };

  const severityInfo = getSeverityStyle(result.severity);
  const chemicals = result.chemicalTreatments || [];
  const organics = result.organicTreatments || [];
  const timing = result.applicationTiming;

  const handleDiaryClick = () => {
    setIsSaved(true);
    onSaveToDiary(result);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
        {/* Result Header & Confidence Card */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-stone-100">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-green-700 px-2.5 py-0.5 rounded-md">
                <Leaf className="w-3 h-3" />
                <span>{result.cropName}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${severityInfo.badgeBg}`}
              >
                <span>{severityInfo.icon}</span>
                <span>Severity: {severityInfo.label}</span>
              </span>

              {result.isDemo && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  DEMO ANALYSIS
                </span>
              )}
            </div>

            <div className="text-xs text-stone-500 font-medium">Possible diagnosis:</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              {result.possibleDisease || result.pathogen.split('(')[0].trim()}
            </h2>
            {result.pathogen && (
              <p className="text-xs text-stone-600 font-mono italic">{result.pathogen}</p>
            )}
            {result.hindiName && (
              <p className="text-xs text-stone-500 font-medium">{result.hindiName}</p>
            )}
          </div>

          {/* Confidence Visualization Card */}
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl shrink-0 self-start sm:self-auto min-w-[160px] text-right">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Confidence
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                {result.confidenceScore}%
              </span>
            </div>

            {/* Visual Confidence Bar */}
            <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden my-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full transition-all duration-500"
                style={{ width: `${result.confidenceScore}%` }}
              />
            </div>

            <p className="text-[11px] text-stone-600 text-left leading-tight mt-2">
              {result.confidenceExplanation ||
                (result.confidenceScore >= 80
                  ? 'The AI is reasonably confident based on the visible symptoms, but this is not a laboratory diagnosis.'
                  : 'The AI is uncertain. Please upload a clearer image or consult an agriculture expert.')}
            </p>
          </div>
        </div>

        {/* Doctor Prescription Banner (Quick Access to Report Card to Show Doctor) */}
        <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white rounded-2xl p-4 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md border border-emerald-800/40">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  {language === 'hi' ? 'किसान डॉक्टर पर्चा तैयार है' : 'Krishi Doctor Prescription Slip Ready'}
                </span>
                <span className="text-[10px] bg-emerald-400 text-emerald-950 font-extrabold px-2 py-0.2 rounded-full">
                  Doctor Report Card
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5 max-w-xl leading-relaxed">
                {language === 'hi'
                  ? 'यह पर्चा अपने स्थानीय कृषि वैज्ञानिक, KVK डॉक्टर या खाद-दवा विक्रेता को दिखाकर प्रमाणित उपचार प्राप्त करें।'
                  : 'Clinical agronomy slip with dual solutions, timing, and diagnosis formatted to show your agriculture officer, KVK agronomist, or local dealer.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              id="view-doctor-report-btn"
              onClick={() => setShowDoctorReport(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>View Report Card (डॉक्टर पर्चा)</span>
            </button>
            <button
              id="print-doctor-report-btn"
              onClick={() => setShowDoctorReport(true)}
              className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl transition cursor-pointer"
              title="Print Prescription Slip"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Severity Guidance Alert */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${severityInfo.dot} animate-pulse`} />
            <span className="text-xs font-bold text-stone-800">
              Severity: {severityInfo.label}
            </span>
          </div>
          <span className="text-xs text-stone-600 font-medium">
            Monitor the crop closely and apply prescribed dual solutions at the right timing.
          </span>
        </div>

        {/* Symptoms Section */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <span>🔍</span>
            <span>
              {language === 'hi' ? 'किसान भाई ने क्या पहचाना' : 'What Kisan Bhai Detected'}
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.symptoms.map((symptom, idx) => (
              <div
                key={idx}
                className="text-xs text-stone-800 flex items-start gap-2.5 bg-stone-50/90 p-3 rounded-xl border border-stone-200/70"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{symptom}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Causes Section */}
        {result.causes && result.causes.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {language === 'hi' ? 'यह क्यों हो सकता है (संभावित कारण)' : 'Why it may be happening'}
              </span>
            </h3>
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-2">
              <ul className="space-y-1.5">
                {result.causes.map((cause, idx) => (
                  <li key={idx} className="text-xs text-amber-950 font-medium flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* DUAL PRESCRIPTION SOLUTIONS (Organic & Chemical Regimens) */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2">
            <div>
              <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <span>💊</span>
                <span>
                  {language === 'hi'
                    ? 'रोग उपचार: जैविक एवं रासायनिक दोनों समाधान'
                    : 'Disease Solutions: Both Organic & Chemical Regimens'}
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                Choose the certified biological eco-approach or fast-acting targeted agrochemicals
              </p>
            </div>

            {/* Filter Pill Tabs */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setActiveSolutionTab('both')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeSolutionTab === 'both'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Both Solutions
              </button>
              <button
                onClick={() => setActiveSolutionTab('organic')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  activeSolutionTab === 'organic'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-800 hover:text-emerald-950'
                }`}
              >
                <Sprout className="w-3 h-3" />
                <span>Organic</span>
              </button>
              <button
                onClick={() => setActiveSolutionTab('chemical')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  activeSolutionTab === 'chemical'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-blue-800 hover:text-blue-950'
                }`}
              >
                <FlaskConical className="w-3 h-3" />
                <span>Chemical</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Organic Solutions Column */}
            {(activeSolutionTab === 'both' || activeSolutionTab === 'organic') && (
              <div
                className={`bg-emerald-50/70 border-2 border-emerald-300/80 rounded-2xl p-4 sm:p-4 space-y-3 ${
                  activeSolutionTab === 'organic' ? 'lg:col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Sprout className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950">
                        {language === 'hi' ? '🌱 जैविक समाधान (ORGANIC SOLUTIONS)' : '🌱 ORGANIC & BIOLOGICAL SOLUTIONS'}
                      </h4>
                      <span className="text-[11px] text-emerald-800 font-medium">Safe for honeybees & zero chemical residue</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    Eco-Certified
                  </span>
                </div>

                {organics.length > 0 ? (
                  <div className="space-y-3">
                    {organics.map((org, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-3.5 border border-emerald-200 space-y-1.5 shadow-xs">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-emerald-950 leading-snug">{org.name}</span>
                          {org.estimatedCost && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                              {org.estimatedCost}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-stone-700">
                          <span className="font-semibold text-emerald-900">Bio-Agent: </span>
                          {org.bioAgentOrBotanical}
                        </div>

                        <div className="text-xs bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-emerald-950">
                          <span className="font-bold">Dosage: </span>
                          {org.dosage}
                        </div>

                        <div className="text-[11px] text-stone-600">
                          <span className="font-semibold text-stone-800">Preparation: </span>
                          {org.preparationMethod}
                        </div>

                        <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 pt-1 border-t border-stone-100">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{org.ecoBenefit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-3 text-xs text-stone-700 space-y-1">
                    {(result.recommendedOrganic || [
                      'Sour buttermilk (chaas 5L in 100L water) fermented with copper vessel contact',
                      'Foliar spray of Pseudomonas fluorescens @ 10g/L during early morning',
                    ]).map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chemical Solutions Column */}
            {(activeSolutionTab === 'both' || activeSolutionTab === 'chemical') && (
              <div
                className={`bg-blue-50/70 border-2 border-blue-300/80 rounded-2xl p-4 sm:p-4 space-y-3 ${
                  activeSolutionTab === 'chemical' ? 'lg:col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-950">
                        {language === 'hi' ? '🧪 रासायनिक समाधान (CHEMICAL SOLUTIONS)' : '🧪 TARGETED CHEMICAL SOLUTIONS'}
                      </h4>
                      <span className="text-[11px] text-blue-800 font-medium">Curative intervention for urgent suppression</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                    Curative
                  </span>
                </div>

                {chemicals.length > 0 ? (
                  <div className="space-y-3">
                    {chemicals.map((chem, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-3.5 border border-blue-200 space-y-1.5 shadow-xs">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-blue-950 leading-snug">{chem.name}</span>
                          {chem.estimatedCost && (
                            <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                              {chem.estimatedCost}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-stone-700">
                          <span className="font-semibold text-blue-900">Active Ingredient: </span>
                          {chem.activeIngredient}
                        </div>

                        <div className="text-xs bg-blue-50 p-2 rounded-lg border border-blue-200 text-blue-950">
                          <span className="font-bold">Dosage: </span>
                          {chem.dosage}
                        </div>

                        <div className="text-[11px] text-stone-600">
                          <span className="font-semibold text-stone-800">Guidelines: </span>
                          {chem.sprayGuidelines}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1 border-t border-stone-100">
                          <span className="font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Waiting Period (PHI): {chem.waitingPeriodDays}
                          </span>
                          <span className="text-stone-600 italic">
                            Safety: {chem.safetyPrecautions}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-3 text-xs text-stone-700 space-y-1">
                    {(result.recommendedChemical || [
                      'Propiconazole 25% EC @ 1 ml/L or Mancozeb 75% WP @ 2.5 g/L',
                    ]).map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* TIMING TO BETTER: Optimal Application Timing & Recovery Schedule */}
        <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-4 sm:p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-amber-950 tracking-wider">
                  {language === 'hi' ? '⏰ दवा छिड़काव का सही समय (TIMING FOR BETTER RESULTS)' : '⏰ OPTIMAL TIMING FOR BETTER TREATMENT RESULTS'}
                </h4>
                <p className="text-[11px] text-amber-800 font-medium">
                  Applying at the right hour ensures maximum leaf absorption and protects crop yield
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
              Golden Window
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Card 1: Golden Hour */}
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <SunMedium className="w-4 h-4 text-amber-600" />
                <span>Golden Time of Day</span>
              </div>
              <div className="text-xs font-black text-stone-900 bg-amber-100/70 p-2 rounded-lg">
                {timing?.bestTimeOfDay || 'Early Morning (6:00 - 8:30 AM) or Late Afternoon (4:30 - 6:30 PM)'}
              </div>
              <p className="text-[11px] text-stone-600 leading-snug">
                {timing?.timingReason || 'Prevents rapid solar UV breakdown of chemicals, avoids leaf scorching, and protects pollinating honeybees.'}
              </p>
            </div>

            {/* Card 2: Weather Rules */}
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <Wind className="w-4 h-4 text-blue-600" />
                <span>Weather Safety Parameters</span>
              </div>
              <ul className="text-[11px] space-y-1 text-stone-700">
                <li className="flex items-center justify-between border-b border-stone-100 pb-0.5">
                  <span>Temperature:</span>
                  <span className="font-bold text-stone-900">{timing?.weatherConditions.temperatureRange || '18°C - 26°C'}</span>
                </li>
                <li className="flex items-center justify-between border-b border-stone-100 pb-0.5">
                  <span>Wind Speed:</span>
                  <span className="font-bold text-stone-900">{timing?.weatherConditions.windSpeedLimit || '< 8-10 km/h (Calm)'}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Rainfastness:</span>
                  <span className="font-bold text-emerald-800">{timing?.weatherConditions.rainfastnessHours || '4 to 6 hrs dry period'}</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Interval & Recovery */}
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <Droplets className="w-4 h-4 text-emerald-600" />
                <span>Spray Cadence & Milestones</span>
              </div>
              <div className="text-xs font-black text-emerald-900 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                {timing?.sprayIntervalDays || 'Organic: 5-7 days | Chemical: 10-14 days'}
              </div>
              <p className="text-[11px] text-stone-600">
                {timing?.expectedRecoveryTimeline.day1to2 || 'Day 1-2: Sporulation stops. Day 7-10: New healthy green leaves emerge.'}
              </p>
            </div>
          </div>
        </div>

        {/* Recommended Action: What You Can Do */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              {language === 'hi' ? '🌱 आप क्या कर सकते हैं (सुरक्षित कदम)' : '🌱 What You Can Do (Field Practices)'}
            </span>
          </h3>
          <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 sm:p-4 space-y-2.5">
            <ol className="space-y-2">
              {(result.recommendedAction || [
                'Inspect nearby plants for similar symptoms.',
                'Remove severely affected plant material where appropriate.',
                'Improve field airflow/drainage if relevant.',
                'Avoid unnecessary irrigation.',
                'Consult a local agriculture expert before applying treatment.',
              ]).map((step, idx) => (
                <li key={idx} className="text-xs text-emerald-950 font-medium flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Prevention: How to Prevent It */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
            <span>
              {language === 'hi' ? '🛡 रोग की रोकथाम कैसे करें' : '🛡 How to Prevent It'}
            </span>
          </h3>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
            <ul className="space-y-2">
              {result.preventionSteps.map((prev, idx) => (
                <li key={idx} className="text-xs text-stone-800 font-medium flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-500 mt-1.5 shrink-0" />
                  <span>{prev}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Multiple Possibilities (Differential Diagnosis) */}
        {result.differentialPossibilities && result.differentialPossibilities.length > 0 && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {language === 'hi' ? 'अन्य संभावित समस्याएं (संभावनाएं)' : 'Possible Issues (Differential Analysis)'}
                </span>
              </h3>
              <span className="text-[11px] text-stone-500">Model Probability Distribution</span>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2.5">
              {result.differentialPossibilities.map((diff, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className={diff.isPrimary ? 'font-bold text-stone-900' : 'text-stone-700'}>
                      {idx + 1}. {diff.issue}
                    </span>
                    <span className="font-bold text-emerald-800 font-mono">{diff.probabilityPct}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        diff.isPrimary ? 'bg-emerald-600' : 'bg-stone-400'
                      }`}
                      style={{ width: `${diff.probabilityPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Action Hub: Ask Kisan Bhai, Doctor Report, Save to Diary & Expert */}
        <div className="space-y-4 pt-4 border-t border-stone-200/80">
          {/* Ask Kisan Bhai Card */}
          <div className="bg-emerald-950 text-white rounded-2xl p-4 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-bold text-emerald-300 flex items-center justify-center sm:justify-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Want to know more?</span>
              </div>
              <p className="text-xs text-emerald-100/90 max-w-md">
                Ask Kisan Bhai AI copilot for custom home organic decoctions, regional weather impact, or step-by-step guidance.
              </p>
            </div>

            <button
              onClick={() => onAskAi(result)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Kisan Bhai 🤖</span>
            </button>
          </div>

          {/* Action Buttons: Doctor Report Card, Save to Diary & Expert Connect */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              id="action-view-doctor-report-btn"
              onClick={() => setShowDoctorReport(true)}
              className="flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-sm"
            >
              <Stethoscope className="w-4 h-4 text-emerald-200" />
              <span>Doctor Report Slip (पर्चा)</span>
            </button>

            <button
              onClick={handleDiaryClick}
              disabled={isSaved}
              className={`flex items-center justify-center gap-2 py-3.5 px-4 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-green-700 hover:bg-green-800 text-white shadow-sm'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Saved to Farm Diary</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span>Save to Farm Diary</span>
                </>
              )}
            </button>

            <button
              onClick={onConsultExpert}
              className="flex items-center justify-center gap-2 py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl border border-stone-200 transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>Talk to Agriculture Expert</span>
            </button>
          </div>

          {/* Advisory Disclaimer */}
          <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-500 flex items-start gap-2 border border-stone-200/60">
            <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <span>
              {result.advisoryDisclaimer ||
                'AI results are advisory. For serious or spreading crop problems, consult a qualified agriculture professional.'}
            </span>
          </div>
        </div>
      </div>

      {/* Clinical Doctor Prescription Report Card Modal */}
      <DoctorReportCardModal
        result={result}
        isOpen={showDoctorReport}
        onClose={() => setShowDoctorReport(false)}
        language={language}
      />
    </>
  );
};

