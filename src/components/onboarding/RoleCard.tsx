import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { type UserRole } from '../../types/onboarding';

type Props = {
  role: UserRole;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onSelect: (role: UserRole) => void;
};

export function RoleCard({ role, title, description, icon, selected, onSelect }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect(role)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#11171D' : '#FFFFFF',
          borderColor: selected ? '#2F7CF6' : isDark ? 'rgba(120,140,160,0.18)' : 'rgba(120,140,160,0.22)',
        },
        selected && styles.cardSelected,
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: selected ? '#2F7CF6' : isDark ? '#1A232B' : '#F0F4F9' }]}>
        <Ionicons name={icon} size={26} color={selected ? '#FFFFFF' : '#2F7CF6'} />
      </View>
      <Text style={[styles.title, { color: isDark ? '#ECEDEE' : '#11181C' }]}>{title}</Text>
      <Text style={[styles.description, { color: isDark ? '#93A4B7' : '#5F6F82' }]}>{description}</Text>
      {selected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark-circle" size={22} color="#2F7CF6" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 20, borderWidth: 1.5, gap: 10 },
  cardSelected: {
    shadowColor: '#2F7CF6',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  iconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800' },
  description: { fontSize: 14, lineHeight: 20 },
  checkBadge: { position: 'absolute', top: 16, right: 16 },
});