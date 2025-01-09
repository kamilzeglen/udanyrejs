import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '@environment';
import {Category, Company, Destination, Ship} from '@interfaces';

@Injectable({
  providedIn: 'root'
})
export class CommonHttpService {

  private API_URL = environment.API_URL;
  private defaultOpts = {withCredentials: true};

  constructor(
    private http: HttpClient
  ) {
  }

  public getCompanies(): Observable<Company[]> {
    const url = `${this.API_URL}/company`;
    return this.http.get<Company[]>(url);
  }

  public getCompany(payload: { id: string }): Observable<Company> {
    const url = `${this.API_URL}/company/details/` + payload.id;
    return this.http.get<Company>(url);
  }

  public createCompany(payload: { formData: FormData }): Observable<Company> {
    const url = `${this.API_URL}/company/`;
    return this.http.post<Company>(url, payload.formData, this.defaultOpts);
  }

  public updateCompany(payload: { id: string, formData: FormData }): Observable<Company> {
    const url = `${this.API_URL}/company/` + payload.id;
    return this.http.post<Company>(url, payload.formData, this.defaultOpts);
  }

  public deleteOffer(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/company/` + payload.id;
    return this.http.delete<boolean>(url, this.defaultOpts);
  }

  public getShips(payload: {companyId: string}): Observable<Ship[]> {
    const url = `${this.API_URL}/ship/` + payload.companyId;
    return this.http.get<Ship[]>(url);
  }

  public getShip(payload: { id: string }): Observable<Ship> {
    const url = `${this.API_URL}/ship/details/` + payload.id;
    return this.http.get<Ship>(url);
  }

  public createShip(payload: { formData: FormData }): Observable<Ship> {
    const url = `${this.API_URL}/ship/`;
    return this.http.post<Ship>(url, payload.formData, this.defaultOpts);
  }

  public updateShip(payload: { id: string, formData: FormData }): Observable<Ship> {
    const url = `${this.API_URL}/ship/` + payload.id;
    return this.http.post<Ship>(url, payload.formData, this.defaultOpts);
  }

  public deleteShip(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/ship/` + payload.id;
    return this.http.delete<boolean>(url, this.defaultOpts);
  }

  public getCategories(): Observable<Category[]> {
    const url = `${this.API_URL}/category`;
    return this.http.get<Category[]>(url);
  }

  public getDestinations(): Observable<Destination[]> {
    const url = `${this.API_URL}/destination/`;
    return this.http.get<Destination[]>(url);
  }
}
