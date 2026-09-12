import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OfferTerm } from '@modules/offer/offer-term.entity';

@Entity()
export class ShareStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  termId: string;

  @Column()
  offerId: string;

  @Column({ default: 0 })
  webClicks: number;

  @Column({ default: 0 })
  facebookClicks: number;

  @Column({ default: 0 })
  instagramClicks: number;

  @Column({ default: 0 })
  tiktokClicks: number;

  // @JoinColumn() bez nazwy domyślnie mapuje na "termId" - dokładnie tę
  // kolumnę zadeklarowaną wyżej. To ta strona relacji fizycznie trzyma FK.
  @OneToOne(() => OfferTerm, (term) => term.shareStats)
  @JoinColumn()
  term: OfferTerm;
}
