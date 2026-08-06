import type { ActivationModeId, AdminProfileSummary, LockDurationId } from '../types/admin';

export const ACTIVATION_MODE_OPTIONS: Array<{ id: ActivationModeId; label: string }> = [
  { id: 'wakeWord', label: 'Wake Word' },
  { id: 'voiceOnly', label: 'Voice Only' },
];

export const LOCK_DURATION_OPTIONS: Array<{ id: LockDurationId; label: string }> = [
  { id: '30s', label: '30s' },
  { id: '1m', label: '1m' },
  { id: '5m', label: '5m' },
  { id: '10m', label: '10m' },
  { id: 'custom', label: 'Custom' },
];

// TODO: Backend Integration
// Replace with a real query against the enrollment_profiles table
// (see src/services/enrollment/enrollment-storage.ts) joined with a
// future `linked_devices` table once Admin<->Target pairing exists.
export const MOCK_ADMIN_PROFILE: AdminProfileSummary = {
  profileId: 'profile_mock_001',
  profileName: 'Default Admin',
  embeddingsCount: 12,
  linkedDeviceName: 'Pixel 8',
};