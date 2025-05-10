import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from "@angular/material/icon";
import { UsersService } from "../../service/users/users.service";
import { NgForOf, NgIf } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { MatIconButton } from "@angular/material/button";
import { RouterLink } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { DialogDeletePostFavoritesComponent } from "../../../public/components/dialog-delete-post-favorites/dialog-delete-post-favorites.component";

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
  favorites: any[] = [];

  constructor(
    private userService: UsersService,
    private dialogDeletePostFavorites: MatDialog
  ) { }

  ngOnInit() {
    this.getFavorites();
  }

  getFavorites() {
    const userId = localStorage.getItem('id');
    if (!userId) return;

    this.userService.getFavoritesProducts(userId).subscribe(favorites => {
      this.favorites = favorites.map(fav => ({
        product: fav.product,
        id: fav.id // usas este id para eliminar favoritos
      }));
      console.log('Favorites:', this.favorites)
    }, error => {
      console.error('Error fetching favorites:', error);
    });
  }

  openConfirm(id: string) {
    const dialogRef = this.dialogDeletePostFavorites.open(DialogDeletePostFavoritesComponent, { disableClose: true, data: id });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteFavoriteProduct(id).subscribe(() => {
          this.favorites = this.favorites.filter(fav => fav.id !== id);
          console.log('Favorite deleted successfully.');
        }, error => {
          console.error('Error deleting favorite:', error);
        });
      }
    });
  }
}
