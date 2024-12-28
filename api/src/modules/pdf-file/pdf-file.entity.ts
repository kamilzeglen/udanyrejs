import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {Offer} from "@modules/offer/offer.entity";

@Entity()
export class PdfFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({type: 'varchar', length: 255})
  originalName: string;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @OneToOne(() => Offer, (offer) => offer.pdfFile, {nullable: false})
  @JoinColumn()
  offer: Offer;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
