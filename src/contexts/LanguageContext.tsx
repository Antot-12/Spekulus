"use client";

import { createContext, useContext } from 'react';
import type { Translation } from '@/lib/translations';
import type { Language } from '@/components/AppWrapper';

type LanguageContextType = {
  language: Language;
  translations: Translation;
  handleLanguageChange: (lang: Language) => void;
};

export const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
