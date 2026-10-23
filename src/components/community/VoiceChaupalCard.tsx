import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Share2,
  ThumbsUp,
  Award,
  Mic,
  Clock,
  Sparkles,
} from 'lucide-react';
import { speakText, stopSpeech } from '../../services/webSpeechService';

export interface VoiceNoteItem {
  id: string;
  authorName: string;
  authorVillage: string;
  authorRole: string;
  authorBadge?: string;
  crop: string;
  topic: string;
  durationSec: number;
  recordedText: string;
  createdAt: string;
  likesCount: number;
}

interface VoiceChaupalCardProps {
  note: VoiceNoteItem;
  onLike: (id: string) => void;
  isLiked?: boolean;
}

export const VoiceChaupalCard: React.FC<VoiceChaupalCardProps> = ({
  note,
  onLike,
  isLiked = false,
}) => {
  const { language, addToast } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  const isHi = language === 'hi';

  const handlePlayToggle = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      setCurrentProgress(0);
    } else {
      setIsPlaying(true);
      setCurrentProgress(15);
      const langCode = isHi ? 'hi-IN' : 'en-IN';

      speakText(note.recordedText, {
        lang: langCode,
        onEnd: () => {
          setIsPlaying(false);
          setCurrentProgress(100);
          setTimeout(() => setCurrentProgress(0), 1000);
        },
        onError: () => {
          setIsPlaying(false);
          setCurrentProgress(0);
        },
      });
    }
  };

  const handleWhatsAppShare = () => {
    const message = `🎙️ *किसान चौपाल ऑडियो संदेश*: "${note.topic}"\n\nकिसान: ${note.authorName} (${note.authorVillage})\n\n"${note.recordedText}"\n\n👉 किसान चौपाल ऐप पर और सुनें!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-3.5">
      {/* Author Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-black flex items-center justify-center text-sm shadow-sm shrink-0">
            {note.authorName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                {note.authorName}
              </span>
              {note.authorBadge && (
                <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2 py-0.2 rounded-md flex items-center gap-1">
                  <Award className="w-2.5 h-2.5 text-amber-600" />
                  <span>{note.authorBadge}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {note.authorVillage} • {note.createdAt}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800">
          🌾 {note.crop}
        </span>
      </div>

      {/* Topic Title */}
      <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
        <Mic className="w-4 h-4 text-emerald-600" />
        <span>{note.topic}</span>
      </h3>

      {/* Interactive Audio Player Box */}
      <div className="bg-stone-50 dark:bg-stone-800/80 rounded-2xl p-3 border border-stone-200/80 dark:border-stone-700/80 flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayToggle}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md transition-transform active:scale-95 cursor-pointer ${
            isPlaying ? 'bg-amber-500 hover:bg-amber-600 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
          title={isPlaying ? 'Pause Audio' : 'Play Voice Note'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        {/* Waveform Visualizer & Timer */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-emerald-600" />
              <span>{isPlaying ? 'Playing Voice Advisory...' : 'Tap to Listen'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>0:{note.durationSec < 10 ? `0${note.durationSec}` : note.durationSec} sec</span>
            </span>
          </div>

          {/* Waveform Bars */}
          <div className="flex items-center gap-1 h-6">
            {[40, 75, 55, 90, 65, 80, 45, 95, 70, 85, 50, 90, 60, 75, 40, 65, 85, 95, 55, 70].map(
              (height, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    isPlaying
                      ? 'bg-emerald-600 animate-pulse'
                      : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                  style={{
                    height: `${isPlaying ? Math.max(25, (height * (idx % 3 + 1)) % 100) : height * 0.5}%`,
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Spoken Text Transcript */}
      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed italic bg-emerald-50/40 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
        "{note.recordedText}"
      </p>

      {/* Engagement Footbar */}
      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
        <button
          onClick={() => onLike(note.id)}
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
            isLiked ? 'text-emerald-600' : 'text-stone-500 hover:text-emerald-700'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-emerald-600 text-emerald-600' : ''}`} />
          <span>{note.likesCount + (isLiked ? 1 : 0)} {isHi ? 'मददगार' : 'Helpful'}</span>
        </button>

        <button
          onClick={handleWhatsAppShare}
          className="inline-flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 dark:bg-green-950/60 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
