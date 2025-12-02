package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dto.CheckoutRequestDto;
import com.ecommerce.backend.dto.MensajeResponse;
import com.ecommerce.backend.entities.Orden;
import com.ecommerce.backend.services.OrdenService;
import com.ecommerce.backend.services.VendedorService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrdenController {
    
    private final OrdenService ordenService;
    private final VendedorService vendedorService;
    
    /**
     * POST /api/ordenes/checkout
     * Crear orden desde carrito (primer paso del checkout)
     */
    @PostMapping("/checkout")
    public ResponseEntity<Orden> crearOrdenCheckout(
            @Valid @RequestBody CheckoutRequestDto checkoutDto,
            Authentication authentication) {

        String auth0Sub = authentication.getName();
        log.info("🛒 POST /api/ordenes/checkout - Usuario: {}", auth0Sub);

        // Debug: Verificar que el usuario existe
        log.info("🔍 Authentication object: {}", authentication);
        log.info("🔍 Authentication principal: {}", authentication.getPrincipal());
        log.info("🔍 Authentication authorities: {}", authentication.getAuthorities());

        try {
            Orden orden = ordenService.crearOrdenDesdeCarrito(auth0Sub, checkoutDto);
            log.info("✅ Orden creada exitosamente: {}", orden.getNumeroOrden());
            return ResponseEntity.status(HttpStatus.CREATED).body(orden);
        } catch (Exception e) {
            log.error("❌ Error al crear orden para usuario {}: {}", auth0Sub, e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * GET /api/ordenes
     * Obtener todas las órdenes del usuario
     */
    @GetMapping
    public ResponseEntity<List<Orden>> obtenerOrdenes(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("📋 GET /api/ordenes - Usuario: {}", auth0Sub);
        
        List<Orden> ordenes = ordenService.obtenerOrdenesUsuario(auth0Sub);
        
        return ResponseEntity.ok(ordenes);
    }
    
    /**
     * GET /api/ordenes/vendedor
     * Obtener órdenes donde el usuario es vendedor
     */
    @GetMapping("/vendedor")
    public ResponseEntity<List<Orden>> obtenerOrdenesComoVendedor(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("👨‍💼 GET /api/ordenes/vendedor - Vendedor: {}", auth0Sub);
        
        List<Orden> ordenes = ordenService.obtenerOrdenesComoVendedor(auth0Sub);
        
        return ResponseEntity.ok(ordenes);
    }
    
    /**
     * GET /api/ordenes/{id}
     * Obtener orden específica
     */
    @GetMapping("/{id}")
    public ResponseEntity<Orden> obtenerOrden(@PathVariable Long id, Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("🔍 GET /api/ordenes/{} - Usuario: {}", id, auth0Sub);
        
        // TODO: Verificar que el usuario tenga permiso para ver esta orden
        // Por ahora retornamos cualquier orden (implementar seguridad después)
        
        return ResponseEntity.ok().build();
    }

     /**
     * GET /api/ordenes/vendedor/estadisticas
     * Obtener estadísticas del vendedor
     */
    @GetMapping("/vendedor/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasVendedor(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("📊 GET /api/ordenes/vendedor/estadisticas - Vendedor: {}", auth0Sub);
        
        Map<String, Object> estadisticas = vendedorService.obtenerEstadisticasVendedor(auth0Sub);
        return ResponseEntity.ok(estadisticas);
    }
    
    /**
     * GET /api/ordenes/vendedor/recientes
     * Obtener órdenes recientes del vendedor
     */
    @GetMapping("/vendedor/recientes")
    public ResponseEntity<List<Orden>> obtenerOrdenesRecientesVendedor(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("🔄 GET /api/ordenes/vendedor/recientes - Vendedor: {}", auth0Sub);
        
        List<Orden> ordenesRecientes = vendedorService.obtenerOrdenesRecientes(auth0Sub);
        return ResponseEntity.ok(ordenesRecientes);
    }
    
    /**
     * GET /api/ordenes/vendedor/productos-mas-vendidos
     * Obtener productos más vendidos del vendedor
     */
    @GetMapping("/vendedor/productos-mas-vendidos")
    public ResponseEntity<List<Map<String, Object>>> obtenerProductosMasVendidos(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("🏆 GET /api/ordenes/vendedor/productos-mas-vendidos - Vendedor: {}", auth0Sub);
        
        List<Map<String, Object>> productos = vendedorService.obtenerProductosMasVendidos(auth0Sub);
        return ResponseEntity.ok(productos);
    }
}
