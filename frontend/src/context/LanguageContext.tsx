'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  LanguageCode, 
  LanguageInfo, 
  SUPPORTED_LANGUAGES, 
  TRANSLATIONS, 
  DYNAMIC_MEDICAL_TRANSLATIONS 
} from './translations';

export * from './translations';

export interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  translateText: (text: string) => string;
  languages: LanguageInfo[];
  currentLangInfo: LanguageInfo;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    try {
      const savedLang = (localStorage.getItem('synapseos_lang') || localStorage.getItem('synapseos_language')) as LanguageCode;
      if (savedLang && TRANSLATIONS[savedLang]) {
        setLanguageState(savedLang);
      }
    } catch {
      // localStorage fallback
    }

    const handleExternalLangChange = (e: any) => {
      const newLang = e.detail as LanguageCode;
      if (newLang && TRANSLATIONS[newLang]) {
        setLanguageState(prev => prev === newLang ? prev : newLang);
      }
    };
    window.addEventListener('synapseos-language-change', handleExternalLangChange);
    return () => {
      window.removeEventListener('synapseos-language-change', handleExternalLangChange);
    };
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('synapseos_lang', lang);
      localStorage.setItem('synapseos_language', lang);
      window.dispatchEvent(new CustomEvent('synapseos-language-change', { detail: lang }));
    } catch {}
  };

  const t = (key: string, fallback?: string): string => {
    if (!key || typeof key !== 'string') return fallback || '';
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const defaultDict = TRANSLATIONS.en;
    if (defaultDict && defaultDict[key]) {
      return defaultDict[key];
    }
    return fallback || key;
  };

  // Universal dynamic medical string translator across all 11 languages
  const translateText = (text: string): string => {
    if (!text || typeof text !== 'string') return text;
    if (language === 'en') return text;

    const trimmed = text.trim();
    // 1. Direct dictionary match in dynamic translations
    const directMatch = DYNAMIC_MEDICAL_TRANSLATIONS[trimmed];
    if (directMatch && directMatch[language]) {
      return directMatch[language];
    }

    // 2. Direct match in standard TRANSLATIONS dictionary
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[trimmed]) {
      return langDict[trimmed];
    }

    // 3. Substring & fuzzy pattern matching for common medical variations
    for (const [key, translations] of Object.entries(DYNAMIC_MEDICAL_TRANSLATIONS)) {
      if (translations && (translations as Record<LanguageCode, string>)[language] && text.includes(key)) {
        return text.replace(key, (translations as Record<LanguageCode, string>)[language]);
      }
    }

    // 4. Fallback to standard key dictionary
    return t(text, text);
  };

  const currentLangInfo = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateText, languages: SUPPORTED_LANGUAGES, currentLangInfo }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
