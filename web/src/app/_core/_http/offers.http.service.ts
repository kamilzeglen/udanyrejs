import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Offer, SearchOffersPayload} from '@interfaces';
import { environment } from '@environment';

@Injectable({
  providedIn: 'root'
})
export class OffersHttpService {

  private API_URL = environment.API_URL;

  constructor(
    private http: HttpClient
  ) {
  }

  public getOffers(payload?: Partial<SearchOffersPayload>): Observable<{ offers: Offer[]; totalCount: number }> {
    const url = `${this.API_URL}/offers/search`;
    return this.http.post<{ offers: Offer[]; totalCount: number }>(url, payload);
  }

  public getOffer(payload: {id: string}): Observable<Offer> {
    const url = `${this.API_URL}/offers/details/` + payload.id;
    return this.http.get<Offer>(url);
  }

  public createOffer(payload: { formData: Partial<Offer> }): Observable<Offer> {
    const url = `${this.API_URL}/offers/`;
    return this.http.post<Offer>(url, payload.formData);
  }

  public updateOffer(payload: { id: string, formData: Partial<Offer> }): Observable<Offer> {
    const url = `${this.API_URL}/offers/` + payload.id;
    return this.http.patch<Offer>(url, payload.formData);
  }

  public deleteOffer(payload: {id: string}): Observable<boolean> {
    const url = `${this.API_URL}/offers/` + payload.id;
    return this.http.delete<boolean>(url);
  }
}
