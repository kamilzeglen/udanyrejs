# Używamy obrazu Node.js do budowania i uruchamiania aplikacji NestJS
FROM node:18

# Ustawiamy katalog roboczy
WORKDIR /app

# Kopiujemy pliki projektu i instalujemy zależności
COPY package*.json ./
RUN npm install

# Kopiujemy resztę kodu i budujemy aplikację
COPY . .
RUN npm run build

# Migrujemy dane
CMD ["npm", "run", "migration:run"]

# Ustawiamy zmienne środowiskowe dla NestJS
EXPOSE 5006
CMD ["npm", "run", "start:prod"]
