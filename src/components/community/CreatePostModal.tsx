import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useUserStore } from '../../store/userStore';
import {
  X,
  Send,
  Mic,
  Image as ImageIcon,
  Sparkles,
  Users,
  Sprout,
  CheckCircle2,
} from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'text' | 'voice' | 'photo';
  onPublish: (postData: {
    title: string;
    content: string;
    category: string;
    cropTag: string;
    imageUrl?: string;
    tags: string[];
    isVoicePost?: boolean;
  }) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'text',
  onPublish,
}) => {
  const { language, addToast } = useApp();
  const farmerProfile = useUserStore((state) => state.farmerProfile);

  const [activeTab, setActiveTab] = useState<'text' | 'voice' | 'photo'>(initialMode);
  const [content, setContent] = useState('');
  const [topicCategory, setTopicCategory] = useState('Crop Protection');
  const [cropTag, setCropTag] = useState(farmerProfile.mainCrop || 'Cotton');
  const [imageUrl, setImageUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedDuration, setRecordedDuration] = useState(0);

  const isHi = language === 'hi';
  const isGu = language === 'gu';

  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  // Voice recording simulation / speech recognition
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordedDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordedDuration(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      addToast(
        isHi ? 'आवाज रिकॉर्ड हुई' : 'Voice Note Recorded',
        isHi ? 'आपका संदेश पोस्ट में जोड़ दिया गया है।' : 'Voice transcription added to post.',
        'success'
      );
    } else {
      setIsRecording(true);
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        try {
          const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const rec = new SpeechRecognition();
          rec.lang = isHi ? 'hi-IN' : isGu ? 'gu-IN' : 'en-IN';
          rec.interimResults = true;
          rec.onresult = (e: any) => {
            const transcript = e.results[0][0].transcript;
            setContent((prev) => (prev ? prev + ' ' + transcript : transcript));
          };
          rec.onerror = () => setIsRecording(false);
          rec.onend = () => setIsRecording(false);
          rec.start();
        } catch {
          // Fallback simulation
          setTimeout(() => {
            setContent(
              (prev) =>
                prev ||
                (isHi
                  ? 'नमस्कार किसान भाइयों, मेरी कपास की फसल में पत्तों पर पीले धब्बे दिख रहे हैं। क्या कोई भाई उचित देसी या प्रमाणित दवा बता सकता है?'
                  : 'Hello farmers, seeing yellow patches on my crop leaves. Please suggest proven spray.')
            );
            setIsRecording(false);
          }, 3500);
        }
      } else {
        setTimeout(() => {
          setContent(
            (prev) =>
              prev ||
              (isHi
                ? 'नमस्कार किसान भाइयों, मेरी फसल में पत्तों पर पीले धब्बे दिख रहे हैं। कृपया उचित स्प्रे बताएं।'
                : 'Hello farmers, please suggest proven spray for leaf spot.')
          );
          setIsRecording(false);
        }, 3000);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      addToast('Missing Content', 'Please enter or dictate a question or experience.', 'error');
      return;
    }

    const title = content.length > 50 ? content.slice(0, 50) + '...' : content;
    onPublish({
      title,
      content,
      category: topicCategory,
      cropTag,
      imageUrl: imageUrl.trim() ? imageUrl : undefined,
      tags: [topicCategory, cropTag],
      isVoicePost: activeTab === 'voice',
    });

    setContent('');
    setImageUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-base sm:text-lg">
            <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950">
              <Users className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3>{isHi ? 'चौपाल में पोस्ट करें' : 'Post to Kisan Chaupal'}</h3>
              <p className="text-[11px] font-normal text-stone-500 dark:text-stone-400">
                {farmerProfile.name} • {farmerProfile.district}, {farmerProfile.state}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <span>✍️</span>
            <span>{isHi ? 'लिखें' : 'Write Post'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-amber-400 text-stone-950 shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isHi ? 'बोलकर पूछें' : 'Voice Note'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'photo'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{isHi ? 'फोटो जोड़ें' : 'Add Photo'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Voice Recording Panel if in Voice mode */}
          {activeTab === 'voice' && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-center space-y-3">
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse scale-105'
                    : 'bg-amber-400 hover:bg-amber-300 text-stone-950'
                }`}
              >
                <Mic className="w-8 h-8" />
              </button>

              <div>
                <p className="text-xs font-black text-amber-950 dark:text-amber-200">
                  {isRecording
                    ? isHi
                      ? `🔴 रिकॉर्डिंग जारी है... (${recordedDuration} सेकंड)`
                      : `🔴 Recording... (${recordedDuration}s)`
                    : isHi
                    ? 'माइक दबाएं और अपनी समस्या बोलें'
                    : 'Tap mic to speak in Hindi/Gujarati/English'}
                </p>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-400 mt-0.5">
                  {isHi
                    ? 'आपकी आवाज को अपने आप लिखकर पोस्ट में जोड़ दिया जाएगा।'
                    : 'Speech will be converted to text and voice post.'}
                </p>
              </div>
            </div>
          )}

          {/* Text Area */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {isHi ? 'आप क्या पूछना या साझा करना चाहते हैं?' : 'Your Question or Experience'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
              placeholder={
                isHi
                  ? 'जैसे: गेहूं में पीला रतुआ दिखा है, कौन सी दवा स्प्रे करें? या अपना सफल देसी नुस्खा बताएं...'
                  : 'Describe crop condition, pest symptoms, fertilizer results, or ask fellow farmers...'
              }
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl p-3 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:border-emerald-600 leading-relaxed"
            />
          </div>

          {/* Photo attachment (if photo or text) */}
          {(activeTab === 'photo' || imageUrl) && (
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                {isHi ? 'फोटो लिंक (खेत या पत्ती का फोटो)' : 'Image URL (Field or Disease Photo)'}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden"
                />
              </div>

              {/* Sample Photo Presets */}
              <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto text-[10px] text-stone-500">
                <span>{isHi ? 'नमूना फोटो:' : 'Presets:'}</span>
                <button
                  type="button"
                  onClick={() =>
                    setImageUrl(
                      'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80'
                    )
                  }
                  className="underline hover:text-emerald-700 cursor-pointer"
                >
                  Drip
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setImageUrl(
                      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80'
                    )
                  }
                  className="underline hover:text-emerald-700 cursor-pointer"
                >
                  Mustard
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setImageUrl(
                      'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80'
                    )
                  }
                  className="underline hover:text-emerald-700 cursor-pointer"
                >
                  Wheat
                </button>
              </div>
            </div>
          )}

          {/* Topic & Crop Selector Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                {isHi ? 'विषय श्रेणी' : 'Topic Category'}
              </label>
              <select
                value={topicCategory}
                onChange={(e) => setTopicCategory(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden"
              >
                <option value="Crop Protection">Crop Protection & Pests</option>
                <option value="Soil Regeneration">Soil Health & NPK</option>
                <option value="Organic Farming">Organic / Jeevamrit</option>
                <option value="Drip Irrigation">Drip & Water Schedule</option>
                <option value="Market Intelligence">Mandi Rates & MSP</option>
                <option value="Machinery Sharing">Tractor & Drone</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                {isHi ? 'फसल' : 'Crop'}
              </label>
              <select
                value={cropTag}
                onChange={(e) => setCropTag(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden"
              >
                <option value="Cotton (Kapas)">Cotton (Kapas)</option>
                <option value="Wheat (Gehun)">Wheat (Gehun)</option>
                <option value="Mustard (Sarson)">Mustard (Sarson)</option>
                <option value="Groundnut (Mungfali)">Groundnut (Mungfali)</option>
                <option value="Cumin (Jeera)">Cumin (Jeera)</option>
                <option value="Gram (Chana)">Gram (Chana)</option>
                <option value="Soybean">Soybean</option>
                <option value="Vegetables">Vegetables / Spices</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isHi ? 'चौपाल में भेजें' : 'Publish to Chaupal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
