import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Offer } from '@modules/offer/offer.entity';
import { Ship } from '@modules/ship/ship.entity';
import { Company } from '@modules/company/company.entity';
import { User } from '@modules/user/user.entity';

@Entity()
export class ImageFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  url: string;

  @OneToOne(() => Offer, (offer) => offer.imageFile, { nullable: true })
  offer: Offer;

  @OneToOne(() => Ship, (ship) => ship.imageFile, { nullable: true })
  ship: Ship;

  @OneToOne(() => Company, (company) => company.imageFile, { nullable: true })
  company: Company;

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
