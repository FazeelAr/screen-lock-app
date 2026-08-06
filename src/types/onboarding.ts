export type UserRole = 'admin' | 'target';

export type PermissionId = 'microphone' | 'battery' | 'deviceAdmin' | 'foregroundMic';

export type PermissionStatus = 'pending' | 'granted';

export interface PermissionStepConfig {
  id: PermissionId;
  title: string;
  description: string;
  grantedLabel: string;
  requiresDevBuild: boolean;
  requiredForRoles: UserRole[];
}