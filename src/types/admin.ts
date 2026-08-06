export type ServiceStatus = 'armed' | 'paused';

export type ActivationModeId = 'wakeWord' | 'voiceOnly';

export type LockDurationId = '30s' | '1m' | '5m' | '10m' | 'custom';

export interface AdminProfileSummary {
  profileId: string;
  profileName: string;
  embeddingsCount: number;
  linkedDeviceName: string | null;
}