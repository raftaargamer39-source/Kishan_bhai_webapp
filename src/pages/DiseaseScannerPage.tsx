import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Scan,
  Activity,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Leaf,
  Sprout,
  Info,
  Clock,
  BookOpen,
  ArrowRight,
  RefreshCw,
  X,
  FileText,
  UserCheck,
  Bot,
  Zap,
  Sliders,
  HelpCircle,
  Maximize2,
  FolderDown,
  Cloud,
} from 'lucide-react';
import { DiseaseScanResult, DiseaseScanImageQuality } from '../../shared/types';
import { DiseaseScanAnimation } from '../components/disease/DiseaseScanAnimation';
import { ImageQualityCheckCard } from '../components/disease/ImageQualityCheckCard';
import { DiseaseResultCard } from '../components/disease/DiseaseResultCard';
import { DiseaseScanHistory } from '../components/disease/DiseaseScanHistory';
import { CropPatchTimelineCard } from '../components/disease/CropPatchTimelineCard';
import { uploadFileToStorage } from '../services/storageService';

const CROP_OPTIONS = [
  'Auto-detect crop',
  'Wheat',
  'Rice',
  'Maize',
  'Cotton',
  'Tomato',
  'Potato',
  'Mustard',
  'Sugarcane',
  'Pulses',
  'Vegetables',
  'Other',
];

const SCAN_STEPS = [
  'Uploading image...',
  'Checking image quality...',
  'Identifying crop...',
  'Analyzing leaf patterns...',
  'Comparing with disease knowledge...',
  'Generating recommendation...',
];

const DEMO_PRESETS = [
  {
    title: 'Wheat Leaf Rust',
    crop: 'Wheat',
    disease: 'Leaf Rust (Puccinia striiformis)',
    img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    severity: 'MODERATE' as const,
    confidence: 91,
  },
  {
    title: 'Cotton Bacterial Blight',
    crop: 'Cotton',
    disease: 'Bacterial Blight (Xanthomonas)',
    img: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
    severity: 'MODERATE' as const,
    confidence: 92,
  },
  {
    title: 'Tomato Early Blight',
    crop: 'Tomato',
    disease: 'Early Blight (Alternaria solani)',
    img: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
    severity: 'HIGH' as const,
    confidence: 95,
  },
  {
    title: 'Potato Late Blight',
    crop: 'Potato',
    disease: 'Late Blight (Phytophthora)',
    img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    severity: 'HIGH' as const,
    confidence: 94,
  },
  {
    title: 'Rice Blast',
    crop: 'Rice',
    disease: 'Rice Blast (Magnaporthe oryzae)',
    img: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80',
    severity: 'MODERATE' as const,
    confidence: 93,
  },
];

