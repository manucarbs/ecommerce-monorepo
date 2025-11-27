package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MensajeResponse {
    private String mensaje;
    private Object data;

    public MensajeResponse(String mensaje) {
        this.mensaje = mensaje;
    }
}