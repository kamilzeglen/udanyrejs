import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '@environment';
import {Offer} from '@interfaces';

@Injectable({
  providedIn: 'root'
})
export class ScrapperHttpService {

  public API_URL = environment.SCRAPPER_URL;

  constructor(
    private http: HttpClient
  ) {
  }

  public scrapOffer(payload: { url: string}): Observable<Partial<Offer>> {
    const url = `${this.API_URL}/scrapper/offer`;
    return this.http.post<Partial<Offer>>(url, payload);
  }
}
