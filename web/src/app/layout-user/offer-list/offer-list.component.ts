import {Component, OnDestroy, OnInit} from '@angular/core';
import {defaultPagination, OfferFacade} from 'src/app/_state/offer';
import {ReplaySubject, take, takeUntil} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {SearchOffersPayload} from '@interfaces';
import {CommonFacade} from '@state/common';
import moment from 'moment-timezone';
import {Meta, Title} from '@angular/platform-browser';
import {PageEvent} from '@angular/material/paginator';
import {SortDirection} from '@angular/material/sort';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrl: './offer-list.component.scss'
})
export class OfferListComponent implements OnInit, OnDestroy {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  public offers$ = this.offerFacade.offers$
  public loading$ = this.offerFacade.loading$
  public pagination$ = this.offerFacade.pagination$

  public page: number = 0

  public pageSize = defaultPagination.limit;
  public pageSizeOptions = [10, 25, 50];

  public defaultSortBy = 'createdAt';
  public defaultSortDir: SortDirection = 'desc';

  public currentSortBy = 'createdAt';
  public currentSortDir: SortDirection = 'desc';

  public currPage$ = this.pagination$.pipe(
    map(pagination => {
      if (pagination.all === 0) {
        return 0;
      }
      if (pagination.offset === 0) {
        return 0;
      }
      return Math.floor(pagination.offset / this.pageSize);
    })
  );

  public filters: { [key: string]: any } = {
    category: null,
    startDate: null,
    endDate: null,
    companyIdList: [],
    destinationIdList: [],
    showInactive: false,
  };

  constructor(
    private readonly offerFacade: OfferFacade,
    private readonly commonFacade: CommonFacade,
    private readonly activatedRoute: ActivatedRoute,
    private readonly titleService: Title,
    private readonly metaService: Meta,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.titleService.setTitle('UdanyRejs - Oferty Rejsów');
    this.metaService.updateTag({
      name: 'description',
      content: 'Znajdź idealny rejs dla siebie! Przeglądaj naszą ofertę rejsów wycieczkowych po najpiękniejszych zakątkach świata.'
    });
  }

  public ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.page = params['page'] ? Number(params['page']) - 1 : 0;
    });

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(paramMap => {
      const category = paramMap.get('category')
      this.filters = {...this.filters, category: paramMap.get('category')};

      if (category === 'promotions') {
        this.titleService.setTitle('UdanyRejs - Oferty Rejsów - Promocje');
        this.metaService.updateTag({
          name: 'description',
          content: 'Znajdź idealny rejs dla siebie! Przeglądaj naszą ofertę rejsów wycieczkowych po najpiękniejszych zakątkach świata.'
        });
      } else {
        this.titleService.setTitle('UdanyRejs - Oferty Rejsów');
        this.metaService.updateTag({
          name: 'description',
          content: 'Znajdź idealny rejs dla siebie! Przeglądaj naszą ofertę rejsów wycieczkowych po najpiękniejszych zakątkach świata.'
        });
      }

      this.commonFacade.getCategories();
      this.getOffers(this.filters);
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public getOffers(opts?: Partial<SearchOffersPayload>): void {
    this.pagination$.pipe(take(1)).subscribe(pagination => {

      if (opts?.startDate) {
        opts.startDate = moment.tz(opts.startDate, 'Europe/Warsaw').startOf('day').toDate();
      }

      if (opts?.endDate) {
        opts.endDate = moment.tz(opts.endDate, 'Europe/Warsaw').endOf('day').toDate();
      }

      if (opts && 'orderBy' in opts) {
        this.currentSortBy = opts.orderBy;
      }

      if (opts && 'orderDir' in opts) {
        this.currentSortDir = opts.orderDir;
      }

      if (opts && 'limit' in opts) {
        this.pageSize = opts.limit;
      }

      if (this.page) {
        pagination = {
          ...pagination, // Zachowuje istniejące wartości
          offset: this.page * this.pageSize,
          limit: this.pageSize
        };
      }

      this.offerFacade.getOffers({
        ...this.filters,
        ...pagination,
        ...opts,
        limit: this.pageSize,
        orderBy: this.currentSortBy || this.defaultSortBy,
        orderDir: this.currentSortDir || this.defaultSortDir,
      });
    })
  }

  public onFiltersChanged(changedFilter: { key: string; value: any }): void {
    this.filters = {...this.filters, [changedFilter.key]: changedFilter.value};

    this.getOffers(this.filters);
  }

  public pageChanged(page: PageEvent): void {
    if (page.pageSize !== this.pageSize) {
      this.pageSize = page.pageSize;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {page: page.pageIndex + 1},
      queryParamsHandling: 'merge',
    });

    this.getOffers({offset: page.pageIndex * this.pageSize, limit: page.pageSize});
  }
}
