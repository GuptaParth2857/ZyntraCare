export type HealthMetricType = 'steps' | 'heart_rate' | 'blood_glucose' | 'blood_pressure' | 'weight' | 'height' | 'sleep';

export interface HealthDataPoint {
  value: number;
  timestamp: Date;
  source: string;
  type: HealthMetricType;
}

interface HeartRateSample {
  value: number;
  timestamp: Date;
}

interface GlucoseSample {
  value: number;
  timestamp: Date;
}

interface BloodPressureSample {
  systolic: number;
  diastolic: number;
  timestamp: Date;
}

interface SleepStage {
  startTime: Date;
  endTime: Date;
  stage: string;
}

interface SyncAllResult {
  steps: number;
  heartRate: HeartRateSample[];
  glucose: GlucoseSample[];
  bloodPressure: BloodPressureSample[];
  weight: number | null;
}

type Platform = 'android' | 'ios' | 'web';

const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.activity.write',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.write',
  'https://www.googleapis.com/auth/fitness.blood_glucose.read',
  'https://www.googleapis.com/auth/fitness.blood_pressure.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
];

const OAUTH2_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_STORAGE_KEY = 'google_fit_tokens';
const CLIENT_ID_KEY = 'google_fit_client_id';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'web';
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  return 'web';
}

function getStoredTokens(): { accessToken: string; refreshToken?: string } | null {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({ accessToken, refreshToken }));
}

function clearTokens(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function buildAuthUrl(redirectUri: string): string {
  const clientId = localStorage.getItem(CLIENT_ID_KEY) || '';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: GOOGLE_FIT_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });
  return `${OAUTH2_URL}?${params.toString()}`;
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const clientId = localStorage.getItem(CLIENT_ID_KEY) || '';
  const clientSecret = '';
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    storeTokens(data.access_token, data.refresh_token || refreshToken);
    return data.access_token;
  } catch {
    return null;
  }
}

async function getValidAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  if (!tokens) return null;
  if (tokens.refreshToken) {
    const refreshed = await refreshAccessToken(tokens.refreshToken);
    if (refreshed) return refreshed;
  }
  return tokens.accessToken;
}

