package com.ecommerce.backend.services;

import com.ecommerce.backend.entities.Carrito;
import com.ecommerce.backend.entities.Producto;
import com.ecommerce.backend.entities.Usuario;
import com.ecommerce.backend.exceptions.RecursoNoEncontradoException;
import com.ecommerce.backend.exceptions.StockInsuficienteException;
import com.ecommerce.backend.repositories.CarritoRepository;
import com.ecommerce.backend.repositories.ProductoRepository;
import com.ecommerce.backend.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;

    /**
     * Obtener todos los carritos de un usuario
     */
    @Transactional(readOnly = true)
    public List<Carrito> obtenerCarritos(String auth0Sub) {
        log.info("🛒 Obteniendo carritos del usuario: {}", auth0Sub);
        
        List<Carrito> carritos = carritoRepository.findByUsuarioAuth0SubOrderByAgregadoEnDesc(auth0Sub);
        
        log.info("✅ Se encontraron {} carritos", carritos.size());
        
        return carritos;
    }

    /**
     * Agregar producto al carrito con validación de stock
     */
    @Transactional
    public Carrito agregarCarrito(String auth0Sub, Long productoId, Integer cantidad) {
        log.info("➕ Agregando producto {} a carritos del usuario: {}, Cantidad: {}", productoId, auth0Sub, cantidad);

        // Validar cantidad
        if (cantidad == null || cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }

        // 1. Verificar que el usuario existe
        Usuario usuario = usuarioRepository.findByAuth0Sub(auth0Sub)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        // 2. Verificar que el producto existe
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con ID: " + productoId));

        // 3. Verificar stock disponible
        validarStockDisponible(producto, cantidad);

        // 4. Verificar si ya existe en el carrito
        Optional<Carrito> carritoExistente = carritoRepository.findByAuth0SubAndProductoId(auth0Sub, productoId);

        if (carritoExistente.isPresent()) {
            // Actualizar cantidad del carrito existente
            Carrito carrito = carritoExistente.get();
            int nuevaCantidad = carrito.getCantidad() + cantidad;
            
            // Verificar stock nuevamente con la nueva cantidad
            validarStockDisponible(producto, nuevaCantidad);
            
            carrito.setCantidad(nuevaCantidad);
            Carrito actualizado = carritoRepository.save(carrito);
            
            log.info("✅ Cantidad actualizada en carrito. Nuevo total: {}", nuevaCantidad);
            return actualizado;
        } else {
            // Crear nuevo carrito
            Carrito nuevoCarrito = new Carrito(usuario, producto, cantidad);
            Carrito guardado = carritoRepository.save(nuevoCarrito);
            
            log.info("✅ Carrito agregado exitosamente con ID: {}", guardado.getId());
            return guardado;
        }
    }

    /**
     * Eliminar producto de carritos
     */
    @Transactional
    public void eliminarCarrito(String auth0Sub, Long productoId) {
        log.info("💔 Eliminando producto {} de carritos del usuario: {}", productoId, auth0Sub);

        Carrito carrito = carritoRepository.findByAuth0SubAndProductoId(auth0Sub, productoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Este producto no está en tu carrito"));

        carritoRepository.delete(carrito);

        log.info("✅ Carrito eliminado exitosamente");
    }

    /**
     * Actualizar cantidad de un producto en el carrito
     */
    @Transactional
    public Carrito actualizarCantidad(String auth0Sub, Long productoId, Integer nuevaCantidad) {
        log.info("✏️ Actualizando cantidad del producto {} en carrito. Usuario: {}, Nueva cantidad: {}", 
                productoId, auth0Sub, nuevaCantidad);

        if (nuevaCantidad == null || nuevaCantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }

        // Verificar que el producto existe
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con ID: " + productoId));

        // Verificar stock disponible
        validarStockDisponible(producto, nuevaCantidad);

        Carrito carrito = carritoRepository.findByAuth0SubAndProductoId(auth0Sub, productoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Este producto no está en tu carrito"));

        carrito.setCantidad(nuevaCantidad);
        Carrito actualizado = carritoRepository.save(carrito);

        log.info("✅ Cantidad actualizada exitosamente a: {}", nuevaCantidad);
        return actualizado;
    }

    /**
     * Validar stock disponible
     */
    private void validarStockDisponible(Producto producto, Integer cantidadRequerida) {
        if (producto.getStock() < cantidadRequerida) {
            throw new StockInsuficienteException(
                String.format("Stock insuficiente para '%s'. Stock disponible: %d, Cantidad solicitada: %d", 
                    producto.getTitulo(), producto.getStock(), cantidadRequerida)
            );
        }
    }

    /**
     * Verificar si un producto está en carritos
     */
    @Transactional(readOnly = true)
    public boolean estaEnCarrito(String auth0Sub, Long productoId) {
        return carritoRepository.existsByAuth0SubAndProductoId(auth0Sub, productoId);
    }

    /**
     * Contar carritos de un usuario
     */
    @Transactional(readOnly = true)
    public long contarCarritos(String auth0Sub) {
        Usuario usuario = usuarioRepository.findByAuth0Sub(auth0Sub)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        
        return carritoRepository.countByUsuario_Id(usuario.getId());
    }

    /**
     * Obtener IDs de productos en carritos (útil para el frontend)
     */
    @Transactional(readOnly = true)
    public List<Long> obtenerIdsCarritos(String auth0Sub) {
        List<Carrito> carritos = carritoRepository.findByUsuarioAuth0SubOrderByAgregadoEnDesc(auth0Sub);
        
        return carritos.stream()
                .map(c -> c.getProducto().getId())
                .collect(Collectors.toList());
    }

    /**
     * Calcular total del carrito
     */
    @Transactional(readOnly = true)
    public Double calcularTotal(String auth0Sub) {
        Double total = carritoRepository.calcularTotal(auth0Sub);
        return total != null ? total : 0.0;
    }

    /**
     * Limpiar todo el carrito de un usuario
     */
    @Transactional
    public void limpiarCarrito(String auth0Sub) {
        log.info("🗑️ Limpiando todo el carrito del usuario: {}", auth0Sub);
        
        carritoRepository.deleteByAuth0Sub(auth0Sub);
        
        log.info("✅ Carrito limpiado exitosamente");
    }

    /**
     * Obtener resumen del carrito (cantidad total de productos y total a pagar)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerResumen(String auth0Sub) {
        log.info("📊 Obteniendo resumen del carrito para usuario: {}", auth0Sub);

        List<Carrito> carritos = carritoRepository.findByUsuarioAuth0SubOrderByAgregadoEnDesc(auth0Sub);
        long cantidadTotal = carritos.stream().mapToLong(Carrito::getCantidad).sum();
        Double total = calcularTotal(auth0Sub);

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("cantidadProductos", carritos.size());
        resumen.put("cantidadTotalItems", cantidadTotal);
        resumen.put("total", total);
        resumen.put("items", carritos);

        log.info("✅ Resumen del carrito - Productos: {}, Items: {}, Total: ${}", 
                carritos.size(), cantidadTotal, total);

        return resumen;
    }

    /**
     * Obtener carrito por ID (para uso interno)
     */
    @Transactional(readOnly = true)
    public Optional<Carrito> obtenerCarritoPorId(Long carritoId) {
        return carritoRepository.findById(carritoId);
    }
}