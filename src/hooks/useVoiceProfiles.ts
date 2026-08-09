import { useState, useEffect, useCallback } from 'react';
import { VoiceProfile } from '@/src/types/profile';
import { profileRepository } from '@/src/services/enrollment/database/profileRepository';



export function useVoiceProfiles() {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    // TODO(database):
    // Keep loading active while fetching profile records from SQLite/backend
    setLoading(true);
    setError(null);
    try {
      const data = await profileRepository.getProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Failed to load profiles:', err);
      setError('Failed to load profiles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const addProfile = async (name: string) => {
    try {
      await profileRepository.createProfile({ name });
      await fetchProfiles();
    } catch (err) {
      console.error('Failed to create profile:', err);
    }
  };

  const setActiveProfile = async (id: string) => {
    try {
      await profileRepository.setActiveProfile(id);
      await fetchProfiles();
    } catch (err) {
      console.error('Failed to set active profile:', err);
    }
  };

  const renameProfile = async (id: string, newName: string) => {
    try {
      await profileRepository.renameProfile(id, newName);
      await fetchProfiles();
    } catch (err) {
      console.error('Failed to rename profile:', err);
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      await profileRepository.deleteProfile(id);
      await fetchProfiles();
    } catch (err) {
      console.error('Failed to delete profile:', err);
    }
  };

  return {
    profiles,
    loading,
    error,
    refresh: fetchProfiles,
    addProfile,
    setActiveProfile,
    renameProfile,
    deleteProfile,
  };
}