import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { ProductoService } from '../../services/producto.service';
import { Carrito } from '../../interface/ICarrito';
import { Producto } from '../../interface/IProducto';
import { forkJoin } from 'rxjs';

interface CarritoConProducto extends Carrito {
  producto: Producto;
  subtotal: number;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  private router = inject(Router);
  private carritoSrv = inject(CarritoService);
  private productoSrv = inject(ProductoService);

  // Estado
  carritosConProductos = signal<CarritoConProducto[]>([]);
  cargando = signal<boolean>(true);
  errorMsg = signal<string>('');
  procesando = signal<boolean>(false);
  eliminando = signal<number | null>(null);
  actualizandoCantidad = signal<number | null>(null);

  // Computed
  carritoVacio = computed(() => this.carritosConProductos().length === 0);
  
  total = computed(() => {
    return this.carritosConProductos().reduce((sum, item) => sum + item.subtotal, 0);
  });

  cantidadTotal = computed(() => {
    return this.carritosConProductos().reduce((sum, item) => sum + item.cantidad, 0);
  });

  ngOnInit(): void {
    this.cargarCarrito();
  }

  cargarCarrito(): void {
    this.cargando.set(true);
    this.errorMsg.set('');

    this.carritoSrv.cargarCarrito().subscribe({
      next: (carritos) => {
        if (carritos.length === 0) {
          this.carritosConProductos.set([]);
          this.cargando.set(false);
          return;
        }

        // Obtener detalles de cada producto
        const observables = carritos.map(carrito =>
          this.productoSrv.getById(carrito.productoId)
        );

        forkJoin(observables).subscribe({
          next: (productos) => {
            const carritosCompletos: CarritoConProducto[] = carritos.map((carrito, index) => ({
              ...carrito,
              producto: productos[index] as Producto,
              subtotal: (productos[index] as Producto).precio * carrito.cantidad
            }));

            this.carritosConProductos.set(carritosCompletos);
            this.cargando.set(false);
            console.log('✅ Carrito cargado con productos:', carritosCompletos);
          },
          error: (err) => {
            console.error('Error al cargar productos:', err);
            this.errorMsg.set('Error al cargar los detalles de los productos');
            this.cargando.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar carrito:', err);
        this.errorMsg.set('No se pudo cargar el carrito');
        this.cargando.set(false);
      }
    });
  }

  aumentarCantidad(item: CarritoConProducto): void {
    if (item.cantidad >= item.producto.stock) {
      alert(`❌ Stock máximo alcanzado (${item.producto.stock} disponibles)`);
      return;
    }

    this.actualizarCantidadItem(item, item.cantidad + 1);
  }

  disminuirCantidad(item: CarritoConProducto): void {
    if (item.cantidad <= 1) {
      return;
    }

    this.actualizarCantidadItem(item, item.cantidad - 1);
  }

  private actualizarCantidadItem(item: CarritoConProducto, nuevaCantidad: number): void {
    this.actualizandoCantidad.set(item.productoId);

    this.carritoSrv.actualizarCantidad(item.productoId, nuevaCantidad).subscribe({
      next: (carritoActualizado) => {
        // Actualizar localmente
        const carritos = this.carritosConProductos().map(c =>
          c.productoId === item.productoId
            ? { ...c, cantidad: nuevaCantidad, subtotal: item.producto.precio * nuevaCantidad }
            : c
        );
        this.carritosConProductos.set(carritos);
        this.actualizandoCantidad.set(null);
      },
      error: (err) => {
        console.error('Error al actualizar cantidad:', err);
        alert('❌ Error al actualizar la cantidad');
        this.actualizandoCantidad.set(null);
      }
    });
  }

  eliminarItem(item: CarritoConProducto): void {
    const confirmar = confirm(`¿Eliminar "${item.producto.titulo}" del carrito?`);
    if (!confirmar) return;

    this.eliminando.set(item.productoId);

    this.carritoSrv.eliminar(item.productoId).subscribe({
      next: () => {
        const carritos = this.carritosConProductos().filter(c => c.productoId !== item.productoId);
        this.carritosConProductos.set(carritos);
        this.eliminando.set(null);
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        alert('❌ Error al eliminar el producto del carrito');
        this.eliminando.set(null);
      }
    });
  }

  irAlProducto(productoId: number): void {
    this.router.navigate(['/producto', productoId]);
  }

  vaciarCarrito(): void {
    const confirmar = confirm(
      `¿Estás seguro de vaciar el carrito?\n\nSe eliminarán ${this.carritosConProductos().length} productos.`
    );
    if (!confirmar) return;

    this.procesando.set(true);

    this.carritoSrv.limpiarCarrito().subscribe({
      next: () => {
        this.carritosConProductos.set([]);
        this.procesando.set(false);
        alert('✅ Carrito vaciado exitosamente');
      },
      error: (err) => {
        console.error('Error al vaciar carrito:', err);
        alert('❌ Error al vaciar el carrito');
        this.procesando.set(false);
      }
    });
  }

confirmarPedido(): void {
  if (this.carritoVacio()) {
    alert('❌ El carrito está vacío');
    return;
  }

  // Verificar stock antes de proceder
  const productosInvalidos = this.carritosConProductos().filter(
    item => item.cantidad > item.producto.stock
  );

  if (productosInvalidos.length > 0) {
    const nombres = productosInvalidos.map(p => `• ${p.producto.titulo}`).join('\n');
    alert(`❌ Los siguientes productos no tienen stock suficiente:\n\n${nombres}\n\nPor favor actualiza las cantidades.`);
    return;
  }

  const confirmar = confirm(
    `¿Continuar al checkout?\n\n` +
    `Total de productos: ${this.carritosConProductos().length}\n` +
    `Total de items: ${this.cantidadTotal()}\n` +
    `Total a pagar: ${this.formatearPrecio(this.total())}\n\n` +
    `Serás redirigido al proceso de pago.`
  );

  if (!confirmar) return;

  // 🆕 REDIRIGIR AL CHECKOUT en lugar de procesar directamente
  this.router.navigate(['/checkout']);
}

  continuarComprando(): void {
    this.router.navigate(['/home']);
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
    }).format(precio);
  }

  obtenerImagenProducto(producto: Producto): string {
    if (producto.imagenesUrl && producto.imagenesUrl.length > 0) {
      return producto.imagenesUrl[0];
    }
    if (producto.imagenUrl) {
      return producto.imagenUrl;
    }
    return `https://via.placeholder.com/200x200?text=${encodeURIComponent(producto.titulo)}`;
  }
}