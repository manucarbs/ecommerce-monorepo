export interface Favorito {
  id: number;
  usuarioId: number;
  productoId: number;
  agregadoEn: string;
  producto?: any;  // DEBE SER OPTIONAL igual que en el servicio
}