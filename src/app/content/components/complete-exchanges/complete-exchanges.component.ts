import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule} from "@angular/material/icon";
import {UsersService} from "../../service/users/users.service";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Products} from "../../model/products/products.model";
import {PostsService} from "../../service/posts/posts.service";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {MatIconButton} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {Offers} from "../../model/offers/offers.model";
import {OffersService} from "../../service/offers/offers.service";

import {ReviewsService} from "../../service/reviews/reviews.service";
import {FormArray, FormGroup, FormBuilder, FormControl, ReactiveFormsModule, Form} from "@angular/forms";
import {FormsModule} from "@angular/forms";
import {DialogEditPostComponent} from "../../../public/components/dialog-edit-post/dialog-edit-post.component";

@Component({
  selector: 'app-complete-exchanges',
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
    RouterLink,
    NgClass,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './complete-exchanges.component.html',
  styleUrl: './complete-exchanges.component.css'
})
export class CompleteExchangesComponent implements OnInit{


  offers: any[] = [];
  userMe: any = {};
  maxRating: number = 5;
  selectedStar:number[]=[];
  maxRatingArr:any=[];
  previousSelection:number[]=[];
  inputs: any[] = [];

  offers2: any[] = [];
  constructor(private dialogReviewPost: MatDialog,private offersService:OffersService, private postService:PostsService, private userService:UsersService, private reviewService:ReviewsService) {}



  ngOnInit() {
    this.maxRatingArr=Array(this.maxRating).fill(0);
    this.getUser();
    this.getAllOffers();
    this.getAllOffers2();
  }

  getUser(){
    this.userService.getUserById(Number(localStorage.getItem('id'))).subscribe((data)=>{
      this.userMe = data;
    })
  };


  getAllOffers(){
    const userId = localStorage.getItem('id');
    if(userId === null) return;
    this.offersService.getAllOffersByUserChangeId(userId).subscribe((data: any) => {
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
        this.postService.getProductById(offer.id_product_offers).subscribe((resPost: any) => {
          offer.setProductOffers = resPost;

          this.userService.getUserById(Number(offer.product_offers.user_id)).subscribe((resUser: any) => {
            offer.setUserOffers = resUser;
            return offer
          });

        })
      });

      this.offers.map((offer: any) => {
        this.postService.getProductById(offer.id_product_get).subscribe((resPost: any) => {

          offer.setProductGet = resPost;
        });

      });
    });
  }

  getAllOffers2(){
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
        this.postService.getProductById(offer.id_product_offers).subscribe((resPost: any) => {
          offer.setProductOffers = resPost;
          return offer
        })
      });

      this.offers.map((offer: any) => {
        this.postService.getProductById(offer.id_product_get).subscribe((resPost: any) => {

          offer.setProductGet = resPost;

          this.userService.getUserById(Number(offer.product_get.user_id)).subscribe((resUser: any) => {
            offer.setUserGet = resUser;
            return offer
          });

        });

      });

    });
  }


  HandleMouseEnter(indexRate:number,indexOffer:number){
    this.selectedStar[indexOffer]=indexRate+1;
  }

  HandleMouseLeave(indexOffer:number){
    if(this.previousSelection[indexOffer]!==0) {
      this.selectedStar[indexOffer] = this.previousSelection[indexOffer];
    }else {
      this.selectedStar[indexOffer]=0;
    }
  }

  Rating(indexRate:number,indexOffer:number){
    this.selectedStar[indexOffer]=indexRate+1;
    this.previousSelection[indexOffer]=this.selectedStar[indexOffer];
  }

  sendReview(indexOffer:any, otherId:any){
    if(this.selectedStar[indexOffer]==0){
      alert("Por favor seleccione una puntuación de estrellas");
    }
    if(this.selectedStar[indexOffer]!=0){
        const review = {
          content: this.inputs[indexOffer],
          score: this.selectedStar[indexOffer],
          get_user_id: otherId,
          give_user_id: this.userMe.id
        }
        console.log(review);
        this.reviewService.postReview(review).subscribe((data) => {
          this.dialogReviewPost.open(DialogEditPostComponent,{disableClose: true});
        });
    }
  }

}
