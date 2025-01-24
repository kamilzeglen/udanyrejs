import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '@modules/company/company.entity';
import { Offer } from '@modules/offer/offer.entity';
import { ImageFile } from '@modules/image-file/image-file.entity';
import { User } from '@modules/user/user.entity';

@Entity()
export class Ship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  yearBuilt: number;

  @Column({ type: 'int', nullable: true })
  renovation: number;

  @Column({ type: 'int', nullable: true })
  speed: number;

  @Column({ type: 'decimal', nullable: true })
  length: number;

  @Column({ type: 'decimal', nullable: true })
  width: number;

  @Column({ type: 'decimal', nullable: true })
  tonnage: number;

  @Column({ type: 'int', nullable: true })
  passengersDecks: number;

  @Column({ type: 'int', nullable: true })
  passengers: number;

  @Column({ type: 'int', nullable: true })
  crew: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string;

  @OneToMany(() => Offer, (offer) => offer.ship)
  offers: Offer[];

  @ManyToOne(() => Company, (company) => company.ships, {
    eager: true,
    nullable: false,
  })
  @JoinColumn()
  company: Company;
  @Column({ type: 'uuid', nullable: false })
  companyId: string;

  @OneToOne(() => ImageFile, (imageFile) => imageFile.ship, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  imageFile: ImageFile;
  @Column({ type: 'uuid', nullable: true })
  imageFileId: string;

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