async function queryGoogleFit<T>(accessToken: string, dataSourceId: string, startDate: Date, endDate: Date, mapFn: (point: any) => T): Promise<T[]> {
  const body = {
    aggregateBy: [{ dataSourceId }],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startDate.getTime(),
    endTimeMillis: endDate.getTime(),
  };
  const res = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Google Fit API error: ${res.status}`);
  const data = await res.json();
  const results: T[] = [];
  for (const bucket of data.bucket || []) {
    for (const dataset of bucket.dataset || []) {
      for (const point of dataset.point || []) {
        results.push(mapFn(point));
      }
    }
  }
  return results;
}

export class HealthConnectManager {
  private platform: Platform;

  constructor() {
    this.platform = detectPlatform();
  }

  isAvailable(): boolean {
    if (this.platform === 'android') {
      return typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
    }
    if (this.platform === 'ios') {
      return typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
    }
    return true;
  }

  async requestPermissions(scopes: string[]): Promise<boolean> {
    if (this.platform === 'web') {
      const clientId = localStorage.getItem(CLIENT_ID_KEY);
      if (!clientId) {
        console.warn('Google Fit client ID not set. Set it via setGoogleFitClientId().');
        return false;
      }
      const redirectUri = window.location.origin + '/oauth2/callback';
      const authUrl = buildAuthUrl(redirectUri);
      window.open(authUrl, '_blank', 'width=600,height=700');
      return true;
    }
    if (this.platform === 'android' && typeof (window as any).HealthConnect !== 'undefined') {
      try {
        await (window as any).HealthConnect.requestPermissions({ scopes });
        return true;
      } catch {
        return false;
      }
    }
    if (this.platform === 'ios' && typeof (window as any).HealthKit !== 'undefined') {
      try {
        await (window as any).HealthKit.requestAuthorization({ scopes });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  async readSteps(startDate: Date, endDate: Date): Promise<number> {
    if (this.platform === 'web') {
      const token = await getValidAccessToken();
      if (!token) return 0;
      const points = await queryGoogleFit<{ value: number; timestamp: number }>(
        token,
        'derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas',
        startDate,
        endDate,
        (point) => ({
          value: point.value?.[0]?.fpVal || 0,
          timestamp: parseInt(point.startTimeNanos) / 1e6,
        })
      );
      return points.reduce((sum, p) => sum + p.value, 0);
    }
    return 0;
  }

  async readHeartRate(startDate: Date, endDate: Date): Promise<HeartRateSample[]> {
    if (this.platform === 'web') {
      const token = await getValidAccessToken();
      if (!token) return [];
      return queryGoogleFit<HeartRateSample>(
        token,
        'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
        startDate,
        endDate,
        (point) => ({
          value: point.value?.[0]?.fpVal || 0,
          timestamp: new Date(parseInt(point.startTimeNanos) / 1e6),
        })
      );
    }
    return [];
  }

  async readBloodGlucose(startDate: Date, endDate: Date): Promise<GlucoseSample[]> {
    if (this.platform === 'web') {
      const token = await getValidAccessToken();
      if (!token) return [];
      return queryGoogleFit<GlucoseSample>(
        token,
        'derived:com.google.blood_glucose:com.google.android.gms:merge_blood_glucose',
        startDate,
        endDate,
        (point) => ({
          value: point.value?.[0]?.fpVal || 0,
          timestamp: new Date(parseInt(point.startTimeNanos) / 1e6),
        })
      );
    }
    return [];
  }

  async readBloodPressure(startDate: Date, endDate: Date): Promise<BloodPressureSample[]> {
    if (this.platform === 'web') {
      const token = await getValidAccessToken();
      if (!token) return [];
      return queryGoogleFit<BloodPressureSample>(
        token,
        'derived:com.google.blood_pressure:com.google.android.gms:merge_blood_pressure',
        startDate,
        endDate,
        (point) => ({
          systolic: point.value?.[0]?.fpVal || 0,
          diastolic: point.value?.[1]?.fpVal || 0,
          timestamp: new Date(parseInt(point.startTimeNanos) / 1e6),
        })
      );
    }
    return [];
  }

  async readWeight(): Promise<number | null> {
    if (this.platform === 'web') {
      const token = await getValidAccessToken();
      if (!token) return null;
      const now = new Date();
      const startDate = new Date(now.getFullYear() - 1, 0, 1);
      const points = await queryGoogleFit<{ value: number; timestamp: number }>(
        token,
        'derived:com.google.weight:com.google.android.gms:merge_weight',
        startDate,
        now,
        (point) => ({
          value: point.value?.[0]?.fpVal || 0,
          timestamp: parseInt(point.startTimeNanos) / 1e6,
        })
      );
      if (points.length === 0) return null;
      points.sort((a, b) => b.timestamp - a.timestamp);
      return points[0].value;
    }
    return null;
  }

  async readSleep(startDate: Date, endDate: Date): Promise<SleepStage[]> {
    if (this.platform === 'web') {
      const token = await getValidAccessToken();
      if (!token) return [];
      return queryGoogleFit<SleepStage>(
        token,
        'derived:com.google.sleep.segment:com.google.android.gms:merge_sleep_segment',
        startDate,
        endDate,
        (point) => ({
          startTime: new Date(parseInt(point.startTimeNanos) / 1e6),
          endTime: new Date(parseInt(point.endTimeNanos) / 1e6),
          stage: this.mapSleepStage(point.value?.[0]?.intVal || 0),
        })
      );
    }
    return [];
  }

  private mapSleepStage(stageValue: number): string {
    const stages: Record<number, string> = {
      1: 'awake',
      2: 'light',
      3: 'deep',
      4: 'rem',
    };
    return stages[stageValue] || 'unknown';
  }

  async writeSteps(steps: number, date: Date): Promise<boolean> {
    if (this.platform === 'web') {
      const token = await getValidAccessToken();
      if (!token) return false;
      try {
        const res = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            aggregateBy: [{ dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas' }],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: date.getTime(),
            endTimeMillis: date.getTime() + 86400000,
          }),
        });
        return res.ok;
      } catch {
        return false;
      }
    }
    return false;
  }

  async writeHeartRate(value: number, timestamp: Date): Promise<boolean> {
    if (this.platform === 'web') {
      const token = await getValidAccessToken();
      if (!token) return false;
      try {
        const res = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataSources', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dataStreamName: 'heartRate',
            type: 'raw',
            application: { name: 'ZyntraCare' },
            dataType: {
              name: 'com.google.heart_rate.bpm',
              field: [{ name: 'bpm', format: 'floatPoint' }],
            },
          }),
        });
        return res.ok;
      } catch {
        return false;
      }
    }
    return false;
  }

  async syncAll(): Promise<SyncAllResult> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 86400000);
    const [steps, heartRate, glucose, bloodPressure, weight] = await Promise.all([
      this.readSteps(startDate, endDate),
      this.readHeartRate(startDate, endDate),
      this.readBloodGlucose(startDate, endDate),
      this.readBloodPressure(startDate, endDate),
      this.readWeight(),
    ]);
    return { steps, heartRate, glucose, bloodPressure, weight };
  }

  async disconnect(): Promise<void> {
    clearTokens();
    if (this.platform === 'android' && typeof (window as any).HealthConnect !== 'undefined') {
      try {
        await (window as any).HealthConnect.revokePermissions();
      } catch {
      }
    }
    if (this.platform === 'ios' && typeof (window as any).HealthKit !== 'undefined') {
      try {
        await (window as any).HealthKit.revokeAuthorization();
      } catch {
      }
    }
  }

  setGoogleFitClientId(clientId: string): void {
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
}
