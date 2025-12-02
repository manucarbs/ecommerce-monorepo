package com.ecommerce.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CheckoutRequestDto {
    
    // Datos de envío
    @NotBlank(message = "La dirección de envío es obligatoria")
    private String direccionEnvio;
    
    @NotBlank(message = "La ciudad es obligatoria")
    private String ciudad;
    
    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Teléfono inválido")
    private String telefono;
    
    private String referencia;
    
    // Datos de pago (para Stripe)
    private String paymentMethodId; // ID del método de pago de Stripe Elements
    
    // Opcional: token para pruebas
    private String token; // Para pruebas, puedes usar token de prueba de Stripe
}