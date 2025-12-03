import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { CheckoutService, CheckoutRequest } from '../../services/checkout.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { lastValueFrom } from 'rxjs';

// Enum para tipos de error
enum ErrorTipo {
  TARJETA_INCOMPLETA = 'TARJETA_INCOMPLETA',
  TARJETA_INVALIDA = 'TARJETA_INVALIDA',
  TARJETA_RECHAZADA = 'TARJETA_RECHAZADA',
  PROCESADOR_ERROR = 'PROCESADOR_ERROR',
  ORDEN_INVALIDA = 'ORDEN_INVALIDA',
  SERVIDOR_ERROR = 'SERVIDOR_ERROR',
  DESCONOCIDO = 'DESCONOCIDO'
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  private router = inject(Router);
  private checkoutSrv = inject(CheckoutService);
  
  // HACER PÚBLICO para el template
  carritoSrv = inject(CarritoService);

  today = new Date();


  // Estados
  pasoActual = signal<number>(1);
  cargando = signal<boolean>(false);
  errorMsg = signal<string>('');
  procesandoPago = signal<boolean>(false);
  cardElementListo = signal<boolean>(false);
  errorTipo = signal<ErrorTipo | null>(null);

  // Datos del formulario
  checkoutData: CheckoutRequest = {
    direccionEnvio: '',
    ciudad: '',
    telefono: '',
    referencia: '',
  };

  // Datos de pago
  ordenNumero = signal<string>('');
  stripe: any;
  cardElement: any;
  cardError = signal<string>('');
  elements: any;

  // Referencia al elemento donde se montará la tarjeta
  @ViewChild('cardElementRef') cardElementRef!: ElementRef;

  async ngOnInit() {
    // Verificar carrito
    if (this.carritoSrv.carritos().length === 0) {
      this.router.navigate(['/carrito']);
    }

    // Cargar Stripe
    await this.cargarStripe();
  }

  async cargarStripe() {
    try {
      console.log('🔑 Clave Stripe:', environment.stripePublicKey?.substring(0, 20) + '...');

      const stripeModule = await import('@stripe/stripe-js');
      this.stripe = await stripeModule.loadStripe(environment.stripePublicKey);

      if (this.stripe) {
        this.elements = this.stripe.elements();
        console.log('✅ Stripe y Elements cargados correctamente');
      } else {
        console.error('❌ Stripe no se pudo cargar');
        this.manejarError(ErrorTipo.PROCESADOR_ERROR, 'Error al cargar el procesador de pagos. Recarga la página.');
      }
    } catch (error) {
      console.error('❌ Error cargando Stripe:', error);
      this.manejarError(ErrorTipo.PROCESADOR_ERROR, 'Error al cargar el procesador de pagos.');
    }
  }

  private manejarError(tipo: ErrorTipo, mensaje: string, errorOriginal?: any) {
    console.error(`❌ [${tipo}]:`, mensaje, errorOriginal);
    
    this.errorTipo.set(tipo);
    this.errorMsg.set(mensaje);
    
    // Solo reiniciar formulario para errores de tarjeta
    if (
      tipo === ErrorTipo.TARJETA_INCOMPLETA || 
      tipo === ErrorTipo.TARJETA_INVALIDA ||
      tipo === ErrorTipo.TARJETA_RECHAZADA
    ) {
      setTimeout(() => {
        this.reiniciarFormularioPago();
      }, 1500);
    }
  }

