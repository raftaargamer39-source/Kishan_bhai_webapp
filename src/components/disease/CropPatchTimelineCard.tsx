import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Droplets,
  FilePlus,
  Flame,
  HelpCircle,
  History,
  Image as ImageIcon,
  Info,
  Layers,
  Leaf,
  Maximize2,
  Plus,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sprout,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import {
  CropPatch,
  PatchTimelineEvent,
  PatchTimelineEventType,
  PatchHealthStatus,
} from '../../../shared/types';
import { useApp } from '../../context/AppContext';

interface CropPatchTimelineCardProps {
  language?: string;
  onAskAiWithContext?: (prompt: string) => void;
  onOpenScannerForPatch?: (patch: CropPatch) => void;
}

export const CropPatchTimelineCard: React.FC<CropPatchTimelineCardProps> = ({
  language = 'hi',
  onAskAiWithContext,
  onOpenScannerForPatch,
}) => {
  const {
    cropPatches,
    addCropPatch,
    updateCropPatch,
    deleteCropPatch,
    addPatchTimelineEvent,
    deletePatchTimelineEvent,
    resetCropPatchesToInitial,
    addDiaryEntry,
    addToast,
    askAiWithPrompt,
  } = useApp();

  const [selectedPatchId, setSelectedPatchId] = useState<string>(
    cropPatches[0]?.id || 'patch_cotton_north'
  );
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState<boolean>(false);
  const [isAddPatchModalOpen, setIsAddPatchModalOpen] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption: string } | null>(null);
  const [compareMode, setCompareMode] = useState<boolean>(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState<string>('');
  const [newEventDate, setNewEventDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newEventTime, setNewEventTime] = useState<string>('08:30 AM');
  const [newEventType, setNewEventType] = useState<PatchTimelineEventType>('TREATMENT_SPRAY');
  const [newEventSeverity, setNewEventSeverity] = useState<
    'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'HEALTHY'
  >('MODERATE');
  const [newEventHealthScore, setNewEventHealthScore] = useState<number>(75);
  const [newEventRecoveryPct, setNewEventRecoveryPct] = useState<number>(60);
  const [newEventDescription, setNewEventDescription] = useState<string>('');
  const [newEventProductName, setNewEventProductName] = useState<string>('');
  const [newEventTypeCategory, setNewEventTypeCategory] = useState<
    'Chemical' | 'Organic' | 'Biological' | 'Cultural'
  >('Organic');
  const [newEventDosage, setNewEventDosage] = useState<string>('');
  const [newEventCost, setNewEventCost] = useState<number>(250);
  const [newEventNotes, setNewEventNotes] = useState<string>('');
  const [newEventImageUrl, setNewEventImageUrl] = useState<string>('');

  // New Patch Form State
  const [newPatchName, setNewPatchName] = useState<string>('');
  const [newPatchCrop, setNewPatchCrop] = useState<string>('BT Cotton');
  const [newPatchVariety, setNewPatchVariety] = useState<string>('');
  const [newPatchAcres, setNewPatchAcres] = useState<number>(1.5);
  const [newPatchLocation, setNewPatchLocation] = useState<string>('');
  const [newPatchSoil, setNewPatchSoil] = useState<string>('Medium Black Vertisol');
  const [newPatchPathogen, setNewPatchPathogen] = useState<string>('');

  const activePatch = cropPatches.find((p) => p.id === selectedPatchId) || cropPatches[0];

  // Helper for severity styling
  const getSeverityBadge = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-600',
          label: language === 'hi' ? 'गंभीर संक्रमण' : 'Critical',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50 border-orange-200 text-orange-800',
          dot: 'bg-orange-600',
          label: language === 'hi' ? 'उच्च संक्रमण' : 'High Severity',
        };
      case 'MODERATE':
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          dot: 'bg-amber-500',
          label: language === 'hi' ? 'मध्यम संक्रमण' : 'Moderate',
        };
      case 'LOW':
        return {
          bg: 'bg-lime-50 border-lime-200 text-lime-800',
          dot: 'bg-lime-600',
          label: language === 'hi' ? 'हल्का' : 'Low',
        };
      case 'HEALTHY':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-600',
          label: language === 'hi' ? 'स्वस्थ / ठीक' : 'Healthy / Recovered',
        };
    }
  };

  const getStatusBadge = (status: PatchHealthStatus) => {
    switch (status) {
      case 'HEALTHY':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          label: language === 'hi' ? 'स्वस्थ (रोगमुक्त)' : 'Healthy / Resolved',
          icon: ShieldCheck,
        };
      case 'RECOVERING':
        return {
          bg: 'bg-teal-100 text-teal-900 border-teal-300',
          label: language === 'hi' ? 'सुधार जारी (रिकवरिंग)' : 'Recovering (Active Healing)',
          icon: TrendingUp,
        };
      case 'TREATMENT_ACTIVE':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          label: language === 'hi' ? 'उपचार सक्रिय' : 'Treatment Active',
          icon: Droplets,
        };
      case 'UNDER_OBSERVATION':
        return {
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          label: language === 'hi' ? 'निगरानी में' : 'Under Observation',
          icon: Clock,
        };
      case 'CRITICAL':
      default:
        return {
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          label: language === 'hi' ? 'तत्काल ध्यान आवश्यक' : 'Critical Outbreak',
          icon: ShieldAlert,
        };
    }
  };

  const getEventTypeMeta = (type: PatchTimelineEventType) => {
    switch (type) {
      case 'INITIAL_SCAN':
        return {
          icon: Search,
          label: language === 'hi' ? 'प्रारंभिक रोग स्कैन' : 'Initial Outbreak Scan',
          color: 'bg-rose-100 text-rose-700 border-rose-300',
          badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'TREATMENT_SPRAY':
        return {
          icon: Droplets,
          label: language === 'hi' ? 'उपचार छिड़काव' : 'Treatment Spray Applied',
          color: 'bg-blue-100 text-blue-700 border-blue-300',
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'FOLLOWUP_SCAN':
        return {
          icon: RotateCcw,
          label: language === 'hi' ? 'फॉलो-अप एआई स्कैन' : 'Follow-up AI Progress Scan',
          color: 'bg-amber-100 text-amber-700 border-amber-300',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'SOIL_APPLICATION':
        return {
          icon: Sprout,
          label: language === 'hi' ? 'जैविक मिट्टी अनुप्रयोग' : 'Soil Bio-Treatment',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'EXPERT_ADVISORY':
        return {
          icon: UserCheck,
          label: language === 'hi' ? 'विशेषज्ञ परामर्श' : 'Agronomist Advisory',
          color: 'bg-purple-100 text-purple-700 border-purple-300',
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'RECOVERY_VERIFIED':
      default:
        return {
          icon: CheckCircle2,
          label: language === 'hi' ? 'स्वास्थ्य लाभ सत्यापित' : 'Recovery Verified',
          color: 'bg-teal-100 text-teal-700 border-teal-300',
          badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        };
    }
  };

  const handleSaveToFarmDiary = (event: PatchTimelineEvent) => {
    addDiaryEntry({
      date: event.date,
      category: event.type === 'TREATMENT_SPRAY' ? 'Disease & Pest' : 'General',
      crop: activePatch?.cropName || 'Crop',
      title: `${activePatch?.name}: ${event.title}`,
      expenseAmountInr: event.treatmentDetails?.costInr || 0,
      notes: `${event.description} | Severity: ${event.severity} | Recovery: ${event.recoveryRatePct || 0}%`,
    });
    addToast(
      'Saved to Farm Diary',
      `Timeline checkpoint "${event.title}" recorded in seasonal expenses.`,
      'success'
    );
  };

  const handleAskAiAboutPatch = (event: PatchTimelineEvent) => {
    const prompt = `I am reviewing the health timeline for my crop patch: "${activePatch?.name}" (${activePatch?.cropName}, Variety: ${activePatch?.variety}). At milestone on ${event.date}: "${event.title}", the condition was "${event.description}" with health score ${event.healthScore}% and recovery rate ${event.recoveryRatePct}%. What are the recommended next steps to guarantee 100% recovery and prevent reinfection?`;
    if (onAskAiWithContext) {
      onAskAiWithContext(prompt);
    } else {
      askAiWithPrompt(prompt);
    }
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      addToast('Title Required', 'Please enter a checkpoint title.', 'info');
      return;
    }

    if (!activePatch) return;

    const eventPayload: Omit<PatchTimelineEvent, 'id' | 'patchId'> = {
      date: newEventDate,
      time: newEventTime,
      type: newEventType,
      title: newEventTitle,
      description: newEventDescription || 'Follow-up field observation recorded by farmer.',
      severity: newEventSeverity,
      healthScore: Number(newEventHealthScore),
      recoveryRatePct: Number(newEventRecoveryPct),
      pathogenOrIssue: activePatch.activePathogen,
      imageUrl: newEventImageUrl || undefined,
      recordedBy: 'FARMER',
      notes: newEventNotes || undefined,
      treatmentDetails:
        newEventType === 'TREATMENT_SPRAY' || newEventType === 'SOIL_APPLICATION'
          ? {
              productName: newEventProductName || 'Standard Agrochemical / Bio Spray',
              treatmentType: newEventTypeCategory,
              dosage: newEventDosage || 'As recommended on label',
              costInr: Number(newEventCost) || 0,
              applicator: 'Self (Farmer)',
              weatherCondition: 'Clear skies, calm wind',
            }
          : undefined,
    };

    addPatchTimelineEvent(activePatch.id, eventPayload);
    setIsAddEventModalOpen(false);

    // Reset fields
    setNewEventTitle('');
    setNewEventDescription('');
    setNewEventProductName('');
    setNewEventDosage('');
    setNewEventNotes('');
    setNewEventImageUrl('');
  };

  const handleAddPatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatchName.trim()) {
      addToast('Name Required', 'Please enter a patch name.', 'info');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newPatchData: Omit<CropPatch, 'id'> = {
      name: newPatchName,
      cropName: newPatchCrop,
      variety: newPatchVariety || 'Standard Hybrid',
      areaAcres: Number(newPatchAcres) || 1.0,
      locationLabel: newPatchLocation || 'Main Field',
      soilType: newPatchSoil,
      sowingDate: todayStr,
      currentStatus: 'UNDER_OBSERVATION',
      currentHealthScore: 70,
      initialInfectionDate: todayStr,
      activePathogen: newPatchPathogen || 'Under Initial Monitoring',
      baselineSeverity: 'MODERATE',
      currentSeverity: 'MODERATE',
      overallRecoveryPct: 20,
      nextActionDate: todayStr,
      nextActionTitle: 'Initial Preventive Spray & Inspection',
      initialImageUrl:
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      latestImageUrl:
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      timelineEvents: [
        {
          id: `evt_${Date.now()}`,
          patchId: '',
          date: todayStr,
          time: '09:00 AM',
          type: 'INITIAL_SCAN',
          title: 'Patch Health Tracking Initiated',
          description: `Patch registered for ongoing disease diagnosis and health monitoring. Pathogen tracked: ${newPatchPathogen || 'General Foliar Health'}`,
          severity: 'MODERATE',
          healthScore: 70,
          recoveryRatePct: 20,
          recordedBy: 'FARMER',
        },
      ],
    };

    addCropPatch(newPatchData);
    setIsAddPatchModalOpen(false);
    setNewPatchName('');
    setNewPatchVariety('');
    setNewPatchLocation('');
    setNewPatchPathogen('');
  };

  const filteredEvents = (activePatch?.timelineEvents || []).filter((evt) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'SCANS')
      return evt.type === 'INITIAL_SCAN' || evt.type === 'FOLLOWUP_SCAN';
    if (filterType === 'TREATMENTS')
      return evt.type === 'TREATMENT_SPRAY' || evt.type === 'SOIL_APPLICATION';
    if (filterType === 'RECOVERY')
      return evt.type === 'RECOVERY_VERIFIED' || evt.type === 'EXPERT_ADVISORY';
    return true;
  });

  const activeStatusMeta = activePatch ? getStatusBadge(activePatch.currentStatus) : null;
  const activeSeverityMeta = activePatch ? getSeverityBadge(activePatch.currentSeverity || 'MODERATE') : null;

  return (
    <div id="crop-patch-timeline-section" className="space-y-6">
      {/* 1. Header & Patch Selection Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-100 text-green-700">
                <Activity className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {language === 'hi'
                  ? '🌾 फसल पैच स्वास्थ्य व उपचार टाइमलाइन'
                  : 'Crop Patch Health & Treatment Timeline'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500">
              {language === 'hi'
                ? 'अपने खेत के विशिष्ट भूखंडों (Patches) में संक्रमण की पहचान से लेकर पूर्ण स्वास्थ्य लाभ तक की समयरेखा ट्रैक करें।'
                : 'Track disease progression, spray dosages, foliar recovery, and follow-up milestones for specific field patches.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddEventModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-700 hover:bg-[#233f17] text-white text-xs font-bold rounded-2xl shadow-xs transition-all cursor-pointer hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'hi' ? '+ नया चेकपॉइंट जोड़ें' : '+ Log Treatment / Check'}</span>
            </button>

            <button
              onClick={() => setIsAddPatchModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl border border-stone-200 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-stone-600" />
              <span>{language === 'hi' ? '+ नया पैच' : '+ New Patch'}</span>
            </button>

            <button
              onClick={resetCropPatchesToInitial}
              title="Reset to default demo milestones"
              className="p-2.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-2xl border border-stone-200 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Patch Selector Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'hi' ? 'खेत का भूखंड चुनें' : 'Select Farm Patch / Plot'}</span>
            </span>
            <span className="text-xs text-stone-400 font-medium">
              {cropPatches.length} {cropPatches.length === 1 ? 'Patch Tracked' : 'Patches Tracked'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {cropPatches.map((patch) => {
              const isSelected = patch.id === (activePatch?.id || selectedPatchId);
              const patchStatus = getStatusBadge(patch.currentStatus);

              return (
                <button
                  key={patch.id}
                  onClick={() => setSelectedPatchId(patch.id)}
                  className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-emerald-900 text-white border-emerald-950 shadow-md ring-2 ring-emerald-600/50'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isSelected ? 'text-white' : 'text-stone-900'
                        }`}
                      >
                        {patch.name}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? 'bg-emerald-800 text-emerald-100 border-emerald-700'
                            : patchStatus.bg
                        }`}
                      >
                        {patch.overallRecoveryPct}% {language === 'hi' ? 'सुधार' : 'Healed'}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate ${
                        isSelected ? 'text-emerald-200' : 'text-stone-500'
                      }`}
                    >
                      {patch.cropName} • {patch.areaAcres} {language === 'hi' ? 'एकड़' : 'Acres'}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={isSelected ? 'text-emerald-300' : 'text-stone-500'}>
                        {language === 'hi' ? 'रोग' : 'Target'}:
                      </span>
                      <span
                        className={`font-semibold truncate max-w-[130px] ${
                          isSelected ? 'text-white' : 'text-stone-800'
                        }`}
                      >
                        {patch.activePathogen?.split('/')[0] || 'Monitoring'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      className={`w-full h-1.5 rounded-full overflow-hidden ${
                        isSelected ? 'bg-emerald-950' : 'bg-stone-200'
                      }`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSelected ? 'bg-emerald-400' : 'bg-green-700'
                        }`}
                        style={{ width: `${patch.overallRecoveryPct}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Active Patch Summary Card & Health Index Dashboard */}
        {activePatch && (
          <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 text-white rounded-2xl p-4 sm:p-6 shadow-lg relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top row: Patch title, Location & Status Badges */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 border-b border-white/10 pb-5">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 rounded-md bg-emerald-600/40 text-emerald-200 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                    {activePatch.cropName} ({activePatch.variety})
                  </span>
                  <span className="px-3 py-0.5 rounded-md bg-white/10 text-stone-200 border border-white/10 text-xs font-medium">
                    📍 {activePatch.locationLabel}
                  </span>
                  <span className="px-3 py-0.5 rounded-md bg-white/10 text-stone-200 border border-white/10 text-xs font-medium">
                    🌱 {activePatch.soilType}
                  </span>
                </div>

                <h3 className="text-xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{activePatch.name}</span>
                  {activePatch.hindiName && (
                    <span className="text-sm font-normal text-stone-300">
                      ({activePatch.hindiName})
                    </span>
                  )}
                </h3>

                <p className="text-xs sm:text-sm text-emerald-200/90 flex items-center gap-2">
                  <span className="font-semibold text-white">
                    {language === 'hi' ? 'सक्रिय रोग:' : 'Active Issue:'}
                  </span>
                  <span>{activePatch.activePathogen}</span>
                </p>
              </div>

              {/* Status and Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      activeSeverityMeta?.dot || 'bg-emerald-400'
                    } animate-pulse`}
                  />
                  <div className="text-left">
                    <div className="text-[10px] text-stone-400 uppercase font-bold">
                      {language === 'hi' ? 'स्थिति' : 'Patch Status'}
                    </div>
                    <div className="text-xs font-bold text-white">
                      {activeStatusMeta?.label}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                    compareMode
                      ? 'bg-emerald-400 text-emerald-950 border-emerald-300 shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>
                    {compareMode
                      ? language === 'hi'
                        ? 'तुलना बंद करें'
                        : 'Close Comparison'
                      : language === 'hi'
                      ? '🔍 पहले और अब की तस्वीर तुलना'
                      : 'Before & After Photo Compare'}
                  </span>
                </button>
              </div>
            </div>

            {/* Middle Grid: Metric Counters (Recovery %, Health Score, Next Action) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
              {/* Overall Recovery Rate */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs text-stone-400 font-medium">
                    {language === 'hi' ? 'उपचार से स्वास्थ्य लाभ' : 'Treatment Recovery Rate'}
                  </div>
                  <div className="text-2xl font-black text-emerald-300 flex items-baseline gap-1.5">
                    <span>{activePatch.overallRecoveryPct}%</span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {activePatch.overallRecoveryPct >= 80 ? '🌿 Major Healing' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Health Score */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs text-stone-400 font-medium">
                    {language === 'hi' ? 'वर्तमान स्वास्थ्य सूचकांक' : 'Patch Health Index'}
                  </div>
                  <div className="text-2xl font-black text-white flex items-baseline gap-1.5">
                    <span>{activePatch.currentHealthScore} / 100</span>
                    <span className="text-xs text-blue-300 font-semibold">
                      {activePatch.currentHealthScore > 80 ? 'Vigorous' : 'Moderate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Scheduled Action */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs text-stone-400 font-medium">
                    {language === 'hi' ? 'अगला निवारक कदम' : 'Next Scheduled Action'}
                  </div>
                  <div className="text-sm font-bold text-amber-200 truncate">
                    {activePatch.nextActionTitle || 'Routine Foliar Inspection'}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Due: {activePatch.nextActionDate || 'In 3 days'}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Before & After Visual Comparison Drawer (When toggled) */}
            {compareMode && (
              <div className="bg-stone-950/80 border border-emerald-500/30 rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">
                      {language === 'hi'
                        ? 'पत्ती के स्वास्थ्य में बदलाव (शुरुआती बनाम वर्तमान)'
                        : 'Visual Healing Comparison (Day 0 Infection vs. Current Healed Canopy)'}
                    </h4>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-medium">
                    +{activePatch.overallRecoveryPct}% Recovery
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Baseline Photo */}
                  <div className="relative rounded-2xl overflow-hidden border border-rose-500/50 bg-stone-900 group">
                    <img
                      src={
                        activePatch.initialImageUrl ||
                        'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80'
                      }
                      alt="Baseline infection"
                      className="w-full h-56 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-rose-950/90 text-rose-200 border border-rose-600/60 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>
                        {language === 'hi' ? 'दिन 0 (शुरुआती प्रकोप)' : 'Day 0 (Initial Infection)'}
                      </span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 text-xs text-stone-200">
                      <p className="font-semibold text-rose-300">
                        {activePatch.activePathogen}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Angular water-soaked lesions, necrotic margin spread (Health: 42%)
                      </p>
                    </div>
                  </div>

                  {/* Current Healed Photo */}
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 bg-stone-900 group">
                    <img
                      src={
                        activePatch.latestImageUrl ||
                        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
                      }
                      alt="Current recovered state"
                      className="w-full h-56 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-emerald-950/90 text-emerald-200 border border-emerald-600/60 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>
                        {language === 'hi' ? 'वर्तमान स्थिति (उपचार पश्चात)' : 'Current (Post Treatment)'}
                      </span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 text-xs text-stone-200">
                      <p className="font-semibold text-emerald-300">
                        {language === 'hi' ? 'स्वस्थ पत्तियां व नई शाखाएं' : 'Vigorous Apical Foliage'}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Lesions dried into inactive crusts, vigorous vegetative growth (Health: {activePatch.currentHealthScore}%)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Timeline Events Filter & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-700" />
            <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              {language === 'hi' ? 'कालानुक्रमिक प्रगति यात्रा' : 'Chronological Treatment Journey'}
            </h4>
            <span className="text-xs text-stone-400 font-mono font-medium">
              ({filteredEvents.length} {language === 'hi' ? 'माइलस्टोन' : 'Milestones'})
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl border border-stone-200 text-xs font-bold">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {language === 'hi' ? 'सभी' : 'All Events'}
            </button>
            <button
              onClick={() => setFilterType('SCANS')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterType === 'SCANS'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {language === 'hi' ? '🔬 स्कैन' : '🔬 Scans'}
            </button>
            <button
              onClick={() => setFilterType('TREATMENTS')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterType === 'TREATMENTS'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {language === 'hi' ? '🧪 छिड़काव' : '🧪 Sprays & Bio'}
            </button>
            <button
              onClick={() => setFilterType('RECOVERY')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterType === 'RECOVERY'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {language === 'hi' ? '🌿 सुधार' : '🌿 Recovery'}
            </button>
          </div>
        </div>

        {/* 5. Connected Visual Timeline Rail */}
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[17px] sm:before:left-[21px] before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-700 before:via-emerald-400 before:to-teal-500">
          {filteredEvents.map((event, index) => {
            const eventMeta = getEventTypeMeta(event.type);
            const sevMeta = getSeverityBadge(event.severity);
            const EventIcon = eventMeta.icon;

            return (
              <div key={event.id} className="relative group">
                {/* Timeline Milestone Node Icon */}
                <div
                  className={`absolute -left-[30px] sm:-left-[35px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-xs ${eventMeta.color} ring-2 ring-stone-100 group-hover:scale-110 transition-transform`}
                >
                  <EventIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>

                {/* Milestone Content Card */}
                <div className="bg-stone-50/80 hover:bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-500/80 hover:shadow-md transition-all p-4 sm:p-6 space-y-4">
                  {/* Card Header: Type Badge, Date, Severity & Recovery */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/60 pb-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${eventMeta.badgeColor}`}
                      >
                        <EventIcon className="w-3 h-3" />
                        <span>{eventMeta.label}</span>
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${sevMeta.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sevMeta.dot}`} />
                        <span>{sevMeta.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{event.date}</span>
                        {event.time && <span className="text-stone-400 font-mono">({event.time})</span>}
                      </div>

                      {event.healthScore !== undefined && (
                        <span className="font-bold text-stone-700 bg-stone-200/70 px-2 py-0.5 rounded-md font-mono">
                          Health: {event.healthScore}%
                        </span>
                      )}

                      {event.recoveryRatePct !== undefined && event.recoveryRatePct > 0 && (
                        <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 font-mono">
                          +{event.recoveryRatePct}% Healed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-stone-900 flex items-center justify-between gap-2">
                      <span>{event.title}</span>
                      {event.recordedBy && (
                        <span className="text-[10px] text-stone-400 font-normal font-mono">
                          Logged by: {event.recordedBy}
                        </span>
                      )}
                    </h4>

                    {event.hindiTitle && language === 'hi' && (
                      <p className="text-xs font-semibold text-emerald-800">
                        {event.hindiTitle}
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {event.description}
                    </p>

                    {event.hindiDescription && language === 'hi' && (
                      <p className="text-xs text-stone-500 italic mt-0.5">
                        {event.hindiDescription}
                      </p>
                    )}
                  </div>

                  {/* Optional Treatment Details Box */}
                  {event.treatmentDetails && (
                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-emerald-950 font-bold border-b border-emerald-200/60 pb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5 text-emerald-700" />
                          <span>
                            {language === 'hi'
                              ? 'अनुप्रयुक्त उपचार विवरण'
                              : 'Applied Treatment Specs'}
                          </span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 text-[10px] uppercase font-bold">
                          {event.treatmentDetails.treatmentType}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-stone-700">
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase">
                            Product / Formulation
                          </span>
                          <span className="font-semibold text-stone-900">
                            {event.treatmentDetails.productName}
                          </span>
                        </div>

                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase">
                            Dosage / Ratio
                          </span>
                          <span className="font-semibold text-stone-900">
                            {event.treatmentDetails.dosage}
                          </span>
                        </div>

                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase">
                            Cost Incurred
                          </span>
                          <span className="font-semibold text-stone-900 font-mono">
                            ₹{event.treatmentDetails.costInr || 0}
                          </span>
                        </div>

                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase">
                            Weather / Spray Condition
                          </span>
                          <span className="font-semibold text-stone-900 truncate block">
                            {event.treatmentDetails.weatherCondition || 'Calm early morning'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Photo Thumbnail (If attached) */}
                  {event.imageUrl && (
                    <div className="flex items-center gap-3 pt-1">
                      <div
                        onClick={() =>
                          setLightboxImage({
                            url: event.imageUrl!,
                            caption: `${event.title} (${event.date})`,
                          })
                        }
                        className="relative w-28 h-20 rounded-2xl overflow-hidden border border-stone-300 shadow-xs cursor-pointer group/thumb hover:scale-102 transition-transform"
                      >
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-xs space-y-0.5 text-stone-500">
                        <span className="font-bold text-stone-700 block">
                          📷 Foliar Symptom Snapshot
                        </span>
                        <span className="text-[11px] text-stone-400">
                          Click to enlarge photo & inspect lesion boundaries.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Bar for Milestone */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/60 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAskAiAboutPatch(event)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-200 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === 'hi' ? 'एआई सलाह लें' : 'Consult AI on this step'}</span>
                      </button>

                      <button
                        onClick={() => handleSaveToFarmDiary(event)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium border border-stone-200 transition-all cursor-pointer"
                      >
                        <FilePlus className="w-3.5 h-3.5 text-stone-600" />
                        <span>{language === 'hi' ? 'डायरी में जोड़ें' : 'Add to Farm Diary'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (activePatch) {
                          deletePatchTimelineEvent(activePatch.id, event.id);
                        }
                      }}
                      title="Delete checkpoint"
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Modal: Add New Timeline Event */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-6 shadow-2xl border border-stone-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-700" />
                  <span>
                    {language === 'hi'
                      ? 'नया स्वास्थ्य / उपचार चेकपॉइंट जोड़ें'
                      : 'Log New Timeline Checkpoint'}
                  </span>
                </h3>
                <p className="text-xs text-stone-500">
                  Target Patch: <strong className="text-stone-800">{activePatch?.name}</strong> (
                  {activePatch?.cropName})
                </p>
              </div>
              <button
                onClick={() => setIsAddEventModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="space-y-4 text-xs">
              {/* Event Type & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Milestone Event Type</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as PatchTimelineEventType)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-800"
                  >
                    <option value="TREATMENT_SPRAY">🧪 Treatment Spray (Pesticide / Bio)</option>
                    <option value="FOLLOWUP_SCAN">👁️ Follow-up AI Health Scan</option>
                    <option value="SOIL_APPLICATION">🌱 Soil Bio-Drenching</option>
                    <option value="EXPERT_ADVISORY">🩺 Expert / KVK Advisory</option>
                    <option value="RECOVERY_VERIFIED">🌿 Full Recovery Achieved</option>
                    <option value="INITIAL_SCAN">🔬 Initial Outbreak Scan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Current Observed Severity</label>
                  <select
                    value={newEventSeverity}
                    onChange={(e) => setNewEventSeverity(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-800"
                  >
                    <option value="HEALTHY">🟢 Healthy / Restored</option>
                    <option value="LOW">🟡 Low / Shrinking Lesions</option>
                    <option value="MODERATE">🟠 Moderate / Healing</option>
                    <option value="HIGH">🔴 High Severity</option>
                    <option value="CRITICAL">🟣 Critical</option>
                  </select>
                </div>
              </div>

              {/* Title & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-stone-700">Checkpoint Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Copper Oxychloride + Streptocycline 2nd Spray"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Date</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium"
                  />
                </div>
              </div>

              {/* Sliders for Health Score & Recovery Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-stone-700">
                    <span>Health Score:</span>
                    <span className="text-emerald-700">{newEventHealthScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={newEventHealthScore}
                    onChange={(e) => setNewEventHealthScore(Number(e.target.value))}
                    className="w-full accent-green-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-stone-700">
                    <span>Overall Recovery Rate:</span>
                    <span className="text-emerald-700">+{newEventRecoveryPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newEventRecoveryPct}
                    onChange={(e) => setNewEventRecoveryPct(Number(e.target.value))}
                    className="w-full accent-green-700"
                  />
                </div>
              </div>

              {/* Treatment details if spray */}
              {(newEventType === 'TREATMENT_SPRAY' || newEventType === 'SOIL_APPLICATION') && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                  <div className="font-bold text-emerald-900">Treatment Specification</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Product (e.g. Tilt 25 EC)"
                      value={newEventProductName}
                      onChange={(e) => setNewEventProductName(e.target.value)}
                      className="p-2 bg-white border border-emerald-300 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 1 ml/L)"
                      value={newEventDosage}
                      onChange={(e) => setNewEventDosage(e.target.value)}
                      className="p-2 bg-white border border-emerald-300 rounded-xl"
                    />
                    <input
                      type="number"
                      placeholder="Cost in INR (₹)"
                      value={newEventCost}
                      onChange={(e) => setNewEventCost(Number(e.target.value))}
                      className="p-2 bg-white border border-emerald-300 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Field Observations & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Note leaf color, lesion shrinkage, new shoot emergence, or weather observations..."
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-700 hover:bg-[#213a16] text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Commit Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Register New Crop Patch */}
      {isAddPatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-6 shadow-2xl border border-stone-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-700" />
                <span>
                  {language === 'hi'
                    ? 'नया खेत भूखंड (Patch) पंजीकृत करें'
                    : 'Register New Crop Patch for Tracking'}
                </span>
              </h3>
              <button
                onClick={() => setIsAddPatchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPatchSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Patch Name / Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot E - Tomato Nursery Bed"
                  value={newPatchName}
                  onChange={(e) => setNewPatchName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Crop Species</label>
                  <select
                    value={newPatchCrop}
                    onChange={(e) => setNewPatchCrop(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-800"
                  >
                    <option value="BT Cotton">BT Cotton</option>
                    <option value="Sharbati Wheat">Sharbati Wheat</option>
                    <option value="Groundnut">Groundnut</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Rice (Paddy)">Rice (Paddy)</option>
                    <option value="Chilli">Chilli</option>
                    <option value="Mustard">Mustard</option>
                    <option value="Sugarcane">Sugarcane</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPatchAcres}
                    onChange={(e) => setNewPatchAcres(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">
                  Initial Disease / Pathogen Observed (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Early Blight / Powdery Mildew"
                  value={newPatchPathogen}
                  onChange={(e) => setNewPatchPathogen(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddPatchModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-700 hover:bg-[#213a16] text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Patch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Lightbox Image Viewer Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-900 border border-stone-700 rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl space-y-3 p-4"
          >
            <div className="flex items-center justify-between text-white border-b border-stone-800 pb-2">
              <span className="text-xs font-bold truncate">{lightboxImage.caption}</span>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-16/10 bg-black">
              <img
                src={lightboxImage.url}
                alt="High resolution leaf symptom"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
