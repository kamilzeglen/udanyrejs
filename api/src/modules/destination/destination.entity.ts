import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn, ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {Offer} from "@modules/offer/offer.entity";
import {User} from "@modules/user/user.entity";

@Entity()
export class Destination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // np. "Wyspy Kanaryjskie", "Morze Śródziemne"

  @ManyToMany(() => Offer, (offer) => offer.destinations, {cascade: true})
  offers: Offer[];

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
