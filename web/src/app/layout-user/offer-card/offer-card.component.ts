import { Component, input, OnChanges } from '@angular/core';
import { OfferSearchResult } from '@interfaces';
import { environment } from '@environment';

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrl: './offer-card.component.scss',
})
export class OfferCardComponent implements OnChanges {
  public readonly index = input<number>();
  public readonly offer = input<OfferSearchResult>();

  public readonly API_URL = environment.API_URL;
  public isNew = false;
  public imageFailed = false;
  public companyLogoFailed = false;
  public durationDays: number = null;

  public ngOnChanges(): void {
    this.imageFailed = false;
    this.companyLogoFailed = false;
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const offerDate = new Date(this.offer()?.createdAt);

    this.isNew = offerDate >= threeDaysAgo;
  }
}
