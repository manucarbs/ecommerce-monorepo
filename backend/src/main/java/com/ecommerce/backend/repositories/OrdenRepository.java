package com.ecommerce.backend.repositories;

import com.ecommerce.backend.entities.Orden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrdenRepository extends JpaRepository<Orden, Long> {
    
    List<Orden> findByCompradorAuth0SubOrderByCreadoEnDesc(String auth0Sub);
    
    Optional<Orden> findByNumeroOrden(String numeroOrden);
    
    @Query("SELECT o FROM Orden o JOIN o.items i WHERE i.vendedorSub = :vendedorSub ORDER BY o.creadoEn DESC")
    List<Orden> findByVendedorSub(@Param("vendedorSub") String vendedorSub);
    
    Optional<Orden> findByIdPagoStripe(String idPagoStripe);
    
    @Query("SELECT COUNT(o) FROM Orden o WHERE o.compradorSub = :auth0Sub AND o.estado = 'PAGADO'")
    long countComprasUsuario(@Param("auth0Sub") String auth0Sub);
}