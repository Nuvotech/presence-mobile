import { Pressable, type PressableProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { AppText } from './AppText';
import { colors } from '../theme/tokens';

type ButtonProps = PressableProps & {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  className?: string;
  loading?: boolean;
};

function ButtonSpinner({ color }: { color: string }) {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1);
  }, [spin]);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  return (
    <Animated.View style={spinnerStyle}>
      <MaterialIcons name="sync" size={20} color={color} />
    </Animated.View>
  );
}

export function PrimaryButton({
  label,
  icon,
  iconPosition = 'left',
  className = '',
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={`h-12 rounded-lg bg-primary flex-row items-center justify-center gap-2 active:opacity-90 ${className}`}
      disabled={disabled || loading}
      {...props}>
      {loading ? (
        <ButtonSpinner color={colors.onPrimary} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialIcons name={icon} size={20} color={colors.onPrimary} />
          )}
          <AppText weight="bold" className="text-on-primary text-base">
            {label}
          </AppText>
          {icon && iconPosition === 'right' && (
            <MaterialIcons name={icon} size={20} color={colors.onPrimary} />
          )}
        </>
      )}
    </Pressable>
  );
}

export function OutlineButton({
  label,
  icon,
  iconPosition = 'left',
  className = '',
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={`h-12 rounded-lg border border-primary flex-row items-center justify-center gap-2 active:bg-surface-container ${className}`}
      disabled={disabled || loading}
      {...props}>
      {loading ? (
        <ButtonSpinner color={colors.primary} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialIcons name={icon} size={20} color={colors.primary} />
          )}
          <AppText weight="bold" className="text-primary text-base">
            {label}
          </AppText>
          {icon && iconPosition === 'right' && (
            <MaterialIcons name={icon} size={20} color={colors.primary} />
          )}
        </>
      )}
    </Pressable>
  );
}
