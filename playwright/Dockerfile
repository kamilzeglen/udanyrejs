# Bazowy obraz z Playwright
FROM mcr.microsoft.com/playwright:v1.50.0-noble

# Ustawienie użytkownika, w którym działa aplikacja
USER root

# Dodanie użytkownika i ustawienie ścieżki roboczej
RUN useradd -ms /bin/bash pwuser
WORKDIR /home/pwuser

# Przełączanie na użytkownika pwuser
USER pwuser

# Instalacja zależności (jeśli są wymagane)
# RUN npm install playwright@1.50.0

# Expose port dla serwera Playwright
EXPOSE 6006

# Uruchomienie Playwright
CMD ["npx", "-y", "playwright@1.50.0", "run-server", "--port", "6006", "--host", "0.0.0.0"]
