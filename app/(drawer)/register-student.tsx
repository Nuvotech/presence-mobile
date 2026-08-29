import { useState } from 'react';
import { View, Pressable, Image, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { AppText } from '../../components/AppText';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/Buttons';
import { colors } from '../../theme/tokens';
import { useTranslation } from '../../lib/i18n/useTranslation';

const countryCodes = ['+1', '+27'];

export default function RegisterStudent() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('5');
  const [countryCode, setCountryCode] = useState('+1');
  const [whatsapp, setWhatsapp] = useState('');

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <Header title={t.registerStudent.headerTitle} backButton />
      <ScrollView contentContainerClassName="px-container-margin pt-md pb-32" keyboardShouldPersistTaps="handled">
        <View className="items-center justify-center py-sm">
          <View className="relative">
            <Pressable
              onPress={pickPhoto}
              className="w-32 h-32 rounded-full bg-surface-container-high border-2 border-dashed border-outline items-center justify-center overflow-hidden">
              {photoUri ? (
                <Image source={{ uri: photoUri }} className="w-full h-full" />
              ) : (
                <>
                  <MaterialIcons name="add-a-photo" size={32} color={colors.outline} />
                  <AppText className="text-xs text-on-surface-variant mt-1">{t.registerStudent.addPhoto}</AppText>
                </>
              )}
            </Pressable>
            <Pressable
              onPress={pickPhoto}
              className="absolute bottom-0 right-0 bg-primary w-10 h-10 rounded-full items-center justify-center active:opacity-90">
              <MaterialIcons name="camera-alt" size={20} color={colors.onPrimary} />
            </Pressable>
          </View>
        </View>

        <View className="gap-md">
          <TextField
            label={t.registerStudent.fullNameLabel}
            placeholder={t.registerStudent.fullNamePlaceholder}
            value={fullName}
            onChangeText={setFullName}
          />

          <View className="gap-1">
            <AppText weight="medium" className="text-sm text-on-surface-variant">
              {t.registerStudent.classLabel}
            </AppText>
            <View className="rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden">
              <Picker selectedValue={grade} onValueChange={setGrade}>
                <Picker.Item label="Grade 5B" value="5" />
                <Picker.Item label="Grade 4A" value="4" />
                <Picker.Item label="Grade 3C" value="3" />
              </Picker>
            </View>
          </View>

          <View className="h-px bg-outline-variant my-1" />
          <AppText weight="bold" className="text-sm text-primary tracking-widest uppercase py-2">
            {t.registerStudent.guardianContact}
          </AppText>

          <View className="gap-1">
            <AppText weight="medium" className="text-sm text-on-surface-variant">
              {t.registerStudent.whatsappLabel}
            </AppText>
            <View className="flex-row gap-2">
              <View className="w-24 rounded-lg border border-outline-variant bg-surface-container-low overflow-hidden">
                <Picker selectedValue={countryCode} onValueChange={setCountryCode}>
                  {countryCodes.map((code) => (
                    <Picker.Item key={code} label={code} value={code} />
                  ))}
                </Picker>
              </View>
              <TextInput
                className="flex-1 h-12 px-4 rounded-lg border border-outline-variant bg-surface-container-lowest font-archivo text-on-surface"
                placeholder={t.registerStudent.whatsappPlaceholder}
                placeholderTextColor={colors.outline}
                keyboardType="phone-pad"
                value={whatsapp}
                onChangeText={setWhatsapp}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 bg-surface/95 p-container-margin border-t border-outline-variant"
        style={{ paddingBottom: insets.bottom + 16 }}>
        <PrimaryButton label={t.registerStudent.save} icon="check-circle" iconPosition="right" onPress={handleSave} />
      </View>
    </View>
  );
}
