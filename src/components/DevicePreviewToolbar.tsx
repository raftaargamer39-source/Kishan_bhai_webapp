import React from 'react';
import { Smartphone, Tablet, Monitor, Maximize2 } from 'lucide-react';

export type DeviceMode = 'full' | 'desktop' | 'tablet' | 'mobile';

interface DevicePreviewToolbarProps {
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
}

export const DevicePreviewToolbar: React.FC<DevicePreviewToolbarProps> = ({ deviceMode, setDeviceMode }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-stone-900/95 dark:bg-stone-900/95 text-white backdrop-blur-md px-3 py-2 rounded-2xl shadow-2xl border border-stone-700/60 flex items-center gap-2 text-xs font-medium">
      <span className="text-stone-400 hidden sm:inline font-mono text-[11px] uppercase tracking-wider pl-1">Device Preview:</span>
      <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl">
        <button
          onClick={() => setDeviceMode('full')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            deviceMode === 'full' ? 'bg-green-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
          }`}
          title="Full Screen / Responsive"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Full</span>
        </button>
        <button
          onClick={() => setDeviceMode('desktop')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            deviceMode === 'desktop' ? 'bg-green-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
          }`}
          title="Desktop View (1280px)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Desktop</span>
        </button>
        <button
          onClick={() => setDeviceMode('tablet')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            deviceMode === 'tablet' ? 'bg-green-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
          }`}
          title="Tablet View (768px - iPad)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Tablet</span>
        </button>
        <button
          onClick={() => setDeviceMode('mobile')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            deviceMode === 'mobile' ? 'bg-green-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
          }`}
          title="Mobile View (375px - iPhone)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Mobile</span>
        </button>
      </div>
    </div>
  );
};
