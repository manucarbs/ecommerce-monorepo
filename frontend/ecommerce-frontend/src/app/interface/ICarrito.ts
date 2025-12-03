export interface Carrito {
  id: number;
  usuarioId: number;
  productoId: number;
  cantidad: number;
  agregadoEn: string;
  actualizadoEn: string;
  producto?: any;  // OPTIONAL igual que en favoritos
  subtotal?: number; // 🆕 Para cálculos
}
