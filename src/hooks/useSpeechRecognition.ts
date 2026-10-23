import { useState, useEffect, useRef, useCallback } from 'react';
import {
  isSpeechRecognitionSupported,
  getSupportedRecognitionCodes,
} from '../services/webSpeechService';

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: (options?: UseSpeechRecognitionOptions) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
  activeRecognitionLang: string;
}

export function useSpeechRecognition(defaultOptions: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const isSupported = isSpeechRecognitionSupported();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>(
    defaultOptions.lang || 'en-IN'
  );
  const [activeRecognitionLang, setActiveRecognitionLang] = useState<string>('en-IN');

  const recognitionRef = useRef<any>(null);
  const continuousRef = useRef<boolean>(defaultOptions.continuous ?? false);
  const optionsRef = useRef(defaultOptions);
  optionsRef.current = defaultOptions;

  const candidateLangsRef = useRef<string[]>([]);
  const currentLangIndexRef = useRef<number>(0);
  const isExplicitStopRef = useRef<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isExplicitStopRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  const stopListening = useCallback(() => {
    isExplicitStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListeningWithCode = useCallback(
    (langIndex: number, customOptions?: UseSpeechRecognitionOptions) => {
      if (!isSupported) {
        setError('Speech Recognition is not supported on this browser or device. Please type your query.');
        return;
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError('Speech Recognition API is unavailable in this environment.');
        return;
      }

      if (langIndex >= candidateLangsRef.current.length) {
        setError('Voice recognition language not supported by browser. Falling back to typing.');
        setIsListening(false);
        return;
      }

      const activeCode = candidateLangsRef.current[langIndex] || 'en-IN';
      currentLangIndexRef.current = langIndex;
      setActiveRecognitionLang(activeCode);

      // Abort any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      try {
        const recognition = new SpeechRecognition();
        const continuous = customOptions?.continuous ?? optionsRef.current.continuous ?? false;
        const interimResults = customOptions?.interimResults ?? optionsRef.current.interimResults ?? true;

        continuousRef.current = continuous;
        recognition.lang = activeCode;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let finalChunk = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const res = event.results[i];
            const text = res[0].transcript;
            if (res.isFinal) {
              finalChunk += text;
            } else {
              currentInterim += text;
            }
          }

          if (finalChunk) {
            setTranscript((prev) => {
              const updated = prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim();
              customOptions?.onResult?.(updated, true);
              optionsRef.current.onResult?.(updated, true);
              return updated;
            });
          }

          setInterimTranscript(currentInterim);
          if (currentInterim) {
            customOptions?.onResult?.(currentInterim, false);
            optionsRef.current.onResult?.(currentInterim, false);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Web Speech Recognition event notice:', event.error, 'Language attempted:', activeCode);

          if (event.error === 'language-not-supported' || event.error === 'bad-grammar') {
            // Attempt next fallback dialect in priority list
            const nextIndex = currentLangIndexRef.current + 1;
            if (nextIndex < candidateLangsRef.current.length) {
              console.info(`Switching speech recognition from ${activeCode} to fallback ${candidateLangsRef.current[nextIndex]}`);
              startListeningWithCode(nextIndex, customOptions);
              return;
            }
          }

          if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            setError('Microphone access was denied. Please allow microphone permission in your browser address bar.');
            setIsListening(false);
          } else if (event.error === 'no-speech') {
            if (!continuousRef.current) {
              setIsListening(false);
              setError('No voice detected. Please speak closer to the microphone and try again.');
            }
          } else if (event.error === 'network') {
            setError('Speech recognition network timeout. Please check your internet connection or type your question.');
            setIsListening(false);
          } else if (event.error !== 'aborted') {
            setError(`Voice recognition notice: ${event.error}`);
            setIsListening(false);
          }

          customOptions?.onError?.(event);
          optionsRef.current.onError?.(event);
        };

        recognition.onend = () => {
          if (!isExplicitStopRef.current && continuousRef.current) {
            // In continuous mode, restart if closed by browser silence timeout
            try {
              recognition.start();
              return;
            } catch {
              // ignore
            }
          }
          setIsListening(false);
          setInterimTranscript('');
          customOptions?.onEnd?.();
          optionsRef.current.onEnd?.();
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.warn('Failed to start speech recognition:', err);
        const nextIndex = currentLangIndexRef.current + 1;
        if (nextIndex < candidateLangsRef.current.length) {
          startListeningWithCode(nextIndex, customOptions);
        } else {
          setError(err.message || 'Could not start voice recognition.');
          setIsListening(false);
        }
      }
    },
    [isSupported]
  );

  const startListening = useCallback(
    (customOptions?: UseSpeechRecognitionOptions) => {
      isExplicitStopRef.current = false;
      setError(null);

      const targetLang = customOptions?.lang || selectedLang || 'en-IN';
      const candidateCodes = getSupportedRecognitionCodes(targetLang);
      candidateLangsRef.current = candidateCodes;

      startListeningWithCode(0, customOptions);
    },
    [selectedLang, startListeningWithCode]
  );

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    selectedLang,
    setSelectedLang,
    activeRecognitionLang,
  };
}
