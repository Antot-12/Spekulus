// src/lib/getLanguage.ts
import { cookies } from 'next/headers';
import type { Language } from './data';

export async function getLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('spekulus-lang');
  const lang = langCookie?.value as Language | undefined;
  if (lang && ['en', 'uk', 'sk'].includes(lang)) {
    return lang;
  }
  return 'en';
}
