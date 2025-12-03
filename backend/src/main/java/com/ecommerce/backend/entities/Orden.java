package com.ecommerce.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "ordenes")
public class Orden {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_orden")
    private Long id;
    
    @Column(name = "numero_orden", unique = true, nullable = false, length = 20)
    private String numeroOrden;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario_comprador", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "ordenesComoComprador"}) // ← Agrega esto
    private Usuario comprador;
    
    @Column(name = "comprador_sub", nullable = false, length = 128)
    private String compradorSub;
    
    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // ← AGREGAR ESTO - IMPORTANTE
    private List<OrdenItem> items = new ArrayList<>();
    
    // Datos de envío
    @Column(name = "direccion_envio", nullable = false, length = 500)
    private String direccionEnvio;
    
    @Column(name = "ciudad", nullable = false, length = 100)
    private String ciudad;
    
    @Column(name = "telefono", nullable = false, length = 20)
    private String telefono;
    
    @Column(name = "referencia", length = 200)
    private String referencia;
    
    // Datos de pago
    @Column(name = "total", nullable = false)
    private Double total;
    
    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "PENDIENTE";
    
    @Column(name = "id_pago_stripe", length = 100)
    private String idPagoStripe;
    
    @Column(name = "metodo_pago", length = 50)
    private String metodoPago;
    
    // Timestamps
    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn = Instant.now();
    
    @Column(name = "pagado_en")
    private Instant pagadoEn;
    
    @PrePersist
    public void prePersist() {
        if (creadoEn == null) {
            creadoEn = Instant.now();
        }
        if (numeroOrden == null) {
            String fecha = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            this.numeroOrden = "ORD-" + fecha + "-" + random;
        }
        if ((compradorSub == null || compradorSub.isBlank()) && comprador != null && comprador.getAuth0Sub() != null) {
            this.compradorSub = comprador.getAuth0Sub();
        }
    }
}