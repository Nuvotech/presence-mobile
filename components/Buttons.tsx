import { Pressable, type PressableProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors } from '../theme/tokens';

type ButtonProps = PressableProps & {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  className?: string;
};

export function PrimaryButton({ label, icon, iconPosition = 'left', className = '', ...props }: ButtonProps) {
  return (
    <Pressable
      className={`h-12 rounded-lg bg-primary flex-row items-center justify-center gap-2 active:opacity-90 ${className}`}
      {...props}>
      {icon && iconPosition === 'left' && (
        <MaterialIcons name={icon} size={20} color={colors.onPrimary} />
      )}
      <AppText weight="bold" className="text-on-primary text-base">
        {label}
      </AppText>
      {icon && iconPosition === 'right' && (
        <MaterialIcons name={icon} size={20} color={colors.onPrimary} />
      )}
    </Pressable>
  );
}

export function OutlineButton({ label, icon, iconPosition = 'left', className = '', ...props }: ButtonProps) {
  return (
    <Pressable
      className={`h-12 rounded-lg border border-primary flex-row items-center justify-center gap-2 active:bg-surface-container ${className}`}
      {...props}>
      {icon && iconPosition === 'left' && (
        <MaterialIcons name={icon} size={20} color={colors.primary} />
      )}
      <AppText weight="bold" className="text-primary text-base">
        {label}
      </AppText>
      {icon && iconPosition === 'right' && (
        <MaterialIcons name={icon} size={20} color={colors.primary} />
      )}
    </Pressable>
  );
}
