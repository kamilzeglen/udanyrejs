import {Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {Company} from "../../interfaces/company";
import {ItineraryDay} from "../../interfaces/Itinerary";

@Entity()
export class Offer {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: Company,
  })
  company: Company;

  @Column('decimal')
  price: number;

  @Column()
  shipName: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  imageFileName: string;

  @Column()
  pdfFileName: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  itinerary: ItineraryDay[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
