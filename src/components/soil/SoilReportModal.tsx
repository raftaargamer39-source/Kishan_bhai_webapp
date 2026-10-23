import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Sparkles,
  RefreshCw,
  Cloud,
} from 'lucide-react';
import { SoilHealthData } from '../../../shared/types';
import { uploadFileToStorage } from '../../services/storageService';

interface SoilReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoilReportModal: React.FC<SoilReportModalProps> = ({ isOpen, onClose }) => {
  const { soilHealth, saveSoilRecord, uploadSoilReport, language, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [storageUploading, setStorageUploading] = useState(false);
  const [storageProgress, setStorageProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Manual Form State
  const [formData, setFormData] = useState({
    farmerName: soilHealth.farmerName || 'Ramesh Patel',
    village: soilHealth.village || 'Anandpur, Taluka Gondal',
    district: soilHealth.district || 'Rajkot',
    state: soilHealth.state || 'Gujarat',
    sampleId: soilHealth.sampleId || `SHC-${Date.now().toString().slice(-6)}`,
    testDate: soilHealth.testDate || new Date().toISOString().split('T')[0],
    soilType: soilHealth.soilType || 'Medium Black Cotton (Vertisols)',
    soilPh: soilHealth.soilPh || 7.4,
    organicCarbonPct: soilHealth.organicCarbonPct || 0.62,
    nitrogenKgHa: soilHealth.nitrogenKgHa || 165,
    phosphorusKgHa: soilHealth.phosphorusKgHa || 24,
    potassiumKgHa: soilHealth.potassiumKgHa || 340,
    electricalConductivityDsM: soilHealth.electricalConductivityDsM || 0.42,
    documentUrl: soilHealth.documentUrl || '',
  });

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setStorageUploading(true);
    setStorageProgress(10);
    setUploadedFileName(file.name);

    try {
      // 1. Upload file to Firebase Storage bucket in production
      let storageUrl = '';
      try {
        const storageResult = await uploadFileToStorage(file, 'soil-reports', (progressPercent) => {
          setStorageProgress(progressPercent);
        });
        storageUrl = storageResult.downloadUrl;
        setUploadedFileUrl(storageUrl);
        addToast(
          'Saved to Firebase Storage',
          `File ${file.name} securely archived in production bucket.`,
          'info'
        );
      } catch (storageErr) {
        console.warn('Firebase storage upload notice:', storageErr);
      }

      // 2. Read base64 for OCR extraction
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const extracted = await uploadSoilReport(base64, file.type);
        setFormData((prev) => ({
          ...prev,
          ...extracted,
          soilPh: extracted.soilPh || prev.soilPh,
          organicCarbonPct: extracted.organicCarbonPct || prev.organicCarbonPct,
          nitrogenKgHa: extracted.nitrogenKgHa || prev.nitrogenKgHa,
          phosphorusKgHa: extracted.phosphorusKgHa || prev.phosphorusKgHa,
          potassiumKgHa: extracted.potassiumKgHa || prev.potassiumKgHa,
          soilType: extracted.soilType || prev.soilType,
          documentUrl: storageUrl || prev.documentUrl,
        }));
        setIsProcessing(false);
        setStorageUploading(false);
        setActiveTab('manual');
        addToast('OCR Extraction Complete', 'Extracted metrics loaded into review form. Review and save.', 'success');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setStorageUploading(false);
      addToast('Upload Failed', 'Could not parse document. Please enter values manually.', 'error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSimulateSampleSHC = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      const sample = await uploadSoilReport('sample_demo');
      setFormData((prev) => ({
        ...prev,
        ...sample,
        sampleId: `SHC-GOVT-${Math.floor(100000 + Math.random() * 900000)}`,
        testDate: new Date().toISOString().split('T')[0],
      }));
      setIsProcessing(false);
      setActiveTab('manual');
      addToast('Sample SHC Loaded', 'Government KVK Soil Report loaded for review.', 'info');
    }, 600);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await saveSoilRecord({
      ...formData,
      soilPh: Number(formData.soilPh),
      organicCarbonPct: Number(formData.organicCarbonPct),
      nitrogenKgHa: Number(formData.nitrogenKgHa),
      phosphorusKgHa: Number(formData.phosphorusKgHa),
      potassiumKgHa: Number(formData.potassiumKgHa),
      electricalConductivityDsM: Number(formData.electricalConductivityDsM),
    });
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
              <FlaskConical className="w-4 h-4" />
              <span>{language === 'hi' ? 'मृदा स्वास्थ्य कार्ड प्रविष्टि' : 'Soil Health Card Integration'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {language === 'hi' ? 'मृदा रिपोर्ट अपलोड या संपादित करें' : 'Upload or Update Soil Report'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {language === 'hi'
                ? 'सरकारी मृदा स्वास्थ्य कार्ड (SHC) अपलोड करें या प्रयोगशाला परीक्षण परिणाम दर्ज करें।'
                : 'Upload your official Soil Health Card (PDF/Image) or manually input lab test metrics.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-stone-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'upload' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            📄 {language === 'hi' ? 'दस्तावेज़ अपलोड (OCR)' : 'Upload Document (AI OCR)'}
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'manual' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            ✏️ {language === 'hi' ? 'मैन्युअल प्रविष्टि' : 'Manual Entry & Review'}
          </button>
        </div>

        {/* Upload Mode */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragOver
                  ? 'border-emerald-600 bg-emerald-50/50'
                  : 'border-stone-300 bg-stone-50 hover:border-emerald-600'
              }`}
            >
              <FileText className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
              <div className="text-sm font-bold text-stone-800">
                {language === 'hi' ? 'मृदा स्वास्थ्य कार्ड फ़ाइल यहां खींचें' : 'Drag & drop your Soil Health Card here'}
              </div>
              <div className="text-xs text-stone-500 mt-1">Supports PDF, JPG, PNG from Gov Soil Testing Labs (up to 10MB)</div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <label className="bg-[#1B3B11] hover:bg-green-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-md inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>{language === 'hi' ? 'फ़ाइल चुनें' : 'Browse File'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSimulateSampleSHC}
                  disabled={isProcessing}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>{isProcessing ? 'Parsing...' : 'Load Sample ICAR / KVK Report'}</span>
                </button>
              </div>

              {/* Firebase Storage Upload Progress */}
              {storageUploading && (
                <div className="mt-4 space-y-1.5 bg-emerald-50/80 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-900 animate-in fade-in">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5 text-emerald-700 animate-bounce" />
                      <span>Uploading to Firebase Storage ({uploadedFileName})...</span>
                    </span>
                    <span className="font-mono">{storageProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-emerald-200/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${Math.max(5, storageProgress)}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadedFileUrl && (
                <div className="mt-3 flex items-center justify-between bg-emerald-50 border border-emerald-200/80 px-3 py-2 rounded-xl text-xs text-emerald-900">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">Archived in Firebase Storage:</span>
                    <span className="truncate text-stone-600 font-mono text-[11px]">{uploadedFileName}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold uppercase shrink-0">Production Bucket</span>
                </div>
              )}
            </div>

            {/* Cloud Storage Status Banner */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-semibold text-stone-800">Firebase Storage:</span>
                <span className="text-emerald-700 font-medium">Default Bucket Active</span>
              </div>
              <span className="font-mono text-[10px] text-stone-500 hidden sm:inline">
                kishan-bhai-a1c8d.firebasestorage.app
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Government SHC OCR Support:</span> The Kisan Bhai Vision model reads standard Soil Health Cards issued under the National Soil Health Scheme, extracting N-P-K, pH, Organic Carbon, and Micronutrients instantly.
              </div>
            </div>
          </div>
        )}

        {/* Manual Form Mode */}
        {activeTab === 'manual' && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Farmer Name</label>
                <input
                  type="text"
                  value={formData.farmerName}
                  onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Soil Type / Soil Texture</label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden"
                >
                  <option value="Medium Black Cotton (Vertisols)">Medium Black Cotton (Vertisols)</option>
                  <option value="Deep Black Soil">Deep Black Clayey Soil</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                  <option value="Alluvial Loam">Alluvial Loam</option>
                  <option value="Red Laterite Soil">Red / Laterite Soil</option>
                  <option value="Saline / Alkaline Soil">Saline / Alkaline Soil</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Village & Taluka</label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Sample ID / SHC Number</label>
                <input
                  type="text"
                  value={formData.sampleId}
                  onChange={(e) => setFormData({ ...formData, sampleId: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Nutrients Row */}
            <div className="pt-2 border-t border-stone-200">
              <div className="text-xs font-bold text-stone-800 mb-3 flex items-center justify-between">
                <span>🧪 Key Chemical & Nutrient Parameters</span>
                <span className="text-[11px] font-normal text-stone-500">Auto-calculates Soil Health Score</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <label className="block text-[11px] font-bold text-stone-700">Soil pH</label>
                  <input
                    type="number"
                    step="0.1"
                    min="3"
                    max="11"
                    value={formData.soilPh}
                    onChange={(e) => setFormData({ ...formData, soilPh: parseFloat(e.target.value) || 7.0 })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 mt-1"
                    required
                  />
                  <div className="text-[10px] text-stone-500 mt-0.5">Ideal: 6.5 - 7.8</div>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <label className="block text-[11px] font-bold text-stone-700">Organic Carbon (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="5"
                    value={formData.organicCarbonPct}
                    onChange={(e) => setFormData({ ...formData, organicCarbonPct: parseFloat(e.target.value) || 0.5 })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 mt-1"
                    required
                  />
                  <div className="text-[10px] text-stone-500 mt-0.5">Ideal: &gt; 0.75%</div>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <label className="block text-[11px] font-bold text-stone-700">Nitrogen (kg/ha)</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={formData.nitrogenKgHa}
                    onChange={(e) => setFormData({ ...formData, nitrogenKgHa: parseInt(e.target.value) || 150 })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 mt-1"
                    required
                  />
                  <div className="text-[10px] text-stone-500 mt-0.5">Ideal: 280 - 560</div>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <label className="block text-[11px] font-bold text-stone-700">Phosphorus (kg/ha)</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={formData.phosphorusKgHa}
                    onChange={(e) => setFormData({ ...formData, phosphorusKgHa: parseInt(e.target.value) || 20 })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 mt-1"
                    required
                  />
                  <div className="text-[10px] text-stone-500 mt-0.5">Ideal: 23 - 56</div>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <label className="block text-[11px] font-bold text-stone-700">Potassium (kg/ha)</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={formData.potassiumKgHa}
                    onChange={(e) => setFormData({ ...formData, potassiumKgHa: parseInt(e.target.value) || 300 })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 mt-1"
                    required
                  />
                  <div className="text-[10px] text-stone-500 mt-0.5">Ideal: 145 - 335</div>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <label className="block text-[11px] font-bold text-stone-700">EC (dS/m - Salinity)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="10"
                    value={formData.electricalConductivityDsM}
                    onChange={(e) => setFormData({ ...formData, electricalConductivityDsM: parseFloat(e.target.value) || 0.4 })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 mt-1"
                    required
                  />
                  <div className="text-[10px] text-stone-500 mt-0.5">Ideal: &lt; 0.8 dS/m</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-2xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 py-3 bg-[#1B3B11] hover:bg-green-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Calculate & Save Soil Record</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
