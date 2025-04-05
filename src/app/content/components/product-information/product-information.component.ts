import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { PostsService } from '../../service/posts/posts.service';
import { UsersService } from '../../service/users/users.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogFavoritesComponent } from '../../../public/components/dialog-favorites/dialog-favorites.component';
import { DialogSelectProductComponent } from '../../../public/components/dialog-select-product/dialog-select-product.component';
import { MatCardModule, MatCardContent, MatCardTitle } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import {
  DialogLoginRegisterComponent
} from "../../../public/components/dialog-login-register/dialog-login-register.component";
import {DialogNoProductsComponent} from "../dialog-no-products/dialog-no-products.component";

@Component({
  selector: 'app-product-information',
  standalone: true,
  imports: [
    MatCardModule,
    MatCardContent,
    MatCardTitle,
    CommonModule,
    MatButton,
    RouterLink
  ],
  templateUrl: './product-information.component.html',
  styleUrls: ['./product-information.component.css']
})
export class ProductInformationComponent implements OnInit {
  product: any;
  categories: any[] = [];
  user: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private postsService: PostsService,
    private usersService: UsersService,
    private dialog: MatDialog,
    private dialogSuccess: MatDialog
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.postsService.getProductById(productId).subscribe((data) => {
        this.product = data;
        this.loadCategories();
        this.loadUser(Number(data.user_id));
        this.loading = false;
      });
    }
  }

  loadCategories(): void {
    this.postsService.getCategoryProductById(this.product.category_id).subscribe((category: any) => {
      this.product.categoryName = category.name;
    })
  }

  loadUser(userId: number): void {
    this.usersService.getUserById(userId).subscribe((user) => {
      this.user = user;
    });
  }

  getLoggedInUserId(): number | null {
    const userId = localStorage.getItem('id');
    return userId ? Number(userId) : null;
  }

  addToFavorites(): void {
    const loggedInUserId = this.getLoggedInUserId();
    if (loggedInUserId) {
      const favoriteData = {
        productId: Number(this.product.id),
        userId: Number(loggedInUserId)
      };
      this.usersService.addFavoriteProduct(favoriteData).subscribe(
        (res) => {
          this.dialog.open(DialogFavoritesComponent);
        },
        (error) => {
          console.error('Error adding to favorites:', error);
        }
      );
    } else {
      // Handle case where user is not logged in, maybe show login dialog
    }
  }

  offer(): void {
    const loggedInUserId = this.getLoggedInUserId();

    if (loggedInUserId) {
      this.postsService.getProducts2().subscribe(
        (products) => {
          const userProducts = products.filter(product => Number(product.user_id) === loggedInUserId);

          if (userProducts.length > 0) {
            this.dialog.open(DialogSelectProductComponent, {
              data: {
                product_id: this.product.id,
                user_id: this.user.id,
                product_name: this.product.product_name,
                user_name: this.user.name,
              },
              width: '100rem',
            });
          } else {
            this.dialogSuccess.open(DialogNoProductsComponent, { disableClose: true });
          }
        }
      );
    } else {
      this.dialog.open(DialogLoginRegisterComponent, { disableClose: true });
    }
  }

  protected readonly localStorage = localStorage;
}
