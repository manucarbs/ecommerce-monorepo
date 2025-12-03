# Etapa 1: build con Node
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: servir con Nginx
FROM nginx:alpine

# Copiar SOLO la carpeta browser al root de Nginx
COPY --from=build /app/dist/ecommerce-frontend/browser/ /usr/share/nginx/html/

# Configuración SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto (Render lo sobrescribe con la variable PORT)
EXPOSE 10000

# Reemplazar el puerto dinámico y lanzar Nginx
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
