import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { OrdenService } from '../../services/orden.service';
import { Producto } from '../../interface/IProducto';
import { Orden } from '../../interface/IOrden';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  private router = inject(Router);
  private productoSrv = inject(ProductoService);
  private ordenSrv = inject(OrdenService);

  productos = signal<Producto[]>([]);
  ordenes = signal<Orden[]>([]);
  cargando = signal<boolean>(true);
  errorMsg = signal<string>('');

  estadisticas = signal({
    totalVentas: 0,
    ordenesHoy: 0,
    productosActivos: 0,
    promedioVenta: 0,
    ordenesPorEstado: {
      pendiente: 0,
      pagado: 0,
      cancelado: 0
    }
  });

  ngOnInit(): void {
    this.cargarDashboard();
  }

    // AÑADE ESTE MÉTODO
  volverAHome() {
    this.router.navigate(['/misProductos']); // O la ruta que uses para la página principal
  }

  cargarDashboard(): void {
    this.cargando.set(true);
    this.errorMsg.set('');

    Promise.all([
      this.cargarMisProductos(),
      this.cargarOrdenesRecientes(),
      this.cargarEstadisticas()
    ]).finally(() => {
      this.cargando.set(false);
    });
  }

  cargarMisProductos(): Promise<void> {
    return new Promise((resolve) => {
      this.productoSrv.getMine().subscribe({
        next: (productos) => {
          this.productos.set(productos);
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar productos:', err);
          resolve();
        },
      });
    });
  }

  cargarOrdenesRecientes(): Promise<void> {
    return new Promise((resolve) => {
      this.ordenSrv.getOrdenesVendedor().subscribe({
        next: (ordenes) => {
          // Agregar campos compatibles para el template
          const ordenesCompatibles = ordenes.map(orden => ({
            ...orden,
            montoTotal: orden.total,
            fechaCreacion: orden.creadoEn,
            cliente: orden.comprador ? { nombre: orden.comprador.nombre || 'Cliente' } : { nombre: 'Cliente' },
            estadoPago: orden.estado,
            estadoEnvio: 'pendiente' // Temporal
          }));
          this.ordenes.set(ordenesCompatibles);
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar órdenes:', err);
          resolve();
        }
      });
    });
  }

  cargarEstadisticas(): Promise<void> {
    return new Promise((resolve) => {
      this.ordenSrv.getEstadisticasVendedor().subscribe({
        next: (stats) => {
          this.estadisticas.set(stats);
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar estadísticas:', err);
          resolve();
        },
      });
    });
  }

  // 🛠️ Métodos de utilidad
  getImagen(p: Producto): string {
    if (p.imagenPrincipal) return p.imagenPrincipal;
    if (p.imagenesUrl && p.imagenesUrl.length > 0) return p.imagenesUrl[0];
    if (p.imagenUrl) return p.imagenUrl;
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(p.titulo)}`;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
    }).format(precio);
  }

  formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return 'Fecha no disponible';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 📊 Navegación
  verTodosProductos(): void {
    this.router.navigate(['/mis-productos']);
  }

  verTodasOrdenes(): void {
    // Temporal
    alert('Página de todas las órdenes - En desarrollo');
  }

  verDetalleOrden(id: number): void {
    const orden = this.ordenes().find(o => o.id === id);
    if (orden) {
      alert(`Detalle de orden ${orden.numeroOrden}\nTotal: ${this.formatearPrecio(orden.total)}`);
    }
  }

}