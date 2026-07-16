import { View, TextInput, type TextInputProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors } from '../theme/tokens';

type TextFieldProps = TextInputProps & {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export function TextField({ label, icon, className = '', ...props }: TextFieldProps) {
  return (
    <View className="gap-1">
      <AppText weight="medium" className="text-label-lg text-on-background">
        {label}
      </AppText>
      <View className="relative justify-center">
        <TextInput
          className={`h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-hanken text-on-surface ${icon ? 'pr-10' : ''} ${className}`}
          placeholderTextColor={colors.outline}
          {...props}
        />
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color={colors.outline}
            style={{ position: 'absolute', right: 12 }}
          />
        )}
      </View>
    </View>
  );
}
