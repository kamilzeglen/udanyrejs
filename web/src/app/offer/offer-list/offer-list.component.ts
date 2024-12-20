import {Component, OnInit} from '@angular/core';
import {OfferFacade} from 'src/app/_state/offer';

@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrl: './offer-list.component.scss'
})
export class OfferListComponent implements OnInit {

  public offers$ = this.offersFacade.offers$
  public loading$ = this.offersFacade.loading$

  constructor(
    private readonly offersFacade: OfferFacade
  ) {
  }

  public ngOnInit() {

    this.offersFacade.getOffers()
  }
}