export const DiseaseScannerPage: React.FC = () => {
  const {
    diseaseScans,
    addDiseaseScan,
    cropPatches,
    addDiaryEntry,
    language,
    setCurrentView,
    addToast,
    askAiWithPrompt,
  } = useApp();

  const [activeViewTab, setActiveViewTab] = useState<'scanner' | 'timeline' | 'history'>('scanner');
  const [selectedCrop, setSelectedCrop] = useState<string>('Auto-detect crop');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileSize, setImageFileSize] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [storageFileUrl, setStorageFileUrl] = useState<string | null>(null);
  const [isUploadingToStorage, setIsUploadingToStorage] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [qualityStatus, setQualityStatus] = useState<DiseaseScanImageQuality | null>(null);
  const [activeResult, setActiveResult] = useState<DiseaseScanResult | null>(
    diseaseScans[0] || null
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Sync active result if list updates
  useEffect(() => {
    if (!activeResult && diseaseScans.length > 0) {
      setActiveResult(diseaseScans[0]);
    }
  }, [diseaseScans, activeResult]);

  const processFile = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      addToast(
        'Unsupported Format',
        'Please upload a JPG, JPEG, PNG, or WEBP photo.',
        'error'
      );
      return;
    }

    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > 15) {
      addToast('File Too Large', 'Maximum image size is 15MB.', 'error');
      return;
    }

    setSelectedFile(file);
    const formattedSize =
      sizeInMb >= 1
        ? `${sizeInMb.toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
    setImageFileSize(formattedSize);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setSelectedImage(base64Data);
      setQualityStatus(null);
    };
    reader.readAsDataURL(file);

    // Asynchronously upload to Firebase Storage bucket in production mode
    setIsUploadingToStorage(true);
    try {
      const res = await uploadFileToStorage(file, 'disease-scans');
      setStorageFileUrl(res.downloadUrl);
      addToast('Uploaded to Firebase Storage', `Saved securely in storage bucket as ${file.name}`, 'info');
    } catch (err) {
      console.warn('Firebase storage background upload notice:', err);
    } finally {
      setIsUploadingToStorage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(null);
    setImageFileSize(null);
    setQualityStatus(null);
  };

  const handleAnalyzeCrop = async () => {
    if (!selectedImage) {
      addToast('No Image Selected', 'Please upload or capture a crop leaf photo first.', 'info');
      return;
    }

    setIsScanning(true);
    setScanProgress(5);
    setCurrentStep(0);

    // Step-by-step progress orchestration (~1.8s)
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next < SCAN_STEPS.length) {
          setScanProgress(Math.min(92, Math.round(((next + 1) / SCAN_STEPS.length) * 100)));
          return next;
        }
        return prev;
      });
    }, 280);

    try {
      const response = await fetch('/api/disease/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          crop: selectedCrop,
          language,
          isDemo: isDemoMode,
          userId: 'usr_farmer_ramesh',
        }),
      });

      clearInterval(stepInterval);
      setScanProgress(100);
      setCurrentStep(SCAN_STEPS.length - 1);

      const data = await response.json();

      setTimeout(() => {
        setIsScanning(false);
        if (response.ok && data.scan) {
          const scanWithStorage: DiseaseScanResult = {
            ...data.scan,
            imageUrl: storageFileUrl || data.scan.imageUrl,
          };
          setActiveResult(scanWithStorage);
          setQualityStatus(data.quality || null);
          addDiseaseScan(scanWithStorage);
          addToast(
            'Analysis Complete',
            `Identified possible diagnosis: ${data.scan.possibleDisease || data.scan.pathogen}`,
            'success'
          );
        } else {
          setQualityStatus(data.quality || {
            clarity: 'POOR',
            lighting: 'POOR',
            cropVisibility: 'OBSCURED',
            leafVisibility: 'OBSCURED',
            resolution: 'Low',
            passed: false,
            issues: ['Blurry or low contrast photo'],
            suggestions: ['Take a closer photo in better light'],
          });
          addToast('Scan Warning', data.error || 'The image is difficult to analyze.', 'info');
        }
      }, 400);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsScanning(false);
      console.error('Scan error:', err);
      addToast('Scan Failed', 'Could not complete scan. Please try again.', 'error');
    }
  };

  const handleSelectPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setSelectedImage(preset.img);
    setImageFileSize('1.4 MB');
    setSelectedCrop(preset.crop);
    setIsDemoMode(true);
    setQualityStatus(null);
  };

  const handleAskAi = (result: DiseaseScanResult) => {
    const prompt = `I just scanned my ${result.cropName} crop. The AI identified possible disease: "${result.possibleDisease || result.pathogen}" with ${result.confidenceScore}% confidence. What are the best organic treatments, field management practices, and dosage warnings for my field?`;
    askAiWithPrompt(prompt);
  };

  const handleSaveToDiary = (result: DiseaseScanResult) => {
    addDiaryEntry({
      date: new Date().toISOString().split('T')[0],
      category: 'Disease & Pest',
      crop: result.cropName,
      title: `Pathogen Scan: ${result.possibleDisease || result.pathogen.split('(')[0]}`,
      expenseAmountInr: 350,
      notes: `Identified with ${result.confidenceScore}% confidence. Severity: ${result.severity}. Recommendations: ${result.recommendedAction?.[0] || 'Inspect nearby plants.'}`,
    });
    addToast(
      'Saved to Farm Diary',
      'Disease scan report saved to your seasonal farm diary.',
      'success'
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. PAGE HEADER */}
      <div className="bg-white dark:bg-[#141C18] border border-emerald-900/10 dark:border-stone-800 p-6 sm:p-7 rounded-3xl shadow-sm shadow-emerald-950/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative background organic glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-100/40 dark:bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-700/20 text-[#144633] dark:text-emerald-300 text-xs font-bold tracking-wide uppercase">
              <Scan className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'hi' ? 'एआई फसल डॉक्टर' : 'AI Crop Doctor'}</span>
            </span>

            {/* Trust Indicator */}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF8F5] dark:bg-stone-900 text-stone-700 dark:text-stone-300 text-xs font-medium border border-stone-200 dark:border-stone-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'hi' ? 'ICAR व KVK दिशा-निर्देश आधारित' : 'ICAR & KVK Guided Agronomy'}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#144633] dark:text-[#ECFDF5]">
            {language === 'hi' ? '🔬 एआई फसल रोग स्कैनर व परामर्श' : 'AI Crop Disease Diagnostic Engine'}
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {language === 'hi'
              ? 'प्रभावित पत्ती का फोटो लें — 3 सेकंड में रोग पहचान, जैविक देसी काढ़ा व प्रमाणित रासायनिक स्प्रे की सही मात्रा पाएं।'
              : 'Capture or upload an affected leaf — get instant pathogen identification with dual biological and certified spray prescriptions.'}
          </p>
        </div>

        {/* Demo Mode Switch for Presentation */}
        <div className="bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-4 rounded-2xl shrink-0 self-start md:self-auto min-w-[210px] flex flex-col gap-2 relative">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{language === 'hi' ? 'कैलिब्रेटेड डेमो मोड' : 'Calibrated Mode'}</span>
            </div>
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isDemoMode ? 'bg-emerald-800' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isDemoMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            {isDemoMode
              ? (language === 'hi' ? 'त्वरित प्रस्तुति हेतु प्री-कैलिब्रेटेड सैम्पल्स' : 'Instant offline calibrated farm presets')
              : (language === 'hi' ? 'लाइव कंप्यूटर विजन मॉडल' : 'Live server-side vision model')}
          </span>
        </div>
      </div>

      {/* 2. MODE NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#141C18] p-2 sm:p-2.5 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveViewTab('scanner')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeViewTab === 'scanner'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>{language === 'hi' ? 'नया एआई स्कैन' : 'AI Disease Scanner'}</span>
          </button>

          <button
            onClick={() => setActiveViewTab('timeline')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeViewTab === 'timeline'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>
              {language === 'hi' ? 'भूखंड स्वास्थ्य टाइमलाइन' : 'Patch Timelines'}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeViewTab === 'timeline'
                  ? 'bg-emerald-950 text-emerald-200'
                  : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {cropPatches.length} {language === 'hi' ? 'प्लॉट' : 'Plots'}
            </span>
          </button>

          <button
            onClick={() => setActiveViewTab('history')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeViewTab === 'history'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{language === 'hi' ? 'स्कैन इतिहास' : 'Diagnostic History'}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeViewTab === 'history'
                  ? 'bg-emerald-950 text-emerald-200'
                  : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
              }`}
            >
              {diseaseScans.length}
            </span>
          </button>
        </div>

        {/* Quick helper tip */}
        <div className="hidden md:flex items-center gap-2 text-xs text-stone-500 pr-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {language === 'hi'
              ? 'उपचार व सुधार का ऐतिहासिक रिकॉर्ड खेत स्तर पर सहेजा जाता है'
              : 'Field-level spray dosages and pathology history stored'}
          </span>
        </div>
      </div>

      {/* VIEW: TIMELINE TAB */}
      {activeViewTab === 'timeline' && (
        <CropPatchTimelineCard
          language={language}
          onAskAiWithContext={(prompt) => askAiWithPrompt(prompt)}
          onOpenScannerForPatch={(patch) => {
            setSelectedCrop(patch.cropName);
            setActiveViewTab('scanner');
          }}
        />
      )}

      {/* VIEW: HISTORY TAB */}
      {activeViewTab === 'history' && (
        <div className="bg-white dark:bg-[#141C18] rounded-3xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-sm">
          <DiseaseScanHistory
            scans={diseaseScans}
            onSelectScan={(scan) => {
              setActiveResult(scan);
              if (scan.sampleImageUrl) setSelectedImage(scan.sampleImageUrl);
              setActiveViewTab('scanner');
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
            language={language}
          />
        </div>
      )}

      {/* VIEW: SCANNER TAB */}
      {activeViewTab === 'scanner' && (
        <div className="space-y-8">
          {/* Main Interactive Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload Area, Crop Selector & Scan Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* 2. UPLOAD AREA CARD */}
          <div className="bg-white dark:bg-[#141C18] rounded-3xl border border-emerald-900/10 dark:border-stone-800 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <span>
                  {language === 'hi'
                    ? 'प्रभावित पत्ती का फोटो लें'
                    : 'Target Leaf Diagnosis Frame'}
                </span>
              </h2>
              {selectedImage && (
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Ready to scan
                </span>
              )}
            </div>

            {/* Hidden Inputs for File Selection & Camera Capture */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* Drag & Drop Card / Image Preview with Diagnostic Framing Crosshairs */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (!selectedImage) fileInputRef.current?.click();
              }}
              className={`relative aspect-4/3 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group overflow-hidden ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/70 scale-98'
                  : selectedImage
                  ? 'border-emerald-800/20 bg-stone-950'
                  : 'border-emerald-900/20 dark:border-stone-700 hover:border-emerald-700 bg-[#FAF8F5] dark:bg-stone-900/50'
              }`}
            >
              {selectedImage ? (
                <>
                  <img
                    src={selectedImage}
                    alt="Selected leaf target"
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 text-white">
                    <span className="text-xs font-semibold">Click to replace photo</span>
                  </div>

                  {/* Top-Right Badge: File Size & Remove */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    {imageFileSize && (
                      <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-[11px] font-mono font-medium border border-white/20">
                        {imageFileSize}
                      </span>
                    )}
                    <button
                      onClick={handleRemoveImage}
                      title="Remove image"
                      className="w-7 h-7 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 flex items-center justify-center shadow-md transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                  {/* Diagnostic Crosshairs overlay */}
                  <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-emerald-700/60 rounded-tl-sm pointer-events-none" />
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-emerald-700/60 rounded-tr-sm pointer-events-none" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-emerald-700/60 rounded-bl-sm pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-emerald-700/60 rounded-br-sm pointer-events-none" />

                  {/* Center Target Indicator */}
                  <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-950/15 mb-3 group-hover:scale-105 transition-transform">
                    <Camera className="w-7 h-7 text-amber-300" />
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                    {language === 'hi' ? 'पत्ती को फ्रेम के बीच में रखें' : 'Position affected leaf within frame'}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 max-w-xs">
                    {language === 'hi' 
                      ? 'सीधी धूप व छाया से बचें • 15 सेमी की दूरी रखें' 
                      : 'Keep 15cm distance • Clear focus • High outdoor contrast'}
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] font-semibold text-stone-600 dark:text-stone-300 shadow-2xs">
                    <span>JPG, PNG, WEBP</span>
                    <span>·</span>
                    <span className="text-emerald-700 dark:text-emerald-400">Max 15MB</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Upload Controls (Take Photo & Upload Image) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-3 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-[#144633] dark:text-emerald-200 text-xs font-bold rounded-xl border border-emerald-700/25 shadow-2xs transition-all cursor-pointer min-h-[48px]"
              >
                <Camera className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <span>{language === 'hi' ? '📷 फोटो खीचें' : '📷 Take Photo'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-3 bg-white dark:bg-stone-900 hover:bg-stone-100 text-stone-800 dark:text-stone-200 text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs transition-all cursor-pointer min-h-[48px]"
              >
                <Upload className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                <span>{language === 'hi' ? '📁 गैलरी से चुनें' : '📁 Upload Photo'}</span>
              </button>
            </div>

            {/* 3. CROP SELECTION */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                {language === 'hi' ? 'फसल का प्रकार चुनें (या ऑटो-डिटेक्ट)' : 'Crop Species (or Auto-detect)'}
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full py-2.5 px-3 bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                {CROP_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Action Button: Analyze Crop */}
            <button
              onClick={handleAnalyzeCrop}
              disabled={isScanning || !selectedImage}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer min-h-[48px] ${
                !selectedImage
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                  : isScanning
                  ? 'bg-emerald-950 text-emerald-300 cursor-wait'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white hover:shadow-lg active:scale-98'
              }`}
            >
              <Scan className={`w-4 h-4 text-amber-300 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? (language === 'hi' ? 'रोग विश्लेषण चालू है...' : 'Analyzing Crop Pathogens...') : (language === 'hi' ? 'रोग विश्लेषण शुरू करें' : 'Run Pathogen Diagnosis')}</span>
            </button>
          </div>

          {/* Hackathon Demo Preset Library */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Instant Demo Presets</span>
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">1-Click Test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-emerald-50/60 hover:border-emerald-400 text-left transition-all cursor-pointer group"
                >
                  <img
                    src={preset.img}
                    alt={preset.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-800 group-hover:text-emerald-900 truncate">
                      {preset.title}
                    </div>
                    <div className="text-[11px] text-stone-500 truncate">
                      {preset.disease.split('(')[0]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scan Animation / Quality Validation / Disease Result Card */}
        <div className="lg:col-span-7 space-y-6">
          {/* 4. SCAN ANIMATION (During active scanning) */}
          {isScanning ? (
            <DiseaseScanAnimation
              currentStep={currentStep}
              steps={SCAN_STEPS}
              scanProgress={scanProgress}
              imageUrl={selectedImage}
            />
          ) : qualityStatus && !qualityStatus.passed ? (
            /* 5. IMAGE QUALITY WARNING CARD */
            <ImageQualityCheckCard
              quality={qualityStatus}
              onUploadBetterImage={() => fileInputRef.current?.click()}
              language={language}
            />
          ) : activeResult ? (
            /* 6-16. DISEASE RESULT CARD */
            <div className="space-y-4">
              {qualityStatus && qualityStatus.passed && (
                <ImageQualityCheckCard
                  quality={qualityStatus}
                  onUploadBetterImage={() => fileInputRef.current?.click()}
                  language={language}
                />
              )}

              <DiseaseResultCard
                result={activeResult}
                onAskAi={handleAskAi}
                onSaveToDiary={handleSaveToDiary}
                onConsultExpert={() => setCurrentView('talk-to-expert')}
                language={language}
              />
            </div>
          ) : (
            /* Placeholder state before first scan */
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4 shadow-sm flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                <Leaf className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-stone-800">
                  Ready to scan your crop
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Upload a photo on the left or choose a demo preset to run the computer vision plant pathology engine.
                </p>
              </div>
            </div>
          )}

          {/* Quick Tab Switcher Footer */}
          {diseaseScans.length > 1 && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 p-4 bg-stone-50/80 rounded-2xl border border-stone-200 text-xs">
              <div className="flex items-center gap-2 text-stone-600 font-medium">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>
                  {language === 'hi'
                    ? `${diseaseScans.length} स्कैन का इतिहास सुरक्षित है`
                    : `${diseaseScans.length} past diagnostic scans archived`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveViewTab('history');
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  {language === 'hi' ? 'पूरा इतिहास देखें →' : 'View Full History →'}
                </button>
                <span className="text-stone-300">|</span>
                <button
                  onClick={() => {
                    setActiveViewTab('timeline');
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  {language === 'hi' ? 'प्लॉट टाइमलाइन देखें →' : 'View Plot Timelines →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )}
</div>
);
};
