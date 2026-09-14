import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, defer, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '@environment';
import { CabinType, Category, City, Company, Destination, Ship } from '@interfaces';
import { Log } from '../../_interfaces/log';

interface DictionaryCacheEntry {
  expiresAt: number;
  response$: Observable<unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class CommonHttpService {
  private API_URL = environment.API_URL;
  private readonly dictionaryCache = new Map<string, DictionaryCacheEntry>();
  private readonly dictionaryCacheTtl = 5 * 60 * 1000;

  constructor(private http: HttpClient) {}

  // =========
  // Companies
  // =========

  public getCompanies(): Observable<Company[]> {
    const url = `${this.API_URL}/company`;
    return this.getCachedDictionary<Company[]>(url);
  }

  public getCompany(payload: { id: string }): Observable<Company> {
    const url = `${this.API_URL}/company/details/` + payload.id;
    return this.http.get<Company>(url);
  }

  public createCompany(payload: { formData: Partial<Company> }): Observable<Company> {
    const url = `${this.API_URL}/company/`;
    return this.invalidateDictionaries(this.http.post<Company>(url, payload.formData));
  }

  public updateCompany(payload: { id: string; formData: Partial<Company> }): Observable<Company> {
    const url = `${this.API_URL}/company/` + payload.id;
    return this.invalidateDictionaries(this.http.patch<Company>(url, payload.formData));
  }

  public deleteCompany(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/company/` + payload.id;
    return this.invalidateDictionaries(this.http.delete<boolean>(url));
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
    return this.invalidateDictionaries(this.http.post<Ship>(url, payload.formData));
  }

  public updateShip(payload: { id: string; formData: FormData }): Observable<Ship> {
    const url = `${this.API_URL}/ship/` + payload.id;
    return this.invalidateDictionaries(this.http.patch<Ship>(url, payload.formData));
  }

  public deleteShip(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/ship/` + payload.id;
    return this.invalidateDictionaries(this.http.delete<boolean>(url));
  }

  // =========
  // Category
  // =========

  public getCategories(): Observable<Category[]> {
    const url = `${this.API_URL}/category`;
    return this.getCachedDictionary<Category[]>(url);
  }

  public getCategory(payload: { id: string }): Observable<Category> {
    const url = `${this.API_URL}/category/details/` + payload.id;
    return this.http.get<Category>(url);
  }

  public createCategory(payload: { formData: FormData }): Observable<Category> {
    const url = `${this.API_URL}/category/`;
    return this.invalidateDictionaries(this.http.post<Category>(url, payload.formData));
  }

  public updateCategory(payload: { id: string; formData: FormData }): Observable<Category> {
    const url = `${this.API_URL}/category/` + payload.id;
    return this.invalidateDictionaries(this.http.patch<Category>(url, payload.formData));
  }

  public deleteCategory(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/category/` + payload.id;
    return this.invalidateDictionaries(this.http.delete<boolean>(url));
  }

  // =========
  // Destination
  // =========

  public getDestinations(): Observable<Destination[]> {
    const url = `${this.API_URL}/destination/`;
    return this.getCachedDictionary<Destination[]>(url);
  }

  public getDestination(payload: { id: string }): Observable<Destination> {
    const url = `${this.API_URL}/destination/details/` + payload.id;
    return this.http.get<Destination>(url);
  }

  public createDestination(payload: { formData: FormData }): Observable<Destination> {
    const url = `${this.API_URL}/destination/`;
    return this.invalidateDictionaries(this.http.post<Destination>(url, payload.formData));
  }

  public updateDestination(payload: { id: string; formData: FormData }): Observable<Destination> {
    const url = `${this.API_URL}/destination/` + payload.id;
    return this.invalidateDictionaries(this.http.patch<Destination>(url, payload.formData));
  }

  public deleteDestination(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/destination/` + payload.id;
    return this.invalidateDictionaries(this.http.delete<boolean>(url));
  }

  // =========
  // City
  // =========

  public getCities(): Observable<City[]> {
    const url = `${this.API_URL}/city/`;
    return this.http.get<City[]>(url);
  }

  public getCity(payload: { id: string }): Observable<City> {
    const url = `${this.API_URL}/city/details/` + payload.id;
    return this.http.get<City>(url);
  }

  public createCity(payload: { formData: Partial<City> }): Observable<City> {
    const url = `${this.API_URL}/city/`;
    return this.invalidateDictionaries(this.http.post<City>(url, payload.formData));
  }

  public updateCity(payload: { id: string; formData: Partial<City> }): Observable<City> {
    const url = `${this.API_URL}/city/` + payload.id;
    return this.invalidateDictionaries(this.http.patch<City>(url, payload.formData));
  }

  public deleteCity(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/city/` + payload.id;
    return this.invalidateDictionaries(this.http.delete<boolean>(url));
  }

  // =========
  // Logs
  // =========

  public getLogs(): Observable<Log[]> {
    const url = `${this.API_URL}/log/`;
    return this.http.get<Log[]>(url);
  }

  // =========
  // Cabin types
  // =========

  public getCabinTypes(payload: { companyId: string }): Observable<CabinType[]> {
    const url = `${this.API_URL}/cabin-type/` + payload.companyId;
    return this.http.get<CabinType[]>(url);
  }

  public getAllCabinTypes(): Observable<CabinType[]> {
    const url = `${this.API_URL}/cabin-type`;
    return this.http.get<CabinType[]>(url);
  }

  public createCabinType(payload: { formData: FormData }): Observable<CabinType> {
    const url = `${this.API_URL}/cabin-type/`;
    return this.invalidateDictionaries(this.http.post<CabinType>(url, payload.formData));
  }

  public updateCabinType(payload: { id: string; formData: FormData }): Observable<CabinType> {
    const url = `${this.API_URL}/cabin-type/` + payload.id;
    return this.invalidateDictionaries(this.http.patch<CabinType>(url, payload.formData));
  }

  public removeCabinType(payload: { id: string }): Observable<boolean> {
    const url = `${this.API_URL}/cabin-type/` + payload.id;
    return this.invalidateDictionaries(this.http.delete<boolean>(url));
  }

  private getCachedDictionary<T>(url: string): Observable<T> {
    return defer(() => {
      const cached = this.dictionaryCache.get(url);

      if (cached && cached.expiresAt > Date.now()) {
        return cached.response$ as Observable<T>;
      }

      const entry: DictionaryCacheEntry = {
        expiresAt: Infinity,
        response$: this.http.get<T>(url).pipe(
          tap(() => {
            entry.expiresAt = Date.now() + this.dictionaryCacheTtl;
          }),
          catchError((error: unknown) => {
            if (this.dictionaryCache.get(url) === entry) {
              this.dictionaryCache.delete(url);
            }

            return throwError(() => error);
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        ),
      };

      this.dictionaryCache.set(url, entry);
      return entry.response$ as Observable<T>;
    });
  }

  private invalidateDictionaries<T>(request$: Observable<T>): Observable<T> {
    return request$.pipe(tap(() => this.dictionaryCache.clear()));
  }
}
