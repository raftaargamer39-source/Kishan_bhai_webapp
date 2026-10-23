/**
 * Bilingual Translation Dictionary & Localizer (Hindi & English)
 * Kishan Bhai Platform
 */

export type SupportedLanguage = 'hi' | 'en';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌐' },
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  hi: {
    appTitle: 'किसान भाई',
    tagline: 'बीज से बाज़ार तक — आपका AI कृषि साथी',
    dashboard: 'डैशबोर्ड',
    myCrops: 'मेरी फसलें',
    cropRecommendation: 'फसल चयन सलाहकार',
    soilHealth: 'मृदा स्वास्थ्य कार्ड',
    diseaseScanner: 'फसल रोग जांच',
    smartIrrigation: 'स्मार्ट सिंचाई',
    marketPrices: 'मंडी भाव',
    farmDiary: 'कृषि डायरी व खर्च',
    virtualClusters: 'वर्चुअल फार्म क्लस्टर',
    bulkBuying: 'सामूहिक खरीद',
    harvestPooling: 'फसल एकत्रीकरण',
    machinerySharing: 'कृषि यंत्र किराया',
    schemes: 'सरकारी योजनाएं',
    expertConsultation: 'कृषि वैज्ञानिक सलाह',
    community: 'किसान चौपाल',
    profitCalculator: 'मुनाफा कैलकुलेटर',
    weather: 'मौसम पूर्वानुमान',
    adminDashboard: 'प्रशासन डैशबोर्ड',
    settings: 'सेटिंग्स',
    logout: 'लॉग आउट',
    searchPlaceholder: 'फसल, मंडी, रोग या सलाह खोजें...',
    aiGreeting: 'राम राम किसान भाई! आज आपकी फसल के लिए क्या सहायता चाहिए?',
    sprayWindow: 'कीटनाशक / पोषण छिड़काव खिड़की',
    optimalConditions: 'मौसम अनुकूल है',
    saveChanges: 'बदलाव सहेजें',
    cancel: 'रद्द करें',
    submit: 'जमा करें',
    loading: 'कृपया प्रतीक्षा करें...',
    verifiedData: 'सत्यापित डेटा',
    liveApi: 'लाइव सैटेलाइट व मौसम डेटा',
    demoModeNotice: 'डेमो मोड सक्रिय — परीक्षण डेटा प्रदर्शित',
    voiceAssistant: 'AI वॉयस सहायक',
    quickScan: 'रोग जांच',
    callExpert: 'विशेषज्ञ से बात करें',
    helpline: 'किसान हेल्पलाइन',
    soilMoisture: 'मृदा नमी',
    temperature: 'तापमान',
    rainChance: 'वर्षा संभावना',
    mandiRates: 'ताज़ा मंडी भाव',
    advisory: 'कृषि सलाह',
    pumpStatus: 'सिंचाई मोटर',
    activeCrops: 'सक्रिय फसलें',
    healthScore: 'स्वास्थ्य स्कोर',
    alerts: 'खेत अलर्ट',
    filter: 'फ़िल्टर',
    all: 'सभी',
    home: 'होम',
    profile: 'प्रोफ़ाइल',
    languageLabel: '🌐 भाषा:',
    freeHelp: 'मुफ्त कॉल',
    callHelpline: 'किसान हेल्पलाइन',
    acreLand: 'एकड़ खेत',
    top4Actions: 'सबसे जरूरी 4 काम (सीधा 1-टैप)',
    oneTap: 'आसान उपयोग',
    cropDoctorTitle: 'रोग पहचान',
    scanLeaf: 'पत्ती का फोटो लें',
    scanLeafDesc: 'रोग पहचानें व तुरंत सही दवा और देसी इलाज पाएं',
    openCamera: 'कैमरा खोलें 📸',
    voiceAiTitle: 'बोलकर पूछें',
    askKisanAi: 'खेती के सवाल पूछें',
    askKisanAiDesc: 'माइक दबाएं और अपनी भाषा में कोई भी सवाल बोलें',
    startVoice: 'माइक चालू करें 🎙️',
    irrigationVerdict: 'सिंचाई सलाह',
    holdWater: 'सिंचाई: आज पानी न दें ❌',
    giveWater: 'सिंचाई: आज पानी दें ✅',
    pumpRunning: 'पंप चालू',
    pumpStopped: 'पंप बंद',
    startPump: '▶️ पंप चालू करें',
    stopPump: '⏹️ पंप बंद करें',
    liveMandiRate: 'ताज़ा मंडी भाव',
    cottonRate: 'कपास (Bt Cotton)',
    highestRate: 'सर्वोच्च भाव',
    viewAllMandis: 'सभी मंडियां देखें 📊',
    dailyTasksTitle: 'आज के 3 जरूरी काम (चेकलिस्ट)',
    dailyTasksDesc: 'पूरा होने पर टिक करें — आपकी फसल सुरक्षित रहेगी',
    tasksCompleted: 'काम पूरे',
    allServicesTitle: 'अन्य सभी उपयोगी सेवाएं',
    tapAnyService: 'किसी भी सेवा पर टैप करें',
    weatherForecastTitle: 'मौसम का आसान अनुमान (अगले 5 दिन)',
    viewFullWeather: 'पूरा मौसम देखें',
    askAiSectionTitle: 'खेती से जुड़ा कोई भी सवाल पूछें',
    askAiSectionDesc: 'नीचे दिए गए किसी भी सवाल पर क्लिक करें या अपना सवाल बोलें:',
    aiScientist24x7: '24/7 AI कृषि वैज्ञानिक',
    askAiPlaceholder: 'यहाँ अपना सवाल लिखें या बोलें...',
    listenAdvice: 'सलाह बोलकर सुनें 🔊',
    stopAudio: 'आवाज रोकें',
    footerTagline: 'किसान भाई • भारतीय किसानों के लिए सरल, सीधा और भरोसेमंद डिजिटल साथी',
    talkToScientist: 'विशेषज्ञ से बात करें',
    digitalFarmLedger: 'डिजिटल खेत खाता और दैनिक डायरी',
    recordActivity: 'नया खर्च / कार्य दर्ज करें',
    dictateVoice: 'बोलकर डायरी लिखें (Hands-Free)',
    totalExpenses: 'कुल खर्च',
    harvestEarnings: 'कुल आमदनी',
    netProfit: 'शुद्ध मुनाफा',
    pendingTasks: 'लंबित कार्य',
    activityTimeline: 'खेत गतिविधि इतिहास',
    open: 'खोलें',
    close: 'बंद करें',
    rain: 'बारिश',
    sunny: 'धूप',
    exportCsv: 'CSV डाउनलोड',
    clearChat: 'चैट साफ़ करें',
    history: 'इतिहास',
    handsFreeFieldMode: 'बोलकर बात करें (Hands-Free)',
  },
  en: {
    appTitle: 'Kishan Bhai',
    tagline: 'From Seed to Sale — Your AI Farming Partner',
    dashboard: 'Dashboard',
    myCrops: 'My Active Crops',
    cropRecommendation: 'AI Crop Recommendation',
    soilHealth: 'Soil Health Card',
    diseaseScanner: 'Crop Disease Scanner',
    smartIrrigation: 'Smart Irrigation',
    marketPrices: 'Mandi Market Rates',
    farmDiary: 'Farm Diary & Expenses',
    virtualClusters: 'Virtual Farm Clusters',
    bulkBuying: 'Collective Bulk Buying',
    harvestPooling: 'Harvest Pooling',
    machinerySharing: 'Machinery Sharing',
    schemes: 'Government Schemes',
    expertConsultation: 'Talk to Expert',
    community: 'Farmer Community',
    profitCalculator: 'Profit Calculator',
    weather: 'Agro Weather',
    adminDashboard: 'Admin Dashboard',
    settings: 'Settings',
    logout: 'Sign Out',
    searchPlaceholder: 'Search crops, mandis, pests or advice...',
    aiGreeting: 'Greetings Farmer Brother! How can I assist your farm today?',
    sprayWindow: 'Pesticide & Spray Window',
    optimalConditions: 'Optimal Field Conditions',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    submit: 'Submit',
    loading: 'Loading, please wait...',
    verifiedData: 'Verified Agricultural Data',
    liveApi: 'Live Weather & Satellite Feed',
    demoModeNotice: 'Demo Mode Active — Test Data Displayed',
    voiceAssistant: 'AI Voice Assistant',
    quickScan: 'Disease Scan',
    callExpert: 'Talk to Expert',
    helpline: 'Kisan Helpline',
    soilMoisture: 'Soil Moisture',
    temperature: 'Temperature',
    rainChance: 'Rain Probability',
    mandiRates: 'Live Mandi Rates',
    advisory: 'Agro Advisory',
    pumpStatus: 'Irrigation Pump',
    activeCrops: 'Active Crops',
    healthScore: 'Health Score',
    alerts: 'Farm Alerts',
    filter: 'Filter',
    all: 'All',
    home: 'Home',
    profile: 'Profile',
    languageLabel: '🌐 Language:',
    freeHelp: 'Free Help',
    callHelpline: 'Kisan Helpline',
    acreLand: 'Acre Land',
    top4Actions: 'Top 4 Immediate Actions',
    oneTap: 'One Tap',
    cropDoctorTitle: 'Crop Doctor',
    scanLeaf: 'Scan Leaf Photo',
    scanLeafDesc: 'Identify crop disease and get certified spray dose',
    openCamera: 'Open Camera 📸',
    voiceAiTitle: 'Voice AI',
    askKisanAi: 'Ask Kisan AI',
    askKisanAiDesc: 'Speak questions in your language for 24/7 answers',
    startVoice: 'Start Voice 🎙️',
    irrigationVerdict: 'Irrigation Verdict',
    holdWater: 'Hold Water Today ❌',
    giveWater: 'Irrigation Recommended ✅',
    pumpRunning: 'Pump Running',
    pumpStopped: 'Pump Stopped',
    startPump: '▶️ Start Pump',
    stopPump: '⏹️ Stop Pump',
    liveMandiRate: 'Live Mandi Rate',
    cottonRate: 'Cotton (Bt Cotton)',
    highestRate: 'Highest Rate',
    viewAllMandis: 'View All Mandis 📊',
    dailyTasksTitle: "Today's 3 Key Farm Tasks (Checklist)",
    dailyTasksDesc: 'Check off tasks as completed to safeguard your crop',
    tasksCompleted: 'Tasks Done',
    allServicesTitle: 'All Useful Farming Services',
    tapAnyService: 'Tap any service below',
    weatherForecastTitle: '5-Day Simple Weather Guide',
    viewFullWeather: 'View Full Forecast',
    askAiSectionTitle: 'Ask Any Farm Question',
    askAiSectionDesc: 'Tap any common question below or type your query:',
    aiScientist24x7: '24/7 AI Crop Scientist',
    askAiPlaceholder: 'Type your farming question here...',
    listenAdvice: 'Listen Advice 🔊',
    stopAudio: 'Stop Audio',
    footerTagline: 'Kishan Bhai • Simple, trusted digital agriculture platform for farmers',
    talkToScientist: 'Talk to Agronomist',
    digitalFarmLedger: 'Digital Farm Ledger & Activity Log',
    recordActivity: 'Record Activity',
    dictateVoice: 'Dictate Farm Note (Field Voice)',
    totalExpenses: 'Total Expenses',
    harvestEarnings: 'Total Farm Income',
    netProfit: 'Net Farm Margin',
    pendingTasks: 'Pending Tasks',
    activityTimeline: 'Farm Activity Timeline & Entries',
    open: 'Open',
    close: 'Close',
    rain: 'Rain',
    sunny: 'Sunny',
    exportCsv: 'Export CSV',
    clearChat: 'Clear Chat',
    history: 'History',
    handsFreeFieldMode: 'Hands-Free Field Mode',
  },
};

