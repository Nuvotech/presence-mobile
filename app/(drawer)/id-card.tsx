import { View, ScrollView, Share } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Header } from "../../components/Header";
import { AppText } from "../../components/AppText";
import { IDCard } from "../../components/IDCard";
import { PrimaryButton, OutlineButton } from "../../components/Buttons";
import { useTranslation } from "../../lib/i18n/useTranslation";

export default function IDCardPage() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    name?: string;
    grade?: string;
    studentId?: string;
    qrToken?: string;
    img?: string;
    initials?: string;
    color?: string;
  }>();

  const name = params.name ?? "Thabo Mokoena";
  const grade = params.grade ?? "Grade 5B";
  const studentId = params.studentId ?? "SC-2024-8841";

  const handleShare = () => {
    Share.share({
      message: t.idCard.shareMessage(name, grade, studentId),
    });
  };

  return (
    <View className="flex-1 bg-background">
      <Header title={t.idCard.headerTitle} backButton />
      <ScrollView contentContainerClassName="items-center pt-xs pb-16 px-container-margin">
        <View className="mb-xs items-center">
          <AppText weight="bold" className="text-2xl text-on-surface mb-1">
            {t.idCard.previewTitle}
          </AppText>
          <AppText className="text-base text-on-surface-variant text-center max-w-[280px]">
            {t.idCard.previewSubtitle}
          </AppText>
        </View>

        <View className="mt-1">
          <IDCard
            name={name}
            grade={grade}
            studentId={studentId}
            qrToken={params.qrToken}
            photoUri={params.img}
            initials={params.initials}
            color={params.color}
          />
        </View>

        <View className="mt-sm flex-row gap-sm">
          <PrimaryButton
            label={t.idCard.share}
            icon="ios-share"
            onPress={handleShare}
            className="px-6"
          />
          <OutlineButton label={t.idCard.edit} icon="edit" className="px-6" />
        </View>
      </ScrollView>
    </View>
  );
}
