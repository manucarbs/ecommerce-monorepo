package com.ecommerce.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoCreateDto {

    @NotBlank
    @Size(max = 120)
    private String titulo;

    @NotBlank
    @Size(max = 80)
    private String categoria;

    @NotBlank
    @Size(max = 20) // "nuevo" | "usado"
    private String estado;

    @Size(max = 2000)
    private String descripcion;

    @NotNull
    @PositiveOrZero
    private Double precio;

    @PositiveOrZero
    private Integer stock = 1;

    @Size(max = 2048)
    private String imagenUrl;
}
