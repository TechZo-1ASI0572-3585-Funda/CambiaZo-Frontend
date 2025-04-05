import {Component, Input, OnInit} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {JsonPipe, NgForOf, NgIf} from "@angular/common";
import {PostsService} from "../../service/posts/posts.service";
import {CategoriesObjects} from "../../model/categories-objects/categories-objects.model";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import { NgxDropzoneModule } from 'ngx-dropzone';
import {MatIcon} from "@angular/material/icon";


@Component({
  selector: 'app-create-info-post-content',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelect,
    MatOption,
    MatSlideToggle,
    NgForOf,
    ReactiveFormsModule,
    NgIf,
    JsonPipe,
    NgxDropzoneModule,
    MatIcon
  ],
  templateUrl: './create-info-post-content.component.html',
  styleUrl: './create-info-post-content.component.css'
})
export class CreateInfoPostContentComponent implements OnInit{

  @Input() category_id= null;
  @Input() product_name = null;
  @Input() description = null;
  @Input() change_for = null;
  @Input() price = null;
  @Input() images = [];


  categories: CategoriesObjects[]=[]
  imagesUrl: string[] = [];
  files: File[] = [];
  maxFiles: number = 4;
  totalFiles: number = 0;

  formProduct = new FormGroup({
    'category_id': new FormControl(null, Validators.required),
    'product_name': new FormControl(null, Validators.required),
    'description': new FormControl(null, Validators.required),
    'change_for': new FormControl(null, Validators.required),
    'price': new FormControl(null, Validators.required),
    }
  )
  constructor(private postService:PostsService) {
  }

  ngOnInit() {

    this.formProduct = new FormGroup({
        'category_id': new FormControl(this.category_id, Validators.required),
        'product_name': new FormControl(this.product_name, Validators.required),
        'description': new FormControl(this.description, Validators.required),
        'change_for': new FormControl(this.change_for, Validators.required),
        'price': new FormControl(this.price, Validators.required),
      }
    )

    this.totalFiles = this.images.length

    this.getCategoriesPostOptions()
    this.formProduct.get('product_name')?.valueChanges.subscribe(value => {
      if (value === '') {
        this.formProduct.get('product_name')?.setValue(null, { emitEvent: false });
      }
    });
    this.formProduct.get('description')?.valueChanges.subscribe(value => {
      if (value === '') {
        this.formProduct.get('description')?.setValue(null, { emitEvent: false });
      }
    });
    this.formProduct.get('change_for')?.valueChanges.subscribe(value => {
      if (value === '') {
        this.formProduct.get('change_for')?.setValue(null, { emitEvent: false });
      }
    });

  }



  getCategoriesPostOptions(){
    this.postService.getCategoriesProducts().subscribe(res=> {
        this.categories = res
        this.categories.map((category:any) => {
          category.id = category.id.toString()
          return category
        })


      },error => console.log(error)
    )};




  onSubmit() {
    this.formProduct.markAllAsTouched();
    if (this.formProduct.valid) {
      return this.formProduct.value;
    }else return null
  }

  errorLimitFiles = false
  onSelect(event: any) {
    const totals = this.totalFiles + event.addedFiles.length;

    if (totals <= this.maxFiles) {
      this.files.push(...event.addedFiles);
      this.totalFiles += event.addedFiles.length
      this.errorLimitFiles = false;
    } else {
      const allowedFiles = this.maxFiles - this.totalFiles;
      this.files.push(...event.addedFiles.slice(0, allowedFiles));
      this.totalFiles += allowedFiles
      this.errorLimitFiles = true
    }

  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
    this.totalFiles -= 1
    if (this.files.length < this.maxFiles && this.errorLimitFiles) {
      this.errorLimitFiles = false;
    }
  }


  async uploadImage() {
     const api = "https://api.imgbb.com/1/upload?expiration=300&key=e20a8b081ea288c51254cd9dca20515c&name="
      for (let file of this.files){
        const url = api + file.name
        const data = new FormData();
        data?.append('image', file);

        try {

          const response = await fetch(url, {method: 'post',body: data});
          const responseData = await response.json();
          this.imagesUrl.push(responseData.data.url);
        } catch (error) {
          console.error(error);
        }
      }
      if(!this.imagesUrl.length)return []
       return this.imagesUrl
  }

  validateInput(event:any) {
    if (event.data === '-' || event.data === '+')event.preventDefault();
  }

}
