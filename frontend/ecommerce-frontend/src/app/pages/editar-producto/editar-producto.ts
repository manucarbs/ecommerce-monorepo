import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../interface/IProducto';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-producto.html',
  styleUrls: ['./editar-producto.css'],
})
export class EditarProductoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoSrv = inject(ProductoService);

  producto = signal<Producto | null>(null);
  cargando = signal(true);
  guardando = signal(false);
  errorMsg = signal('');
  progresoUpload = signal('');
  origen = signal<string>('producto');

  // Manejo de imágenes
  selectedFiles = signal<File[]>([]);
  previewUrls = signal<string[]>([]);
  subiendoImagenes = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMsg.set('ID no válido');
      this.cargando.set(false);
      return;
    }

    this.route.queryParams.subscribe((params) => {
      this.origen.set(params['origen'] || 'producto');
    });

    this.productoSrv.getById(Number(id)).subscribe({
      next: (data) => {
        this.producto.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMsg.set('Error al cargar el producto');
        this.cargando.set(false);
      },
    });
  }

  // Subir imágenes nuevas
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    if (files.length > 5) {
      this.errorMsg.set('⚠️ Máximo 5 imágenes nuevas');
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        this.errorMsg.set(`❌ ${file.name}: Solo JPG y PNG`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorMsg.set(`❌ ${file.name}: Máximo 5MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    this.selectedFiles.set(validFiles);
    const previews: string[] = [];
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target?.result as string);
        this.previewUrls.set([...previews]);
      };
      reader.readAsDataURL(file);
    });

    this.errorMsg.set('');
  }

  removePreview(index: number): void {
    const files = [...this.selectedFiles()];
    const previews = [...this.previewUrls()];
    files.splice(index, 1);
    previews.splice(index, 1);
    this.selectedFiles.set(files);
    this.previewUrls.set(previews);
  }

  eliminarImagenActual(index: number): void {
    const p = this.producto();
    if (!p) return;
    p.imagenesUrl.splice(index, 1);
    this.producto.set({ ...p });
  }

  guardarCambios(): void {
    const p = this.producto();
    if (!p) return;

    // Validaciones básicas
    if (!p.titulo || !p.precio || p.precio <= 0) {
      this.errorMsg.set('❌ Completa los campos obligatorios correctamente');
      return;
    }

    if (p.stock < 0) {
      this.errorMsg.set('❌ El stock no puede ser negativo');
      return;
    }

    this.guardando.set(true);
    this.errorMsg.set('');
    this.progresoUpload.set('');

    // Si no hay imágenes nuevas → guardar directamente
    if (this.selectedFiles().length === 0) {
      this.actualizarProducto(p.imagenesUrl);
      return;
    }

    // Subir nuevas imágenes
    this.subiendoImagenes = true;
    this.progresoUpload.set('📤 Subiendo imágenes a Cloudinary...');

    const uploadObservables = this.selectedFiles().map((file) =>
      this.productoSrv.uploadImage(file).pipe(catchError(() => of(null)))
    );

    forkJoin(uploadObservables).subscribe({
      next: (results) => {
        const nuevasUrls = results.filter((r) => r !== null).map((r) => r!.url);
        const urlsFinales = [...(p.imagenesUrl || []), ...nuevasUrls];
        this.subiendoImagenes = false;
        this.progresoUpload.set('');
        this.actualizarProducto(urlsFinales);
      },
      error: (e) => {
        console.error(e);
        this.errorMsg.set('❌ Error al subir imágenes');
        this.guardando.set(false);
        this.subiendoImagenes = false;
      },
    });
  }

  private actualizarProducto(urlsFinales: string[]): void {
    const p = this.producto();
    if (!p) return;

    const updated = {
      ...p,
      imagenesUrl: urlsFinales,
      stock: p.stock || 1, // Asegurar que siempre tenga valor
      whatsappContacto: p.whatsappContacto || undefined,
    };

    this.productoSrv.update(p.id, updated).subscribe({
      next: () => {
        this.errorMsg.set('✅ Producto actualizado correctamente');
        setTimeout(() => {
          const ruta = this.origen() === 'misProductos' ? '/misProductos' : `/producto/${p.id}`;
          this.router.navigate([ruta]);
        }, 1500);
      },
      error: (err) => {
        console.error(err);
        this.errorMsg.set('❌ No se pudo actualizar el producto');
        this.guardando.set(false);
      },
    });
  }

  cancelar(): void {
    const p = this.producto();
    if (!p) {
      this.router.navigate(['/home']);
      return;
    }

    // 👇 MODIFICAR ESTA LÓGICA
    const ruta = this.origen() === 'misProductos' ? '/misProductos' : `/producto/${p.id}`;

    this.router.navigate([ruta]);
  }
}