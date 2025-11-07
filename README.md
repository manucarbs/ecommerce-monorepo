# Ecommerce Monorepo - Entorno Local

Este repositorio contiene la estructura inicial del proyecto **Ecommerce ADS2**.

## Tecnologías Utilizadas

### Backend
- Java 17
- Spring Boot
- Spring Data JPA
- PostgreSQL (local)
- Maven

### Frontend
- Angular
- TypeScript
- HTML
- CSS
- SPA

## Requisitos Previos

- Java Development Kit (JDK) 17 o superior
- Maven
- Docker y Docker Compose
- Node.js y npm

## Levantamiento del Entorno Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/manucarbs/ecommerce-monorepo.git
   cd ecommerce-monorepo

2. Desscargar la carpeta 'environments' compartida previamente mediante 'CryptPad' y copiarla dentro de:
   ```bash
   ecommerce-monorepo/frontend/ecommerce-frontend/src

3. Descargar archivo '.env' y '.env.dev' y ubicarlos en la carpeta raíz.

4. Construir y levantar los servicios locales (backend, frontend y base de datos):
   ```bash
   docker-compose up --build

5. Construir y levantar los servicios locales (backend, frontend) con base de datos remota en Neon.
   ```bash
   docker compose -f docker-compose.prod.yml up --build

3. Acceder a las aplicaciones:

- Frontend (Angular SPA):
   ```bash
   http://localhost:4200

- Backend (API REST):
   ```bash
   http://localhost:8080/api

> **Nota:** Este README está enfocado únicamente en levantar el entorno local.