import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RoleCard } from '../../components/onboarding/RoleCard';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { ROLE_OPTIONS } from '../../constants/onboarding';
import { type UserRole } from '../../types/onboarding';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const resolvedScheme = (colorScheme === 'dark' ? 'dark' : 'light') as keyof typeof Colors;
  const colors = Colors[resolvedScheme];

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  function handleContinue() {
    if (!selectedRole) return;

    // TODO: Backend Integration
    // Persist the chosen role once auth/profile storage exists, e.g.
    // saveOnboardingRole(selectedRole) -> SecureStore or SQLite `app_state` table.

    router.push({ pathname: '/onboarding/permissions', params: { role: selectedRole } });
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>100% On-Device & Offline</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text, fontFamily: Fonts.rounded }]}>VoxLock</Text>
        <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#C9D3DD' : '#425466' }]}>
          Offline voice-controlled device security. Choose how you&apos;ll use this device to continue.
        </Text>

        <View style={styles.cardStack}>
          {ROLE_OPTIONS.map((option) => (
            <RoleCard
              key={option.role}
              role={option.role}
              title={option.title}
              description={option.description}
              icon={option.icon}
              selected={selectedRole === option.role}
              onSelect={setSelectedRole}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={
            selectedRole
              ? `Continue as ${selectedRole === 'admin' ? 'Admin' : 'Target Device'}`
              : 'Select a role to continue'
          }
          onPress={handleContinue}
          disabled={!selectedRole}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 16, gap: 16 },
  badgeRow: { flexDirection: 'row' },
  badge: { borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: 'rgba(15, 188, 178, 0.12)' },
  badgeText: { color: '#0FA5A0', fontSize: 12, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  title: { fontSize: 34, fontWeight: '800' },
  subtitle: { fontSize: 16, lineHeight: 23 },
  cardStack: { gap: 14, marginTop: 8 },
  footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
});