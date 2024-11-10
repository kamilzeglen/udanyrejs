# Używamy obrazu Node.js do budowania aplikacji Angular
FROM node:18 as build

# Ustawiamy katalog roboczy
WORKDIR /app

# Kopiujemy pliki projektu i instalujemy zależności
COPY package*.json ./
RUN npm install

# Kopiujemy resztę kodu i budujemy aplikację
COPY . .
RUN npm run build --prod

# Używamy serwera NGINX do serwowania aplikacji Angular
FROM nginx:alpine
COPY --from=build /app/dist/web/browser /usr/share/nginx/html

# Konfiguracja NGINX dla Angulara
EXPOSE 3006
CMD ["nginx", "-g", "daemon off;", "-p", "3006"]
