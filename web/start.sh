#!/bin/bash

# Załadowanie zmiennych środowiskowych z pliku .env
set -o allexport
source /web/.env
set +o allexport

# Sprawdzenie wartości APP_ENV i uruchomienie odpowiedniej aplikacji
if [ "$APP_ENV" = "local" ]; then
    echo "Uruchamiam aplikację w trybie lokalnym...";
    npm run start;  # Dla lokalnego środowiska uruchamiamy Angulara w trybie deweloperskim
elif [ "$APP_ENV" = "dev" ] || [ "$APP_ENV" = "prod" ]; then
    echo "Buduję aplikację w trybie $APP_ENV...";

    # Upewniamy się, że katalog `dist` jest dostępny, a aplikacja jest zbudowana w etapie `build`
    if [ -d "/web/dist" ]; then
        # Dla dev/prod generujemy kod produkcyjny i uruchamiamy Nginx
        envsubst < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html && \
        nginx -g "daemon off;"
    else
        echo "Brak katalogu dist. Proszę upewnić się, że aplikacja jest zbudowana.";
        exit 1
    fi
else
    echo "Nieznane środowisko, ustawiając domyślny tryb...";
    npm run start;  # Domyślnie uruchamiamy w trybie lokalnym, jeśli APP_ENV nie jest ustawione
fi
