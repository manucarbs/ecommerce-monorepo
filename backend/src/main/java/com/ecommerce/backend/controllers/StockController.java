package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dto.MensajeResponse;
import com.ecommerce.backend.services.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockController {

    private final StockService stockService;

    /**
     * GET /api/stock/verificar
     * Verificar si hay stock suficiente en el carrito
     */
    @GetMapping("/verificar")
    public ResponseEntity<Map<String, Object>> verificarStock(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("🔍 GET /api/stock/verificar - Usuario: {}", auth0Sub);

        Map<String, Object> resumen = stockService.obtenerResumenStock(auth0Sub);

        return ResponseEntity.ok(resumen);
    }

    /**
     * POST /api/stock/reducir
     * Reducir stock por pedido (se llama cuando se confirma un pedido)
     */
    @PostMapping("/reducir")
    public ResponseEntity<MensajeResponse> reducirStockPorPedido(Authentication authentication) {
        String auth0Sub = authentication.getName();
        log.info("📦 POST /api/stock/reducir - Usuario: {}", auth0Sub);

        stockService.reducirStockPorPedido(auth0Sub);

        return ResponseEntity.ok(new MensajeResponse("Stock reducido exitosamente y carrito limpiado"));
    }
}