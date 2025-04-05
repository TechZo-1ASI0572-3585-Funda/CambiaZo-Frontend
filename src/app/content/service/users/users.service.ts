import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import {Observable, map, catchError, throwError, mergeMap} from "rxjs";
import { Users } from "../../model/users/users.model";
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  baseUrl = environment.baseUrl;
  loggedIn = false;
  validEmail = false;
  verificationCode: string = '';

  setVerificationCode(code: string): void {
    this.verificationCode = code;
  }

  verifyCode(code: string): boolean {
    return this.verificationCode === code;
  }

  get isLogged() { return this.loggedIn; }
  set isLogged(val: boolean) { this.loggedIn = val; }

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/v1/users`).pipe(
      map((res: any) => {
        const user = res.find((user: any) => user.email === data.username);
        if (user) {
          if (user.password === data.password) {
            localStorage.setItem('id', user.id);
            return true;
          } else {
            return 'password';
          }
        } else {
          return 'user';
        }
      }),
      catchError(this.handleError)
    );
  }

  verifyEmail(data: any): Observable<boolean> {
    return this.http.get(`${this.baseUrl}/api/v1/users`).pipe(
      map((res: any) => {
        const user_obj = res.find((user: any) => data.username === user.email);
        if (user_obj) {
          localStorage.setItem('id-temporal', user_obj.id.toString());
          this.validEmail = true;
        } else {
          console.log('User not found');
          this.validEmail = false;
        }
        return this.validEmail;
      }),
      catchError(this.handleError)
    );
  }

  getUsers(): Observable<Users[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/v1/users`).pipe(
      map(users => users.map(user => this.transformToUserModel(user))),
      catchError(this.handleError)
    );
  }

  postUser(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/v1/users`, data).pipe(
      catchError(this.handleError)
    );
  }

  addFavoriteProduct(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/v1/favorite-products`, data).pipe(
      catchError(this.handleError)
    );
  }


  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/v1/users/delete/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  putUser(id: any, data: any): Observable<any> {
    const transformedData = this.transformToNewStructure(data);

    return this.http.put(`${this.baseUrl}/api/v1/users/edit/${id}`, transformedData).pipe(
      catchError(this.handleError)
    );
  }

  getUserById(id: number): Observable<Users> {
    return this.http.get<any>(`${this.baseUrl}/api/v1/users/${id}`).pipe(
      map(user => this.transformToUserModel(user)),
      catchError(this.handleError)
    );
  }

  changePassword(id: number, newPassword: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/v1/users/edit/${id}`, newPassword).pipe(
      catchError(this.handleError)
    );
  }

  changeMembership(userId: number, membership: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/v1/users/edit/membership/${userId}`, {membershipId: membership}).pipe(
      catchError(this.handleError)
    );
  }

  changeProfileImage(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/v1/users/edit/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  getFavoritesProducts(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/v1/favorite-products/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  deleteFavoriteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/v1/favorite-products/delete/${id}`).pipe(
      catchError(this.handleError)
    );
  }
  private transformToUserModel(data: any): Users {
    return new Users(
      data.id,
      data.name,
      data.email,
      data.phone,
      data.password,
      data.membershipId,
      data.profilePicture,
      [] // Assuming favorites need to be handled separately or added later
    );
  }

  private transformToNewStructure(data: any): any {
    return {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      profilePicture: data.profilePicture, // Ensure the key names match the backend structure
      membershipId: data.membershipId
    };
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
    }
    return throwError('Something bad happened; please try again later.');
  }
}
