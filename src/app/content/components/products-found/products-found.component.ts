import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader, MatCardImage,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatMenu, MatMenuItem} from "@angular/material/menu";
import {NgForOf, NgIf} from "@angular/common";
import {Products} from "../../model/products/products.model";
import {PostsService} from "../../service/posts/posts.service";
import {RouterLink} from "@angular/router";
import {switchMap} from "rxjs";
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";

@Component({
  selector: 'app-products-found',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardFooter,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    NgForOf,
    NgIf,
    MatCardImage,
    RouterLink
  ],
  templateUrl: './products-found.component.html',
  styleUrl: './products-found.component.css'
})
export class ProductsFoundComponent implements OnInit{
  @Input() categoryIdSearched:string= '';

  allProducts:Products[]=[]
  productsFiltered:Products[]=[]
  categories:any[] = []

  constructor(private postService:PostsService) {
  }

  ngOnInit() {
    this.getAllProducts()
  }

  filterProductsByCategory(category_name:string){
    // Asigna el nombre de la categoría a categoryIdSearched
    this.categoryIdSearched = category_name;

    // Filtra los productos por nombre de categoría
    this.productsFiltered = this.allProducts.filter((item: Products) => item.getCategory === this.categoryIdSearched);
  }

  filterProducts(product:any) {
    this.productsFiltered = this.allProducts.filter((item: Products) =>
      item.category === this.categoryIdSearched &&
      (product.wordKey  ? item.product_name.includes(product.wordKey) : true) &&
      (product.countries ? item.location.country == product.countries : true) &&
      (product.departments ? item.location.departament == product.departments : true) &&
      (product.cities ? item.location.district == product.cities : true) &&
      (item.price >= (product.priceMin ? product.priceMin: 0) &&
        item.price <= (product.priceMax ? product.priceMax:Infinity)))
  }


  getAllProducts() {
    this.postService.getProducs().subscribe((res: any) => {
      res.forEach((product: any) => {
        this.allProducts.push(new Products(
          String(product.id),
          product.user_id,
          product.category_id,
          product.product_name,
          product.description,
          product.change_for,
          product.price,
          product.images,
          product.boost,
          product.available,
          product.location)
        )
      })

      this.postService.getCategoriesProducts().subscribe((categories: any) => {
        this.categories = categories

        this.allProducts.map((item: Products) => {
          const category = categories.find((category: any) => String(category.id) === item.category_id);
          if (category) {
            item.setCategory = category.name;
          }
        })
        this.productsFiltered = this.allProducts.filter((item: Products) => item.getCategory === this.categoryIdSearched)
      })
    })
  }


}
