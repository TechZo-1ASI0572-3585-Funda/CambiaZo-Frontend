import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { OffersService } from "../../service/offers/offers.service";
import { DialogDeniedOfferComponent } from "../../../public/components/dialog-denied-offer/dialog-denied-offer.component";
import { DialogSuccessfulExchangeComponent } from "../../../public/components/dialog-successful-exchange/dialog-successful-exchange.component";
import {MatCard, MatCardAvatar, MatCardContent, MatCardFooter, MatCardHeader} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {NgForOf} from "@angular/common";
import {PostsService} from "../../service/posts/posts.service";
import {map} from "rxjs/operators";
import {forkJoin} from "rxjs";

@Component({
  selector: 'app-user-get-offers',
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardFooter,
    MatIcon,
    NgForOf,
    MatCardAvatar
  ],
  templateUrl: './user-get-offers.component.html',
  styleUrl: './user-get-offers.component.css'
})
export class UserGetOffersComponent implements OnInit {
  @Output() checkEmpty = new EventEmitter<boolean>();
  offers: any[] = [];

  constructor(
    private offersService: OffersService,
    private postsService: PostsService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getAllOffers();
  }

  getAllOffers(): void {
    const userId = localStorage.getItem('id');
    if (!userId) return;

    this.offersService.getAllOffersByUserChangeId(userId).subscribe((data: any[]) => {
      const filtered = data.filter(o => o.status === 'Pendiente');
      this.checkEmpty.emit(filtered.length === 0);

      const requests = filtered.map(offer =>
        this.postsService.getDistrictById(offer.productChange.districtId).pipe(
          map(district => ({
            ...offer,
            productChange: {
              ...offer.productChange,
              locationName: district.name
            }
          }))
        )
      );

      forkJoin(requests).subscribe(result => {
        this.offers = result;
      });
    });
  }

  setStatusAccepted(offerId: number) {
    this.offersService.updateOfferStatus(offerId.toString(), 'Aceptado').subscribe(() => {
      const offer = this.offers.find(o => o.id === offerId);
      this.offers = this.offers.filter(o => o.id !== offerId);
      if (offer) {
        this.dialog.open(DialogSuccessfulExchangeComponent, {
          data: {
            name: offer.userOwn.name,
            profilePicture: offer.userOwn.profilePicture,
            phone: offer.userOwn.phoneNumber,
            username: offer.userOwn.username
          },
          disableClose: true
        });
      }
    });
  }

  setStatusDenied(offerId: number) {
    const dialogRef = this.dialog.open(DialogDeniedOfferComponent, { disableClose: true });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.offersService.updateOfferStatus(offerId.toString(), 'Denegado').subscribe(() => {
          this.offers = this.offers.filter(o => o.id !== offerId);
        });
      }
    });
  }
}
