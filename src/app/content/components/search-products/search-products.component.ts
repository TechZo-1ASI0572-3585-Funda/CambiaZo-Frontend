import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {JsonPipe, NgForOf, NgIf} from "@angular/common";
import {PostsService} from "../../service/posts/posts.service";
import {RouterLink} from "@angular/router";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormGroup, ReactiveFormsModule, FormControl, Validators, FormsModule} from "@angular/forms";
import {MatIcon} from "@angular/material/icon";
import {CountriesService} from "../../service/countries/countries.service";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";

@Component({
  selector: 'app-search-products',
  standalone: true,
  imports: [
    MatButton,
    NgForOf,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    JsonPipe,
    MatIcon,
    MatOption,
    NgIf,
    MatSelect,
    FormsModule
  ],
  templateUrl: './search-products.component.html',
  styleUrl: './search-products.component.css'
})
export class SearchProductsComponent implements OnInit{

  @Output() categorySearched = new EventEmitter<any>();
  @Output() productSearched = new EventEmitter<any>();

  categories:any[] = []

  countries: any[]= []
  departments: any[]=[]
  cities: string[]=[]


  formProduct = new FormGroup({
    'wordKey': new FormControl(null, Validators.required),
    'countries': new FormControl(null, Validators.required),
    'departments': new FormControl(null, Validators.required),
    'cities': new FormControl(null, Validators.required),
    'priceMin': new FormControl(null, Validators.required),
    'priceMax': new FormControl(null, Validators.required),
  })

  constructor(private postService:PostsService,private countriesService: CountriesService) {
  }

  ngOnInit() {
    this.getAllProductCategories()
    this.getAllCountries()
  }

  filterProducts(category_name:string){
    this.categorySearched.emit(category_name)
  }
  getAllProductCategories() {
    this.postService.getCategoriesProducts().subscribe((categories:any)=>{
      this.categories = categories
    })
  }
  onSubmit(){
    this.productSearched.emit(this.formProduct.value);
  }

  getAllCountries(){
    this.countriesService.getLocation().subscribe((countries:any)=>{
      this.countries = countries
    })
  }
  onCountrySelectionChange(){
    this.departments = []
    this.cities = []
    this.formProduct.get('departments')?.reset()
    this.formProduct.get('cities')?.reset()
    if(this.formProduct.value.countries) {
      const selectedCountryObj = this.countries.find(c => c.country === this.formProduct.value.countries);
        this.departments = selectedCountryObj.departments;
    }

  }
  onCitiesSelectionChange(){
    this.cities = []
    this.formProduct.get('cities')?.reset()
    if(this.formProduct.value.departments) {
      const selectedDepartmentObj = this.departments.find(c => c.name === this.formProduct.value.departments);
      this.cities = selectedDepartmentObj.cities;
    }
  }

  onClear(){
    this.formProduct.reset()
  }

  validateInput(event:any) {
    if (event.data === '-' || event.data === '+')event.preventDefault();
  }

}
