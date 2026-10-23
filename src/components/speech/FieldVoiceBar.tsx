import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Languages,
  Zap,
  Tag,
  DollarSign,
  Sprout,
  X,
  ChevronDown,
  ChevronUp,
  Radio,
  Clock,
} from 'lucide-react';
import {
  INDIAN_SPEECH_LANGUAGES,
  parseFarmVoiceDictation,
  ParsedFarmDiaryVoice,
  speakText,
  stopSpeech,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from '../../services/webSpeechService';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export type FieldVoiceMode = 'query' | 'note';

interface FieldVoiceBarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  onSendQuery: (query: string) => Promise<void | string | undefined>;
  onSaveDiaryNote: (note: {
    category: string;
    crop: string;
    title: string;
    expenseAmountInr?: number;
    revenueAmountInr?: number;
    notes: string;
  }) => void;
  language: string;
  selectedDialect: string;
  onDialectChange: (code: string) => void;
  defaultCrop?: string;
  isProcessingQuery?: boolean;
  autoSpeakAnswer: boolean;
  onToggleAutoSpeak: (enabled: boolean) => void;
  externalTranscriptTrigger?: string;
}

// Gentle pleasant chimes for outdoor hands-free feedback
function playChime(type: 'start' | 'stop' | 'save') {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'stop') {
      osc.frequency.setValueAtTime(784, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'save') {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.23);
    }
  } catch {
    // AudioContext can occasionally fail if unprompted, harmless to swallow
  }
}

