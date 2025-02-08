import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '@environment';
import {ImageFile, PdfFile} from '../../_interfaces/file';

@Injectable({
  providedIn: 'root'
})
export class PdfFileHttpService {

  public API_URL = environment.API_URL;

  constructor(
    private http: HttpClient
  ) {
  }

  public createPdfFile(payload: { pdfFileType: string, targetId: string, pdfUrl?: string, file?: FormData }): Observable<PdfFile> {
    const url = `${this.API_URL}/pdf-file/` + payload.pdfFileType + `/` + payload.targetId ;
    if (payload.pdfUrl) {
      return this.http.post<ImageFile>(url, {imageUrl: payload.pdfUrl});
    }
    else {
      return this.http.post<ImageFile>(url, payload.file);
    }
  }

  public updatePdfFile(payload: { pdfFileType: string, targetId: string, pdfUrl?: string, file?: FormData }): Observable<PdfFile> {
    const url = `${this.API_URL}/pdf-file/` + payload.pdfFileType + `/` + payload.targetId ;
    if (payload.pdfUrl) {
      return this.http.patch<PdfFile>(url, {imageUrl: payload.pdfUrl});
    } else {
      return this.http.put<PdfFile>(url, payload.file);
    }
  }

  public downloadPdfFile(payload: { pdfFileId: string }): Observable<Blob> {
    const url = `${this.API_URL}/pdf-file/${payload.pdfFileId}`;
    return this.http.get(url, {responseType: 'blob'});
  }
}
