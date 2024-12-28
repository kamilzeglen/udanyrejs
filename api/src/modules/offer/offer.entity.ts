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
import {Company} from "@modules/company/company.entity";
import {User} from "@modules/user/user.entity";
import {Itinerary} from "../../interfaces/Itinerary";
import {PdfFile} from "@modules/pdf-file/pdf-file.entity";
import {ImageFile} from "@modules/image-file/image-file.entity";
import {Ship} from "@modules/ship/ship.entity";

@Entity()
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({nullable: true})
  offerUrl: string;

  @Column({default: false})
  syncData: boolean;

  @ManyToOne(() => Company, (company) => company.offers, {eager: true, nullable: false})
  @JoinColumn()
  company: Company;
  @Column({type: 'uuid', nullable: false})
  companyId: string;

  @ManyToOne(() => Ship, (ship) => ship.offers, {eager: true, nullable: false, onDelete: 'CASCADE'})
  @JoinColumn()
  ship: Ship;
  @Column({type: 'uuid', nullable: false})
  shipId: string;

  @Column('decimal')
  price: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @OneToOne(() => ImageFile, (imageFile) => imageFile.offer, {eager: true, nullable: true, onDelete: 'CASCADE'})
  @JoinColumn()
  imageFile: ImageFile;
  @Column({type: 'uuid', nullable: true})
  imageFileId: string;

  @OneToOne(() => PdfFile, (pdfFile) => pdfFile.offer, {eager: true, nullable: true, onDelete: 'CASCADE'})
  @JoinColumn()
  pdfFile: PdfFile;
  @Column({type: 'uuid', nullable: true})
  pdfFileId: string;

  @Column({type: 'json', nullable: true})
  itinerary: Itinerary[];

  @ManyToOne(() => User, {nullable: false})
  @JoinColumn()
  createdBy: User;
  @Column({type: 'uuid', nullable: true})
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
