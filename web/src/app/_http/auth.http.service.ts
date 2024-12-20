import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '@environment';
import {User} from '@interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthHttpService {

  public API_URL = environment.API_URL;

  constructor(
    private http: HttpClient
  ) {
  }

  public getMyself(): Observable<User> {
    const url = `${this.API_URL}/auth/myself`;
    return this.http.get<User>(url, {withCredentials: true});
  }

  public login(payload: { email: string, password: string }): Observable<User> {
    const url = `${this.API_URL}/auth/login`;
    return this.http.post<User>(url, payload, {withCredentials: true});
  }
}
