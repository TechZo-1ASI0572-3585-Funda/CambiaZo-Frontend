import {Component, OnInit} from '@angular/core';
import {JsonPipe, NgForOf, NgIf} from "@angular/common";
import {MatDialog, MatDialogClose, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {UsersService} from "../../service/users/users.service";
import {MatIcon} from "@angular/material/icon";
import {PostsService} from "../../service/posts/posts.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {Products} from "../../model/products/products.model";
import {CountriesService} from "../../service/countries/countries.service";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {CategoriesObjectsService} from "../../service/categories-objects/categories-objects.service";
import {DialogEditPostComponent} from "../../../public/components/dialog-edit-post/dialog-edit-post.component";
import {FirebaseStorageService} from "../../service/firebase-storage/firebase-storage";

@Component({
  selector: 'app-form-edit-post',
  standalone: true,
  imports: [
    NgForOf,
    MatDialogContent,
    MatDialogTitle,
    ReactiveFormsModule,
  ],
  templateUrl: './form-edit-post.component.html',
  styleUrl: './form-edit-post.component.css'
})
export class FormEditPostComponent implements OnInit{
  postC:any;
  user:any;
  id:any;
  countries:any[] = [];
  departments:any[] = [];
  categories:any[]=[];
  tempcategory:any={};
  images:any[] = [];
  catId:any;

  contactFormGroup = new FormGroup({
    'name': new FormControl(''),
    'email': new FormControl(''),
    'telephone': new FormControl(''),
    'pais': new FormControl(''),
    'provincia': new FormControl(''),
    'distrito': new FormControl('')
  });

  postFormGroup = new FormGroup({
    'category': new FormControl(''),
    'product_name': new FormControl(''),
    'description': new FormControl(''),
    'change_for': new FormControl(''),
    'price': new FormControl(''),
    'available': new FormControl('')
  });

  boost= new FormControl();

  districts:any[] = [];
  constructor(private dialogEditPost: MatDialog,private categoriesService:CategoriesObjectsService,private countriesService:CountriesService,private userService:UsersService, private postService:PostsService,private route: ActivatedRoute, private storageService: FirebaseStorageService){
    this.route.params.subscribe(params => this.postC=(params));
    this.postC= this.postC.postId;
    const idStartIndex = this.postC.indexOf('=');
    this.id = this.postC.slice(idStartIndex + 1);
  }

  setCategory(){
    this.catId = this.categories.find((c:any)=> c.name === this.postFormGroup.value.category).id;
    console.log(this.catId);
  }

  ngOnInit() {
    this.getPost(this.id);
    this.getCountries();
  }


  getCountries(){
    this.countriesService.getLocation().subscribe((res:any)=>{
      this.countries = res;
      this.departments= this.countries[0].departments;
    })
  }

  getPost(id: string){
    this.postService.getProductById(id).subscribe((res:any)=>{
      this.postC = new Products(
        res.id,
        res.user_id,
        res.category_id,
        res.product_name,
        res.description,
        res.change_for,
        res.price,
        res.images,
        res.boost,
        res.available,
        res.location
      )
      this.catId= this.postC.category_id;
      console.log("Original ",this.catId);
      this.boost.setValue(this.postC.boost);
      this.images = this.postC.images;
      this.getUser();
    })
  }

  getUser(){
      this.userService.getUserById(this.postC.user_id).subscribe(
        (data: any) => {
          this.user = data;
          this.contactFormGroup = new FormGroup({
            'name': new FormControl(this.user.name),
            'email': new FormControl(this.user.email),
            'telephone': new FormControl(this.user.phone),
            'pais': new FormControl(this.postC.location.country),
            'provincia': new FormControl(this.postC.location.departament),
            'distrito': new FormControl(this.postC.location.district)
          })
          const newprovincia= this.contactFormGroup.get('provincia')?.value;
          this.departments.map((department:any)=>{
            if(department.name === newprovincia){
              this.districts = department.cities;
            }
          })
        }
      );
      this.categoriesService.getCategoriesObjects().subscribe((res:any)=>{
        this.categories = res;
        this.categories.map((category:any)=>{
          if(category.id === this.postC.category_id){
            this.tempcategory = category;
            this.postFormGroup.value.category= this.tempcategory.name;
          }
        });
      });
      this.postFormGroup = new FormGroup({
        'category': new FormControl(this.tempcategory.name),
        'product_name': new FormControl(this.postC.product_name),
        'description': new FormControl(this.postC.description),
        'change_for': new FormControl(this.postC.change_for),
        'price': new FormControl(this.postC.price),
        'available': new FormControl('')
      });
  }

  onChangeDepartment() {
    const prov = this.contactFormGroup.get('provincia')?.value;
    this.districts = [];
    this.contactFormGroup.get('distrito')?.reset();
    this.departments.find(d => d.name === prov)?.cities.forEach((c: any) => this.districts.push(c));
  }


  onselect(e: any) {
    const files = Array.from(e.target.files as FileList) as File[];
    files.forEach(file => {
      const { progress$, url$ } = this.storageService.uploadProductImage(file, this.id);
      progress$.subscribe();
      url$.subscribe(url => this.images.push(url));
    });
  }

  saveChanges(){

    const id= this.postC.id;
    const user_id= this.postC.user_id;
    const category_id= this.catId;
    console.log(category_id);
    const product_name:any= this.postFormGroup.value.product_name;
    const description:any= this.postFormGroup.value.description;
    const change_for:any= this.postFormGroup.value.change_for;
    const price:any= this.postFormGroup.value.price;
    const images:any= this.postC.images;
    const boost:any= this.boost.value;
    const available:any = this.postFormGroup.value.available;
    const location:any= {
      country: this.contactFormGroup.value.pais,
      departament: this.contactFormGroup.value.provincia,
      district: this.contactFormGroup.value.distrito
    }
    const newPost = {
      name: product_name,
      description: description,
      desiredObject: change_for,
      price: price,
      image: images[0], // assuming the first image is the one to be used
      boost: boost,
      available: available,
      productCategoryId: category_id,
      userId: user_id,
      districtId: location.district // assuming location.district is the correct districtId
    };
    this.postService.putProduct(id, newPost).subscribe((res:any)=>{
      console.log(res);
    });
    this.dialogEditPost.open(DialogEditPostComponent,{disableClose: true, data:id});
  }


}
