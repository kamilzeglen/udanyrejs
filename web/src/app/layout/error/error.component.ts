import { Component } from '@angular/core';
import { ConnectivityService } from '@core/connectivity/connectivity.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
})
export class ErrorComponent {
  public checking$ = this.connectivityService.checking$;

  constructor(private readonly connectivityService: ConnectivityService) {}

  public retryNow(): void {
    this.connectivityService.retryNow();
  }
}
