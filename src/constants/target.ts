// TODO: Backend Integration
// Replace this mock data with a real read from the local database once
// Admin<->Target device pairing exists (a `linked_devices` table, likely
// keyed by a pairing code or QR-scanned device ID).
export const MOCK_TARGET_STATUS = {
  isConnected: true,
  adminName: 'Admin (You)',
  activationMode: 'Wake Word + Voice' as 'Wake Word + Voice' | 'Voice Only',
  lockDurationLabel: '1 minute',
  microphoneGranted: true,
  deviceAdminGranted: true,
};