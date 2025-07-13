
"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { translations } from '@/lib/translations';
import { LanguageContext } from '@/contexts/LanguageContext';
import { ScrollButtons } from '@/components/ScrollButtons';
import MaintenancePage from '@/app/maintenance/page';
import NotFoundPage from '@/app/not-found';

export type Language = 'en' | 'uk' | 'sk';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [language, setLanguage] = useState<Language>('en');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Language state management
  useEffect(() => {
    if (isClient) {
      const storedLang = localStorage.getItem('spekulus-lang') as Language;
      if (storedLang && ['en', 'uk', 'sk'].includes(storedLang)) {
        setLanguage(storedLang);
      } else {
          const browserLang = navigator.language.slice(0, 2);
          if (browserLang === 'uk') setLanguage('uk');
          else if (browserLang === 'sk') setLanguage('sk');
      }
    }
  }, [isClient]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (isClient) {
      localStorage.setItem('spekulus-lang', lang);
    }
  };
  
  const currentTranslations = translations[language];
  
  if (!isClient) {
    return null;
  }
  
  const isAuthPage = pathname.startsWith('/admin') || pathname === '/login';

  return (
    <LanguageContext.Provider value={{ language, translations: currentTranslations, handleLanguageChange }}>
      {isAuthPage ? (
        children
      ) : (
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <ScrollButtons />
        </div>
      )}
    </LanguageContext.Provider>
  );
}
