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
 * Formats advisory text into crystal-clear, authentic Indian spoken words.
 * Expands technical agricultural ratios, dosages, and acronyms into clear spoken language
 * so every rural farmer can clearly understand every sentence without robotic artifacts.
 */
export function formatTextForIndianSpeech(text: string, langCode: string = 'hi-IN'): string {
  let s = text;
  const short = (langCode || 'hi-IN').toLowerCase().split('-')[0];

  const transitions: Record<string, { why: string; action: string; warning: string }> = {
    gu: {
      why: ' આનું મુખ્ય કારણ: ',
      action: ' તમારે આ પગલાં લેવા જોઈએ: ',
      warning: ' ધ્યાન રાખવા જેવી જરૂરી બાબત: ',
    },
    pa: {
      why: ' ਇਸਦਾ ਮੁੱਖ ਕਾਰਨ ਇਹ ਹੈ: ',
      action: ' ਤੁਸੀਂ ਇਹ ਜ਼ਰੂਰੀ ਕਦਮ ਚੁੱਕਣੇ ਹਨ: ',
      warning: ' ਧਿਆਨ ਰੱਖਣ ਵਾਲੀ ਖਾਸ ਗੱਲ: ',
    },
    mr: {
      why: ' याचे मुख्य कारण हे आहे: ',
      action: ' आपण पुढील उपाययोजना करावी: ',
      warning: ' महत्त्वाची काळजी ही घ्यावी: ',
    },
    bn: {
      why: ' এর মূল কারণ হলো: ',
      action: ' আপনার করণীয় পদক্ষেপ: ',
      warning: ' বিশেষ সতর্কবার্তা: ',
    },
    te: {
      why: ' దీనికి ప్రధాన కారణం: ',
      action: ' మీరు చేయవలసిన ముఖ్యమైన పనులు: ',
      warning: ' ముఖ్యమైన గమనిక: ',
    },
    ta: {
      why: ' இதன் முக்கிய காரணம்: ',
      action: ' நீங்கள் செய்ய வேண்டிய வழிகள்: ',
      warning: ' முக்கிய எச்சரிக்கை: ',
    },
    kn: {
      why: ' ಇದರ ಪ್ರಮುಖ ಕಾರಣ: ',
      action: ' ನೀವು ಕೈಗೊಳ್ಳಬೇಕಾದ ಕ್ರಮಗಳು: ',
      warning: ' ಪ್ರಮುಖ ಎಚ್ಚರಿಕೆ: ',
    },
    ml: {
      why: ' ഇതിന്റെ പ്രധാന കാരണം: ',
      action: ' ചെയ്യേണ്ട പ്രധാന കാര്യങ്ങൾ: ',
      warning: ' പ്രധാന മുന്നറിയിപ്പ്: ',
    },
    or: {
      why: ' ଏହାର ମୁଖ୍ୟ କାରଣ: ',
      action: ' ଆପଣଙ୍କ ପାଇଁ ପରାମର୍ଶ: ',
      warning: ' ଜରୁରୀ ସତର୍କତା: ',
    },
    as: {
      why: ' ইয়াৰ মূল কাৰণ হ’ল: ',
      action: ' আপোনাৰ কৰণীয় পদক্ষেপ: ',
      warning: ' গুৰুত্বপূৰ্ণ সতৰ্কবাণী: ',
    },
    en: {
      why: ' Key reasons: ',
      action: ' Recommended action steps: ',
      warning: ' Crucial safety caution: ',
    },
    hi: {
      why: ' इसका मुख्य कारण यह है: ',
      action: ' आपको यह कदम उठाने चाहिए: ',
      warning: ' ध्यान रखने योग्य जरूरी सावधानी यह है: ',
    },
  };

  const t = transitions[short] || transitions.hi;

  // 1. Convert Markdown headers & titles to natural conversational spoken transitions
  s = s.replace(/🌱\s*\*{0,2}(Recommendation|सलाह|સલાહ|ਸਲਾਹ|सल्ला|পরামর্শ|సలహా|ஆலோசனை|ಸಲಹೆ|നിർദ്ദേശം|ପରାମର୍ଶ|পৰামৰ্শ)[\s:]*([^*]+)\*{0,2}/gi, '$2. ');
  s = s.replace(/\*{0,2}(कारण\s*\(Why\?\)|Why\?|कारण|કારણ\s*\(Why\?\)|કારણ|ਕਿਉਂ\?|காரணம்|కారణం|ಏಕೆ\?|എന്തുകൊണ്ട്\?|କାରଣ|কাৰণ)[\s:]*\*{0,2}/gi, t.why);
  s = s.replace(/\*{0,2}(क्या\s*करें\s*\(What\s*to\s*do\)|What\s*to\s*do|क्या करें|તમારે\s*શું\s*કરવું|ਤੁਸੀਂ\s*ਕੀ\s*ਕਰਨਾ|काय करावे|করণীয়|ఏం చేయాలి|என்ன செய்ய வேண்டும்|ಏನು ಮಾಡಬೇಕು|എന്തു ചെയ്യണം|କ’ଣ କରିବେ|কি কৰিব)[\s:]*\*{0,2}/gi, t.action);
  s = s.replace(/⚠️\s*\*{0,2}(Important Warning|चेतावनी|ચેતવણી|ਚੇਤਾਵਨੀ|महत्त्वाची सूचना|সতর্কতা|ముఖ్యమైన గమనిక|எச்சரிக்கை|ಎಚ್ಚರಿಕೆ|മുന്നറിയിപ്പ്|ସତର୍କତା|সতৰ্কবাণী)[\s:]*([^*]+)\*{0,2}/gi, `${t.warning} $2`);

  // 2. Expand agricultural acronyms and formulas into natural spoken Indian terms
  s = s.replace(/\bNPK\s*19:19:19\b/gi, 'एन.पी.के. 19 19 19');
  s = s.replace(/\bNPK\s*00:52:34\b/gi, 'एन.पी.के. 0 52 34');
  s = s.replace(/\bNPK\s*00:00:50\b/gi, 'एन.पी.के. 0 0 50');
  s = s.replace(/\bNPK\s*12:61:00\b/gi, 'एन.पी.के. 12 61 0');
  s = s.replace(/\bNPK\b/gi, 'एन.पी.के.');
  s = s.replace(/\bDAP\b/gi, 'डी.ए.पी.');
  s = s.replace(/\bMOP\b/gi, 'एम.ओ.पी. पोटाश');
  s = s.replace(/\bFYM\b/gi, 'सड़ी गोबर खाद');
  s = s.replace(/\bMSP\b/gi, 'एम.एस.पी. समर्थन मूल्य');
  s = s.replace(/\bpH\b/gi, 'पी.एच.');
  s = s.replace(/\bBER\b/gi, 'फल का सड़ना');
  s = s.replace(/\bCRI\b/gi, 'ताज जड़ अवस्था');
  s = s.replace(/\bKCC\b/gi, 'किसान क्रेडिट कार्ड');
  s = s.replace(/\bPM-KISAN\b/gi, 'पी.एम. किसान योजना');
  s = s.replace(/\bPM-KUSUM\b/gi, 'पी.एम. कुसुम सोलर योजना');

  // 3. Units & dosage replacements for natural clarity
  s = s.replace(/@?\s*([0-9.]+)\s*(ग्राम|gram|g|gm)\s*\/\s*(लीटर|liter|l)/gi, '$1 ग्राम प्रति लीटर पानी में');
  s = s.replace(/@?\s*([0-9.]+)\s*(मिली|ml)\s*\/\s*(लीटर|liter|l)/gi, '$1 मिली प्रति लीटर पानी में');
  s = s.replace(/([0-9.]+)\s*(kg|किग्रा)\s*\/\s*(acre|एकड़)/gi, '$1 किलो प्रति एकड़');
  s = s.replace(/([0-9.]+)\s*(g|ग्राम)\s*\/\s*(10\s*लीटर|10L)/gi, '$1 ग्राम प्रति 10 लीटर पानी में');
  s = s.replace(/\b1\s*acre\b/gi, '1 एकड़');
  s = s.replace(/\b1\s*bigha\b/gi, '1 बीघा');
  s = s.replace(/\b1\s*hectare\b/gi, '1 हेक्टेयर');
  s = s.replace(/\b1\s*quintal\b/gi, '1 क्विंटल');
  s = s.replace(/\b₹\s*([0-9,]+)/g, '$1 रुपये');
  s = s.replace(/([0-9]+)%/g, '$1 प्रतिशत');

  // 4. Clean Markdown syntax, asterisks, brackets, hashes, bullet numbers
  s = s.replace(/[*_#`~]/g, '');
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  s = s.replace(/[()\[\]{}]/g, ' ');
  s = s.replace(/^[0-9]+\.\s*/gm, '');
  s = s.replace(/^[-•*]\s*/gm, '');
  s = s.replace(/http\S+/g, '');
  s = s.replace(/[🌱🌾💰🛡️⚠️✅⚡👉🎙️🤖📦📊🏷️🔗🛒💡🧪🐛💧🐄📐🌍⚖️🌿☀️🥛🦠]/g, '');
  s = s.replace(/[,:\s]{2,}/g, ', ');
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

/**
 * Resolves the best natural speaking voice for a given Indian regional language.
 * Strictly prioritizes authentic Indian accents (Google हिन्दी, Microsoft Swara/Madhur/Neerja/Kalpana)
 * and avoids robotic foreign accents so every farmer easily understands.
 */
export function findBestVoiceForLanguage(langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  let voices = cachedVoices;
  if (!voices || voices.length === 0) {
    voices = window.speechSynthesis.getVoices();
    cachedVoices = voices;
  }

  if (!voices || voices.length === 0) return null;

  const code = (langCode || 'hi-IN').toLowerCase().trim().replace('_', '-');
  const shortCode = code.split('-')[0];

  // Identifies genuine Indian voices by locale and recognized Indian TTS identifiers
  const isIndianVoice = (v: SpeechSynthesisVoice): boolean => {
    const l = (v.lang || '').toLowerCase();
    const n = (v.name || '').toLowerCase();
    return (
      l.includes('-in') ||
      n.includes('india') ||
      n.includes('hindi') ||
      n.includes('swara') ||
      n.includes('madhur') ||
      n.includes('neerja') ||
      n.includes('prabhat') ||
      n.includes('kalpana') ||
      n.includes('hemant') ||
      n.includes('heera') ||
      n.includes('ravi') ||
      n.includes('veena') ||
      n.includes('gujarati') ||
      n.includes('marathi') ||
      n.includes('punjabi') ||
      n.includes('bengali') ||
      n.includes('tamil') ||
      n.includes('telugu') ||
      n.includes('kannada') ||
      n.includes('malayalam') ||
      n.includes('odia')
    );
  };

  // Top-tier high-clarity Indian voices across Microsoft, Google, Apple & Android TTS
  const preferredIndianVoiceNames = [
    'swara',
    'madhur',
    'neerja',
    'prabhat',
    'google हिन्दी',
    'google gujarati',
    'google marathi',
    'google punjabi',
    'google bengali',
    'google tamil',
    'google telugu',
    'google kannada',
    'google malayalam',
    'kalpana',
    'hemant',
    'heera',
    'ravi',
    'veena',
    'google english (india)',
    'en-in',
    'hi-in',
  ];

  // 1. Exact language match that is also an authentic Indian voice
  const exactIndian = voices.find((v) => {
    const l = v.lang.toLowerCase();
    return (l === code || l === `${shortCode}-in`) && isIndianVoice(v);
  });
  if (exactIndian) return exactIndian;

  // 2. Any exact voice match for this language code
  const exact = voices.find((v) => v.lang.toLowerCase() === code || v.lang.toLowerCase() === `${shortCode}-in`);
  if (exact) return exact;

  // 3. Short code match with Indian origin
  const prefixIndian = voices.find((v) => v.lang.toLowerCase().startsWith(shortCode) && isIndianVoice(v));
  if (prefixIndian) return prefixIndian;

  // 4. Preferred natural Indian voice names (Swara, Madhur, Neerja, Kalpana, Google हिन्दी)
  for (const nameKeyword of preferredIndianVoiceNames) {
    const matched = voices.find((v) => v.name.toLowerCase().includes(nameKeyword) || v.lang.toLowerCase().includes(nameKeyword));
    if (matched) return matched;
  }

  // 5. Any Indian-accent voice installed in the browser
  const anyIndian = voices.find((v) => isIndianVoice(v));
  if (anyIndian) return anyIndian;

  // 6. Default fallback
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
 * Cleanly speak text using Web SpeechSynthesis API with dialect pairing and audio resilience.
 * Uses calibrated authentic Indian cadence (rate: 0.90, pitch: 1.02) so speech sounds
 * natural, pleasant, and crystal-clear to all farmers.
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

  let targetLang = options.lang || '';
  if (!targetLang || targetLang === 'en' || targetLang === 'en-IN') {
    if (/[\u0A00-\u0A7F]/.test(text)) targetLang = 'pa-IN';
    else if (/[\u0A80-\u0AFF]/.test(text)) targetLang = 'gu-IN';
    else if (/[\u0980-\u09FF]/.test(text)) targetLang = 'bn-IN';
    else if (/[\u0C00-\u0C7F]/.test(text)) targetLang = 'te-IN';
    else if (/[\u0B80-\u0BFF]/.test(text)) targetLang = 'ta-IN';
    else if (/[\u0C80-\u0CFF]/.test(text)) targetLang = 'kn-IN';
    else if (/[\u0D00-\u0D7F]/.test(text)) targetLang = 'ml-IN';
    else if (/[\u0B00-\u0B7F]/.test(text)) targetLang = 'or-IN';
    else if (/[\u0900-\u097F]/.test(text)) targetLang = 'hi-IN';
    else targetLang = 'en-IN';
  }

  // Pre-process raw advisory text into natural, easy-to-understand spoken Indian phrasing
  const spokenText = formatTextForIndianSpeech(text, targetLang);

  if (!spokenText) {
    options.onEnd?.();
    return null;
  }

  const utterance = new SpeechSynthesisUtterance(spokenText);

  // Pair with best authentic Indian voice
  const matchedVoice = findBestVoiceForLanguage(targetLang);
  if (matchedVoice) {
    utterance.voice = matchedVoice;
    utterance.lang = matchedVoice.lang;
  } else {
    utterance.lang = targetLang.includes('-') ? targetLang : `${targetLang}-IN`;
  }

  // Authentic, pleasant, calm Indian pacing (0.90 rate) so every word is distinct & clear
  utterance.rate = options.rate ?? 0.90;
  utterance.pitch = options.pitch ?? 1.02;
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
