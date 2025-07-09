"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/components/AppWrapper';

const LanguageFlag = ({ lang }: { lang: Language }) => {
  const flags: Record<string, string> = {
    en: '🇬🇧',
    uk: '🇺🇦',
    sk: '🇸🇰',
  };
  return <span className="mr-2 text-base" role="img" aria-label={`${lang} flag`}>{flags[lang]}</span>;
};


export default function Header() {
  const { translations, handleLanguageChange } = useLanguage();

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className="transition-colors hover:text-primary relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-primary after:origin-center after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
    >
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2 group">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary group-hover:rotate-90 transition-transform duration-300"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m19 12-2 0"/><path d="m7 12-2 0"/><path d="m16.9 16.9-.7-.7"/><path d="m7.8 7.8-.7-.7"/><path d="m16.9 7.1-.7.7"/><path d="m7.8 16.2-.7.7"/></svg>
          <span className="font-bold font-headline">Spekulus</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <NavLink href="/#product">{translations.nav.product}</NavLink>
          <NavLink href="/#advantages">{translations.nav.advantages}</NavLink>
          <NavLink href="/#roadmap">{translations.nav.roadmap}</NavLink>
          <NavLink href="/#faq">{translations.nav.faq}</NavLink>
          <NavLink href="/dev-notes">{translations.nav.devNotes}</NavLink>
          <NavLink href="/creators">{translations.nav.creators}</NavLink>
          <NavLink href="/#contact">{translations.nav.contact}</NavLink>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-[1.2rem] w-[1.2rem] transition-transform hover:rotate-12" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                <LanguageFlag lang="en" /> English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('uk')}>
                <LanguageFlag lang="uk" /> Українська
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('sk')}>
                <LanguageFlag lang="sk" /> Slovenčina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
