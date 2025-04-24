import { Component, Input, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CountriesService } from '../../service/countries/countries.service';
import { UsersService } from '../../service/users/users.service';
import { Users } from '../../model/users/users.model';

@Component({
  selector: 'app-create-post-info-user-content',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    NgForOf,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './create-post-info-user-content.component.html',
  styleUrls: ['./create-post-info-user-content.component.css']
})
export class CreatePostInfoUserContentComponent implements OnInit {
  @Input() boost = false;
  @Input() country: string | null = null;
  @Input() department: string | null = null;
  @Input() city: string | null = null;

  countries: any[] = [];
  departments: any[] = [];
  cities: string[] = [];
  user: Users | null = null;

  formProduct = new FormGroup({
    boost:      new FormControl(false),
    country:    new FormControl<string | null>(null, Validators.required),
    department: new FormControl<string | null>(null, Validators.required),
    district:   new FormControl<string | null>(null, Validators.required)
  });

  acceptPolicy = new FormControl(false, Validators.requiredTrue);

  constructor(
    private countriesService: CountriesService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.formProduct.get('boost')?.setValue(this.boost);
    this.loadCountries();
    this.loadUser();
  }

  onSubmit(): any {
    this.formProduct.markAllAsTouched();
    this.acceptPolicy.markAllAsTouched();
    return this.formProduct.valid && this.acceptPolicy.valid
      ? this.formProduct.value
      : null;
  }

  private loadCountries(): void {
    this.countriesService.getLocation().subscribe(res => {
      this.countries = res;
      if (this.country) {
        this.formProduct.get('country')?.setValue(this.country);
        this.onCountryChange();
        this.formProduct.get('department')?.setValue(this.department);
        this.onDepartmentChange();
        this.formProduct.get('district')?.setValue(this.city);
      }
    });
  }

  onCountryChange(): void {
    this.departments = [];
    this.cities = [];
    this.formProduct.get('department')?.reset();
    this.formProduct.get('district')?.reset();

    const selectedCountry = this.formProduct.value.country;
    if (selectedCountry) {
      const countryObj = this.countries.find(c => c.name === selectedCountry);
      this.departments = countryObj?.departments ?? [];
    }
  }

  onDepartmentChange(): void {
    this.cities = [];
    this.formProduct.get('district')?.reset();

    const selectedDepartment = this.formProduct.value.department;
    if (selectedDepartment) {
      const deptObj = this.departments.find(d => d.name === selectedDepartment);
      this.cities = deptObj?.cities ?? [];
    }
  }

  private loadUser(): void {
    const id = Number(localStorage.getItem('id'));
    this.usersService.getUserById(id).subscribe(u => {
      this.user = new Users(
        u.id, u.name, u.username, u.phoneNumber,
        u.password, u.membership, u.profilePicture,
        u.isActive, u.isGoogleAccount, u.roles, []
      );
    });
  }
}
