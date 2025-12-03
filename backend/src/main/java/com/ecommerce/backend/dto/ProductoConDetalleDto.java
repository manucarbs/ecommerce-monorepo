package com.ecommerce.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoConDetalleDto {
    
    private Long id;
    private String titulo;
    private String categoria;
    private String estado;
    private String descripcion;
    private Double precio;
    private Integer stock;
    private List<String> imagenesUrl;
    private String imagenPrincipal;
    private String whatsappContacto;
    
    // Info del owner
    private Long ownerId;
    private String ownerSub;
    private OwnerInfo owner;  // 🔥 ESTO ES LO IMPORTANTE
    
    // Fechas
    private Instant creadoEn;
    private Instant actualizadoEn;
    
    // DTO interno para la información del vendedor
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerInfo {
        private Long id;
        private String nombre;
        private String apellido;
        private String email;
        private String pictureUrl;
    }
}