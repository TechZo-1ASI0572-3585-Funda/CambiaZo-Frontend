import {Component, OnInit} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {NgForOf, NgIf} from "@angular/common";
import {PostsService} from "../../service/posts/posts.service";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {Products} from "../../model/products/products.model";
import {RouterLink} from "@angular/router";
import {forkJoin, Observable, switchMap} from "rxjs";
import {map} from "rxjs/operators";
@Component({
  selector: 'app-feature-posts-content',
  standalone: true,
  imports: [MatCardModule, NgForOf, NgIf, MatButton, MatIcon, RouterLink],
  templateUrl: './feature-posts-content.component.html',
  styleUrl: './feature-posts-content.component.css'
})
export class FeaturePostsContentComponent implements OnInit {
  items: Products[] = [];
  loading = true;
  constructor(private postsService: PostsService) {}

  ngOnInit() {
    this.getAllFeaturePosts();
  }

  getAllFeaturePosts() {
    this.postsService.getProducts().pipe(
      switchMap(products => {
        const categoryRequests: { [key: string]: Observable<any> } = {};

        products.forEach(product => {
          if (!categoryRequests[product.category_id]) {
            categoryRequests[product.category_id] = this.postsService.getCategoryProductById(product.category_id);
          }
        });

        return forkJoin(categoryRequests).pipe(
          map(categories => {
            products.forEach(product => {
              product.category = categories[product.category_id]?.name;
            });
            return products;
          })
        );
      })
    ).subscribe(res => {
      this.items = res.map(product => new Products(
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
      ));
      this.assignCategoriesToItems(res);
      this.loading = false;
    });
  }

  assignCategoriesToItems(products: any[]) {
    products.forEach((product, index) => {
      this.items[index].setCategory = product.category;
    });
  }
}
