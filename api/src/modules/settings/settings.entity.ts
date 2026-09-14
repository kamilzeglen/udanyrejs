import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type SyncStatus = 'running' | 'success' | 'error';

@Entity()
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  scrapingEnabled: boolean;

  @Column({ type: 'smallint', default: 4 })
  scrapeHour: number;

  @Column({ type: 'smallint', default: 0 })
  scrapeMinute: number;

  @Column({ default: 3000 })
  syncRequestDelayMs: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastSyncStartedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastSyncFinishedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  lastSyncStatus: SyncStatus;

  @Column({ type: 'text', nullable: true })
  lastSyncSummary: string;

  @Column({ default: false })
  termCleanupEnabled: boolean;

  @Column({ type: 'smallint', default: 3 })
  cleanupHour: number;

  @Column({ type: 'smallint', default: 0 })
  cleanupMinute: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
