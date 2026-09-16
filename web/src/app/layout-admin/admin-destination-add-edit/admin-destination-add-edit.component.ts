import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest, filter, map, merge, of, ReplaySubject, switchMap, take, takeUntil } from 'rxjs';
import { Destination } from '@interfaces';
import { CommonFacade } from '@state/common';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { RouterFacade } from '@state/router';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';
import { clearBackendError, setBackendErrorForKey } from '@core/utils/form-backend-error.util';
import { ImageFileFacade } from '@state/imageFile';

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
  public imageFile: File;

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly fb: FormBuilder,
    private readonly snackService: SnackbarService,
    private readonly router: RouterFacade,
    private readonly activatedRoute: ActivatedRoute,
    private readonly confirmationModalService: ConfirmationModalService,
    private readonly imageFileFacade: ImageFileFacade,
  ) {}

  public ngOnInit(): void {
    this.isInitializing = true;

    this.destinationForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)],
      seoTitle: ['', Validators.maxLength(255)],
      seoDescription: ['', Validators.maxLength(500)],
      description: [''],
      showInMenu: [false],
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

    this.commonFacade.createDestinationSuccess$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(({ destination }) => {
          if (!this.imageFile) {
            return of([true]);
          }

          this.createImageFile(destination.id);
          return combineLatest([
            merge(
              this.imageFileFacade.createImageFileSuccess$.pipe(map(() => true)),
              this.imageFileFacade.createImageFileError$.pipe(map(() => false)),
            ),
          ]);
        }),
        filter(([imageResult]) => imageResult !== undefined),
      )
      .subscribe(([imageResult]) => {
        const message = imageResult
          ? 'Pomyślnie dodano region'
          : 'Region został dodany, ale nie udało się przesłać obrazu';
        this.snackService.showInfo(message);
        this.router.changeRoute({ linkParams: ['/admin/destinations'] });
      });

    this.commonFacade.createDestinationError$.pipe(takeUntil(this.destroy$)).subscribe(({ errorMessage }) => {
      setBackendErrorForKey(this.destinationForm.controls.name, errorMessage, 'DESTINATION_NAME_DUPLICATE');
      this.snackService.showError('Wystąpił błąd podczas dodawania regionu');
    });

    this.commonFacade.updateDestinationError$.pipe(takeUntil(this.destroy$)).subscribe(({ errorMessage }) => {
      setBackendErrorForKey(this.destinationForm.controls.name, errorMessage, 'DESTINATION_NAME_DUPLICATE');
      this.snackService.showError('Wystąpił błąd podczas aktualizowania regionu');
    });

    this.commonFacade.updateDestinationSuccess$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(({ destination }) => {
          if (!this.imageFile) {
            return of([true]);
          }

          this.updateImageFile(destination.id);
          return combineLatest([
            merge(
              this.imageFileFacade.updateImageFileSuccess$.pipe(map(() => true)),
              this.imageFileFacade.updateImageFileError$.pipe(map(() => false)),
            ),
          ]);
        }),
        filter(([imageResult]) => imageResult !== undefined),
      )
      .subscribe(([imageResult]) => {
        const message = imageResult
          ? 'Pomyślnie zaktualizowano region'
          : 'Region został zaktualizowany, ale nie udało się przesłać obrazu';
        this.snackService.showInfo(message);
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
    clearBackendError(this.destinationForm.controls.name);

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

  public onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.imageFile = file;
    }
  }

  private createImageFile(destinationId: string): void {
    const formData = new FormData();
    formData.append('imageFile', this.imageFile);
    this.imageFileFacade.createImageFile({ imageFileType: 'destination', targetId: destinationId, file: formData });
  }

  private updateImageFile(destinationId: string): void {
    const formData = new FormData();
    formData.append('imageFile', this.imageFile);
    this.imageFileFacade.updateImageFile({ imageFileType: 'destination', targetId: destinationId, file: formData });
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
