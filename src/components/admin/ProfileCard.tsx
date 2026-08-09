import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { VoiceProfile } from '@/src/types/profile';

type Props = {
  profile: VoiceProfile;
  onSelectActive: () => void;
  onRename: () => void;
  onRetrain: () => void;
  onDelete: () => void;
};

export function ProfileCard({
  profile,
  onSelectActive,
  onRename,
  onRetrain,
  onDelete,
}: Props) {
  const colorScheme = useColorScheme();
  const resolvedScheme = (colorScheme === 'dark' ? 'dark' : 'light') as keyof typeof Colors;
  const colors = Colors[resolvedScheme];
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#121A24' : '#FFFFFF',
          borderColor: profile.isSystemActive
            ? '#2F7CF6'
            : isDark
            ? '#202D3D'
            : '#E5E9F0',
        },
      ]}
    >
      {/* Header Row: Radio Indicator & Name */}
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: profile.isSystemActive }}
          onPress={onSelectActive}
          style={styles.radioTouchable}
        >
          <Ionicons
            name={profile.isSystemActive ? 'radio-button-on' : 'radio-button-off'}
            size={22}
            color={profile.isSystemActive ? '#2F7CF6' : isDark ? '#6B7A8A' : '#94A3B8'}
          />
          <View style={styles.titleBlock}>
            <View style={styles.nameRow}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {profile.name}
              </Text>
              {profile.isSystemActive && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE MONITOR</Text>
                </View>
              )}
            </View>
            <Text style={[styles.subText, { color: isDark ? '#8F9EB2' : '#64748B' }]}>
              {profile.embeddingsCount} voice samples trained
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Target Device Info */}
      <View
        style={[
          styles.deviceBox,
          { backgroundColor: isDark ? '#182230' : '#F8FAFC' },
        ]}
      >
        <Ionicons
          name="hardware-chip-outline"
          size={16}
          color={profile.linkedDevice ? '#2F7CF6' : isDark ? '#6B7A8A' : '#94A3B8'}
        />
        <Text style={[styles.deviceText, { color: isDark ? '#CBD5E0' : '#475569' }]}>
          Linked Device:{' '}
          <Text style={{ fontWeight: '700' }}>
            {profile.linkedDevice ? profile.linkedDevice.deviceName : 'None (Unlinked)'}
          </Text>
        </Text>
      </View>

      {/* Quick Actions Row */}
      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          onPress={onRetrain}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: isDark ? '#1C2633' : '#F1F5F9', opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="mic-outline" size={15} color="#2F7CF6" />
          <Text style={[styles.actionText, { color: isDark ? '#CBD5E0' : '#334155' }]}>
            Edit / Re-train
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onRename}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: isDark ? '#1C2633' : '#F1F5F9', opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="pencil-outline" size={15} color={isDark ? '#CBD5E0' : '#475569'} />
          <Text style={[styles.actionText, { color: isDark ? '#CBD5E0' : '#334155' }]}>
            Rename
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onDelete}
          style={({ pressed }) => [
            styles.actionButton,
            styles.deleteButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="trash-outline" size={15} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
  },
  subText: {
    fontSize: 12.5,
  },
  activeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(47, 124, 246, 0.12)',
  },
  activeBadgeText: {
    color: '#2F7CF6',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  deviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  deviceText: {
    fontSize: 12.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  actionButton: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});