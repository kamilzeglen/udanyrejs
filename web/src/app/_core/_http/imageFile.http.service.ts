import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '@environment';
import {ImageFile} from '../../_interfaces/file';

@Injectable({
  providedIn: 'root'
})
export class ImageFileHttpService {

  public API_URL = environment.API_URL;

  constructor(
    private http: HttpClient
  ) {
  }

  public createImageFile(payload: { imageFileType: string, targetId: string, formData: FormData }): Observable<ImageFile> {
    const url = `${this.API_URL}/image-file/` + payload.imageFileType + `/` + payload.targetId ;
    return this.http.post<ImageFile>(url, payload.formData);
  }

  public updateImageFile(payload: { imageFileType: string, targetId: string, formData: FormData }): Observable<ImageFile> {
    const url = `${this.API_URL}/image-file/` + payload.imageFileType + `/` + payload.targetId ;
    return this.http.patch<ImageFile>(url, payload.formData);
  }
}
