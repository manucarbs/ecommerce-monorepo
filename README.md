# Ecommerce Monorepo

Este repositorio contiene la estructura inicial del proyecto **Ecommerce ADS2**.

## Instrucciones para el equipo

1. Descargar el archivo `.txt` desde **Plane**.
2. Crear un archivo `.env` con "nano .env".
2. Pegar en el `.env` las credenciales para conectarse a la base de datos Neon.
3. No subir el archivo `.env` al repositorio, está incluido en `.gitignore`.

---
# Ecommerce Monorepo

Este repositorio contiene la estructura inicial del proyecto **Ecommerce ADS2**.

## Instrucciones para el equipo

1. Descargar el archivo `.txt` desde **Plane**.
2. Crear un archivo `.env` con "nano .env".
2. Pegar en el `.env` las credenciales para conectarse a la base de datos Neon.
3. No subir el archivo `.env` al repositorio, está incluido en `.gitignore`.

---

## Tecnologías Utilizadas

### Backend
- Java 17
- Spring Boot
- Spring Data JPA
- PostgreSQL (Neon)
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
- Node.js y npm [versiones pendientes de especificar]

## Configuración del Entorno

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/manucarbs/ecommerce-monorepo.git
   cd ecommerce-monorepo
   ```

2. Configurar variables de entorno:
   - Descargar el archivo de credenciales desde **Plane**
   - Crear un archivo `.env` en la raíz del proyecto
   - Copiar las credenciales de la base de datos Neon al archivo `.env`

   Ejemplo de estructura del archivo `.env`:
   ```env
   SPRING_DATASOURCE_URL=jdbc:postgresql://...
   SPRING_DATASOURCE_USERNAME=your_username
   SPRING_DATASOURCE_PASSWORD=your_password
   ```

   > **IMPORTANTE**: El archivo `.env` está incluido en `.gitignore`. No lo suba al repositorio.

## Ejecución del Proyecto

### Usando Docker Compose

1. Construir y levantar todos los servicios:
   ```bash
   docker-compose up --build
   ```

### Ejecución Local (Desarrollo)

## API Backend

El backend proporciona los siguientes endpoints principales:

### Productos
- `GET /api/productos`: Obtener todos los productos
- `GET /api/productos/{id}`: Obtener un producto por ID
- `POST /api/productos`: Crear un nuevo producto
- `PUT /api/productos/{id}`: Actualizar un producto existente
- `DELETE /api/productos/{id}`: Eliminar un producto

## Base de Datos

El proyecto utiliza PostgreSQL alojado en Neon. La estructura de la base de datos se gestiona automáticamente mediante JPA con la configuración `spring.jpa.hibernate.ddl-auto=update`.

---

> Nota: Este README se actualizará conforme se integren backend, frontend y otros servicios.
## Tecnologías Utilizadas

### Backend
- Java 17
- Spring Boot
- Spring Data JPA
- PostgreSQL (Neon)
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
- Node.js y npm [versiones pendientes de especificar]

## Configuración del Entorno

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/manucarbs/ecommerce-monorepo.git
   cd ecommerce-monorepo
   ```

2. Configurar variables de entorno:
   - Descargar el archivo de credenciales desde **Plane**
   - Crear un archivo `.env` en la raíz del proyecto
   - Copiar las credenciales de la base de datos Neon al archivo `.env`

   Ejemplo de estructura del archivo `.env`:
   ```env
   SPRING_DATASOURCE_URL=jdbc:postgresql://...
   SPRING_DATASOURCE_USERNAME=your_username
   SPRING_DATASOURCE_PASSWORD=your_password
   ```

   > **IMPORTANTE**: El archivo `.env` está incluido en `.gitignore`. No lo suba al repositorio.

## Ejecución del Proyecto

### Usando Docker Compose

1. Construir y levantar todos los servicios:
   ```bash
   docker-compose up --build
   ```

### Ejecución Local (Desarrollo)

## API Backend

El backend proporciona los siguientes endpoints principales:

### Productos
- `GET /api/productos`: Obtener todos los productos
- `GET /api/productos/{id}`: Obtener un producto por ID
- `POST /api/productos`: Crear un nuevo producto
- `PUT /api/productos/{id}`: Actualizar un producto existente
- `DELETE /api/productos/{id}`: Eliminar un producto

## Base de Datos

El proyecto utiliza PostgreSQL alojado en Neon. La estructura de la base de datos se gestiona automáticamente mediante JPA con la configuración `spring.jpa.hibernate.ddl-auto=update`.

---

> Nota: Este README se actualizará conforme se integren backend, frontend y otros servicios.