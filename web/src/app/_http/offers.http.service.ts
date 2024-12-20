import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Offer} from '@interfaces';
import { environment } from '@environment';

@Injectable({
  providedIn: 'root'
})
export class OffersHttpService {

  public API_URL = environment.API_URL;

  constructor(
    private http: HttpClient
  ) {
  }

  public createOffer(payload: Partial<Offer>): Observable<Offer> {
    const url = `${this.API_URL}/offers/`;
    return this.http.post<Offer>(url, payload);
  }

  public getOffers(): Observable<Offer[]> {
    const url = `${this.API_URL}/offers/`;
    return this.http.get<Offer[]>(url);
  }

  public getOffer(payload: {id: string}): Observable<Offer> {
    const url = `${this.API_URL}/offers/` + payload.id;
    return this.http.get<Offer>(url);
  }

  public deleteOffer(): Observable<Offer[]> {
    const url = `${this.API_URL}/offers/`;
    return this.http.delete<Offer[]>(url);
  }
}
