package com.ecommerce.backend.services;

import com.ecommerce.backend.entities.Usuario;
import com.ecommerce.backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioServiceImplement implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public Usuario registrarUsuario(Usuario usuario) {
        usuarioRepository.findByEmail(usuario.getEmail())
                .ifPresent(u -> { throw new RuntimeException("El correo ya está registrado"); });

        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        return usuarioRepository.save(usuario);
    }
}