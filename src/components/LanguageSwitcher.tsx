import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-stone-200 text-stone-700 rounded-full text-xs font-medium hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
        title="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-green-600" />
        <span>{currentLangObj.nativeName} ({currentLangObj.name})</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-40 bg-white border border-stone-100 rounded-2xl shadow-lg z-50 overflow-hidden py-1">
            <div className="max-h-60 overflow-y-auto">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    if (setLanguage) {
                      setLanguage(lang.code as any);
                    }
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                    language === lang.code 
                      ? 'bg-green-50 text-green-700 font-semibold' 
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  <span className="text-xs text-stone-400 font-mono">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
