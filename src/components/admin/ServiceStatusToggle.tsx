import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ServiceStatus } from '@/src/types/admin';

type Props = { status: ServiceStatus; onToggle: () => void };

export function ServiceStatusToggle({ status, onToggle }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isArmed = status === 'armed';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onToggle}
      style={[
        styles.ring,
        {
          borderColor: isArmed ? '#0FA5A0' : isDark ? '#2A343D' : '#D7DFE8',
          backgroundColor: isArmed ? 'rgba(15, 188, 178, 0.10)' : 'transparent',
        },
      ]}>
      <View style={[styles.dot, { backgroundColor: isArmed ? '#0FA5A0' : '#8291A0' }]} />
      <Text style={[styles.statusText, { color: isArmed ? '#0FA5A0' : isDark ? '#93A4B7' : '#5F6F82' }]}>
        {isArmed ? 'ARMED / LISTENING' : 'SERVICE PAUSED'}
      </Text>
      <Text style={[styles.hint, { color: isDark ? '#6B7A8A' : '#8291A0' }]}>Tap to {isArmed ? 'pause' : 'start'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderRadius: 28,
    borderWidth: 1.5,
    paddingVertical: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  statusText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
  hint: { fontSize: 12, fontWeight: '600' },
});