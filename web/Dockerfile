# Etap budowania
FROM node:18-alpine AS builder

# Ustawienie katalogu roboczego
WORKDIR /web

# Kopiowanie pliku package.json i package-lock.json
COPY package*.json ./

# Instalowanie zależności
RUN npm install

# Kopiowanie reszty plików aplikacji
COPY . .

# Budowanie aplikacji Angular
RUN npm run build --omit=dev

# Etap uruchamiania aplikacji
FROM nginx:alpine

# Instalacja Nginx
RUN apk add --no-cache bash curl

# Skopiowanie pliku konfiguracyjnego Nginx
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Kopiowanie zbudowanej aplikacji z etapu build do katalogu Nginx
COPY --from=builder /web/dist/web/browser /usr/share/nginx/html

# Port, na którym działa aplikacja
EXPOSE 80

# Healthcheck sprawdza, czy nginx faktycznie serwuje aplikację
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Uruchomienie Nginx
CMD ["nginx", "-g", "daemon off;"]
