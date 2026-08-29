import { View, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors } from '../theme/tokens';

const SPARKLINE_HEIGHTS = [8, 14, 10, 20, 26];

function MiniBarChart() {
  return (
    <View className="flex-row items-end gap-1 h-7">
      {SPARKLINE_HEIGHTS.map((height, index) => (
        <View
          key={index}
          className="w-1.5 rounded-full"
          style={{ height, backgroundColor: index === SPARKLINE_HEIGHTS.length - 1 ? colors.accent : '#CFC3F3' }}
        />
      ))}
    </View>
  );
}

type RegisterHeroProps = {
  className: string;
  present: number;
  total: number;
  dateLabel: string;
  presentOfTotal: (total: number) => string;
  onBack: () => void;
};

export function RegisterHero({
  className,
  present,
  total,
  dateLabel,
  presentOfTotal,
  onBack,
}: RegisterHeroProps) {
  return (
    <View className="mx-container-margin mt-sm mb-md bg-secondary-container rounded-2xl p-md">
      <View className="flex-row items-center gap-sm">
        <Pressable
          onPress={onBack}
          className="w-9 h-9 rounded-full bg-white items-center justify-center active:opacity-80">
          <MaterialIcons name="arrow-back" size={20} color={colors.onSecondaryContainer} />
        </Pressable>
        <AppText weight="bold" className="text-xl text-on-secondary-container flex-1" numberOfLines={1}>
          {className}
        </AppText>
      </View>

      <View className="flex-row items-end justify-between mt-md">
        <View>
          <AppText weight="extrabold" className="text-4xl text-on-secondary-container">
            {present}
          </AppText>
          <AppText className="text-sm text-on-secondary-container/70 mt-1">
            {presentOfTotal(total)} · {dateLabel}
          </AppText>
        </View>
        <MiniBarChart />
      </View>
    </View>
  );
}
