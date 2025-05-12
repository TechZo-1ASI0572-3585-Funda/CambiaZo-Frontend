import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

interface Country   { id: number; name: string; }
interface Department{ id: number; name: string; countryId: number; }
interface District  { id: number; name: string; departmentId: number; }

interface DeptDto   { name: string; cities: string[]; }
interface CountryDto{ name: string; departments: DeptDto[]; }

@Injectable({ providedIn: 'root' })
export class CountriesService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getCountries(): Observable<Country[]> {
    return this.http
      .get<Country[]>(`${this.baseUrl}/api/v2/countries`)
      .pipe(shareReplay(1));
  }

  getAllDepartments(): Observable<Department[]> {
    return this.http
      .get<Department[]>(`${this.baseUrl}/api/v2/departments`)
      .pipe(shareReplay(1));
  }

  getAllDistricts(): Observable<District[]> {
    return this.http
      .get<District[]>(`${this.baseUrl}/api/v2/districts`)
      .pipe(shareReplay(1));
  }

  getLocation(): Observable<CountryDto[]> {
    return forkJoin({
      countries:  this.getCountries(),
      departments:this.getAllDepartments(),
      districts:  this.getAllDistricts()
    }).pipe(
      map(({ countries, departments, districts }) =>
        countries.map(ctry => ({
          name: ctry.name,
          departments: departments
            .filter(dep => dep.countryId === ctry.id)
            .map(dep => ({
              name: dep.name,
              cities: districts
                .filter(d => d.departmentId === dep.id)
                .map(d => d.name)
            }))
        }))
      )
    );
  }
}
