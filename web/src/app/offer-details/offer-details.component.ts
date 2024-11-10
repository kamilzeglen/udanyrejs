import {Component, OnDestroy, OnInit} from '@angular/core';
import {ReplaySubject, take, takeUntil} from 'rxjs';
import {Offer} from '../_interfaces/offer';
import {OffersService} from '../_shared/offers.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html',
  styleUrl: './offer-details.component.scss'
})
export class OfferDetailsComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public offerID: string;
  public offer: Offer;

  constructor(
    private readonly offersService: OffersService,
    private readonly route: ActivatedRoute
  ) {
  }

  ngOnInit() {

    this.offerID = this.route.snapshot.paramMap.get('id'); // pobranie id z URL
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.offerID = params.get('id');
      this.offersService.getOfferDetails(this.offerID).pipe(take(1)).subscribe((data: Offer) => {
        this.offer = data;
      })
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