  setupStripeCardElement() {
    // ✅ 1. PRIMERO verificar si YA EXISTE un cardElement
    if (this.cardElement) {
      console.log('✅ Card Element ya existe, no crear otro');
      return;
    }

    // ✅ 2. Verificar que tenemos Elements
    if (!this.elements) {
      console.error('❌ Stripe Elements no está inicializado');
      this.manejarError(ErrorTipo.PROCESADOR_ERROR, 'Error: El procesador de pagos no está listo. Recarga la página.');
      return;
    }

    // ✅ 3. USAR EL ELEMENTO DE ANGULAR
    const cardElementDiv = this.cardElementRef?.nativeElement;

    if (!cardElementDiv) {
      console.error('❌ No se encontró el elemento para montar la tarjeta');
      return;
    }

    // ✅ 4. LIMPIAR si ya hay algo
    if (cardElementDiv.children.length > 0) {
      console.log('🔄 Limpiando Card Element previo...');
      cardElementDiv.innerHTML = '';
    }

    try {
      // ✅ 5. CREAR el Card Element
      const style = {
        base: {
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#ef4444',
          iconColor: '#ef4444',
        },
      };

      // ✅ 6. Crear Card Element
      this.cardElement = this.elements.create('card', {
        style: style,
      });

      // ✅ 7. MONTAR en el div
      this.cardElement.mount(cardElementDiv);
      console.log('✅ Card Element montado CORRECTAMENTE');

      // ✅ 8. ESCUCHAR cambios
      this.cardElement.on('change', (event: any) => {
        if (event.error) {
          this.cardError.set(event.error.message);
          this.cardElementListo.set(false);
        } else if (event.empty) {
          this.cardError.set('Por favor, completa los datos de la tarjeta.');
          this.cardElementListo.set(false);
        } else if (!event.complete) {
          this.cardError.set('Faltan datos de la tarjeta.');
          this.cardElementListo.set(false);
        } else {
          this.cardError.set('');
          this.cardElementListo.set(true);
        }
      });
    } catch (error) {
      console.error('❌ ERROR montando Card Element:', error);
      this.manejarError(ErrorTipo.PROCESADOR_ERROR, 'Error al cargar el formulario de pago. Recarga la página.');
    }
  }

  totalCarrito(): number {
    return this.carritoSrv.carritos().reduce((total, item) => {
      return total + (item.producto?.precio || 0) * item.cantidad;
    }, 0);
  }

  // ============ PASO 1: ENVÍO ============

  validarPaso1(): boolean {
    return (
      !!this.checkoutData.direccionEnvio?.trim() &&
      !!this.checkoutData.ciudad?.trim() &&
      !!this.checkoutData.telefono?.trim()
    );
  }

  async avanzarAPago() {
    if (!this.validarPaso1()) {
      this.errorMsg.set('Completa todos los campos obligatorios (*)');
      return;
    }

    this.cargando.set(true);
    this.errorMsg.set('');
    this.errorTipo.set(null);

    try {
      // 1. Crear orden
      const orden: any = await lastValueFrom(this.checkoutSrv.crearOrden(this.checkoutData));
      this.ordenNumero.set(orden.numeroOrden);

      // 2. Avanzar al paso 2
      this.pasoActual.set(2);

      // ✅ ESPERAR para que Angular renderice el paso 2
      setTimeout(() => {
        if (!this.cardElement && this.elements) {
          this.setupStripeCardElement();
        } else if (!this.elements) {
          setTimeout(() => {
            if (this.elements && !this.cardElement) {
              this.setupStripeCardElement();
            }
          }, 300);
        }
      }, 100);
    } catch (error: any) {
      this.manejarError(ErrorTipo.SERVIDOR_ERROR, error.error?.message || 'Error al crear la orden');
    } finally {
      this.cargando.set(false);
    }
  }

  reiniciarFormularioPago() {
    console.log('🔄 Reiniciando formulario de pago...');

    // 1. Resetear el cardElement
    if (this.cardElement) {
      try {
        this.cardElement.unmount();
        this.cardElement.destroy();
      } catch (error) {
        console.log('⚠️ Error al destruir cardElement:', error);
      }
      this.cardElement = null;
    }

    // 2. Resetear señales
    this.cardElementListo.set(false);
    this.cardError.set('');
    this.errorMsg.set('');
    this.errorTipo.set(null);

    // 3. Limpiar el contenedor
    if (this.cardElementRef?.nativeElement) {
      this.cardElementRef.nativeElement.innerHTML = '';
    }

    // 4. Volver a crear el Card Element
    setTimeout(() => {
      if (this.elements && this.cardElementRef) {
        this.setupStripeCardElement();
      }
    }, 100);
  }

  // ============ PASO 2: PAGO ============

