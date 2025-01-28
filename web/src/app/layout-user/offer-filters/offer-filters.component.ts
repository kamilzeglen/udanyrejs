import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CommonFacade} from '@state/common';
import {ReplaySubject} from 'rxjs';

@Component({
  selector: 'app-offer-filters',
  templateUrl: './offer-filters.component.html',
  styleUrl: './offer-filters.component.scss'
})
export class OfferFiltersComponent implements OnInit, OnDestroy {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  @Input() filters: { [key: string]: any } = {};
  @Output() filterChanged = new EventEmitter<{ key: string; value: any }>();

  public isFiltersVisible = false;

  public companies$ = this.commonFacade.companies$
  public destinations$ = this.commonFacade.destinations$

  constructor(
    private readonly commonFacade: CommonFacade,
  ) {
  }

  public ngOnInit() {
    this.commonFacade.getCompanies();
    this.commonFacade.getDestinations();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }

  public onFilterChange(key: string, value: any): void {
    this.filterChanged.emit({ key, value });
  }
}
