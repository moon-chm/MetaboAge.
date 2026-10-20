/**
 * MetaboAge — Local-First IndexedDB Persistence Layer  (MTA-09)
 *
 * Pure async functions — no framework coupling, no global singletons.
 * Call openDb() once and pass the IDBDatabase handle to every other function.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type Sex = 'male' | 'female' | 'unspecified';
export type UnitSystem = 'metric' | 'imperial';

export interface UserProfile {
  id: 'profile';           // singleton record
  birthYear: number;
  biologicalSex: Sex;
  heightCm: number;
  preferredUnits: UnitSystem;
  createdAt: string;       // ISO-8601
  updatedAt: string;
}

export interface BiomarkerRecord {
  id: string;              // UUID
  recordedAt: string;      // ISO-8601 date (YYYY-MM-DD)
  createdAt: string;
  fastingGlucoseMgDl?: number;
  hba1cPct?: number;
  triglyceridesMgDl?: number;
  hdlMgDl?: number;
  ldlMgDl?: number;
  systolicBpMmHg?: number;
  diastolicBpMmHg?: number;
  waistCm?: number;
  sourceNotes?: string;
}

export interface DailyHabit {
  id: string;              // UUID
  logDate: string;         // ISO-8601 date (YYYY-MM-DD)
  createdAt: string;
  fastingWindowMinutes?: number;
  movementMinutes?: number;
  sleepMinutes?: number;
  sleepQualityRating?: 1 | 2 | 3 | 4 | 5;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DB_NAME    = 'metaboage-v1';
const DB_VERSION = 1;

const STORE_PROFILE   = 'profile';
const STORE_BIOMARKERS = 'biomarker_records';
const STORE_HABITS    = 'daily_habits';

// ── Open / upgrade ────────────────────────────────────────────────────────────

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_PROFILE)) {
        db.createObjectStore(STORE_PROFILE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_BIOMARKERS)) {
        const bStore = db.createObjectStore(STORE_BIOMARKERS, { keyPath: 'id' });
        bStore.createIndex('idx_recordedAt', 'recordedAt', { unique: true });
      }

      if (!db.objectStoreNames.contains(STORE_HABITS)) {
        const hStore = db.createObjectStore(STORE_HABITS, { keyPath: 'id' });
        hStore.createIndex('idx_logDate', 'logDate', { unique: true });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// ── Generic helpers ───────────────────────────────────────────────────────────

function txAll<T>(
  db: IDBDatabase,
  store: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const t   = db.transaction(store, mode);
    const s   = t.objectStore(store);
    const req = fn(s);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror   = () => reject(req.error);
  });
}

function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ── User Profile CRUD ─────────────────────────────────────────────────────────

export function getProfile(db: IDBDatabase): Promise<UserProfile | undefined> {
  return txAll(db, STORE_PROFILE, 'readonly', (s) => s.get('profile'));
}

export function saveProfile(
  db: IDBDatabase,
  data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<IDBValidKey> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE_PROFILE, 'readwrite');
    const s = t.objectStore(STORE_PROFILE);
    const getReq = s.get('profile');
    getReq.onsuccess = () => {
      const existing = getReq.result as UserProfile | undefined;
      const record: UserProfile = {
        id:         'profile',
        createdAt:  existing?.createdAt ?? now(),
        updatedAt:  now(),
        ...data,
      };
      const putReq = s.put(record);
      putReq.onsuccess = () => resolve(putReq.result);
      putReq.onerror   = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

// ── Biomarker CRUD ────────────────────────────────────────────────────────────

export function saveBiomarker(
  db: IDBDatabase,
  data: Omit<BiomarkerRecord, 'id' | 'createdAt'>
): Promise<BiomarkerRecord> {
  const record: BiomarkerRecord = { id: uuid(), createdAt: now(), ...data };
  return new Promise((resolve, reject) => {
    const req = db
      .transaction(STORE_BIOMARKERS, 'readwrite')
      .objectStore(STORE_BIOMARKERS)
      .add(record);
    req.onsuccess = () => resolve(record);
    req.onerror   = () => reject(req.error);
  });
}

export function getBiomarkers(
  db: IDBDatabase,
  fromDate?: string,
  toDate?: string
): Promise<BiomarkerRecord[]> {
  return new Promise((resolve, reject) => {
    const t   = db.transaction(STORE_BIOMARKERS, 'readonly');
    const idx = t.objectStore(STORE_BIOMARKERS).index('idx_recordedAt');

    const range =
      fromDate && toDate
        ? IDBKeyRange.bound(fromDate, toDate, false, false)
        : fromDate
        ? IDBKeyRange.lowerBound(fromDate)
        : toDate
        ? IDBKeyRange.upperBound(toDate)
        : undefined;

    const req = range ? idx.getAll(range) : idx.getAll();
    req.onsuccess = () => resolve(req.result as BiomarkerRecord[]);
    req.onerror   = () => reject(req.error);
  });
}

export function deleteBiomarker(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = db
      .transaction(STORE_BIOMARKERS, 'readwrite')
      .objectStore(STORE_BIOMARKERS)
      .delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

// ── Daily Habits CRUD ─────────────────────────────────────────────────────────

export function saveDailyHabit(
  db: IDBDatabase,
  data: Omit<DailyHabit, 'id' | 'createdAt'>
): Promise<DailyHabit> {
  // Upsert by logDate — remove any existing record for the same date first
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE_HABITS, 'readwrite');
    const s = t.objectStore(STORE_HABITS);
    const idx = s.index('idx_logDate');
    const getReq = idx.get(data.logDate);

    getReq.onsuccess = () => {
      const existing = getReq.result as DailyHabit | undefined;
      if (existing) s.delete(existing.id);

      const record: DailyHabit = { id: uuid(), createdAt: now(), ...data };
      const addReq = s.add(record);
      addReq.onsuccess = () => resolve(record);
      addReq.onerror   = () => reject(addReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export function getDailyHabits(
  db: IDBDatabase,
  lastNDays = 90
): Promise<DailyHabit[]> {
  const from = new Date();
  from.setDate(from.getDate() - lastNDays);
  const fromStr = from.toISOString().slice(0, 10);
  const toStr   = new Date().toISOString().slice(0, 10);

  return new Promise((resolve, reject) => {
    const t   = db.transaction(STORE_HABITS, 'readonly');
    const idx = t.objectStore(STORE_HABITS).index('idx_logDate');
    const req = idx.getAll(IDBKeyRange.bound(fromStr, toStr));
    req.onsuccess = () => resolve(req.result as DailyHabit[]);
    req.onerror   = () => reject(req.error);
  });
}

// ── Export ────────────────────────────────────────────────────────────────────

export async function exportAllData(db: IDBDatabase): Promise<void> {
  const profile    = await getProfile(db);
  const biomarkers = await getBiomarkers(db);
  const habits     = await getDailyHabits(db, 3650);

  const jsonBlob = new Blob(
    [JSON.stringify({ exportedAt: now(), profile, biomarkers, habits }, null, 2)],
    { type: 'application/json' }
  );

  const csvBiomarkers = [
    'id,recordedAt,fastingGlucoseMgDl,hba1cPct,triglyceridesMgDl,hdlMgDl,ldlMgDl,systolicBpMmHg,diastolicBpMmHg,waistCm',
    ...biomarkers.map((b) =>
      [b.id, b.recordedAt, b.fastingGlucoseMgDl ?? '', b.hba1cPct ?? '',
       b.triglyceridesMgDl ?? '', b.hdlMgDl ?? '', b.ldlMgDl ?? '',
       b.systolicBpMmHg ?? '', b.diastolicBpMmHg ?? '', b.waistCm ?? ''].join(',')
    ),
  ].join('\n');

  const csvHabits = [
    'id,logDate,fastingWindowMinutes,movementMinutes,sleepMinutes,sleepQualityRating',
    ...habits.map((h) =>
      [h.id, h.logDate, h.fastingWindowMinutes ?? '', h.movementMinutes ?? '',
       h.sleepMinutes ?? '', h.sleepQualityRating ?? ''].join(',')
    ),
  ].join('\n');

  // Trigger browser downloads
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadBlob(jsonBlob, `MetaboAge_Backup_${dateStr}.json`);
  downloadBlob(
    new Blob([csvBiomarkers], { type: 'text/csv' }),
    `MetaboAge_Biomarkers_${dateStr}.csv`
  );
  downloadBlob(
    new Blob([csvHabits], { type: 'text/csv' }),
    `MetaboAge_Habits_${dateStr}.csv`
  );
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ── Purge — IRREVERSIBLE ──────────────────────────────────────────────────────

export function purgeAllData(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const stores = [STORE_PROFILE, STORE_BIOMARKERS, STORE_HABITS];
    const t = db.transaction(stores, 'readwrite');
    let pending = stores.length;
    let failed  = false;

    const done = () => {
      if (failed) return;
      pending -= 1;
      if (pending === 0) resolve();
    };

    for (const name of stores) {
      const req = t.objectStore(name).clear();
      req.onsuccess = done;
      req.onerror   = () => { failed = true; reject(req.error); };
    }
  });
}

// ── Streak helper ─────────────────────────────────────────────────────────────

/** Returns the current consecutive daily-habit logging streak (in days). */
export function computeStreak(habits: DailyHabit[]): number {
  if (habits.length === 0) return 0;

  const dates = new Set(habits.map((h) => h.logDate));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dates.has(key)) {
      streak += 1;
    } else if (i === 0) {
      // Today not yet logged — start counting from yesterday
      continue;
    } else {
      break;
    }
  }
  return streak;
}
