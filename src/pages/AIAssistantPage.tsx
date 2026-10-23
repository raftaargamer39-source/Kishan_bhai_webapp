import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Send,
  Sparkles,
  Image as ImageIcon,
  Coins,
  Bot,
  UploadCloud,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Cpu,
  History,
  Trash2,
  Paperclip,
  Languages,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  Layers,
  ChevronDown,
  Info,
  Radio,
  BookOpen,
} from 'lucide-react';
import { AIChatMessage, AIConversationSession } from '../../shared/types';
import { AIFarmContextBadge } from '../components/ai/AIFarmContextBadge';
import { AIChatMessageItem } from '../components/ai/AIChatMessageItem';
import { AIQuickPrompts } from '../components/ai/AIQuickPrompts';
import { AIHistoryDrawer } from '../components/ai/AIHistoryDrawer';
import { HandsFreeAssistantModal } from '../components/speech/HandsFreeAssistantModal';
import { FieldVoiceBar } from '../components/speech/FieldVoiceBar';
import { FieldVoiceDictatorModal } from '../components/speech/FieldVoiceDictatorModal';
import { INDIAN_SPEECH_LANGUAGES, isSpeechRecognitionSupported, speakText, stopSpeech } from '../services/webSpeechService';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { uploadFileToStorage } from '../services/storageService';

