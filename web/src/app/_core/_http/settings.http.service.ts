import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Settings } from '@interfaces';
import { environment } from '@environment';

@Injectable({
  providedIn: 'root',
})
export class SettingsHttpService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  public getSettings(): Observable<Settings> {
    const url = `${this.API_URL}/settings/`;
    return this.http.get<Settings>(url);
  }

  public updateSettings(payload: Partial<Settings>): Observable<Settings> {
    const url = `${this.API_URL}/settings/`;
    return this.http.patch<Settings>(url, payload);
  }

  public runSyncNow(): Observable<{ started: boolean }> {
    const url = `${this.API_URL}/offers/sync-now`;
    return this.http.post<{ started: boolean }>(url, {});
  }
}
