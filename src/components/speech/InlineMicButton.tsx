import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface InlineMicButtonProps {
  onTranscript: (text: string) => void;
  lang?: string;
  className?: string;
  tooltip?: string;
}

export const InlineMicButton: React.FC<InlineMicButtonProps> = ({
  onTranscript,
  lang = 'en-IN',
  className = '',
  tooltip = 'Dictate with voice',
}) => {
  const { isSupported, isListening, startListening, stopListening } = useSpeechRecognition({
    lang,
    continuous: false,
    interimResults: false,
    onResult: (finalText) => {
      if (finalText) {
        onTranscript(finalText);
      }
    },
  });

  if (!isSupported) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isListening) {
      stopListening();
    } else {
      startListening({
        lang,
        continuous: false,
        onResult: (finalText) => {
          if (finalText) {
            onTranscript(finalText);
          }
        },
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isListening ? 'Stop listening' : tooltip}
      className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
        isListening
          ? 'bg-rose-500 text-white animate-pulse shadow-sm ring-2 ring-rose-300'
          : 'text-stone-400 hover:text-green-700 hover:bg-stone-100'
      } ${className}`}
    >
      {isListening ? (
        <MicOff className="w-3.5 h-3.5" />
      ) : (
        <Mic className="w-3.5 h-3.5" />
      )}
    </button>
  );
};