/**
 * Translation helper function
 */
export function t(lang: string, key: string, fallback?: string): string {
  const currentLang = (lang === 'hi' || lang === 'en') ? lang : 'hi';
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.hi;
  if (dict[key]) {
    return dict[key];
  }
  if (TRANSLATIONS.hi[key]) return TRANSLATIONS.hi[key];
  if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
  return fallback || key;
}

export function getTranslation(lang: string, key: string, fallback?: string): string {
  return t(lang, key, fallback);
}

/**
 * Direct locale selector for bilingual UI strings
 */
export function loc(lang: string, enText: string, hiText: string, _guText?: string): string {
  if (lang === 'en') return enText;
  if (lang === 'hi') return hiText;
  return hiText || enText;
}

/**
 * Returns localized string from an object with language keys
 */
export function getLocalizedText(
  lang: string,
  texts: { hi?: string; en?: string; [key: string]: string | undefined },
  fallback?: string
): string {
  if (texts[lang]) return texts[lang]!;
  if (lang === 'en' && texts.en) return texts.en;
  if (texts.hi) return texts.hi;
  if (texts.en) return texts.en;
  return fallback || Object.values(texts)[0] || '';
}

/**
 * Maps language code to browser speech synthesis / recognition language code
 */
export function getSpeechLanguageCode(lang: string): string {
  return lang === 'en' ? 'en-IN' : 'hi-IN';
}

