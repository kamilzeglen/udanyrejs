import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment';
import { Category, Company, Destination, Ship } from '@interfaces';
import { Log } from '../../_interfaces/log';

@Injectable({
  providedIn: 'root',
})
export class CommonHttpService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  // =========
  // Companies
  // =========

  public getCompanies(): Observable<Company[]> {
    const url = `${this.API_URL}/company`;
    return this.http.get<Company[]>(url);
  }

  public getCompany(payload: { id: string }): Observable<Company> {
    const url = `${this.API_URL}/company/details/` + payload.id;
    return this.http.get<Company>(url);
  }

  public createCompany(payload: { formData: Partial<Company> }): Observable<Company> {
    const url = `${this.API_URL}/company/`;
    return this.http.post<Company>(url, payload.formData);
  }

  public updateCompany(payload: { id: string; formData: Partial<Company> }): Observable<Company> {
    const url = `${this.API_URL}/company/` + payload.id;
    return this.http.patch<Company>(url, payload.formData);
  }

  public deleteCompany(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/company/` + payload.id;
    return this.http.delete<boolean>(url);
  }

  // =========
  // Ships
  // =========

  public getShips(payload: { companyId: string }): Observable<Ship[]> {
    const url = `${this.API_URL}/ship/` + payload.companyId;
    return this.http.get<Ship[]>(url);
  }

  public getShipById(payload: { id: string }): Observable<Ship> {
    const url = `${this.API_URL}/ship/details/id/` + payload.id;
    return this.http.get<Ship>(url);
  }

  public getShipByName(payload: { name: string }): Observable<Ship> {
    const url = `${this.API_URL}/ship/details/name/` + payload.name;
    return this.http.get<Ship>(url);
  }

  public createShip(payload: { formData: FormData }): Observable<Ship> {
    const url = `${this.API_URL}/ship/`;
    return this.http.post<Ship>(url, payload.formData);
  }

  public updateShip(payload: { id: string; formData: FormData }): Observable<Ship> {
    const url = `${this.API_URL}/ship/` + payload.id;
    return this.http.patch<Ship>(url, payload.formData);
  }

  public deleteShip(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/ship/` + payload.id;
    return this.http.delete<boolean>(url);
  }

  // =========
  // Category
  // =========

  public getCategories(): Observable<Category[]> {
    const url = `${this.API_URL}/category`;
    return this.http.get<Category[]>(url);
  }

  public getCategory(payload: { id: string }): Observable<Category> {
    const url = `${this.API_URL}/category/details/` + payload.id;
    return this.http.get<Category>(url);
  }

  public createCategory(payload: { formData: FormData }): Observable<Category> {
    const url = `${this.API_URL}/category/`;
    return this.http.post<Category>(url, payload.formData);
  }

  public updateCategory(payload: { id: string; formData: FormData }): Observable<Category> {
    const url = `${this.API_URL}/category/` + payload.id;
    return this.http.patch<Category>(url, payload.formData);
  }

  public deleteCategory(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/category/` + payload.id;
    return this.http.delete<boolean>(url);
  }

  // =========
  // Destination
  // =========

  public getDestinations(): Observable<Destination[]> {
    const url = `${this.API_URL}/destination/`;
    return this.http.get<Destination[]>(url);
  }

  public getDestination(payload: { id: string }): Observable<Destination> {
    const url = `${this.API_URL}/destination/details/` + payload.id;
    return this.http.get<Destination>(url);
  }

  public createDestination(payload: { formData: FormData }): Observable<Destination> {
    const url = `${this.API_URL}/destination/`;
    return this.http.post<Destination>(url, payload.formData);
  }

  public updateDestination(payload: { id: string; formData: FormData }): Observable<Destination> {
    const url = `${this.API_URL}/destination/` + payload.id;
    return this.http.patch<Destination>(url, payload.formData);
  }

  public deleteDestination(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/destination/` + payload.id;
    return this.http.delete<boolean>(url);
  }

  // =========
  // Logs
  // =========

  public getLogs(): Observable<Log[]> {
    const url = `${this.API_URL}/log/`;
    return this.http.get<Log[]>(url);
  }
}
