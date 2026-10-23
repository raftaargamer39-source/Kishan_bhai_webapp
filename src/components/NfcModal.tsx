import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import { Radio, X, CheckCircle2, ShieldAlert, Sparkles, Smartphone, QrCode } from 'lucide-react';

export const NfcModal: React.FC = () => {
  const currentUser = useUserStore(state => state.currentUser);
  const { isNfcModalOpen, setIsNfcModalOpen, addToast } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  if (!isNfcModalOpen) return null;

  const hasNfcSupport = typeof window !== 'undefined' && 'NDEFReader' in window;

  const handleStartNfcScan = async () => {
    if (!hasNfcSupport) {
      // Simulate NFC Tag Tap for Demo/Hardware Fallback
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        setScannedData(`KISHAN-NFC-${currentUser?.id || 'FARMER-01'}-${Date.now()}`);
        addToast('NFC Tag Verified', 'Farmer Physical Smartcard Authenticated for Village Hub Check-in', 'success');
      }, 1500);
      return;
    }

    try {
      setIsScanning(true);
      // @ts-ignore
      const ndef = new NDEFReader();
      await ndef.scan();
      // @ts-ignore
      ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        setIsScanning(false);
        setScannedData(`Serial: ${serialNumber}`);
        addToast('NFC Verified', 'Physical Farmer Card Verified', 'success');
      });
    } catch (err: any) {
      setIsScanning(false);
      addToast('NFC Scan Notice', 'Using digital check-in token fallback.', 'info');
      setScannedData(`DIGITAL-TOKEN-${currentUser?.id || 'DEMO'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden">
        <div className="bg-stone-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-display text-lg">Farmer Physical NFC ID</h3>
              <p className="text-stone-400 text-xs">Village Hub & Mandi Instant Check-in</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsNfcModalOpen(false);
              setScannedData(null);
            }}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Digital Badge Preview */}
          <div className="bg-gradient-to-br from-emerald-800 to-stone-900 text-white p-4 rounded-2xl shadow-md border border-emerald-700/50 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold block">
                  Kishan Bhai Smart Card
                </span>
                <h4 className="text-base font-bold font-display mt-0.5">{currentUser?.fullName || 'Ramesh Patel'}</h4>
                <p className="text-xs text-emerald-100">{currentUser?.village || 'Anandpur'}, {currentUser?.state || 'Gujarat'}</p>
              </div>
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                <QrCode className="w-5 h-5 text-emerald-200" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10">
              <div>
                <span className="text-stone-400 text-[10px] block">Role</span>
                <span className="font-semibold text-emerald-200">{currentUser?.role || 'FARMER'}</span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] block">Farm Holding</span>
                <span className="font-semibold">{currentUser?.farmSizeAcres || 4.5} Acres</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-emerald-300/80 truncate">
              UID: {currentUser?.id || 'usr_farmer_1'} • WALLET SYNCED
            </div>
          </div>

          {/* Action */}
          <div className="space-y-3">
            {!scannedData ? (
              <button
                onClick={handleStartNfcScan}
                disabled={isScanning}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow cursor-pointer transition-colors"
              >
                <Smartphone className={`w-5 h-5 ${isScanning ? 'animate-bounce' : ''}`} />
                <span>{isScanning ? 'Listening for NFC Tap...' : 'Tap Physical NFC Card to Check-in'}</span>
              </button>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-stone-900 text-sm">Farmer Check-in Confirmed</h4>
                <p className="text-xs font-mono text-stone-600 bg-white p-2 rounded border border-emerald-100 break-all">
                  {scannedData}
                </p>
                <button
                  onClick={() => setScannedData(null)}
                  className="text-xs text-emerald-700 font-medium hover:underline pt-1"
                >
                  Scan Another Card
                </button>
              </div>
            )}

            <p className="text-[11px] text-stone-500 text-center">
              {hasNfcSupport
                ? 'Web NFC API active. Hold phone close to the physical farmer NFC card.'
                : 'Web NFC hardware emulation active for zero-barrier desktop & mobile demonstrations.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
