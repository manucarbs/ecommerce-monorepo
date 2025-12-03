import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmacion.component.html',
  styleUrls: ['./confirmacion.component.css']
})
export class ConfirmacionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carritoSrv = inject(CarritoService);
  
  // Datos de la orden
  ordenNumero: string = '';
  montoTotal: number = 0;
  pagoId: string = '';
  fecha: string = '';
  
  ngOnInit() {
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.ordenNumero = params['orden'] || 'N/A';
      this.montoTotal = parseFloat(params['monto']) || 0;
      this.pagoId = params['pagoId'] || 'N/A';
      this.fecha = params['fecha'] || new Date().toISOString();
      
      // Limpiar carrito después de compra exitosa
      this.carritoSrv.limpiarCarritoLocal();
    });
  }
  
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
    }).format(precio);
  }
  
  formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  descargarRecibo() {
    const recibo = `
      🎉 COMPRA EXITOSA 🎉
      
      Orden: ${this.ordenNumero}
      Fecha: ${this.formatearFecha(this.fecha)}
      Pago ID: ${this.pagoId}
      Monto: ${this.formatearPrecio(this.montoTotal)}
      
      Estado: PAGADO ✓
      
      Gracias por tu compra.
      Tu orden ha sido procesada exitosamente.
      
      ¿Preguntas? Contacta a soporte.
    `;
    
    const blob = new Blob([recibo], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo-${this.ordenNumero}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  volverAHome() {
    this.router.navigate(['/home']);
  }

}