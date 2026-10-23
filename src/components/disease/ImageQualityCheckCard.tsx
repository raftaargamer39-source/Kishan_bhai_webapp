import React from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Sparkles, Sun, Eye, Layers, ZoomIn } from 'lucide-react';
import { DiseaseScanImageQuality } from '../../../shared/types';

interface ImageQualityCheckCardProps {
  quality: DiseaseScanImageQuality;
  onUploadBetterImage: () => void;
  language?: string;
}

export const ImageQualityCheckCard: React.FC<ImageQualityCheckCardProps> = ({
  quality,
  onUploadBetterImage,
  language = 'en',
}) => {
  if (!quality.passed) {
    return (
      <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in duration-300">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
              Image Quality Check
            </div>
            <h3 className="text-base sm:text-lg font-bold text-rose-950 mt-0.5">
              {language === 'hi' ? 'तस्वीर का विश्लेषण करना कठिन है।' : 'The image is difficult to analyze.'}
            </h3>
            <p className="text-xs text-rose-800/90 mt-1">
              {language === 'hi'
                ? 'स्पष्ट पहचान हेतु कृपया नीचे दिए गए सुझावों का पालन करें और बेहतर तस्वीर अपलोड करें।'
                : 'For accurate disease detection, the leaf must be clearly visible with sharp focus and balanced lighting.'}
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-white/80 rounded-2xl p-4 border border-rose-200 space-y-2">
          <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'hi' ? 'बेहतर परिणाम के लिए सुझाव:' : 'Suggestions for Better Results:'}</span>
          </div>
          <ul className="space-y-1.5">
            <li className="text-xs text-stone-700 flex items-center gap-2">
              <ZoomIn className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{language === 'hi' ? 'पत्ती की नज़दीकी तस्वीर लें (Take a closer photo)' : 'Take a closer photo'}</span>
            </li>
            <li className="text-xs text-stone-700 flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{language === 'hi' ? 'अच्छी रोशनी का उपयोग करें (Use better lighting)' : 'Use better lighting'}</span>
            </li>
            <li className="text-xs text-stone-700 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{language === 'hi' ? 'पत्ती पर फोकस रखें (Keep the leaf in focus)' : 'Keep the leaf in focus'}</span>
            </li>
            <li className="text-xs text-stone-700 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{language === 'hi' ? 'एक साथ कई पत्तियां न लाएं (Avoid multiple overlapping leaves)' : 'Avoid multiple overlapping leaves'}</span>
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <button
          onClick={onUploadBetterImage}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{language === 'hi' ? 'बेहतर तस्वीर अपलोड करें' : 'Upload Better Image'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="text-xs font-bold text-stone-800">
          Image Quality Assessment: Passed
        </span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-stone-600 font-medium">
        <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200">
          Clarity: {quality.clarity}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200">
          Lighting: {quality.lighting}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200">
          Res: {quality.resolution}
        </span>
      </div>
    </div>
  );
};
