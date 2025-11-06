export interface Producto {
  id: number;
  titulo: string;
  estado: string;           // "nuevo" | "usado"
  descripcion?: string;
  precio: number;
  stock: number;
  imagenUrl?: string;
  categoria: string;
  owner?: { id: number } | null;
}

export interface ProductoCreate {
  titulo: string;
  estado: string;
  descripcion?: string;
  precio: number;
  stock?: number;
  imagenUrl?: string;
  categoria: string;
}