  async procesarPago() {
    // RESET de errores
    this.errorTipo.set(null);
    this.errorMsg.set('');
    
    // VALIDACIÓN 1: Tarjeta está lista
    if (!this.cardElementListo()) {
      this.manejarError(
        ErrorTipo.TARJETA_INCOMPLETA,
        'Completa todos los datos de la tarjeta antes de pagar.'
      );
      return;
    }
    
    // VALIDACIÓN 2: Orden existe
    if (!this.ordenNumero()) {
      this.manejarError(
        ErrorTipo.ORDEN_INVALIDA,
        'Error: No hay una orden activa. Vuelve al carrito.'
      );
      return;
    }
    
    this.procesandoPago.set(true);
    
    try {
      // PASO 1: Crear Payment Intent
      console.log('🔄 Creando Payment Intent para orden:', this.ordenNumero());
      
      const paymentIntentResult: any = await lastValueFrom(
        this.checkoutSrv.crearPaymentIntent(this.ordenNumero())
      );
      
      if (!paymentIntentResult?.clientSecret) {
        throw new Error('No se recibió clientSecret del servidor');
      }
      
      const clientSecret = paymentIntentResult.clientSecret;
      console.log('✅ Payment Intent creado');
      
      // PASO 2: Procesar con Stripe
      console.log('💳 Confirmando pago con Stripe...');
      
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: 'Cliente',
          },
        },
      });
      
      // MANEJO DE ERRORES DE STRIPE
      if (error) {
        console.error('❌ Error de Stripe:', error);
        
        // Clasificar error de Stripe
        switch (error.type) {
          case 'card_error':
            if (error.code === 'card_declined') {
              this.manejarError(
                ErrorTipo.TARJETA_RECHAZADA,
                'Tarjeta rechazada. Verifica tus datos o usa otra tarjeta.',
                error
              );
            } else if (error.code === 'expired_card') {
              this.manejarError(
                ErrorTipo.TARJETA_INVALIDA,
                'Tarjeta expirada. Verifica la fecha de vencimiento.',
                error
              );
            } else if (error.code === 'invalid_cvc' || error.code === 'invalid_number') {
              this.manejarError(
                ErrorTipo.TARJETA_INVALIDA,
                'Datos de tarjeta inválidos. Verifica el número, fecha o CVC.',
                error
              );
            } else {
              this.manejarError(
                ErrorTipo.TARJETA_INVALIDA,
                `Error de tarjeta: ${error.message}`,
                error
              );
            }
            break;
            
          case 'validation_error':
            this.manejarError(
              ErrorTipo.TARJETA_INVALIDA,
              'Datos inválidos. Verifica la información de la tarjeta.',
              error
            );
            break;
            
          default:
            this.manejarError(
              ErrorTipo.PROCESADOR_ERROR,
              'Error con el procesador de pagos. Intenta nuevamente.',
              error
            );
        }
        return;
      }
      
      if (!paymentIntent) {
        throw new Error('No se recibió confirmación del pago desde Stripe.');
      }
      
      console.log('✅ Pago confirmado por Stripe:', paymentIntent.id);
      
      // PASO 3: Procesar en backend
      console.log('🔄 Procesar pago en backend...');
      
      const backendResult = await lastValueFrom(
        this.checkoutSrv.procesarPago(this.ordenNumero(), paymentIntent.id)
      );
      
      if (!backendResult?.success) {
        throw new Error(backendResult?.message || 'Error al procesar el pago en el servidor.');
      }
      
      console.log('✅ Pago procesado exitosamente en backend');
      
      // PASO 4: Redirigir a confirmación
      const amount = paymentIntentResult.amount || paymentIntent.amount / 100 || this.totalCarrito();
      
      this.router.navigate(['/confirmacion'], {
        queryParams: {
          orden: this.ordenNumero(),
          monto: amount,
          pagoId: paymentIntent.id,
          fecha: new Date().toISOString(),
        },
      });
      
    } catch (error: any) {
      // ERRORES GENERALES
      console.error('❌ ERROR GENERAL en procesarPago:', error);
      
      // Determinar tipo de error
      if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        this.manejarError(
          ErrorTipo.SERVIDOR_ERROR,
          'Error de conexión. Verifica tu internet e intenta nuevamente.',
          error
        );
      } else if (error.status === 500 || error.status === 503) {
        this.manejarError(
          ErrorTipo.SERVIDOR_ERROR,
          'Error del servidor. Por favor, intenta más tarde.',
          error
        );
      } else {
        this.manejarError(
          ErrorTipo.DESCONOCIDO,
          `Error: ${error.message || 'Ocurrió un problema inesperado.'}`,
          error
        );
      }
    } finally {
      this.procesandoPago.set(false);
    }
  }

  // ============ UTILIDADES ============

  volverAEnvio() {
    this.reiniciarFormularioPago();
    this.pasoActual.set(1);
  }

  volverACarrito() {
    this.router.navigate(['/carrito']);
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
    }).format(precio);
  }
}