package com.ecommerce.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// ============ REQUEST DTO ============

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgregarFavoritoDto {
    @NotNull(message = "El ID del producto es obligatorio")
    private Long productoId;
}