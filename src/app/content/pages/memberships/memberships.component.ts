import { Component, OnInit } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { MembershipsService } from "../../service/memberships/memberships.service";
import { Memberships } from "../../model/memberships/memberships.model";
import { UsersService } from "../../service/users/users.service";
import { DialogLoginRegisterComponent } from "../../../public/components/dialog-login-register/dialog-login-register.component";
import { MatDialog } from "@angular/material/dialog";
import { Router } from '@angular/router';
import {forkJoin, throwIfEmpty} from "rxjs";
import { Users } from "../../model/users/users.model";

@Component({
  selector: 'app-memberships',
  standalone: true,
  imports: [
    MatCardModule,
    NgForOf,
    NgClass,
    NgIf
  ],
  templateUrl: './memberships.component.html',
  styleUrls: ['./memberships.component.css']
})
export class MembershipsComponent implements OnInit {

  memberships: Memberships[] = [];
  user: Users | null = null;
  isLoggedIn: boolean = false;
  dataLoaded: boolean = false;
  loading: boolean = true;

  constructor(
    private membershipsService: MembershipsService,
    private userService: UsersService,
    private dialogLoginRegister: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.userService.isLogged;
    if (this.isLoggedIn) {
      this.getUser();
    } else {
      this.loadMemberships();
    }
  }

  getUser() {
    const userId = Number(localStorage.getItem('id'));
    if (userId) {
      this.userService.getUserById(userId).subscribe((data) => {
        this.user = data;
        this.loadMemberships();
      });
    }
  }

  loadMemberships() {
    this.membershipsService.getMembershipsWithBenefits().subscribe(
      (membershipsWithBenefits: any[]) => {
        this.memberships = membershipsWithBenefits;
        this.filterMemberships();
        this.dataLoaded = true; // Marcar la carga completa después de obtener las membresías
        this.loading = false; // Ocultar pantalla de carga
      },
      error => {
        this.loading = false; // Asegurar que la pantalla de carga se oculte en caso de error
      }
    );
  }

  filterMemberships() {
    if (this.isLoggedIn && this.user) {
      this.memberships = this.memberships.filter(
        m => m.id !== this.user!.membership && Number(m.id) !== 1
      );
    }
  }

  onBuyPlan(membershipId: string) {
    if (!this.isLoggedIn) {
      this.dialogLoginRegister.open(DialogLoginRegisterComponent, { disableClose: true });
    } else {
      if (this.user && this.user.membership === membershipId) {
        // Add your logic here if the user is already on the selected membership
      } else {
        this.router.navigateByUrl(`/memberships/buy-membership&${membershipId}`);
      }
    }
  }

  protected readonly throwIfEmpty = throwIfEmpty;
}
