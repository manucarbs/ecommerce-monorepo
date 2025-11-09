package com.ecommerce.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class DotenvConfig {

    @PostConstruct
    public void loadEnv() {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .load();
            
            dotenv.entries().forEach(entry -> {
                System.setProperty(entry.getKey(), entry.getValue());
            });
            
            log.info("✅ Variables de entorno cargadas desde .env");
        } catch (Exception e) {
            log.warn("⚠️ No se pudo cargar .env, usando variables del sistema");
        }
    }
}