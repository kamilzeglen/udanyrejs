import {
  Column,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {Attraction} from "@modules/attraction/attraction.entity";
import {Itinerary} from "@modules/itinerary/itinerary.entity";
import {ImageFile} from "@modules/image-file/image-file.entity";
import {User} from "@modules/user/user.entity";

@Entity()
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'varchar', length: 100})
  name: string;

  @Column({type: 'varchar', length: 255, nullable: true})
  description: string;

  @Column({type: 'varchar', length: 255, nullable: true})
  country: string;

  @OneToMany(() => Attraction, (attraction) => attraction.city, {eager: true})
  attractions: Attraction[];

  @OneToMany(() => Itinerary, (itinerary) => itinerary.city)
  itineraries: Itinerary[];

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
