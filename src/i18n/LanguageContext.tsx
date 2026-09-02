import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Lang } from './translations';
import { LocalizedText } from '../types';

const LANGUAGE_KEY = 'cup-hero:language';

function getPath(obj: any, path: string): unknown {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ''));
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  pick: (text: LocalizedText) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('de');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
      if (stored === 'en' || stored === 'de') setLangState(stored);
    });
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    AsyncStorage.setItem(LANGUAGE_KEY, next).catch(() => {});
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next: Lang = prev === 'de' ? 'en' : 'de';
      AsyncStorage.setItem(LANGUAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = getPath(translations[lang], key);
      if (typeof value !== 'string') {
        // Fall back to English, then to the key itself so a missing
        // translation is visible instead of crashing the screen.
        const fallback = getPath(translations.en, key);
        return typeof fallback === 'string' ? interpolate(fallback, vars) : key;
      }
      return interpolate(value, vars);
    },
    [lang]
  );

  const pick = useCallback((text: LocalizedText) => text[lang] ?? text.en, [lang]);

  const value = useMemo(() => ({ lang, setLang, toggleLang, t, pick }), [lang, setLang, toggleLang, t, pick]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
