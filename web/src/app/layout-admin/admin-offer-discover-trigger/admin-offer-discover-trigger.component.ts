import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject, takeUntil } from 'rxjs';
import { CommonFacade } from '@state/common';
import { DiscoverFacade } from '@state/discover';
import { RouterFacade } from '@state/router';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';

@Component({
  selector: 'app-admin-offer-discover-trigger',
  templateUrl: './admin-offer-discover-trigger.component.html',
  styleUrl: './admin-offer-discover-trigger.component.scss',
})
export class AdminOfferDiscoverTriggerComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public companies$ = this.commonFacade.companies$;
  public starting$ = this.discoverFacade.starting$;

  public triggerForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly commonFacade: CommonFacade,
    private readonly discoverFacade: DiscoverFacade,
    private readonly router: RouterFacade,
    private readonly snackService: SnackbarService,
  ) {}

  public ngOnInit(): void {
    this.triggerForm = this.fb.group({
      count: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
      companyIds: [[], [Validators.required, Validators.minLength(1)]],
    });

    this.discoverFacade.startDiscoverySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Wyszukiwanie ofert uruchomione - sprawdź poczekalnię za chwilę');
      this.router.changeRoute({ linkParams: ['/admin/offers/discover/drafts'] });
    });

    this.discoverFacade.startDiscoveryError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się uruchomić wyszukiwania ofert');
    });

    this.commonFacade.getCompanies();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public submit(): void {
    if (this.triggerForm.invalid) {
      return;
    }

    this.discoverFacade.startDiscovery(this.triggerForm.value);
  }

  public openDrafts(): void {
    this.router.changeRoute({ linkParams: ['/admin/offers/discover/drafts'] });
  }
}
