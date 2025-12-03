package com.ecommerce.backend.dto;

import lombok.Data;

@Data
public class VerificarPagoDto {
    private String paymentIntentId;
    private String ordenNumero; // Opcional
}