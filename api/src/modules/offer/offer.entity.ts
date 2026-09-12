import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '@modules/company/company.entity';
import { User } from '@modules/user/user.entity';
import { Itinerary } from '../../interfaces/Itinerary';
import { ImageFile } from '@modules/image-file/image-file.entity';
import { Ship } from '@modules/ship/ship.entity';
import { Destination } from '@modules/destination/destination.entity';
import { OfferTerm } from '@modules/offer/offer-term.entity';

@Entity()
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  offerUrl: string;

  @Column({ default: false })
  syncData: boolean;

  @Column({ default: false })
  isRecommended: boolean;

  @ManyToOne(() => Company, (company) => company.offers, {
    eager: true,
    nullable: false,
  })
  @JoinColumn()
  company: Company;
  @Column({ type: 'uuid', nullable: false })
  companyId: string;

  @ManyToOne(() => Ship, (ship) => ship.offers, {
    eager: true,
    nullable: false,
  })
  @JoinColumn()
  ship: Ship;
  @Column({ type: 'uuid', nullable: false })
  shipId: string;

  @OneToMany(() => OfferTerm, (term) => term.offer)
  terms: OfferTerm[];

  @OneToOne(() => ImageFile, (imageFile) => imageFile.offer, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  imageFile: ImageFile;
  @Column({ type: 'uuid', nullable: true })
  imageFileId: string;

  @ManyToMany(() => Destination, (destination) => destination.offers, {
    eager: true,
  })
  @JoinTable({
    name: 'offer_destinations',
  })
  destinations: Destination[];

  @Column({ type: 'json', nullable: true })
  itinerary: Itinerary[];

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
