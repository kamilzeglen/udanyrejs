import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment';
import { User } from '@interfaces';

@Injectable({
  providedIn: 'root',
})
export class UsersHttpService {
  public API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  public getUsers(): Observable<User[]> {
    const url = `${this.API_URL}/users/`;
    return this.http.get<User[]>(url);
  }
}
