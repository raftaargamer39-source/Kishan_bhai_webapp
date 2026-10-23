// Web Speech API Service for Kishan Bhai
// Supports multi-dialect Indian agricultural voice recognition & speech synthesis

export interface SpeechLanguageOption {
  code: string;
  label: string;
  nativeName: string;
  speechCode: string;
  recognitionCodes?: string[];
}

export const INDIAN_SPEECH_LANGUAGES: SpeechLanguageOption[] = [
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', recognitionCodes: ['hi-IN', 'en-IN'] },
  { code: 'en', label: 'English (India)', nativeName: 'English (IN)', speechCode: 'en-IN', recognitionCodes: ['en-IN', 'en-US'] },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN', recognitionCodes: ['gu-IN', 'hi-IN', 'en-IN'] },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN', recognitionCodes: ['pa-IN', 'pa-Guru-IN', 'hi-IN', 'en-IN'] },
  { code: 'as', label: 'Assamese', nativeName: 'অসমীয়া', speechCode: 'as-IN', recognitionCodes: ['as-IN', 'bn-IN', 'hi-IN', 'en-IN'] },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN', recognitionCodes: ['bn-IN', 'hi-IN', 'en-IN'] },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN', recognitionCodes: ['mr-IN', 'hi-IN', 'en-IN'] },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN', recognitionCodes: ['te-IN', 'en-IN', 'hi-IN'] },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN', recognitionCodes: ['ta-IN', 'en-IN'] },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN', recognitionCodes: ['kn-IN', 'en-IN', 'hi-IN'] },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN', recognitionCodes: ['ml-IN', 'en-IN'] },
  { code: 'or', label: 'Odia', nativeName: 'ଓଡ଼ିଆ', speechCode: 'or-IN', recognitionCodes: ['or-IN', 'hi-IN', 'bn-IN', 'en-IN'] },
];

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function startSpeechRecognition(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (error: any) => void,
  lang: string = 'hi-IN'
): any {
  if (!isSpeechRecognitionSupported()) {
    onError?.(new Error('Speech recognition not supported'));
    return null;
  }
  try {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          onResult(event.results[i][0].transcript, true);
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (interim) {
        onResult(interim, false);
      }
    };

    recognition.onerror = (event: any) => {
      onError?.(event);
    };

    recognition.start();
    return recognition;
  } catch (e) {
    onError?.(e);
    return null;
  }
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

export interface ParsedFarmDiaryVoice {
  category: 'Fertilizer' | 'Disease & Pest' | 'Irrigation' | 'Labour' | 'Harvesting' | 'Sale' | 'Sowing' | 'General';
  crop: string;
  title: string;
  expenseAmountInr?: number;
  revenueAmountInr?: number;
  notes: string;
  rawTranscript: string;
}

/**
 * Intelligent parser that extracts structured agricultural ledger fields
 * from raw natural language voice dictation in English and Hindi.
 */
