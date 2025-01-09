import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonFacade} from '@state/common';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';
import {RouterFacade} from '@state/router';
import {ActivatedRoute} from '@angular/router';
import {Ship} from '@interfaces';
import {ReplaySubject, take, takeUntil} from 'rxjs';
import {ConfirmationModalService} from '@shared/confirmation-modal/confirmation-modal.service';

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

  public offerForm: FormGroup;

  public companies$ = this.commonFacade.companies$

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly fb: FormBuilder,
    private readonly snackService: SnackbarService,
    private readonly router: RouterFacade,
    private readonly activatedRoute: ActivatedRoute,
    private readonly confirmationModalService: ConfirmationModalService,
  ) {
  }

  public ngOnInit() {
    this.isInitializing = true;

    this.offerForm = this.fb.group({
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
      image: [null],
    });

    this.commonFacade.getShipSuccess$.pipe(take(1)).subscribe((ship) => {
      this.editingShip = ship.ship;

      if (!this.editingShip) {
        this.snackService.showError('Nie znaleziono statku')
        this.router.changeRoute({linkParams: ['/admin/ships']});
      }

      if (this.editingShip) {
        this.offerForm.patchValue({
          name: this.editingShip?.name,
          description: this.editingShip?.description,
          yearBuilt: this.editingShip?.yearBuilt,
          length: this.editingShip?.length,
          width: this.editingShip?.width,
          tonnage: this.editingShip?.tonnage,
          passengersDecks: this.editingShip?.passengersDecks,
          passengers: this.editingShip?.passengers,
          crew: this.editingShip?.crew,
          currency: this.editingShip?.currency,
          companyId: this.editingShip?.companyId,
        });
      }

      this.isInitializing = false;
    })

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(paramMap => {
      const shipId = paramMap.get('shipId');
      if (shipId) {
        this.mode = 'EDIT';
        this.commonFacade.getShip({id: shipId});
      } else {
        this.isInitializing = false;
      }
    });

    this.commonFacade.createShipSuccess$.pipe(takeUntil(this.destroy$)).subscribe(({ship}) => {
      this.snackService.showInfo('Pomyślnie dodano statek')
      this.router.changeRoute({linkParams: ['/admin/ships', ship.companyId]});
    })

    this.commonFacade.updateShipSuccess$.pipe(takeUntil(this.destroy$)).subscribe(({ship}) => {
      this.snackService.showInfo('Pomyślnie zaktualizowano statek')
      this.router.changeRoute({linkParams: ['/admin/ships', ship.companyId]});
    })

    this.commonFacade.deleteShipSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo("Pomyślnie usunięto statek")
      this.router.changeRoute({linkParams: ['/admin/ships']});
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
    this.snackService.showInfo('Pomyślnie dodano plik')

    if (file) {
      this.offerForm.patchValue({
        image: file
      });
    }
  }

  public submitForm(): void {
    const formValue = this.offerForm.value;
    const formData = new FormData();

    formData.append('name', formValue.name);
    formData.append('description', formValue.description);
    formData.append('yearBuilt', formValue.yearBuilt);
    formData.append('length', formValue.length);
    formData.append('width', formValue.width);
    formData.append('tonnage', formValue.tonnage);
    formData.append('passengersDecks', formValue.passengersDecks);
    formData.append('passengers', formValue.passengers);
    formData.append('crew', formValue.crew);
    formData.append('currency', formValue.currency);
    formData.append('companyId', formValue.companyId);

    if (formValue.image instanceof File) {
      formData.append('image', formValue.image);
    }


    if (this.mode === "ADD") {
      this.commonFacade.createShip({formData});
    }

    if (this.mode === "EDIT") {
      const id = this.editingShip.id
      this.commonFacade.updateShip({id, formData});
    }
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
