import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonHttpService } from '@core/_http/common.http.service';
import { OffersHttpService } from '@core/_http/offers.http.service';
import { SeoService } from '@core/seo/seo.service';
import { defaultPagination } from '@state/offer';
import { Company, Destination, OfferSearchResult, SearchOffersPayload } from '@interfaces';
import { environment } from '@environment';
import { map, Observable, ReplaySubject, switchMap, takeUntil } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

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
  public page = 0;
  public readonly pageSize = defaultPagination.limit;
  public totalOffers = 0;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly commonHttpService: CommonHttpService,
    private readonly offersHttpService: OffersHttpService,
    private readonly seoService: SeoService,
    private readonly router: Router,
  ) {}

  public ngOnInit(): void {
    this.entityType = this.activatedRoute.snapshot.data['entityType'];

    this.activatedRoute.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug') ?? '';
          const entity$: Observable<LandingEntity> =
            this.entityType === 'destination'
              ? this.commonHttpService.getPublicDestination({ slug })
              : this.commonHttpService.getPublicCompany({ slug });

          return entity$.pipe(
            switchMap((entity) =>
              this.activatedRoute.queryParamMap.pipe(
                map((queryParams) => ({
                  entity,
                  page: this.getPageIndex(queryParams.get('page')),
                })),
              ),
            ),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: ({ entity, page }) => this.loadEntity(entity, page),
        error: () => this.setNotFound(),
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public pageChanged(page: PageEvent): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page: page.pageIndex > 0 ? page.pageIndex + 1 : null },
      queryParamsHandling: 'merge',
    });
  }

  private loadEntity(entity: LandingEntity, page = 0): void {
    this.entity = entity;
    this.page = page;
    this.isLoading = true;
    const path = this.entityType === 'destination' ? `/destinations/${entity.slug}` : `/cruise-lines/${entity.slug}`;
    const imagePath = this.getImagePath(entity);
    const title = entity.seoTitle || `${entity.name} – rejsy wycieczkowe | UdanyRejs`;
    const description = entity.seoDescription || `Zobacz aktualne rejsy ${entity.name} w UdanyRejs.`;

    this.seoService.setPageMeta({
      title,
      description,
      path: page > 0 ? `${path}?page=${page + 1}` : path,
      image: imagePath,
    });
    this.seoService.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: entity.name,
      description,
      url: this.seoService.createCanonicalUrl(path),
    });

    const pagination = {
      ...defaultPagination,
      limit: this.pageSize,
      offset: page * this.pageSize,
      orderBy: 'startDate',
      orderDir: 'asc' as const,
    };
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
          this.totalOffers = response.pagination.all ?? response.data.length;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  private getPageIndex(pageParam: string | null): number {
    const page = Number(pageParam);

    if (Number.isSafeInteger(page) && page > 0) {
      return page - 1;
    }

    return 0;
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
