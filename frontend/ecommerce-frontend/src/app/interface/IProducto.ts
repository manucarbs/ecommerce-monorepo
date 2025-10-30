export interface Producto {
  id?: number;
  titulo: string;
  categoria: string;
  estado: string;
  descripcion: string;
  precio: number;
  imagenUrl?: string;
}
