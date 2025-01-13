import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '@environment';
import {PdfFile} from '../../_interfaces/file';

@Injectable({
  providedIn: 'root'
})
export class PdfFileHttpService {

  public API_URL = environment.API_URL;

  constructor(
    private http: HttpClient
  ) {
  }

  public createPdfFile(payload: { pdfFileType: string, targetId: string, formData: FormData }): Observable<PdfFile> {
    const url = `${this.API_URL}/pdf-file/` + payload.pdfFileType + `/` + payload.targetId ;
    return this.http.post<PdfFile>(url, payload.formData);
  }

  public updatePdfFile(payload: { pdfFileType: string, targetId: string, formData: FormData }): Observable<PdfFile> {
    const url = `${this.API_URL}/pdf-file/` + payload.pdfFileType + `/` + payload.targetId ;
    return this.http.patch<PdfFile>(url, payload.formData);
  }
}
