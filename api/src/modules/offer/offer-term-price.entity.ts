import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { OfferTerm } from '@modules/offer/offer-term.entity';
import { CabinType } from '@modules/cabin-type/cabin-type.entity';

@Entity()
@Unique(['offerTermId', 'cabinTypeId'])
export class OfferTermPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OfferTerm, (offerTerm) => offerTerm.prices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  offerTerm: OfferTerm;
  @Column({ type: 'uuid', nullable: false })
  offerTermId: string;

  @ManyToOne(() => CabinType, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: true,
  })
  @JoinColumn()
  cabinType: CabinType;
  @Column({ type: 'uuid', nullable: false })
  cabinTypeId: string;

  // Cena w groszach (najmniejsza jednostka waluty) - nie w złotych.
  @Column('integer')
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
