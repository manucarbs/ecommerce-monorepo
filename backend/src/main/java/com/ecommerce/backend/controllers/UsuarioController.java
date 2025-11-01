package com.ecommerce.backend.controllers;

import com.ecommerce.backend.entities.Usuario;
import com.ecommerce.backend.services.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*") // Permite acceso desde el frontend
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<?> registrarUsuario(@Valid @RequestBody Usuario usuario) {
        Usuario nuevo = usuarioService.registrarUsuario(usuario);
        return ResponseEntity.ok(nuevo);
    }
}