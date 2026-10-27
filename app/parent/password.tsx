import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ParentHeader } from '../../components/ParentHeader';
import { AppText } from '../../components/AppText';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/Buttons';
import { colors } from '../../theme/tokens';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { changePassword, PasswordChangeError } from '../../lib/parent';

// Forced right after signing in with a temporary password (no way back),
// optional from the account screen afterwards.
export default function ParentPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const guardian = useAppStore((s) => s.parentGuardian);
  const setParentGuardian = useAppStore((s) => s.setParentGuardian);
  const mustChange = guardian?.must_change_password ?? false;
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);

    if (password !== confirmation) {
      setError(t.parent.passwordMismatch);
      return;
    }

    setSaving(true);
    try {
      const updated = await changePassword(currentPassword, password);
      setParentGuardian(updated);

      if (mustChange) {
        router.replace('/parent/home');
      } else {
        Alert.alert(t.parent.passwordSaved);
        router.back();
      }
    } catch (err) {
      setError(err instanceof PasswordChangeError && err.message ? err.message : t.parent.loadError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ParentHeader title={t.parent.passwordTitle} backButton={!mustChange} />
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView contentContainerClassName="px-container-margin pt-lg pb-24" keyboardShouldPersistTaps="handled">
          {mustChange && (
            <View className="flex-row gap-2 rounded-lg bg-secondary-container px-3 py-2.5 mb-md">
              <MaterialIcons name="lock-outline" size={18} color={colors.onSecondaryContainer} />
              <AppText className="flex-1 text-sm text-on-secondary-container">{t.parent.mustChangeNotice}</AppText>
            </View>
          )}

          <View className="gap-4">
            <TextField
              label={t.parent.currentPasswordLabel}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoComplete="current-password"
            />
            <TextField
              label={t.parent.newPasswordLabel}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
            <TextField
              label={t.parent.confirmPasswordLabel}
              value={confirmation}
              onChangeText={setConfirmation}
              secureTextEntry
              autoComplete="new-password"
              returnKeyType="go"
              onSubmitEditing={handleSave}
            />

            {error && (
              <View className="flex-row items-center gap-2 rounded-lg bg-error-container px-3 py-2.5">
                <MaterialIcons name="error-outline" size={18} color={colors.error} />
                <AppText className="flex-1 text-sm text-error">{error}</AppText>
              </View>
            )}

            <PrimaryButton
              label={t.parent.savePassword}
              onPress={handleSave}
              loading={saving}
              disabled={!currentPassword || !password}
              className="w-full mt-2"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
