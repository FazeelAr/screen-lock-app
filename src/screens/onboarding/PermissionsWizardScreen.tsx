import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PermissionCard } from '../../components/onboarding/PermissionCard';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { getPermissionStepsForRole } from '../../constants/onboarding';
import { type PermissionId, type PermissionStatus, type PermissionStepConfig, type UserRole } from '../../types/onboarding';

// Mic permission works inside Expo Go via expo-audio. Lazily required so this
// screen never crashes if the native module isn't linked in a given build.
function getMicPermissionRequester(): (() => Promise<{ granted: boolean }>) | null {
  try {
    const { AudioModule } = require('expo-audio');
    return AudioModule?.requestRecordingPermissionsAsync ?? null;
  } catch {
    return null;
  }
}

export default function PermissionsWizardScreen() {
  const router = useRouter();
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();

  // TODO: Validation / Backend Integration
  // Role should always arrive from RoleSelectionScreen's navigation params.
  // Defaulting to 'admin' here is just a safe fallback for direct/deep-linked
  // navigation during development; once auth exists, redirect to role
  // selection instead of guessing.
  const role: UserRole = roleParam === 'target' ? 'target' : 'admin';

  const steps = useMemo<PermissionStepConfig[]>(() => getPermissionStepsForRole(role), [role]);

  const colorScheme = useColorScheme();
  const resolvedScheme = (colorScheme === 'dark' ? 'dark' : 'light') as keyof typeof Colors;
  const colors = Colors[resolvedScheme];

  const [statuses, setStatuses] = useState<Record<PermissionId, PermissionStatus>>(() => {
    const initial = {} as Record<PermissionId, PermissionStatus>;
    steps.forEach((step) => {
      initial[step.id] = 'pending';
    });
    return initial;
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const grantedCount = steps.filter((step) => statuses[step.id] === 'granted').length;
  const allGranted = steps.length > 0 && grantedCount === steps.length;

  async function requestSinglePermission(id: PermissionId): Promise<boolean> {
    if (id === 'microphone') {
      const requestPermission = getMicPermissionRequester();
      const result = requestPermission ? await requestPermission() : { granted: false };
      return result.granted;
    }

    // TODO: Native Module Integration (requires an Expo Development Build)
    // battery       -> request battery-optimization exemption (native intent).
    // deviceAdmin   -> prompt Android Device Admin activation (native module).
    // foregroundMic -> request FOREGROUND_SERVICE_MICROPHONE at runtime (Android 14+).
    // Not available in Expo Go, so we simulate the grant to keep the flow testable now.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  }

  async function handleAgreeToAll() {
    setIsProcessing(true);

    // Request each permission in order, updating the UI as each one resolves
    // so the user sees progress instead of a single long freeze.
    for (const step of steps) {
      const granted = await requestSinglePermission(step.id);
      setStatuses((current) => ({ ...current, [step.id]: granted ? 'granted' : 'pending' }));
    }

    setIsProcessing(false);
  }

  function handleContinue() {
    // TODO: Backend Integration
    // Persist "onboarding complete" flag + granted role (SecureStore or a
    // local `app_state` table) so app/index.tsx can skip onboarding for
    // returning users. Also persist which permissions were granted so the
    // relevant dashboard can display accurate live status instead of mocks.

    if (role === 'target') {
      router.replace('/target/dashboard');
    } else {
      router.replace('/(tabs)');
    }
  }
  const buttonLabel = isProcessing
    ? 'Requesting permissions…'
    : allGranted
      ? 'Continue'
      : 'Agree to All Permissions';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.stepLabel, { color: colorScheme === 'dark' ? '#93A4B7' : '#5F6F82' }]}>
          {role === 'admin' ? 'Admin Setup' : 'Target Device Setup'}
        </Text>
        <Text style={[styles.title, { color: colors.text, fontFamily: Fonts.rounded }]}>Permissions Setup</Text>
        <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#93A4B7' : '#5F6F82' }]}>
          {role === 'admin'
            ? 'This device only needs microphone access to record your voice profile.'
            : 'This device needs these permissions to listen and lock automatically.'}
        </Text>

        <View style={[styles.progressTrack, { backgroundColor: colorScheme === 'dark' ? '#18232B' : '#E5EBF2' }]}>
          <View
            style={[
              styles.progressFill,
              { width: steps.length ? `${(grantedCount / steps.length) * 100}%` : '0%' },
            ]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {steps.map((step) => (
          <PermissionCard
            key={step.id}
            title={step.title}
            description={step.description}
            status={statuses[step.id]}
            grantedLabel={step.grantedLabel}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={buttonLabel}
          onPress={allGranted ? handleContinue : handleAgreeToAll}
          loading={isProcessing}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8 },
  stepLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: '#2F7CF6' },
  content: { padding: 20, gap: 14 },
  footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
});