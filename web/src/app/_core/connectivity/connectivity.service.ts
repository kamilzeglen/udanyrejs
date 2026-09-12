import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, finalize, interval, of, Subscription } from 'rxjs';
import { environment } from '@environment';

const HEALTH_CHECK_INTERVAL_MS = 5000;

@Injectable({
  providedIn: 'root',
})
export class ConnectivityService {
  private offline = new BehaviorSubject<boolean>(false);
  public readonly offline$ = this.offline.asObservable();

  private checking = new BehaviorSubject<boolean>(false);
  public readonly checking$ = this.checking.asObservable();

  private pollingSubscription: Subscription = null;
  private returnUrl: string = null;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  public isOffline(): boolean {
    return this.offline.value;
  }

  public markOffline(): void {
    if (this.offline.value === true) {
      return;
    }

    this.returnUrl = this.router.url === '/error' ? this.returnUrl : this.router.url;
    this.offline.next(true);
    this.router.navigate(['/error']);
    this.startPolling();
  }

  public retryNow(): void {
    this.checkHealth();
  }

  private startPolling(): void {
    this.pollingSubscription = interval(HEALTH_CHECK_INTERVAL_MS).subscribe(() => this.checkHealth());
  }

  private checkHealth(): void {
    if (this.checking.value === true) {
      return;
    }

    this.checking.next(true);

    this.http
      .get(`${environment.API_URL}/health`)
      .pipe(
        catchError(() => of(null)),
        finalize(() => this.checking.next(false)),
      )
      .subscribe((result) => {
        if (result !== null) {
          this.markOnline();
        }
      });
  }

  private markOnline(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }

    this.offline.next(false);
    this.router.navigateByUrl(this.returnUrl || '/');
  }
}
