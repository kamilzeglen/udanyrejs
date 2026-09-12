import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferFacade } from '@state/offer';
import { AllDeviceInfo, Offer } from '@interfaces';
import { computeItineraryDate } from '@core/utils/compute-itinerary-date.util';
import { environment } from '@environment';
import { Location } from '@angular/common';
import { DeviceInfoService } from '@shared/device-info/device-info.service';
import { RouterFacade } from '@state/router';
import { PdfFileFacade } from '@state/pdfFile';
import { ShareStatsFacade } from '@state/shareStats';
import { SeoService } from '@core/seo/seo.service';
import { computeOfferSeoData } from '@core/utils/compute-offer-seo-data.util';

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html',
  styleUrl: './offer-details.component.scss',
})
export class OfferDetailsComponent implements OnInit, OnDestroy {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  public deviceInfo: AllDeviceInfo;

  public API_URL = environment.API_URL;

  public offer: Offer;
  public loading: boolean = true;
  public itineraryViewModel: {
    day: number;
    date: Date | null;
    city: string;
    arrivalTime: string;
    departureTime: string;
  }[] = [];

  private loadedOfferId: string;
  private shouldTrackWebVisit = false;

  public selectedTermId: string;
  public selectedTermStartDate: string;
  public selectedTermEndDate: string;
  public selectedTermPrice: number;
  public selectedTermPdfFileName: string;
  public termsViewModel: {
    id: string;
    startDate: string;
    endDate: string;
    fromPrice: number;
    pdfFileName: string;
  }[];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly offerFacade: OfferFacade,
    private readonly location: Location,
    private readonly deviceInfoService: DeviceInfoService,
    private readonly pdfFileFacade: PdfFileFacade,
    private readonly routerFacade: RouterFacade,
    private readonly router: Router,
    private readonly seoService: SeoService,
    private readonly shareStatsFacade: ShareStatsFacade,
  ) {
    this.seoService.setPageMeta({
      title: 'UdanyRejs - Szczegóły oferty',
      description: 'Sprawdź szczegóły rejsu! Wspaniała przygoda czeka! Rezerwuj swój rejs z UdanyRejs.',
      path: this.router.url,
    });
  }

  ngOnInit() {
    this.deviceInfo = this.deviceInfoService.getInfo();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe((info) => {
      this.deviceInfo = info;
    });

    this.activatedRoute.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((queryParamMap) => {
      const termId = queryParamMap.get('termId');
      if (termId) {
        this.selectedTermId = termId;
        this.updateSelectedTermSnapshot();
      }
    });

    this.offerFacade.getOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(({ offer }) => {
      this.offer = offer;
      this.loading = false;

      this.termsViewModel = (offer.terms || [])
        .map((term) => ({
          id: term.id,
          startDate: term.startDate,
          endDate: term.endDate,
          fromPrice: term.prices?.length ? Math.min(...term.prices.map((price) => price.price)) : null,
          pdfFileName: term.pdfFile?.name ?? null,
        }))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      const hasSelectedTerm = this.termsViewModel.some((term) => term.id === this.selectedTermId);
      if (!hasSelectedTerm) {
        this.selectedTermId = this.getDefaultTermId(this.termsViewModel);
      }
      this.updateSelectedTermSnapshot();
      this.updateSeo(offer);

      if (this.shouldTrackWebVisit && this.selectedTermId) {
        this.shouldTrackWebVisit = false;
        this.shareStatsFacade.updateShareStats({
          platform: 'web',
          offerId: offer.id,
          termId: this.selectedTermId,
        });
      }
    });

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      const offerId = paramMap.get('offerId');

      if (!offerId) {
        return;
      }

      if (offerId === this.loadedOfferId) {
        return;
      }
      this.loadedOfferId = offerId;

      this.routerFacade
        .getPreviousUrl()
        .pipe(takeUntil(this.destroy$))
        .subscribe((previousUrl) => {
          if (previousUrl?.includes('/offers')) {
            this.shouldTrackWebVisit = true;
          }
        });

      this.offerFacade.getOffer({ id: offerId });
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.seoService.clearStructuredData();
  }

  public goBack(): void {
    this.location.back();
  }

  public redirectToContact(id: string): void {
    this.routerFacade.changeRoute({ linkParams: ['/contact/', id] });
  }

  public downloadPdfFile(id: string): void {
    this.pdfFileFacade.downloadPdfFile({ pdfFileId: id });
  }

  public getDefaultTermId(terms: { id: string; startDate: string }[]): string {
    if (!terms.length) {
      return null;
    }

    const now = new Date();
    const upcoming = terms.filter((term) => new Date(term.startDate) >= now);

    if (upcoming.length) {
      return upcoming[0].id;
    }

    return terms[0].id;
  }

  private updateSelectedTermSnapshot(): void {
    const term = this.termsViewModel?.find((t) => t.id === this.selectedTermId);
    this.selectedTermStartDate = term?.startDate ?? null;
    this.selectedTermEndDate = term?.endDate ?? null;
    this.selectedTermPrice = term?.fromPrice ?? null;
    this.selectedTermPdfFileName = term?.pdfFileName ?? null;
    this.recomputeItineraryViewModel();
  }

  private updateSeo(offer: Offer): void {
    const seoData = computeOfferSeoData(
      offer,
      this.termsViewModel,
      this.API_URL,
      environment.WEB_URL + this.router.url,
    );

    this.seoService.setPageMeta({
      title: seoData.title,
      description: seoData.description,
      path: this.router.url,
      image: seoData.image,
    });
    this.seoService.setStructuredData(seoData.structuredData);
  }

  private recomputeItineraryViewModel(): void {
    if (!this.offer) {
      this.itineraryViewModel = [];
      return;
    }

    const itineraryData =
      typeof this.offer.itinerary === 'string' ? JSON.parse(this.offer.itinerary) : this.offer.itinerary;

    if (!Array.isArray(itineraryData)) {
      console.error('Itinerary is not a valid array:', this.offer.itinerary);
      this.itineraryViewModel = [];
      return;
    }

    this.itineraryViewModel = itineraryData.map((day: any) => ({
      day: day.day,
      date: computeItineraryDate(this.selectedTermStartDate, day.day),
      city: day.city,
      arrivalTime: day.arrivalTime,
      departureTime: day.departureTime,
    }));
  }
}
