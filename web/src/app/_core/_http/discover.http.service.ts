import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScrapedOfferDraft } from '@interfaces';
import { environment } from '@environment';

@Injectable({
  providedIn: 'root',
})
export class DiscoverHttpService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  public startDiscovery(payload: { count: number; companyIds: string[] }): Observable<{ started: boolean }> {
    const url = `${this.API_URL}/offers/discover`;
    return this.http.post<{ started: boolean }>(url, payload);
  }

  public getDrafts(): Observable<ScrapedOfferDraft[]> {
    const url = `${this.API_URL}/offers/discover/drafts`;
    return this.http.get<ScrapedOfferDraft[]>(url);
  }

  public getDraft(payload: { id: string }): Observable<ScrapedOfferDraft> {
    const url = `${this.API_URL}/offers/discover/drafts/` + payload.id;
    return this.http.get<ScrapedOfferDraft>(url);
  }

  public deleteDraft(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/offers/discover/drafts/` + payload.id;
    return this.http.delete<boolean>(url);
  }
}
