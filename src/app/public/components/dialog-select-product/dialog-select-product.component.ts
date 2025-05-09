import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Products } from "../../../content/model/products/products.model";
import { UsersService } from "../../../content/service/users/users.service";
import { PostsService } from "../../../content/service/posts/posts.service";
import { OffersService } from "../../../content/service/offers/offers.service";
import { MatCardModule } from '@angular/material/card';
import { NgForOf, NgIf } from '@angular/common';
import { Offers } from '../../../content/model/offers/offers.model';
import { DialogOfferSuccessfulComponent} from "../dialog-offer-successful/dialog-offer-successful.component";

@Component({
  selector: 'app-dialog-select-product',
  standalone: true,
  imports: [
    MatDialogContent,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatCardModule,
    NgForOf,
  ],
  templateUrl: './dialog-select-product.component.html',
  styleUrls: ['./dialog-select-product.component.css']
})
export class DialogSelectProductComponent implements OnInit {
  user: any = {};
  items: Products[] = [];
  selectedProduct: Products | null = null;

  constructor(
    public dialogRef: MatDialogRef<DialogSelectProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UsersService,
    private postService: PostsService,
    private offersService: OffersService,
    private dialogSuccess: MatDialog
  ) {}

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    this.userService
      .getUserById(+localStorage.getItem('id')!)
      .subscribe(u => {
        this.user = u;
        this.getUserProducts();
      });
  }
  getUserProducts(): void {
    const userId = +localStorage.getItem('id')!;
    this.postService
      .getProductsFlatByUserId(userId)
      .subscribe(items => (this.items = items));
  }
  closeDialog(): void {
    this.dialogRef.close();
    this.dialogRef.afterClosed().subscribe(() => {
      if (this.selectedProduct) {
        this.dialogSuccess.open(DialogOfferSuccessfulComponent, {
          data: {
            product_name: this.selectedProduct.product_name,
            user_name: this.data.user_name
          }
        });
      }
    });
  }

  offer(product: Products): void {
    this.selectedProduct = product;

    const newOffer = new Offers(
      '',
      product.id.toString(),
      this.data.product_id,
      'Pendiente'
    );

    this.offersService.postOffer(newOffer).subscribe(
      () => this.closeDialog(),
      err => console.error('POST /exchanges →', err)
    );
  }
}
