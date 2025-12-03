# Etapa 1: build con Node
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration production

# Etapa 2: servir con Nginx
FROM nginx:alpine

# Copiar la carpeta build
COPY --from=build /app/dist/ecommerce-frontend /usr/share/nginx/html/

# Configuración SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer cualquier puerto (Render lo sobrescribe con la variable PORT)
EXPOSE 10000

# Reemplazar el puerto dinámicamente y lanzar Nginx
CMD ["sh", "-c", "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
