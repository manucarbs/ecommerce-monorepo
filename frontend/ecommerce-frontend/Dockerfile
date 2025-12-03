# Etapa 1: Node no hace build, solo copiamos dist
FROM nginx:alpine

# Copiar la carpeta dist ya generada
COPY /dist/ecommerce-frontend /usr/share/nginx/html/

# Configuración SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto (Render lo sobrescribe con la variable PORT)
EXPOSE 10000

# Reemplazar puerto dinámico y lanzar Nginx
CMD ["sh", "-c", "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
