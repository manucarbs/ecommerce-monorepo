package com.ecommerce.backend.exceptions;

import com.ecommerce.backend.dto.MensajeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Manejo de recurso no encontrado (404)
     */
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<MensajeResponse> handleRecursoNoEncontrado(RecursoNoEncontradoException ex) {
        log.error("❌ Recurso no encontrado: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new MensajeResponse(ex.getMessage()));
    }

    /**
     * Manejo de duplicados (409)
     */
    @ExceptionHandler(DuplicadoException.class)
    public ResponseEntity<MensajeResponse> handleDuplicado(DuplicadoException ex) {
        log.error("❌ Duplicado: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new MensajeResponse(ex.getMessage()));
    }

    /**
     * Manejo de stock insuficiente (400)
     */
    @ExceptionHandler(StockInsuficienteException.class)
    public ResponseEntity<MensajeResponse> handleStockInsuficiente(StockInsuficienteException ex) {
        log.error("❌ Stock insuficiente: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new MensajeResponse(ex.getMessage()));
    }

    /**
     * Manejo de argumentos no válidos (400)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MensajeResponse> handleIllegalArgument(IllegalArgumentException ex) {
        log.error("❌ Argumento inválido: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new MensajeResponse(ex.getMessage()));
    }

    /**
     * Manejo de errores de validación (400)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String campo = ((FieldError) error).getField();
            String mensaje = error.getDefaultMessage();
            errores.put(campo, mensaje);
        });

        log.error("❌ Error de validación: {}", errores);
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errores);
    }

    /**
     * Manejo de errores generales (500)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<MensajeResponse> handleGeneral(Exception ex) {
        log.error("❌ Error inesperado: ", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MensajeResponse("Error interno del servidor"));
    }
}