import { Component } from '@angular/core';
import {MatAnchor, MatButton} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import {UserSentOffersComponent} from "../user-sent-offers/user-sent-offers.component";
import {UserGetOffersComponent} from "../user-get-offers/user-get-offers.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-user-offers',
  standalone: true,
  imports: [
    MatButton,
    MatAnchor,
    RouterLink,
    UserSentOffersComponent,
    UserGetOffersComponent,
    NgIf
  ],
  templateUrl: './user-offers.component.html',
  styleUrl: './user-offers.component.css'
})
export class UserOffersComponent {
  showSent: boolean = true;

  showSentOffers() {
    this.showSent = true;
  }

  showGetOffers() {
    this.showSent = false;
  }
}
