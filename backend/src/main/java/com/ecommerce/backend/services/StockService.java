package com.ecommerce.backend.services;

import com.ecommerce.backend.entities.Carrito;
import com.ecommerce.backend.entities.Producto;
import com.ecommerce.backend.exceptions.StockInsuficienteException;
import com.ecommerce.backend.repositories.CarritoRepository;
import com.ecommerce.backend.repositories.ProductoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {

    private final ProductoRepository productoRepository;
    private final CarritoRepository carritoRepository;

    /**
     * Reducir stock cuando se realiza un pedido
     */
    @Transactional
    public void reducirStockPorPedido(String auth0Sub) {
        log.info("📦 Reduciendo stock por pedido del usuario: {}", auth0Sub);
        
        List<Carrito> carritos = carritoRepository.findByUsuarioAuth0SubOrderByAgregadoEnDesc(auth0Sub);
        
        if (carritos.isEmpty()) {
            log.warn("⚠️ No hay productos en el carrito para reducir stock");
            return;
        }

        for (Carrito carrito : carritos) {
            Producto producto = carrito.getProducto();
            Integer cantidad = carrito.getCantidad();
            
            if (producto.getStock() < cantidad) {
                throw new StockInsuficienteException(
                    String.format("Stock insuficiente para '%s'. Stock disponible: %d, Cantidad solicitada: %d", 
                        producto.getTitulo(), producto.getStock(), cantidad)
                );
            }
            
            // Reducir stock
            producto.setStock(producto.getStock() - cantidad);
            productoRepository.save(producto);
            
            log.info("✅ Stock reducido - Producto: {}, Cantidad: {}, Stock restante: {}", 
                    producto.getTitulo(), cantidad, producto.getStock());
        }

        // Limpiar carrito después de procesar el pedido
        carritoRepository.deleteByAuth0Sub(auth0Sub);
        log.info("✅ Carrito limpiado después del pedido");
    }

    /**
     * Reducir stock para productos específicos
     */
    @Transactional
    public void reducirStock(Map<Long, Integer> productosYCantidades) {
        log.info("📦 Reduciendo stock para {} productos", productosYCantidades.size());
        
        for (Map.Entry<Long, Integer> entry : productosYCantidades.entrySet()) {
            Long productoId = entry.getKey();
            Integer cantidad = entry.getValue();
            
            Producto producto = productoRepository.findById(productoId)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productoId));
            
            if (producto.getStock() < cantidad) {
                throw new StockInsuficienteException(
                    String.format("Stock insuficiente para '%s'. Stock disponible: %d, Cantidad solicitada: %d", 
                        producto.getTitulo(), producto.getStock(), cantidad)
                );
            }
            
            producto.setStock(producto.getStock() - cantidad);
            productoRepository.save(producto);
            
            log.info("✅ Stock reducido - Producto: {} (ID: {}), Cantidad: {}, Stock restante: {}", 
                    producto.getTitulo(), productoId, cantidad, producto.getStock());
        }
    }

    /**
     * Restaurar stock (para cancelaciones de pedidos)
     */
    @Transactional
    public void restaurarStock(Map<Long, Integer> productosYCantidades) {
        log.info("🔄 Restaurando stock para {} productos", productosYCantidades.size());
        
        for (Map.Entry<Long, Integer> entry : productosYCantidades.entrySet()) {
            Long productoId = entry.getKey();
            Integer cantidad = entry.getValue();
            
            Producto producto = productoRepository.findById(productoId)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productoId));
            
            producto.setStock(producto.getStock() + cantidad);
            productoRepository.save(producto);
            
            log.info("✅ Stock restaurado - Producto: {} (ID: {}), Cantidad: {}, Stock actual: {}", 
                    producto.getTitulo(), productoId, cantidad, producto.getStock());
        }
    }

    /**
     * Verificar stock disponible para todos los productos en el carrito
     */
    @Transactional(readOnly = true)
    public boolean verificarStockDisponible(String auth0Sub) {
        List<Carrito> carritos = carritoRepository.findByUsuarioAuth0SubOrderByAgregadoEnDesc(auth0Sub);
        
        for (Carrito carrito : carritos) {
            Producto producto = carrito.getProducto();
            if (producto.getStock() < carrito.getCantidad()) {
                log.warn("❌ Stock insuficiente - Producto: {}, Stock: {}, Requerido: {}", 
                        producto.getTitulo(), producto.getStock(), carrito.getCantidad());
                return false;
            }
        }
        
        log.info("✅ Stock disponible para todos los productos del carrito");
        return true;
    }

     /**
     * Obtener resumen de stock del carrito - VERSIÓN CORREGIDA
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerResumenStock(String auth0Sub) {
        log.info("📊 Obteniendo resumen de stock para usuario: {}", auth0Sub);

        List<Carrito> carritos = carritoRepository.findByUsuarioAuth0SubOrderByAgregadoEnDesc(auth0Sub);
        
        // SOLUCIÓN: Usar un array para poder modificar el valor dentro del lambda
        final boolean[] stockSuficiente = {true};
        
        List<Map<String, Object>> productosConStock = carritos.stream()
                .map(carrito -> {
                    Producto producto = carrito.getProducto();
                    boolean suficiente = producto.getStock() >= carrito.getCantidad();
                    
                    if (!suficiente) {
                        stockSuficiente[0] = false;
                    }
                    
                    // Crear mapa explícitamente
                    Map<String, Object> productoInfo = new HashMap<>();
                    productoInfo.put("productoId", producto.getId());
                    productoInfo.put("productoNombre", producto.getTitulo());
                    productoInfo.put("cantidadRequerida", carrito.getCantidad());
                    productoInfo.put("stockDisponible", producto.getStock());
                    productoInfo.put("suficiente", suficiente);
                    
                    return productoInfo;
                })
                .collect(Collectors.toList());
        
        Map<String, Object> resumen = new HashMap<>();
        resumen.put("stockSuficiente", stockSuficiente[0]);
        resumen.put("productos", productosConStock);
        
        log.info("✅ Resumen de stock - Suficiente: {}, Productos: {}", stockSuficiente[0], productosConStock.size());
        
        return resumen;
    }
}