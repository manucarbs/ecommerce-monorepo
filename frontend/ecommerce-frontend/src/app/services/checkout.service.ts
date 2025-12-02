import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CheckoutRequest {
  direccionEnvio: string;
  ciudad: string;
  telefono: string;
  referencia?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  orderNumber: string;
  amount: number;
  currency: string;
}

export interface PagoResponse {
  success: boolean;
  message: string;
  orderNumber?: string;
  paymentIntentId?: string;
  amount?: number;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUri + '/api';
  
  // 1. Crear orden desde carrito
  crearOrden(checkoutData: CheckoutRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/ordenes/checkout`, checkoutData);
  }
  
  // 2. Crear Payment Intent
  crearPaymentIntent(ordenNumero: string): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(
      `${this.apiUrl}/pagos/crear-intento`, 
      { ordenNumero }
    );
  }
  
  // 3. Procesar pago
  procesarPago(ordenNumero: string, paymentIntentId: string): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(
      `${this.apiUrl}/pagos/procesar`,
      { ordenNumero, paymentIntentId }
    );
  }
}