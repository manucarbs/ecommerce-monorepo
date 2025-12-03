package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dto.*;
import com.ecommerce.backend.entities.Orden;
import com.ecommerce.backend.services.OrdenService;
import com.ecommerce.backend.services.StripeService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PagoController {
    
    private final OrdenService ordenService;
    private final StripeService stripeService;
    
    /**
     * POST /api/pagos/crear-intento
     * Crear Payment Intent para una orden
     */
    @PostMapping("/crear-intento")
    public ResponseEntity<?> crearPaymentIntent(
            @RequestBody CrearPaymentIntentDto request,
            Authentication authentication) {
        
        String auth0Sub = authentication.getName();
        log.info("💳 POST /api/pagos/crear-intento - Usuario: {}, Orden: {}", 
                auth0Sub, request.getOrdenNumero());
        
        try {
            // Verificar que la orden pertenece al usuario
            Orden orden = ordenService.obtenerOrdenPorNumero(request.getOrdenNumero());
            if (!orden.getCompradorSub().equals(auth0Sub)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(PagoResponseDto.error("No tienes permiso para pagar esta orden"));
            }
            
            PaymentIntentResponseDto response = ordenService
                    .crearPaymentIntentParaOrden(request.getOrdenNumero());
            
            return ResponseEntity.ok(response);
            
        } catch (StripeException e) {
            log.error("❌ Error de Stripe: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PagoResponseDto.error("Error al crear intento de pago: " + e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(PagoResponseDto.error(e.getMessage()));
        }
    }
    
    /**
     * POST /api/pagos/procesar
     * Procesar pago de una orden (sin webhook)
     */
    @PostMapping("/procesar")
    public ResponseEntity<?> procesarPago(
            @RequestBody ProcesarPagoDto request,
            Authentication authentication) {
        
        String auth0Sub = authentication.getName();
        log.info("💰 POST /api/pagos/procesar - Usuario: {}, Orden: {}", 
                auth0Sub, request.getOrdenNumero());
        
        try {
            // Verificar que la orden pertenece al usuario
            Orden orden = ordenService.obtenerOrdenPorNumero(request.getOrdenNumero());
            if (!orden.getCompradorSub().equals(auth0Sub)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(PagoResponseDto.error("No tienes permiso para procesar esta orden"));
            }
            
            // Procesar pago
            Orden ordenProcesada = ordenService.procesarPagoOrden(
                request.getOrdenNumero(), 
                request.getPaymentIntentId()
            );
            
            return ResponseEntity.ok(PagoResponseDto.success(
                "¡Pago procesado exitosamente!",
                ordenProcesada.getNumeroOrden(),
                ordenProcesada.getIdPagoStripe(),
                ordenProcesada.getTotal()
            ));
            
        } catch (StripeException e) {
            log.error("❌ Error de Stripe: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PagoResponseDto.error("Error al procesar pago: " + e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(PagoResponseDto.error(e.getMessage()));
        }
    }
    
    /**
     * POST /api/pagos/verificar
     * Verificar estado de un pago
     */
    @PostMapping("/verificar")
    public ResponseEntity<?> verificarPago(@RequestBody VerificarPagoDto request) {
        log.info("🔍 POST /api/pagos/verificar - PaymentIntent: {}", request.getPaymentIntentId());
        
        try {
            boolean exitoso = stripeService.verificarPagoExitoso(request.getPaymentIntentId());
            
            if (exitoso) {
                return ResponseEntity.ok(PagoResponseDto.success(
                    "Pago verificado exitosamente",
                    null,
                    request.getPaymentIntentId(),
                    null
                ));
            } else {
                return ResponseEntity.ok(PagoResponseDto.error(
                    "El pago no ha sido completado"
                ));
            }
            
        } catch (StripeException e) {
            log.error("❌ Error de Stripe: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PagoResponseDto.error("Error al verificar pago: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/pagos/health
     * Verificar que Stripe está configurado
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        try {
            // Intentar crear un pequeño payment intent de prueba ($1)
            stripeService.crearPaymentIntent(1.0, "TEST-HEALTH");
            return ResponseEntity.ok(PagoResponseDto.success(
                "Stripe está funcionando correctamente",
                null,
                null,
                1.0
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(PagoResponseDto.error("Stripe no está configurado: " + e.getMessage()));
        }
    }
}