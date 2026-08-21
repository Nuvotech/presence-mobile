import { View, Pressable } from 'react-native';
import { AppText } from './AppText';
import { useTranslation } from '../lib/i18n/useTranslation';
import type { Language } from '../lib/i18n/types';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
];

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useTranslation();

  return (
    <View className={`flex-row items-center gap-0.5 self-start rounded-full border border-outline-variant bg-surface p-0.5 ${className}`}>
      {LANGUAGES.map(({ code, label }) => (
        <Pressable
          key={code}
          onPress={() => setLanguage(code)}
          accessibilityRole="button"
          accessibilityState={{ selected: language === code }}
          className={`min-h-9 min-w-9 rounded-full px-3 py-1.5 items-center justify-center ${
            language === code ? 'bg-primary' : ''
          }`}>
          <AppText
            weight="bold"
            className={`text-xs ${language === code ? 'text-on-primary' : 'text-on-surface-variant'}`}>
            {label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
