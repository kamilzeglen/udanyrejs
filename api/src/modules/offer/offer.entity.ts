import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '@modules/company/company.entity';
import { User } from '@modules/user/user.entity';
import { Itinerary } from '../../interfaces/Itinerary';
import { PdfFile } from '@modules/pdf-file/pdf-file.entity';
import { ImageFile } from '@modules/image-file/image-file.entity';
import { Ship } from '@modules/ship/ship.entity';
import { Destination } from '@modules/destination/destination.entity';
import { Category } from '@modules/category/category.entity';
import { ShareStats } from '@modules/share-stats/share-stat.entity';

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
  isPromotion: boolean;

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

  @Column('decimal')
  price: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @OneToOne(() => ImageFile, (imageFile) => imageFile.offer, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  imageFile: ImageFile;
  @Column({ type: 'uuid', nullable: true })
  imageFileId: string;

  @OneToOne(() => PdfFile, (pdfFile) => pdfFile.offer, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  pdfFile: PdfFile;
  @Column({ type: 'uuid', nullable: true })
  pdfFileId: string;

  @ManyToMany(() => Destination, (destination) => destination.offers, {
    eager: true,
  })
  @JoinTable({
    name: 'offer_destinations',
  })
  destinations: Destination[];

  @ManyToMany(() => Category, (category) => category.offers, { eager: true })
  @JoinTable({
    name: 'offer_categories',
  })
  categories: Category[];

  @Column({ type: 'json', nullable: true })
  itinerary: Itinerary[];

  @OneToOne(() => ShareStats, (shareStats) => shareStats.offer, {
    eager: true,
    nullable: true,
  })
  @JoinColumn()
  shareStats: ShareStats;
  @Column({ type: 'uuid', nullable: true })
  sharedStatId: string;

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
