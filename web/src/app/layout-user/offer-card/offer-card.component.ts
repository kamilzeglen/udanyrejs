import { Component, Input, OnChanges } from '@angular/core';
import { OfferSearchResult } from '@interfaces';
import { environment } from '@environment';
import { computeOfferDurationDays } from '@core/utils/compute-offer-duration.util';

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrl: './offer-card.component.scss',
})
export class OfferCardComponent implements OnChanges {
  @Input() public index = 0;
  @Input() public offer: OfferSearchResult;

  public readonly API_URL = environment.API_URL;
  public isNew = false;
  public companyLogoFailed = false;
  public durationDays: number = null;

  public ngOnChanges(): void {
    this.companyLogoFailed = false;
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const offerDate = new Date(this.offer?.createdAt);

    this.isNew = offerDate >= threeDaysAgo;
    this.durationDays = computeOfferDurationDays(this.offer?.startDate, this.offer?.endDate);
  }
}
