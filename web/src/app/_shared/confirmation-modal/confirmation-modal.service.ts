import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationModalComponent } from './confirmation-modal.component';

export interface ModalOpts {
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationModalService {
  constructor(private dialog: MatDialog) {}

  public open(opts: ModalOpts): MatDialogRef<ConfirmationModalComponent> {
    const dialogWidth = '500px';

    return this.dialog.open(ConfirmationModalComponent, {
      width: dialogWidth,
      maxWidth: dialogWidth,
      panelClass: ['confirmation-modal'],
      data: { ...opts },
    });
  }
}