export const FieldVoiceBar: React.FC<FieldVoiceBarProps> = ({
  isOpen,
  onToggleOpen,
  onSendQuery,
  onSaveDiaryNote,
  language,
  selectedDialect,
  onDialectChange,
  defaultCrop = 'BT Cotton',
  isProcessingQuery = false,
  autoSpeakAnswer,
  onToggleAutoSpeak,
}) => {
  const [mode, setMode] = useState<FieldVoiceMode>('query');
  const [handsFreeAutoSubmit, setHandsFreeAutoSubmit] = useState(true);
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [parsedNote, setParsedNote] = useState<ParsedFarmDiaryVoice | null>(null);
  const [speechText, setSpeechText] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  const countdownTimerRef = useRef<any>(null);
  const elapsedTimerRef = useRef<any>(null);
  const lastSpeechTimeRef = useRef<number>(0);

  const isHi = language === 'hi';

  const {
    isSupported,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    interimTranscript,
  } = useSpeechRecognition({
    lang: selectedDialect,
    continuous: true,
    interimResults: true,
    onResult: (text, isFinal) => {
      lastSpeechTimeRef.current = Date.now();
      const combined = text.trim();
      setSpeechText(combined);

      if (combined.length > 2) {
        const parsed = parseFarmVoiceDictation(combined, defaultCrop);
        setParsedNote(parsed);
      }

      // If in Hands-Free Auto-Submit mode and we are in query mode, reset countdown
      if (handsFreeAutoSubmit && mode === 'query' && combined.length > 5) {
        startSilenceCountdown();
      }
    },
    onError: (err) => {
      console.warn('Field Voice Recognition event:', err);
      clearSilenceCountdown();
    },
  });

  // Elapsed recording time counter
  useEffect(() => {
    if (isListening) {
      setElapsedSeconds(0);
      elapsedTimerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    }
    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [isListening]);

  // Silence countdown handler
  const startSilenceCountdown = () => {
    clearSilenceCountdown();
    setAutoSubmitCountdown(2);

    countdownTimerRef.current = setInterval(() => {
      setAutoSubmitCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
          // Auto submit trigger
          handleAutoSubmit();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearSilenceCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setAutoSubmitCountdown(null);
  };

  const handleAutoSubmit = () => {
    if (!speechText.trim()) return;
    if (mode === 'query') {
      handleSendCurrentQuery();
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      playChime('stop');
      stopListening();
      clearSilenceCountdown();
    } else {
      playChime('start');
      resetTranscript();
      setSpeechText('');
      setParsedNote(null);
      setSaveSuccessNotice(null);
      clearSilenceCountdown();

      startListening({
        lang: selectedDialect,
        continuous: true,
        interimResults: true,
      });
    }
  };

  const handleSendCurrentQuery = async () => {
    const textToSend = speechText.trim();
    if (!textToSend) return;

    clearSilenceCountdown();
    stopListening();
    playChime('save');

    await onSendQuery(textToSend);
    setSpeechText('');
    setParsedNote(null);
  };

  const handleSaveFarmNote = () => {
    if (!parsedNote && !speechText.trim()) return;

    const dataToSave = parsedNote || parseFarmVoiceDictation(speechText, defaultCrop);
    playChime('save');
    stopListening();
    clearSilenceCountdown();

    onSaveDiaryNote({
      category: dataToSave.category,
      crop: dataToSave.crop,
      title: dataToSave.title,
      expenseAmountInr: dataToSave.expenseAmountInr,
      revenueAmountInr: dataToSave.revenueAmountInr,
      notes: dataToSave.notes,
    });

    const confirmationMsg = isHi
      ? `खेत डायरी में सुरक्षित: ${dataToSave.title}`
      : `Saved to Farm Diary: ${dataToSave.title}`;
    setSaveSuccessNotice(confirmationMsg);

    if (autoSpeakAnswer) {
      speakText(confirmationMsg, { lang: selectedDialect });
    }

    setTimeout(() => {
      setSpeechText('');
      setParsedNote(null);
      setSaveSuccessNotice(null);
    }, 3500);
  };

  const handleAskAIAboutNote = async () => {
    if (!speechText.trim()) return;
    const prompt = isHi
      ? `मैंने अपने खेत में यह गतिविधि दर्ज की है: "${speechText}". कृपया बताएं कि क्या यह सही मात्रा, समय और सावधानी है?`
      : `I just recorded this farm activity: "${speechText}". Please advise if this timing, dosage, and safety practice is optimal.`;
    
    stopListening();
    clearSilenceCountdown();
    await onSendQuery(prompt);
    setSpeechText('');
    setParsedNote(null);
  };

  const handleClear = () => {
    clearSilenceCountdown();
    resetTranscript();
    setSpeechText('');
    setParsedNote(null);
    setSaveSuccessNotice(null);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeDialectObj = INDIAN_SPEECH_LANGUAGES.find((l) => l.speechCode === selectedDialect);

  // Field voice examples
  const samplePrompts =
    mode === 'query'
      ? isHi
        ? [
            'गेहूं में पीला रतुआ के लक्षण दिखें तो क्या स्प्रे करें?',
            'कल दोपहर राजकोट मंडी में कपास का क्या भाव रहेगा?',
            'कपास में गुलाबी सुंडी नियंत्रण के लिए नीम तेल की मात्रा बताएं।',
          ]
        : [
            'What is the best foliar spray for wheat yellow rust?',
            'Should I irrigate BT cotton if 70% rain is forecasted tomorrow?',
            'Today APMC mandi rates for Bt Cotton and Sharbati Wheat.',
          ]
      : isHi
        ? [
            'आज 2 बोरी यूरिया खाद 540 रुपये में गेहूं में डाली।',
            'कपास में इल्ली के लिए बायो-नीम तेल का छिड़काव किया, 350 रुपये मजदूरी खर्च।',
            '10 क्विंटल सरसों 54000 रुपये में APMC मंडी में बेची।',
          ]
        : [
            'Applied 2 bags of urea on wheat, total expense 540 rupees.',
            'Sprayed neem oil on cotton field for bollworm, paid 350 rupees labour.',
            'Harvested 10 quintals of mustard and sold for 54,000 rupees.',
          ];

  return (
    <div className="w-full bg-gradient-to-b from-stone-900 via-[#182718] to-stone-900 border-2 border-emerald-500/50 rounded-2xl p-3 sm:p-4 shadow-xl text-stone-100 relative overflow-hidden transition-all duration-300">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-1/2 h-8 bg-emerald-500/20 blur-xl pointer-events-none" />

      {/* Top Bar: Title, Mode Tabs, Dialect & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-emerald-800/40 relative z-10">
        {/* Title & Live Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
              isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
            }`}
          >
            {isListening ? <Radio className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-wide">
                {isHi ? 'खेत हैंड्स-फ्री वॉयस मोड' : 'Field Hands-Free Voice Mode'}
              </span>
              {isListening && (
                <span className="flex items-center gap-1 bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-rose-500/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  REC {formatSeconds(elapsedSeconds)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-300/80">
              {isHi
                ? 'खेत में काम करते हुए सीधे बोलें • बिना छुए सवाल पूछें या डायरी नोट दर्ज करें'
                : 'Speak freely in field • Hands-free queries & instant farm diary dictation'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-stone-950/80 p-1 rounded-xl border border-emerald-800/60 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('query');
              clearSilenceCountdown();
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'query'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>{isHi ? 'सवाल पूछें (Query)' : 'Ask AI Query'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('note');
              clearSilenceCountdown();
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'note'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>{isHi ? 'खेत डायरी (Note)' : 'Record Farm Note'}</span>
          </button>
        </div>

        {/* Dialect Selector & Options */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dialect Dropdown */}
          <div className="relative">
            <select
              value={selectedDialect}
              onChange={(e) => onDialectChange(e.target.value)}
              className="bg-stone-950 text-emerald-200 text-xs font-medium px-2.5 py-1.5 rounded-xl border border-emerald-700/60 focus:outline-none cursor-pointer"
              title="Regional Speech Dialect"
            >
              {INDIAN_SPEECH_LANGUAGES.map((item) => (
                <option key={item.code} value={item.speechCode} className="bg-stone-900 text-white">
                  🎙️ {item.nativeName} ({item.label})
                </option>
              ))}
            </select>
          </div>

          {/* Auto-read speech aloud */}
          <button
            type="button"
            onClick={() => onToggleAutoSpeak(!autoSpeakAnswer)}
            className={`p-1.5 rounded-xl text-xs flex items-center gap-1 border transition-colors cursor-pointer ${
              autoSpeakAnswer
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70'
                : 'bg-stone-950 text-stone-500 border-stone-800'
            }`}
            title={autoSpeakAnswer ? 'Voice response enabled' : 'Voice response muted'}
          >
            {autoSpeakAnswer ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[11px] hidden sm:inline">
              {autoSpeakAnswer ? (isHi ? 'आवाज चालू' : 'Audio On') : (isHi ? 'आवाज बंद' : 'Audio Off')}
            </span>
          </button>

          {/* Hands-free Auto-Submit Toggle */}
          {mode === 'query' && (
            <button
              type="button"
              onClick={() => setHandsFreeAutoSubmit(!handsFreeAutoSubmit)}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                handsFreeAutoSubmit
                  ? 'bg-amber-950/80 text-amber-300 border-amber-600/60'
                  : 'bg-stone-950 text-stone-500 border-stone-800'
              }`}
              title="Automatically send query when you finish speaking"
            >
              <Zap className={`w-3.5 h-3.5 ${handsFreeAutoSubmit ? 'text-amber-400' : 'text-stone-500'}`} />
              <span className="hidden md:inline">
                {isHi ? 'स्वतः भेजें (Auto-Send)' : 'Auto-Send'}
              </span>
            </button>
          )}

          {/* Close / Minimize Bar */}
          <button
            type="button"
            onClick={onToggleOpen}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            title="Minimize Field Voice Bar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Live Speech Display */}
      <div className="py-3 space-y-2.5 relative z-10">
        {/* Audio Wave Visualizer while listening */}
        {isListening && (
          <div className="flex items-center justify-between bg-stone-950/60 px-3 py-2 rounded-xl border border-emerald-800/40">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-semibold text-emerald-300">
                {isHi
                  ? `सुन रहा है (${activeDialectObj?.nativeName || 'हिन्दी'})...`
                  : `Listening in ${activeDialectObj?.label || 'Indian Voice'}...`}
              </span>
            </div>

            {/* Pulsing Equalizer Bars */}
            <div className="flex items-center gap-1 h-5">
              <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-3" />
              <span className="w-1 bg-emerald-300 rounded-full animate-[bounce_0.6s_infinite_200ms] h-5" />
              <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_300ms] h-2" />
              <span className="w-1 bg-teal-300 rounded-full animate-[bounce_0.6s_infinite_150ms] h-4" />
              <span className="w-1 bg-emerald-500 rounded-full animate-[bounce_0.6s_infinite_250ms] h-3" />
            </div>

            {/* Countdown Badge if Auto-Submit pending */}
            {autoSubmitCountdown !== null && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded-full border border-amber-500/50 animate-pulse">
                <Clock className="w-3 h-3" />
                <span>{isHi ? `${autoSubmitCountdown}s में स्वतः भेजा जाएगा` : `Sending in ${autoSubmitCountdown}s`}</span>
                <button
                  type="button"
                  onClick={clearSilenceCountdown}
                  className="ml-1 text-xs hover:text-white"
                  title="Cancel auto-send"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* Transcription Output Box */}
        <div className="bg-stone-950/90 border border-stone-800 rounded-xl p-3 sm:p-4 min-h-[70px] flex flex-col justify-center">
          {saveSuccessNotice ? (
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{saveSuccessNotice}</span>
            </div>
          ) : speechText || interimTranscript ? (
            <div className="space-y-1">
              <p className="text-sm sm:text-base font-medium text-white leading-relaxed">
                {speechText || interimTranscript}
              </p>
              {interimTranscript && speechText && (
                <p className="text-xs text-emerald-400 italic">
                  {interimTranscript}
                </p>
              )}
            </div>
          ) : (
            <div className="text-stone-400 text-xs sm:text-sm italic flex items-center justify-between flex-wrap gap-2">
              <span>
                {isListening
                  ? isHi
                    ? 'खेत में काम करते हुए बोलिए — शब्द यहाँ तुरंत दिखेंगे...'
                    : 'Speak naturally in field — your speech will transcribe in real-time...'
                  : isHi
                    ? 'माइक चालू करने के लिए "बोलना शुरू करें" दबाएं या सीधे बात करें...'
                    : 'Click "Start Speaking" or use the mic to begin hands-free dictation...'}
              </span>
              <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded-md">
                {activeDialectObj?.nativeName}
              </span>
            </div>
          )}
        </div>

        {/* Structured Farm Note Preview (When in Note Mode and speech detected) */}
        {mode === 'note' && (parsedNote || speechText) && (
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                {isHi ? 'AI द्वारा पहचाना गया खेत रिकॉर्ड (Preview):' : 'AI Structured Farm Ledger Preview:'}
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30">
                Ready to Log
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-stone-950/80 p-2 rounded-lg border border-amber-800/40">
                <span className="text-[10px] text-stone-400 block">{isHi ? 'श्रेणी (Category)' : 'Category'}</span>
                <span className="font-bold text-emerald-300">{parsedNote?.category || 'General'}</span>
              </div>
              <div className="bg-stone-950/80 p-2 rounded-lg border border-amber-800/40">
                <span className="text-[10px] text-stone-400 block">{isHi ? 'फसल (Crop)' : 'Crop'}</span>
                <span className="font-bold text-amber-200">{parsedNote?.crop || defaultCrop}</span>
              </div>
              <div className="bg-stone-950/80 p-2 rounded-lg border border-amber-800/40">
                <span className="text-[10px] text-stone-400 block">
                  {parsedNote?.revenueAmountInr ? (isHi ? 'बिक्री आय' : 'Revenue') : (isHi ? 'खर्च' : 'Expense')}
                </span>
                <span className="font-bold text-amber-400">
                  {parsedNote?.revenueAmountInr
                    ? `+ ₹${parsedNote.revenueAmountInr.toLocaleString()}`
                    : parsedNote?.expenseAmountInr
                      ? `- ₹${parsedNote.expenseAmountInr.toLocaleString()}`
                      : 'None detected'}
                </span>
              </div>
              <div className="bg-stone-950/80 p-2 rounded-lg border border-amber-800/40">
                <span className="text-[10px] text-stone-400 block">{isHi ? 'तारीख' : 'Date'}</span>
                <span className="font-medium text-stone-300">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="text-xs text-stone-200 bg-stone-950/60 p-2 rounded-lg">
              <span className="font-semibold text-stone-400">{isHi ? 'शीर्षक: ' : 'Title: '}</span>
              <span>{parsedNote?.title || speechText}</span>
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        {!speechText && !isListening && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[10px] text-stone-400 shrink-0 font-medium">
              {isHi ? 'उदाहरण बोलें:' : 'Try speaking:'}
            </span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSpeechText(p);
                  const parsed = parseFarmVoiceDictation(p, defaultCrop);
                  setParsedNote(parsed);
                }}
                className="bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-700/60 px-2.5 py-1 rounded-lg text-[11px] shrink-0 transition-colors cursor-pointer truncate max-w-[280px]"
                title={p}
              >
                "{p}"
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Controls: Large Touch-Friendly Field Buttons */}
      <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-emerald-800/40 flex-wrap relative z-10">
        {/* Left Side: Mic Start/Stop Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleMic}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>
              {isListening
                ? isHi ? 'माइक बंद करें (Stop)' : 'Stop Mic'
                : isHi ? 'बोलना शुरू करें (Speak)' : 'Start Speaking'}
            </span>
          </button>

          {speechText && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-700/60 transition-colors cursor-pointer"
              title="Clear transcript"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Side: Mode-Specific Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {mode === 'query' ? (
            <button
              type="button"
              onClick={handleSendCurrentQuery}
              disabled={!speechText.trim() || isProcessingQuery}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
            >
              <span>{isProcessingQuery ? (isHi ? 'विश्लेषण...' : 'Analyzing...') : (isHi ? 'AI से पूछें' : 'Send to Copilot')}</span>
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAskAIAboutNote}
                disabled={!speechText.trim() || isProcessingQuery}
                className="bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-300 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-emerald-600/40 transition-all cursor-pointer"
                title="Ask AI if this recorded activity is agronomically sound"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHi ? 'AI से राय लें' : 'Ask AI Advice'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveFarmNote}
                disabled={!speechText.trim()}
                className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>{isHi ? 'डायरी में जोड़ें' : 'Save to Farm Diary'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
