import { View, Pressable, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors } from '../theme/tokens';
import type { Subject } from '../data/subjects';

type SubjectPickerModalProps = {
  visible: boolean;
  subjects: Subject[];
  onSelect: (code: string) => void;
  onClose: () => void;
};

export function SubjectPickerModal({ visible, subjects, onSelect, onClose }: SubjectPickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable
          className="bg-surface-container-lowest rounded-t-xl px-container-margin pt-lg pb-8"
          onPress={(e) => e.stopPropagation()}>
          <AppText weight="bold" className="text-lg text-on-surface mb-1">
            Select Subject
          </AppText>
          <AppText className="text-sm text-on-surface-variant mb-md">
            This subject will apply to every class you check in today.
          </AppText>
          {subjects.map((subject) => (
            <Pressable
              key={subject.code}
              onPress={() => onSelect(subject.code)}
              className="flex-row items-center justify-between py-3 border-b border-outline-variant active:opacity-70">
              <View>
                <AppText weight="medium" className="text-base text-on-surface">
                  {subject.label}
                </AppText>
                <AppText className="text-sm text-on-surface-variant">{subject.code}</AppText>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
