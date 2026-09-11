import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Offer, OfferScrapper, OfferSearchResult, SearchOffersPayload } from '@interfaces';
import { environment } from '@environment';
import { PaginatedResponse } from '../../_interfaces/http';

@Injectable({
  providedIn: 'root',
})
export class OffersHttpService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  public getOffers(payload?: Partial<SearchOffersPayload>): Observable<PaginatedResponse<OfferSearchResult>> {
    const url = `${this.API_URL}/offers/search`;
    return this.http.post<PaginatedResponse<OfferSearchResult>>(url, payload);
  }

  public getOffer(payload: { id: string }): Observable<Offer> {
    const url = `${this.API_URL}/offers/details/` + payload.id;
    return this.http.get<Offer>(url);
  }

  public createOffer(payload: { formData: Partial<Offer> }): Observable<Offer> {
    const url = `${this.API_URL}/offers/`;
    return this.http.post<Offer>(url, payload.formData);
  }

  public updateOffer(payload: { id: string; formData: Partial<Offer> }): Observable<Offer> {
    const url = `${this.API_URL}/offers/` + payload.id;
    return this.http.patch<Offer>(url, payload.formData);
  }

  public deleteOffer(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/offers/` + payload.id;
    return this.http.delete<boolean>(url);
  }

  public deactivateOffer(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/offers/` + payload.id + '/deactivate';
    return this.http.get<boolean>(url);
  }

  public activateOffer(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/offers/` + payload.id + '/activate';
    return this.http.get<boolean>(url);
  }

  public scrapeOffer(payload: { url: string }): Observable<OfferScrapper> {
    const url = `${this.API_URL}/offers/scrape`;
    return this.http.post<OfferScrapper>(url, { url: payload.url });
  }

  public syncOffer(payload: { id: string }): Observable<{ synced: boolean }> {
    const url = `${this.API_URL}/offers/` + payload.id + '/sync';
    return this.http.post<{ synced: boolean }>(url, {});
  }
}
