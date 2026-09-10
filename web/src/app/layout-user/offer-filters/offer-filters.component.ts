import { Component, input, OnDestroy, OnInit, output } from '@angular/core';
import { CommonFacade } from '@state/common';
import { ReplaySubject } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatepickerCustomHeaderComponent } from '@shared/datepicker-custom-header/datepicker-custom-header.component';
import moment from 'moment-timezone';

@Component({
  selector: 'app-offer-filters',
  templateUrl: './offer-filters.component.html',
  styleUrl: './offer-filters.component.scss',
  animations: [
    trigger('filtersAnimation', [
      state('hidden', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      state('visible', style({ height: '*', opacity: 1 })),
      transition('hidden <=> visible', animate('300ms ease-in-out')),
    ]),
  ],
})
export class OfferFiltersComponent implements OnInit, OnDestroy {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  public readonly filters = input<{ [key: string]: any }>({});
  public readonly filterChanged = output<{ key: string; value: any }>();

  readonly exampleHeader = DatepickerCustomHeaderComponent;

  public today = new Date();

  public isFiltersVisible = false;

  public companies$ = this.commonFacade.companies$;
  public destinations$ = this.commonFacade.destinations$;

  constructor(private readonly commonFacade: CommonFacade) {}

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

  protected readonly moment = moment;
}
