export interface RawItineraryRow {
  dayText: string;
  dateText: string;
  cityText: string;
  arrivalText: string;
  departureText: string;
}

export interface RawCabinGroupRow {
  labelText: string;
  minPriceText: string;
}

export interface RawOtherTermLink {
  href: string;
  startDateText: string;
  endDateText: string;
  isDifferentRoute: boolean;
}

export interface RawOfferPage {
  titleText: string;
  shipNameText: string;
  companyHrefSlug: string;
  ogImageContent: string;
  pdfHref: string;
  itineraryRows: RawItineraryRow[];
  cabinGroupRows: RawCabinGroupRow[];
  otherTermLinks: RawOtherTermLink[];
}

export interface RawPriceCheckPage {
  pageFound: boolean;
  cabinGroupRows: RawCabinGroupRow[];
}

export interface RawListingPage {
  offerHrefs: string[];
}
