package com.ecommerce.backend.services;

import java.util.Optional;

import org.springframework.security.oauth2.jwt.Jwt;

import com.ecommerce.backend.entities.Usuario;

public interface UsuarioService {
    Usuario ensureFromJwt(Jwt jwt);
    Optional<Usuario> findByAuth0Sub(String sub);
}
