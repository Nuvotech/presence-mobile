import { View, Pressable, type PressableProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, PASTEL_ACCENTS } from '../theme/tokens';

type RightSlot = { type: 'chevron' } | { type: 'check' } | { type: 'button'; label: string };

type SessionRowProps = PressableProps & {
  code: string;
  accentIndex: number;
  title: string;
  subtitle: string;
  badgeLabel?: string;
  right: RightSlot;
  className?: string;
};

export function SessionRow({
  code,
  accentIndex,
  title,
  subtitle,
  badgeLabel,
  right,
  className = '',
  ...props
}: SessionRowProps) {
  const accent = PASTEL_ACCENTS[accentIndex % PASTEL_ACCENTS.length];

  return (
    <Pressable
      className={`${accent.bg} rounded-lg p-sm flex-row items-center justify-between active:opacity-80 ${className}`}
      {...props}>
      <View className="flex-row items-center gap-sm flex-1">
        <View className="w-12 h-12 rounded-full bg-white items-center justify-center">
          <AppText weight="bold" className={`text-sm ${accent.onText}`}>
            {code}
          </AppText>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <AppText weight="bold" className="text-on-surface" numberOfLines={1}>
              {title}
            </AppText>
            {badgeLabel && (
              <View className="px-2 py-0.5 bg-primary rounded">
                <AppText weight="bold" className="text-[10px] text-on-primary">
                  {badgeLabel}
                </AppText>
              </View>
            )}
          </View>
          <AppText className="text-sm text-on-surface-variant" numberOfLines={1}>
            {subtitle}
          </AppText>
        </View>
      </View>

      {right.type === 'chevron' && (
        <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
      )}
      {right.type === 'check' && (
        <View className="w-8 h-8 rounded-full bg-white items-center justify-center">
          <MaterialIcons name="check" size={18} color={accent.onHex} />
        </View>
      )}
      {right.type === 'button' && (
        <View className="bg-accent rounded-full px-3 py-1.5">
          <AppText weight="bold" className="text-on-accent text-sm">
            {right.label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}
