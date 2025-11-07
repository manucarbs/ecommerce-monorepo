// src/main/java/com/ecommerce/backend/repositories/UsuarioRepository.java
package com.ecommerce.backend.repositories;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ecommerce.backend.entities.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByAuth0Sub(String auth0Sub);
    boolean existsByAuth0Sub(String auth0Sub);
}
