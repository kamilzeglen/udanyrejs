import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OfferTerm } from '@modules/offer/offer-term.entity';
import { User } from '@modules/user/user.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  position: number;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isVisible: boolean;

  @ManyToMany(() => OfferTerm, (term) => term.categories, { cascade: true })
  terms: OfferTerm[];

  // Nie jest kolumną - liczone przez CategoryService.findAll() na podstawie
  // COUNT(DISTINCT term.offerId), więc opcjonalne i tylko dla odczytu.
  offerCount?: number;

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
