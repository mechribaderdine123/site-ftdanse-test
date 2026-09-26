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
COPY --from=builder /app/dist /usr/share/nginx/html
# Template résolu au démarrage du conteneur via la variable API_HOST
# (docker-compose : "api" ; Railway : <service>.railway.internal).
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
ENV API_HOST=api
