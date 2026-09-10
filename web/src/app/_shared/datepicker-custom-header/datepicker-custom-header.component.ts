import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatCalendar} from '@angular/material/datepicker';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {BehaviorSubject, startWith, Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-datepicker-custom-header',
  templateUrl: './datepicker-custom-header.component.html',
  styleUrl: './datepicker-custom-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerCustomHeaderComponent {
  private readonly _calendar = inject<MatCalendar<Date>>(MatCalendar);
  private readonly _dateAdapter = inject<DateAdapter<Date>>(DateAdapter);
  private readonly _dateFormats = inject(MAT_DATE_FORMATS);

  private readonly _destroyed = new Subject<void>();

  private readonly periodLabel = new BehaviorSubject('');
  public readonly periodLabel$ = this.periodLabel.asObservable();

  constructor() {
    this._calendar.stateChanges.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() => {
      this.periodLabel.next(
        this._dateAdapter
          .format(this._calendar.activeDate, this._dateFormats.display.monthYearLabel)
          .toLocaleUpperCase(),
      );
    });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  previousClicked(mode: 'month' | 'year') {
    this._calendar.activeDate =
      mode === 'month'
        ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, -1)
        : this._dateAdapter.addCalendarYears(this._calendar.activeDate, -1);
  }

  nextClicked(mode: 'month' | 'year') {
    this._calendar.activeDate =
      mode === 'month'
        ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, 1)
        : this._dateAdapter.addCalendarYears(this._calendar.activeDate, 1);
  }
}
