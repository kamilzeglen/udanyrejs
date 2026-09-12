import { Component, OnDestroy, OnInit } from '@angular/core';
import { OfferFacade } from '@state/offer';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';
import { map, ReplaySubject, take, takeUntil } from 'rxjs';
import { OfferSearchResult, SearchOffersPayload } from '@interfaces';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { RouterFacade } from '@state/router';
import { SortDirection } from '@angular/material/sort';
import { Pagination } from '../../_interfaces/http';
import { groupOffersByOfferId } from './group-offers-by-offer';

@Component({
  selector: 'app-admin-offer-list',
  templateUrl: './admin-offer-list.component.html',
  styleUrl: './admin-offer-list.component.scss',
})
export class AdminOfferListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  // Admin list has no paginator UI - this must stay above the total term count so every offer's terms load in one request.
  public pageSize = 5000;

  public defaultSortBy = 'createdAt';
  public defaultSortDir: SortDirection = 'desc';

  public currentSortBy = 'createdAt';
  public currentSortDir: SortDirection = 'desc';

  public sortableFields: { value: string; label: string }[] = [
    { value: 'name', label: 'Nazwa' },
    { value: 'company.name', label: 'Firma' },
    { value: 'ship.name', label: 'Statek' },
    { value: 'updatedAt', label: 'Data aktualizacji' },
    { value: 'createdAt', label: 'Data utworzenia' },
  ];

  public loading$ = this.offerFacade.loading$;
  public pagination$ = this.offerFacade.pagination$;

  public groupedOffers$ = this.offerFacade.offers$.pipe(map((offers) => (offers ? groupOffersByOfferId(offers) : [])));

  constructor(
    private readonly offerFacade: OfferFacade,
    private readonly confirmationModalService: ConfirmationModalService,
    private readonly snackService: SnackbarService,
    private readonly routerFacade: RouterFacade,
  ) {}

  public ngOnInit() {
    this.offerFacade.deleteOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie usunięto ofertę');
      this.getOffers();
    });

    this.getOffers();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public changeSortBy(orderBy: string): void {
    this.applySort(orderBy, this.currentSortDir);
  }

  public toggleSortDirection(): void {
    this.applySort(this.currentSortBy, this.currentSortDir === 'asc' ? 'desc' : 'asc');
  }

  private applySort(orderBy: string, orderDir: SortDirection): void {
    this.pagination$.pipe(take(1)).subscribe((pagination) => {
      const { all: _all, count: _count, ...rest } = pagination;
      this.getOffers({
        ...rest,
        offset: 0,
        limit: this.pageSize,
        orderBy: orderBy as Pagination['orderBy'],
        orderDir: orderDir as Pagination['orderDir'],
      });
    });
  }

  public getOffers(opts?: Partial<SearchOffersPayload>): void {
    this.pagination$.pipe(take(1)).subscribe((pagination) => {
      if (opts && 'orderBy' in opts) {
        this.currentSortBy = opts.orderBy;
      }

      if (opts && 'orderDir' in opts) {
        this.currentSortDir = opts.orderDir;
      }

      if (opts && 'limit' in opts) {
        this.pageSize = opts.limit;
      }

      this.offerFacade.getOffers({
        ...pagination,
        limit: this.pageSize,
        orderBy: this.currentSortBy || this.defaultSortBy,
        orderDir: this.currentSortDir || this.defaultSortDir,
        showInactive: true,
      });
    });
  }

  public deleteOffer(offer: OfferSearchResult): void {
    this.confirmationModalService
      .open({
        message: 'Jesteś pewny że chcesz usunąć ofertę: ' + offer.name + '?',
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (!res) {
          return;
        }

        this.offerFacade.deleteOffer({ id: offer.id });
      });
  }

  public detailsOffer(offer: OfferSearchResult): void {
    const linkParams = ['/offers/details/' + offer.id];
    this.routerFacade.changeRoute({ linkParams });
  }

  public editOffer(offer: OfferSearchResult): void {
    const linkParams = ['/admin/offers/edit/' + offer.id];
    this.routerFacade.changeRoute({ linkParams });
  }

  public addOffer(): void {
    const linkParams = ['/admin/offers/add/'];
    this.routerFacade.changeRoute({ linkParams });
  }

  public openDiscoverTrigger(): void {
    const linkParams = ['/admin/offers/discover'];
    this.routerFacade.changeRoute({ linkParams });
  }

  public editShip(shipId: string): void {
    const linkParams = ['/admin/ships/edit/' + shipId];
    this.routerFacade.changeRoute({ linkParams });
  }

  public editCompany(companyId: string): void {
    const linkParams = ['/admin/companies/edit/' + companyId];
    this.routerFacade.changeRoute({ linkParams });
  }

  public copyToClipboard(type: string, id: string) {
    const url = `${window.location.origin}/share/${type}/${id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        console.log('Skopiowano:', url);
      })
      .catch((err) => {
        console.error('Błąd kopiowania:', err);
      });
  }
}
