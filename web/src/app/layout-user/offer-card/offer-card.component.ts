import {Component, input} from '@angular/core';
import {Offer} from '@interfaces';
import {environment} from '@environment';

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrl: './offer-card.component.scss'
})
export class OfferCardComponent {
  public readonly index = input<number>();
  public readonly offer = input<Offer>();

  public API_URL = environment.API_URL;

  public isNewOffer(createdAt: Date): boolean {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const offerDate = new Date(createdAt);

    return offerDate >= threeDaysAgo;
  }
}
