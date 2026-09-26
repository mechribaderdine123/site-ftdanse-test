# ===== API FTDAP (Express + PostgreSQL) =====
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

ENV NODE_ENV=production
# Railway fournit PORT ; l'app écoute aussi sur ce port (défaut 4000 en local).
EXPOSE 4000

CMD ["npm", "run", "start"]
