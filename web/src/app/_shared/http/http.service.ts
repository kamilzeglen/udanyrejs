import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Offer} from '../../_interfaces/offer';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  public API_URL = environment.API_URL;

  constructor(
    private http: HttpClient
  ) {
  }

  public getAllOffers(): Observable<Offer[]> {
    const url = `${this.API_URL}/offers/`;
    return this.http.get<Offer[]>(url);
  }

  public getOfferDetails(offerID: string): Observable<Offer> {
    const url = `${this.API_URL}/offers/${offerID}`;
    return this.http.get<Offer>(url);
  }

  public createOffer(body: any): Observable<boolean> {
    const url = `${this.API_URL}/offers/add`;
    return this.http.post<boolean>(url, body);
  }

  public deleteOffer(offerID: any): Observable<boolean> {
    const url = `${this.API_URL}/offers/remove/${offerID}`;
    return this.http.delete<boolean>(url);
  }
}
