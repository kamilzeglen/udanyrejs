import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackBarComponent } from './snack-bar.component';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  // CSS style for those classes in global styles.scss
  private panelClassesByMessageType = {
    warning: 'warning-snack',
    info: 'info-snack',
    error: 'error-snack',
  };

  private defaultPanelClass = 'snack-notify';
  private snackRef: MatSnackBarRef<SnackBarComponent>;

  constructor(private readonly snack: MatSnackBar) {}

  public showWarning(message: string): void {
    this.open(message, this.panelClassesByMessageType.warning);
  }

  public showInfo(message: string): void {
    this.open(message, this.panelClassesByMessageType.info);
  }

  public showError(message: string): void {
    this.open(message, this.panelClassesByMessageType.error);
  }

  private open(message: string, panelClass: string): void {
    const allPanelClasses = [this.defaultPanelClass, panelClass];

    this.snackRef = this.snack.openFromComponent(SnackBarComponent, {
      data: { message },
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: allPanelClasses,
      duration: 6000,
    });
  }

  public close(): void {
    this.snackRef?.dismiss();
  }

  public closeAll(): void {
    this.snack?.dismiss();
  }
}
