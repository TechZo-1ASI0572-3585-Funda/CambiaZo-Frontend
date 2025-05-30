import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {Reviews} from "../../model/reviews/reviews.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {

  baseUrl= environment.baseUrl;
  constructor(private http:HttpClient) { }


  postReview(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/v2/reviews`, data);
  }

  getReviewsByReceptor(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/v2/reviews/user-receptor/${userId}`);
  }

  getReviewByAuthorAndExchange(userId: string, exchangeId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/v2/reviews/user-author/${userId}/exchange/${exchangeId}`);
  }

  getAverageReviewCount(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/v2/reviews/avarage-count/${userId}`);
  }

}
