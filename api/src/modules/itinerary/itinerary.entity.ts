import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import {Offer} from "@modules/offer/offer.entity";
import {City} from "@modules/city/city.entity";
import {User} from "@modules/user/user.entity";

@Entity()
export class Itinerary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  day: number;

  @Column({type: 'date'})
  date: string;

  @ManyToOne(() => City, {eager: true, nullable: true})
  @JoinColumn()
  city: City;
  @Column({type: 'uuid', nullable: true})
  cityId: string;

  @Column({type: 'varchar', length: 10, nullable: true})
  arrivalTime: string;

  @Column({type: 'varchar', length: 10, nullable: true})
  departureTime: string;

  @ManyToOne(() => Offer, (offer) => offer.itinerary, {onDelete: 'CASCADE', nullable: false})
  @JoinColumn()
  offer: Offer;
  @Column({type: 'uuid', nullable: false})
  offerId: string;

  @ManyToOne(() => User, {nullable: true})
  @JoinColumn()
  createdBy: User;
  @Column({type: 'uuid', nullable: true})
  createdById: string;

  @ManyToOne(() => User, {nullable: true})
  @JoinColumn()
  updatedBy: User;
  @Column({type: 'uuid', nullable: true})
  updatedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
