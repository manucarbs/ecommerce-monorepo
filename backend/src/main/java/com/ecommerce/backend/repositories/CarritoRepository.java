package com.ecommerce.backend.repositories;

import com.ecommerce.backend.entities.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Long> {

    /**
     * Encuentra todos los carritos de un usuario
     */
    @Query("SELECT c FROM Carrito c JOIN FETCH c.producto WHERE c.usuario.id = :usuarioId ORDER BY c.agregadoEn DESC")
    List<Carrito> findByUsuarioIdOrderByAgregadoEnDesc(@Param("usuarioId") Long usuarioId);

    /**
     * Encuentra todos los carritos de un usuario por auth0Sub
     */
    @Query("SELECT c FROM Carrito c JOIN FETCH c.producto WHERE c.usuario.auth0Sub = :auth0Sub ORDER BY c.agregadoEn DESC")
    List<Carrito> findByUsuarioAuth0SubOrderByAgregadoEnDesc(@Param("auth0Sub") String auth0Sub);

    /**
     * Verifica si un producto está en carritos de un usuario
     */
    boolean existsByUsuario_IdAndProducto_Id(Long usuarioId, Long productoId);

    /**
     * Verifica si un producto está en carritos (por auth0Sub)
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Carrito c WHERE c.usuario.auth0Sub = :auth0Sub AND c.producto.id = :productoId")
    boolean existsByAuth0SubAndProductoId(@Param("auth0Sub") String auth0Sub, @Param("productoId") Long productoId);

    /**
     * Encuentra un carrito específico
     */
    Optional<Carrito> findByUsuario_IdAndProducto_Id(Long usuarioId, Long productoId);

    /**
     * Encuentra un carrito específico (por auth0Sub)
     */
    @Query("SELECT c FROM Carrito c WHERE c.usuario.auth0Sub = :auth0Sub AND c.producto.id = :productoId")
    Optional<Carrito> findByAuth0SubAndProductoId(@Param("auth0Sub") String auth0Sub, @Param("productoId") Long productoId);

    /**
     * Cuenta cuántos carritos tiene un usuario
     */
    long countByUsuario_Id(Long usuarioId);

    /**
     * Cuenta cuántos carritos tiene un usuario (por auth0Sub)
     */
    @Query("SELECT COUNT(c) FROM Carrito c WHERE c.usuario.auth0Sub = :auth0Sub")
    long countByAuth0Sub(@Param("auth0Sub") String auth0Sub);

    /**
     * Elimina todos los carritos de un usuario
     */
    void deleteByUsuario_Id(Long usuarioId);

    /**
     * Elimina todos los carritos de un usuario (por auth0Sub)
     */
    @Modifying
    @Query("DELETE FROM Carrito c WHERE c.usuario.auth0Sub = :auth0Sub")
    void deleteByAuth0Sub(@Param("auth0Sub") String auth0Sub);

    /**
     * Elimina un carrito específico (por auth0Sub y productoId)
     */
    @Modifying
    @Query("DELETE FROM Carrito c WHERE c.usuario.auth0Sub = :auth0Sub AND c.producto.id = :productoId")
    void deleteByAuth0SubAndProductoId(@Param("auth0Sub") String auth0Sub, @Param("productoId") Long productoId);

    /**
     * Actualiza la cantidad de un carrito
     */
    @Modifying
    @Query("UPDATE Carrito c SET c.cantidad = :cantidad, c.actualizadoEn = CURRENT_TIMESTAMP WHERE c.usuario.auth0Sub = :auth0Sub AND c.producto.id = :productoId")
    void actualizarCantidad(@Param("auth0Sub") String auth0Sub, @Param("productoId") Long productoId, @Param("cantidad") Integer cantidad);

    /**
     * Calcula el total del carrito de un usuario
     */
    @Query("SELECT COALESCE(SUM(c.producto.precio * c.cantidad), 0) FROM Carrito c WHERE c.usuario.auth0Sub = :auth0Sub")
    Double calcularTotal(@Param("auth0Sub") String auth0Sub);
}