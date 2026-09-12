import { OfferTerm } from './offer-term.entity';
import { OfferTermDto } from './dto/offer-term.dto';

export interface OfferTermMatch {
  existing: OfferTerm;
  dto: OfferTermDto;
}

export interface OfferTermDiff {
  toCreate: OfferTermDto[];
  toUpdate: OfferTermMatch[];
  toDelete: OfferTerm[];
}

export function diffOfferTerms(
  existingTerms: OfferTerm[],
  incomingTerms: OfferTermDto[],
): OfferTermDiff {
  const remainingExisting = [...existingTerms];
  const toCreate: OfferTermDto[] = [];
  const toUpdate: OfferTermMatch[] = [];

  for (const dto of incomingTerms) {
    const matchIndex = remainingExisting.findIndex((term) =>
      sameDateRange(term, dto),
    );

    if (matchIndex === -1) {
      toCreate.push(dto);
      continue;
    }

    const [existing] = remainingExisting.splice(matchIndex, 1);
    toUpdate.push({ existing, dto });
  }

  return { toCreate, toUpdate, toDelete: remainingExisting };
}

function sameDateRange(term: OfferTerm, dto: OfferTermDto): boolean {
  return (
    new Date(term.startDate).getTime() === new Date(dto.startDate).getTime() &&
    new Date(term.endDate).getTime() === new Date(dto.endDate).getTime()
  );
}
