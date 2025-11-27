import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { FavoritosService } from '../../services/favoritos.service';
import { Producto } from '../../interface/IProducto';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto-detalle.html',
  styleUrls: ['./producto-detalle.css'],
})
export class ProductoDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoSrv = inject(ProductoService);
  private favoritosSrv = inject(FavoritosService);
  public auth = inject(AuthService);

  // Estado
  producto = signal<Producto | null>(null);
  cargando = signal<boolean>(true);
  errorMsg = signal<string>('');

  // Galería de imágenes
  imagenActual = signal<number>(0);
  mostrarGaleria = signal<boolean>(false);

  // Usuario actual
  currentUserSub = signal<string | null>(null);

  // Acciones
  eliminando = signal<boolean>(false);
  
  // Favoritos
  toggleandoFavorito = signal<boolean>(false);
  
  // Computed para saber si es favorito
  esFavorito = computed(() => {
    const p = this.producto();
    return p ? this.favoritosSrv.esFavorito(p.id) : false;
  });

  ngOnInit(): void {
    // Obtener ID del producto de la URL
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMsg.set('ID de producto no válido');
      this.cargando.set(false);
      return;
    }

    // Obtener usuario actual
    this.auth.user$.subscribe((user) => {
      if (user?.sub) {
        this.currentUserSub.set(user.sub);
        // Cargar IDs de favoritos al iniciar
        this.favoritosSrv.cargarIdsFavoritos().subscribe();
      }
    });

    // Cargar producto
    this.cargarProducto(Number(id));
  }

  cargarProducto(id: number): void {
    this.cargando.set(true);
    this.errorMsg.set('');

    this.productoSrv.getById(id).subscribe({
      next: (producto) => {
        this.producto.set(producto);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
        this.errorMsg.set('No se pudo cargar el producto');
        this.cargando.set(false);
      },
    });
  }

  // ========== GALERÍA ==========

  get imagenes(): string[] {
    const p = this.producto();
    if (!p) return [];

    if (p.imagenesUrl && p.imagenesUrl.length > 0) {
      return p.imagenesUrl;
    }

    if (p.imagenUrl) {
      return [p.imagenUrl];
    }

    return [`https://via.placeholder.com/800x600?text=${encodeURIComponent(p.titulo)}`];
  }

  seleccionarImagen(index: number): void {
    this.imagenActual.set(index);
  }

  abrirGaleria(index: number): void {
    this.imagenActual.set(index);
    this.mostrarGaleria.set(true);
  }

  cerrarGaleria(): void {
    this.mostrarGaleria.set(false);
  }

  imagenAnterior(event: Event): void {
    event.stopPropagation();
    const imgs = this.imagenes;
    const actual = this.imagenActual();
    this.imagenActual.set(actual > 0 ? actual - 1 : imgs.length - 1);
  }

  imagenSiguiente(event: Event): void {
    event.stopPropagation();
    const imgs = this.imagenes;
    const actual = this.imagenActual();
    this.imagenActual.set(actual < imgs.length - 1 ? actual + 1 : 0);
  }

  // ========== PERMISOS ==========

  get esElDueno(): boolean {
    const p = this.producto();
    const currentSub = this.currentUserSub();
    return p !== null && currentSub !== null && p.ownerSub === currentSub;
  }

  // ========== FAVORITOS ==========

  toggleFavorito(): void {
    const p = this.producto();
    if (!p) return;

    this.toggleandoFavorito.set(true);

    this.favoritosSrv.toggle(p.id).subscribe({
      next: () => {
        this.toggleandoFavorito.set(false);
      },
      error: (err) => {
        console.error('Error al toggle favorito:', err);
        alert('❌ Error al actualizar favoritos');
        this.toggleandoFavorito.set(false);
      }
    });
  }

  // ========== ACCIONES ==========

  editarProducto(): void {
    const p = this.producto();
    if (!p) return;
    this.router.navigate(['/editar-producto', p.id]);
  }

  eliminarProducto(): void {
    const p = this.producto();
    if (!p) return;

    const confirmacion = confirm(
      `¿Estás seguro de eliminar "${p.titulo}"?\n\n` +
        `Las ${this.imagenes.length} imagen(es) también se eliminarán de Cloudinary.\n\n` +
        `Esta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    this.eliminando.set(true);

    this.productoSrv.delete(p.id).subscribe({
      next: () => {
        alert('✅ Producto e imágenes eliminados exitosamente');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        alert('❌ No se pudo eliminar el producto');
        this.eliminando.set(false);
      },
    });
  }

  contactarVendedor(): void {
    const p = this.producto();
    if (!p) return;
    alert(`Contactar al vendedor\nProducto: ${p.titulo}\nVendedor ID: ${p.ownerId}`);
  }

  volver(): void {
    this.router.navigate(['/home']);
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
      month: 'long',
      day: 'numeric',
    });
  }
}