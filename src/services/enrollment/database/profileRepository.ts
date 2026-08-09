import { VoiceProfile, CreateProfileDTO } from '@/src/types/profile';

// TEMPORARY IN-MEMORY STORE
// TODO(database):
// Replace this local array with SQLite table operations using expo-sqlite.
// Table schema recommendation:
// CREATE TABLE IF NOT EXISTS voice_profiles (
//   id TEXT PRIMARY KEY NOT NULL,
//   name TEXT NOT NULL,
//   isSystemActive INTEGER NOT NULL DEFAULT 0,
//   embeddingsCount INTEGER NOT NULL DEFAULT 0,
//   linkedDeviceId TEXT,
//   linkedDeviceName TEXT,
//   createdAt TEXT NOT NULL,
//   updatedAt TEXT NOT NULL
// );
let MOCK_PROFILES: VoiceProfile[] = [
  {
    id: 'prof_1',
    name: 'Primary Admin',
    isSystemActive: true,
    embeddingsCount: 15,
    linkedDevice: {
      deviceId: 'dev_01',
      deviceName: "Adan's Galaxy S23",
      linkedAt: '2026-08-01T10:00:00.000Z',
    },
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'prof_2',
    name: 'Office Voice',
    isSystemActive: false,
    embeddingsCount: 10,
    linkedDevice: undefined,
    createdAt: '2026-08-05T14:30:00.000Z',
    updatedAt: '2026-08-05T14:30:00.000Z',
  },
];

export const profileRepository = {
  async getProfiles(): Promise<VoiceProfile[]> {
    // TODO(database):
    // Execute: SELECT * FROM voice_profiles ORDER BY createdAt DESC;
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_PROFILES]), 150));
  },

  async createProfile(dto: CreateProfileDTO): Promise<VoiceProfile> {
    // TODO(database):
    // Execute: INSERT INTO voice_profiles (id, name, isSystemActive, embeddingsCount, createdAt, updatedAt) ...
    const newProfile: VoiceProfile = {
      id: `prof_${Date.now()}`,
      name: dto.name,
      isSystemActive: MOCK_PROFILES.length === 0,
      embeddingsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_PROFILES.push(newProfile);
    return newProfile;
  },

  async setActiveProfile(profileId: string): Promise<void> {
    // TODO(database):
    // Execute transaction:
    // UPDATE voice_profiles SET isSystemActive = 0;
    // UPDATE voice_profiles SET isSystemActive = 1 WHERE id = ?;
    MOCK_PROFILES = MOCK_PROFILES.map((p) => ({
      ...p,
      isSystemActive: p.id === profileId,
    }));
  },

  async renameProfile(profileId: string, newName: string): Promise<void> {
    // TODO(database):
    // Execute: UPDATE voice_profiles SET name = ?, updatedAt = ? WHERE id = ?;
    MOCK_PROFILES = MOCK_PROFILES.map((p) =>
      p.id === profileId ? { ...p, name: newName, updatedAt: new Date().toISOString() } : p
    );
  },

  async deleteProfile(profileId: string): Promise<void> {
    // TODO(database):
    // Execute: DELETE FROM voice_profiles WHERE id = ?;
    // Make sure associated speaker embeddings are cascade-deleted or removed from storage.
    MOCK_PROFILES = MOCK_PROFILES.filter((p) => p.id !== profileId);
  },
};