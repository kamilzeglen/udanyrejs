import {Component, Input} from '@angular/core';
import {Offer} from '@interfaces';
import {environment} from '@environment';

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrl: './offer-card.component.scss'
})
export class OfferCardComponent {
  @Input() index: number;
  @Input() offer: Offer;

  public API_URL = environment.API_URL;
}
