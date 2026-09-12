import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface ScrapedOfferDraftPriceRow {
  label: string;
  // Cena w euro (liczba zmiennoprzecinkowa), tak jak zwraca ją scraper -
  // konwersja na grosze dzieje się dopiero przy imporcie, tak samo jak przy
  // ręcznym dodawaniu oferty przez formularz.
  price: number;
  matchedCabinTypeId: string | null;
}

export interface ScrapedOfferDraftTerm {
  startDate: string;
  endDate: string;
  sourceUrl: string;
  pdfUrl: string | null;
  cabinPrices: ScrapedOfferDraftPriceRow[];
}

export interface ScrapedOfferDraftItineraryDay {
  day: number;
  date: string;
  city: string;
  cityId?: string;
  arrivalTime: string;
  departureTime: string;
}

@Entity()
export class ScrapedOfferDraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  shipName: string;

  @Column()
  companyNameRaw: string;

  // Podpowiedzi z fuzzy-matchu - świadomie bez FK: admin może przy imporcie
  // wybrać zupełnie inną firmę/statek, a stała referencja do skasowanej
  // firmy nie powinna blokować usunięcia tej firmy gdzie indziej w systemie.
  @Column({ type: 'uuid', nullable: true })
  matchedCompanyId: string;

  @Column({ type: 'uuid', nullable: true })
  matchedShipId: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'json' })
  itinerary: ScrapedOfferDraftItineraryDay[];

  @Column({ type: 'json' })
  terms: ScrapedOfferDraftTerm[];

  @Column({ type: 'varchar', unique: true })
  sourceUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
