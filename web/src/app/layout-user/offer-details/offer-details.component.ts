import {Component, OnDestroy, OnInit} from '@angular/core';
import {ReplaySubject, takeUntil} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {OfferFacade} from '@state/offer';
import {AllDeviceInfo, Itinerary, Offer} from '@interfaces';
import {environment} from '@environment';
import {Location} from '@angular/common';
import {DeviceInfoService} from '@shared/device-info/device-info.service';
import {RouterFacade} from '@state/router';
import {PdfFileFacade} from '@state/pdfFile';
import {Meta, Title} from '@angular/platform-browser';

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html',
  styleUrl: './offer-details.component.scss'
})
export class OfferDetailsComponent implements OnInit, OnDestroy {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  public deviceInfo: AllDeviceInfo;

  public API_URL = environment.API_URL;

  public offer: Offer
  public loading: boolean = true;
  public itineraryData: Itinerary[]

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly offerFacade: OfferFacade,
    private readonly location: Location,
    private readonly deviceInfoService: DeviceInfoService,
    private readonly pdfFileFacade: PdfFileFacade,
    private readonly router: RouterFacade,
    private readonly titleService: Title,
    private readonly metaService: Meta
  ) {
    this.titleService.setTitle(`UdanyRejs - Szczegóły oferty`);
    this.metaService.updateTag({
      name: 'description',
      content: `Sprawdź szczegóły rejsu! Wspaniała przygoda czeka! Rezerwuj swój rejs z UdanyRejs.`
    });

  }

  ngOnInit() {
    this.deviceInfo = this.deviceInfoService.getInfo();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe(info => {
      this.deviceInfo = info;
    });

    this.offerFacade.getOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(({offer}) => {
      this.offer = offer;
      this.loading = false;

      this.titleService.setTitle(`UdanyRejs - ${offer.name} `);
      this.metaService.updateTag({
        name: 'description',
        content: `Sprawdź szczegóły rejsu: ${offer.name}. Wspaniała przygoda czeka! Rezerwuj swój rejs z UdanyRejs.`
      });


      const itineraryData = typeof this.offer.itinerary === 'string'
        ? JSON.parse(this.offer.itinerary)
        : this.offer.itinerary;

      if (Array.isArray(itineraryData)) {
        this.itineraryData = itineraryData.map((day: any) => {
          return {
            day: day.day,
            date: day.date,
            city: day.city,
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

  public goBack(): void {
    this.location.back();
  }

  public redirectToContact(id: string): void {
    this.router.changeRoute({linkParams: ['/contact/', id]});
  }

  public downloadPdfFile(id: string): void {
    this.pdfFileFacade.downloadPdfFile({pdfFileId: id})
  }
}