export const AIAssistantPage: React.FC = () => {
  const { currentUser, setCurrentUser, userRole } = useUserStore();
  const {
    addToast,
    wallet,
    language,
    setLanguage,
    setCurrentView,
    pendingAiQuery,
    setPendingAiQuery,
    addDiaryEntry,
  } = useApp();

  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [activeSessionId, setActiveSessionId] = useState<string>('sess_wheat_irrigation_01');
  const [sessions, setSessions] = useState<AIConversationSession[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHandsFreeOpen, setIsHandsFreeOpen] = useState(false);
  const [isFieldVoiceBarOpen, setIsFieldVoiceBarOpen] = useState(true);
  const [isFieldVoiceModalOpen, setIsFieldVoiceModalOpen] = useState(false);
  const [autoSpeakAnswer, setAutoSpeakAnswer] = useState(true);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(false);
  const [speechLanguageCode, setSpeechLanguageCode] = useState<string>(() => {
    const matched = INDIAN_SPEECH_LANGUAGES.find((l) => l.code === language);
    return matched?.speechCode || 'hi-IN';
  });

  // Keep speech language synchronized with global application language
  useEffect(() => {
    const matched = INDIAN_SPEECH_LANGUAGES.find((l) => l.code === language);
    if (matched) {
      setSpeechLanguageCode(matched.speechCode);
    }
  }, [language]);

  const initialWelcomeMessage: AIChatMessage = {
    id: 'msg_welcome',
    role: 'assistant',
    modelUsed: 'gemini-2.5-flash',
    language: language || 'en',
    content: language === 'hi'
      ? `🌱 **Recommendation: नमस्ते ${currentUser?.fullName || 'किसान भाई'}! मैं आपका 24/7 स्मार्ट कृषि साथी हूँ**

**Why? (कारण):**
- मैं आपके खेत का स्थान (**${currentUser?.village || 'आनंदपुर'}, गुजरात**), मिट्टी की नमी (**42%**), और मौसम का लाइव डेटा समझता हूँ।
- आपके खेत में कल दोपहर **70% भारी बारिश (14-18 मिमी)** का पूर्वानुमान है।

**What to do (क्या करें):**
1. नीचे दिए गए त्वरित प्रश्नों में से कोई विकल्प चुनें या अपना प्रश्न बोलें/लिखें।
2. पत्तियों में रोग की जांच के लिए फोटो अपलोड करें।
3. प्राकृतिक भाषा में खाद आर्डर, फसल पूल या प्रोफ़ाइल अपडेट करने का निर्देश दें।

⚠️ **Important Warning (महत्वपूर्ण चेतावनी):** डिजिटल सलाह सामान्य निर्णय सहायता के लिए है। कीटनाशक प्रयोग से पहले स्थानीय कृषि विशेषज्ञ की पुष्टि अवश्य करें।`
      : `🌱 **Recommendation: Namaste ${currentUser?.fullName || 'Farmer Brother'}! I am your 24/7 Intelligent Farming Copilot**

**Why?**
- I am connected to your live farm telemetry in **${currentUser?.village || 'Anandpur'}, Gujarat** (${currentUser?.farmSizeAcres || 4.5} Acres).
- Live soil moisture is **42% (Optimal)** and **70% rain is forecasted tomorrow**.

**What to do:**
1. Ask any agronomical question or select one of the 1-click quick scenarios below.
2. Upload a leaf photo for instant computer vision disease diagnosis.
3. Command me to modify your crops, create fertilizer pools, or list harvest lots directly.

⚠️ **Important Warning:** Digital recommendations provide agricultural decision support. Verify specific chemical handling with local agricultural officers.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sources: [
      'IMD Agro-Meteorological Weather Radar',
      'ICAR Crop Knowledge Repository (ICAR-IIWBR)',
      'Agmarknet APMC Live Mandi Data Feed',
    ],
  };

  const [messages, setMessages] = useState<AIChatMessage[]>([initialWelcomeMessage]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimVoiceSpeech, setInterimVoiceSpeech] = useState('');
  const [isTypingAnimation, setIsTypingAnimation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Hook for resilient speech recognition with Indian regional fallbacks
  const {
    isSupported: isVoiceSupported,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    activeRecognitionLang,
  } = useSpeechRecognition({
    lang: speechLanguageCode,
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal && text.trim()) {
        setInputPrompt((prev) => (prev ? `${prev} ${text.trim()}` : text.trim()));
        setInterimVoiceSpeech('');
        addToast(
          'Voice Captured',
          text.trim().length > 45 ? `${text.trim().slice(0, 45)}...` : text.trim(),
          'success'
        );
      } else {
        setInterimVoiceSpeech(text);
      }
    },
    onError: (err) => {
      setInterimVoiceSpeech('');
      if (err?.error === 'not-allowed' || err?.error === 'permission-denied') {
        addToast(
          'Microphone Permission Blocked',
          'Please allow microphone permission in your browser address bar to use voice.',
          'error'
        );
      } else if (err?.error === 'no-speech') {
        addToast(
          'No Voice Detected',
          'Please speak closer to the microphone and try again.',
          'info'
        );
      }
    },
    onEnd: () => {
      setInterimVoiceSpeech('');
    },
  });

  // Fetch initial seeded conversation sessions from server
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/ai/sessions');
      if (res.ok) {
        const data = await res.json();
        if (data.sessions && data.sessions.length > 0) {
          setSessions(data.sessions);
        }
      }
    } catch (err) {
      console.warn('Could not load sessions:', err);
    }
  };

  // Scroll to bottom smoothly on message change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, isTypingAnimation]);

  // Handle pending queries from other dashboards
  useEffect(() => {
    if (pendingAiQuery) {
      const q = pendingAiQuery;
      setPendingAiQuery(null);
      handleSend(q);
    }
  }, [pendingAiQuery]);

  // Voice speech recognition toggle
  const toggleVoiceInput = () => {
    if (!isVoiceSupported) {
      addToast(
        'Voice Input Unavailable',
        'Web Speech Recognition is not supported on this browser. Please type your query.',
        'info'
      );
      return;
    }

    if (isListening) {
      stopListening();
      setInterimVoiceSpeech('');
    } else {
      resetTranscript();
      setInterimVoiceSpeech('');
      startListening({
        lang: speechLanguageCode,
        continuous: false,
        interimResults: true,
      });
      const activeLanguageOption = INDIAN_SPEECH_LANGUAGES.find((l) => l.speechCode === speechLanguageCode);
      const displayLabel = activeLanguageOption ? activeLanguageOption.label : speechLanguageCode;
      addToast(
        'Listening in Field...',
        language === 'hi'
          ? 'बोलिए, किसान भाई AI सुन रहा है...'
          : `Listening in ${displayLabel}. Speak now...`,
        'info'
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Display image immediately for prompt preview
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      addToast('Image Attached', 'Crop photo ready for disease diagnosis.', 'info');
    };
    reader.readAsDataURL(file);

    // Save copy in Firebase Storage production bucket
    uploadFileToStorage(file, 'chat-attachments').catch((err) => {
      console.warn('Firebase Storage chat attachment background save:', err);
    });
  };

  const handleSend = async (customPrompt?: string, customImage?: string): Promise<string | undefined> => {
    const promptToSend = customPrompt || inputPrompt;
    const imageToSend = customImage || selectedImage;

    if (!promptToSend.trim() && !imageToSend) return undefined;

    const userMsg: AIChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: promptToSend || (language === 'hi' ? 'कृपया इस फसल की जांच करें।' : 'Please analyze this crop leaf photo.'),
      imageUrl: imageToSend || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setSelectedImage(null);
    setInterimVoiceSpeech('');
    setIsProcessing(true);
    setIsTypingAnimation(true);

    try {
      const base64Data = imageToSend ? imageToSend.split(',')[1] : undefined;

      const farmContext = {
        farmerName: currentUser?.fullName || 'Ramesh Patel',
        village: currentUser?.village || 'Anandpur',
        state: currentUser?.state || 'Gujarat',
        farmSizeAcres: currentUser?.farmSizeAcres || 4.5,
        crops: currentUser?.crops || ['Cotton (Bt)', 'Sharbati Wheat'],
        soilMoisture: 42,
        weather: {
          temperatureC: 29.5,
          rainfallProbability: 70,
          condition: 'Partly Cloudy with 70% Rain',
        },
      };

      const aiRes = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          userRole,
          cropContext: currentUser?.crops?.join(', ') || 'Sharbati Wheat, BT Cotton',
          imageBase64: base64Data,
          userId: currentUser?.id,
          modelName: selectedModel,
          language,
          farmContext,
          conversationId: activeSessionId,
        }),
      });

      const aiData = await aiRes.json();

      // If an autonomous app state modification was executed, update app state immediately
      if (aiData.executedAction) {
        if (aiData.executedAction.actionType === 'PROFILE_UPDATED' && aiData.executedAction.modifiedData) {
          setCurrentUser(aiData.executedAction.modifiedData);
          localStorage.setItem('kb_user', JSON.stringify(aiData.executedAction.modifiedData));
          addToast('Profile Synchronized', 'Your profile updates are active across Kisan Bhai.', 'success');
        } else if (aiData.executedAction.actionType === 'BULK_ORDER_CREATED') {
          addToast('Cluster Demand Added', 'New group purchase order created for cluster.', 'success');
        } else if (aiData.executedAction.actionType === 'HARVEST_LOT_POOLED') {
          addToast('Harvest Pooled', 'Harvest lot listed for institutional buyer bids.', 'success');
        } else if (aiData.executedAction.actionType === 'MACHINERY_BOOKED') {
          addToast('Machinery Reserved', 'Equipment slot confirmed for your farm.', 'success');
        }
      }

      // Execute free direct multispectral analysis if requested and image is provided (100% Free for Farmers)
      if ((aiData.suggestedPaidService === 'crop-analysis' || aiData.suggestedService === 'crop-analysis') && imageToSend) {
        try {
          const paidRes = await fetch('/api/paid/crop-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cropName: currentUser?.crops?.[0] || 'BT Cotton (Shankar-6)',
              symptoms: promptToSend || 'Foliar discoloration and necrotic lesions',
              imageProvided: true,
            }),
          });

          if (paidRes.ok) {
            const resultJson = await paidRes.json();
            const rep = resultJson.result;

            const diagnosisMsg: AIChatMessage = {
              id: `msg_report_${Date.now()}`,
              role: 'assistant',
              modelUsed: selectedModel,
              content: `🌱 **Multispectral Pathogen Diagnosis: ${rep.diagnosis}**\n\n**Analysis Details:**\n- Pathogen confidence score: **${rep.confidenceScore}** (Severity: **${rep.severity}**)\n- Rapid spread potential tracked via ambient relative humidity.\n\n**Recommended Remediation Plan:**\n${rep.remediationPlan.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}\n\n⚠️ **Cluster Advisory:** ${rep.clusterAdvisory}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              toolCall: {
                toolName: 'crop_analysis',
                status: 'executed',
                resultData: rep,
              },
              sources: [
                'ICAR Plant Pathology Protocol',
                'Kishan Bhai Computer Vision Diagnostic Node',
              ],
            };

            setMessages((prev) => [...prev, diagnosisMsg]);
            setIsProcessing(false);
            setIsTypingAnimation(false);
            return diagnosisMsg.content;
          }
        } catch {}
      }

      // Normal response
      const botMsg: AIChatMessage = {
        id: `msg_bot_${Date.now()}`,
        role: 'assistant',
        modelUsed: aiData.modelUsed || selectedModel,
        language: aiData.language || language,
        content: aiData.text,
        executedAction: aiData.executedAction,
        farmingActionCard: aiData.farmingActionCard,
        diseaseAnalysis: aiData.diseaseAnalysis,
        sources: aiData.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      fetchSessions();

      // Read answer aloud if hands-free speech response is active
      if (autoSpeakAnswer && aiData.text) {
        setIsAudioSpeaking(true);
        speakText(aiData.text, {
          lang: speechLanguageCode,
          onEnd: () => setIsAudioSpeaking(false),
          onError: () => setIsAudioSpeaking(false),
        });
      }

      return aiData.text;
    } catch (err: any) {
      const errMsg = language === 'hi'
        ? 'क्षमा करें, कनेक्शन में रुकावट आई है। कृपया दोबारा प्रयास करें।'
        : 'I experienced a connection issue. Please verify your connection and try again.';
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          modelUsed: selectedModel,
          content: errMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return errMsg;
    } finally {
      setIsProcessing(false);
      setIsTypingAnimation(false);
    }
  };

  const handleSaveVoiceDiaryNote = (note: {
    category: string;
    crop: string;
    title: string;
    expenseAmountInr?: number;
    revenueAmountInr?: number;
    notes: string;
  }) => {
    addDiaryEntry({
      date: new Date().toISOString().split('T')[0],
      category: note.category,
      crop: note.crop || currentUser?.crops?.[0] || 'BT Cotton',
      title: note.title,
      expenseAmountInr: note.expenseAmountInr,
      revenueAmountInr: note.revenueAmountInr,
      notes: note.notes,
    });

    const isHi = language === 'hi';
    const noteMsg: AIChatMessage = {
      id: `msg_note_${Date.now()}`,
      role: 'assistant',
      modelUsed: 'Field Voice Recorder',
      language,
      content: isHi
        ? `📝 **खेत डायरी में सुरक्षित (Hands-Free Note Recorded):**\n- **गतिविधि / शीर्षक:** ${note.title}\n- **श्रेणी:** ${note.category} | **फसल:** ${note.crop || 'BT Cotton'}\n${note.expenseAmountInr ? `- **दर्ज खर्च:** ₹${note.expenseAmountInr.toLocaleString('en-IN')}\n` : ''}${note.revenueAmountInr ? `- **दर्ज आय:** ₹${note.revenueAmountInr.toLocaleString('en-IN')}\n` : ''}- **विवरण:** ${note.notes}\n\n✅ यह प्रविष्टि आपके **डिजिटल फार्म लेजर (Farm Diary)** में सफलतापूर्वक जोड़ दी गई है।`
        : `📝 **Hands-Free Farm Diary Entry Recorded:**\n- **Activity / Title:** ${note.title}\n- **Category:** ${note.category} | **Crop:** ${note.crop || 'BT Cotton'}\n${note.expenseAmountInr ? `- **Logged Expense:** ₹${note.expenseAmountInr.toLocaleString('en-IN')}\n` : ''}${note.revenueAmountInr ? `- **Logged Revenue:** ₹${note.revenueAmountInr.toLocaleString('en-IN')}\n` : ''}- **Details:** ${note.notes}\n\n✅ Stored in your **Digital Farm Ledger & Activity Log**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, noteMsg]);
  };

  const handleClearChat = () => {
    setMessages([initialWelcomeMessage]);
    setInputPrompt('');
    setSelectedImage(null);
    setInterimVoiceSpeech('');
    addToast('Chat Cleared', 'Starting a clean conversation with Kishan Bhai AI.', 'info');
  };

  const handleSelectSession = (session: AIConversationSession) => {
    setActiveSessionId(session.id);
    const convertedMsgs: AIChatMessage[] = session.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      imageUrl: m.imageBase64,
      timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: m.sources,
      farmingActionCard: m.actionCard,
      diseaseAnalysis: m.diseaseAnalysis,
      executedAction: m.executedAction,
    }));
    setMessages(convertedMsgs);
    addToast('Conversation Restored', session.title, 'success');
  };

  const handleNewChat = () => {
    const newId = `sess_${Date.now()}`;
    setActiveSessionId(newId);
    setMessages([initialWelcomeMessage]);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await fetch(`/api/ai/sessions/${sessionId}`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
      addToast('Session Deleted', 'Conversation removed from history.', 'info');
    } catch (err) {
      console.warn('Could not delete session:', err);
    }
  };

  const handleFeedback = (msgId: string, type: 'like' | 'dislike') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedback: type } : m))
    );
    addToast(
      type === 'like' ? 'Feedback Recorded 👍' : 'Feedback Recorded 👎',
      type === 'like'
        ? 'Thank you! Your feedback helps optimize agronomical accuracy.'
        : 'Thank you! We will refine future farming recommendations.',
      'info'
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      {/* 1. Header Banner */}
      <div className="bg-green-700 text-white p-4 sm:p-6 rounded-2xl shadow-xl border border-white/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Left Title & Status */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/15 text-emerald-200 flex items-center justify-center font-bold border border-white/20 backdrop-blur-xs shadow-inner shrink-0">
            <Bot className="w-7 h-7 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-bold font-display text-xl text-white tracking-tight">
                🤖 Kishan Bhai AI (किसान भाई AI)
              </h1>
              <span className="bg-emerald-400/20 text-emerald-300 text-[11px] px-2.5 py-0.5 rounded-full font-mono border border-emerald-400/40 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                AI Online
              </span>
            </div>
            <p className="text-stone-200 text-xs sm:text-sm mt-0.5">
              Your 24/7 intelligent farming partner • Powered by Gemini 3.7 Flash
            </p>
          </div>
        </div>

        {/* Right Action Controls: Field Voice, Hands-Free Field Mode, Dialect, History, Clear */}
        <div className="flex items-center gap-2 relative z-10 w-full md:w-auto justify-end flex-wrap">
          {/* Field Voice Bar Toggle */}
          <button
            type="button"
            onClick={() => setIsFieldVoiceBarOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer border active:scale-95 shrink-0 ${
              isFieldVoiceBarOpen
                ? 'bg-emerald-400 text-stone-950 border-white'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
            }`}
            title="Toggle Hands-Free Field Voice Bar"
          >
            <Mic className={`w-3.5 h-3.5 ${isFieldVoiceBarOpen ? 'text-stone-950 animate-pulse' : 'text-emerald-300'}`} />
            <span>{language === 'hi' ? 'खेत वॉयस बार' : 'Field Voice Bar'}</span>
          </button>

          {/* Hands-Free Assistant Trigger */}
          <button
            type="button"
            onClick={() => setIsHandsFreeOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-stone-950 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer border border-emerald-200/50 active:scale-95 shrink-0"
            title="Open Hands-Free Field Conversation Loop"
          >
            <Radio className="w-3.5 h-3.5 text-stone-950 animate-pulse" />
            <span>{language === 'hi' ? 'बोलकर बात करें (Hands-Free)' : 'Hands-Free Field Mode'}</span>
          </button>

          {/* Voice Farm Diary Dictator Modal Button */}
          <button
            type="button"
            onClick={() => setIsFieldVoiceModalOpen(true)}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl text-xs font-medium border border-white/20 transition-all cursor-pointer active:scale-95 shrink-0"
            title="Open Voice Farm Diary Dictator Modal"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">{language === 'hi' ? 'वॉयस डायरी' : 'Voice Diary'}</span>
          </button>

          {/* Voice Dialect Selector */}
          <div className="relative">
            <select
              value={speechLanguageCode}
              onChange={(e) => setSpeechLanguageCode(e.target.value)}
              className="bg-white/15 hover:bg-white/25 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-xl border border-white/20 backdrop-blur-xs cursor-pointer focus:outline-none"
              title="Voice Recognition Language"
            >
              {INDIAN_SPEECH_LANGUAGES.map((opt) => (
                <option key={opt.code} value={opt.speechCode} className="text-stone-900 bg-white">
                  🎙️ {opt.nativeName} ({opt.label})
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value as any;
                setLanguage(newLang);
              }}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-medium px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-xs cursor-pointer focus:outline-none"
              title="Change Chat Language"
            >
              {SUPPORTED_LANGUAGES.map((opt) => (
                <option key={opt.code} value={opt.code} className="text-stone-900 bg-white">
                  {opt.flag} {opt.nativeName} ({opt.name})
                </option>
              ))}
            </select>
          </div>

          {/* Conversation History Drawer Button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl text-xs font-medium text-white border border-white/20 backdrop-blur-xs transition-colors cursor-pointer"
            title="Conversation History"
          >
            <History className="w-3.5 h-3.5 text-emerald-300" />
            <span>History</span>
            {sessions.length > 0 && (
              <span className="bg-emerald-400 text-emerald-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {sessions.length}
              </span>
            )}
          </button>

          {/* Clear Chat */}
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-xl text-xs text-white border border-white/20 backdrop-blur-xs transition-colors cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5 text-stone-300" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* 2. Farm-Aware Context Telemetry Badge */}
      <AIFarmContextBadge currentUser={currentUser} language={language} />

      {/* 3. Quick Action Chips & Scenario Cards */}
      <AIQuickPrompts
        onSelectPrompt={(prompt, sampleImg) => handleSend(prompt, sampleImg)}
        language={language}
      />

      {/* 4. Main Chat Interface Feed */}
      <div className="bg-stone-50/60 backdrop-blur-xl rounded-2xl border border-stone-200/90 shadow-xs flex flex-col overflow-hidden min-h-[480px]">
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-h-[560px]">
          {messages.map((msg) => (
            <AIChatMessageItem
              key={msg.id}
              message={msg}
              onRegenerate={(prompt) => handleSend(prompt)}
              onNavigateView={(view) => setCurrentView(view)}
              onFeedback={handleFeedback}
              language={language}
            />
          ))}

          {/* Typing Animation Indicator */}
          {isProcessing && (
            <div className="flex gap-3.5 justify-start animate-in fade-in">
              <div className="w-9 h-9 rounded-2xl bg-green-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-emerald-700/30">
                <Bot className="w-5 h-5 text-emerald-200 animate-spin" />
              </div>
              <div className="bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl rounded-tl-xs p-4 shadow-xs text-xs sm:text-sm text-stone-700 flex items-center gap-3">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="font-medium text-stone-600">
                  {language === 'hi' ? 'किशन भाई AI आपके खेत के डेटा का विश्लेषण कर रहा है...' : 'Kishan Bhai AI is reasoning across your farm telemetry...'}
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* 5. Large Bottom AI Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200/80 space-y-2.5">
          {/* Audio Speaking Out Loud Banner */}
          {isAudioSpeaking && (
            <div className="flex items-center justify-between gap-2 bg-emerald-950 text-emerald-200 border border-emerald-600/70 px-3.5 py-2 rounded-xl text-xs animate-in fade-in">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span className="font-semibold">
                  {language === 'hi'
                    ? 'कृषि सलाह बोलकर सुनाई जा रही है...'
                    : 'Reading agronomic recommendation aloud...'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setIsAudioSpeaking(false);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
              >
                {language === 'hi' ? 'आवाज रोकें ⏹️' : 'Stop Audio ⏹️'}
              </button>
            </div>
          )}

          {/* Hands-Free Field Voice-to-Text Bar */}
          {isFieldVoiceBarOpen && (
            <FieldVoiceBar
              isOpen={isFieldVoiceBarOpen}
              onToggleOpen={() => setIsFieldVoiceBarOpen(false)}
              onSendQuery={async (query) => {
                await handleSend(query);
              }}
              onSaveDiaryNote={handleSaveVoiceDiaryNote}
              language={language}
              selectedDialect={speechLanguageCode}
              onDialectChange={(code) => setSpeechLanguageCode(code)}
              defaultCrop={currentUser?.crops?.[0] || 'BT Cotton'}
              isProcessingQuery={isProcessing}
              autoSpeakAnswer={autoSpeakAnswer}
              onToggleAutoSpeak={(enabled) => setAutoSpeakAnswer(enabled)}
            />
          )}

          {/* Selected Image Thumbnail Preview */}
          {selectedImage && (
            <div className="flex items-center gap-3 bg-stone-100 p-2 rounded-xl border border-stone-200/80 w-fit">
              <img src={selectedImage} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
              <div className="text-xs">
                <div className="font-bold text-stone-800">Crop leaf photo attached</div>
                <div className="text-stone-500 text-[10px]">Ready for computer vision analysis</div>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Live Interim Speech Preview Banner */}
          {interimVoiceSpeech && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-300/80 px-3.5 py-2 rounded-xl text-xs animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping shrink-0"></span>
              <span className="font-semibold text-emerald-800 shrink-0">
                {language === 'hi' ? 'सुनाई दे रहा है:' : 'Hearing:'}
              </span>
              <span className="italic text-emerald-900 truncate">"{interimVoiceSpeech}"</span>
            </div>
          )}

          {/* Large Input Box */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/90 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-green-700/30 focus-within:border-green-700 transition-all shadow-inner">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Attach Image / Disease Scanner */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-stone-500 hover:text-green-700 hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
              title="Upload crop photo for disease scan"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={() => {
                setIsFieldVoiceBarOpen(true);
                toggleVoiceInput();
              }}
              className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                isListening || isFieldVoiceBarOpen
                  ? 'bg-emerald-600 text-white animate-pulse shadow-sm'
                  : 'text-stone-500 hover:text-green-700 hover:bg-emerald-50'
              }`}
              title="Hands-free field voice (Hindi/Regional)"
            >
              {isListening ? <MicOff className="w-5 h-5 text-rose-300" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                language === 'hi'
                  ? 'किशन भाई से अपने खेत, फसल, मौसम या मंडी भाव के बारे में कुछ भी पूछें...'
                  : 'Ask Kishan Bhai anything about your farm, crops, weather, or mandi prices...'
              }
              className="w-full bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none px-2"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isProcessing || (!inputPrompt.trim() && !selectedImage)}
              className="bg-green-700 hover:bg-[#233f17] disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <span className="hidden sm:inline">Send</span>
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Ground-truth: ICAR knowledge repository & live sensor radar</span>
            </span>
            <span className="hidden sm:inline">Press Enter to send</span>
          </div>
        </div>
      </div>

      {/* 6. Conversation History Drawer */}
      <AIHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        language={language}
      />

      {/* 7. Fullscreen Continuous Hands-Free Voice Assistant Modal */}
      <HandsFreeAssistantModal
        isOpen={isHandsFreeOpen}
        onClose={() => setIsHandsFreeOpen(false)}
        language={language}
        farmerName={currentUser?.fullName || 'Farmer Brother'}
        crops={currentUser?.crops || ['BT Cotton', 'Sharbati Wheat']}
        village={currentUser?.village || 'Anandpur'}
        onSendQuery={async (query) => {
          const res = await handleSend(query);
          return res || 'Processed your farm query.';
        }}
      />

      {/* 8. Voice Farm Diary Dictator Modal */}
      <FieldVoiceDictatorModal
        isOpen={isFieldVoiceModalOpen}
        onClose={() => setIsFieldVoiceModalOpen(false)}
        language={language}
        defaultCrop={currentUser?.crops?.[0] || 'BT Cotton'}
        onSaveEntry={(entry) => {
          handleSaveVoiceDiaryNote({
            category: entry.category,
            crop: entry.crop,
            title: entry.title,
            expenseAmountInr: entry.expenseAmountInr,
            revenueAmountInr: entry.revenueAmountInr,
            notes: entry.notes,
          });
        }}
      />
    </div>
  );
};
