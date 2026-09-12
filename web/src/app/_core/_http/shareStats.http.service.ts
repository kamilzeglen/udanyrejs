import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment';
import { User } from '@interfaces';

@Injectable({
  providedIn: 'root',
})
export class ShareStatsHttpService {
  public API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  public shareStats(payload: { platform: string; offerId: string; termId: string }): Observable<User> {
    const url = `${this.API_URL}/share/${payload.platform}/${payload.offerId}/${payload.termId}`;
    return this.http.get<User>(url, { withCredentials: true });
  }
}
