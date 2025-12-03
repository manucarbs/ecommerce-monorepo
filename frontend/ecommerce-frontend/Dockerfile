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

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
