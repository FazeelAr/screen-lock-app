import { useEffect, useMemo, useRef, useState } from 'react';

import { Directory, File, Paths } from 'expo-file-system';

type PermissionResult = {
  granted: boolean;
  canAskAgain?: boolean;
  status?: string;
  expires?: string;
};

type RecordingLike = {
  stopAndUnloadAsync: () => Promise<void>;
  getURI: () => string | null;
};

type AudioApiLike = {
  usePermissions: () => [PermissionResult | null, (force?: boolean) => Promise<PermissionResult>];
  setAudioModeAsync: (config: Record<string, unknown>) => Promise<void>;
  Recording: {
    createAsync: (
      options: Record<string, unknown>,
      statusCallback?: (status: { isRecording?: boolean; durationMillis?: number }) => void,
      intervalMs?: number
    ) => Promise<{ recording: RecordingLike }>;
    Presets: {
      HIGH_QUALITY: Record<string, unknown>;
    };
  };
};

const InterruptionModeAndroid = {
  DoNotMix: 1,
  DuckOthers: 2,
};

let audioApiCache: AudioApiLike | null | undefined;

function getAudioApi(): AudioApiLike | null {
  if (audioApiCache !== undefined) {
    return audioApiCache;
  }

  try {
    const imported = require('expo-av');
    const AudioModule = imported?.Audio ?? imported?.default ?? imported;

    audioApiCache = {
      usePermissions: AudioModule?.usePermissions ?? (() => [null, async () => ({ granted: false })]),
      setAudioModeAsync: AudioModule?.setAudioModeAsync ?? (async () => undefined),
      Recording: AudioModule?.Recording ?? {
        createAsync: async () => {
          throw new Error('Audio recording is unavailable in this environment.');
        },
        Presets: {
          HIGH_QUALITY: {},
        },
      },
    };
  } catch {
    audioApiCache = null;
  }

  return audioApiCache;
}

import {
    listEnrollmentSamples,
    loadLatestEnrollmentProfile,
    loadSavedEnrollmentProfile,
    saveEnrollmentProfile,
    saveEnrollmentSample,
    type EnrollmentProfile,
    type EnrollmentSample,
} from '@/src/services/enrollment/enrollment-storage';

function getSampleDirectory() {
  return new Directory(Paths.document, 'screen-block', 'samples');
}

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
  const audioApi = getAudioApi();
  const [permissionResponse, requestPermission] = audioApi?.usePermissions?.() ?? [null, async () => ({ granted: false })];
  const recordingRef = useRef<RecordingLike | null>(null);
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
        await getSampleDirectory().create({ idempotent: true, intermediates: true });

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

      if (!audioApi) {
        throw new Error('Audio recording is unavailable in this environment. Use a native build or a device that supports expo-av.');
      }

      const activeProfile = await ensureProfile();

      await audioApi.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
      });

      const { recording } = await audioApi.Recording.createAsync(
        audioApi.Recording.Presets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording) {
            setDurationMillis(status.durationMillis ?? 0);
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
      await audioApi?.setAudioModeAsync?.({
        allowsRecordingIOS: false,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      });

      const rawUri = recording.getURI();

      if (!rawUri) {
        throw new Error('Recording did not produce a file.');
      }

      const currentProfile = profile ?? (await ensureProfile());
      const sampleIndex = samples.length + 1;
      const sampleName = `${currentProfile.profileId}-sample-${sampleIndex}-${Date.now()}.m4a`;
      const sourceFile = new File(rawUri);
      const destinationFile = new File(getSampleDirectory(), sampleName);

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
