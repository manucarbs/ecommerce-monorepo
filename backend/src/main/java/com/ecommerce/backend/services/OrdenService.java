package com.ecommerce.backend.services;

import com.ecommerce.backend.entities.*;
import com.ecommerce.backend.repositories.*;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.ecommerce.backend.dto.CheckoutRequestDto;
import com.ecommerce.backend.dto.PaymentIntentResponseDto;
import com.ecommerce.backend.exceptions.RecursoNoEncontradoException;
import com.ecommerce.backend.exceptions.StockInsuficienteException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrdenService {
    
    private final OrdenRepository ordenRepository;
    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CarritoService carritoService;
    private final StripeService stripeService;
    
    /**
     * Crear una orden desde el carrito
     */
    @Transactional
    public Orden crearOrdenDesdeCarrito(String auth0Sub, CheckoutRequestDto checkoutDto) {
        log.info("🛒 Creando orden para usuario: {}", auth0Sub);
        
        // 1. Obtener usuario
        Usuario usuario = usuarioRepository.findByAuth0Sub(auth0Sub)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        
        // 2. Obtener carrito del usuario
        List<Carrito> carritos = carritoRepository.findByUsuarioAuth0SubOrderByAgregadoEnDesc(auth0Sub);
        
        if (carritos.isEmpty()) {
            throw new IllegalStateException("El carrito está vacío");
        }
        
        // 3. Validar stock antes de continuar
        validarStockCarrito(carritos);
        
        // 4. Crear orden
        Orden orden = new Orden();
        orden.setComprador(usuario);
        orden.setCompradorSub(auth0Sub);
        orden.setDireccionEnvio(checkoutDto.getDireccionEnvio());
        orden.setCiudad(checkoutDto.getCiudad());
        orden.setTelefono(checkoutDto.getTelefono());
        orden.setReferencia(checkoutDto.getReferencia());
        
        // 5. Calcular total y crear items
        double total = 0.0;
        
        for (Carrito carrito : carritos) {
            OrdenItem item = new OrdenItem();
            item.setOrden(orden);
            item.setProducto(carrito.getProducto());
            item.setCantidad(carrito.getCantidad());
            item.setPrecioUnitario(carrito.getProducto().getPrecio());
            item.setVendedorSub(carrito.getProducto().getOwnerSub());
            
            orden.getItems().add(item);
            total += item.getPrecioUnitario() * item.getCantidad();
        }
        
        orden.setTotal(total);
        orden.setEstado("PENDIENTE");
        
        // 6. Guardar orden (pero NO reducir stock todavía)
        Orden ordenGuardada = ordenRepository.save(orden);
        log.info("✅ Orden creada: {}, Total: ${}", ordenGuardada.getNumeroOrden(), total);
        
        return ordenGuardada;
    }
    
    /**
     * Validar stock de todos los productos en el carrito
     */
    private void validarStockCarrito(List<Carrito> carritos) {
        for (Carrito carrito : carritos) {
            Producto producto = carrito.getProducto();
            if (producto.getStock() < carrito.getCantidad()) {
                throw new StockInsuficienteException(
                    String.format("Stock insuficiente para '%s'. Disponible: %d, Solicitado: %d",
                        producto.getTitulo(), producto.getStock(), carrito.getCantidad())
                );
            }
        }
    }
    
    /**
     * Marcar orden como pagada y reducir stock
     */
    @Transactional
    public Orden marcarComoPagada(Long ordenId, String idPagoStripe, String metodoPago) {
        log.info("💰 Marcando orden {} como pagada", ordenId);
        
        Orden orden = ordenRepository.findById(ordenId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Orden no encontrada"));
        
        if (!"PENDIENTE".equals(orden.getEstado())) {
            throw new IllegalStateException("La orden ya no está pendiente");
        }
        
        // Reducir stock de cada producto
        for (OrdenItem item : orden.getItems()) {
            Producto producto = item.getProducto();
            int nuevaCantidad = producto.getStock() - item.getCantidad();
            
            if (nuevaCantidad < 0) {
                throw new StockInsuficienteException(
                    String.format("Stock insuficiente para '%s' al procesar pago", 
                        producto.getTitulo())
                );
            }
            
            producto.setStock(nuevaCantidad);
            productoRepository.save(producto);
            log.info("📉 Stock reducido: {} - Nuevo stock: {}", 
                producto.getTitulo(), nuevaCantidad);
        }
        
        // Actualizar orden
        orden.setEstado("PAGADO");
        orden.setIdPagoStripe(idPagoStripe);
        orden.setMetodoPago(metodoPago);
        
        // Limpiar carrito del usuario
        carritoService.limpiarCarrito(orden.getCompradorSub());
        log.info("🗑️ Carrito limpiado para usuario: {}", orden.getCompradorSub());
        
        Orden ordenActualizada = ordenRepository.save(orden);
        log.info("✅ Orden {} marcada como PAGADA", ordenActualizada.getNumeroOrden());
        
        return ordenActualizada;
    }
    
    /**
     * Obtener órdenes del usuario
     */
    @Transactional(readOnly = true)
    public List<Orden> obtenerOrdenesUsuario(String auth0Sub) {
        return ordenRepository.findByCompradorAuth0SubOrderByCreadoEnDesc(auth0Sub);
    }
    
    /**
     * Obtener órdenes donde el usuario es vendedor
     */
    @Transactional(readOnly = true)
    public List<Orden> obtenerOrdenesComoVendedor(String auth0Sub) {
        return ordenRepository.findByVendedorSub(auth0Sub);
    }

    @Transactional(readOnly = true)
    public Orden obtenerOrdenPorNumero(String numeroOrden) {
        return ordenRepository.findByNumeroOrden(numeroOrden)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Orden no encontrada: " + numeroOrden));
    }

    /**
     * Procesar pago de una orden (sin webhook)
     */
    @Transactional
    public Orden procesarPagoOrden(String ordenNumero, String paymentIntentId)
            throws StripeException {

        log.info("💰 Procesando pago para orden: {}, PaymentIntent: {}", ordenNumero, paymentIntentId);

        // 1. Buscar la orden
        Orden orden = ordenRepository.findByNumeroOrden(ordenNumero)
                .orElseThrow(() -> new RecursoNoEncontradoException("Orden no encontrada: " + ordenNumero));

        // 2. Verificar que esté pendiente
        if (!"PENDIENTE".equals(orden.getEstado())) {
            throw new IllegalStateException("La orden ya no está pendiente. Estado: " + orden.getEstado());
        }

        // 3. Verificar con Stripe que el pago fue exitoso
        boolean pagoExitoso = stripeService.verificarPagoExitoso(paymentIntentId);

        if (!pagoExitoso) {
            // Intentar confirmar (para desarrollo)
            log.warn("⚠️ Pago no exitoso, intentando confirmar para desarrollo...");
            PaymentIntent pi = stripeService.confirmarPago(paymentIntentId);

            if (!"succeeded".equals(pi.getStatus())) {
                throw new IllegalStateException("El pago no fue exitoso. Estado: " + pi.getStatus());
            }
        }

        // 4. Obtener detalles del pago
        PaymentIntent paymentIntent = stripeService.obtenerDetallesPago(paymentIntentId);

        // 5. Reducir stock de cada producto
        for (OrdenItem item : orden.getItems()) {
            Producto producto = item.getProducto();
            int nuevaCantidad = producto.getStock() - item.getCantidad();

            if (nuevaCantidad < 0) {
                throw new StockInsuficienteException(
                        String.format("Stock insuficiente para '%s' al procesar pago",
                                producto.getTitulo()));
            }

            producto.setStock(nuevaCantidad);
            productoRepository.save(producto);
            log.info("📉 Stock reducido: {} - Cantidad: {}, Nuevo stock: {}",
                    producto.getTitulo(), item.getCantidad(), nuevaCantidad);
        }

        // 6. Actualizar orden
        orden.setEstado("PAGADO");
        orden.setIdPagoStripe(paymentIntentId);
        orden.setMetodoPago("card"); // Por ahora solo tarjeta

        // 7. Limpiar carrito del usuario
        carritoService.limpiarCarrito(orden.getCompradorSub());
        log.info("🗑️ Carrito limpiado para usuario: {}", orden.getCompradorSub());

        Orden ordenActualizada = ordenRepository.save(orden);

        // 8. Notificar vendedores (opcional, para después)
        notificarVendedores(ordenActualizada);

        log.info("✅ Orden {} procesada exitosamente - Pago: {}",
                ordenNumero, paymentIntentId);

        return ordenActualizada;
    }

    /**
     * Crear Payment Intent para una orden
     */
    public PaymentIntentResponseDto crearPaymentIntentParaOrden(String ordenNumero)
            throws StripeException {

        Orden orden = ordenRepository.findByNumeroOrden(ordenNumero)
                .orElseThrow(() -> new RecursoNoEncontradoException("Orden no encontrada: " + ordenNumero));

        return stripeService.crearPaymentIntent(orden.getTotal(), ordenNumero);
    }

    /**
     * Notificar vendedores (implementación básica)
     */
    private void notificarVendedores(Orden orden) {
        // Por ahora solo log
        List<String> vendedores = orden.getItems().stream()
                .map(item -> item.getVendedorSub())
                .distinct()
                .toList();

        log.info("📣 Notificando a {} vendedores sobre la orden {}",
                vendedores.size(), orden.getNumeroOrden());

        // TODO: Implementar notificaciones reales (email, push, etc.)
    }

}