/**
 * Returns spoken farm advisory for dashboard in native language
 */
export function getLocalizedSpokenAdvisory(
  lang: string,
  tempVal: number,
  rainVal: number,
  moisturePct: number
): { text: string; langCode: string } {
  const langCode = getSpeechLanguageCode(lang);
  const isRainy = rainVal >= 50;

  if (lang === 'en') {
    return {
      text: `Namaste Farmer Brother. Today's temperature is ${tempVal} degrees Celsius with ${rainVal} percent rain probability. Soil moisture is at ${moisturePct} percent. ${
        isRainy
          ? 'Please postpone foliar spraying and inspect field drainage channels due to expected rain.'
          : 'Field conditions are stable for normal farming operations.'
      }`,
      langCode: 'en-IN',
    };
  }

  return {
    text: `राम राम किसान भाई। आज का तापमान ${tempVal} डिग्री सेल्सियस है और बारिश की संभावना ${rainVal} प्रतिशत है। खेत की मिट्टी में नमी ${moisturePct} प्रतिशत है। ${
      isRainy
        ? 'बारिश के अनुमान के कारण आज कीटनाशक या खाद का छिड़काव न करें और जल निकासी नालियां साफ रखें।'
        : 'मौसम सामान्य है, नियमित कृषि कार्य जारी रख सकते हैं।'
    }`,
    langCode: 'hi-IN',
  };
}

export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLocalizedNumber(num: number, locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale).format(num);
}
