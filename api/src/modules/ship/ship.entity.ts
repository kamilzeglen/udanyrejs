import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {Company} from "@modules/company/company.entity";
import {Offer} from "@modules/offer/offer.entity";

@Entity()
export class Ship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'varchar', length: 100})
  name: string;

  @ManyToOne(() => Company, (company) => company.ships, {eager: true, nullable: false})
  @JoinColumn()
  company: Company;
  @Column({type: 'uuid', nullable: false})
  companyId: string;

  @OneToMany(() => Offer, (offer) => offer.ship)
  offers: Offer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
