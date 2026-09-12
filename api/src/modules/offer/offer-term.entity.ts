import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Offer } from '@modules/offer/offer.entity';
import { OfferTermPrice } from '@modules/offer/offer-term-price.entity';
import { Category } from '@modules/category/category.entity';
import { ShareStats } from '@modules/share-stats/share-stat.entity';
import { PdfFile } from '@modules/pdf-file/pdf-file.entity';

@Entity()
@Unique(['offerId', 'startDate', 'endDate'])
export class OfferTerm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Offer, (offer) => offer.terms, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  offer: Offer;
  @Column({ type: 'uuid', nullable: false })
  offerId: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ type: 'varchar', nullable: true })
  sourceUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => OfferTermPrice, (price) => price.offerTerm)
  prices: OfferTermPrice[];

  @ManyToMany(() => Category, (category) => category.terms, { eager: true })
  @JoinTable({ name: 'offer_term_categories' })
  categories: Category[];

  // FK żyje po stronie share_stats.termId (patrz ShareStats.term), nie tutaj -
  // to czysto odwrotna strona relacji, bez własnej kolumny.
  @OneToOne(() => ShareStats, (shareStats) => shareStats.term, {
    nullable: true,
  })
  shareStats: ShareStats;

  // FK żyje po stronie pdf_file.termId (patrz PdfFile.term) - jeden termin,
  // jeden plik PDF, tak samo jak wcześniej PdfFile był 1:1 z Offer.
  @OneToOne(() => PdfFile, (pdfFile) => pdfFile.term, { nullable: true })
  pdfFile: PdfFile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
