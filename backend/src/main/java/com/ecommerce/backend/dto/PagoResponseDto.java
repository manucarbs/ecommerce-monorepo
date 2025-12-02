package com.ecommerce.backend.dto;

import lombok.Data;

@Data
public class PagoResponseDto {
    private boolean success;
    private String message;
    private String orderNumber;
    private String paymentIntentId;
    private Double amount;
    private String status;
    
    // Constructor
    public PagoResponseDto(boolean success, String message, String orderNumber, 
                          String paymentIntentId, Double amount, String status) {
        this.success = success;
        this.message = message;
        this.orderNumber = orderNumber;
        this.paymentIntentId = paymentIntentId;
        this.amount = amount;
        this.status = status;
    }
    
    // Métodos estáticos de fábrica
    public static PagoResponseDto success(String message, String orderNumber, 
                                         String paymentIntentId, Double amount) {
        return new PagoResponseDto(true, message, orderNumber, paymentIntentId, amount, "succeeded");
    }
    
    public static PagoResponseDto error(String message) {
        return new PagoResponseDto(false, message, null, null, null, "failed");
    }
}