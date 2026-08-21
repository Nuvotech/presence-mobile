import { useAppStore } from '../../store/useAppStore';
import en from './en';
import fr from './fr';
import type { Language, TranslationDictionary } from './types';

const dictionaries: Record<Language, TranslationDictionary> = { en, fr };

export function useTranslation() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  return { language, t: dictionaries[language], setLanguage } as const;
}