export function parseFarmVoiceDictation(transcript: string, defaultCrop: string = 'BT Cotton'): ParsedFarmDiaryVoice {
  const lower = transcript.toLowerCase();
  
  // 1. Detect Category
  let category: ParsedFarmDiaryVoice['category'] = 'General';
  if (
    lower.includes('fertilizer') ||
    lower.includes('urea') ||
    lower.includes('dap') ||
    lower.includes('npk') ||
    lower.includes('compost') ||
    lower.includes('manure') ||
    lower.includes('खाद') ||
    lower.includes('उर्वरक') ||
    lower.includes('यूरिया') ||
    lower.includes('गोबर')
  ) {
    category = 'Fertilizer';
  } else if (
    lower.includes('pest') ||
    lower.includes('spray') ||
    lower.includes('fungicide') ||
    lower.includes('insecticide') ||
    lower.includes('disease') ||
    lower.includes('neem') ||
    lower.includes('कीट') ||
    lower.includes('कीटनाशक') ||
    lower.includes('छिड़काव') ||
    lower.includes('बीमारी') ||
    lower.includes('फफूंद')
  ) {
    category = 'Disease & Pest';
  } else if (
    lower.includes('water') ||
    lower.includes('irrigation') ||
    lower.includes('drip') ||
    lower.includes('sprinkler') ||
    lower.includes('borewell') ||
    lower.includes('canal') ||
    lower.includes('पानी') ||
    lower.includes('सिंचाई') ||
    lower.includes('ड्रिप') ||
    lower.includes('मोटर') ||
    lower.includes('पम्प')
  ) {
    category = 'Irrigation';
  } else if (
    lower.includes('labour') ||
    lower.includes('labor') ||
    lower.includes('worker') ||
    lower.includes('wage') ||
    lower.includes('weeding') ||
    lower.includes('मजदूर') ||
    lower.includes('मजदूरी') ||
    lower.includes('निराई') ||
    lower.includes('गुड़ाई')
  ) {
    category = 'Labour';
  } else if (
    lower.includes('harvest') ||
    lower.includes('cutting') ||
    lower.includes('picking') ||
    lower.includes('threshing') ||
    lower.includes('कटाई') ||
    lower.includes('तुड़ाई') ||
    lower.includes('थ्रेशर') ||
    lower.includes('पैदावार')
  ) {
    category = 'Harvesting';
  } else if (
    lower.includes('sold') ||
    lower.includes('sale') ||
    lower.includes('selling') ||
    lower.includes('mandi') ||
    lower.includes('apmc') ||
    lower.includes('revenue') ||
    lower.includes('income') ||
    lower.includes('बेचा') ||
    lower.includes('बिक्री') ||
    lower.includes('मंडी') ||
    lower.includes('कमाई')
  ) {
    category = 'Sale';
  } else if (
    lower.includes('sow') ||
    lower.includes('sowing') ||
    lower.includes('seed') ||
    lower.includes('germination') ||
    lower.includes('बुवाई') ||
    lower.includes('बीज') ||
    lower.includes('बोया')
  ) {
    category = 'Sowing';
  }

  // 2. Detect Crop
  let crop = defaultCrop;
  const commonCrops = [
    { name: 'BT Cotton', keywords: ['cotton', 'कपास', 'रुई'] },
    { name: 'Sharbati Wheat', keywords: ['wheat', 'गेहूं', 'कनक'] },
    { name: 'Groundnut (TG-37A)', keywords: ['groundnut', 'peanut', 'मूंगफली', 'सिंग'] },
    { name: 'Mustard (Pusa Bold)', keywords: ['mustard', 'सरसों', 'राई'] },
    { name: 'Soybean', keywords: ['soybean', 'soya', 'सोयाबीन'] },
    { name: 'Paddy / Basmati Rice', keywords: ['rice', 'paddy', 'धान', 'चावल'] },
    { name: 'Sugarcane', keywords: ['sugarcane', 'गन्ना'] },
    { name: 'Maize (Corn)', keywords: ['maize', 'corn', 'मक्का'] },
    { name: 'Gram / Chickpea', keywords: ['gram', 'chickpea', 'चना'] },
    { name: 'Onion', keywords: ['onion', 'प्याज़', 'कांदा'] },
    { name: 'Potato', keywords: ['potato', 'आलू', 'बटाटा'] },
    { name: 'Tomato', keywords: ['tomato', 'टमाटर'] },
  ];

  for (const c of commonCrops) {
    if (c.keywords.some((kw) => lower.includes(kw))) {
      crop = c.name;
      break;
    }
  }

  // 3. Extract Monetary Amounts (INR)
  let expenseAmountInr: number | undefined = undefined;
  let revenueAmountInr: number | undefined = undefined;

  // Regex looking for numbers near rupee / inr / rs / खर्च / रुपये / बेचे
  const numberMatches = transcript.match(/\b\d+([,.]\d+)?\b/g);
  
  if (numberMatches && numberMatches.length > 0) {
    const rawNumbers = numberMatches.map((n) => parseFloat(n.replace(/,/g, ''))).filter((n) => !isNaN(n) && n > 0);

    // If it's a sale
    if (category === 'Sale' || lower.includes('sold') || lower.includes('बेचा') || lower.includes('बिक्री') || lower.includes('revenue') || lower.includes('income')) {
      const bestNum = rawNumbers.find((n) => n >= 50);
      if (bestNum) {
        revenueAmountInr = bestNum;
      }
    } else {
      // It's likely an expense
      const bestNum = rawNumbers.find((n) => n >= 20);
      if (bestNum) {
        expenseAmountInr = bestNum;
      }
    }
  }

  // 4. Generate Clean Title
  let title = transcript.trim();
  if (title.length > 80) {
    title = `${title.substring(0, 77)}...`;
  }

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return {
    category,
    crop,
    title: title || `${category} operation on ${crop}`,
    expenseAmountInr,
    revenueAmountInr,
    notes: transcript.trim(),
    rawTranscript: transcript,
  };
}

