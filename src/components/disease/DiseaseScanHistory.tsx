import React from 'react';
import { Leaf, Clock, ArrowRight, Trash2, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DiseaseScanResult } from '../../../shared/types';

interface DiseaseScanHistoryProps {
  scans: DiseaseScanResult[];
  onSelectScan: (scan: DiseaseScanResult) => void;
  onDeleteScan?: (scanId: string) => void;
  language?: string;
}

export const DiseaseScanHistory: React.FC<DiseaseScanHistoryProps> = ({
  scans,
  onSelectScan,
  onDeleteScan,
  language = 'en',
}) => {
  if (!scans || scans.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
          <Leaf className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-stone-700">No previous scans found</h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Take a photo or upload an image of your crop to start your crop pathology history.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MODERATE':
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-700" />
          <span>{language === 'hi' ? 'पिछले स्कैन रिकॉर्ड्स' : 'Previous Scans'}</span>
        </h3>
        <span className="text-xs text-stone-500 font-medium">
          {scans.length} {scans.length === 1 ? 'Scan' : 'Scans'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {scans.map((scan) => (
          <div
            key={scan.id}
            onClick={() => onSelectScan(scan)}
            className="group bg-white rounded-2xl border border-stone-200 p-4 shadow-xs hover:border-emerald-500/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            {/* Header: Crop and Date */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-white bg-green-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Leaf className="w-2.5 h-2.5" />
                    <span>{scan.cropName}</span>
                  </span>
                  {scan.isDemo && (
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 uppercase">
                      Demo
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stone-400 font-medium flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(scan.scannedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Severity Pill */}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getSeverityBadge(
                  scan.severity
                )}`}
              >
                {scan.severity}
              </span>
            </div>

            {/* Disease Name & Confidence */}
            <div>
              <h4 className="text-sm font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                {scan.possibleDisease || scan.pathogen}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-stone-600 font-medium">Confidence:</span>
                <span className="text-xs font-bold text-emerald-800 font-mono">
                  {scan.confidenceScore}%
                </span>
              </div>
            </div>

            {/* Actions: View Report */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
              <span>View Report</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
