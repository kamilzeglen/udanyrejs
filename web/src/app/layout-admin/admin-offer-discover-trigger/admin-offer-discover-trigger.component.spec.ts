import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { EMPTY, of } from 'rxjs';
import { AdminOfferDiscoverTriggerComponent } from './admin-offer-discover-trigger.component';
import { CommonFacade } from '@state/common';
import { DiscoverFacade } from '@state/discover';
import { RouterFacade } from '@state/router';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';

describe('AdminOfferDiscoverTriggerComponent.submit', () => {
  let component: AdminOfferDiscoverTriggerComponent;
  let fixture: ComponentFixture<AdminOfferDiscoverTriggerComponent>;
  let discoverFacade: { startDiscovery: jasmine.Spy };

  beforeEach(async () => {
    discoverFacade = { startDiscovery: jasmine.createSpy('startDiscovery') };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AdminOfferDiscoverTriggerComponent],
      providers: [
        {
          provide: CommonFacade,
          useValue: {
            companies$: of([{ id: 'company-1', name: 'MSC Cruises' }]),
            getCompanies: (): void => undefined,
          },
        },
        {
          provide: DiscoverFacade,
          useValue: {
            starting$: of(false),
            startDiscoverySuccess$: EMPTY,
            startDiscoveryError$: EMPTY,
            startDiscovery: discoverFacade.startDiscovery,
          },
        },
        { provide: RouterFacade, useValue: { changeRoute: (): void => undefined } },
        { provide: SnackbarService, useValue: { showError: (): void => undefined, showInfo: (): void => undefined } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOfferDiscoverTriggerComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('does not dispatch when the form is invalid', () => {
    component.triggerForm.patchValue({ count: null, companyIds: [] });
    component.submit();
    expect(discoverFacade.startDiscovery).not.toHaveBeenCalled();
  });

  it('dispatches startDiscovery with the form value when valid', () => {
    component.triggerForm.patchValue({ count: 10, companyIds: ['company-1'] });
    component.submit();
    expect(discoverFacade.startDiscovery).toHaveBeenCalledWith({ count: 10, companyIds: ['company-1'] });
  });
});
