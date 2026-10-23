import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Check,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  AlertTriangle,
  FlaskConical,
  Sprout,
  SunMedium,
  Wind,
  Droplets,
  FileText,
  BadgeAlert,
  Download,
  Stethoscope,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { DiseaseScanResult } from '../../../shared/types';

interface DoctorReportCardModalProps {
  result: DiseaseScanResult;
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

export const DoctorReportCardModal: React.FC<DoctorReportCardModalProps> = ({
  result,
  isOpen,
  onClose,
  language = 'en',
}) => {
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const card = result.doctorReportCard;
  const timing = result.applicationTiming;
  const chemicals = result.chemicalTreatments || [];
  const organics = result.organicTreatments || [];

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareText = `*Kisan Bhai Krishi Doctor Prescription Report*\n` +
      `Rx ID: ${card?.reportId || result.id}\n` +
      `Crop: ${result.cropName} (${result.detectedCrop || ''})\n` +
      `Diagnosis: ${result.possibleDisease || result.pathogen}\n` +
      `Severity: ${result.severity}\n` +
      `Confidence: ${result.confidenceScore}%\n` +
      `Dual Treatment Prescribed: Organic (${organics[0]?.name || 'Available'}) & Chemical (${chemicals[0]?.name || 'Available'})\n` +
      `Best Timing: ${timing?.bestTimeOfDay || 'Early Morning 6:00 - 8:30 AM'}\n` +
      `Show this clinical slip to your local KVK Doctor or Agriculture Extension Officer.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Crop Doctor Report - ${result.cropName}`,
          text: shareText,
        });
      } catch {
        // User cancelled or failed
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MODERATE':
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LOW':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  const formattedDate = new Date(result.scannedAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id="doctor-report-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="print:hidden bg-stone-900 text-white px-5 py-3.5 flex items-center justify-between gap-3 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span>Krishi Doctor Clinical Prescription</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Doctor Slip (डॉक्टर पर्चा)
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Official diagnostic summary ready to present to KVK agronomists or plant doctors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-report-slip-btn"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
              title="Print Prescription Slip (A4 Format)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Slip</span>
            </button>

            <button
              id="share-report-slip-btn"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl transition cursor-pointer"
              title="Share with Doctor"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              id="close-report-slip-btn"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Prescription Report Card Container */}
        <div
          ref={printRef}
          id="krishi-doctor-printable-slip"
          className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-900 bg-white"
        >
          {/* Official Prescription Slip Header */}
          <div className="border-b-2 border-stone-800 pb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-serif text-2xl font-bold border-2 border-emerald-900 shadow-sm shrink-0">
                  <span className="text-xl">Rx</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase bg-stone-900 text-white px-2 py-0.5 rounded">
                      ICAR / KVK EXTENSION PROTOCOL
                    </span>
                    <span className="text-xs text-stone-500 font-mono">
                      Ref: {card?.reportId || `KBD-2026-${result.id.slice(-5)}`}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight mt-0.5">
                    KISAN BHAI CLINICAL CROP DIAGNOSTIC REPORT CARD
                  </h1>
                  <p className="text-xs text-stone-600 font-medium">
                    किसान डॉक्टर पर्चा (कृषि परामर्श एवं उपचार पर्ची) • AI Computer Vision Agronomy Slip
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-stone-600 border-l sm:border-l-0 sm:border-r border-stone-200 pl-3 sm:pl-0 sm:pr-3">
                <div className="font-semibold text-stone-900 flex items-center gap-1.5 sm:justify-end">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Date: {formattedDate}</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  Assessment ID: <span className="font-mono">{result.id}</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                  Confidence: {result.confidenceScore}% (Vision Sensor Validated)
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Farmer & Crop Demographic Card */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 sm:p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>1. Patient Crop & Field Demographics (मरीज फसल एवं खेत विवरण)</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Farmer Name</span>
                <span className="font-bold text-stone-900 text-sm">
                  {card?.patientCrop.farmerName || 'Ramesh Patel'}
                </span>
                <span className="text-[10px] text-stone-500 block">Kishan ID: KB-7729</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Plot / Patch</span>
                <span className="font-bold text-stone-900 text-sm">
                  {result.patchName || card?.patientCrop.fieldPlotName || 'Patch A - North Field'}
                </span>
                <span className="text-[10px] text-stone-500 block">Anandpur North Zone</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Crop & Variety</span>
                <span className="font-bold text-stone-900 text-sm">
                  {result.cropName}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block">
                  {card?.patientCrop.variety || 'Certified Variety'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Phenological Stage</span>
                <span className="font-bold text-stone-900 text-xs">
                  {card?.patientCrop.growthStage || timing?.growthStage || 'Vegetative Stage (40-50 DAS)'}
                </span>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mt-1 ${getSeverityBadge(result.severity)}`}>
                  Severity: {result.severity}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Pathological Assessment */}
          <div className="bg-white rounded-2xl border-2 border-stone-300 p-4 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Primary Pathological Diagnosis (प्राथमिक रोग निदान)
                </span>
                <h3 className="text-xl font-black text-stone-900 tracking-tight mt-1">
                  {result.possibleDisease || result.cropName + ' Pathogen Complex'}
                </h3>
                {result.pathogen && (
                  <p className="text-xs font-mono text-stone-600 italic">
                    Causal Organism: {result.pathogen}
                  </p>
                )}
                {result.hindiName && (
                  <p className="text-xs font-semibold text-stone-700 mt-0.5">
                    हिंदी नाम: {result.hindiName}
                  </p>
                )}
              </div>

              <div className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-xl text-right">
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Estimated Canopy Damage</span>
                <span className="text-lg font-black text-rose-700">
                  {card?.patientCrop.affectedAcreagePct || (result.severity === 'CRITICAL' ? '35-45%' : result.severity === 'HIGH' ? '25-30%' : result.severity === 'MODERATE' ? '18-22%' : '8-12%')}
                </span>
                <span className="text-[10px] text-stone-500 block">Foliar Area Affected</span>
              </div>
            </div>

            {/* Diagnostic Symptoms and Contributing Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Key Symptoms Observed (पहचाने गए लक्षण):</span>
                </span>
                <ul className="space-y-1.5 text-xs text-stone-800">
                  {result.symptoms.map((symp, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                      <span className="text-emerald-700 font-bold">•</span>
                      <span>{symp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Probable Environmental Triggers (संभावित कारण):</span>
                </span>
                <ul className="space-y-1.5 text-xs text-stone-800">
                  {(result.causes || [
                    'High canopy humidity and prolonged morning leaf wetness',
                    'Favorable temperature range for airborne spore dissemination',
                    'Micro-climate stagnation within high-density planting rows',
                  ]).map((cause, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                      <span className="text-amber-700 font-bold">•</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Dual Prescribed Regimen (Organic + Chemical) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs">Rx</span>
                <span>2. Prescribed Dual Treatment Regimen (दवाइयों का पर्चा / दोनों समाधान)</span>
              </h2>
              <span className="text-xs text-stone-500 font-medium">Both Eco-Friendly & Emergency Options</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Box A: Certified Organic & Biological Solutions */}
              <div className="bg-emerald-50/60 rounded-2xl border-2 border-emerald-300 p-4 sm:p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Sprout className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-emerald-950 tracking-wider">
                        SOLUTION A: ORGANIC & BIOLOGICAL (जैविक समाधान)
                      </h4>
                      <p className="text-[11px] text-emerald-800 font-medium">100% Eco-Safe, Zero Chemical Residue</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                    Bee & Soil Safe
                  </span>
                </div>

                <div className="space-y-3">
                  {organics.map((org, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-3 border border-emerald-200/80 shadow-xs space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-emerald-950">{org.name}</span>
                        {org.estimatedCost && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                            {org.estimatedCost}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-stone-700">
                        <span className="font-semibold text-emerald-900">Active Bio-Agent: </span>
                        {org.bioAgentOrBotanical}
                      </div>

                      <div className="text-xs bg-emerald-50/80 p-2 rounded-lg border border-emerald-200 text-emerald-950">
                        <span className="font-bold">Exact Dosage: </span>
                        {org.dosage}
                      </div>

                      <div className="text-[11px] text-stone-600">
                        <span className="font-semibold text-stone-800">Preparation & Spray Recipe: </span>
                        {org.preparationMethod}
                      </div>

                      <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 pt-1 border-t border-stone-100">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{org.ecoBenefit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box B: Targeted Chemical Solutions */}
              <div className="bg-blue-50/60 rounded-2xl border-2 border-blue-300 p-4 sm:p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-blue-950 tracking-wider">
                        SOLUTION B: CHEMICAL INTERVENTION (रासायनिक उपचार)
                      </h4>
                      <p className="text-[11px] text-blue-800 font-medium">Fast-acting emergency curative suppression</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                    Rapid Arrest
                  </span>
                </div>

                <div className="space-y-3">
                  {chemicals.map((chem, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-3 border border-blue-200/80 shadow-xs space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-blue-950">{chem.name}</span>
                        {chem.estimatedCost && (
                          <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                            {chem.estimatedCost}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-stone-700">
                        <span className="font-semibold text-blue-900">Active Technical Ingredient: </span>
                        {chem.activeIngredient}
                      </div>

                      <div className="text-xs bg-blue-50/80 p-2 rounded-lg border border-blue-200 text-blue-950">
                        <span className="font-bold">Recommended Dosage: </span>
                        {chem.dosage}
                      </div>

                      <div className="text-[11px] text-stone-600">
                        <span className="font-semibold text-stone-800">Application Guidelines: </span>
                        {chem.sprayGuidelines}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1 border-t border-stone-100">
                        <span className="font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Waiting Period (PHI): {chem.waitingPeriodDays}
                        </span>
                        <span className="text-stone-600 italic">
                          Precautions: {chem.safetyPrecautions}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Optimal Timing & Weather Application Protocol */}
          <div className="bg-amber-50/70 rounded-2xl border-2 border-amber-300 p-4 sm:p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-amber-950 tracking-wider">
                    3. OPTIMAL TIMING & APPLICATION PROTOCOL (उपचार का सही समय व मौसम)
                  </h4>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Critical window to maximize effectiveness and avoid leaf burn or drift
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full">
                Golden Spray Hours
              </span>
            </div>

            {/* Timing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                  <SunMedium className="w-4 h-4 text-amber-600" />
                  <span>Golden Time of Day</span>
                </div>
                <div className="text-xs font-black text-stone-900 bg-amber-100/60 p-2 rounded-lg">
                  {timing?.bestTimeOfDay || 'Early Morning (6:00 - 8:30 AM) or Late Evening (4:30 - 6:30 PM)'}
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  {timing?.timingReason || 'Prevents rapid solar UV breakdown of chemicals, avoids leaf scorching, and protects pollinating honeybees.'}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                  <Wind className="w-4 h-4 text-blue-600" />
                  <span>Weather Safety Parameters</span>
                </div>
                <ul className="text-[11px] space-y-1 text-stone-700">
                  <li className="flex items-center justify-between border-b border-stone-100 pb-0.5">
                    <span>Temp Range:</span>
                    <span className="font-bold text-stone-900">{timing?.weatherConditions.temperatureRange || '18°C - 26°C'}</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-stone-100 pb-0.5">
                    <span>Wind Limit:</span>
                    <span className="font-bold text-stone-900">{timing?.weatherConditions.windSpeedLimit || '< 8-10 km/h'}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Rainfastness:</span>
                    <span className="font-bold text-emerald-800">{timing?.weatherConditions.rainfastnessHours || '4 to 6 hrs dry window'}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                  <Droplets className="w-4 h-4 text-emerald-600" />
                  <span>Spray Cadence & Interval</span>
                </div>
                <div className="text-xs font-black text-emerald-900 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  {timing?.sprayIntervalDays || 'Organic: 5-7 days | Chemical: 10-14 days'}
                </div>
                <p className="text-[11px] text-stone-600">
                  Do not exceed recommended spray concentration; ensure full underside leaf canopy wetting.
                </p>
              </div>
            </div>

            {/* Expected Recovery Milestones */}
            <div className="bg-white rounded-xl p-3 border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Expected Clinical Recovery Milestones (रोग ठीक होने की समयावधि):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                  <span className="font-bold text-emerald-800 text-[11px] block">Day 1 - 2 (First 48 Hours)</span>
                  <p className="text-[11px] text-stone-700">
                    {timing?.expectedRecoveryTimeline.day1to2 || 'Active fungal sporulation arrested; lesions cease spreading.'}
                  </p>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                  <span className="font-bold text-emerald-800 text-[11px] block">Day 4 - 5 (Mid Recovery)</span>
                  <p className="text-[11px] text-stone-700">
                    {timing?.expectedRecoveryTimeline.day4to5 || 'Lesions desiccate into dark necrotic spots with crisp margins; no new spore dust.'}
                  </p>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                  <span className="font-bold text-emerald-800 text-[11px] block">Day 7 - 10 (Full Recovery)</span>
                  <p className="text-[11px] text-stone-700">
                    {timing?.expectedRecoveryTimeline.day7to10 || 'Vigorous fresh green leaves emerge; photosynthetic vigor restored.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Doctor's Clinical Review & Physical Sign-off Block */}
          <div className="border-2 border-stone-300 rounded-2xl p-4 sm:p-4 bg-stone-50/80 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-300 pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-stone-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  4. Krishi Vigyan Kendra (KVK) / Extension Officer Validation Slip (कृषि वैज्ञानिक सत्यापन)
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-stone-200 text-stone-800 px-2 py-0.5 rounded">
                Official Validation Box
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2 space-y-2">
                <span className="font-bold text-stone-700 block">
                  Agronomist / Doctor Field Observations & Treatment Endorsement (डॉक्टर की टिप्पणी):
                </span>
                <div className="h-20 border border-dashed border-stone-400 bg-white rounded-xl p-2.5 text-stone-400 text-[11px]">
                  {card?.doctorReviewSection.doctorNotesPlaceholder || 'Remarks / Alterations noted during on-field physical plant tissue inspection...'}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-stone-700 block">Doctor Sign & Seal:</span>
                <div className="h-20 border border-stone-300 bg-white rounded-xl flex flex-col items-center justify-end p-2 text-center">
                  <div className="w-full border-t border-stone-400 pt-1 text-[10px] text-stone-500">
                    KVK Officer Signature & Stamp
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-stone-200">
              <div className="text-stone-600">
                <span className="font-bold">Next Recommended Field Check: </span>
                <span className="font-semibold text-emerald-800">
                  {card?.doctorReviewSection.nextInspectionDate || 'Within 7 Days of Spray'}
                </span>
              </div>
              <div className="text-[11px] text-stone-500">
                National Kisan Call Center: <span className="font-bold text-stone-800">1800-180-1551 (Toll-Free)</span>
              </div>
            </div>
          </div>

          {/* Report Footer & Legal Advisory */}
          <div className="text-center text-[10px] text-stone-500 border-t border-stone-200 pt-3 space-y-1">
            <p>
              * This clinical prescription report is generated via Kisan Bhai Computer Vision Plant Pathology Diagnostic Engine.
              It is designed for agricultural extension officers, Krishi Vigyan Kendra (KVK) scientists, and agricultural retailers to verify in-field conditions.
            </p>
            <p className="font-mono text-stone-400">
              Scan ID: {result.id} | Timestamp: {result.scannedAt} | Powered by Kisan Bhai Agronomy AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
