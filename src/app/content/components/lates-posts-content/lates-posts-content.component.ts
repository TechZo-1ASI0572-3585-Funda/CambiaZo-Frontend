import {Component, OnInit} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import { CommonModule } from '@angular/common';
import {FeaturePostsContentComponent} from "../feature-posts-content/feature-posts-content.component";
import {PostsService} from "../../service/posts/posts.service";
import {MatIcon} from "@angular/material/icon";
import {Products} from "../../model/products/products.model";
import {MatButton} from "@angular/material/button";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {RouterLink} from "@angular/router";
@Component({
  selector: 'app-lates-posts-content',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    FeaturePostsContentComponent,
    MatIcon,
    MatButton,
    MatFormField,
    MatInput,
    RouterLink
  ],
  templateUrl: './lates-posts-content.component.html',
  styleUrl: './lates-posts-content.component.css'
})
export class LatesPostsContentComponent implements OnInit{
  items:Products[]=[]
  allProducts: Products[] = []; // Add this line to store all products
  categories:any[] = []
  loading = true;

  constructor(private postService:PostsService) {
  }
  ngOnInit() {
    this.getAllProducts()
  }

  getAllProducts() {
    this.loading = true;
    this.postService.getProducts().subscribe((res:any)=>{
      res.forEach((product: any) => {
        const newProduct = new Products(
          product.id,
          product.user_id,
          product.category_id,
          product.product_name,
          product.description,
          product.change_for,
          product.price,
          product.images,
          product.boost,
          product.available,
          product.location
        );
        this.items.push(newProduct);
        this.allProducts.push(newProduct);
      })

      this.postService.getCategoriesProducts().subscribe((categories:any)=>{
        this.categories = categories
        this.items.map((item:Products)=>{
          item.setCategory = categories.find((category:any)=>category.id === item.category_id)?.name
        })
      })
      this.loading = false;
    })
  }

  searchProduct(event:Event) {
    const search = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.items = this.allProducts.filter((product: Products) => { // Filter the allProducts array instead of making a new request
      const productNameNormalized = product.product_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return productNameNormalized.includes(search) || search == '';
    });
  }
}
