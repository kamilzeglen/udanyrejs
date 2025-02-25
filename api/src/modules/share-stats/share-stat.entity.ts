import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Offer } from '@modules/offer/offer.entity';

@Entity()
export class ShareStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @OneToOne(() => Offer, (offer) => offer.shareStats)
  offer: Offer;
}
