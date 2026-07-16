import { Text, type TextProps } from 'react-native';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

const weightClass: Record<Weight, string> = {
  regular: 'font-hanken',
  medium: 'font-hanken-medium',
  semibold: 'font-hanken-semibold',
  bold: 'font-hanken-bold',
  extrabold: 'font-hanken-extrabold',
};

type AppTextProps = TextProps & {
  weight?: Weight;
  className?: string;
};

// React Native Text does not inherit font family from ancestor Views, so every
// piece of text needs an explicit font className — this wrapper centralizes that.
export function AppText({ weight = 'regular', className = '', ...props }: AppTextProps) {
  return <Text className={`${weightClass[weight]} ${className}`} {...props} />;
}
