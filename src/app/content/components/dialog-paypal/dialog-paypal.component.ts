import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent,
} from '@angular/material/dialog';
import { MembershipsService } from '../../service/memberships/memberships.service';

declare var paypal: any;

@Component({
  selector: 'app-dialog-paypal',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent
  ],
  templateUrl: './dialog-paypal.component.html',
  styleUrl: './dialog-paypal.component.css'
})
export class DialogPaypalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DialogPaypalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string, name: string, price: number, planId: number, userId: number, subscriptionId: number },
    private membershipsService: MembershipsService
  ) {}

  ngOnInit() {
    const containerId = `paypal-button-container-${this.data.id}`;

    setTimeout(() => {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = '';

      paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: this.data.price.toString() },
              description: `Membresía ${this.data.name}`
            }]
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then(() => {
            const body = {
              state: 'Activo',
              planId: this.data.planId,
              userId: this.data.userId
            };

            this.membershipsService.putSubscriptionStatus(this.data.subscriptionId, body).subscribe({
              next: () => this.dialogRef.close(true),
              error: (error) => {
                console.error('Error al actualizar suscripción:', error);
                this.dialogRef.close(false);
              }
            });
          });
        },
        onError: (err: any) => {
          console.error('PayPal Error:', err);
        }
      }).render(`#${containerId}`);
    }, 0);
  }
}
