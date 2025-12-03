package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dto.AgregarFavoritoDto;
import com.ecommerce.backend.dto.MensajeResponse;
import com.ecommerce.backend.entities.Favorito;
import com.ecommerce.backend.services.FavoritoService;
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
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Ajusta según tu configuración CORS
public class FavoritoController {

    private final FavoritoService favoritoService;

    /**
     * GET /api/favoritos
     * Obtener todos los favoritos del usuario autenticado
     */
    @GetMapping
    public ResponseEntity<List<Favorito>> obtenerFavoritos(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("📋 GET /api/favoritos - Usuario: {}", auth0Sub);

        List<Favorito> favoritos = favoritoService.obtenerFavoritos(auth0Sub);

        return ResponseEntity.ok(favoritos);
    }

    /**
     * GET /api/favoritos/ids
     * Obtener solo los IDs de productos favoritos (más ligero para el frontend)
     */
    @GetMapping("/ids")
    public ResponseEntity<List<Long>> obtenerIdsFavoritos(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("🔢 GET /api/favoritos/ids - Usuario: {}", auth0Sub);

        List<Long> ids = favoritoService.obtenerIdsFavoritos(auth0Sub);

        return ResponseEntity.ok(ids);
    }

    /**
     * GET /api/favoritos/count
     * Obtener cantidad de favoritos
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> contarFavoritos(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("📊 GET /api/favoritos/count - Usuario: {}", auth0Sub);

        long cantidad = favoritoService.contarFavoritos(auth0Sub);

        Map<String, Long> response = new HashMap<>();
        response.put("cantidad", cantidad);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/favoritos/check/{productoId}
     * Verificar si un producto específico está en favoritos
     */
    @GetMapping("/check/{productoId}")
    public ResponseEntity<Map<String, Boolean>> verificarFavorito(
            @PathVariable Long productoId,
            Authentication authentication
    ) {
        String auth0Sub = authentication.getName();
        log.info("🔍 GET /api/favoritos/check/{} - Usuario: {}", productoId, auth0Sub);

        boolean esFavorito = favoritoService.esFavorito(auth0Sub, productoId);

        Map<String, Boolean> response = new HashMap<>();
        response.put("esFavorito", esFavorito);

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/favoritos
     * Agregar producto a favoritos
     */
    @PostMapping
    public ResponseEntity<Favorito> agregarFavorito(
            @Valid @RequestBody AgregarFavoritoDto dto,
            Authentication authentication
    ) {
        String auth0Sub = authentication.getName();
        log.info("❤️ POST /api/favoritos - Usuario: {}, Producto: {}", auth0Sub, dto.getProductoId());

        Favorito favorito = favoritoService.agregarFavorito(auth0Sub, dto.getProductoId());

        return ResponseEntity.status(HttpStatus.CREATED).body(favorito);
    }

    /**
     * DELETE /api/favoritos/{productoId}
     * Eliminar producto de favoritos
     */
    @DeleteMapping("/{productoId}")
    public ResponseEntity<MensajeResponse> eliminarFavorito(
            @PathVariable Long productoId,
            Authentication authentication
    ) {
        String auth0Sub = authentication.getName();
        log.info("💔 DELETE /api/favoritos/{} - Usuario: {}", productoId, auth0Sub);

        favoritoService.eliminarFavorito(auth0Sub, productoId);

        return ResponseEntity.ok(new MensajeResponse("Producto eliminado de favoritos"));
    }

    /**
     * POST /api/favoritos/toggle
     * Toggle favorito (agregar si no existe, eliminar si existe)
     * Este es el endpoint más útil para el botón de favoritos en el frontend
     */
    @PostMapping("/toggle")
    public ResponseEntity<?> toggleFavorito(
            @Valid @RequestBody AgregarFavoritoDto dto,
            Authentication authentication
    ) {
        String auth0Sub = authentication.getName();
        log.info("🔄 POST /api/favoritos/toggle - Usuario: {}, Producto: {}", auth0Sub, dto.getProductoId());

        Favorito resultado = favoritoService.toggleFavorito(auth0Sub, dto.getProductoId());

        if (resultado == null) {
            // Se eliminó
            return ResponseEntity.ok(new MensajeResponse("Producto eliminado de favoritos"));
        } else {
            // Se agregó
            return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
        }
    }
}