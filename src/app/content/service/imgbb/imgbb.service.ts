import {HttpClient} from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ImgbbService {
  private readonly apiKey: string="e20a8b081ea288c51254cd9dca20515c";

  constructor(private readonly httpClient:HttpClient) { }

  upload(file:File):Observable<string>{
    const formData = new FormData();
    formData.append('image', file);
    return this.httpClient
      .post('https://api.imgbb.com/1/upload',formData,{params:{key:this.apiKey}})
      .pipe(map((response:any) => response['data']['url']));

  }
}
