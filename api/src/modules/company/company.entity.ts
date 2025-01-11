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
  UpdateDateColumn
} from "typeorm";
import {Offer} from "@modules/offer/offer.entity";
import {Ship} from "@modules/ship/ship.entity";
import {ImageFile} from "@modules/image-file/image-file.entity";
import {User} from "@modules/user/user.entity";

@Entity()
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  key: string;

  @Column({type: 'text', nullable: true})
  description: string;

  @OneToMany(() => Offer, (offer) => offer.company)
  offers: Offer[];

  @Column({type: 'json', nullable: true})
  priceIncludes: string[];

  @Column({type: 'json', nullable: true})
  priceExcludes: string[];

  @OneToMany(() => Ship, (ship) => ship.company)
  ships: Ship[];

  @OneToOne(() => ImageFile, (imageFile) => imageFile.company, {eager: true, nullable: true, onDelete: 'CASCADE'})
  @JoinColumn()
  imageFile: ImageFile;
  @Column({type: 'uuid', nullable: true})
  imageFileId: string;

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
