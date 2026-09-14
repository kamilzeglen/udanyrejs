import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImportConfirmResult, ImportEntityType, ImportPreviewResult } from '@interfaces';
import { ImportExportFacade } from '@state/importExport';
import { Subject } from 'rxjs';
import { ImportModalComponent, ImportModalData } from './import-modal.component';

interface CorrelatedPreviewEvent {
  entityType: ImportEntityType;
  requestId: string;
  result: ImportPreviewResult;
}

interface CorrelatedConfirmEvent {
  entityType: ImportEntityType;
  requestId: string;
  result: ImportConfirmResult;
}

describe('ImportModalComponent', () => {
  let component: ImportModalComponent;
  let fixture: ComponentFixture<ImportModalComponent>;
  let previewImportSuccess$: Subject<CorrelatedPreviewEvent>;
  let previewImportError$: Subject<{ entityType: ImportEntityType; requestId: string; errorMessage: string }>;
  let confirmImportSuccess$: Subject<CorrelatedConfirmEvent>;
  let confirmImportError$: Subject<{ entityType: ImportEntityType; requestId: string; errorMessage: string }>;
  let facade: { previewImport: jasmine.Spy; confirmImport: jasmine.Spy };
  let dialogRef: jasmine.SpyObj<MatDialogRef<ImportModalComponent>>;

  const data: ImportModalData = {
    entityType: 'ship',
    entityLabelSingular: 'statek',
    entityLabelPlural: 'statki',
    acceptExtension: '.zip',
  };

  beforeEach(async () => {
    previewImportSuccess$ = new Subject();
    previewImportError$ = new Subject();
    confirmImportSuccess$ = new Subject();
    confirmImportError$ = new Subject();
    facade = {
      previewImport: jasmine.createSpy('previewImport'),
      confirmImport: jasmine.createSpy('confirmImport'),
    };
    dialogRef = jasmine.createSpyObj<MatDialogRef<ImportModalComponent>>('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [ImportModalComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: ImportExportFacade,
          useValue: {
            ...facade,
            previewImportSuccess$,
            previewImportError$,
            confirmImportSuccess$,
            confirmImportError$,
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts idle and refuses preview without a file', () => {
    component.preview();

    expect(component.state).toBe('idle');
    expect(facade.previewImport).not.toHaveBeenCalled();
  });

  it('moves through previewing and ready and exposes row errors', () => {
    component.selectedFile = new File([], 'ships.zip');
    component.preview();
    const request = facade.previewImport.calls.mostRecent().args[0];

    expect(component.state).toBe('previewing');

    previewImportSuccess$.next({
      entityType: 'ship',
      requestId: request.requestId,
      result: {
        toCreate: 1,
        toUpdate: 0,
        errors: 1,
        rows: [{ rowRef: '2', action: 'error', label: 'Statek B', errors: ['Brak firmy'] }],
      },
    });

    expect(component.state).toBe('ready');
    expect(component.canConfirm).toBe(true);
    expect(component.previewRows).toEqual([{ label: 'Statek B', errorMessage: 'Brak firmy' }]);
  });

  it('blocks confirmation when no row can be imported', () => {
    component.selectedFile = new File([], 'ships.zip');
    component.preview();
    const request = facade.previewImport.calls.mostRecent().args[0];
    previewImportSuccess$.next({
      entityType: 'ship',
      requestId: request.requestId,
      result: { toCreate: 0, toUpdate: 0, errors: 2, rows: [] },
    });

    component.confirm();

    expect(component.canConfirm).toBe(false);
    expect(facade.confirmImport).not.toHaveBeenCalled();
  });

  it('ignores a stale response for an earlier file of the same entity type', () => {
    component.selectedFile = new File([], 'old.zip');
    component.preview();
    const oldRequestId = facade.previewImport.calls.mostRecent().args[0].requestId;

    component.selectedFile = new File([], 'new.zip');
    component.preview();
    const newRequestId = facade.previewImport.calls.mostRecent().args[0].requestId;

    previewImportSuccess$.next({
      entityType: 'ship',
      requestId: oldRequestId,
      result: { toCreate: 1, toUpdate: 0, errors: 0, rows: [] },
    });
    expect(component.state).toBe('previewing');

    previewImportSuccess$.next({
      entityType: 'ship',
      requestId: newRequestId,
      result: { toCreate: 0, toUpdate: 1, errors: 0, rows: [] },
    });
    expect(component.state).toBe('ready');
    expect(component.previewResult?.toUpdate).toBe(1);
  });

  it('moves through confirming and done for the current request', () => {
    component.selectedFile = new File([], 'ships.zip');
    component.preview();
    const previewRequestId = facade.previewImport.calls.mostRecent().args[0].requestId;
    previewImportSuccess$.next({
      entityType: 'ship',
      requestId: previewRequestId,
      result: { toCreate: 1, toUpdate: 0, errors: 0, rows: [] },
    });

    component.confirm();
    const confirmRequestId = facade.confirmImport.calls.mostRecent().args[0].requestId;
    expect(component.state).toBe('confirming');

    confirmImportSuccess$.next({
      entityType: 'ship',
      requestId: confirmRequestId,
      result: { created: ['row-1'], updated: [], failed: [] },
    });

    expect(component.state).toBe('done');
    component.close();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('stops reacting after teardown', () => {
    component.selectedFile = new File([], 'ships.zip');
    component.preview();
    const requestId = facade.previewImport.calls.mostRecent().args[0].requestId;
    fixture.destroy();

    previewImportSuccess$.next({
      entityType: 'ship',
      requestId,
      result: { toCreate: 1, toUpdate: 0, errors: 0, rows: [] },
    });

    expect(component.state).toBe('previewing');
  });
});
