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

  // Placeholder handlers for UI structure (No-op functions preserving pure flow)
  const isDeviceConnected = false;
  const isVoiceEnrolled = false;

  return (
    <SafeAreaView
      style={[
        styles.screen,
        { backgroundColor: isDark ? '#0B0F14' : '#F5F7FA' },
      ]}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerBrand}>
            <View
              style={[
                styles.logoBadge,
                { backgroundColor: isDark ? '#1A2332' : '#E8F1FF' },
              ]}
            >
              <Ionicons name="mic-circle" size={26} color="#2F7CF6" />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Voice Lock
              </Text>

            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            style={({ pressed }) => [
              styles.iconButton,
              {
                backgroundColor: isDark ? '#161F28' : '#FFFFFF',
                borderColor: isDark ? '#23303E' : '#E2E8F0',
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={isDark ? '#93A4B7' : '#5F6F82'}
            />
          </Pressable>
        </View>

        {/* Profile Summary Card */}
        <ProfileSummaryCard profile={MOCK_ADMIN_PROFILE} />

        {/* Hero Card: Connection Status */}
        {!isDeviceConnected && (
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: isDark ? '#121A24' : '#FFFFFF',
                borderColor: isDark ? '#202D3D' : '#E5E9F0',
              },
            ]}
          >
            <View style={styles.heroCardHeader}>
              <View style={styles.deviceIconWrapper}>
                <Ionicons name="hardware-chip-outline" size={28} color="#2F7CF6" />
              </View>
              <View style={styles.heroCardText}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>
                  No Controlled Phone Connected
                </Text>
                <Text
                  style={[
                    styles.heroSubtitle,
                    { color: isDark ? '#8F9EB2' : '#64748B' },
                  ]}
                >
                  Connect a target device to start protecting it with your voice.
                </Text>
              </View>
            </View>

            <View style={styles.heroActionRow}>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.primaryButton,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Connect Phone</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    backgroundColor: isDark ? '#1C2633' : '#F1F5F9',
                    borderColor: isDark ? '#2C3A4B' : '#E2E8F0',
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Ionicons
                  name="book-outline"
                  size={16}
                  color={isDark ? '#A0AEC0' : '#475569'}
                />
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: isDark ? '#CBD5E0' : '#334155' },
                  ]}
                >
                  How it Works
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Voice Enrollment Card */}
        <Pressable
          accessibilityRole="button"
          onPress={handleEnrollPress}
          style={({ pressed }) => [
            styles.enrollCard,
            {
              backgroundColor: isDark ? '#121A24' : '#FFFFFF',
              borderColor: isDark ? '#202D3D' : '#E5E9F0',
              opacity: pressed ? 0.95 : 1,
              transform: [{ scale: pressed ? 0.995 : 1 }],
            },
          ]}
        >
          <View style={styles.enrollLeftContent}>
            <View
              style={[
                styles.enrollIconWrap,
                {
                  backgroundColor: isVoiceEnrolled
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(47, 124, 246, 0.12)',
                },
              ]}
            >
              <Ionicons
                name={isVoiceEnrolled ? 'checkmark-circle' : 'mic'}
                size={22}
                color={isVoiceEnrolled ? '#10B981' : '#2F7CF6'}
              />
            </View>

            <View style={styles.enrollTextBlock}>
              <View style={styles.enrollTitleRow}>
                <Text style={[styles.enrollTitle, { color: colors.text }]}>
                  {isVoiceEnrolled ? 'Voice Enrolled' : 'Voice Not Enrolled'}
                </Text>
                {isVoiceEnrolled && (
                  <View style={styles.badgeSuccess}>
                    <Text style={styles.badgeSuccessText}>Active</Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.enrollSubtitle,
                  { color: isDark ? '#8F9EB2' : '#64748B' },
                ]}
              >
                {isVoiceEnrolled
                  ? 'Retrain or manage your recorded voice samples'
                  : 'Record your voice so the system can recognize you.'}
              </Text>
            </View>
          </View>

          <View style={styles.enrollChevronRow}>
            {isVoiceEnrolled && (
              <Text
                style={[
                  styles.detailsText,
                  { color: isDark ? '#60A5FA' : '#2563EB' },
                ]}
              >
                View Details
              </Text>
            )}
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isDark ? '#6B7A8A' : '#8291A0'}
            />
          </View>
        </Pressable>

        {/* System Status Summary */}
        <View
          style={[
            styles.statusOverviewCard,
            {
              backgroundColor: isDark ? '#121A24' : '#FFFFFF',
              borderColor: isDark ? '#202D3D' : '#E5E9F0',
            },
          ]}
        >
          <Text style={[styles.statusCardTitle, { color: colors.text }]}>
            System Status
          </Text>

          <View style={styles.statusGrid}>
            <View style={styles.statusRow}>
              <View style={styles.statusItemLeft}>
                <Ionicons
                  name="mic-outline"
                  size={16}
                  color={isDark ? '#8F9EB2' : '#64748B'}
                />
                <Text
                  style={[
                    styles.statusLabel,
                    { color: isDark ? '#8F9EB2' : '#64748B' },
                  ]}
                >
                  Voice Profile
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isVoiceEnrolled
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(239, 68, 68, 0.12)',
                  },
                ]}
              >
                <Ionicons
                  name={isVoiceEnrolled ? 'checkmark-circle' : 'close-circle'}
                  size={14}
                  color={isVoiceEnrolled ? '#10B981' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: isVoiceEnrolled ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {isVoiceEnrolled ? 'Ready' : 'Not Ready'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statusDivider,
                { backgroundColor: isDark ? '#1D2836' : '#F1F5F9' },
              ]}
            />

            <View style={styles.statusRow}>
              <View style={styles.statusItemLeft}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={16}
                  color={isDark ? '#8F9EB2' : '#64748B'}
                />
                <Text
                  style={[
                    styles.statusLabel,
                    { color: isDark ? '#8F9EB2' : '#64748B' },
                  ]}
                >
                  Connected Phone
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isDeviceConnected
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(100, 116, 139, 0.12)',
                  },
                ]}
              >
                <Ionicons
                  name={
                    isDeviceConnected
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={14}
                  color={isDeviceConnected ? '#10B981' : '#64748B'}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: isDeviceConnected ? '#10B981' : '#64748B' },
                  ]}
                >
                  {isDeviceConnected ? 'Connected' : 'None'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statusDivider,
                { backgroundColor: isDark ? '#1D2836' : '#F1F5F9' },
              ]}
            />

            <View style={styles.statusRow}>
              <View style={styles.statusItemLeft}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color={isDark ? '#8F9EB2' : '#64748B'}
                />
                <Text
                  style={[
                    styles.statusLabel,
                    { color: isDark ? '#8F9EB2' : '#64748B' },
                  ]}
                >
                  Protection
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      serviceStatus === 'armed'
                        ? 'rgba(16, 185, 129, 0.12)'
                        : 'rgba(245, 158, 11, 0.12)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color: serviceStatus === 'armed' ? '#10B981' : '#F59E0B',
                    },
                  ]}
                >
                  {serviceStatus === 'armed' ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Master Service Status Toggle Component */}
        <ServiceStatusToggle
          status={serviceStatus}
          onToggle={toggleService}
        />

        {/* Activation Modes */}
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

        {/* Lock Duration */}
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

        {/* Quick Actions Card */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: isDark ? '#93A4B7' : '#5F6F82' },
            ]}
          >
            QUICK ACTIONS
          </Text>

          <View style={styles.quickActionsContainer}>
            <Pressable
              disabled={!isDeviceConnected}
              style={[
                styles.actionTile,
                {
                  backgroundColor: isDark ? '#121A24' : '#FFFFFF',
                  borderColor: isDark ? '#202D3D' : '#E5E9F0',
                  opacity: isDeviceConnected ? 1 : 0.5,
                },
              ]}
            >
              <View style={styles.actionTileIconWrap}>
                <Ionicons name="lock-closed" size={18} color="#2F7CF6" />
              </View>
              <Text style={[styles.actionTileText, { color: colors.text }]}>
                Activate Protection
              </Text>
            </Pressable>

            <Pressable
              disabled={!isDeviceConnected}
              style={[
                styles.actionTile,
                {
                  backgroundColor: isDark ? '#121A24' : '#FFFFFF',
                  borderColor: isDark ? '#202D3D' : '#E5E9F0',
                  opacity: isDeviceConnected ? 1 : 0.5,
                },
              ]}
            >
              <View style={styles.actionTileIconWrap}>
                <Ionicons name="options-outline" size={18} color="#2F7CF6" />
              </View>
              <Text style={[styles.actionTileText, { color: colors.text }]}>
                Device Settings
              </Text>
            </Pressable>

            <Pressable
              disabled={!isDeviceConnected}
              style={[
                styles.actionTile,
                {
                  backgroundColor: isDark ? '#121A24' : '#FFFFFF',
                  borderColor: isDark ? '#202D3D' : '#E5E9F0',
                  opacity: isDeviceConnected ? 1 : 0.5,
                },
              ]}
            >
              <View style={styles.actionTileIconWrap}>
                <Ionicons name="phone-portrait" size={18} color="#2F7CF6" />
              </View>
              <Text style={[styles.actionTileText, { color: colors.text }]}>
                Manage Connected Phone
              </Text>
            </Pressable>
          </View>

          {!isDeviceConnected && (
            <Text
              style={[
                styles.quickActionHint,
                { color: isDark ? '#6B7A8A' : '#8291A0' },
              ]}
            >
              Connect a phone to enable these features.
            </Text>
          )}
        </View>
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
    gap: 20,
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    gap: 16,
  },
  heroCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  deviceIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(47, 124, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCardText: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2F7CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  enrollCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  enrollLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  enrollIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrollTextBlock: {
    flex: 1,
    gap: 3,
  },
  enrollTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  enrollTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  enrollSubtitle: {
    fontSize: 12.5,
    lineHeight: 16,
  },
  enrollChevronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  badgeSuccess: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  badgeSuccessText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  statusOverviewCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  statusCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusGrid: {
    gap: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusDivider: {
    height: 1,
    width: '100%',
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  quickActionsContainer: {
    gap: 8,
  },
  actionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionTileIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(47, 124, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTileText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionHint: {
    fontSize: 12,
    marginTop: 2,
  },
});