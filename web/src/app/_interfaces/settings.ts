export type SyncStatus = 'running' | 'success' | 'error';

export interface Settings {
  id: string;
  scrapingEnabled: boolean;
  scrapeHour: number;
  scrapeMinute: number;
  syncRequestDelayMs: number;
  lastSyncStartedAt: string;
  lastSyncFinishedAt: string;
  lastSyncStatus: SyncStatus;
  lastSyncSummary: string;
  termCleanupEnabled: boolean;
  cleanupHour: number;
  cleanupMinute: number;
  updatedAt: string;
}
