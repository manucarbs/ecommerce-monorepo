import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritosService } from '../../services/favoritos.service';
import { Favorito } from '../../interface/IFavorito';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css']
})
export class FavoritosComponent implements OnInit {
  private favoritosSrv = inject(FavoritosService);
  private router = inject(Router);

  // Estado
  favoritos = signal<Favorito[]>([]);
  cargando = signal<boolean>(true);
  errorMsg = signal<string>('');
  eliminandoId = signal<number | null>(null);

  ngOnInit(): void {
    this.cargarFavoritos();
  }

  cargarFavoritos(): void {
    this.cargando.set(true);
    this.errorMsg.set('');

    this.favoritosSrv.cargarFavoritos().subscribe({
      next: (favs) => {
        this.favoritos.set(favs);
        this.cargando.set(false);
        console.log('✅ Favoritos cargados:', favs);
      },
      error: (err) => {
        console.error('❌ Error al cargar favoritos:', err);
        this.errorMsg.set('No se pudieron cargar los favoritos');
        this.cargando.set(false);
      }
    });
  }

  eliminarFavorito(favorito: Favorito, event: Event): void {
    event.stopPropagation(); // Evitar que se abra el detalle del producto

    const confirmacion = confirm(
      `¿Eliminar "${favorito.producto.titulo}" de favoritos?`
    );

    if (!confirmacion) return;

    this.eliminandoId.set(favorito.productoId);

    this.favoritosSrv.eliminar(favorito.productoId).subscribe({
      next: () => {
        console.log('✅ Favorito eliminado');
        // Actualizar la lista localmente
        const favoritosActualizados = this.favoritos().filter(
          f => f.productoId !== favorito.productoId
        );
        this.favoritos.set(favoritosActualizados);
        this.eliminandoId.set(null);
      },
      error: (err) => {
        console.error('❌ Error al eliminar favorito:', err);
        alert('❌ No se pudo eliminar el favorito');
        this.eliminandoId.set(null);
      }
    });
  }

  verProducto(productoId: number): void {
    this.router.navigate(['/producto', productoId]);
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

  get cantidadFavoritos(): number {
    return this.favoritos().length;
  }
}