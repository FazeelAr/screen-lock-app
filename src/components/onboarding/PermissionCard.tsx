import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PermissionStatus } from '../../types/onboarding';

type Props = {
  title: string;
  description: string;
  status: PermissionStatus;
  grantedLabel: string;
};

export function PermissionCard({ title, description, status, grantedLabel }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isGranted = status === 'granted';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#11171D' : '#FFFFFF',
          borderColor: isDark ? 'rgba(120,140,160,0.18)' : 'rgba(120,140,160,0.22)',
        },
      ]}>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: isDark ? '#ECEDEE' : '#11181C' }]}>{title}</Text>
        <Text style={[styles.description, { color: isDark ? '#93A4B7' : '#5F6F82' }]}>{description}</Text>
      </View>

      <View style={[styles.statusPill, isGranted ? styles.statusGranted : styles.statusPending]}>
        {isGranted && <Ionicons name="checkmark-circle" size={14} color="#0FA5A0" />}
        <Text style={[styles.statusText, isGranted ? styles.statusTextGranted : styles.statusTextPending]}>
          {isGranted ? grantedLabel : 'Pending'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, borderWidth: StyleSheet.hairlineWidth, gap: 12 },
  textBlock: { gap: 4 },
  title: { fontSize: 15, fontWeight: '700' },
  description: { fontSize: 13, lineHeight: 18 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  statusPending: { backgroundColor: 'rgba(120,140,160,0.14)' },
  statusGranted: { backgroundColor: 'rgba(15, 188, 178, 0.12)' },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusTextPending: { color: '#8291A0' },
  statusTextGranted: { color: '#0FA5A0' },
});