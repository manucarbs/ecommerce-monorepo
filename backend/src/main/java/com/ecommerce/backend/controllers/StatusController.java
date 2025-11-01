package com.ecommerce.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class StatusController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/api/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> response = new HashMap<>();

        try {
            // Ejecuta una consulta simple para confirmar conexión
            jdbcTemplate.execute("SELECT 1");

            response.put("status", "✅ Backend activo");
            response.put("database", "🟢 Conectado a PostgreSQL (Neon)");
        } catch (Exception e) {
            response.put("status", "⚠️ Backend activo, pero sin conexión a la base de datos");
            response.put("error", e.getMessage());
        }

        return response;
    }
}