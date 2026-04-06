import { translations, type Locale, type TranslationKey } from './translations';

export type { Locale, TranslationKey };

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}

export function getLocaleFromURL(url: URL): Locale {
  const segment = url.pathname.split('/').find(s => s === 'zh' || s === 'en');
  return (segment as Locale) || 'zh';
}

export function getOtherLocale(locale: Locale): Locale {
  return locale === 'zh' ? 'en' : 'zh';
}

export function difficultyLabel(locale: Locale, difficulty: string): string {
  const key = `difficulty_${difficulty}`;
  return (translations[locale] as Record<string, string>)[key] ?? difficulty;
}

export function refTypeLabel(locale: Locale, type: string): string {
  const key = `ref_${type}`;
  return (translations[locale] as Record<string, string>)[key] ?? type;
}

export function resourceTypeLabel(locale: Locale, type: string): string {
  const key = `resource_${type}`;
  return (translations[locale] as Record<string, string>)[key] ?? type;
}
