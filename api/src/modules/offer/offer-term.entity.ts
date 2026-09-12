import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Offer } from '@modules/offer/offer.entity';
import { OfferTermPrice } from '@modules/offer/offer-term-price.entity';
import { Category } from '@modules/category/category.entity';

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

  @Column({ type: 'varchar', nullable: true })
  sourceUrl: string;

  @OneToMany(() => OfferTermPrice, (price) => price.offerTerm)
  prices: OfferTermPrice[];

  @ManyToMany(() => Category, (category) => category.terms, { eager: true })
  @JoinTable({ name: 'offer_term_categories' })
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
