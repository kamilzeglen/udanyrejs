import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '@environment';
import {OfferScrapper} from '@interfaces';

@Injectable({
  providedIn: 'root'
})
export class ScrapperHttpService {

  public API_URL = environment.API_URL;
  public SCRAPPER_URL = environment.SCRAPPER_URL;

  constructor(
    private http: HttpClient
  ) {
  }

  public scrapOffer(payload: { url: string }): Observable<OfferScrapper> {
    const url = `${this.SCRAPPER_URL}/full-scrap`;
    return this.http.post<OfferScrapper>(url, payload);
  }

  public syncOfferPrice(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/offers/` + payload.id + '/sync';
    return this.http.get<boolean>(url);
  }
}
