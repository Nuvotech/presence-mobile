import { View, Image } from 'react-native';
import { AppText } from './AppText';
import { initialsFor } from '../lib/avatar';
import { PASTEL_ACCENTS } from '../theme/tokens';

type ChildAvatarProps = {
  name: string;
  photoUrl: string | null;
  accentIndex: number;
  size?: 'md' | 'lg';
};

// A child's photo, falling back to pastel initials when none is on file.
export function ChildAvatar({ name, photoUrl, accentIndex, size = 'md' }: ChildAvatarProps) {
  const accent = PASTEL_ACCENTS[accentIndex % PASTEL_ACCENTS.length];
  const sizeClass = size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';

  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} className={`${sizeClass} rounded-full bg-surface-container`} />;
  }

  return (
    <View className={`${sizeClass} rounded-full ${accent.bg} items-center justify-center`}>
      <AppText weight="bold" className={`${size === 'lg' ? 'text-lg' : 'text-sm'} ${accent.onText}`}>
        {initialsFor(name)}
      </AppText>
    </View>
  );
}
