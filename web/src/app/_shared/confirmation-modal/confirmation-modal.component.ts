import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalOpts } from './confirmation-modal.service';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent implements OnInit {
  public message = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ModalOpts,
    public dialogRef: MatDialogRef<ConfirmationModalComponent>
  ) {}

  ngOnInit(): void {
    if (this.data.message !== undefined) {
      this.message = this.data.message;
    }
  }

  public close(): void {
    this.dialogRef.close(false);
  }

  public save(): void {
    if (this.data.message) {
      this.dialogRef.close(this.message);
    } else {
      this.dialogRef.close(true);
    }
  }
}
