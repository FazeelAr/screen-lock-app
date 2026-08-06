import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { MOCK_TARGET_STATUS } from '@/src/constants/target';

export default function TargetDashboardScreen() {
  const colorScheme = useColorScheme();
  const resolvedScheme = (colorScheme === 'dark' ? 'dark' : 'light') as keyof typeof Colors;
  const colors = Colors[resolvedScheme];
  const isDark = colorScheme === 'dark';

  // TODO: Backend Integration
  // Replace with a live query/subscription to the linked-device record,
  // e.g. useTargetDeviceStatus() hook backed by SQLite + a foreground
  // service broadcast, so this screen reflects real connection state.
  const status = MOCK_TARGET_STATUS;

  const [isUnlinkFlowOpen, setIsUnlinkFlowOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  function handleUnlinkSubmit() {
    if (pin.trim().length !== 4) {
      setPinError('Enter your 4-digit PIN.');
      return;
    }

    setPinError(null);

    // TODO: Backend Integration
    // Verify PIN against securely stored value (SecureStore / hashed in
    // SQLite), then clear the linked_devices record and route back to
    // role selection or a "device unlinked" confirmation screen.
    // Example:
    // const isValid = await verifyUnlinkPin(pin);
    // if (isValid) { await unlinkDevice(); router.replace('/onboarding/role-selection'); }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.text, fontFamily: Fonts.rounded }]}>
              Target Device Status
            </Text>
          </View>
          <View style={styles.managedBadge}>
            <Ionicons name="lock-closed" size={14} color="#2F7CF6" />
            <Text style={styles.managedBadgeText}>Managed Mode Active</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusCard,
            { backgroundColor: isDark ? '#0F1B18' : '#EAF9F5', borderColor: 'rgba(15, 188, 178, 0.3)' },
          ]}>
          <View style={styles.statusHeaderRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusHeaderText}>
              {status.isConnected ? `Protected — Connected to ${status.adminName}` : 'Not Connected'}
            </Text>
          </View>

          <View style={styles.permissionRow}>
            <PermissionReadout
              label="Microphone"
              granted={status.microphoneGranted}
              isDark={isDark}
            />
            <PermissionReadout
              label="Device Admin"
              granted={status.deviceAdminGranted}
              isDark={isDark}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#11171D' : '#FFFFFF' }]}>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: Fonts.rounded }]}>
            Current Configuration
          </Text>

          <InfoRow label="Activation Mode" value={status.activationMode} isDark={isDark} textColor={colors.text} />
          <InfoRow label="Lock Duration" value={status.lockDurationLabel} isDark={isDark} textColor={colors.text} />

          <View style={[styles.noteBox, { backgroundColor: isDark ? '#161C22' : '#F3F6FA' }]}>
            <Ionicons name="information-circle" size={16} color="#5F6F82" />
            <Text style={[styles.noteText, { color: isDark ? '#93A4B7' : '#5F6F82' }]}>
              Security settings and voice profiles can only be changed by the Admin.
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#11171D' : '#FFFFFF' }]}>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: Fonts.rounded }]}>
            Device Management
          </Text>

          {!isUnlinkFlowOpen ? (
            <PrimaryButton
              label="Enter PIN to Unlink Device"
              variant="secondary"
              onPress={() => setIsUnlinkFlowOpen(true)}
            />
          ) : (
            <View style={styles.pinBlock}>
              <TextInput
                value={pin}
                onChangeText={(value) => {
                  setPin(value.replace(/[^0-9]/g, '').slice(0, 4));
                  setPinError(null);
                }}
                placeholder="4-digit PIN"
                placeholderTextColor={isDark ? '#607080' : '#8A97A8'}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                style={[
                  styles.pinInput,
                  {
                    color: colors.text,
                    backgroundColor: isDark ? '#0B1014' : '#F3F6FA',
                    borderColor: pinError ? '#C93B3B' : isDark ? '#22303A' : '#D7DFE8',
                  },
                ]}
              />
              {pinError ? <Text style={styles.pinErrorText}>{pinError}</Text> : null}
              <PrimaryButton label="Confirm Unlink" onPress={handleUnlinkSubmit} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PermissionReadout({ label, granted, isDark }: { label: string; granted: boolean; isDark: boolean }) {
  return (
    <View style={styles.permissionItem}>
      <Ionicons
        name={granted ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={granted ? '#0FA5A0' : '#C93B3B'}
      />
      <Text style={[styles.permissionLabel, { color: isDark ? '#C9D3DD' : '#425466' }]}>{label}</Text>
    </View>
  );
}

function InfoRow({
  label,
  value,
  isDark,
  textColor,
}: {
  label: string;
  value: string;
  isDark: boolean;
  textColor: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: isDark ? '#93A4B7' : '#5F6F82' }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { fontSize: 24, fontWeight: '800' },
  managedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(47, 124, 246, 0.1)',
  },
  managedBadgeText: { color: '#2F7CF6', fontSize: 12, fontWeight: '700' },
  statusCard: { borderRadius: 22, padding: 18, borderWidth: 1, gap: 14 },
  statusHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0FA5A0' },
  statusHeaderText: { fontSize: 15, fontWeight: '800', color: '#0FA5A0' },
  permissionRow: { flexDirection: 'row', gap: 20 },
  permissionItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  permissionLabel: { fontSize: 13, fontWeight: '600' },
  card: { borderRadius: 22, padding: 18, gap: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(120,140,160,0.18)' },
  cardTitle: { fontSize: 17, fontWeight: '800' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 14, fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '700' },
  noteBox: { flexDirection: 'row', gap: 8, borderRadius: 14, padding: 12, alignItems: 'flex-start' },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
  pinBlock: { gap: 12 },
  pinInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, letterSpacing: 8, textAlign: 'center' },
  pinErrorText: { color: '#C93B3B', fontSize: 12, fontWeight: '600' },
});