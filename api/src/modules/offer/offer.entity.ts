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

  @Column('decimal')
  price: number;

  @Column()
  shipName: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @OneToOne(() => ImageFile, (imageFile) => imageFile.offer, {eager: true, nullable: true})
  @JoinColumn()
  imageFile: ImageFile;

  @OneToOne(() => PdfFile, (pdfFile) => pdfFile.offer, {eager: true, nullable: true})
  @JoinColumn()
  pdfFile: PdfFile;

  @Column({type: 'json', nullable: true})
  itinerary: Itinerary[];

  @ManyToOne(() => User, {nullable: false})
  @JoinColumn()
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
