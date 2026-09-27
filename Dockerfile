FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
# URL publique de l'API quand elle est déployée séparément (laisser vide si
# le frontend et l'API partagent le même domaine via le proxy nginx).
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
# Railway route les domaines publics vers le port exposé par le conteneur
# (défini ici à 8080 pour correspondre au port cible du domaine Railway).
EXPOSE 8080
# Template résolu au démarrage du conteneur via la variable API_HOST
# (docker-compose : "api" ; Railway : <service>.railway.internal).
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
RUN sed -i 's/listen 80;/listen 8080;/' /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html
ENV API_HOST=api
