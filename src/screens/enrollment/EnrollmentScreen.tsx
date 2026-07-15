import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEnrollmentRecorder } from '@/src/services/enrollment/use-enrollment-recorder';

const SAMPLE_TARGETS = [10, 12, 15, 20];

const enrollmentChecklist = [
  {
    label: 'Wake word',
    value: 'STOP',
    description: 'The exact trigger phrase to capture during enrollment.',
  },
  {
    label: 'Speaker profile',
    value: 'Authorized person only',
    description: 'The embedding is tied to the enrolled speaker identity.',
  },
  {
    label: 'Storage',
    value: 'Local only',
    description: 'Recordings and embeddings stay on-device.',
  },
  {
    label: 'Target',
    value: '12 samples',
    description: 'Enough utterances to build a stable baseline for Step 4.',
  },
];

const flowSteps = [
  'Record repeated wake-word clips from the authorized speaker.',
  'Persist each sample to local device storage.',
  'Collect enough clips to build a speaker embedding later.',
  'Use the local profile and vector store for matching in the next step.',
];

export default function EnrollmentScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const {
    isReady,
    isRecording,
    isSaving,
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
  } = useEnrollmentRecorder();
  const [draftSpeakerLabel, setDraftSpeakerLabel] = useState('Authorized speaker');
  const [draftSampleTarget, setDraftSampleTarget] = useState(12);

  const activeSpeakerLabel = profile?.speakerLabel ?? draftSpeakerLabel;
  const activeSampleTarget = profile?.sampleTarget ?? draftSampleTarget;

  const sampleSlots = useMemo(
    () => Array.from({ length: activeSampleTarget }, (_, index) => index + 1),
    [activeSampleTarget]
  );

  const recordedCount = samples.length;
  const completionRatio = Math.min(100, Math.round((recordedCount / activeSampleTarget) * 100));

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View pointerEvents="none" style={styles.backgroundOrbs}>
        <View style={styles.orbOne} />
        <View style={styles.orbTwo} />
        <View style={styles.orbThree} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <ThemedView
          style={[
            styles.hero,
            { backgroundColor: colorScheme === 'dark' ? '#10161B' : '#F6F8FB' },
          ]}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Android only</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Offline enrollment</Text>
            </View>
          </View>

          <ThemedText
            type="title"
            style={[
              styles.title,
              {
                color: colors.text,
                fontFamily: Fonts.rounded,
              },
            ]}>
            Voice enrollment
          </ThemedText>

          <ThemedText
            style={[
              styles.subtitle,
              {
                color: colorScheme === 'dark' ? '#C9D3DD' : '#425466',
              },
            ]}>
            Capture repeated wake-word samples for one authorized speaker. Each clip is saved
            locally, ready for the future vector embedding step.
          </ThemedText>

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              onPress={isRecording ? stopRecording : startRecording}
              style={[
                styles.primaryAction,
                { backgroundColor: isRecording ? '#C93B3B' : '#2F7CF6' },
              ]}>
              <Text style={styles.primaryActionText}>
                {isRecording ? 'Stop and save sample' : 'Record sample'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                void saveProfile({
                  speakerLabel: draftSpeakerLabel,
                  sampleTarget: draftSampleTarget,
                })
              }
              style={styles.secondaryAction}>
              <Text style={[styles.secondaryActionText, { color: colors.text }]}>Save profile</Text>
            </Pressable>
          </View>

          <View style={styles.progressShell}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.text }]}>Enrollment readiness</Text>
              <Text style={[styles.progressValue, { color: colors.text }]}> {recordedCount} / {activeSampleTarget}</Text>
            </View>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: colorScheme === 'dark' ? '#18232B' : '#E5EBF2' },
              ]}>
              <View style={[styles.progressFill, { width: `${completionRatio}%` }]} />
            </View>
            <Text
              style={[
                styles.progressHint,
                { color: colorScheme === 'dark' ? '#94A3B8' : '#5A6B7F' },
              ]}>
              Record between 10 and 20 samples. The target is {activeSampleTarget} and the current
              session is {isReady ? 'ready' : 'loading'}.
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: colors.text }]}>Status: {isRecording ? `recording ${durationLabel}` : isSaving ? 'saving sample' : 'idle'}</Text>
            <Text style={[styles.statusText, { color: permissionGranted ? '#0FA5A0' : '#C58A00' }]}>
              Microphone {permissionGranted ? 'enabled' : 'permission pending'}
            </Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
        </ThemedView>

        <ThemedView
          style={[
            styles.card,
            { backgroundColor: colorScheme === 'dark' ? '#11171D' : '#FFFFFF' },
          ]}>
          <View style={styles.cardHeader}>
            <View>
              <ThemedText
                type="subtitle"
                style={{ color: colors.text, fontFamily: Fonts.rounded, marginBottom: 2 }}>
                Enrollment profile
              </ThemedText>
              <Text style={[styles.cardCaption, { color: colorScheme === 'dark' ? '#93A4B7' : '#5F6F82' }]}>
                Define the person who is allowed to trigger the lock action and persist the setup.
              </Text>
            </View>
            <View style={styles.lockPill}>
              <Text style={styles.lockPillText}>Local secure storage</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Authorized speaker label</Text>
            <TextInput
              value={draftSpeakerLabel}
              onChangeText={setDraftSpeakerLabel}
              placeholder="Authorized speaker"
              placeholderTextColor={colorScheme === 'dark' ? '#607080' : '#8A97A8'}
              style={[
                styles.textInput,
                {
                  color: colors.text,
                  backgroundColor: colorScheme === 'dark' ? '#0B1014' : '#F3F6FA',
                  borderColor: colorScheme === 'dark' ? '#22303A' : '#D7DFE8',
                },
              ]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Sample target</Text>
            <View style={styles.targetRow}>
              {SAMPLE_TARGETS.map((target) => {
                const isActive = target === draftSampleTarget;
                return (
                  <Pressable
                    key={target}
                    accessibilityRole="button"
                    onPress={() => setDraftSampleTarget(target)}
                    style={[
                      styles.targetChip,
                      {
                        backgroundColor: isActive
                          ? '#2F7CF6'
                          : colorScheme === 'dark'
                            ? '#0F151A'
                            : '#F3F6FA',
                        borderColor: isActive
                          ? '#2F7CF6'
                          : colorScheme === 'dark'
                            ? '#22303A'
                            : '#D7DFE8',
                      },
                    ]}>
                    <Text style={[styles.targetChipText, { color: isActive ? '#FFFFFF' : colors.text }]}>
                      {target}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ThemedView>

        <ThemedView
          style={[
            styles.card,
            { backgroundColor: colorScheme === 'dark' ? '#11171D' : '#FFFFFF' },
          ]}>
          <View style={styles.cardHeader}>
            <View>
              <ThemedText
                type="subtitle"
                style={{ color: colors.text, fontFamily: Fonts.rounded, marginBottom: 2 }}>
                Local sample queue
              </ThemedText>
              <Text style={[styles.cardCaption, { color: colorScheme === 'dark' ? '#93A4B7' : '#5F6F82' }]}>
                These slots will be filled as you record and save wake-word samples.
              </Text>
            </View>
            <Text style={[styles.mutedCount, { color: colorScheme === 'dark' ? '#93A4B7' : '#5F6F82' }]}>
              {samples.length} saved
            </Text>
          </View>

          <View style={styles.sampleGrid}>
            {sampleSlots.map((slot) => {
              const sample = samples[slot - 1];
              const isSaved = Boolean(sample);
              return (
                <View
                  key={slot}
                  style={[
                    styles.sampleSlot,
                    {
                      backgroundColor: colorScheme === 'dark' ? '#0B1014' : '#F6F8FB',
                      borderColor: isSaved ? '#2F7CF6' : colorScheme === 'dark' ? '#22303A' : '#D7DFE8',
                    },
                  ]}>
                  <Text style={[styles.sampleSlotIndex, { color: colors.text }]}>#{slot}</Text>
                  <Text style={[styles.sampleSlotLabel, { color: isSaved ? '#2F7CF6' : colorScheme === 'dark' ? '#A5B4C4' : '#627184' }]}>
                    {isSaved ? formatSampleSummary(sample.durationMillis) : 'pending'}
                  </Text>
                </View>
              );
            })}
          </View>
        </ThemedView>

        <View style={styles.twoColumnRow}>
          {enrollmentChecklist.map((item) => (
            <ThemedView
              key={item.label}
              style={[
                styles.miniCard,
                { backgroundColor: colorScheme === 'dark' ? '#11171D' : '#FFFFFF' },
              ]}>
              <Text style={[styles.miniLabel, { color: colorScheme === 'dark' ? '#9AB0C7' : '#617183' }]}>
                {item.label}
              </Text>
              <Text style={[styles.miniValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[styles.miniDescription, { color: colorScheme === 'dark' ? '#7E91A5' : '#516171' }]}>
                {item.description}
              </Text>
            </ThemedView>
          ))}
        </View>

        <ThemedView
          style={[
            styles.card,
            { backgroundColor: colorScheme === 'dark' ? '#11171D' : '#FFFFFF' },
          ]}>
          <ThemedText
            type="subtitle"
            style={{ color: colors.text, fontFamily: Fonts.rounded, marginBottom: 10 }}>
            Vector store note
          </ThemedText>
          <Text style={[styles.cardBody, { color: colorScheme === 'dark' ? '#93A4B7' : '#5F6F82' }]}>
            The sample database is local SQLite now, and the next step will turn this into actual
            on-device embedding storage and similarity search. Expo SQLite is configured so we can
            add sqlite-vec in a dev build when the embedding model is ready.
          </Text>
        </ThemedView>

        <ThemedView
          style={[
            styles.card,
            styles.flowCard,
            { backgroundColor: colorScheme === 'dark' ? '#11171D' : '#FFFFFF' },
          ]}>
          <ThemedText
            type="subtitle"
            style={{ color: colors.text, fontFamily: Fonts.rounded, marginBottom: 10 }}>
            What happens next
          </ThemedText>

          {flowSteps.map((step, index) => (
            detection, background listening, and lock integration will be added next.
              <View
                style={[
                  styles.flowIndex,
                  {
                    backgroundColor:
                      index === 0 ? '#2F7CF6' : colorScheme === 'dark' ? '#18232B' : '#E5EBF2',
                  },
                ]}>
                <Text style={[styles.flowIndexText, { color: index === 0 ? '#FFFFFF' : colors.text }]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.flowText, { color: colors.text }]}>{step}</Text>
            </View>
          ))}

          <Text
            style={[
              styles.note,
              { color: colorScheme === 'dark' ? '#93A4B7' : '#5F6F82' },
            ]}>
            This screen is only the enrollment UI for Step 1. Audio capture, embeddings, wake-word
            detection, background listening, and lock integration will be added next.
          </Text>
        </ThemedView>

        {Platform.OS === 'android' ? (
          <View style={styles.platformTag}>
            <Text style={styles.platformTagText}>Optimized for Android enrollment flow</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backgroundOrbs: {
    ...StyleSheet.absoluteFillObject,
  },
  orbOne: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: 'rgba(47, 124, 246, 0.14)',
  },
  orbTwo: {
    position: 'absolute',
    top: 240,
    left: -90,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(15, 188, 178, 0.10)',
  },
  orbThree: {
    position: 'absolute',
    bottom: 80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 167, 38, 0.10)',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  hero: {
    borderRadius: 28,
    padding: 20,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(120, 140, 160, 0.18)',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(47, 124, 246, 0.10)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#2F7CF6',
    textTransform: 'uppercase',
  },
  title: {
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  progressShell: {
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2F7CF6',
  },
  progressHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryAction: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryAction: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(120, 140, 160, 0.22)',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  errorBox: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(201, 59, 59, 0.12)',
  },
  errorText: {
    color: '#C93B3B',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    padding: 18,
    gap: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(120, 140, 160, 0.18)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardCaption: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  lockPill: {
    borderRadius: 999,
    backgroundColor: 'rgba(15, 188, 178, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  lockPillText: {
    color: '#0FA5A0',
    fontSize: 12,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  targetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  targetChip: {
    minWidth: 62,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  targetChipText: {
    fontSize: 15,
    fontWeight: '700',
  },
  mutedCount: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sampleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sampleSlot: {
    width: '31%',
    minWidth: 84,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 6,
  },
  sampleSlotIndex: {
    fontSize: 16,
    fontWeight: '800',
  },
  sampleSlotLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  twoColumnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  miniCard: {
    width: '48%',
    borderRadius: 22,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(120, 140, 160, 0.18)',
    gap: 6,
  },
  miniLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  miniValue: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  miniDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  flowCard: {
    gap: 12,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  flowIndex: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  flowIndexText: {
    fontSize: 13,
    fontWeight: '800',
  },
  flowText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  note: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
  platformTag: {
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#0F1B28',
  },
  platformTagText: {
    color: '#D7E5F7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});

function formatSampleSummary(durationMillis: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `saved ${minutes}:${seconds.toString().padStart(2, '0')}`;
}