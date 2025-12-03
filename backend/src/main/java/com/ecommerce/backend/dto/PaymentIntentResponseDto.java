package com.ecommerce.backend.dto;

import lombok.Data;

@Data
public class PaymentIntentResponseDto {
    private String clientSecret;
    private String orderNumber;
    private Double amount;
    private String currency = "usd";
    
    public PaymentIntentResponseDto(String clientSecret, String orderNumber, Double amount) {
        this.clientSecret = clientSecret;
        this.orderNumber = orderNumber;
        this.amount = amount;
    }
}