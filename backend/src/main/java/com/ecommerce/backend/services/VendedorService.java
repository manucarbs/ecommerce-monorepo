package com.ecommerce.backend.services;

import com.ecommerce.backend.entities.*;
import com.ecommerce.backend.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendedorService {
    
    private final OrdenRepository ordenRepository;
    private final ProductoRepository productoRepository;
    
    /**
     * Obtener estadísticas del vendedor
     */
    public Map<String, Object> obtenerEstadisticasVendedor(String auth0Sub) {
        log.info("📊 Obteniendo estadísticas para vendedor: {}", auth0Sub);
        
        Map<String, Object> estadisticas = new HashMap<>();
        
        // 1. Órdenes del vendedor
        List<Orden> ordenesVendedor = ordenRepository.findByVendedorSub(auth0Sub);
        List<Orden> ordenesPagadas = ordenesVendedor.stream()
                .filter(o -> "PAGADO".equals(o.getEstado()))
                .toList();
        
        // 2. Ventas totales
        Double ventasTotales = ordenesPagadas.stream()
                .mapToDouble(Orden::getTotal)
                .sum();
        estadisticas.put("totalVentas", ventasTotales);
        
        // 3. Órdenes hoy
        LocalDate hoy = LocalDate.now();
        long ordenesHoy = ordenesVendedor.stream()
                .filter(o -> {
                    LocalDate fechaOrden = o.getCreadoEn().atZone(ZoneId.systemDefault()).toLocalDate();
                    return fechaOrden.equals(hoy);
                })
                .count();
        estadisticas.put("ordenesHoy", ordenesHoy);
        
        // 4. Productos activos (con stock > 0)
        Long productosActivos = productoRepository.countActivosByOwnerSub(auth0Sub);
        if (productosActivos == null) {
            // Fallback: obtener todos y contar
            productosActivos = productoRepository.findByOwnerSub(auth0Sub).stream()
                    .filter(p -> p.getStock() > 0)
                    .count();
        }
        estadisticas.put("productosActivos", productosActivos);
        
        // 5. Promedio por venta
        double promedioVenta = ordenesPagadas.isEmpty() ? 0.0 : 
                ventasTotales / ordenesPagadas.size();
        estadisticas.put("promedioVenta", promedioVenta);
        
        // 6. Órdenes por estado
        Map<String, Long> ordenesPorEstado = new HashMap<>();
        ordenesPorEstado.put("pendiente", ordenesVendedor.stream()
                .filter(o -> "PENDIENTE".equals(o.getEstado()))
                .count());
        ordenesPorEstado.put("pagado", (long) ordenesPagadas.size());
        ordenesPorEstado.put("cancelado", ordenesVendedor.stream()
                .filter(o -> "CANCELADO".equals(o.getEstado()))
                .count());
        
        estadisticas.put("ordenesPorEstado", ordenesPorEstado);
        
        // 7. Ventas últimos 7 días
        Map<String, Double> ventasUltimaSemana = new HashMap<>();
        
        for (int i = 6; i >= 0; i--) {
            LocalDate fecha = hoy.minusDays(i);
            final LocalDate fechaFinal = fecha; // Para usar en lambda
            
            double ventasDia = ordenesPagadas.stream()
                    .filter(o -> {
                        LocalDate fechaOrden = o.getCreadoEn().atZone(ZoneId.systemDefault()).toLocalDate();
                        return fechaOrden.equals(fechaFinal);
                    })
                    .mapToDouble(Orden::getTotal)
                    .sum();
                    
            ventasUltimaSemana.put(fecha.toString(), ventasDia);
        }
        
        estadisticas.put("ventasUltimaSemana", ventasUltimaSemana);
        
        log.info("✅ Estadísticas calculadas: {}", estadisticas);
        return estadisticas;
    }
    
    /**
     * Obtener órdenes recientes del vendedor (últimos 30 días)
     */
    public List<Orden> obtenerOrdenesRecientes(String auth0Sub) {
        Instant hace30Dias = Instant.now().minusSeconds(30 * 24 * 60 * 60);
        
        return ordenRepository.findByVendedorSub(auth0Sub).stream()
                .filter(o -> o.getCreadoEn().isAfter(hace30Dias))
                .sorted((o1, o2) -> o2.getCreadoEn().compareTo(o1.getCreadoEn())) // Más recientes primero
                .limit(10) // Solo las 10 más recientes
                .toList();
    }
    
    /**
     * Obtener productos más vendidos del vendedor
     */
    public List<Map<String, Object>> obtenerProductosMasVendidos(String auth0Sub) {
        List<Orden> ordenesVendedor = ordenRepository.findByVendedorSub(auth0Sub).stream()
                .filter(o -> "PAGADO".equals(o.getEstado()))
                .toList();
        
        // Agrupar productos por cantidad vendida
        Map<Long, Map<String, Object>> productosMap = new HashMap<>();
        
        for (Orden orden : ordenesVendedor) {
            for (var item : orden.getItems()) {
                if (auth0Sub.equals(item.getVendedorSub())) {
                    Producto producto = item.getProducto();
                    Long productoId = producto.getId();
                    
                    Map<String, Object> datos = productosMap.getOrDefault(productoId, new HashMap<>());
                    datos.put("id", productoId);
                    datos.put("nombre", producto.getTitulo());
                    datos.put("precio", producto.getPrecio());
                    datos.put("imagenPrincipal", producto.getImagenPrincipal());
                    datos.put("stock", producto.getStock());
                    datos.put("cantidadVendida", 
                        ((Integer) datos.getOrDefault("cantidadVendida", 0)) + item.getCantidad());
                    datos.put("totalVendido", 
                        ((Double) datos.getOrDefault("totalVendido", 0.0)) + item.getSubtotal());
                    
                    productosMap.put(productoId, datos);
                }
            }
        }
        
        // Ordenar por cantidad vendida (descendente)
        return productosMap.values().stream()
                .sorted((a, b) -> 
                    ((Integer) b.get("cantidadVendida")).compareTo((Integer) a.get("cantidadVendida")))
                .limit(5) // Top 5 productos
                .toList();
    }
}