import React, { useState } from 'react';
import { Bell, Calendar, Clock, Smartphone, Volume2, CheckCircle2, X, Sparkles } from 'lucide-react';
import { CropLifecycleItem } from '../../shared/types';

interface HarvestReminderModalProps {
  crop: CropLifecycleItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cropId: string, reminderConfig: NonNullable<CropLifecycleItem['harvestReminder']>) => void;
  language?: string;
}

export const HarvestReminderModal: React.FC<HarvestReminderModalProps> = ({
  crop,
  isOpen,
  onClose,
  onSave,
  language = 'en',
}) => {
  const [enabled, setEnabled] = useState(crop.harvestReminder?.enabled ?? true);
  const [reminderDays, setReminderDays] = useState<number[]>(
    crop.harvestReminder?.reminderDaysBefore ?? [7, 3, 1]
  );
  const [channel, setChannel] = useState<'push' | 'sms' | 'voice' | 'all'>(
    crop.harvestReminder?.channel ?? 'push'
  );
  const [isSavedToast, setIsSavedToast] = useState(false);

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    if (reminderDays.includes(day)) {
      setReminderDays(reminderDays.filter((d) => d !== day));
    } else {
      setReminderDays([...reminderDays, day].sort((a, b) => b - a));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(crop.id, {
      enabled,
      reminderDaysBefore: reminderDays,
      channel,
      scheduledDate: new Date().toISOString(),
    });
    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">
                {language === 'hi' ? 'कटाई अनुस्मारक शेड्यूलर' : 'Harvest Window Push Scheduler'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {crop.cropName} ({crop.variety}) • Harvest: {crop.expectedHarvestDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSavedToast ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="font-bold text-stone-900 dark:text-stone-100 text-lg">
              {language === 'hi' ? 'अनुस्मारक सफलतापूर्वक सेट हो गया!' : 'Harvest Reminder Scheduled Successfully!'}
            </p>
            <p className="text-xs text-stone-500 text-center max-w-xs">
              {language === 'hi'
                ? 'निर्धारित तिथियों पर आपके मोबाइल पर पुश नोटिफिकेशन और अलर्ट भेजे जाएंगे।'
                : 'Automated push alerts and window countdown reminders have been successfully configured.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-6 pt-5">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-900">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  {language === 'hi' ? 'पुश अनुस्मारक सक्षम करें' : 'Enable Harvest Push Reminders'}
                </span>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                  {language === 'hi' ? 'फसल की कटाई विंडो पास आने पर अलर्ट प्राप्त करें' : 'Get automated countdown alerts as harvest window approaches'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {/* Reminder Windows Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                {language === 'hi' ? 'कटाई से कितने दिन पहले अलर्ट चाहिए?' : 'Alert Timing (Days Before Harvest)'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[14, 7, 3, 1].map((day) => {
                  const isSelected = reminderDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-green-700 text-white border-green-700 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="text-sm font-display font-bold">{day} Days</span>
                      <span className="text-[10px] opacity-80">Prior</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification Channel */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                {language === 'hi' ? 'अधिसूचना माध्यम (Channel)' : 'Notification Channel'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('push')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    channel === 'push'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-600'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Push App</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    channel === 'sms'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-600'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <span>SMS Alert</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('voice')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    channel === 'voice'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-600'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>IVR Voice</span>
                </button>
              </div>
            </div>

            {/* Sowing to Harvest Info Summary */}
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs space-y-1">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>{language === 'hi' ? 'बुवाई तिथि' : 'Sowing Date'}:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{crop.sowingDate}</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>{language === 'hi' ? 'अनुमानित कटाई विंडो' : 'Expected Harvest Window'}:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{crop.expectedHarvestDate}</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold rounded-2xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-2xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === 'hi' ? 'अनुस्मारक सहेजें' : 'Save Harvest Reminder'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
