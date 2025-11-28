package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dto.AgregarCarritoDto;
import com.ecommerce.backend.dto.ActualizarCantidadDto;
import com.ecommerce.backend.dto.MensajeResponse;
import com.ecommerce.backend.entities.Carrito;
import com.ecommerce.backend.services.CarritoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/carritos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CarritoController {

    private final CarritoService carritoService;

    /**
     * GET /api/carritos
     * Obtener todos los carritos del usuario autenticado
     */
    @GetMapping
    public ResponseEntity<List<Carrito>> obtenerCarritos(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("🛒 GET /api/carritos - Usuario: {}", auth0Sub);

        List<Carrito> carritos = carritoService.obtenerCarritos(auth0Sub);

        return ResponseEntity.ok(carritos);
    }

    /**
     * GET /api/carritos/ids
     * Obtener solo los IDs de productos en carritos
     */
    @GetMapping("/ids")
    public ResponseEntity<List<Long>> obtenerIdsCarritos(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("🔢 GET /api/carritos/ids - Usuario: {}", auth0Sub);

        List<Long> ids = carritoService.obtenerIdsCarritos(auth0Sub);

        return ResponseEntity.ok(ids);
    }

    /**
     * GET /api/carritos/count
     * Obtener cantidad de productos en el carrito
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> contarCarritos(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("📊 GET /api/carritos/count - Usuario: {}", auth0Sub);

        long cantidad = carritoService.contarCarritos(auth0Sub);

        Map<String, Long> response = new HashMap<>();
        response.put("cantidad", cantidad);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/carritos/total
     * Obtener el total del carrito
     */
    @GetMapping("/total")
    public ResponseEntity<Map<String, Double>> obtenerTotal(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("💰 GET /api/carritos/total - Usuario: {}", auth0Sub);

        Double total = carritoService.calcularTotal(auth0Sub);

        Map<String, Double> response = new HashMap<>();
        response.put("total", total);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/carritos/check/{productoId}
     * Verificar si un producto específico está en carritos
     */
    @GetMapping("/check/{productoId}")
    public ResponseEntity<Map<String, Boolean>> verificarCarrito(
            @PathVariable Long productoId,
            Authentication authentication
    ) {
        String auth0Sub = authentication.getName();
        log.info("🔍 GET /api/carritos/check/{} - Usuario: {}", productoId, auth0Sub);

        boolean estaEnCarrito = carritoService.estaEnCarrito(auth0Sub, productoId);

        Map<String, Boolean> response = new HashMap<>();
        response.put("estaEnCarrito", estaEnCarrito);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/carritos/resumen
     * Obtener resumen completo del carrito
     */
    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumen(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("📊 GET /api/carritos/resumen - Usuario: {}", auth0Sub);

        Map<String, Object> resumen = carritoService.obtenerResumen(auth0Sub);

        return ResponseEntity.ok(resumen);
    }

    /**
     * POST /api/carritos
     * Agregar producto al carrito
     */
    @PostMapping
    public ResponseEntity<Carrito> agregarCarrito(
            @Valid @RequestBody AgregarCarritoDto dto,
            Authentication authentication
    ) {
        String auth0Sub = authentication.getName();
        log.info("➕ POST /api/carritos - Usuario: {}, Producto: {}, Cantidad: {}", 
                auth0Sub, dto.getProductoId(), dto.getCantidad());

        Carrito carrito = carritoService.agregarCarrito(auth0Sub, dto.getProductoId(), dto.getCantidad());

        return ResponseEntity.status(HttpStatus.CREATED).body(carrito);
    }

    /**
     * PUT /api/carritos/{productoId}/cantidad
     * Actualizar cantidad de un producto en el carrito
     */
    @PutMapping("/{productoId}/cantidad")
    public ResponseEntity<Carrito> actualizarCantidad(
            @PathVariable Long productoId,
            @Valid @RequestBody ActualizarCantidadDto dto,
            Authentication authentication
    ) {
        String auth0Sub = authentication.getName();
        log.info("✏️ PUT /api/carritos/{}/cantidad - Usuario: {}, Nueva cantidad: {}", 
                productoId, auth0Sub, dto.getCantidad());

        Carrito carrito = carritoService.actualizarCantidad(auth0Sub, productoId, dto.getCantidad());

        return ResponseEntity.ok(carrito);
    }

    /**
     * DELETE /api/carritos/{productoId}
     * Eliminar producto del carrito
     */
    @DeleteMapping("/{productoId}")
    public ResponseEntity<MensajeResponse> eliminarCarrito(
            @PathVariable Long productoId,
            Authentication authentication
    ) {
        String auth0Sub = authentication.getName();
        log.info("💔 DELETE /api/carritos/{} - Usuario: {}", productoId, auth0Sub);

        carritoService.eliminarCarrito(auth0Sub, productoId);

        return ResponseEntity.ok(new MensajeResponse("Producto eliminado del carrito"));
    }

    /**
     * DELETE /api/carritos
     * Limpiar todo el carrito
     */
    @DeleteMapping
    public ResponseEntity<MensajeResponse> limpiarCarrito(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("🗑️ DELETE /api/carritos - Usuario: {}", auth0Sub);

        carritoService.limpiarCarrito(auth0Sub);

        return ResponseEntity.ok(new MensajeResponse("Carrito limpiado exitosamente"));
    }
}