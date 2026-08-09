import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useVoiceProfiles } from '@/src/hooks/useVoiceProfiles';
import { ProfileCard } from '@/src/components/admin/ProfileCard';
import { AddProfileModal } from '@/src/components/admin/AddProfileModal';
import { RenameProfileModal } from '@/src/components/admin/RenameProfileModal';
import { VoiceProfile } from '@/src/types/profile';

export default function ProfilesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const resolvedScheme = (colorScheme === 'dark' ? 'dark' : 'light') as keyof typeof Colors;
  const colors = Colors[resolvedScheme];
  const isDark = colorScheme === 'dark';

  const {
    profiles,
    loading,
    error,
    addProfile,
    setActiveProfile,
    renameProfile,
    deleteProfile,
  } = useVoiceProfiles();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<VoiceProfile | null>(null);

  const handleRetrain = () => {
    router.push('/enrollment');
  };

  const handleDeleteConfirm = (profile: VoiceProfile) => {
    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete "${profile.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProfile(profile.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: isDark ? '#0B0F14' : '#F5F7FA' }]}
      edges={['top', 'bottom']}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profiles</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsAddModalOpen(true)}
            style={({ pressed }) => [
              styles.addBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Profile</Text>
          </Pressable>
        </View>

        {/* State Indicators */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color="#2F7CF6" />
          </View>
        )}

        {error && (
          <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
        )}

        {!loading && profiles.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="mic-off-outline" size={32} color={isDark ? '#6B7A8A' : '#94A3B8'} />
            <Text style={[styles.emptyText, { color: isDark ? '#8F9EB2' : '#64748B' }]}>
              No voice profiles created yet.
            </Text>
          </View>
        )}

        {/* Profile List */}
        {!loading &&
          profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onSelectActive={() => setActiveProfile(profile.id)}
              onRename={() => setEditingProfile(profile)}
              onRetrain={handleRetrain}
              onDelete={() => handleDeleteConfirm(profile)}
            />
          ))}
      </ScrollView>

      {/* Dialog Modals */}
      <AddProfileModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addProfile}
      />

      {editingProfile && (
        <RenameProfileModal
          visible={Boolean(editingProfile)}
          initialName={editingProfile.name}
          onClose={() => setEditingProfile(null)}
          onSubmit={(newName) => renameProfile(editingProfile.id, newName)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  addBtn: {
    backgroundColor: '#2F7CF6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  centerContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13.5,
  },
});