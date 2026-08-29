import { View, Pressable } from 'react-native';
import { AppText } from './AppText';

type Segment<T extends string> = {
  key: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <View className={`flex-row p-1 bg-surface-container rounded-full ${className}`}>
      {segments.map((segment) => {
        const selected = segment.key === value;
        return (
          <Pressable
            key={segment.key}
            onPress={() => onChange(segment.key)}
            className={`flex-1 py-2 items-center rounded-full ${selected ? 'bg-primary' : ''}`}>
            <AppText weight="bold" className={selected ? 'text-on-primary' : 'text-on-surface-variant'}>
              {segment.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
