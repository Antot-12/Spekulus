
"use client";

import { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { translations } from '@/lib/translations';
import { LanguageContext } from '@/contexts/LanguageContext';
import { ScrollButtons } from '@/components/ScrollButtons';
import MaintenancePage from '@/app/maintenance/page';
import NotFoundPage from '@/app/not-found';

export type Language = 'en' | 'uk' | 'sk';

type PageStatus = 'Active' | 'Hidden' | 'Maintenance';

type PageInfo = {
  id: string;
  title: string;
  url: string;
  status: PageStatus;
};

const initialPages: PageInfo[] = [
  { id: 'home', title: 'Home (Landing Page)', url: '/', status: 'Active' },
  { id: 'dev-notes-list', title: 'Dev Notes (List)', url: '/dev-notes', status: 'Active' },
  { id: 'dev-notes-detail', title: 'Dev Notes (Detail)', url: '/dev-notes/[slug]', status: 'Active' },
  { id: 'team-list', title: 'Our Team (List)', url: '/creators', status: 'Active' },
  { id: 'team-detail', title: 'Our Team (Detail)', url: '/creators/[slug]', status: 'Active' },
  { id: 'coming-soon', title: 'Coming Soon', url: '/coming-soon', status: 'Active' },
  { id: 'maintenance', title: 'Maintenance', url: '/maintenance', status: 'Active' },
  { id: 'login', title: 'Admin Login', url: '/login', status: 'Hidden' },
  { id: 'admin-dashboard', title: 'Admin Dashboard', url: '/admin', status: 'Hidden' },
  { id: '404', title: '404 Not Found', url: '/404', status: 'Active' },
];

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [language, setLanguage] = useState<Language>('en');
  const [pageStatuses, setPageStatuses] = useState<PageInfo[]>(initialPages);
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
  
  // Page status management
  useEffect(() => {
    if(isClient) {
      const loadPageStatus = () => {
        const storedPages = localStorage.getItem('spekulus-pages-status');
        if(storedPages) {
          try {
            const parsedPages: PageInfo[] = JSON.parse(storedPages);
            const pageMap = new Map(parsedPages.map(p => [p.id, p]));
            const mergedPages = initialPages.map(p => pageMap.has(p.id) ? { ...p, status: pageMap.get(p.id)!.status } : p);
            setPageStatuses(mergedPages);
          } catch(e) {
            console.error("Failed to parse page statuses, using defaults.", e)
            setPageStatuses(initialPages);
          }
        } else {
          setPageStatuses(initialPages);
        }
      }
      loadPageStatus();
      window.addEventListener('storage', loadPageStatus);
      return () => window.removeEventListener('storage', loadPageStatus);
    }
  }, [isClient]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (isClient) {
      localStorage.setItem('spekulus-lang', lang);
    }
  };
  
  const currentTranslations = translations[language];

  const currentPageStatus = useMemo(() => {
    if (pathname.startsWith('/admin') || pathname === '/login') {
        return 'Active';
    }

    const matchedPage = pageStatuses.find(p => {
        if (p.url.includes('[slug]')) {
            const baseRoute = p.url.split('/[slug]')[0];
            return pathname.startsWith(baseRoute) && pathname !== baseRoute;
        }
        return p.url === pathname;
    });

    return matchedPage ? matchedPage.status : 'Active';
  }, [pathname, pageStatuses]);

  
  if (!isClient) {
    return null;
  }
  
  if (currentPageStatus === 'Maintenance') {
    return <MaintenancePage />;
  }
  
  if (currentPageStatus === 'Hidden') {
    return <NotFoundPage />;
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
