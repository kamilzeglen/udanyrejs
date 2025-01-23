import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonFacade} from '@state/common';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';
import {RouterFacade} from '@state/router';
import {ActivatedRoute} from '@angular/router';
import {Ship} from '@interfaces';
import {combineLatest, filter, merge, of, ReplaySubject, take, takeUntil} from 'rxjs';
import {ConfirmationModalService} from '@shared/confirmation-modal/confirmation-modal.service';
import {map, switchMap} from 'rxjs/operators';
import {ImageFileFacade} from '@state/imageFile';

@Component({
  selector: 'app-admin-ship-add-edit',
  templateUrl: './admin-ship-add-edit.component.html',
  styleUrl: './admin-ship-add-edit.component.scss'
})
export class AdminShipAddEditComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public mode: "EDIT" | "ADD" = 'ADD';
  public editingShip: Ship;

  public isInitializing: boolean = false;

  public imageFile: File
  public shipForm: FormGroup;

  public companies$ = this.commonFacade.companies$

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly fb: FormBuilder,
    private readonly snackService: SnackbarService,
    private readonly router: RouterFacade,
    private readonly activatedRoute: ActivatedRoute,
    private readonly confirmationModalService: ConfirmationModalService,
    private readonly imageFileFacade: ImageFileFacade,
  ) {
  }

  public ngOnInit() {
    this.isInitializing = true;

    this.shipForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      yearBuilt: ['', Validators.required],
      length: ['', Validators.required],
      width: ['', Validators.required],
      tonnage: ['', Validators.required],
      passengersDecks: ['', Validators.required],
      passengers: ['', Validators.required],
      crew: ['', Validators.required],
      currency: ['', Validators.required],
      companyId: ['', Validators.required],
    });

    this.commonFacade.getShipByNameSuccess$.pipe(take(1)).subscribe((ship) => {
      this.editingShip = ship.ship;

      if (!this.editingShip) {
        this.snackService.showError('Nie znaleziono statku')
        this.router.changeRoute({linkParams: ['/admin/ships']});
      }

      if (this.editingShip) {
        this.shipForm.patchValue({
          ...this.editingShip,
          length: Number(this.editingShip.length),
          width: Number(this.editingShip.width),
          yearBuilt: Number(this.editingShip.yearBuilt),
          tonnage: Number(this.editingShip.tonnage),
        });
      }

      this.isInitializing = false;
    })

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(paramMap => {
      const shipId = paramMap.get('shipId');
      if (shipId) {
        this.mode = 'EDIT';
        this.commonFacade.getShipById({id: shipId});
      } else {
        this.isInitializing = false;
      }
    });

    this.commonFacade.createShipError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas dodawania statku');
    })

    this.commonFacade.updateShipError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas aktualizowania statku');
    })

    this.commonFacade.createShipSuccess$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(({ship}) => {
          if (!this.imageFile) {
            return of([true]);
          }

          this.createImageFile(ship.id);

          const createImageSuccess$ = this.imageFileFacade.createImageFileSuccess$.pipe(map(() => true));
          const createImageError$ = this.imageFileFacade.createImageFileError$.pipe(map(() => false));

          return combineLatest([merge(createImageSuccess$, createImageError$)]);
        }),
        filter(([imageResult]) => imageResult !== undefined)
      )
      .subscribe(([imageResult]) => {
        if (imageResult) {
          this.snackService.showInfo('Pomyślnie dodano statek');
        } else {
          this.snackService.showError('Statek została dodana, ale wystąpił problem podczas przesyłania pliku obrazu');
        }

        this.router.changeRoute({linkParams: ['/admin/ships']});
      })

    this.commonFacade.updateShipSuccess$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(({ship}) => {
          if (!this.imageFile) {
            return of([true]);
          }

          this.updateImageFile(ship.id);

          const updateImageSuccess$ = this.imageFileFacade.updateImageFileSuccess$.pipe(map(() => true));
          const updateImageError$ = this.imageFileFacade.updateImageFileError$.pipe(map(() => false));

          return combineLatest([merge(updateImageSuccess$, updateImageError$)]);
        }),
        filter(([imageResult]) => imageResult !== undefined)
      )
      .subscribe(([imageResult]) => {
        if (imageResult) {
          this.snackService.showInfo('Pomyślnie zaktualizowano statek');
        } else {
          this.snackService.showError('Statek została zaktualizowana, ale wystąpił problem podczas przesyłania pliku obrazu');
        }

        this.router.changeRoute({linkParams: ['/admin/ships', this.editingShip?.company?.id]});
      })

    this.commonFacade.getCompanies();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      this.imageFile = file;
    }
  }

  public submitForm(): void {
    if (this.shipForm.invalid) {
      return;
    }

    const payload = {...this.shipForm.value};
    for (const key in payload) {
      if (payload[key] === '' || payload[key] === null) {
        delete payload[key];
      }
    }

    if (this.mode === "ADD") {
      this.commonFacade.createShip({formData: payload});
    }

    if (this.mode === "EDIT") {
      const id = this.editingShip.id
      this.commonFacade.updateShip({id, formData: payload});
    }
  }

  public createImageFile(shipId: string): void {
    const formData = new FormData()
    formData.append('imageFile', this.imageFile);
    this.imageFileFacade.createImageFile({imageFileType: 'ship', targetId: shipId, formData})
  }

  public updateImageFile(shipId: string): void {
    const formData = new FormData()
    formData.append('imageFile', this.imageFile);
    this.imageFileFacade.updateImageFile({imageFileType: 'ship', targetId: shipId, formData})
  }

  public deleteShip(): void {
    if (this.editingShip) {
      this.confirmationModalService
        .open({
          message: "Jesteś pewny że chcesz usunąć statek: " + this.editingShip.name + "?"
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe(res => {
          if (!res) {
            return;
          }

          this.commonFacade.deleteShip({id: this.editingShip.id})
        });
    }
  }


  public goBack(): void {
    this.router.changeRoute({linkParams: ['/admin/companies']});
  }
}
