import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonHttpService } from '@core/_http/common.http.service';
import { OffersHttpService } from '@core/_http/offers.http.service';
import { SeoService } from '@core/seo/seo.service';
import { defaultPagination } from '@state/offer';
import { Company, Destination, OfferSearchResult, SearchOffersPayload } from '@interfaces';
import { environment } from '@environment';
import { ReplaySubject, switchMap, takeUntil } from 'rxjs';

type LandingEntity = Company | Destination;
type LandingEntityType = 'company' | 'destination';

@Component({
  selector: 'app-seo-landing-page',
  templateUrl: './seo-landing-page.component.html',
  styleUrl: './seo-landing-page.component.scss',
})
export class SeoLandingPageComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new ReplaySubject<boolean>(1);

  public readonly apiUrl = environment.API_URL;
  public entity: LandingEntity | null = null;
  public entityType: LandingEntityType;
  public offers: OfferSearchResult[] = [];
  public isLoading = true;
  public isNotFound = false;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly commonHttpService: CommonHttpService,
    private readonly offersHttpService: OffersHttpService,
    private readonly seoService: SeoService,
  ) {}

  public ngOnInit(): void {
    this.entityType = this.activatedRoute.snapshot.data['entityType'];

    this.activatedRoute.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug') ?? '';
          return this.entityType === 'destination'
            ? this.commonHttpService.getPublicDestination({ slug })
            : this.commonHttpService.getPublicCompany({ slug });
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (entity) => this.loadEntity(entity),
        error: () => this.setNotFound(),
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private loadEntity(entity: LandingEntity): void {
    this.entity = entity;
    const path = this.entityType === 'destination' ? `/destinations/${entity.slug}` : `/cruise-lines/${entity.slug}`;
    const imagePath = this.getImagePath(entity);
    const title = entity.seoTitle || `${entity.name} – rejsy wycieczkowe | UdanyRejs`;
    const description = entity.seoDescription || `Zobacz aktualne rejsy ${entity.name} w UdanyRejs.`;

    this.seoService.setPageMeta({ title, description, path, image: imagePath });
    this.seoService.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: entity.name,
      description,
      url: this.seoService.createCanonicalUrl(path),
    });

    const pagination = { ...defaultPagination, orderDir: 'asc' as const };
    const payload: Partial<SearchOffersPayload> =
      this.entityType === 'destination'
        ? { ...pagination, destinationIdList: [entity.id] }
        : { ...pagination, companyIdList: [entity.id] };
    this.offersHttpService
      .getOffers(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.offers = response.data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  private setNotFound(): void {
    this.isNotFound = true;
    this.isLoading = false;
    this.seoService.setPageMeta({
      title: 'Nie znaleziono strony | UdanyRejs',
      description: 'Ta strona nie jest już dostępna.',
      path: this.activatedRoute.snapshot.url.join('/'),
      noIndex: true,
    });
  }

  private getImagePath(entity: LandingEntity): string | undefined {
    const imageName = entity.imageFile?.name;

    if (!imageName) {
      return undefined;
    }

    const imageFolder = this.entityType === 'destination' ? 'destinations' : 'companies';
    return `${this.apiUrl}/${imageFolder}/images/${encodeURIComponent(imageName)}`;
  }
}
