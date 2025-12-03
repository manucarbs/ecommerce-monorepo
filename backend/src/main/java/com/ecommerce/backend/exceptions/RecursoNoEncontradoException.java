package com.ecommerce.backend.exceptions;

// ============ RECURSO NO ENCONTRADO ============

public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}