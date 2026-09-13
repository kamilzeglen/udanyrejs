import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Offer,
  OfferBulkSyncResult,
  OfferScrapper,
  OfferSearchResult,
  OfferSyncResult,
  OfferTermsBulkSyncResult,
  SearchOffersPayload,
} from '@interfaces';
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

  public deleteOffers(payload: { ids: string[] }): Observable<{ deletedIds: string[]; failedIds: string[] }> {
    const url = `${this.API_URL}/offers/bulk-delete`;
    return this.http.post<{ deletedIds: string[]; failedIds: string[] }>(url, payload);
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

  public syncOffer(payload: { id: string }): Observable<OfferSyncResult> {
    const url = `${this.API_URL}/offers/` + payload.id + '/sync';
    return this.http.post<OfferSyncResult>(url, {});
  }

  public syncOffers(payload: { ids: string[] }): Observable<OfferBulkSyncResult> {
    const url = `${this.API_URL}/offers/bulk-sync`;
    return this.http.post<OfferBulkSyncResult>(url, payload);
  }

  public syncTerms(payload: { termIds: string[] }): Observable<OfferTermsBulkSyncResult> {
    const url = `${this.API_URL}/offers/terms/bulk-sync`;
    return this.http.post<OfferTermsBulkSyncResult>(url, payload);
  }
}