/**
 * Cache and retrieve browser synthesis voices with auto-reload listener
 */
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const updateVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch {
      // ignore
    }
  };
  updateVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }
}

/**
 * Resolves the best natural speaking voice for a given Indian regional language.
 * Falls back gracefully to phonetically compatible regional or Indian English voices.
 */
export function findBestVoiceForLanguage(langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  let voices = cachedVoices;
  if (!voices || voices.length === 0) {
    voices = window.speechSynthesis.getVoices();
    cachedVoices = voices;
  }

  if (!voices || voices.length === 0) return null;

  const code = (langCode || 'en-IN').toLowerCase().trim().replace('_', '-');
  const shortCode = code.split('-')[0];

  // Language fallback hierarchy for Indian regional tongues
  const fallbackPreferences: Record<string, string[]> = {
    as: ['as-in', 'bn-in', 'bn', 'hi-in', 'en-in', 'en'], // Assamese -> Bengali/Hindi/Indian English
    or: ['or-in', 'hi-in', 'bn-in', 'en-in', 'en'],       // Odia -> Hindi/Bengali/Indian English
    pa: ['pa-in', 'pa', 'hi-in', 'en-in', 'en'],          // Punjabi -> Hindi/Indian English
    gu: ['gu-in', 'gu', 'hi-in', 'en-in', 'en'],          // Gujarati -> Hindi/Indian English
    mr: ['mr-in', 'mr', 'hi-in', 'en-in', 'en'],          // Marathi -> Hindi/Indian English
    bn: ['bn-in', 'bn', 'hi-in', 'en-in', 'en'],          // Bengali -> Hindi/Indian English
    te: ['te-in', 'te', 'hi-in', 'en-in', 'en'],          // Telugu -> Hindi/Indian English
    ta: ['ta-in', 'ta', 'en-in', 'en'],                   // Tamil -> Indian English
    kn: ['kn-in', 'kn', 'hi-in', 'en-in', 'en'],          // Kannada -> Indian English
    ml: ['ml-in', 'ml', 'en-in', 'en'],                   // Malayalam -> Indian English
    hi: ['hi-in', 'hi', 'en-in', 'en'],                   // Hindi -> Indian English
    en: ['en-in', 'en-gb', 'en-us', 'en'],
  };

  const candidates = [
    code,
    ...(fallbackPreferences[shortCode] || []),
    'en-in',
    'hi-in',
    'en-us',
  ];

  for (const cand of candidates) {
    // 1. Exact match
    const exact = voices.find((v) => v.lang.toLowerCase() === cand);
    if (exact) return exact;

    // 2. Prefix match
    const prefix = voices.find((v) => v.lang.toLowerCase().startsWith(cand.slice(0, 2)));
    if (prefix) return prefix;
  }

  // 3. Any Indian dialect voice
  const indianVoice = voices.find(
    (v) =>
      v.lang.toLowerCase().includes('-in') ||
      v.name.toLowerCase().includes('india') ||
      v.name.toLowerCase().includes('hindi')
  );
  if (indianVoice) return indianVoice;

  // 4. Default browser voice
  const defaultVoice = voices.find((v) => v.default) || voices[0];
  return defaultVoice || null;
}

