package com.ecommerce.backend.dto;

import lombok.Data;

@Data
public class ProcesarPagoDto {
    private String ordenNumero;
    private String paymentIntentId;
    private String metodoPago = "card";
}