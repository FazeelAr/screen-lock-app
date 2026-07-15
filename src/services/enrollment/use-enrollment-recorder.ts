import { useEffect, useMemo, useRef, useState } from 'react';

import { Audio, type Recording } from 'expo-av';
import { Directory, File, Paths } from 'expo-file-system';

import {
    listEnrollmentSamples,
    loadLatestEnrollmentProfile,
    loadSavedEnrollmentProfile,
    saveEnrollmentProfile,
    saveEnrollmentSample,
    type EnrollmentProfile,
    type EnrollmentSample,
} from '@/src/services/enrollment/enrollment-storage';

const SAMPLE_DIRECTORY = new Directory(Paths.document, 'screen-block', 'samples');

function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export type EnrollmentRecorderState = {
  isReady: boolean;
  isRecording: boolean;
  isSaving: boolean;
  durationMillis: number;
  durationLabel: string;
  samples: EnrollmentSample[];
  profile: EnrollmentProfile | null;
  speakerLabel: string;
  sampleTarget: number;
  errorMessage: string | null;
  permissionGranted: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  saveProfile: (nextValues?: { speakerLabel?: string; sampleTarget?: number }) => Promise<void>;
  refresh: () => Promise<void>;
};

export function useEnrollmentRecorder(): EnrollmentRecorderState {
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const recordingRef = useRef<Recording | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);
  const [samples, setSamples] = useState<EnrollmentSample[]>([]);
  const [profile, setProfile] = useState<EnrollmentProfile | null>(null);
  const [speakerLabel, setSpeakerLabel] = useState('Authorized speaker');
  const [sampleTarget, setSampleTarget] = useState(12);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const permissionGranted = permissionResponse?.granted ?? false;

  const durationLabel = useMemo(() => formatDuration(durationMillis), [durationMillis]);

  useEffect(() => {
    let isCancelled = false;

    async function bootstrap() {
      try {
        setIsReady(false);
        setErrorMessage(null);
        SAMPLE_DIRECTORY.create({ idempotent: true, intermediates: true });

        const savedProfile = (await loadSavedEnrollmentProfile()) ?? (await loadLatestEnrollmentProfile());

        if (savedProfile && !isCancelled) {
          setProfile(savedProfile);
          setSpeakerLabel(savedProfile.speakerLabel);
          setSampleTarget(savedProfile.sampleTarget);
          const savedSamples = await listEnrollmentSamples(savedProfile.profileId);
          if (!isCancelled) {
            setSamples(savedSamples);
          }
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load enrollment state.');
        }
      } finally {
        if (!isCancelled) {
          setIsReady(true);
        }
      }
    }

    void bootstrap();

    return () => {
      isCancelled = true;
      if (recordingRef.current) {
        void recordingRef.current.stopAndUnloadAsync().catch(() => undefined);
      }
    };
  }, []);

  async function ensureRecordingPermission(): Promise<boolean> {
    if (permissionGranted) {
      return true;
    }

    const nextPermission = await requestPermission();
    return nextPermission.granted;
  }

  async function ensureProfile(nextValues?: { speakerLabel?: string; sampleTarget?: number }): Promise<EnrollmentProfile> {
    const nextSpeakerLabel = nextValues?.speakerLabel?.trim() || speakerLabel.trim();
    const nextSampleTarget = nextValues?.sampleTarget ?? sampleTarget;

    const storedProfile = await saveEnrollmentProfile({
      profileId: profile?.profileId,
      speakerLabel: nextSpeakerLabel,
      sampleTarget: nextSampleTarget,
      wakeWord: 'STOP',
    });

    setProfile(storedProfile);
    setSpeakerLabel(storedProfile.speakerLabel);
    setSampleTarget(storedProfile.sampleTarget);

    return storedProfile;
  }

  async function refresh(): Promise<void> {
    if (!profile) {
      setSamples([]);
      return;
    }

    const nextSamples = await listEnrollmentSamples(profile.profileId);
    setSamples(nextSamples);
  }

  async function saveProfile(nextValues?: { speakerLabel?: string; sampleTarget?: number }): Promise<void> {
    setErrorMessage(null);
    await ensureProfile(nextValues);
    await refresh();
  }

  async function startRecording(): Promise<void> {
    try {
      setErrorMessage(null);

      const hasPermission = await ensureRecordingPermission();
      if (!hasPermission) {
        throw new Error('Microphone permission is required to capture enrollment samples.');
      }

      const activeProfile = await ensureProfile();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording) {
            setDurationMillis(status.durationMillis);
          }
        },
        250
      );

      recordingRef.current = recording;
      setDurationMillis(0);
      setIsRecording(true);

      if (!activeProfile.profileId) {
        throw new Error('Enrollment profile is missing.');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start recording.');
      setIsRecording(false);
      recordingRef.current = null;
    }
  }

  async function stopRecording(): Promise<void> {
    const recording = recordingRef.current;

    if (!recording) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeAndroid: Audio.InterruptionModeAndroid.DuckOthers,
      });

      const rawUri = recording.getURI();

      if (!rawUri) {
        throw new Error('Recording did not produce a file.');
      }

      const currentProfile = profile ?? (await ensureProfile());
      const sampleIndex = samples.length + 1;
      const sampleName = `${currentProfile.profileId}-sample-${sampleIndex}-${Date.now()}.m4a`;
      const sourceFile = new File(rawUri);
      const destinationFile = new File(SAMPLE_DIRECTORY, sampleName);

      if (sourceFile.exists) {
        sourceFile.move(destinationFile);
      }

      const savedSample = await saveEnrollmentSample({
        profileId: currentProfile.profileId,
        uri: destinationFile.uri,
        durationMillis: durationMillis || 0,
      });

      setSamples((currentSamples) => [...currentSamples, savedSample]);
      setDurationMillis(0);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save recording.');
    } finally {
      recordingRef.current = null;
      setIsRecording(false);
      setIsSaving(false);
    }
  }

  return {
    isReady,
    isRecording,
    isSaving,
    durationMillis,
    durationLabel,
    samples,
    profile,
    speakerLabel,
    sampleTarget,
    errorMessage,
    permissionGranted,
    startRecording,
    stopRecording,
    saveProfile,
    refresh,
  };
}
