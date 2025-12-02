package com.ecommerce.backend.services;

import com.ecommerce.backend.dto.PaymentIntentResponseDto;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentConfirmParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Slf4j
@Service
public class StripeService {
    
    @Value("${stripe.secret.key}")
    private String stripeSecretKey;
    
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
        log.info("✅ Stripe configurado con key: {}", 
                 stripeSecretKey != null ? "Key cargada" : "ERROR: Key no cargada");
    }
    
    /**
     * Crear un Payment Intent para una orden
     */
public PaymentIntentResponseDto crearPaymentIntent(Double monto, String ordenNumero) 
        throws StripeException {
    
    log.info("💳 Creando Payment Intent - Orden: {}, Monto: ${}", ordenNumero, monto);
    
    // Validar monto
    if (monto == null || monto <= 0) {
        throw new IllegalArgumentException("El monto debe ser mayor a 0");
    }
    
    // Stripe usa centavos (ej: $10.50 = 1050 centavos)
    Long amountInCents = (long)(monto * 100);
    
    PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(amountInCents)
            .setCurrency("usd")
            .setDescription("Orden #" + ordenNumero)
            .putMetadata("orden_numero", ordenNumero)
            // ✅ SOLO automatic_payment_methods (recomendado)
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                    .setEnabled(true)
                    .build()
            )
            .build();
    
    PaymentIntent paymentIntent = PaymentIntent.create(params);
    
    log.info("✅ Payment Intent creado - ID: {}", paymentIntent.getId());
    
    return new PaymentIntentResponseDto(
        paymentIntent.getClientSecret(),
        ordenNumero,
        monto
    );
}
    
    /**
     * Confirmar un pago (síncrono - sin webhook)
     */
    public PaymentIntent confirmarPago(String paymentIntentId) throws StripeException {
    
    log.info("✅ Confirmando pago: {}", paymentIntentId);
    
    // Recuperar el Payment Intent
    PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
    
    String estado = paymentIntent.getStatus();
    log.info("📊 Estado actual del pago: {}", estado);
    
    // Si ya está exitoso, devolverlo
    if ("succeeded".equals(estado)) {
        log.info("⚠️ Payment Intent ya estaba exitoso");
        return paymentIntent;
    }
    
    // NO confirmar automáticamente con tarjeta de prueba
    // Deja que el frontend confirme el pago
    log.info("📋 Payment Intent requiere confirmación desde frontend");
    return paymentIntent;
    
}
    
    /**
     * Verificar si un pago fue exitoso
     */
    public boolean verificarPagoExitoso(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        String estado = paymentIntent.getStatus();
        
        log.info("🔍 Verificando pago {} - Estado: {}", paymentIntentId, estado);
        
        return "succeeded".equals(estado);
    }
    
    /**
     * Obtener detalles completos de un pago
     */
    public PaymentIntent obtenerDetallesPago(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }
    
    /**
     * Cancelar un Payment Intent (si el usuario cancela)
     */
    public PaymentIntent cancelarPago(String paymentIntentId) throws StripeException {
        log.info("❌ Cancelando pago: {}", paymentIntentId);
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        return paymentIntent.cancel();
    }
}