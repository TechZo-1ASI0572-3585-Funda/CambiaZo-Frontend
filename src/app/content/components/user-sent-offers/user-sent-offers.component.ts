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

@Component({
  selector: 'app-user-sent-offers',
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
    JsonPipe
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
  getAllOffers(){
    const userId = localStorage.getItem('id');
    if(userId === null) return;
    this.offersService.getAllOffersByUserOwnId(userId).subscribe((data: any) => {
      data.forEach((offer: any) => {

        this.offers.push(new Offers(
            offer.id.toString(),
            offer.productOwnId.toString(),
            offer.productChangeId.toString(),
            offer.status
          )
        )
      });

      this.offers.map((offer: any) => {
        this.postsService.getProductById(offer.id_product_offers).subscribe((resPost: any) => {
          offer.setProductOffers = resPost;
          return offer
        })
      });

      this.offers.map((offer: any) => {
        this.postsService.getProductById(offer.id_product_get).subscribe((resPost: any) => {

          offer.setProductGet = resPost;

          this.usersService.getUserById(Number(offer.product_get.user_id)).subscribe((resUser: any) => {
            offer.setUserGet = resUser;
            return offer
          });

        });

      });

    });
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
