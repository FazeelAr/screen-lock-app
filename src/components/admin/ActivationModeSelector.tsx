import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ACTIVATION_MODE_OPTIONS } from '@/src/constants/admin';
import type { ActivationModeId } from '@/src/types/admin';

type Props = {
  selectedModes: ActivationModeId[];
  onToggle: (id: ActivationModeId) => void;
};

export function ActivationModeSelector({ selectedModes, onToggle }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.row}>
      {ACTIVATION_MODE_OPTIONS.map((option) => {
        const isSelected = selectedModes.includes(option.id);

        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onToggle(option.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? '#2F7CF6' : isDark ? '#11171D' : '#F3F6FA',
                borderColor: isSelected ? '#2F7CF6' : isDark ? '#22303A' : '#D7DFE8',
              },
            ]}>
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={16}
              color={isSelected ? '#FFFFFF' : isDark ? '#93A4B7' : '#5F6F82'}
            />
            <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : isDark ? '#ECEDEE' : '#11181C' }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
  },
  chipText: { fontSize: 13.5, fontWeight: '700' },
});