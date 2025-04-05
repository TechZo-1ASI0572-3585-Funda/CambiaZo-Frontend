import { Component, OnInit } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {FooterContent2Component} from "../../../public/footer-content-2/footer-content-2.component";
import {UsersService} from "../../service/users/users.service";
import {Users} from "../../model/users/users.model";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatFormField,
    MatInput,
    MatButton,
    MatLabel,
    RouterLinkActive,
    FooterContent2Component,
    NgIf,
    MatSuffix,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = "";
  password: string = "";
  showError: boolean = false;
  errorMessage: string = "";
  hide = true;

  constructor(private router: Router, private userService: UsersService) { }

  login(): void {
    this.showError = false;
    this.userService.login({ username: this.username, password: this.password }).subscribe((result: any) => {
      if (result === true) {
        this.router.navigateByUrl('/home');
      } else if (result === 'password') {
        this.errorMessage = 'Contraseña incorrecta';
      } else if (result === 'user') {
        this.errorMessage = 'Usuario no encontrado';
      } else {
        this.errorMessage = 'Error al intentar iniciar sesión';
      }
      if (result !== true) {
        this.showError = true;
      }
    });
  }
  clearErrorMessage(): void {
    this.showError = false;
  }

  onUsernameInput(): void {
    this.clearErrorMessage();
  }

  onPasswordInput(): void {
    this.clearErrorMessage();
  }

  hide1(event: MouseEvent) {
    this.hide = !this.hide;
    event.stopPropagation();
  }
}
