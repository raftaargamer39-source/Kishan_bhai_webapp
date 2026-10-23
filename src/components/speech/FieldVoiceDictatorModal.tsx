import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  CheckCircle2,
  BookOpen,
  DollarSign,
  Layers,
  Sprout,
  Languages,
  RotateCcw,
  Volume2,
  AlertCircle,
} from 'lucide-react';
import {
  INDIAN_SPEECH_LANGUAGES,
  parseFarmVoiceDictation,
  ParsedFarmDiaryVoice,
  speakText,
  stopSpeech,
  isSpeechRecognitionSupported,
} from '../../services/webSpeechService';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { FarmDiaryRecord } from '../../../shared/types';

interface FieldVoiceDictatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEntry: (entry: Omit<FarmDiaryRecord, 'id' | 'createdAt'>) => void;
  defaultCrop?: string;
  language: string;
}

export const FieldVoiceDictatorModal: React.FC<FieldVoiceDictatorModalProps> = ({
  isOpen,
  onClose,
  onSaveEntry,
  defaultCrop = 'BT Cotton',
  language,
}) => {
  const [selectedVoiceLang, setSelectedVoiceLang] = useState(() => {
    const matched = INDIAN_SPEECH_LANGUAGES.find((l) => l.code === language);
    return matched?.speechCode || 'hi-IN';
  });

  useEffect(() => {
    const matched = INDIAN_SPEECH_LANGUAGES.find((l) => l.code === language);
    if (matched) {
      setSelectedVoiceLang(matched.speechCode);
    }
  }, [language]);
  const [parsedResult, setParsedResult] = useState<ParsedFarmDiaryVoice | null>(null);
  const [liveSpokenText, setLiveSpokenText] = useState('');

  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: selectedVoiceLang,
    continuous: true,
    interimResults: true,
    onResult: (text, isFinal) => {
      setLiveSpokenText(text);
      if (text.trim().length > 3) {
        const parsed = parseFarmVoiceDictation(text, defaultCrop);
        setParsedResult(parsed);
      }
    },
  });

  // Auto-start listening on modal open for instant hands-free field recording
  useEffect(() => {
    if (isOpen && isSupported) {
      resetTranscript();
      setLiveSpokenText('');
      setParsedResult(null);
      startListening({
        lang: selectedVoiceLang,
        continuous: true,
        interimResults: true,
        onResult: (text) => {
          setLiveSpokenText(text);
          if (text.trim().length > 3) {
            const parsed = parseFarmVoiceDictation(text, defaultCrop);
            setParsedResult(parsed);
          }
        },
      });
    } else {
      stopListening();
      stopSpeech();
    }
  }, [isOpen, selectedVoiceLang]);

  if (!isOpen) return null;

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening({
        lang: selectedVoiceLang,
        continuous: true,
        interimResults: true,
        onResult: (text) => {
          setLiveSpokenText(text);
          if (text.trim().length > 3) {
            const parsed = parseFarmVoiceDictation(text, defaultCrop);
            setParsedResult(parsed);
          }
        },
      });
    }
  };

  const handleSaveParsedEntry = () => {
    if (!parsedResult) return;
    
    onSaveEntry({
      date: new Date().toISOString().split('T')[0],
      category: parsedResult.category,
      crop: parsedResult.crop,
      title: parsedResult.title,
      expenseAmountInr: parsedResult.expenseAmountInr,
      revenueAmountInr: parsedResult.revenueAmountInr,
      notes: parsedResult.notes,
      syncedWithCloud: true,
    });

    // Provide voice confirmation
    speakText(
      language === 'hi'
        ? `खेत डायरी में ${parsedResult.title} सुरक्षित कर लिया गया है।`
        : `Farm log saved for ${parsedResult.title}.`,
      { lang: selectedVoiceLang }
    );

    stopListening();
    onClose();
  };

  const sampleVoicePrompts = language === 'hi'
    ? [
        'आज 2 बोरी यूरिया खाद 540 रुपये में गेहूं के खेत में डाली।',
        'कपास में इल्ली की रोकथाम के लिए बायो नीम तेल का छिड़काव किया, 350 रुपये मजदूरी।',
        'सरसों की 10 क्विंटल कटाई की और मंडी में 54000 रुपये में बेची।',
        'मूंगफली के खेत में 3 घंटे ड्रिप से पानी दिया।',
      ]
    : [
        'Sprayed Bio-Neem oil on BT Cotton field for aphid protection, spent 400 rupees on 2 labourers.',
        'Applied 2 bags of DAP fertilizer on Sharbati Wheat, total expense 2700 rupees.',
        'Harvested 12 quintals of Mustard and sold at APMC Mandi for 65000 rupees.',
        'Irrigated Groundnut crop for 4 hours using micro-sprinklers.',
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-stone-200 space-y-5 text-stone-900 overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-green-700 flex items-center justify-center font-bold">
              <Mic className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold font-display text-base text-stone-900">
                  {language === 'hi' ? 'खेत में बोलकर डायरी लिखें (Web Speech)' : 'Hands-Free Field Voice Dictator'}
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-semibold px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                {language === 'hi'
                  ? 'खेत में काम करते हुए सीधे बोलें — AI खाद, खर्च व फसल अपने आप पहचान लेगा'
                  : 'Speak naturally in field — AI automatically extracts crop, category & expense'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopListening();
              stopSpeech();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-50 p-2.5 rounded-2xl border border-stone-200/80 text-xs">
          <div className="flex items-center gap-1.5 text-stone-600 font-medium">
            <Languages className="w-4 h-4 text-emerald-700" />
            <span>Spoken Language:</span>
          </div>

          <select
            value={selectedVoiceLang}
            onChange={(e) => setSelectedVoiceLang(e.target.value)}
            className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
          >
            {INDIAN_SPEECH_LANGUAGES.map((lang) => (
              <option key={lang.speechCode} value={lang.speechCode}>
                {lang.nativeName} ({lang.label})
              </option>
            ))}
          </select>
        </div>

        {/* Live Visual Waveform & Microphone Action Target */}
        <div className="bg-gradient-to-b from-stone-900 to-stone-950 text-white rounded-2xl p-6 text-center space-y-4 shadow-inner relative overflow-hidden">
          {/* Animated Waveform Bars */}
          <div className="flex items-center justify-center gap-1.5 h-12">
            {[40, 75, 95, 60, 100, 80, 50, 90, 70, 45, 85, 60].map((h, i) => (
              <span
                key={i}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isListening
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-stone-700'
                }`}
                style={{
                  height: isListening ? `${Math.max(12, Math.round(h * Math.random()))}px` : '8px',
                  animationDelay: `${i * 70}ms`,
                }}
              />
            ))}
          </div>

          {/* Large Pulsing Touch Target */}
          <div className="relative inline-block">
            <button
              type="button"
              onClick={handleToggleMic}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all transform active:scale-95 shadow-xl cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white ring-8 ring-rose-500/30 scale-105'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-8 ring-emerald-500/20'
              }`}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 animate-bounce" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              {isListening
                ? language === 'hi' ? 'बोलिए, सुन रहा है...' : 'Listening in Field...'
                : language === 'hi' ? 'बोलने के लिए माइक दबाएं' : 'Tap Microphone to Speak'}
            </div>
            <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
              {isListening
                ? 'Speak continuously. Real-time words and numbers appear below.'
                : 'Supports Hindi, Gujarati, Marathi, Punjabi, Telugu & English.'}
            </p>
          </div>

          {/* Error Message if Any */}
          {error && (
            <div className="bg-rose-950/80 border border-rose-800/80 rounded-xl p-2.5 text-rose-200 text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Live Real-Time Transcript Display */}
        <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-1 text-xs">
          <div className="flex items-center justify-between text-stone-500 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Voice Transcription:</span>
            </span>
            {(transcript || interimTranscript) && (
              <button
                type="button"
                onClick={() => {
                  resetTranscript();
                  setLiveSpokenText('');
                  setParsedResult(null);
                }}
                className="text-stone-400 hover:text-stone-700 flex items-center gap-1 text-[10px] cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="min-h-[48px] text-stone-800 text-sm font-medium leading-relaxed italic bg-white p-2.5 rounded-xl border border-stone-200/80">
            {transcript || interimTranscript ? (
              <span>
                {transcript}{' '}
                <span className="text-emerald-700 font-semibold">{interimTranscript}</span>
              </span>
            ) : (
              <span className="text-stone-400 text-xs not-italic">
                "{sampleVoicePrompts[0]}"
              </span>
            )}
          </div>
        </div>

        {/* Smart Extraction Breakdown Preview */}
        {parsedResult && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
              <div className="font-bold text-green-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Smart Agricultural Extraction</span>
              </div>
              <span className="text-[10px] font-semibold bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-md font-mono">
                {parsedResult.category}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-stone-800">
              <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-stone-500 font-bold block">CATEGORY</span>
                <span className="font-bold text-green-700">{parsedResult.category}</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-stone-500 font-bold block">CROP</span>
                <span className="font-bold text-stone-900">{parsedResult.crop}</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-emerald-100 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-stone-500 font-bold block">
                  {parsedResult.revenueAmountInr ? 'REVENUE (INCOME)' : 'EXPENSE (₹)'}
                </span>
                <span className="font-bold text-emerald-700 font-display text-sm">
                  {parsedResult.revenueAmountInr
                    ? `+₹${parsedResult.revenueAmountInr.toLocaleString()}`
                    : parsedResult.expenseAmountInr
                    ? `₹${parsedResult.expenseAmountInr.toLocaleString()}`
                    : '₹0 (Operation only)'}
                </span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-stone-500 font-bold block">ENTRY TITLE</span>
              <span className="font-semibold text-stone-900">{parsedResult.title}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              stopListening();
              stopSpeech();
              onClose();
            }}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!parsedResult}
            onClick={handleSaveParsedEntry}
            className="flex-1 py-3 bg-green-700 hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Save to Farm Diary</span>
          </button>
        </div>
      </div>
    </div>
  );
};
