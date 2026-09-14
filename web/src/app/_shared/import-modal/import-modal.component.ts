import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImportConfirmResult, ImportEntityType, ImportPreviewResult } from '@interfaces';
import { ImportExportFacade } from '@state/importExport';

export interface ImportModalData {
  entityType: ImportEntityType;
  entityLabelSingular: string;
  entityLabelPlural: string;
  acceptExtension: '.csv' | '.zip';
}

export type ImportModalState = 'idle' | 'previewing' | 'ready' | 'confirming' | 'done';

interface ImportPreviewRowView {
  label: string;
  errorMessage: string;
}

@Component({
  selector: 'app-import-modal',
  templateUrl: './import-modal.component.html',
  styleUrl: './import-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportModalComponent implements OnInit {
  private requestSequence = 0;
  private activePreviewRequestId = '';
  private activeConfirmRequestId = '';

  public state: ImportModalState = 'idle';
  public selectedFile: File = null;
  public previewResult: ImportPreviewResult = null;
  public confirmResult: ImportConfirmResult = null;
  public previewRows: ImportPreviewRowView[] = [];
  public errorMessage: string = null;
  public canConfirm = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: ImportModalData,
    private readonly dialogRef: MatDialogRef<ImportModalComponent>,
    private readonly importExportFacade: ImportExportFacade,
    private readonly destroyRef: DestroyRef,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  public ngOnInit(): void {
    this.importExportFacade.previewImportSuccess$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ entityType, requestId, result }) => {
        if (entityType !== this.data.entityType || requestId !== this.activePreviewRequestId) {
          return;
        }

        this.previewResult = result;
        this.previewRows = result.rows
          .filter((row) => row.errors.length > 0)
          .map((row) => ({ label: row.label, errorMessage: row.errors.join(', ') }));
        this.canConfirm = result.toCreate + result.toUpdate > 0;
        this.errorMessage = null;
        this.state = 'ready';
        this.changeDetectorRef.markForCheck();
      });

    this.importExportFacade.previewImportError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ entityType, requestId, errorMessage }) => {
        if (entityType !== this.data.entityType || requestId !== this.activePreviewRequestId) {
          return;
        }

        this.errorMessage = errorMessage;
        this.state = 'idle';
        this.changeDetectorRef.markForCheck();
      });

    this.importExportFacade.confirmImportSuccess$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ entityType, requestId, result }) => {
        if (entityType !== this.data.entityType || requestId !== this.activeConfirmRequestId) {
          return;
        }

        this.confirmResult = result;
        this.errorMessage = null;
        this.state = 'done';
        this.changeDetectorRef.markForCheck();
      });

    this.importExportFacade.confirmImportError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ entityType, requestId, errorMessage }) => {
        if (entityType !== this.data.entityType || requestId !== this.activeConfirmRequestId) {
          return;
        }

        this.errorMessage = errorMessage;
        this.state = 'ready';
        this.changeDetectorRef.markForCheck();
      });
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.activePreviewRequestId = '';
    this.activeConfirmRequestId = '';
    this.previewResult = null;
    this.confirmResult = null;
    this.previewRows = [];
    this.errorMessage = null;
    this.canConfirm = false;
    this.state = 'idle';
  }

  public preview(): void {
    if (this.selectedFile === null) {
      return;
    }

    this.requestSequence += 1;
    this.activePreviewRequestId = `${this.data.entityType}-preview-${this.requestSequence}`;
    this.activeConfirmRequestId = '';
    this.previewResult = null;
    this.previewRows = [];
    this.errorMessage = null;
    this.canConfirm = false;
    this.state = 'previewing';
    this.importExportFacade.previewImport({
      entityType: this.data.entityType,
      file: this.selectedFile,
      requestId: this.activePreviewRequestId,
    });
  }

  public confirm(): void {
    if (this.selectedFile === null || this.canConfirm === false || this.state !== 'ready') {
      return;
    }

    this.requestSequence += 1;
    this.activeConfirmRequestId = `${this.data.entityType}-confirm-${this.requestSequence}`;
    this.errorMessage = null;
    this.state = 'confirming';
    this.importExportFacade.confirmImport({
      entityType: this.data.entityType,
      file: this.selectedFile,
      requestId: this.activeConfirmRequestId,
    });
  }

  public close(): void {
    this.dialogRef.close(this.state === 'done');
  }
}
