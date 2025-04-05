import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule} from "@angular/material/icon";
import {UsersService} from "../../service/users/users.service";
import {PostsService} from "../../service/posts/posts.service";
import {NgForOf, NgIf} from "@angular/common";
import {Products} from "../../model/products/products.model";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {MatIconButton} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {DialogDeletePostComponent} from "../../../public/components/dialog-delete-post/dialog-delete-post.component";
import {DialogEditPostComponent} from "../../../public/components/dialog-edit-post/dialog-edit-post.component";

@Component({
  selector: 'app-my-posts',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    NgForOf,
    NgIf,
    MatMenuModule,
    MatIconModule,
    MatIconButton,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './my-posts.component.html',
  styleUrl: './my-posts.component.css'
})
export class MyPostsComponent implements OnInit {
  user : any = {};
  items: Products[] = []; // corregido: se especifica que items es un array de Products
  post: any = {};

  constructor(
    private userService: UsersService,
    private dialogDeletePost: MatDialog,
    private postService: PostsService
  ) {}

  ngOnInit() {
    this.getUser();
    this.getAllProducts();
  }

  getUser() {
    this.userService.getUserById(Number(localStorage.getItem('id'))).subscribe((data) => {
      this.user = data;
    });
  }

  getAllProducts() {
    const userId = Number(localStorage.getItem('id'));
    this.postService.getProductsByUserId(userId).subscribe((res: any) => {
      this.items = res.map((product: any) => new Products(
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

      this.postService.getCategoriesProducts().subscribe((categories: any) => {
        this.items = this.items.map((item: Products) => {
          const category = categories.find((category: any) => category.id === item.category_id);
          if (category) {
            item.setCategory = category.name;
          }
          return item;
        });
      });
    });
  }

  onCallDeletePost(id: number) {
    const dialogRef = this.dialogDeletePost.open(DialogDeletePostComponent, { disableClose: true, data: id });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.postService.deleteProduct(id).subscribe(
          res => {
            this.items = this.items.filter((item: Products) => item.id !== String(id));
          }
        );
      }
    });
  }

  setPost(post: any) {
    this.post = post;
    console.log(this.post);
  }

  protected readonly Number = Number;
}
