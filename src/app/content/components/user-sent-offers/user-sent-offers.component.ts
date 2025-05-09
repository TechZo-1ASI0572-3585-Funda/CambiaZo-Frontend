import {Component, OnInit} from '@angular/core';
import { OffersService } from '../../service/offers/offers.service';
import { PostsService} from "../../service/posts/posts.service";
import { UsersService } from '../../service/users/users.service';
import {Offers} from "../../model/offers/offers.model";
import {
  MatCard,
  MatCardAvatar,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardTitle
} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {JsonPipe, NgForOf, NgStyle} from "@angular/common";
import {Products} from "../../model/products/products.model";
import {forkJoin, switchMap} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-user-sent-offers',
  standalone: true,
  imports: [
    MatCard,
    MatCardAvatar,
    MatCardContent,
    MatCardHeader,
    MatIcon,
    NgForOf,
    NgStyle,
    MatCardFooter
  ],
  templateUrl: './user-sent-offers.component.html',
  styleUrl: './user-sent-offers.component.css'
})
export class UserSentOffersComponent implements OnInit{
  offers: any[] = [];


  constructor(private offersService: OffersService, private postsService: PostsService, private usersService: UsersService) { }

  ngOnInit() {
    this.getAllOffers();
  }
  getAllOffers(): void {
    const userId = localStorage.getItem('id');
    if (!userId) return;

    this.offersService
      .getAllOffersByUserOwnId(userId)
      .pipe(
        switchMap((list: any[]) =>
          forkJoin(
            list.map(ex =>
              forkJoin({
                prodOwn:    this.postsService.getProductById(ex.productOwn.id),
                prodChange: this.postsService.getProductById(ex.productChange.id),
                userChange: this.usersService.getUserById(ex.userChange.id)
              }).pipe(
                map(({ prodOwn, prodChange, userChange }) => {
                  const o = new Offers(
                    ex.id.toString(),
                    prodOwn.id.toString(),
                    prodChange.id.toString(),
                    ex.status
                  );
                  o.setProductOffers = prodOwn;
                  o.setProductGet    = prodChange;
                  o.setUserGet       = userChange;
                  return o;
                })
              )
            )
          )
        )
      )
      .subscribe(result => (this.offers = result));
  }
  getStatusStyles(status: string) {
    let styles = {};
    switch (status) {
      case 'Aceptado':
        styles = {
          'color': '#41DB0B',
          'background-color': '#EAFFDD',
          'border': '1px solid #41DB0B',
          'border-radius': '10px',
          'width' : '8.5rem',
          'height' : '2.2rem',
          'text-align': 'center',
        };
        break;
      case 'Pendiente':
        styles = {
          'color': '#FFA22A',
          'background-color': '#FFF2CC',
          'border': '1px solid #FFA22A',
          'border-radius': '10px',
          'width' : '8.5rem',
          'height' : '2.2rem',
          'text-align': 'center'
        };
        break;
      case 'Denegado':
        styles = {
          'color': '#FF502A',
          'background-color': '#FFD7B9',
          'border': '1px solid #FF502A',
          'border-radius': '10px',
          'width' : '8.5rem',
          'height' : '2.2rem',
          'text-align': 'center'
        };
        break;
      default:
        styles = {};
        break;
    }
    return styles;
  }
}
