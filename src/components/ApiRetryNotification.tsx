import React, { useEffect, useState } from 'react';
import { RefreshCw, Zap, ShieldCheck, AlertTriangle } from 'lucide-react';
import { RetryEventDetail } from '../services/apiClient';

export const ApiRetryNotification: React.FC = () => {
  const [activeRetry, setActiveRetry] = useState<RetryEventDetail | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  useEffect(() => {
    const handleRetry = (event: Event) => {
      const customEvent = event as CustomEvent<RetryEventDetail>;
      const detail = customEvent.detail;

      if (detail.status === 'retrying') {
        setActiveRetry(detail);
        const seconds = Math.ceil(detail.delayMs / 1000);
        setRemainingSeconds(seconds);
      } else if (detail.status === 'succeeded' || detail.status === 'exhausted') {
        setTimeout(() => {
          setActiveRetry(null);
        }, 2000);
      }
    };

    window.addEventListener('kishan-api-retry', handleRetry);
    return () => window.removeEventListener('kishan-api-retry', handleRetry);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  if (!activeRetry) return null;

  return (
    <div
      id="api-rate-limit-notification"
      className="fixed top-18 right-4 sm:right-6 z-50 max-w-sm w-full bg-amber-950/95 text-amber-100 border border-amber-800/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-2 flex items-start gap-3"
    >
      <div className="w-8 h-8 rounded-xl bg-amber-900/60 border border-amber-700/60 flex items-center justify-center shrink-0 text-amber-400">
        <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-xs text-amber-200 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            API Rate Limit Guardian
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-300 border border-amber-700/50">
            Retry {activeRetry.attempt}/{activeRetry.maxRetries}
          </span>
        </div>

        <p className="text-[11px] text-amber-200/90 mt-1 leading-snug">
          {activeRetry.reason || 'Service rate limit active.'} Retrying automatically in{' '}
          <strong className="text-white font-mono">{remainingSeconds}s</strong>...
        </p>

        <div className="mt-2 w-full bg-amber-950 rounded-full h-1.5 overflow-hidden border border-amber-900">
          <div
            className="bg-amber-400 h-full transition-all duration-1000 ease-linear rounded-full"
            style={{
              width: `${Math.max(5, (1 - remainingSeconds / Math.max(1, activeRetry.delayMs / 1000)) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
