import {HttpClient} from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ImgbbService {
  private readonly apiKey: string="ae6e0b3b9be3e7f4aea315fdd3233ff1";

  constructor(private readonly httpClient:HttpClient) { }

  upload(file:File):Observable<string>{
    const formData = new FormData();
    formData.append('image', file);
    return this.httpClient
      .post('https://api.imgbb.com/1/upload',formData,{params:{key:this.apiKey}})
      .pipe(map((response:any) => response['data']['url']));

  }
}
