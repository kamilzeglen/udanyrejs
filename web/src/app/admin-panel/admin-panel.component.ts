import {Component, OnInit} from '@angular/core';
import {take} from 'rxjs';
import {Offer} from '../_interfaces/offer';
import {OffersService} from '../_shared/offers.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent implements OnInit {

  public offers: Offer[] | undefined;

  constructor(
    private readonly offersService: OffersService
  ) {
  }

  ngOnInit() {
    console.log('fds')
    this.offersService.getAllOffers().pipe(take(1)).subscribe((data: Offer[]) => {
      this.offers = data;
    })
  }

  public deleteOffer(offerID: string) {
    this.offersService.deleteOffer(offerID).pipe(take(1)).subscribe((response) => {
      console.log(response);

      this.offersService.getAllOffers().pipe(take(1)).subscribe((data: Offer[]) => {
        this.offers = data;
      })
    })
  }

}
