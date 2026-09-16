import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Offer } from '@modules/offer/offer.entity';
import { User } from '@modules/user/user.entity';
import { ImageFile } from '@modules/image-file/image-file.entity';

@Entity()
export class Destination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'varchar', length: 120, unique: true, nullable: true })
  slug: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  seoTitle: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seoDescription: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToOne(() => ImageFile, (imageFile) => imageFile.destination, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  imageFile: ImageFile;
  @Column({ type: 'uuid', nullable: true })
  imageFileId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  showInMenu: boolean;

  @ManyToMany(() => Offer, (offer) => offer.destinations)
  offers: Offer[];

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
