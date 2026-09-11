import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, ReplaySubject, take, takeUntil } from 'rxjs';
import { DiscoverFacade } from '@state/discover';
import { RouterFacade } from '@state/router';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { ScrapedOfferDraft } from '@interfaces';

@Component({
  selector: 'app-admin-offer-draft-list',
  templateUrl: './admin-offer-draft-list.component.html',
  styleUrl: './admin-offer-draft-list.component.scss',
})
export class AdminOfferDraftListComponent implements OnInit, OnDestroy {
  private static readonly POLL_INTERVAL_MS = 5000;

  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public drafts$ = this.discoverFacade.drafts$;

  public readonly columnsToDisplay = ['name', 'shipName', 'company', 'terms', 'actions'];

  constructor(
    private readonly discoverFacade: DiscoverFacade,
    private readonly routerFacade: RouterFacade,
    private readonly confirmationModalService: ConfirmationModalService,
    private readonly snackService: SnackbarService,
  ) {}

  public ngOnInit(): void {
    this.discoverFacade.deleteDraftSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Draft odrzucony');
      this.discoverFacade.getDrafts();
    });

    this.discoverFacade.getDrafts();

    interval(AdminOfferDraftListComponent.POLL_INTERVAL_MS)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.discoverFacade.getDrafts());
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public editDraft(draft: ScrapedOfferDraft): void {
    const linkParams = ['/admin/offers/discover/drafts/' + draft.id];
    this.routerFacade.changeRoute({ linkParams });
  }

  public goToDiscoverTrigger(): void {
    this.routerFacade.changeRoute({ linkParams: ['/admin/offers/discover'] });
  }

  public discardDraft(draft: ScrapedOfferDraft): void {
    this.confirmationModalService
      .open({ message: 'Odrzucić draft "' + draft.name + '"?' })
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.discoverFacade.deleteDraft({ id: draft.id });
      });
  }
}
