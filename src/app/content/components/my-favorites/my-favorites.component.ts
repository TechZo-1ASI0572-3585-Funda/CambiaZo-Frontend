import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from "@angular/material/icon";
import { UsersService } from "../../service/users/users.service";
import { NgForOf, NgIf } from "@angular/common";
import { Products } from "../../model/products/products.model";
import { PostsService } from "../../service/posts/posts.service";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { MatIconButton } from "@angular/material/button";
import { RouterLink } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { DialogDeletePostFavoritesComponent } from "../../../public/components/dialog-delete-post-favorites/dialog-delete-post-favorites.component";
import { DialogRef } from "@angular/cdk/dialog";
import {forkJoin, Observable} from "rxjs";

@Component({
  selector: 'app-my-favorites',
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
  templateUrl: './my-favorites.component.html',
  styleUrls: ['./my-favorites.component.css']
})
export class MyFavoritesComponent implements OnInit {
  favorites: Products[] = [];

  constructor(
    private userService: UsersService,
    private postService: PostsService,
    private dialogDeletePostFavorites: MatDialog
  ) { }

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    const userId = Number(localStorage.getItem('id'));
    this.userService.getFavoritesProducts(userId.toString()).subscribe(favorites => {
      const productObservables = favorites.map(favorite => this.getProductById(favorite.productId));
      forkJoin(productObservables).subscribe(products => {
        this.favorites = products;
      });
    });
  }

  getProductById(productId: string): Observable<Products> {
    return this.postService.getProductById(productId);
  }

  openConfirm(id: string) {
    const dialogRef = this.dialogDeletePostFavorites.open(DialogDeletePostFavoritesComponent, { disableClose: true, data: id });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteFavoriteProduct(id).subscribe(() => {
          this.favorites = this.favorites.filter(favorite => favorite.id !== id);
          console.log('Favorite deleted successfully.');
        }, (error) => {
          console.error('Error deleting favorite:', error);
        });
      }
    });
  }
}
