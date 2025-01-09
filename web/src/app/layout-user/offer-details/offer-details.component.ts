import {Component, OnDestroy, OnInit} from '@angular/core';
import {of, ReplaySubject, takeUntil} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {OfferFacade} from '@state/offer';
import {Itinerary, Offer} from '@interfaces';
import {environment} from '@environment';
import { Location } from '@angular/common';

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html',
  styleUrl: './offer-details.component.scss'
})
export class OfferDetailsComponent implements OnInit, OnDestroy {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  public API_URL = environment.API_URL;

  public offer: Offer
  public loading: boolean = true;
  public itineraryData: Itinerary[]

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly offerFacade: OfferFacade,
    private readonly location: Location
  ) {
  }

  ngOnInit() {

    this.offerFacade.getOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe((offer) => {
      this.offer = offer.offer;
      this.loading = false;

      const itineraryData = typeof this.offer.itinerary === 'string'
        ? JSON.parse(this.offer.itinerary)
        : this.offer.itinerary;

      if (Array.isArray(itineraryData)) {
        this.itineraryData = itineraryData.map((day: any) => {
          return {
            day: day.day,
            date: day.date,
            port: day.port,
            arrivalTime: day.arrivalTime,
            departureTime: day.departureTime
          };
        });
      } else {
        console.error('Itinerary is not a valid array:', this.offer.itinerary);
      }
    })

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(paramMap => {
      const offerId = paramMap.get('offerId');

      if (!offerId) {
        return
      }

      this.offerFacade.getOffer({id: offerId})
    })
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  goBack(): void {
    this.location.back();  // Używa Angular Location do powrotu
  }

  protected readonly of = of;
}
