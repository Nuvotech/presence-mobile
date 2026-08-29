import { Pressable, View, type PressableProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { PASTEL_ACCENTS } from '../theme/tokens';

type ActionCardProps = PressableProps & {
  icon: keyof typeof MaterialIcons.glyphMap;
  accentIndex: number;
  title: string;
  subtitle: string;
  className?: string;
};

export function ActionCard({ icon, accentIndex, title, subtitle, className = '', ...props }: ActionCardProps) {
  const accent = PASTEL_ACCENTS[accentIndex % PASTEL_ACCENTS.length];

  return (
    <Pressable
      className={`${accent.bg} rounded-xl p-md active:opacity-80 ${className}`}
      {...props}>
      <View className="w-10 h-10 rounded-full bg-white items-center justify-center mb-sm">
        <MaterialIcons name={icon} size={20} color={accent.onHex} />
      </View>
      <AppText weight="bold" className="text-on-surface text-base">
        {title}
      </AppText>
      <AppText className="text-sm text-on-surface-variant mt-0.5">{subtitle}</AppText>
    </Pressable>
  );
}
