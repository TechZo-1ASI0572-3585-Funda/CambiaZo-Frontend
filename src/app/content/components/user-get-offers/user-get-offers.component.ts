import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {
  MatCard,
  MatCardAvatar,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardTitle
} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {JsonPipe, NgForOf, NgOptimizedImage, NgStyle} from "@angular/common";
import {OffersService} from "../../service/offers/offers.service";
import {PostsService} from "../../service/posts/posts.service";
import {UsersService} from "../../service/users/users.service";
import {Offers} from "../../model/offers/offers.model";
import {Products} from "../../model/products/products.model";
import {DialogDeniedOfferComponent} from "../../../public/components/dialog-denied-offer/dialog-denied-offer.component";
import {MatDialog} from "@angular/material/dialog";
import {
  DialogSuccessfulExchangeComponent
} from "../../../public/components/dialog-successful-exchange/dialog-successful-exchange.component";
import {of} from "rxjs";

@Component({
  selector: 'app-user-get-offers',
  standalone: true,
  imports: [
    MatCard,
    MatCardAvatar,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatIcon,
    NgForOf,
    NgStyle,
    MatCardFooter,
    NgOptimizedImage,
    JsonPipe
  ],
  templateUrl: './user-get-offers.component.html',
  styleUrl: './user-get-offers.component.css'
})
export class UserGetOffersComponent implements OnInit {
  @Output() checkEmpty = new EventEmitter<boolean>();

  offers: Offers[] = [];

  constructor(
    private offersService: OffersService,
    private postsService: PostsService,
    private usersService: UsersService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getAllOffers();
  }

  getAllOffers(): void {
    const userId = localStorage.getItem('id');
    if (!userId) return;

    this.offersService
      .getAllOffersByUserChangeId(userId)
      .subscribe((data: any[]) => {
        const filtered = data.filter(o => o.status === 'Pendiente');
        this.checkEmpty.emit(filtered.length === 0);

        this.offers = filtered.map(o => {
          const offer = new Offers(
            o.id.toString(),
            o.productChange.id.toString(),
            o.productOwn.id.toString(),
            o.status
          );
          offer.setProductOffers = o.productChange;
          offer.setProductGet    = o.productOwn;
          offer.user_offer       = o.userChange;
          return offer;
        });
      });
  }


  setStatusAccepted(offerId: string) {
    this.offersService.updateOfferStatus(offerId, 'Aceptado').subscribe(() => {
      const offer = this.offers.find((offer: Offers) => offer.id === offerId);

      if (offer) {
        this.offers = this.offers.filter((offer: Offers) => offer.id !== offerId);
        this.dialog.open(DialogSuccessfulExchangeComponent, {
          data: {
            name: offer.user_offer.name,
            profilePicture: offer.user_offer.profilePicture,
            phone: offer.user_offer.phone,
            username: offer.user_offer.username
          },
          disableClose: true
        });
      }
    });
  }

  setStatusDenied(offerId: string) {
    const dialogRef = this.dialog.open(DialogDeniedOfferComponent, { disableClose: true });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.offersService.updateOfferStatus(offerId, 'Denegado').subscribe(() => {
          this.offers = this.offers.filter((offer: Offers) => offer.id !== offerId);
        });
      }
    });
  }

  protected readonly Offers = Offers;
}


