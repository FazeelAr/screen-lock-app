import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import type { AdminProfileSummary } from '@/src/types/admin';

type Props = { profile: AdminProfileSummary };

export function ProfileSummaryCard({ profile }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.card, { backgroundColor: isDark ? '#11171D' : '#FFFFFF' }]}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color="#2F7CF6" />
      </View>

      <View style={styles.textBlock}>
        <Text style={[styles.name, { color: isDark ? '#ECEDEE' : '#11181C' }]}>{profile.profileName}</Text>
        <Text style={[styles.meta, { color: isDark ? '#93A4B7' : '#5F6F82' }]}>
          {profile.embeddingsCount} samples trained
          {profile.linkedDeviceName ? ` · Linked: ${profile.linkedDeviceName}` : ' · No device linked'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(120,140,160,0.18)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(47, 124, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '800' },
  meta: { fontSize: 12.5 },
});