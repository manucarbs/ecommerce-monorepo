# Etapa 1: Compilar con Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios
COPY pom.xml .
COPY src ./src

# Compilar el proyecto y generar el .jar (sin ejecutar tests)
RUN mvn clean package -DskipTests

# Etapa 2: Ejecutar con una imagen mas liviana solo con Java
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Copiar el jar generado desde la etapa de compilación
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto 8080
EXPOSE 8080

# Comando para ejecutar la app
ENTRYPOINT ["java", "-jar", "app.jar"]