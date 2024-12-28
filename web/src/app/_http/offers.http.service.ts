import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Offer} from '@interfaces';
import { environment } from '@environment';

@Injectable({
  providedIn: 'root'
})
export class OffersHttpService {

  private API_URL = environment.API_URL;
  private defaultOpts = { withCredentials: true };

  constructor(
    private http: HttpClient
  ) {
  }

  public getOffers(): Observable<Offer[]> {
    const url = `${this.API_URL}/offers/`;
    return this.http.get<Offer[]>(url);
  }

  public getOffer(payload: {id: string}): Observable<Offer> {
    const url = `${this.API_URL}/offers/` + payload.id;
    return this.http.get<Offer>(url);
  }

  public createOffer(payload: { formData: FormData }): Observable<Offer> {
    const url = `${this.API_URL}/offers/`;
    return this.http.post<Offer>(url, payload.formData, this.defaultOpts);
  }

  public updateOffer(payload: { id: string, formData: FormData }): Observable<Offer> {
    const url = `${this.API_URL}/offers/` + payload.id;
    return this.http.post<Offer>(url, payload.formData, this.defaultOpts);
  }

  public deleteOffer(payload: {id: string}): Observable<boolean> {
    const url = `${this.API_URL}/offers/` + payload.id;
    return this.http.delete<boolean>(url, this.defaultOpts);
  }
}
