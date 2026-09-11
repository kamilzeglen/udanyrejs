import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EMPTY, of } from 'rxjs';
import { AdminOfferDraftListComponent } from './admin-offer-draft-list.component';
import { DiscoverFacade } from '@state/discover';
import { RouterFacade } from '@state/router';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';

describe('AdminOfferDraftListComponent', () => {
  let component: AdminOfferDraftListComponent;
  let fixture: ComponentFixture<AdminOfferDraftListComponent>;
  let discoverFacade: { getDrafts: jasmine.Spy; deleteDraft: jasmine.Spy };
  let routerFacade: { changeRoute: jasmine.Spy };

  beforeEach(async () => {
    discoverFacade = {
      getDrafts: jasmine.createSpy('getDrafts'),
      deleteDraft: jasmine.createSpy('deleteDraft'),
    };
    routerFacade = { changeRoute: jasmine.createSpy('changeRoute') };

    await TestBed.configureTestingModule({
      declarations: [AdminOfferDraftListComponent],
      providers: [
        {
          provide: DiscoverFacade,
          useValue: {
            drafts$: of([{ id: 'draft-1', name: 'Rejs testowy' }]),
            getDraftsSuccess$: EMPTY,
            deleteDraftSuccess$: EMPTY,
            getDrafts: discoverFacade.getDrafts,
            deleteDraft: discoverFacade.deleteDraft,
          },
        },
        { provide: RouterFacade, useValue: routerFacade },
        { provide: ConfirmationModalService, useValue: {} },
        { provide: SnackbarService, useValue: { showError: (): void => undefined, showInfo: (): void => undefined } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOfferDraftListComponent);
    component = fixture.componentInstance;
  });

  it('loads drafts on init', () => {
    component.ngOnInit();
    expect(discoverFacade.getDrafts).toHaveBeenCalled();
  });

  it('navigates to the draft editor when editing a draft', () => {
    component.editDraft({ id: 'draft-1', name: 'Rejs testowy' } as never);
    expect(routerFacade.changeRoute).toHaveBeenCalledWith({ linkParams: ['/admin/offers/discover/drafts/draft-1'] });
  });
});
