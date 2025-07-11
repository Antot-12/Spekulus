import { cookies } from 'next/headers';
import type { Language } from './data';

export function getLanguage(): Language {
  const cookieStore = cookies();
  const langCookie = cookieStore.get('spekulus-lang');
  const lang = langCookie?.value as Language | undefined;
  
  if (lang && ['en', 'uk', 'sk'].includes(lang)) {
    return lang;
  }
  
  // Fallback to english if no valid cookie is found
  return 'en';
}
