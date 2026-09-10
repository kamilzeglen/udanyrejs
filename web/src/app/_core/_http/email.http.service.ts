import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment';
import { Email } from '../../_interfaces/email';

@Injectable({
  providedIn: 'root',
})
export class EmailHttpService {
  public API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  public sendEmail(payload: Email): Observable<boolean> {
    const url = `${this.API_URL}/email/send`;
    return this.http.post<boolean>(url, payload);
  }
}
