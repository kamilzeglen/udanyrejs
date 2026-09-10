import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Offer } from '@modules/offer/offer.entity';
import { OfferTermPrice } from '@modules/offer/offer-term-price.entity';

@Entity()
@Unique(['offerId', 'startDate', 'endDate'])
export class OfferTerm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Offer, (offer) => offer.terms, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  offer: Offer;
  @Column({ type: 'uuid', nullable: false })
  offerId: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @OneToMany(() => OfferTermPrice, (price) => price.offerTerm)
  prices: OfferTermPrice[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
