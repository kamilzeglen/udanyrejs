import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import {City} from "../city/city.entity";
import {ImageFile} from "@modules/image-file/image-file.entity";
import {User} from "@modules/user/user.entity";

@Entity()
export class Attraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'varchar', length: 100})
  name: string;

  @Column({type: 'text', nullable: true})
  description: string;

  @ManyToOne(() => City, (city) => city.attractions, {nullable: false})
  @JoinColumn()
  city: City;
  @Column({type: 'uuid'})
  cityId: string;

  @OneToOne(() => ImageFile, (imageFile) => imageFile.ship, {eager: true, nullable: true, onDelete: 'CASCADE'})
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
