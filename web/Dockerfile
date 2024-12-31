# Etap budowania aplikacji
FROM node:18 as build

# Ustawienie katalogu roboczego
WORKDIR /web

# Kopiowanie pliku package.json i package-lock.json
COPY package*.json ./

# Instalowanie zależności
RUN npm install

# Kopiowanie reszty plików aplikacji
COPY . .

# Budowanie aplikacji Angular
RUN npm run build --prod

# Etap uruchamiania aplikacji
FROM nginx:alpine

# Ustawienie katalogu roboczego
WORKDIR /web

# Usuwamy domyślną stronę Nginx
RUN rm -rf /usr/share/nginx/html/*

# Kopiowanie zbudowanej aplikacji z etapu build
COPY --from=build /app/dist/web/browser /usr/share/nginx/html

# Port, na którym działa aplikacja
EXPOSE 80

# Uruchomienie Nginx
CMD ["nginx", "-g", "daemon off;"]
