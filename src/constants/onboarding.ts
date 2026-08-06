import type { Ionicons } from '@expo/vector-icons';

import type { PermissionStepConfig, UserRole } from '../types/onboarding';

type IconName = keyof typeof Ionicons.glyphMap;

export const ROLE_OPTIONS: Array<{
  role: UserRole;
  title: string;
  description: string;
  icon: IconName;
}> = [
  {
    role: 'admin',
    title: 'Admin',
    description:
      'Enroll voices, train wake words, configure detection sensitivity, and manage connected target devices.',
    icon: 'shield-checkmark',
  },
  {
    role: 'target',
    title: 'Target Device',
    description: "Link this device to an Admin account to enable automatic voice locking.",
    icon: 'phone-portrait',
  },
];

export const PERMISSION_STEPS: PermissionStepConfig[] = [
  {
    id: 'microphone',
    title: 'Microphone Permission',
    description: 'Needed to listen for the wake word locally.',
    grantedLabel: 'Granted',
    requiresDevBuild: false,
    requiredForRoles: ['admin', 'target'],
  },
  {
    id: 'battery',
    title: 'Persistent Background Execution',
    description:
      'Prevents Android from killing the listening process while the screen is off or the app is minimized.',
    grantedLabel: 'Optimized',
    requiresDevBuild: true,
    requiredForRoles: ['target'],
  },
  {
    id: 'deviceAdmin',
    title: 'Device Administrator Permission',
    description: 'Allows VoxLock to instantly turn off and lock this device on a valid voice command.',
    grantedLabel: 'Enabled',
    requiresDevBuild: true,
    requiredForRoles: ['target'],
  },
  {
    id: 'foregroundMic',
    title: 'Foreground Service Mic Access',
    description: 'Required on Android 14+ to keep listening while a foreground service is running.',
    grantedLabel: 'Allowed',
    requiresDevBuild: true,
    requiredForRoles: ['target'],
  },
];

export function getPermissionStepsForRole(role: UserRole): PermissionStepConfig[] {
  return PERMISSION_STEPS.filter((step) => step.requiredForRoles.includes(role));
}