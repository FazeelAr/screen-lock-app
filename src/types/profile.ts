export interface DeviceLinkInfo {
  deviceId: string;
  deviceName: string;
  linkedAt: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  isSystemActive: boolean;
  embeddingsCount: number;
  linkedDevice?: DeviceLinkInfo;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileDTO {
  name: string;
}