/**
 * Returns prioritized speech recognition codes for a given language.
 */
export function getSupportedRecognitionCodes(lang: string): string[] {
  const short = lang.toLowerCase().trim().replace('_', '-').split('-')[0];
  const item = INDIAN_SPEECH_LANGUAGES.find((l) => l.code === short);
  if (item?.recognitionCodes && item.recognitionCodes.length > 0) {
    return item.recognitionCodes;
  }
  return [lang.includes('-') ? lang : `${lang}-IN`, 'hi-IN', 'en-IN'];
}

// Retain active utterance references to prevent Chromium garbage collection bug
declare global {
  interface Window {
    __kisanActiveUtterances?: SpeechSynthesisUtterance[];
  }
}

if (typeof window !== 'undefined') {
  window.__kisanActiveUtterances = window.__kisanActiveUtterances || [];
}

/**
 * Cleanly speak text using Web SpeechSynthesis API with dialect pairing and audio resilience
 */
export function speakText(
  text: string,
  options: {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
): SpeechSynthesisUtterance | null {
  if (!isSpeechSynthesisSupported()) {
    options.onError?.(new Error('Speech synthesis is not supported on this browser.'));
    return null;
  }

  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }

  // Strip Markdown markers, emojis, web URLs and brackets for clear speech output
  const clean = text
    .replace(/[*_#`[\]()~]/g, ' ')
    .replace(/http\S+/g, '')
    .replace(/[🌱🌾💰🛡️⚠️✅⚡👉🎙️🤖📦📊🏷️🔗🛒💡]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) {
    options.onEnd?.();
    return null;
  }

  const utterance = new SpeechSynthesisUtterance(clean);
  const targetLang = options.lang || 'en-IN';

  // Pair with best matching voice installed on user's system
  const matchedVoice = findBestVoiceForLanguage(targetLang);
  if (matchedVoice) {
    utterance.voice = matchedVoice;
    utterance.lang = matchedVoice.lang;
  } else {
    utterance.lang = targetLang.includes('-') ? targetLang : `${targetLang}-IN`;
  }

  utterance.rate = options.rate ?? 0.95;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = options.volume ?? 1.0;

  const cleanup = () => {
    if (typeof window !== 'undefined' && window.__kisanActiveUtterances) {
      const arr = window.__kisanActiveUtterances;
      const idx = arr.indexOf(utterance);
      if (idx !== -1) arr.splice(idx, 1);
    }
  };

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    cleanup();
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    cleanup();
    console.warn('Speech synthesis utterance notice:', e);
    // If error is canceled due to new speech request, do not treat as fatal
    if ((e as any)?.error !== 'canceled') {
      options.onError?.(e);
    }
  };

  // Hold strong reference against Chrome GC
  if (typeof window !== 'undefined' && window.__kisanActiveUtterances) {
    window.__kisanActiveUtterances.push(utterance);
  }

  // Tiny delay of 40ms to avoid Chrome audio race condition when cancel() is followed by speak()
  setTimeout(() => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Failed to start speech synthesis:', err);
      cleanup();
      options.onError?.(err);
    }
  }, 40);

  return utterance;
}

export function stopSpeech(): void {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
      if (typeof window !== 'undefined' && window.__kisanActiveUtterances) {
        window.__kisanActiveUtterances = [];
      }
    } catch {
      // ignore
    }
  }
}
