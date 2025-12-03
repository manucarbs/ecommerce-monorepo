import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { AuthService } from '@auth0/auth0-angular';
import { Producto } from '../../interface/IProducto';

@Component({
  selector: 'app-mis-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-productos.component.html',
  styleUrls: ['./mis-productos.component.css'],
})
export class MisProductosComponent implements OnInit {
  private router = inject(Router);
  private productoSrv = inject(ProductoService);
  public auth = inject(AuthService);

  // Estados
  productos = signal<Producto[]>([]);
  cargando = signal<boolean>(true);
  errorMsg = signal<string>('');
  eliminandoId = signal<number | null>(null);

  ngOnInit(): void {
    this.cargarMisProductos();
  }

  cargarMisProductos(): void {
    this.cargando.set(true);
    this.errorMsg.set('');

    this.productoSrv.getMine().subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.cargando.set(false);
        console.log('✅ Mis productos cargados:', productos.length);
      },
      error: (err) => {
        console.error('Error al cargar mis productos:', err);
        this.errorMsg.set('No se pudieron cargar tus productos');
        this.cargando.set(false);
      },
    });
  }

  // 🆕 MÉTODO PARA OBTENER IMAGEN (igual que en Productos)
  getImagen(p: Producto): string {
    // Usar imagenPrincipal si existe, sino la primera de imagenesUrl
    if (p.imagenPrincipal) {
      return p.imagenPrincipal;
    }

    if (p.imagenesUrl && p.imagenesUrl.length > 0) {
      return p.imagenesUrl[0];
    }

    // Fallback para productos antiguos
    if (p.imagenUrl) {
      return p.imagenUrl;
    }

    // Placeholder
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(p.titulo)}`;
  }

  navegarAPublicar(): void {
    this.router.navigate(['/create-product']);
  }

  irADashboard(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  editarProducto(id: number): void {
    this.router.navigate(['/editar-producto', id], {
      queryParams: { origen: 'misProductos' },
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/producto', id], {
      queryParams: { origen: 'misProductos' },
    });
  }

  eliminarProducto(id: number, titulo: string): void {
    const confirmacion = confirm(
      `¿Estás seguro de eliminar "${titulo}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    this.eliminandoId.set(id);

    this.productoSrv.delete(id).subscribe({
      next: () => {
        alert('✅ Producto eliminado exitosamente');
        // Remover el producto de la lista localmente
        this.productos.set(this.productos().filter((p) => p.id !== id));
        this.eliminandoId.set(null);
      },
      error: (err) => {
        console.error('Error al eliminar:', err);

        if (err.status === 500) {
          alert(
            '❌ No se puede eliminar el producto\n\n' +
              'Posibles razones:\n' +
              '• Otros usuarios lo tienen en favoritos\n' +
              '• Está en carritos de compra activos\n' +
              '• Hay órdenes pendientes relacionadas'
          );
        } else {
          alert('❌ Error al eliminar el producto');
        }

        this.eliminandoId.set(null);
      },
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
    }).format(precio);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  volverAHome(): void {
    this.router.navigate(['/home']);
  }
}