import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OfferTerm } from '@modules/offer/offer-term.entity';
import { User } from '@modules/user/user.entity';

@Entity()
export class PdfFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  url: string;

  @Column({ type: 'uuid' })
  termId: string;

  // @JoinColumn() bez nazwy domyślnie mapuje na "termId" - dokładnie tę
  // kolumnę zadeklarowaną wyżej. To ta strona relacji fizycznie trzyma FK
  // (ten sam wzorzec co ShareStats.term).
  @OneToOne(() => OfferTerm, (term) => term.pdfFile, { nullable: false })
  @JoinColumn()
  term: OfferTerm;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  createdBy: User;
  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  updatedBy: User;
  @Column({ type: 'uuid', nullable: true })
  updatedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
