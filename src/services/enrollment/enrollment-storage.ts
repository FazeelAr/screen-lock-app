import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';

import { cosineSimilarity, deserializeVector, normalizeVector, serializeVector } from '@/src/utils/vector';

export type EnrollmentProfile = {
  profileId: string;
  speakerLabel: string;
  wakeWord: string;
  sampleTarget: number;
  createdAt: string;
  updatedAt: string;
};

export type EnrollmentSample = {
  sampleId: string;
  profileId: string;
  sampleIndex: number;
  uri: string;
  durationMillis: number;
  createdAt: string;
};

export type StoredSpeakerEmbedding = {
  profileId: string;
  vector: number[];
  dimension: number;
  createdAt: string;
  updatedAt: string;
};

export type ClosestSpeakerEmbedding = StoredSpeakerEmbedding & {
  similarity: number;
};

const DATABASE_NAME = 'screen-block-enrollment.db';
const PROFILE_STORE_KEY = 'screen-block.enrollment.profile';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabase();
  }

  return databasePromise;
}

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS enrollment_profiles (
      profile_id TEXT PRIMARY KEY NOT NULL,
      speaker_label TEXT NOT NULL,
      wake_word TEXT NOT NULL,
      sample_target INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS enrollment_samples (
      sample_id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL,
      sample_index INTEGER NOT NULL,
      uri TEXT NOT NULL,
      duration_millis INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES enrollment_profiles(profile_id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS speaker_embeddings (
      profile_id TEXT PRIMARY KEY NOT NULL,
      vector_json TEXT NOT NULL,
      dimension INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES enrollment_profiles(profile_id) ON DELETE CASCADE
    );
  `);

  return database;
}

export async function loadSavedEnrollmentProfile(): Promise<EnrollmentProfile | null> {
  const storedProfile = await SecureStore.getItemAsync(PROFILE_STORE_KEY);

  if (!storedProfile) {
    return null;
  }

  return JSON.parse(storedProfile) as EnrollmentProfile;
}

export async function saveEnrollmentProfile(input: {
  profileId?: string;
  speakerLabel: string;
  wakeWord?: string;
  sampleTarget: number;
}): Promise<EnrollmentProfile> {
  const database = await getDatabase();
  const currentTime = new Date().toISOString();
  const existingProfile = input.profileId ? await loadProfileById(input.profileId) : null;
  const profile: EnrollmentProfile = {
    profileId: input.profileId ?? existingProfile?.profileId ?? createId('profile'),
    speakerLabel: input.speakerLabel.trim(),
    wakeWord: input.wakeWord?.trim() || existingProfile?.wakeWord || 'STOP',
    sampleTarget: input.sampleTarget,
    createdAt: existingProfile?.createdAt ?? currentTime,
    updatedAt: currentTime,
  };

  await database.runAsync(
    `
      INSERT INTO enrollment_profiles (
        profile_id, speaker_label, wake_word, sample_target, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(profile_id) DO UPDATE SET
        speaker_label = excluded.speaker_label,
        wake_word = excluded.wake_word,
        sample_target = excluded.sample_target,
        updated_at = excluded.updated_at
    `,
    profile.profileId,
    profile.speakerLabel,
    profile.wakeWord,
    profile.sampleTarget,
    profile.createdAt,
    profile.updatedAt
  );

  await SecureStore.setItemAsync(PROFILE_STORE_KEY, JSON.stringify(profile));

  return profile;
}

async function loadProfileById(profileId: string): Promise<EnrollmentProfile | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<EnrollmentProfile>(
    'SELECT profile_id as profileId, speaker_label as speakerLabel, wake_word as wakeWord, sample_target as sampleTarget, created_at as createdAt, updated_at as updatedAt FROM enrollment_profiles WHERE profile_id = ?',
    profileId
  );

  return row ?? null;
}

export async function loadLatestEnrollmentProfile(): Promise<EnrollmentProfile | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<EnrollmentProfile>(
    'SELECT profile_id as profileId, speaker_label as speakerLabel, wake_word as wakeWord, sample_target as sampleTarget, created_at as createdAt, updated_at as updatedAt FROM enrollment_profiles ORDER BY updated_at DESC LIMIT 1'
  );

  return row ?? null;
}

export async function listEnrollmentSamples(profileId: string): Promise<EnrollmentSample[]> {
  const database = await getDatabase();

  return database.getAllAsync<EnrollmentSample>(
    `
      SELECT
        sample_id as sampleId,
        profile_id as profileId,
        sample_index as sampleIndex,
        uri,
        duration_millis as durationMillis,
        created_at as createdAt
      FROM enrollment_samples
      WHERE profile_id = ?
      ORDER BY sample_index ASC, created_at ASC
    `,
    profileId
  );
}

export async function saveEnrollmentSample(input: {
  profileId: string;
  uri: string;
  durationMillis: number;
}): Promise<EnrollmentSample> {
  const database = await getDatabase();
  const currentTime = new Date().toISOString();
  const currentSampleCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM enrollment_samples WHERE profile_id = ?',
    input.profileId
  );
  const sample: EnrollmentSample = {
    sampleId: createId('sample'),
    profileId: input.profileId,
    sampleIndex: Number(currentSampleCount?.count ?? 0) + 1,
    uri: input.uri,
    durationMillis: input.durationMillis,
    createdAt: currentTime,
  };

  await database.runAsync(
    `
      INSERT INTO enrollment_samples (
        sample_id, profile_id, sample_index, uri, duration_millis, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    sample.sampleId,
    sample.profileId,
    sample.sampleIndex,
    sample.uri,
    sample.durationMillis,
    sample.createdAt
  );

  return sample;
}

export async function saveSpeakerEmbedding(input: {
  profileId: string;
  vector: number[];
}): Promise<StoredSpeakerEmbedding> {
  const database = await getDatabase();
  const currentTime = new Date().toISOString();
  const normalizedVector = normalizeVector(input.vector);
  const embedding: StoredSpeakerEmbedding = {
    profileId: input.profileId,
    vector: normalizedVector,
    dimension: normalizedVector.length,
    createdAt: currentTime,
    updatedAt: currentTime,
  };

  await database.runAsync(
    `
      INSERT INTO speaker_embeddings (
        profile_id, vector_json, dimension, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(profile_id) DO UPDATE SET
        vector_json = excluded.vector_json,
        dimension = excluded.dimension,
        updated_at = excluded.updated_at
    `,
    embedding.profileId,
    serializeVector(embedding.vector),
    embedding.dimension,
    embedding.createdAt,
    embedding.updatedAt
  );

  return embedding;
}

export async function findClosestSpeakerEmbedding(
  vector: number[]
): Promise<ClosestSpeakerEmbedding | null> {
  const database = await getDatabase();
  const normalizedVector = normalizeVector(vector);
  const rows = await database.getAllAsync<{
    profileId: string;
    vectorJson: string;
    dimension: number;
    createdAt: string;
    updatedAt: string;
  }>(
    `
      SELECT
        profile_id as profileId,
        vector_json as vectorJson,
        dimension,
        created_at as createdAt,
        updated_at as updatedAt
      FROM speaker_embeddings
    `
  );

  let closest: ClosestSpeakerEmbedding | null = null;

  for (const row of rows) {
    const storedVector = deserializeVector(row.vectorJson);
    const similarity = cosineSimilarity(normalizedVector, storedVector);

    if (!closest || similarity > closest.similarity) {
      closest = {
        profileId: row.profileId,
        vector: storedVector,
        dimension: row.dimension,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        similarity,
      };
    }
  }

  return closest;
}
