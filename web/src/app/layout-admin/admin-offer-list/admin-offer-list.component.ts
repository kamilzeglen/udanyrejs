import { Component, OnDestroy, OnInit } from '@angular/core';
import { OfferFacade } from '@state/offer';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';
import { combineLatest, map, ReplaySubject, take, takeUntil } from 'rxjs';
import { OfferSearchResult, OfferSyncResult, SearchOffersPayload } from '@interfaces';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { RouterFacade } from '@state/router';
import { SortDirection } from '@angular/material/sort';
import { Pagination } from '../../_interfaces/http';
import { GroupedOffer, groupOffersByOfferId } from './group-offers-by-offer';
import { RowSelection } from '@shared/row-selection/row-selection';

interface TermRow extends OfferSearchResult {
  selected: boolean;
}

interface GroupedOfferRow extends Omit<GroupedOffer, 'terms'> {
  terms: TermRow[];
  selected: boolean;
  termsHeaderChecked: boolean;
  termsHeaderIndeterminate: boolean;
}

interface OfferListViewModel {
  groups: GroupedOfferRow[];
  selectedCount: number;
  selectedTermCount: number;
  headerChecked: boolean;
  headerIndeterminate: boolean;
}

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
  public syncingOfferId$ = this.offerFacade.syncingOfferId$;

  public groupedOffers$ = this.offerFacade.offers$.pipe(map((offers) => (offers ? groupOffersByOfferId(offers) : [])));

  public readonly selection = new RowSelection();
  public readonly termSelection = new RowSelection();

  public viewModel$ = combineLatest([
    this.groupedOffers$,
    this.selection.selectedIds$,
    this.termSelection.selectedIds$,
  ]).pipe(map(([groups, selectedIds, selectedTermIds]) => this.buildViewModel(groups, selectedIds, selectedTermIds)));

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

    this.offerFacade.syncOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(({ result }) => {
      this.snackService.showInfo(this.buildSyncResultMessage(result));
      this.getOffers();
    });

    this.offerFacade.syncOfferError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się zsynchronizować oferty');
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

  public syncOffer(offer: OfferSearchResult): void {
    this.offerFacade.syncOffer({ id: offer.id });
  }

  private buildSyncResultMessage(result: OfferSyncResult): string {
    const base =
      `${result.termsAdded} nowy(ch) termin(ów), ${result.termsDeactivated} dezaktywowany(ch) termin(ów), ` +
      `${result.termsSkipped} pominięty(ch) z powodu błędu połączenia, ` +
      `${result.pdfsUpdated} zaktualizowany(ch) PDF.`;

    if (result.offerDeactivated) {
      return 'Zsynchronizowano ofertę i dezaktywowano ją (brak aktywnych terminów) - ' + base;
    }

    return 'Zsynchronizowano ofertę: ' + base;
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

  public toggleOfferSelection(group: GroupedOfferRow): void {
    const termIds = group.terms.map((term) => term.termId);

    this.selection.toggle(group.offer.id);

    if (group.selected) {
      this.termSelection.deselectMany(termIds);
      return;
    }

    this.termSelection.selectMany(termIds);
  }

  public toggleSelectAll(groups: GroupedOfferRow[]): void {
    const offerIds = groups.map((group) => group.offer.id);
    const termIds = groups.flatMap((group) => group.terms.map((term) => term.termId));
    const allSelected = groups.length > 0 && groups.every((group) => group.selected);

    if (allSelected) {
      this.selection.deselectMany(offerIds);
      this.termSelection.deselectMany(termIds);
      return;
    }

    this.selection.selectMany(offerIds);
    this.termSelection.selectMany(termIds);
  }

  public toggleSelectAllTerms(terms: TermRow[]): void {
    const ids = terms.map((term) => term.termId);
    const allSelected = terms.length > 0 && terms.every((term) => term.selected);

    if (allSelected) {
      this.termSelection.deselectMany(ids);
      return;
    }

    this.termSelection.selectMany(ids);
  }

  public clearSelection(): void {
    this.selection.clear();
    this.termSelection.clear();
  }

  public trackByOfferId(_index: number, group: GroupedOfferRow): string {
    return group.offer.id;
  }

  public trackByTermId(_index: number, term: TermRow): string {
    return term.termId;
  }

  private buildViewModel(
    groups: GroupedOffer[],
    selectedIds: Set<string>,
    selectedTermIds: Set<string>,
  ): OfferListViewModel {
    const rows = groups.map((group) => this.buildGroupRow(group, selectedIds, selectedTermIds));
    const allSelected = rows.length > 0 && rows.every((row) => row.selected);
    const someSelected = rows.some((row) => row.selected);

    return {
      groups: rows,
      selectedCount: selectedIds.size,
      selectedTermCount: selectedTermIds.size,
      headerChecked: allSelected,
      headerIndeterminate: someSelected && !allSelected,
    };
  }

  private buildGroupRow(group: GroupedOffer, selectedIds: Set<string>, selectedTermIds: Set<string>): GroupedOfferRow {
    const terms = group.terms.map((term) => ({ ...term, selected: selectedTermIds.has(term.termId) }));
    const allTermsSelected = terms.length > 0 && terms.every((term) => term.selected);
    const someTermsSelected = terms.some((term) => term.selected);

    return {
      ...group,
      terms,
      selected: selectedIds.has(group.offer.id),
      termsHeaderChecked: allTermsSelected,
      termsHeaderIndeterminate: someTermsSelected && !allTermsSelected,
    };
  }

  public copyToClipboard(type: string, offerId: string, termId: string) {
    const url = `${window.location.origin}/share/${type}/${offerId}/${termId}`;
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
