# Etap budowania
FROM node:18-alpine AS builder

# Ustawienie katalogu roboczego
WORKDIR /api

# Kopiowanie plików konfiguracyjnych i zależności
COPY package*.json ./
COPY tsconfig*.json ./

# Instalacja zależności
RUN npm install --legacy-peer-deps

# Kopiowanie całej aplikacji
COPY . .

# Kompilacja aplikacji NestJS
RUN npm run build

# --- Etap uruchomienia ---
FROM node:18-alpine AS runner

# Ustawienie katalogu roboczego
WORKDIR /api

# Instalacja tylko produkcyjnych zależności
COPY package*.json ./
RUN npm install --production --legacy-peer-deps

# Kopiowanie zbudowanej aplikacji z poprzedniego etapu
COPY --from=builder /api/dist ./dist

# Kopiowanie pliku .env
COPY .env ./

# Port, na którym działa aplikacja
EXPOSE 5006

# Uruchamianie aplikacji
CMD ["sh", "-c", "node dist/main"]
