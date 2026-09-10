import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject, take, takeUntil } from 'rxjs';
import { Destination } from '@interfaces';
import { CommonFacade } from '@state/common';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { RouterFacade } from '@state/router';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'app-admin-destination-add-edit',
  templateUrl: './admin-destination-add-edit.component.html',
  styleUrl: './admin-destination-add-edit.component.scss',
})
export class AdminDestinationAddEditComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public mode: 'EDIT' | 'ADD' = 'ADD';
  public editingDestination: Destination;

  public isInitializing: boolean = false;

  public destinationForm: FormGroup;

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly fb: FormBuilder,
    private readonly snackService: SnackbarService,
    private readonly router: RouterFacade,
    private readonly activatedRoute: ActivatedRoute,
    private readonly confirmationModalService: ConfirmationModalService,
  ) {}

  public ngOnInit(): void {
    this.isInitializing = true;

    this.destinationForm = this.fb.group({
      name: ['', Validators.required],
    });

    this.commonFacade.getDestinationSuccess$.pipe(take(1)).subscribe(({ destination }) => {
      this.editingDestination = destination;

      if (!this.editingDestination) {
        this.snackService.showError('Nie znaleziono regionu');
        this.router.changeRoute({ linkParams: ['/admin/destinations'] });
      }

      if (this.editingDestination) {
        this.destinationForm.patchValue(this.editingDestination);
      }

      this.isInitializing = false;
    });

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      const destinationId = paramMap.get('destinationId');
      if (destinationId) {
        this.mode = 'EDIT';
        this.commonFacade.getDestination({ id: destinationId });
      } else {
        this.isInitializing = false;
      }
    });

    this.commonFacade.createDestinationSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie dodano region');
      this.router.changeRoute({ linkParams: ['/admin/destinations'] });
    });

    this.commonFacade.createDestinationError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas dodawania regionu');
    });

    this.commonFacade.updateDestinationError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas aktualizowania regionu');
    });

    this.commonFacade.updateDestinationSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie zaktualizowano region');
      this.router.changeRoute({ linkParams: ['/admin/destinations'] });
    });

    this.commonFacade.deleteDestinationSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie usunięto region');
      this.router.changeRoute({ linkParams: ['/admin/destinations'] });
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public submitForm(): void {
    if (this.destinationForm.invalid) {
      return;
    }

    const payload = { ...this.destinationForm.value };
    for (const key in payload) {
      if (payload[key] === '' || payload[key] === null) {
        delete payload[key];
      }
    }

    if (this.mode === 'ADD') {
      this.commonFacade.createDestination({ formData: payload });
    }

    if (this.mode === 'EDIT') {
      const id = this.editingDestination.id;
      this.commonFacade.updateDestination({ id, formData: payload });
    }
  }

  public deleteDestination(): void {
    if (this.editingDestination) {
      this.confirmationModalService
        .open({
          message: 'Jesteś pewny że chcesz usunąć region: ' + this.editingDestination.name + '?',
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.deleteDestination({ id: this.editingDestination.id });
        });
    }
  }

  public goBack(): void {
    this.router.changeRoute({ linkParams: ['/admin/destinations'] });
  }
}
