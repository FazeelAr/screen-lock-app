import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ActivationModeSelector } from '@/src/components/admin/ActivationModeSelector';
import { LockDurationSelector } from '@/src/components/admin/LockDurationSelector';
import { ProfileSummaryCard } from '@/src/components/admin/ProfileSummaryCard';
import { ServiceStatusToggle } from '@/src/components/admin/ServiceStatusToggle';
import { MOCK_ADMIN_PROFILE } from '@/src/constants/admin';
import type { ActivationModeId, LockDurationId, ServiceStatus } from '@/src/types/admin';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function AdminDashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const resolvedScheme = (colorScheme === 'dark' ? 'dark' : 'light') as keyof typeof Colors;
  const colors = Colors[resolvedScheme];
  const isDark = colorScheme === 'dark';

  // TODO: Backend Integration
  // Replace all local state below with a `useAdminDashboardState()` hook
  // backed by SQLite + the foreground service, once background listening
  // (Step 8 in the requirements doc) exists. Local state is fine for now
  // since this is UI-only.
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>('paused');
  const [activationModes, setActivationModes] = useState<ActivationModeId[]>(['wakeWord']);
  const [lockDuration, setLockDuration] = useState<LockDurationId>('5m');

  function toggleService() {
    setServiceStatus((current) => (current === 'armed' ? 'paused' : 'armed'));
  }

  function toggleActivationMode(id: ActivationModeId) {
    setActivationModes((current) =>
      current.includes(id) ? current.filter((mode) => mode !== id) : [...current, id]
    );
  }

  function handleEnrollPress() {
    // Explicit, stable route path — not a guessed relative tab path.
    router.push('/enrollment');
  }


//console.log("LockModule =", LockModule);
//console.log("LockDurationSelector:", LockDurationSelector);


 
  return (
  <SafeAreaView
    style={[styles.screen, { backgroundColor: colors.background }]}
    edges={['top', 'bottom']}
  >
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ProfileSummaryCard profile={MOCK_ADMIN_PROFILE} />

      <ServiceStatusToggle
        status={serviceStatus}
        onToggle={toggleService}
      />

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionLabel,
            { color: isDark ? '#93A4B7' : '#5F6F82' },
          ]}
        >
          ACTIVATION MODE (SELECT ONE OR BOTH)
        </Text>

        <ActivationModeSelector
          selectedModes={activationModes}
          onToggle={toggleActivationMode}
        />
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionLabel,
            { color: isDark ? '#93A4B7' : '#5F6F82' },
          ]}
        >
          SELECTED AUTO-LOCK DURATION
        </Text>

        <LockDurationSelector
          selected={lockDuration}
          onSelect={(id) => setLockDuration(id)}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={handleEnrollPress}
        style={[
          styles.enrollBar,
          {
            backgroundColor: isDark ? '#11171D' : '#FFFFFF',
          },
        ]}
      >
        <View style={styles.enrollIconWrap}>
          <Ionicons
            name="mic"
            size={20}
            color="#2F7CF6"
          />
        </View>

        <View style={styles.enrollTextBlock}>
          <Text
            style={[
              styles.enrollTitle,
              { color: colors.text },
            ]}
          >
            Enroll / Retrain Voice Profile
          </Text>

          <Text
            style={[
              styles.enrollSubtitle,
              {
                color: isDark ? '#93A4B7' : '#5F6F82',
              },
            ]}
          >
            Record fresh wake-word samples
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? '#6B7A8A' : '#8291A0'}
        />
      </Pressable>
    </ScrollView>
  </SafeAreaView>
);
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    padding: 20,
    gap: 18,
    paddingBottom: 32,
  },

  section: {
    gap: 10,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  enrollBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(120,140,160,0.18)',
  },

  enrollIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(47,124,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  enrollTextBlock: {
    flex: 1,
    gap: 2,
  },

  enrollTitle: {
    fontSize: 15,
    fontWeight: '700',
  },

  enrollSubtitle: {
    fontSize: 12.5,
  },
});
