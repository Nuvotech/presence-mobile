import { View, ScrollView, Share } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Header } from '../components/Header';
import { AppText } from '../components/AppText';
import { IDCard } from '../components/IDCard';
import { PrimaryButton, OutlineButton } from '../components/Buttons';

export default function IDCardPage() {
  const params = useLocalSearchParams<{
    name?: string;
    grade?: string;
    studentId?: string;
    img?: string;
    initials?: string;
    color?: string;
  }>();

  const name = params.name ?? 'Thabo Mokoena';
  const grade = params.grade ?? 'Grade 5B';
  const studentId = params.studentId ?? 'SC-2024-8841';

  const handleShare = () => {
    Share.share({
      message: `${name} — ${grade} — Student ID: ${studentId} — SchoolClock`,
    });
  };

  return (
    <View className="flex-1 bg-background">
      <Header title="Student ID View" backButton />
      <ScrollView contentContainerClassName="items-center py-lg px-container-margin pb-24">
        <View className="mb-md items-center">
          <AppText weight="bold" className="text-2xl text-on-surface mb-1">
            Preview Student ID
          </AppText>
          <AppText className="text-base text-on-surface-variant text-center max-w-[280px]">
            Ensure the QR code is clearly visible for daily scanning.
          </AppText>
        </View>

        <View className="my-5">
          <IDCard
            name={name}
            grade={grade}
            studentId={studentId}
            photoUri={params.img}
            initials={params.initials}
            color={params.color}
          />
        </View>

        <View className="mt-lg flex-row gap-sm">
          <PrimaryButton label="Share ID" icon="ios-share" onPress={handleShare} className="px-6" />
          <OutlineButton label="Edit" icon="edit" className="px-6" />
        </View>
      </ScrollView>
    </View>
  );
}
