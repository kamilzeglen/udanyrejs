import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '@environment';
import {Company} from '@interfaces';

@Injectable({
  providedIn: 'root'
})
export class CommonHttpService {

  public API_URL = environment.API_URL;

  constructor(
    private http: HttpClient
  ) {
  }

  public getCompanies(): Observable<Company[]> {
    const url = `${this.API_URL}/company`;
    return this.http.get<Company[]>(url);
  }
}
