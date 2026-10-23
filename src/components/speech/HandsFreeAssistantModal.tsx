import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Languages,
  ArrowRight,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';
import {
  INDIAN_SPEECH_LANGUAGES,
  speakText,
  stopSpeech,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from '../../services/webSpeechService';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { AIChatMessage } from '../../../shared/types';

interface HandsFreeAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendQuery: (prompt: string) => Promise<string | undefined>;
  language: string;
  farmerName?: string;
  crops?: string[];
  village?: string;
}

export const HandsFreeAssistantModal: React.FC<HandsFreeAssistantModalProps> = ({
  isOpen,
  onClose,
  onSendQuery,
  language,
  farmerName = 'Farmer Brother',
  crops = ['BT Cotton', 'Sharbati Wheat'],
  village = 'Anandpur',
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
  const [autoSpeakAnswer, setAutoSpeakAnswer] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [conversationState, setConversationState] = useState<
    'idle' | 'listening' | 'thinking' | 'speaking'
  >('listening');
  const [latestQuestion, setLatestQuestion] = useState('');
  const [latestAnswer, setLatestAnswer] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

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
    continuous: false,
    interimResults: true,
  });

  const isSupportedAll = isSpeechRecognitionSupported() && isSpeechSynthesisSupported();

  // Start continuous conversational loop on open
  useEffect(() => {
    if (isOpen) {
      setLatestQuestion('');
      setLatestAnswer(
        language === 'hi'
          ? `नमस्ते ${farmerName}! मैं आपका खेत सहायक हूँ। आप बिना फोन छुए सीधे बोलकर कोई भी प्रश्न पूछ सकते हैं।`
          : `Namaste ${farmerName}! I am your Hands-Free Farm Copilot. Speak any agricultural question directly while working in the field.`
      );
      setStatusMessage('Listening for your voice question...');
      setConversationState('listening');

      startListening({
        lang: selectedVoiceLang,
        continuous: false,
        interimResults: true,
        onResult: (text, isFinal) => {
          if (isFinal && text.trim().length > 3) {
            handleProcessQuestion(text.trim());
          }
        },
      });
    } else {
      stopListening();
      stopSpeech();
    }
  }, [isOpen, selectedVoiceLang]);

  const handleProcessQuestion = async (queryText: string) => {
    if (!queryText.trim()) return;

    setLatestQuestion(queryText);
    setConversationState('thinking');
    setStatusMessage(
      language === 'hi'
        ? 'किसान भाई AI आपके प्रश्न का विश्लेषण कर रहा है...'
        : 'Analyzing farm telemetry & calculating advisory...'
    );
    stopListening();

    try {
      const answer = await onSendQuery(queryText);
      const cleanAnswer = answer || 'I have analyzed your farm data. Please check the recommendations on screen.';
      setLatestAnswer(cleanAnswer);

      if (autoSpeakAnswer) {
        setConversationState('speaking');
        setStatusMessage(
          language === 'hi' ? 'सलाह बोलकर सुनाई जा रही है...' : 'Speaking advisory aloud...'
        );

        speakText(cleanAnswer, {
          lang: selectedVoiceLang,
          rate: speechRate,
          onEnd: () => {
            // Once speech ends, loop back to listening for the next voice question!
            setConversationState('listening');
            setStatusMessage('Ready! Speak your next question...');
            resetTranscript();
            startListening({
              lang: selectedVoiceLang,
              continuous: false,
              interimResults: true,
              onResult: (text, isFinal) => {
                if (isFinal && text.trim().length > 3) {
                  handleProcessQuestion(text.trim());
                }
              },
            });
          },
          onError: () => {
            setConversationState('listening');
            setStatusMessage('Ready for next question...');
          },
        });
      } else {
        setConversationState('idle');
        setStatusMessage('Answer ready. Tap mic to ask next question.');
      }
    } catch (err: any) {
      setConversationState('idle');
      setStatusMessage('Failed to fetch AI response. Please try again.');
    }
  };

  const handleManualMicToggle = () => {
    if (conversationState === 'speaking') {
      stopSpeech();
      setConversationState('listening');
      setStatusMessage('Listening...');
      resetTranscript();
      startListening({
        lang: selectedVoiceLang,
        continuous: false,
        interimResults: true,
        onResult: (text, isFinal) => {
          if (isFinal && text.trim().length > 3) {
            handleProcessQuestion(text.trim());
          }
        },
      });
    } else if (isListening) {
      stopListening();
      setConversationState('idle');
      setStatusMessage('Voice recognition paused. Tap mic to resume.');
    } else {
      setConversationState('listening');
      setStatusMessage('Listening...');
      resetTranscript();
      startListening({
        lang: selectedVoiceLang,
        continuous: false,
        interimResults: true,
        onResult: (text, isFinal) => {
          if (isFinal && text.trim().length > 3) {
            handleProcessQuestion(text.trim());
          }
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 text-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-800/40 space-y-6 relative overflow-hidden flex flex-col justify-between max-h-[90vh]">
        
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar Controls */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-700 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold font-display text-lg text-white">
                  {language === 'hi' ? 'खेत हैंड्स-फ्री AI संवाद (Field Voice Mode)' : 'Hands-Free Field AI Copilot'}
                </h3>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>VOICE LOOP</span>
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {language === 'hi'
                  ? 'खेत में काम करते हुए निरंतर आवाज से बात करें — उत्तर अपने आप बोलकर सुनाया जाएगा'
                  : 'Continuous voice conversation loop with hands-free speech recognition & audio readouts'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopListening();
              stopSpeech();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Settings Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 text-xs relative z-10">
          {/* Spoken Language */}
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedVoiceLang}
              onChange={(e) => setSelectedVoiceLang(e.target.value)}
              className="bg-stone-800 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 font-semibold focus:outline-none cursor-pointer"
            >
              {INDIAN_SPEECH_LANGUAGES.map((lang) => (
                <option key={lang.speechCode} value={lang.speechCode}>
                  {lang.nativeName} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          {/* Auto Speak Toggle & Speed */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-stone-300 text-[11px] font-medium">
              <input
                type="checkbox"
                checked={autoSpeakAnswer}
                onChange={(e) => setAutoSpeakAnswer(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-emerald-500"
              />
              <span>Auto-Speak Answers</span>
            </label>

            <select
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="bg-stone-800 border border-white/15 rounded-xl px-2 py-1 text-[11px] text-stone-300 cursor-pointer"
            >
              <option value="0.85">0.85x Speed</option>
              <option value="1.0">1.0x Normal</option>
              <option value="1.15">1.15x Fast</option>
            </select>
          </div>
        </div>

        {/* Central Audio & Conversation Stage */}
        <div className="flex-1 overflow-y-auto space-y-4 py-2 relative z-10 min-h-[220px]">
          
          {/* Latest Farmer Question */}
          {latestQuestion && (
            <div className="bg-white/10 rounded-2xl p-4 border border-white/15 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                  YOU ASKED (VOICE)
                </span>
                <p className="text-sm sm:text-base font-semibold text-white">
                  "{latestQuestion}"
                </p>
              </div>
            </div>
          )}

          {/* Latest AI Advisory Output */}
          <div className="bg-emerald-950/40 rounded-2xl p-4 sm:p-4 border border-emerald-500/30 flex items-start gap-3 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  KISAN BHAI ADVISORY
                </span>
                {conversationState === 'speaking' && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-300 animate-pulse font-mono font-bold">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Speaking Aloud</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed whitespace-pre-line">
                {latestAnswer}
              </p>
            </div>
          </div>

          {/* Live Interim Speech Preview when farmer is speaking */}
          {(interimTranscript || (isListening && transcript)) && (
            <div className="bg-stone-800/80 rounded-2xl p-3.5 border border-emerald-500/40 text-center animate-in fade-in">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                HEARING NOW:
              </span>
              <p className="text-sm font-medium text-stone-200 italic">
                "{transcript} <span className="text-emerald-400 font-bold">{interimTranscript}</span>"
              </p>
            </div>
          )}
        </div>

        {/* Waveform & Central Mic Button Stage */}
        <div className="bg-stone-950/90 rounded-2xl p-4 border border-white/10 text-center space-y-3 relative z-10">
          {/* Sound Visualizer Waves */}
          <div className="flex items-center justify-center gap-1.5 h-10">
            {[35, 70, 90, 60, 100, 75, 45, 85, 65, 40, 80, 55].map((val, idx) => (
              <span
                key={idx}
                className={`w-1 rounded-full transition-all duration-150 ${
                  conversationState === 'listening' || conversationState === 'speaking'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-stone-800'
                }`}
                style={{
                  height:
                    conversationState === 'listening' || conversationState === 'speaking'
                      ? `${Math.max(8, Math.round(val * Math.random()))}px`
                      : '6px',
                  animationDelay: `${idx * 80}ms`,
                }}
              />
            ))}
          </div>

          {/* Large Mic Toggle Button */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleManualMicToggle}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all transform active:scale-95 shadow-xl cursor-pointer ${
                conversationState === 'speaking'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white ring-8 ring-amber-500/20 animate-pulse'
                  : isListening
                  ? 'bg-rose-600 text-white ring-8 ring-rose-500/30 scale-105'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-8 ring-emerald-500/20'
              }`}
            >
              {conversationState === 'speaking' ? (
                <Volume2 className="w-8 h-8" />
              ) : isListening ? (
                <MicOff className="w-8 h-8 animate-bounce" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-300 font-mono">
              {statusMessage}
            </div>
            <p className="text-[11px] text-stone-400">
              {conversationState === 'speaking'
                ? 'Tap center button to interrupt and ask a new question'
                : 'Microphone automatically listens when AI finishes speaking'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
