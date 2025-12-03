package com.ecommerce.backend.repositories;

import com.ecommerce.backend.entities.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Long> {

    /**
     * Encuentra todos los favoritos de un usuario
     */
    @Query("SELECT f FROM Favorito f JOIN FETCH f.producto WHERE f.usuario.id = :usuarioId ORDER BY f.agregadoEn DESC")
    List<Favorito> findByUsuarioIdOrderByAgregadoEnDesc(@Param("usuarioId") Long usuarioId);

    /**
     * Encuentra todos los favoritos de un usuario por auth0Sub
     */
    @Query("SELECT f FROM Favorito f JOIN FETCH f.producto WHERE f.usuario.auth0Sub = :auth0Sub ORDER BY f.agregadoEn DESC")
    List<Favorito> findByUsuarioAuth0SubOrderByAgregadoEnDesc(@Param("auth0Sub") String auth0Sub);

    /**
     * Verifica si un producto está en favoritos de un usuario
     */
    boolean existsByUsuario_IdAndProducto_Id(Long usuarioId, Long productoId);

    /**
     * Verifica si un producto está en favoritos (por auth0Sub)
     */
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Favorito f WHERE f.usuario.auth0Sub = :auth0Sub AND f.producto.id = :productoId")
    boolean existsByAuth0SubAndProductoId(@Param("auth0Sub") String auth0Sub, @Param("productoId") Long productoId);

    /**
     * Encuentra un favorito específico
     */
    Optional<Favorito> findByUsuario_IdAndProducto_Id(Long usuarioId, Long productoId);

    /**
     * Encuentra un favorito específico (por auth0Sub)
     */
    @Query("SELECT f FROM Favorito f WHERE f.usuario.auth0Sub = :auth0Sub AND f.producto.id = :productoId")
    Optional<Favorito> findByAuth0SubAndProductoId(@Param("auth0Sub") String auth0Sub, @Param("productoId") Long productoId);

    /**
     * Cuenta cuántos favoritos tiene un producto
     */
    long countByProducto_Id(Long productoId);

    /**
     * Cuenta cuántos favoritos tiene un usuario
     */
    long countByUsuario_Id(Long usuarioId);

    /**
     * Elimina todos los favoritos de un usuario
     */
    void deleteByUsuario_Id(Long usuarioId);

    /**
     * Elimina todos los favoritos de un producto
     */
    void deleteByProducto_Id(Long productoId);
}
