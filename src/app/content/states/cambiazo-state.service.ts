import {inject, Injectable, signal, Signal, WritableSignal} from '@angular/core';
import {District} from "../model/district/district";
import {Department} from "../model/department/department";
import {Country} from "../model/country/country";
import {CategoriesObjects} from "../model/categories-objects/categories-objects.model";
import {CountriesService} from "../service/countries/countries.service";
import {CategoriesObjectsService} from "../service/categories-objects/categories-objects.service";
import {take} from "rxjs";
import {PostsService} from "../service/posts/posts.service";

@Injectable({
  providedIn: 'root'
})
export class CambiazoStateService {

  districts: WritableSignal<District[]> = signal([]);
  departments: WritableSignal<Department[]> = signal([]);
  countries: WritableSignal<Country[]> = signal([]);

  serviceLocation: CountriesService = inject(CountriesService);

  constructor() {
    this.serviceLocation.getCountries().pipe(take(1)).subscribe((countries: Country[]) => this.countries.set(countries))
    this.serviceLocation.getAllDepartments().pipe(take(1)).subscribe((departments: Department[]) => this.departments.set(departments))
    this.serviceLocation.getAllDistricts().pipe(take(1)).subscribe((districts: District[]) => this.districts.set(districts))
  }

}
